import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getShopCatalogItem, isItemPurchasableWithCoins, AID_MAX_OWNED_LIMIT, type ShopCatalogItem } from '@/lib/shop-catalog'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const startedAt = Date.now()
  let auditUserId: string | null = null
  let auditItemId: string | null = null

  try {
    // 1. Autenticação Segura via Firebase Admin Bearer Token
    let userId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1]
      try {
        const adminAuth = getAdminAuth()
        const decoded = await adminAuth.verifyIdToken(idToken)
        if (decoded?.uid) {
          userId = decoded.uid
        }
      } catch (authErr) {
        console.warn('[SHOP_PURCHASE_FAILED] Falha ao verificar ID Token:', authErr)
      }
    }

    const body = await req.json().catch(() => ({}))
    const { uid, itemId, idempotencyKey: rawIdempotencyKey } = body

    if (!userId && uid && typeof uid === 'string') {
      userId = uid
    }

    auditUserId = userId
    auditItemId = itemId

    if (!userId || !itemId) {
      console.warn('[SHOP_PURCHASE_FAILED] Sessão inválida ou identificador do item ausente.', { userId, itemId })
      return NextResponse.json(
        { success: false, error: 'Sessão inválida ou identificador do item ausente.' },
        { status: 400 }
      )
    }

    const idempotencyKey = typeof rawIdempotencyKey === 'string' && rawIdempotencyKey.trim().length > 0
      ? rawIdempotencyKey.trim()
      : null

    console.log('[SHOP_PURCHASE_STARTED]', { userId, itemId, idempotencyKey, timestamp: new Date().toISOString() })

    // 2. Localização e Validação do Item no Catálogo Oficial SSOT
    const item = getShopCatalogItem(itemId)
    if (!item || !item.active) {
      console.warn('[SHOP_PURCHASE_FAILED] Item não encontrado ou inativo no catálogo oficial.', { itemId })
      return NextResponse.json(
        { success: false, error: `O produto «${itemId}» não existe ou está inativo no catálogo oficial.` },
        { status: 404 }
      )
    }

    // 3. Validação de Elegibilidade (Anti-Pay-to-Win, Mérito e VIP)
    const purchasableCheck = isItemPurchasableWithCoins(item)
    if (!purchasableCheck.allowed) {
      console.warn('[SHOP_PURCHASE_FAILED] Tentativa de compra não permitida:', { itemId, reason: purchasableCheck.reason })
      return NextResponse.json(
        { success: false, error: purchasableCheck.reason },
        { status: 403 }
      )
    }

    const itemPrice = Math.round(item.priceCoins ?? 0)
    const isFree = item.currency === 'free' || itemPrice === 0
    const isConsumable = Boolean(item.consumable || item.type === 'aid' || item.type === 'utility')
    const quantityToAdd = isConsumable ? (item.quantity && item.quantity > 0 ? item.quantity : 1) : 1

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)

    // 4. Verificação de Idempotência: Se idempotencyKey fornecida, verificar se transação já foi processada
    if (idempotencyKey) {
      const existingTxSnap = await db
        .collection('coin_transactions')
        .where('userId', '==', userId)
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get()
        .catch(() => null)

      if (existingTxSnap && !existingTxSnap.empty) {
        const existingTx = existingTxSnap.docs[0].data()
        console.log('[SHOP_PURCHASE_IDEMPOTENT_HIT]', { userId, itemId, idempotencyKey, txId: existingTxSnap.docs[0].id })
        return NextResponse.json({
          success: true,
          idempotent: true,
          message: 'Compra já processada anteriormente (idempotente).',
          itemId: item.id,
          remainingCoins: existingTx.balanceAfter,
          transactionId: existingTxSnap.docs[0].id,
        })
      }
    }

    // 5. Execução Transacional Atómica (Dedução de Saldo + Inventário + Aid Subcollection + Transação Imutável)
    const result = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        throw new Error('Conta de utilizador não registada no sistema.')
      }

      const userData = userSnap.data() || {}
      const currentCoins = Math.max(
        0,
        Math.floor(
          typeof userData.coins === 'number'
            ? userData.coins
            : typeof userData.euros === 'number'
              ? userData.euros
              : 0
        )
      )

      // A. Verificação de Posse Prévia para Itens Não Consumíveis
      if (!isConsumable) {
        const inventory = userData.inventory || {}
        const categoryKey = item.type === 'title' ? 'titles' : item.type === 'frame' ? 'frames' : item.type === 'avatar' ? 'avatars' : item.type === 'arena' ? 'arenas' : 'taunts'
        const existingList = Array.isArray(inventory[categoryKey]) ? inventory[categoryKey] : []
        const legacyList = (userData as any)[`unlocked${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}`] || []
        const isOwnedDirect = Boolean(inventory[item.id] && inventory[item.id] > 0)

        if (existingList.includes(item.id) || legacyList.includes(item.id) || isOwnedDirect) {
          return {
            alreadyOwned: true,
            itemId: item.id,
            currentCoins,
            remainingCoins: currentCoins,
          }
        }
      }

      // B. Verificação de Limite de Stock Acumulado para Ajudas (maxOwned: 50)
      const aidRef = userRef.collection('aid_inventory').doc(item.id)
      let currentAidStock = 0

      if (isConsumable) {
        const aidSnap = await transaction.get(aidRef)
        if (aidSnap.exists) {
          currentAidStock = Number(aidSnap.data()?.quantity || 0)
        } else {
          // Fallback para campos legados se ainda não migrados
          const inv = userData.inventory || {}
          if (item.aliases) {
            for (const alias of item.aliases) {
              if (typeof inv[alias] === 'number') {
                currentAidStock = Math.max(currentAidStock, inv[alias])
              }
            }
          }
        }

        const maxLimit = item.maxOwned || AID_MAX_OWNED_LIMIT
        if (currentAidStock + quantityToAdd > maxLimit) {
          throw new Error(
            `Inventário cheio para «${item.name}». Já possuis ${currentAidStock} unidades (limite máximo: ${maxLimit} un.). Usa algumas antes de comprar mais.`
          )
        }
      }

      // C. Verificação Estrita de Saldo Suficiente (Anti-Saldo-Negativo)
      if (!isFree && currentCoins < itemPrice) {
        throw new Error(
          `Saldo insuficiente. Precisas de ${itemPrice.toLocaleString('pt-PT')} Moedas e tens ${currentCoins.toLocaleString('pt-PT')} Moedas.`
        )
      }

      const balanceAfter = isFree ? currentCoins : Math.max(0, currentCoins - itemPrice)

      // D. Preparar Payload de Atualização do Utilizador
      const userUpdatePayload: Record<string, any> = {
        coins: balanceAfter,
        euros: balanceAfter,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (isConsumable) {
        // 1. Atualizar subcoleção aid_inventory
        transaction.set(
          aidRef,
          {
            userId,
            aidId: item.id,
            quantity: FieldValue.increment(quantityToAdd),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        // 2. Atualizar inventário legado no documento para retrocompatibilidade
        userUpdatePayload[`inventory.${item.id}`] = FieldValue.increment(quantityToAdd)
        if (item.aliases) {
          for (const alias of item.aliases) {
            userUpdatePayload[`inventory.${alias}`] = FieldValue.increment(quantityToAdd)
          }
        }
        if (item.id === 'aid_50_50') {
          userUpdatePayload['consumables.help5050'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.fiftyFifty'] = FieldValue.increment(quantityToAdd)
        } else if (item.id === 'aid_public_vote') {
          userUpdatePayload['consumables.publicVote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.publicVote'] = FieldValue.increment(quantityToAdd)
        } else if (item.id === 'aid_freeze_time') {
          userUpdatePayload['consumables.freezeTime'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.freezeTime'] = FieldValue.increment(quantityToAdd)
        }
      } else {
        // Itens Cosméticos Permanentes (Avatares, Molduras, Arenas, Títulos, Reações)
        const typeCategory = item.type === 'title' ? 'titles' : item.type === 'frame' ? 'frames' : item.type === 'avatar' ? 'avatars' : item.type === 'arena' ? 'arenas' : 'taunts'
        userUpdatePayload[`inventory.${typeCategory}`] = FieldValue.arrayUnion(item.id)
        userUpdatePayload[`inventory.${item.id}`] = 1

        if (item.type === 'frame') {
          userUpdatePayload.unlockedFrames = FieldValue.arrayUnion(item.id)
        } else if (item.type === 'title') {
          userUpdatePayload.ownedTitleIds = FieldValue.arrayUnion(item.id)
        } else if (item.type === 'reaction') {
          userUpdatePayload['inventory.emotes'] = FieldValue.arrayUnion(item.id)
        }
      }

      transaction.update(userRef, userUpdatePayload)

      // E. Registar Transação Financeira Imutável em coin_transactions
      const txRef = db.collection('coin_transactions').doc()
      const txPayload = {
        transactionId: txRef.id,
        userId,
        amount: isFree ? 0 : -itemPrice,
        balanceBefore: currentCoins,
        balanceAfter,
        reason: isFree ? `Desbloqueio Gratuito: ${item.name}` : `Compra na Loja: ${item.name} (${item.type})`,
        itemId: item.id,
        itemType: item.type,
        timestamp: FieldValue.serverTimestamp(),
        idempotencyKey: idempotencyKey || txRef.id,
      }
      transaction.set(txRef, txPayload)

      // Espelhar na subcoleção do utilizador para visualização rápida no histórico
      const userTxRef = userRef.collection('transactions').doc(txRef.id)
      transaction.set(userTxRef, {
        id: txRef.id,
        userId,
        type: isFree ? 'free_unlock' : 'spend',
        amount: isFree ? 0 : -itemPrice,
        reason: txPayload.reason,
        itemId: item.id,
        createdAt: FieldValue.serverTimestamp(),
      })

      return {
        alreadyOwned: false,
        itemId: item.id,
        name: item.name,
        deducted: isFree ? 0 : itemPrice,
        remainingCoins: balanceAfter,
        transactionId: txRef.id,
        isConsumable,
        quantityAdded: quantityToAdd,
        newStock: currentAidStock + quantityToAdd,
      }
    })

    if (result.alreadyOwned) {
      console.log('[SHOP_ITEM_ALREADY_OWNED]', { userId, itemId: item.id })
      return NextResponse.json({
        success: true,
        alreadyOwned: true,
        message: `O item «${item.name}» já consta no teu inventário.`,
        itemId: item.id,
        remainingCoins: result.remainingCoins,
      })
    }

    console.log('[SHOP_PURCHASE_SUCCESS]', {
      userId,
      itemId: item.id,
      deducted: result.deducted,
      remainingCoins: result.remainingCoins,
      txId: result.transactionId,
      durationMs: Date.now() - startedAt,
    })

    if (result.isConsumable) {
      console.log('[AID_PURCHASED]', { userId, aidId: item.id, qty: result.quantityAdded, totalStock: result.newStock })
    } else {
      console.log('[SHOP_ITEM_UNLOCKED]', { userId, itemId: item.id, type: item.type })
    }

    return NextResponse.json({
      success: true,
      message: isFree
        ? `«${item.name}» desbloqueado com sucesso!`
        : `«${item.name}» adquirido com sucesso por 🪙 ${itemPrice.toLocaleString('pt-PT')} Moedas!`,
      itemId: item.id,
      name: item.name,
      deducted: result.deducted,
      remainingCoins: result.remainingCoins,
      transactionId: result.transactionId,
      isConsumable: result.isConsumable,
      quantityAdded: result.quantityAdded,
      newStock: result.newStock,
    })
  } catch (error: any) {
    console.error('[SHOP_PURCHASE_FAILED] Erro ao processar transação:', {
      userId: auditUserId,
      itemId: auditItemId,
      error: error?.message,
    })
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao processar compra na loja.' },
      { status: 400 }
    )
  }
}
