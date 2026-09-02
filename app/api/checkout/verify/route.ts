import { NextResponse } from 'next/server'
import { getStripeInstance } from '@/lib/stripe'
import { getRealProductById } from '@/lib/real-products'
import { getVipProductById, formatVipPrice } from '@/src/data/vipCatalog'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { calculateLevelProgress } from '@/lib/progression'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'ID da sessão ausente.' },
        { status: 400 },
      )
    }

    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Sessão Stripe não encontrada.' },
        { status: 404 },
      )
    }

    const isPaid = session.payment_status === 'paid'
    const userId = session.client_reference_id || session.metadata?.userId
    const productId = session.metadata?.productId
    const transactionId = (session.payment_intent as string) || session.id

    if (!isPaid) {
      return NextResponse.json({
        success: true,
        paid: false,
        status: session.payment_status,
        message: 'O pagamento ainda não foi concluído.',
      })
    }

    if (!userId || !productId) {
      return NextResponse.json({
        success: true,
        paid: true,
        message: 'Pagamento confirmado mas dados do produto incompletos.',
      })
    }

    const vipProduct = getVipProductById(productId)
    const legacyProduct = !vipProduct ? getRealProductById(productId) : null

    if (!vipProduct && !legacyProduct) {
      return NextResponse.json({
        success: true,
        paid: true,
        message: 'Produto não encontrado no catálogo.',
      })
    }

    // Garantir entrega idempotente caso o webhook ainda não tenha chegado
    const userRef = doc(db, 'users', userId)
    const userTxRef = doc(db, 'users', userId, 'transactions', transactionId)
    const globalTxRef = doc(db, 'transactions', transactionId)

    await runTransaction(db, async (t) => {
      const txSnap = await t.get(userTxRef)
      if (txSnap.exists() && txSnap.data()?.status === 'paid') {
        // Já entregue de forma idempotente
        return
      }

      const userSnap = await t.get(userRef)
      if (!userSnap.exists()) return

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

    const productPayload = vipProduct
      ? {
          id: vipProduct.id,
          sku: vipProduct.sku,
          name: vipProduct.name,
          description: vipProduct.description || vipProduct.visualConcept,
          priceFormatted: formatVipPrice(vipProduct.priceCents),
          category: vipProduct.category,
          rarity: vipProduct.rarityLabel || vipProduct.rarity,
          assetPath: vipProduct.assetPath,
          acquisitionType: 'vip_real_money',
        }
      : {
          id: legacyProduct!.id,
          name: legacyProduct!.name,
          description: legacyProduct!.description,
          priceFormatted: `€${(legacyProduct!.priceInCents / 100).toFixed(2).replace('.', ',')}`,
          reward: legacyProduct!.reward,
        }

    return NextResponse.json({
      success: true,
      paid: true,
      product: productPayload,
      transactionId,
      customerEmail: session.customer_details?.email || session.customer_email,
    })
  } catch (error: any) {
    console.error('[STRIPE VERIFY ERROR]:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao verificar pagamento.' },
      { status: 500 },
    )
  }
}
