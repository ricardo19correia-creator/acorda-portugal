import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateMatchmakingRoom } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, displayName, photoURL, level, district } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
    }

    const res = await findOrCreateMatchmakingRoom(
      {
        uid: userId,
        displayName: displayName || 'Jogador',
        photoURL: photoURL || null,
      },
      {
        level: Number(level) || 1,
        district: district || 'Portugal',
      },
    )

    if (res.matched && res.opponent) {
      return NextResponse.json({
        status: 'matched',
        match_id: res.roomId,
        opponentInfo: {
          displayName: res.opponent.displayName,
          photoURL: res.opponent.photoURL || null,
          level: res.opponent.level || 1,
          district: res.opponent.district || 'Portugal',
        },
      })
    }

    return NextResponse.json({
      status: 'waiting',
      match_id: res.roomId,
    })
  } catch (err: any) {
    console.error('[/api/duel/match ERROR]:', err)
    return NextResponse.json({ error: err?.message || 'Erro no matchmaking' }, { status: 500 })
  }
}

