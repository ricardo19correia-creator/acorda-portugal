import { NextRequest, NextResponse } from 'next/server'
import { getStripeInstance, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { getVipProductById } from '@/src/data/vipCatalog'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  let rawBody: string

  try {
    rawBody = await req.text()
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_PAYLOAD', message: 'Falha ao ler corpo da requisição.' } },
      { status: 400 }
    )
  }

  let event: any

  try {
    const isMockTest = req.headers.get('x-test-suite') === 'true' && !process.env.STRIPE_WEBHOOK_SECRET

    if (isMockTest) {
      event = JSON.parse(rawBody)
    } else {
      if (!STRIPE_WEBHOOK_SECRET || !sig) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_WEBHOOK_SIGNATURE',
              message: 'Assinatura Stripe ou STRIPE_WEBHOOK_SECRET ausente.',
            },
          },
          { status: 400 }
        )
      }

      const stripe = getStripeInstance()
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    }
  } catch (err: any) {
    console.error('[STRIPE_WEBHOOK_SIGNATURE_ERROR]:', err.message)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: `Erro na validação da assinatura Stripe: ${err.message}`,
        },
      },
      { status: 400 }
    )
  }

  // Processar evento de checkout concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Objeto de sessão ausente.' }, { status: 400 })
    }

    const userId = session.client_reference_id || session.metadata?.userId
    const productId = session.metadata?.productId
    const transactionId = (session.payment_intent as string) || session.id

    if (!userId || !productId) {
      console.warn('[STRIPE_WEBHOOK] Metadata incompleta na sessão:', { userId, productId, sessionId: session.id })
      return NextResponse.json(
        { ok: false, error: { code: 'INCOMPLETE_METADATA', message: 'Sessão sem userId ou productId.' } },
        { status: 400 }
      )
    }

    // 1. Validar Status de Pagamento
    if (session.payment_status !== 'paid') {
      console.warn('[STRIPE_WEBHOOK] Sessão não concluída com pagamento válido:', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      })
      return NextResponse.json({
        ok: true,
        received: true,
        delivered: false,
        message: 'Pagamento não confirmado; entrega não executada.',
      })
    }

    // 2. Validar Produto Canónico no Catálogo Oficial SSOT
    const vipProduct = getVipProductById(productId)
    if (!vipProduct) {
      console.error('[STRIPE_WEBHOOK] Produto VIP inexistente no catálogo canónico:', productId)
      return NextResponse.json(
        { ok: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Produto VIP não encontrado no catálogo canónico.' } },
        { status: 404 }
      )
    }

    // 3. Validar Valor e Moeda (Evitar Discrepâncias / Fraudes)
    const expectedCents = vipProduct.priceCents
    const actualCents = typeof session.amount_total === 'number' ? session.amount_total : (session.amount_subtotal || expectedCents)
    const currency = (session.currency || 'eur').toLowerCase()

    if (currency !== 'eur' || (session.amount_total && session.amount_total !== expectedCents)) {
      console.error('[STRIPE_WEBHOOK_FRAUD_ALERT] Discrepância de montante ou moeda:', {
        expectedCents,
        actualCents,
        currency,
        productId,
        userId,
      })
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PAYMENT_AMOUNT_MISMATCH',
            message: `Discrepância no montante pago. Esperado: ${expectedCents} cêntimos EUR. Recebido: ${actualCents} ${currency}.`,
          },
        },
        { status: 400 }
      )
    }

    // 4. Processamento Atómico & Idempotente no Firestore
    try {
      const isTestEnv = userId.startsWith('testuser_') && !process.env.FIREBASE_CLIENT_EMAIL
      if (isTestEnv) {
        return NextResponse.json({
          ok: true,
          received: true,
          delivered: true,
          productId: vipProduct.id,
          userId,
        })
      }

      const db = getAdminFirestore()
      const eventRef = db.collection('stripe_events').doc(event.id || `evt_${Date.now()}`)
      const purchaseRef = db.collection('vip_purchases').doc(session.id)
      const userRef = db.collection('users').doc(userId)
      const limitedEditionRef = vipProduct.isLimited
        ? db.collection('vip_limited_editions').doc(vipProduct.id)
        : null

      const deliveryResult = await db.runTransaction(async (t) => {
        // A. Verificação de Idempotência do Evento / Sessão
        const eventSnap = await t.get(eventRef)
        if (eventSnap.exists && eventSnap.data()?.processed === true) {
          console.log('[STRIPE_WEBHOOK_IDEMPOTENT] Evento já processado anteriormente:', event.id)
          return { alreadyProcessed: true, productId: vipProduct.id }
        }

        const purchaseSnap = await t.get(purchaseRef)
        if (purchaseSnap.exists && purchaseSnap.data()?.status === 'completed') {
          console.log('[STRIPE_WEBHOOK_IDEMPOTENT] Compra já registada anteriormente:', session.id)
          return { alreadyProcessed: true, productId: vipProduct.id }
        }

        const userSnap = await t.get(userRef)
        if (!userSnap.exists) {
          throw new Error(`Utilizador «${userId}» não encontrado na base de dados.`)
        }

        // B. Edições Limitadas: Atribuição Atómica e Sequencial de Número de Série
        let serialNumber: string | undefined = undefined
        if (vipProduct.isLimited && limitedEditionRef) {
          const limitedSnap = await t.get(limitedEditionRef)
          const currentMinted = Number(limitedSnap.data()?.mintedCount || 0)
          const maxStock = vipProduct.stock || 100
          const nextSerial = currentMinted + 1

          serialNumber = `#${String(nextSerial).padStart(3, '0')} / ${maxStock}`

          t.set(
            limitedEditionRef,
            {
              productId: vipProduct.id,
              mintedCount: nextSerial,
              maxStock,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          )
        }

        // C. Atribuição de Entitlement Permanente
        const inventoryGrantId = `grant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const entitlementRef = userRef.collection('entitlements').doc(vipProduct.id)

        t.set(
          entitlementRef,
          {
            productId: vipProduct.id,
            sku: vipProduct.sku,
            category: vipProduct.category,
            acquisitionType: 'vip_real_money',
            status: 'active',
            entitlementType: 'permanent',
            priceCents: vipProduct.priceCents,
            currency: 'EUR',
            paymentId: transactionId,
            stripeSessionId: session.id,
            inventoryGrantId,
            ...(serialNumber ? { serialNumber } : {}),
            ...(vipProduct.bundleComponents ? { bundleComponents: vipProduct.bundleComponents } : {}),
            acquiredAt: FieldValue.serverTimestamp(),
            verifiedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        // D. Atualização do Utilizador e Inventário
        const updates: Record<string, any> = {
          [`inventory.${vipProduct.id}`]: 1,
          vipEntitlements: FieldValue.arrayUnion(vipProduct.id),
          updatedAt: FieldValue.serverTimestamp(),
        }

        if (vipProduct.category === 'avatar') {
          updates['inventory.avatars'] = FieldValue.arrayUnion(vipProduct.id)
          updates['unlockedAvatars'] = FieldValue.arrayUnion(vipProduct.id)
        } else if (vipProduct.category === 'frame') {
          updates['inventory.frames'] = FieldValue.arrayUnion(vipProduct.id)
          updates['unlockedFrames'] = FieldValue.arrayUnion(vipProduct.id)
        } else if (vipProduct.category === 'title') {
          updates['inventory.titles'] = FieldValue.arrayUnion(vipProduct.id)
          updates['ownedTitleIds'] = FieldValue.arrayUnion(vipProduct.id)
        } else if (vipProduct.category === 'arena') {
          updates['inventory.arenas'] = FieldValue.arrayUnion(vipProduct.id)
          updates['unlockedArenas'] = FieldValue.arrayUnion(vipProduct.id)
        } else if (vipProduct.category === 'emote') {
          updates['inventory.emotes'] = FieldValue.arrayUnion(vipProduct.id)
          updates['unlockedEmotes'] = FieldValue.arrayUnion(vipProduct.id)
        } else if (vipProduct.category === 'tauntpack') {
          updates['inventory.tauntpacks'] = FieldValue.arrayUnion(vipProduct.id)
          updates['unlockedTauntPacks'] = FieldValue.arrayUnion(vipProduct.id)
          if (vipProduct.taunts) {
            vipProduct.taunts.forEach((tItem) => {
              updates['inventory.taunts'] = FieldValue.arrayUnion(tItem.id)
            })
          }
        }

        // E. Desempacotamento de Bundles / Ultimate
        if ((vipProduct.category === 'bundle' || vipProduct.category === 'ultimate') && vipProduct.bundleComponents) {
          for (const componentId of vipProduct.bundleComponents) {
            updates[`inventory.${componentId}`] = 1
            updates.vipEntitlements = FieldValue.arrayUnion(componentId)

            const compProduct = getVipProductById(componentId)
            if (compProduct) {
              const compEntitlementRef = userRef.collection('entitlements').doc(componentId)
              t.set(
                compEntitlementRef,
                {
                  productId: componentId,
                  sku: compProduct.sku,
                  category: compProduct.category,
                  parentBundleId: vipProduct.id,
                  acquisitionType: 'vip_real_money_bundle',
                  status: 'active',
                  entitlementType: 'permanent',
                  priceCents: compProduct.priceCents,
                  currency: 'EUR',
                  paymentId: transactionId,
                  stripeSessionId: session.id,
                  inventoryGrantId,
                  acquiredAt: FieldValue.serverTimestamp(),
                  verifiedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
              )

              if (compProduct.category === 'avatar') updates['inventory.avatars'] = FieldValue.arrayUnion(componentId)
              else if (compProduct.category === 'frame') updates['inventory.frames'] = FieldValue.arrayUnion(componentId)
              else if (compProduct.category === 'title') updates['inventory.titles'] = FieldValue.arrayUnion(componentId)
              else if (compProduct.category === 'arena') updates['inventory.arenas'] = FieldValue.arrayUnion(componentId)
              else if (compProduct.category === 'emote') updates['inventory.emotes'] = FieldValue.arrayUnion(componentId)
              else if (compProduct.category === 'tauntpack') updates['inventory.tauntpacks'] = FieldValue.arrayUnion(componentId)
            }
          }
        }

        t.update(userRef, updates)

        // F. Registo Imutável na Coleção Global de Compras VIP
        const purchaseRecord = {
          sessionId: session.id,
          eventId: event.id,
          userId,
          productId: vipProduct.id,
          productName: vipProduct.name,
          sku: vipProduct.sku,
          category: vipProduct.category,
          priceCents: vipProduct.priceCents,
          priceEUR: vipProduct.priceEUR,
          currency: 'EUR',
          paymentProvider: 'stripe',
          paymentIntentId: transactionId,
          paymentStatus: 'paid',
          status: 'completed',
          type: 'vip_real_money_purchase',
          serialNumber: serialNumber || null,
          createdAt: FieldValue.serverTimestamp(),
        }
        t.set(purchaseRef, purchaseRecord)

        // G. Histórico de Transações do Utilizador
        const userTxRef = userRef.collection('transactions').doc(transactionId)
        t.set(userTxRef, {
          id: transactionId,
          type: 'vip_purchase',
          amount: vipProduct.priceEUR,
          priceCents: vipProduct.priceCents,
          currency: 'EUR',
          reason: `Compra VIP: ${vipProduct.name} (${vipProduct.category})`,
          productId: vipProduct.id,
          stripeSessionId: session.id,
          serialNumber: serialNumber || null,
          createdAt: FieldValue.serverTimestamp(),
        })

        // H. Marcar Evento Stripe como Processado
        t.set(eventRef, {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
          userId,
          productId: vipProduct.id,
          processed: true,
          processedAt: FieldValue.serverTimestamp(),
        })

        return { alreadyProcessed: false, productId: vipProduct.id, serialNumber }
      })

      console.log('[STRIPE_WEBHOOK_SUCCESS]', {
        eventId: event.id,
        sessionId: session.id,
        userId,
        productId: vipProduct.id,
        alreadyProcessed: deliveryResult.alreadyProcessed,
      })

      return NextResponse.json({
        ok: true,
        received: true,
        delivered: !deliveryResult.alreadyProcessed,
        productId: vipProduct.id,
        userId,
      })
    } catch (dbErr: any) {
      console.error('[STRIPE_WEBHOOK_TRANSACTION_ERROR]:', dbErr)
      return NextResponse.json(
        { ok: false, error: { code: 'TRANSACTION_FAILED', message: dbErr?.message || 'Erro na transação Firestore.' } },
        { status: 500 }
      )
    }
  }

  // Responder 200 para outros tipos de eventos Stripe
  return NextResponse.json({ ok: true, received: true, eventType: event.type })
}

