import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { OFFICIAL_EMOTES } from '@/src/data/emotes'
import { SHOP_CATALOG } from '@/lib/economy'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { uid, itemId, category } = body

    if (!uid || !itemId) {
      return NextResponse.json({ error: 'UID e itemId são obrigatórios.' }, { status: 400 })
    }

    // Identificar o item no catálogo de emotes/taunts ou catálogo geral
    let itemPrice = 0
    let itemCategory = category || 'taunts'

    if (itemId === 'PROV_010' || itemId.startsWith('PROV_') || itemId.startsWith('emote_')) {
      const foundEmote = OFFICIAL_EMOTES.find((e) => e.id === itemId)
      if (foundEmote) {
        itemPrice = foundEmote.price
        itemCategory = 'taunts'
      } else if (itemId === 'PROV_010') {
        itemPrice = 250
        itemCategory = 'taunts'
      }
    } else {
      const foundShop = SHOP_CATALOG.find((s) => s.id === itemId)
      if (foundShop) {
        itemPrice = foundShop.price || 0
        itemCategory = foundShop.category || category || 'general'
      }
    }

    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 })
    }

    const userData = userSnap.data()
    const currentCoins = typeof userData.coins === 'number' ? userData.coins : typeof userData.euros === 'number' ? userData.euros : 0

    if (currentCoins < itemPrice) {
      return NextResponse.json({ error: 'Saldo de € Acorda insuficiente.', currentCoins, required: itemPrice }, { status: 400 })
    }

    const updatePayload: Record<string, any> = {
      coins: increment(-itemPrice),
      euros: increment(-itemPrice),
    }

    if (itemCategory === 'taunts' || itemId.startsWith('PROV_') || itemId.startsWith('emote_')) {
      updatePayload['inventory.taunts'] = arrayUnion(itemId)
      updatePayload['inventory.emotes'] = arrayUnion(itemId)
    } else if (itemCategory === 'avatars') {
      updatePayload['inventory.avatars'] = arrayUnion(itemId)
    } else if (itemCategory === 'arenas') {
      updatePayload['inventory.arenas'] = arrayUnion(itemId)
    } else if (itemCategory === 'titulos') {
      updatePayload['inventory.titles'] = arrayUnion(itemId)
    } else {
      updatePayload[`inventory.${itemCategory}`] = arrayUnion(itemId)
    }

    await updateDoc(userRef, updatePayload)

    return NextResponse.json({
      success: true,
      message: `Item ${itemId} adquirido com sucesso por €${itemPrice}!`,
      itemId,
      deducted: itemPrice,
      remainingCoins: currentCoins - itemPrice,
    })
  } catch (error: any) {
    console.error('[API Buy-Item] Erro:', error)
    return NextResponse.json({ error: error?.message || 'Erro ao processar compra.' }, { status: 500 })
  }
}
