import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { OFFICIAL_EMOTES } from '@/src/data/emotes'
import { SHOP_CATALOG } from '@/lib/economy'
import { ARENA_SHOP_CATALOG } from '@/data/shopArenas'
import { avatarShopList } from '@/data/shopAvatars'
import { TITLE_SHOP_CATALOG } from '@/data/shopTitles'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { uid, itemId, category } = body

    if (!uid || !itemId) {
      return NextResponse.json({ error: 'UID e itemId são obrigatórios.' }, { status: 400 })
    }

    // 1. Identificar o item nos catálogos oficiais
    let itemPrice = 0
    let itemCategory = category || 'taunts'
    let isConsumable = false

    if (itemId === 'HELP_005' || itemId === 'ajuda_publico' || itemId.startsWith('HELP_') || itemId.startsWith('consumable_')) {
      isConsumable = true
      itemCategory = 'ajudas'
      itemPrice = itemId === 'HELP_005' || itemId === 'ajuda_publico' ? 250 : 150
    } else if (itemId === 'PROV_010' || itemId.startsWith('PROV_') || itemId.startsWith('emote_')) {
      const foundEmote = OFFICIAL_EMOTES.find((e) => e.id === itemId)
      itemPrice = foundEmote ? foundEmote.price : 250
      itemCategory = 'taunts'
    } else {
      const foundArena = ARENA_SHOP_CATALOG.find((a) => a.id === itemId)
      const foundAvatar = avatarShopList.find((av) => av.id === itemId)
      const foundTitle = TITLE_SHOP_CATALOG.find((t) => t.id === itemId)
      const foundShop = SHOP_CATALOG.find((s) => s.id === itemId)

      if (foundArena) {
        itemPrice = foundArena.priceValue || 500
        itemCategory = 'arenas'
      } else if (foundAvatar) {
        itemPrice = foundAvatar.priceValue || 350
        itemCategory = 'avatars'
      } else if (foundTitle) {
        itemPrice = foundTitle.priceValue || 200
        itemCategory = 'titulos'
      } else if (foundShop) {
        itemPrice = foundShop.price || 0
        itemCategory = foundShop.category || category || 'general'
      }
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(uid)

    const transactionResult = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        throw new Error('Utilizador não encontrado.')
      }

      const userData = userSnap.data() || {}
      const currentCoins = typeof userData.coins === 'number' ? userData.coins : typeof userData.euros === 'number' ? userData.euros : 0

      // Verificação de dupla compra para itens não consumíveis
      if (!isConsumable) {
        const invCategory = itemCategory === 'titulos' ? 'titles' : itemCategory
        const existingInv = userData.inventory?.[invCategory] || []
        if (Array.isArray(existingInv) && existingInv.includes(itemId)) {
          return {
            alreadyOwned: true,
            itemId,
            currentCoins,
          }
        }
      }

      if (currentCoins < itemPrice) {
        throw new Error(`Saldo insuficiente. Precisas de €${itemPrice} e tens €${currentCoins}.`)
      }

      const newCoins = currentCoins - itemPrice
      const updatePayload: Record<string, any> = {
        coins: newCoins,
        euros: newCoins,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (isConsumable) {
        updatePayload['inventory.helps'] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = FieldValue.increment(3)
        updatePayload['inventory.utilities.publicVote'] = FieldValue.increment(3)
        updatePayload['consumables.publicVote'] = FieldValue.increment(3)
      } else if (itemCategory === 'taunts' || itemId.startsWith('PROV_') || itemId.startsWith('emote_')) {
        updatePayload['inventory.taunts'] = FieldValue.arrayUnion(itemId)
        updatePayload['inventory.emotes'] = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'avatars') {
        updatePayload['inventory.avatars'] = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'arenas') {
        updatePayload['inventory.arenas'] = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'titulos') {
        updatePayload['inventory.titles'] = FieldValue.arrayUnion(itemId)
      } else {
        updatePayload[`inventory.${itemCategory}`] = FieldValue.arrayUnion(itemId)
      }

      transaction.update(userRef, updatePayload)

      // Registar recibo atómico
      const txRef = userRef.collection('transactions').doc()
      transaction.set(txRef, {
        id: txRef.id,
        userId: uid,
        type: 'spend',
        amount: -itemPrice,
        reason: `Compra de ${itemCategory}: ${itemId}`,
        createdAt: FieldValue.serverTimestamp(),
      })

      return {
        alreadyOwned: false,
        itemId,
        deducted: itemPrice,
        remainingCoins: newCoins,
      }
    })

    if (transactionResult.alreadyOwned) {
      return NextResponse.json({
        success: true,
        message: 'Item já consta no teu inventário.',
        itemId,
        alreadyOwned: true,
        remainingCoins: transactionResult.currentCoins,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Item ${itemId} adquirido com sucesso por €${itemPrice}!`,
      itemId,
      deducted: transactionResult.deducted,
      remainingCoins: transactionResult.remainingCoins,
    })
  } catch (error: any) {
    console.error('[API Buy-Item] Erro:', error)
    return NextResponse.json({ error: error?.message || 'Erro ao processar compra.' }, { status: 400 })
  }
}
