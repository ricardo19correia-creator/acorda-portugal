import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getEmoteById } from '@/src/data/emotes'

// In-memory rate limiting map for 3-second cooldown per player
const playerCooldowns = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const duelId = body.duelId || body.roomId
    const senderId = body.senderId
    const senderName = body.senderName
    const emoteId = body.emoteId || body.reaction?.id

    if (!duelId || !senderId || !emoteId) {
      return NextResponse.json({ error: 'Parâmetros em falta.' }, { status: 400 })
    }

    // 1. Anti-spam Cooldown Check (3 segundos)
    const now = Date.now()
    const lastSent = playerCooldowns.get(senderId) || 0
    if (now - lastSent < 2500) {
      return NextResponse.json({ error: 'Cooldown ativo. Aguarda um momento.', waitMs: 3000 - (now - lastSent) }, { status: 429 })
    }

    // 2. Validate Emote
    const emote = getEmoteById(emoteId)
    if (!emote) {
      return NextResponse.json({ error: 'Emote inválido ou inexistente.' }, { status: 400 })
    }

    // 3. Validate Duel and Participant
    const duelRef = doc(db, 'duels', duelId)
    const duelSnap = await getDoc(duelRef)
    if (!duelSnap.exists()) {
      return NextResponse.json({ error: 'Partida não encontrada.' }, { status: 404 })
    }

    const duelData = duelSnap.data()
    const isPlayerA = duelData.playerA?.uid === senderId
    const isPlayerB = duelData.playerB?.uid === senderId

    if (!isPlayerA && !isPlayerB) {
      return NextResponse.json({ error: 'Jogador não pertence a esta partida.' }, { status: 403 })
    }

    // 4. Update Emote & Reaction on Firestore Realtime
    const emotePayload = {
      id: crypto.randomUUID(),
      type: 'PLAYER_REACTION',
      roomId: duelId,
      duelId,
      senderId,
      senderName: senderName || (isPlayerA ? duelData.playerA?.displayName : duelData.playerB?.displayName) || 'Jogador',
      emoteId: emote.id,
      emoji: emote.emoji,
      label: emote.label,
      text: emote.text,
      reaction: {
        id: emote.id,
        icon: emote.emoji,
        text: emote.label,
      },
      timestamp: now,
    }

    await updateDoc(duelRef, {
      lastEmote: emotePayload,
      lastReaction: emotePayload,
    })

    playerCooldowns.set(senderId, now)

    return NextResponse.json({ success: true, emote: emotePayload })
  } catch (error: any) {
    console.error('[API Duel Emote] Erro:', error)
    return NextResponse.json({ error: error?.message || 'Erro interno.' }, { status: 500 })
  }
}
