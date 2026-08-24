import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateDuelQuestions, generateDuelCode, type DuelDocument, type DuelPlayerData } from '@/lib/duel'
import { getArenaById, getRandomArena } from '@/src/data/arenas'
import { QUESTION_TIME_MS } from '@/config/quiz'

export const dynamic = 'force-dynamic'

interface QueueTicketData {
  userId: string
  userName: string
  avatar: string | null
  level: number
  district: string
  status: 'searching' | 'matched'
  match_id?: string | null
  opponentInfo?: {
    displayName: string
    photoURL?: string | null
    level: number
    district?: string
  } | null
  arenaId?: string
  arenaImage?: string
  arenaName?: string
  createdAt: number
  lastHeartbeat: number
  expiresAt: number
}

async function handleMatchmaking(params: {
  userId: string
  name?: string | null
  photo?: string | null
  level?: number | string | null
  district?: string | null
  arenaId?: string | null
  arenaImage?: string | null
  arenaName?: string | null
}) {
  const { userId } = params
  if (!userId) {
    return { error: 'userId obrigatório', status: 400 }
  }

  const now = Date.now()
  const userName = params.name || 'Jogador'
  const userPhoto = params.photo || null
  const userLevel = Number(params.level) || 1
  const userDistrict = params.district || 'Portugal'
  const arena = params.arenaId ? getArenaById(params.arenaId) : getRandomArena()
  const chosenArenaId = arena?.id || 'arena-1'
  const chosenArenaImage = params.arenaImage || arena?.image || '/arenas/arena-1.jpg'
  const chosenArenaName = params.arenaName || arena?.name || 'Praça do Império'

  const myUserTicketRef = doc(db, 'duelQueue', userId)

  // 1. Verificar se o jogador já foi emparelhado anteriormente
  const myTicketSnap = await getDoc(myUserTicketRef)
  if (myTicketSnap.exists()) {
    const ticketData = myTicketSnap.data() as QueueTicketData
    if (ticketData.status === 'matched' && ticketData.match_id) {
      return {
        status: 'matched',
        match_id: ticketData.match_id,
        opponentInfo: ticketData.opponentInfo || {
          displayName: 'Adversário',
          photoURL: null,
          level: 1,
          district: 'Portugal',
        },
      }
    }
  }

  // 2. Procurar oponentes em espera na fila (duelQueue) sem qualquer restrição de nível ou região
  const queueQuery = query(
    collection(db, 'duelQueue'),
    where('status', '==', 'searching'),
  )
  const queueSnap = await getDocs(queueQuery)

  // Filtrar o próprio utilizador e tickets expirados (> 25 segundos sem ping)
  const candidateTickets = queueSnap.docs
    .map((d) => d.data() as QueueTicketData)
    .filter((t) => t.userId !== userId && t.status === 'searching' && t.lastHeartbeat > now - 25_000)

  // Ordenar por ordem de chegada (FIFO: mais antigo primeiro)
  candidateTickets.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))

  if (candidateTickets.length > 0) {
    const opp = candidateTickets[0]
    const oppRef = doc(db, 'duelQueue', opp.userId)
    const newDuelId = `duel_${crypto.randomUUID()}`
    const startedAt = now + 3500
    const firstDeadline = startedAt + QUESTION_TIME_MS

    try {
      const matchResult = await runTransaction(db, async (transaction) => {
        const oppSnap = await transaction.get(oppRef)
        if (!oppSnap.exists()) return { success: false }

        const oppCurrent = oppSnap.data() as QueueTicketData
        if (oppCurrent.status !== 'searching') return { success: false }

        // Jogador A (Host/Quem já estava na fila)
        const playerA: DuelPlayerData = {
          uid: opp.userId,
          displayName: opp.userName || 'Jogador A',
          photoURL: opp.avatar || null,
          level: opp.level || 1,
          district: opp.district || 'Portugal',
          score: 0,
          correctCount: 0,
          currentQuestionIndex: 0,
          answers: [],
          finished: false,
          questionStartedAt: startedAt,
          questionDeadline: firstDeadline,
        }

        // Jogador B (Guest/Quem acabou de procurar)
        const playerB: DuelPlayerData = {
          uid: userId,
          displayName: userName,
          photoURL: userPhoto,
          level: userLevel,
          district: userDistrict,
          score: 0,
          correctCount: 0,
          currentQuestionIndex: 0,
          answers: [],
          finished: false,
          questionStartedAt: startedAt,
          questionDeadline: firstDeadline,
        }

        const questions = generateDuelQuestions(10)

        const duelDoc: DuelDocument = {
          id: newDuelId,
          code: generateDuelCode(),
          status: 'matched',
          playerUids: [opp.userId, userId],
          createdAt: now,
          startedAt,
          expiresAt: now + 15 * 60 * 1000,
          arenaId: opp.arenaId || chosenArenaId,
          arenaImage: opp.arenaImage || chosenArenaImage,
          arenaName: opp.arenaName || chosenArenaName,
          playerA,
          playerB,
          questions,
          winnerUid: null,
          winnerReason: null,
          rewardsClaimed: {},
          rematch: null,
        }

        const duelRef = doc(db, 'duels', newDuelId)
        transaction.set(duelRef, duelDoc)

        // Atualizar ticket do oponente para matched
        transaction.set(
          oppRef,
          {
            ...oppCurrent,
            status: 'matched',
            match_id: newDuelId,
            opponentInfo: {
              displayName: userName,
              photoURL: userPhoto,
              level: userLevel,
              district: userDistrict,
            },
            lastHeartbeat: now,
          },
          { merge: true },
        )

        // Atualizar ticket do utilizador atual para matched
        transaction.set(
          myUserTicketRef,
          {
            userId,
            userName,
            avatar: userPhoto,
            level: userLevel,
            district: userDistrict,
            status: 'matched',
            match_id: newDuelId,
            opponentInfo: {
              displayName: opp.userName,
              photoURL: opp.avatar,
              level: opp.level,
              district: opp.district,
            },
            arenaId: chosenArenaId,
            arenaImage: chosenArenaImage,
            arenaName: chosenArenaName,
            createdAt: now,
            lastHeartbeat: now,
            expiresAt: now + 60_000,
          },
          { merge: true },
        )

        return {
          success: true,
          match_id: newDuelId,
          opponentInfo: {
            displayName: opp.userName,
            photoURL: opp.avatar,
            level: opp.level,
            district: opp.district,
          },
        }
      })

      if (matchResult.success && matchResult.match_id) {
        console.log('[Matchmaking Engine] MATCH ATÓMICO CRIADO:', newDuelId, 'entre', opp.userName, 'e', userName)
        return {
          status: 'matched',
          match_id: matchResult.match_id,
          opponentInfo: matchResult.opponentInfo,
        }
      }
    } catch (txErr) {
      console.warn('[Matchmaking Engine] Colisão de transação na fila, tentando re-inserir:', txErr)
    }
  }

  // 3. Se não houver oponente ainda, registar/atualizar na fila de espera
  await setDoc(
    myUserTicketRef,
    {
      userId,
      userName,
      avatar: userPhoto,
      level: userLevel,
      district: userDistrict,
      status: 'searching',
      match_id: null,
      opponentInfo: null,
      arenaId: chosenArenaId,
      arenaImage: chosenArenaImage,
      arenaName: chosenArenaName,
      createdAt: myTicketSnap.exists() ? (myTicketSnap.data() as QueueTicketData).createdAt || now : now,
      lastHeartbeat: now,
      expiresAt: now + 30_000,
    },
    { merge: true },
  )

  return {
    status: 'searching',
    match_id: null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''
    const name = searchParams.get('name') || ''
    const photo = searchParams.get('photo') || null
    const level = searchParams.get('level')
    const district = searchParams.get('district')
    const arenaId = searchParams.get('arenaId')
    const arenaImage = searchParams.get('arenaImage')
    const arenaName = searchParams.get('arenaName')

    const result = await handleMatchmaking({
      userId,
      name,
      photo,
      level,
      district,
      arenaId,
      arenaImage,
      arenaName,
    })

    if ((result as any).error) {
      return NextResponse.json({ error: (result as any).error }, { status: (result as any).status || 400 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/matchmaking/status GET ERROR]:', err)
    return NextResponse.json({ error: err?.message || 'Erro no matchmaking' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await handleMatchmaking({
      userId: body.userId || body.uid,
      name: body.displayName || body.userName || body.name,
      photo: body.photoURL || body.avatar || body.photo,
      level: body.level,
      district: body.district,
      arenaId: body.arenaId,
      arenaImage: body.arenaImage,
      arenaName: body.arenaName,
    })

    if ((result as any).error) {
      return NextResponse.json({ error: (result as any).error }, { status: (result as any).status || 400 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/matchmaking/status POST ERROR]:', err)
    return NextResponse.json({ error: err?.message || 'Erro no matchmaking' }, { status: 500 })
  }
}
