import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { OFFICIAL_EMOTES } from '@/src/data/emotes'
import { TAUNT_PACKS } from '@/src/data/tauntPacks'
import { SHOP_CATALOG } from '@/lib/economy'
import { ARENA_SHOP_CATALOG } from '@/src/data/shopArenas'
import { OFFICIAL_SHOP_AVATARS } from '@/src/data/shopAvatars'
import { TITLE_SHOP_CATALOG } from '@/src/data/shopTitles'
import { ANIMATED_FRAMES } from '@/src/data/frames'
import { getConsumableRule, ConsumableRule } from '@/src/data/economy'

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

    // 2. Identificação Segura do Item e Preço Canónico (SSOT)
    let itemPrice: number = 0
    let itemCategory: string = category || 'general'
    let isConsumable: boolean = false
    let consumableRule: ConsumableRule | undefined = undefined

    // Verificar se é consumível / ajuda
    const rule = getConsumableRule(itemId)
    if (rule) {
      isConsumable = true
      consumableRule = rule
      itemPrice = rule.price
      itemCategory = 'ajudas'
    } else {
      // Verificar Molduras
      const foundFrame = ANIMATED_FRAMES.find((f) => f.id === itemId)
      if (foundFrame) {
        itemPrice = foundFrame.price
        itemCategory = 'molduras'
      } else {
        const foundEmote = OFFICIAL_EMOTES.find((e) => e.id === itemId)
        const foundPack = TAUNT_PACKS.find((p) => p.id === itemId)
        const foundAvatar = OFFICIAL_SHOP_AVATARS.find((av) => av.id === itemId)
        const foundArena = ARENA_SHOP_CATALOG.find((a) => a.id === itemId)
        const foundTitle = TITLE_SHOP_CATALOG.find((t) => t.id === itemId)
        const foundShop = SHOP_CATALOG.find((s) => s.id === itemId)

        if (foundEmote) {
          itemPrice = foundEmote.price
          itemCategory = 'taunts'
        } else if (foundPack) {
          itemPrice = foundPack.price
          itemCategory = 'taunts'
        } else if (foundAvatar) {
          if (foundAvatar.isAchievementOnly || foundAvatar.price === null || foundAvatar.rarity === 'EXCLUSIVO') {
            return NextResponse.json(
              { error: `O avatar "${foundAvatar.name}" é exclusivo por mérito/conquistas (${foundAvatar.unlockRequirement || 'Mérito'}). Não pode ser comprado com moedas.` },
              { status: 403 }
            )
          }
          itemPrice = foundAvatar.price
          itemCategory = 'avatars'
        } else if (foundArena) {
          if (foundArena.price === null || foundArena.rarity === 'Exclusiva' || (foundArena as any).isExclusive) {
            return NextResponse.json(
              { error: `A arena "${foundArena.name}" é exclusiva por mérito/rankings. Não pode ser comprada com moedas.` },
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
          if (foundShop.type === 'consumable') {
            isConsumable = true
          }
        } else {
          return NextResponse.json({ error: `Item "${itemId}" não encontrado no catálogo oficial.` }, { status: 404 })
        }
      }
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const todayStr = new Date().toISOString().slice(0, 10)

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

      // 3. Verificação de posse prévia para itens não consumíveis
      if (!isConsumable) {
        const invCategory = itemCategory === 'titulos' ? 'titles' : itemCategory === 'molduras' ? 'frames' : itemCategory
        const existingInv = userData.inventory?.[invCategory] || []
        const legacyUnlocked = (userData as any)?.unlockedFrames || []
        const inventoryObject = userData.inventory && typeof userData.inventory === 'object' && !Array.isArray(userData.inventory) ? userData.inventory : {}

        if (
          (Array.isArray(existingInv) && existingInv.includes(itemId)) ||
          (itemCategory === 'molduras' && Array.isArray(legacyUnlocked) && legacyUnlocked.includes(itemId)) ||
          (inventoryObject[itemId] && inventoryObject[itemId] > 0)
        ) {
          return {
            alreadyOwned: true,
            itemId,
            currentCoins,
          }
        }
      }

      // 4. Verificação de Limites de Consumíveis (Anti-Pay-to-Win)
      if (consumableRule) {
        let currentStock = 0
        const inv = userData.inventory || {}
        if (consumableRule.consumableType === 'help5050') {
          currentStock = Number(userData.consumables?.help5050) || Number(inv.utilities?.fiftyFifty) || Number(inv['consumable_50_50']) || Number(inv['ajuda_5050']) || 0
        } else if (consumableRule.consumableType === 'freezeTime') {
          currentStock = Number(userData.consumables?.freezeTime) || Number(inv.utilities?.freezeTime) || Number(inv['consumable_congelar_tempo']) || Number(inv['ajuda_congelar']) || 0
        } else if (consumableRule.consumableType === 'publicVote') {
          currentStock = Number(userData.consumables?.publicVote) || Number(inv.utilities?.publicVote) || Number(inv['HELP_005']) || Number(inv['consumable_public_vote']) || Number(inv['ajuda_publico']) || 0
        } else if (consumableRule.consumableType === 'hint') {
          currentStock = Number(userData.consumables?.hints) || Number(inv['consumable_pista']) || Number(inv['pista_historica']) || 0
        } else if (consumableRule.consumableType === 'streakProtection') {
          currentStock = Number(userData.consumables?.streakProtection) || Number(inv['consumable_protecao_streak']) || Number(inv['protecao_streak']) || 0
        } else {
          currentStock = Number(inv[consumableRule.canonicalId]) || 0
        }

        const quantityToAdd = consumableRule.quantityGranted || 1

        // A. Limite de Stock Máximo Acumulado (maxOwned)
        if (currentStock + quantityToAdd > consumableRule.maxOwned) {
          throw new Error(`Atingiste o stock máximo acumulado para «${consumableRule.name}» (máx: ${consumableRule.maxOwned} un.). Usa as ajudas que possuis antes de comprar mais.`)
        }

        // B. Limite Diário de Compras (dailyLimit)
        const dailyPurchasesMap = userData.dailyPurchases?.[todayStr] || {}
        const boughtToday = Number(dailyPurchasesMap[consumableRule.canonicalId]) || 0
        if (boughtToday >= consumableRule.dailyLimit) {
          throw new Error(`Atingiste o limite diário de compras para «${consumableRule.name}» (máx: ${consumableRule.dailyLimit}/dia). Volta amanhã!`)
        }
      }

      // 5. Verificação de Saldo Suficiente
      if (currentCoins < itemPrice) {
        throw new Error(`Saldo insuficiente. Precisas de €${itemPrice.toLocaleString('pt-PT')} e tens €${currentCoins.toLocaleString('pt-PT')}.`)
      }

      const newCoins = Math.max(0, currentCoins - itemPrice)
      const updatePayload: Record<string, any> = {
        coins: newCoins,
        euros: newCoins,
        updatedAt: FieldValue.serverTimestamp(),
      }

      // 6. Atualização Atómica do Inventário e Consumíveis
      if (consumableRule) {
        const qty = consumableRule.quantityGranted || 1
        if (consumableRule.consumableType === 'help5050') {
          updatePayload['consumables.help5050'] = FieldValue.increment(qty)
          updatePayload['inventory.utilities.fiftyFifty'] = FieldValue.increment(qty)
          updatePayload['inventory.consumable_50_50'] = FieldValue.increment(qty)
        } else if (consumableRule.consumableType === 'publicVote') {
          updatePayload['consumables.publicVote'] = FieldValue.increment(qty)
          updatePayload['inventory.utilities.publicVote'] = FieldValue.increment(qty)
          updatePayload['inventory.HELP_005'] = FieldValue.increment(qty)
          updatePayload['inventory.consumable_public_vote'] = FieldValue.increment(qty)
        } else if (consumableRule.consumableType === 'freezeTime') {
          updatePayload['consumables.freezeTime'] = FieldValue.increment(qty)
          updatePayload['inventory.utilities.freezeTime'] = FieldValue.increment(qty)
          updatePayload['inventory.consumable_congelar_tempo'] = FieldValue.increment(qty)
        } else if (consumableRule.consumableType === 'hint') {
          updatePayload['consumables.hints'] = FieldValue.increment(qty)
          updatePayload['inventory.consumable_pista'] = FieldValue.increment(qty)
        } else if (consumableRule.consumableType === 'streakProtection') {
          updatePayload['consumables.streakProtection'] = FieldValue.increment(qty)
          updatePayload['inventory.consumable_protecao_streak'] = FieldValue.increment(qty)
        } else {
          updatePayload[`inventory.${consumableRule.canonicalId}`] = FieldValue.increment(qty)
        }

        // Atualizar contador diário de compras
        updatePayload[`dailyPurchases.${todayStr}.${consumableRule.canonicalId}`] = FieldValue.increment(1)
      } else if (itemCategory === 'molduras') {
        updatePayload['inventory.frames'] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = 1
        updatePayload.unlockedFrames = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'avatars') {
        updatePayload['inventory.avatars'] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = 1
      } else if (itemCategory === 'arenas') {
        updatePayload['inventory.arenas'] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = 1
      } else if (itemCategory === 'titulos') {
        updatePayload['inventory.titles'] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = 1
        updatePayload.ownedTitleIds = FieldValue.arrayUnion(itemId)
      } else if (itemCategory === 'taunts' || itemId.startsWith('PROV_') || itemId.startsWith('emote_')) {
        updatePayload['inventory.taunts'] = FieldValue.arrayUnion(itemId)
        updatePayload['inventory.emotes'] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = 1
      } else {
        updatePayload[`inventory.${itemCategory}`] = FieldValue.arrayUnion(itemId)
        updatePayload[`inventory.${itemId}`] = 1
      }

      transaction.update(userRef, updatePayload)

      // 7. Registar transação financeira imutável
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

