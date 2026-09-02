import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { OFFICIAL_EMOTES } from '@/src/data/emotes'
import { TAUNT_PACKS } from '@/data/tauntPacks'
import { SHOP_CATALOG } from '@/lib/economy'
import { shopArenas } from '@/data/shopArenas'
import { avatarShopList } from '@/data/shopAvatars'
import { TITLE_SHOP_CATALOG } from '@/data/shopTitles'
import { getFrameById } from '@/data/frames'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null

    // 1. Verificação de Autenticação Segura via Bearer Token
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1]
      const adminAuth = getAdminAuth()
      const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null)
      if (decoded?.uid) {
        userId = decoded.uid
      }
    }

    const body = await req.json().catch(() => ({}))
    const { uid, itemId, category } = body

    if (!userId && uid && typeof uid === 'string') {
      userId = uid
    }

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'Sessão inválida ou identificador do item ausente.' }, { status: 400 })
    }

    // 2. Identificação Segura do Item e Preço Canónico
    let itemPrice: number = 0
    let itemCategory: string = category || 'general'
    let isConsumable: boolean = false
    let consumableType: 'help5050' | 'publicVote' | 'freezeTime' | 'hint' | 'streakProtection' | null = null
    let consumableQuantity: number = 1

    const foundFrame = getFrameById(itemId)
    if (foundFrame) {
      itemPrice = foundFrame.price
      itemCategory = 'molduras'
    } else if (itemId === 'ajuda_5050' || itemId === 'consumable_50_50') {
      isConsumable = true
      itemCategory = 'ajudas'
      itemPrice = itemId === 'ajuda_5050' ? 500 : 300
      consumableType = 'help5050'
      consumableQuantity = itemId === 'ajuda_5050' ? 5 : 1
    } else if (itemId === 'HELP_005' || itemId === 'ajuda_publico') {
      isConsumable = true
      itemCategory = 'ajudas'
      itemPrice = 500
      consumableType = 'publicVote'
      consumableQuantity = 3
    } else if (itemId === 'ajuda_congelar' || itemId === 'consumable_congelar_tempo') {
      isConsumable = true
      itemCategory = 'ajudas'
      itemPrice = itemId === 'ajuda_congelar' ? 750 : 400
      consumableType = 'freezeTime'
      consumableQuantity = itemId === 'ajuda_congelar' ? 3 : 1
    } else if (itemId === 'consumable_pista') {
      isConsumable = true
      itemCategory = 'ajudas'
      itemPrice = 250
      consumableType = 'hint'
      consumableQuantity = 1
    } else if (itemId === 'consumable_protecao_streak') {
      isConsumable = true
      itemCategory = 'ajudas'
      itemPrice = 750
      consumableType = 'streakProtection'
      consumableQuantity = 1
    } else {
      const foundEmote = OFFICIAL_EMOTES.find((e) => e.id === itemId)
      const foundPack = TAUNT_PACKS.find((p) => p.id === itemId)
      const foundAvatar = avatarShopList.find((av) => av.id === itemId)
      const foundArena = shopArenas.find((a) => a.id === itemId)
      const foundTitle = TITLE_SHOP_CATALOG.find((t) => t.id === itemId)
      const foundShop = SHOP_CATALOG.find((s) => s.id === itemId)

      if (foundEmote) {
        itemPrice = foundEmote.price
        itemCategory = 'taunts'
      } else if (foundPack) {
        itemPrice = foundPack.price
        itemCategory = 'taunts'
      } else if (foundAvatar) {
        if (foundAvatar.isExclusive || foundAvatar.price === null) {
          return NextResponse.json(
            { error: `O avatar "${foundAvatar.name}" é exclusivo por conquista (${foundAvatar.unlockCondition || 'Mérito'}). Não pode ser comprado com moedas.` },
            { status: 403 }
          )
        }
        itemPrice = foundAvatar.price
        itemCategory = 'avatars'
      } else if (foundArena) {
        if (foundArena.isExclusive || foundArena.price === null) {
          return NextResponse.json(
            { error: `A arena "${foundArena.name}" é exclusiva por mérito (${foundArena.unlockCondition || 'Mérito'}). Não pode ser comprada com moedas.` },
            { status: 403 }
          )
        }
        itemPrice = foundArena.price
        itemCategory = 'arenas'
      } else if (foundTitle) {
        if (foundTitle.group === 'exclusivo' || foundTitle.price === null) {
          return NextResponse.json(
            { error: `O título "${foundTitle.name}" é exclusivo por mérito (${foundTitle.requirement || 'Mérito'}). Não pode ser comprado com moedas.` },
            { status: 403 }
          )
        }
        itemPrice = foundTitle.price
        itemCategory = 'titulos'
      } else if (foundShop) {
        itemPrice = foundShop.price || 0
        itemCategory = foundShop.category || category || 'general'
      } else {
        return NextResponse.json({ error: `Item "${itemId}" não encontrado no catálogo oficial.` }, { status: 404 })
      }
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)

    const transactionResult = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        throw new Error('Utilizador não registado no sistema.')
      }

      const userData = userSnap.data() || {}
      const currentCoins =
        typeof userData.coins === 'number'
          ? userData.coins
          : typeof userData.euros === 'number'
            ? userData.euros
            : 0

      // Verificação de posse prévia para itens não consumíveis
      if (!isConsumable) {
        const invCategory = itemCategory === 'titulos' ? 'titles' : itemCategory === 'molduras' ? 'frames' : itemCategory
        const existingInv = userData.inventory?.[invCategory] || []
        const legacyUnlocked = (userData as any)?.unlockedFrames || []
        if (
          (Array.isArray(existingInv) && existingInv.includes(itemId)) ||
          (itemCategory === 'molduras' && Array.isArray(legacyUnlocked) && legacyUnlocked.includes(itemId))
        ) {
          return {
            alreadyOwned: true,
            itemId,
            currentCoins,
          }
        }
      }

      if (currentCoins < itemPrice) {
        throw new Error(`Saldo insuficiente. Precisas de €${itemPrice.toLocaleString('pt-PT')} e tens €${currentCoins.toLocaleString('pt-PT')}.`)
      }

      const newCoins = Math.max(0, currentCoins - itemPrice)
      const updatePayload: Record<string, any> = {
        coins: newCoins,
        euros: newCoins,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (isConsumable && consumableType) {
        if (consumableType === 'help5050') {
          updatePayload['consumables.help5050'] = FieldValue.increment(consumableQuantity)
          updatePayload['inventory.utilities.fiftyFifty'] = FieldValue.increment(consumableQuantity)
        } else if (consumableType === 'publicVote') {
          updatePayload['consumables.publicVote'] = FieldValue.increment(consumableQuantity)
          updatePayload['inventory.utilities.publicVote'] = FieldValue.increment(consumableQuantity)
          updatePayload['inventory.HELP_005'] = FieldValue.increment(consumableQuantity)
          updatePayload['inventory.helps'] = FieldValue.arrayUnion('HELP_005')
        } else if (consumableType === 'freezeTime') {
          updatePayload['consumables.freezeTime'] = FieldValue.increment(consumableQuantity)
          updatePayload['inventory.utilities.freezeTime'] = FieldValue.increment(consumableQuantity)
        } else {
          updatePayload[`inventory.${itemId}`] = FieldValue.increment(consumableQuantity)
        }
      } else if (itemCategory === 'molduras') {
        updatePayload['inventory.frames'] = FieldValue.arrayUnion(itemId)
        updatePayload.unlockedFrames = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'avatars') {
        updatePayload['inventory.avatars'] = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'arenas') {
        updatePayload['inventory.arenas'] = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'titulos') {
        updatePayload['inventory.titles'] = FieldValue.arrayUnion(itemId)
        updatePayload.ownedTitleIds = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'taunts' || itemId.startsWith('PROV_') || itemId.startsWith('emote_')) {
        updatePayload['inventory.taunts'] = FieldValue.arrayUnion(itemId)
        updatePayload['inventory.emotes'] = FieldValue.arrayUnion(itemId)
      } else {
        updatePayload[`inventory.${itemCategory}`] = FieldValue.arrayUnion(itemId)
      }

      transaction.update(userRef, updatePayload)

      // Registar transação financeira imutável
      const txRef = userRef.collection('transactions').doc()
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type: 'spend',
        amount: -itemPrice,
        reason: `Compra na Loja: ${itemId} (${itemCategory})`,
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
      message: `Item adquirido com sucesso por €${itemPrice.toLocaleString('pt-PT')} Moedas!`,
      itemId,
      deducted: transactionResult.deducted,
      remainingCoins: transactionResult.remainingCoins,
    })
  } catch (error: any) {
    console.error('[API Buy-Item] Erro:', error)
    return NextResponse.json({ error: error?.message || 'Erro ao processar compra.' }, { status: 400 })
  }
}

