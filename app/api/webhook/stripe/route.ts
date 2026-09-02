import { NextResponse } from 'next/server'
import { getStripeInstance, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { getRealProductById } from '@/lib/real-products'
import { getVipProductById } from '@/src/data/vipCatalog'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore'
import { calculateLevelProgress } from '@/lib/progression'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const stripe = getStripeInstance()
  const sig = request.headers.get('stripe-signature')

  let event: any

  try {
    const rawBody = await request.text()

    if (STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    } else {
      // Parse direto se o webhook secret não estiver ativo no ambiente local
      event = JSON.parse(rawBody)
    }
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK SIGNATURE ERROR]: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook Signature Error: ${err.message}` },
      { status: 400 },
    )
  }

  // Processar eventos de pagamento
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.client_reference_id || session.metadata?.userId
      const productId = session.metadata?.productId
      const transactionId = (session.payment_intent as string) || session.id

      if (!userId || !productId) {
        console.warn('[STRIPE WEBHOOK] Dados incompletos na sessão:', { userId, productId })
        return NextResponse.json({ received: true, error: 'Metadata incompleta' })
      }

      const vipProduct = getVipProductById(productId)
      const legacyProduct = !vipProduct ? getRealProductById(productId) : null

      if (!vipProduct && !legacyProduct) {
        console.error('[STRIPE WEBHOOK] Produto inexistente no catálogo:', productId)
        return NextResponse.json({ received: true, error: 'Produto inválido' })
      }

      try {
        const userRef = doc(db, 'users', userId)
        const userTxRef = doc(db, 'users', userId, 'transactions', transactionId)
        const globalTxRef = doc(db, 'transactions', transactionId)

        // Processamento Atómico & Idempotente no Firestore
        await runTransaction(db, async (t) => {
          // 1. Verificar idempotência: se já foi pago, não entregar duas vezes!
          const txSnap = await t.get(userTxRef)
          if (txSnap.exists() && txSnap.data()?.status === 'paid') {
            console.log('[STRIPE WEBHOOK IDEMPOTENT] Transação já processada:', transactionId)
            return
          }

          const userSnap = await t.get(userRef)
          if (!userSnap.exists()) {
            throw new Error(`Utilizador ${userId} não encontrado na base de dados.`)
          }

          if (vipProduct) {
            // =========================================================================
            // ENTREGA DO ITEM VIP (€ REAL) COM ENTITLEMENT
            // =========================================================================
            const inventoryGrantId = `grant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            const entitlementRef = doc(db, 'users', userId, 'entitlements', vipProduct.id)

            t.set(entitlementRef, {
              productId: vipProduct.id,
              sku: vipProduct.sku,
              category: vipProduct.category,
              acquisitionType: 'vip_real_money',
              acquiredAt: serverTimestamp(),
              verifiedAt: serverTimestamp(),
              paymentId: transactionId,
              inventoryGrantId,
              status: 'active',
              entitlementType: 'permanent',
              priceCents: vipProduct.priceCents,
              currency: 'EUR',
              ...(vipProduct.bundleComponents ? { bundleComponents: vipProduct.bundleComponents } : {}),
              ...(vipProduct.collectionNumber ? { collectionNumber: vipProduct.collectionNumber } : {}),
            }, { merge: true })

            const updates: Record<string, any> = {
              [`inventory.${vipProduct.id}`]: 1,
              vipEntitlements: arrayUnion(vipProduct.id),
              updatedAt: serverTimestamp(),
            }

            if (vipProduct.category === 'avatar') {
              updates['inventory.avatars'] = arrayUnion(vipProduct.id)
              updates['unlockedAvatars'] = arrayUnion(vipProduct.id)
            } else if (vipProduct.category === 'frame') {
              updates['inventory.frames'] = arrayUnion(vipProduct.id)
              updates['unlockedFrames'] = arrayUnion(vipProduct.id)
            } else if (vipProduct.category === 'title') {
              updates['inventory.titles'] = arrayUnion(vipProduct.id)
              updates['ownedTitleIds'] = arrayUnion(vipProduct.id)
            } else if (vipProduct.category === 'arena') {
              updates['inventory.arenas'] = arrayUnion(vipProduct.id)
              updates['unlockedArenas'] = arrayUnion(vipProduct.id)
            } else if (vipProduct.category === 'emote') {
              updates['inventory.emotes'] = arrayUnion(vipProduct.id)
              updates['unlockedEmotes'] = arrayUnion(vipProduct.id)
            } else if (vipProduct.category === 'tauntpack') {
              updates['inventory.tauntpacks'] = arrayUnion(vipProduct.id)
              updates['unlockedTauntPacks'] = arrayUnion(vipProduct.id)
              if (vipProduct.taunts) {
                vipProduct.taunts.forEach((tItem) => {
                  updates['inventory.taunts'] = arrayUnion(tItem.id)
                })
              }
            }

            // DESEMPACOTAMENTO DE BUNDLES / ULTIMATE
            if ((vipProduct.category === 'bundle' || vipProduct.category === 'ultimate') && vipProduct.bundleComponents) {
              for (const componentId of vipProduct.bundleComponents) {
                updates[`inventory.${componentId}`] = 1
                updates.vipEntitlements = arrayUnion(componentId)

                const compProduct = getVipProductById(componentId)
                if (compProduct) {
                  const compEntitlementRef = doc(db, 'users', userId, 'entitlements', componentId)
                  t.set(compEntitlementRef, {
                    productId: componentId,
                    sku: compProduct.sku,
                    category: compProduct.category,
                    parentBundleId: vipProduct.id,
                    acquisitionType: 'vip_real_money_bundle',
                    acquiredAt: serverTimestamp(),
                    verifiedAt: serverTimestamp(),
                    paymentId: transactionId,
                    inventoryGrantId,
                    status: 'active',
                    entitlementType: 'permanent',
                    priceCents: compProduct.priceCents,
                    currency: 'EUR',
                  }, { merge: true })

                  if (compProduct.category === 'avatar') {
                    updates['inventory.avatars'] = arrayUnion(componentId)
                    updates['unlockedAvatars'] = arrayUnion(componentId)
                  } else if (compProduct.category === 'frame') {
                    updates['inventory.frames'] = arrayUnion(componentId)
                    updates['unlockedFrames'] = arrayUnion(componentId)
                  } else if (compProduct.category === 'title') {
                    updates['inventory.titles'] = arrayUnion(componentId)
                    updates['ownedTitleIds'] = arrayUnion(componentId)
                  } else if (compProduct.category === 'arena') {
                    updates['inventory.arenas'] = arrayUnion(componentId)
                    updates['unlockedArenas'] = arrayUnion(componentId)
                  } else if (compProduct.category === 'emote') {
                    updates['inventory.emotes'] = arrayUnion(componentId)
                    updates['unlockedEmotes'] = arrayUnion(componentId)
                  } else if (compProduct.category === 'tauntpack') {
                    updates['inventory.tauntpacks'] = arrayUnion(componentId)
                    updates['unlockedTauntPacks'] = arrayUnion(componentId)
                    if (compProduct.taunts) {
                      compProduct.taunts.forEach((t) => {
                        updates[`inventory.taunts`] = arrayUnion(t.id)
                      })
                    }
                  }
                }
              }
            }

            t.update(userRef, updates)

            // TRANSACTION LEDGER REGISTRATION (Campos canónicos exigidos)
            const txData = {
              id: transactionId,
              transactionId,
              userId,
              productId: vipProduct.id,
              priceEUR: vipProduct.priceEUR,
              amountInCents: vipProduct.priceCents,
              currency: 'EUR',
              paymentProvider: 'stripe',
              paymentStatus: 'completed',
              status: 'paid',
              type: 'vip_real_money_purchase',
              sku: vipProduct.sku,
              category: vipProduct.category,
              productName: vipProduct.name,
              stripeSessionId: session.id,
              acquisitionType: 'vip_real_money',
              entitlementType: 'permanent',
              reason: `Compra VIP (€ Real): ${vipProduct.name}`,
              inventoryGrantId,
              createdAt: serverTimestamp(),
              verifiedAt: serverTimestamp(),
              processedAt: serverTimestamp(),
            }

            t.set(userTxRef, txData)
            t.set(globalTxRef, txData)
          } else if (legacyProduct) {
            // =========================================================================
            // ENTREGA DE PRODUTO LEGADO
            // =========================================================================
            const userData = userSnap.data()
            const currentEuros = typeof userData.euros === 'number' ? userData.euros : 0
            const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
            const currentInventory: Record<string, number> = userData.inventory || {}
            const currentBadges: string[] = userData.badges || []

            const reward = legacyProduct.reward
            const newEuros = currentEuros + (reward.euros || 0)
            const newXp = currentXp + (reward.xp || 0)
            const levelProgress = calculateLevelProgress(newXp)
            const newLevel = levelProgress.currentLevel.level

            const updatedInventory = { ...currentInventory }
            if (reward.items) {
              Object.entries(reward.items).forEach(([itemId, qty]) => {
                updatedInventory[itemId] = (updatedInventory[itemId] || 0) + qty
              })
            }

            const updatedBadges = [...currentBadges]
            if (reward.badge && !updatedBadges.includes(reward.badge)) {
              updatedBadges.push(reward.badge)
            }

            t.update(userRef, {
              euros: newEuros,
              xp: newXp,
              level: newLevel,
              inventory: updatedInventory,
              badges: updatedBadges,
              ...(reward.vipPass ? { isVip: true, vipPassPurchasedAt: serverTimestamp() } : {}),
              ...(reward.isFounder
                ? {
                    is_founder: true,
                    isFounder: true,
                    founderMultiplier: 1.25,
                    founderPurchasedAt: serverTimestamp(),
                  }
                : {}),
              ...(reward.authorLicense
                ? {
                    can_submit_questions: true,
                    hasAuthorLicense: true,
                    authorLicensePurchasedAt: serverTimestamp(),
                  }
                : {}),
              updatedAt: serverTimestamp(),
            })

            const txData = {
              id: transactionId,
              userId,
              type: 'stripe_purchase',
              status: 'paid',
              productId: legacyProduct.id,
              productName: legacyProduct.name,
              amountInCents: legacyProduct.priceInCents,
              currency: legacyProduct.currency,
              stripeSessionId: session.id,
              rewardsDelivered: {
                euros: reward.euros,
                xp: reward.xp,
                items: reward.items || {},
                badge: reward.badge || null,
              },
              reason: `Compra de Pacote: ${legacyProduct.name}`,
              createdAt: serverTimestamp(),
              processedAt: serverTimestamp(),
            }

            t.set(userTxRef, txData)
            t.set(globalTxRef, txData)
          }
        })

        console.log(`[STRIPE WEBHOOK SUCCESS] Entrega de «${vipProduct?.name || legacyProduct?.name}» concluída para utilizador ${userId}!`)
      } catch (procErr) {
        console.error('[STRIPE WEBHOOK PROCESSING ERROR]:', procErr)
        return NextResponse.json({ error: 'Erro ao processar entrega' }, { status: 500 })
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object
      const paymentIntentId = charge.payment_intent as string
      if (paymentIntentId) {
        try {
          const globalTxRef = doc(db, 'transactions', paymentIntentId)
          await runTransaction(db, async (t) => {
            const snap = await t.get(globalTxRef)
            if (snap.exists()) {
              const data = snap.data()
              t.update(globalTxRef, {
                status: 'refunded',
                refundedAt: serverTimestamp(),
              })
              if (data.userId) {
                const userTxRef = doc(db, 'users', data.userId, 'transactions', paymentIntentId)
                t.update(userTxRef, {
                  status: 'refunded',
                  refundedAt: serverTimestamp(),
                })

                // Revogar entitlement caso seja compra VIP
                if (data.productId) {
                  const entitlementRef = doc(db, 'users', data.userId, 'entitlements', data.productId)
                  t.update(entitlementRef, {
                    status: 'revoked',
                    revokedAt: serverTimestamp(),
                  })
                  const userRef = doc(db, 'users', data.userId)
                  t.update(userRef, {
                    vipEntitlements: arrayRemove(data.productId),
                    [`inventory.${data.productId}`]: 0,
                    updatedAt: serverTimestamp(),
                  })
                }
              }
            }
          })
          console.log('[STRIPE WEBHOOK REFUND] Reembolso e revogação processados para:', paymentIntentId)
        } catch (refErr) {
          console.warn('[STRIPE WEBHOOK REFUND ERROR]:', refErr)
        }
      }
      break
    }

    default:
      console.log(`[STRIPE WEBHOOK] Evento não tratado: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
