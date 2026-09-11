import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateMatchmakingRoom } from '@/lib/duel'
import { getAdminAuth } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Inicia sessão para jogar duelos.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada. Inicia sessão novamente.' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const { displayName, photoURL, level, district } = body

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

