import { NextRequest, NextResponse } from 'next/server'
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  collection,
  where,
  runTransaction,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  type MatchmakingTicket,
  type DuelDocument,
  type DuelPlayerData,
  generateDuelCode,
  generateDuelQuestions,
} from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, displayName, photoURL, level, district } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
    }

    const now = Date.now()
    const myLevel = Number(level) || 1
    const myName = displayName || 'Jogador'
    const myDistrict = district || 'Portugal'
    const myPhoto = photoURL || null

    const selfTicketRef = doc(db, 'duelQueue', userId)

    // 1. Limpar passivamente tickets mortos com mais de 35 segundos
    const qAll = query(collection(db, 'duelQueue'))
    const allQueueSnap = await getDocs(qAll)
    for (const d of allQueueSnap.docs) {
      const data = d.data() as MatchmakingTicket
      if (
        (data.lastHeartbeat && data.lastHeartbeat < now - 35_000) ||
        (data.expiresAt && data.expiresAt < now - 35_000)
      ) {
        deleteDoc(d.ref).catch(() => {})
      }
    }

    // 2. Verificar se o próprio utilizador já foi emparelhado
    const selfSnap = await getDoc(selfTicketRef)
    if (selfSnap.exists()) {
      const selfData = selfSnap.data() as MatchmakingTicket
      if (selfData.status === 'matched' && selfData.duelId && selfData.opponentInfo) {
        return NextResponse.json({
          status: 'matched',
          match_id: selfData.duelId,
          opponentInfo: selfData.opponentInfo,
        })
      }
    }

    // 3. Procurar adversário real disponível com status 'searching'
    const qSearching = query(collection(db, 'duelQueue'), where('status', '==', 'searching'))
    const searchingSnap = await getDocs(qSearching)

    const candidates: MatchmakingTicket[] = []
    for (const d of searchingSnap.docs) {
      const data = d.data() as MatchmakingTicket
      if (data.userId && data.userId !== userId && data.status === 'searching') {
        const isAlive =
          (data.lastHeartbeat && data.lastHeartbeat > now - 30_000) ||
          (data.joinedAt && data.joinedAt > now - 30_000)
        if (isAlive) {
          candidates.push(data)
        }
      }
    }

    // 4. Se houver candidato, executar emparelhamento atómico no Firestore
    if (candidates.length > 0) {
      // Ordenar por proximidade de nível e tempo de espera
      candidates.sort((a, b) => {
        const diffA = Math.abs(a.level - myLevel)
        const diffB = Math.abs(b.level - myLevel)
        if (diffA !== diffB) return diffA - diffB
        return a.joinedAt - b.joinedAt
      })

      const candidate = candidates[0]
      const candidateTicketRef = doc(db, 'duelQueue', candidate.userId)
      const newMatchId = `duel_${crypto.randomUUID()}`
      const duelRef = doc(db, 'duels', newMatchId)

      const questions = generateDuelQuestions(10)
      const code = generateDuelCode()
      const expiresAt = now + 15 * 60 * 1000
      const duelStartedAt = now + 3500
      const firstDeadline = duelStartedAt + 60_000

      const playerA: DuelPlayerData = {
        uid: candidate.userId,
        displayName: candidate.displayName || 'Adversário',
        photoURL: candidate.photoURL || null,
        level: candidate.level || 1,
        district: candidate.district || 'Portugal',
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        questionStartedAt: duelStartedAt,
        questionDeadline: firstDeadline,
        answers: [],
        finished: false,
        finishedAt: null,
      }

      const playerB: DuelPlayerData = {
        uid: userId,
        displayName: myName,
        photoURL: myPhoto,
        level: myLevel,
        district: myDistrict,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        questionStartedAt: duelStartedAt,
        questionDeadline: firstDeadline,
        answers: [],
        finished: false,
        finishedAt: null,
      }

      const duelDoc: DuelDocument = {
        id: newMatchId,
        code,
        status: 'matched',
        playerUids: [candidate.userId, userId],
        createdAt: now,
        startedAt: duelStartedAt,
        expiresAt,
        playerA,
        playerB,
        questions,
        winnerUid: null,
        winnerReason: null,
        rewardsClaimed: {},
      }

      const candOpponentInfo = {
        displayName: playerB.displayName,
        photoURL: playerB.photoURL,
        level: playerB.level,
        district: playerB.district,
      }

      const myOpponentInfo = {
        displayName: playerA.displayName,
        photoURL: playerA.photoURL,
        level: playerA.level,
        district: playerA.district,
      }

      const txResult = await runTransaction(db, async (transaction) => {
        const candSnap = await transaction.get(candidateTicketRef)
        const meSnap = await transaction.get(selfTicketRef)

        if (meSnap.exists()) {
          const meData = meSnap.data() as MatchmakingTicket
          if (meData.status === 'matched' && meData.duelId && meData.opponentInfo) {
            return {
              status: 'matched' as const,
              match_id: meData.duelId,
              opponentInfo: meData.opponentInfo,
            }
          }
        }

        if (!candSnap.exists()) {
          return { status: 'waiting' as const }
        }

        const candData = candSnap.data() as MatchmakingTicket
        if (candData.status !== 'searching') {
          return { status: 'waiting' as const }
        }

        // Criar sala e atualizar ambos os bilhetes
        transaction.set(duelRef, duelDoc)
        transaction.set(
          candidateTicketRef,
          {
            ...candData,
            status: 'matched',
            duelId: newMatchId,
            opponentInfo: candOpponentInfo,
            matchedAt: now,
          },
          { merge: true },
        )
        transaction.set(
          selfTicketRef,
          {
            userId,
            displayName: myName,
            photoURL: myPhoto,
            level: myLevel,
            district: myDistrict,
            status: 'matched',
            matchAttemptId: crypto.randomUUID(),
            joinedAt: meSnap.exists() ? (meSnap.data() as any).joinedAt || now : now,
            lastHeartbeat: now,
            expiresAt: now + 60_000,
            duelId: newMatchId,
            opponentInfo: myOpponentInfo,
            matchedAt: now,
          },
          { merge: true },
        )

        return {
          status: 'matched' as const,
          match_id: newMatchId,
          opponentInfo: myOpponentInfo,
        }
      })

      if (txResult.status === 'matched') {
        return NextResponse.json(txResult)
      }
    }

    // 5. Se não encontrou adversário no momento, manter utilizador na fila com status 'searching'
    const ticketData: MatchmakingTicket = {
      userId,
      displayName: myName,
      photoURL: myPhoto,
      level: myLevel,
      district: myDistrict,
      status: 'searching',
      matchAttemptId: selfSnap.exists() ? (selfSnap.data() as any).matchAttemptId || crypto.randomUUID() : crypto.randomUUID(),
      joinedAt: selfSnap.exists() ? (selfSnap.data() as any).joinedAt || now : now,
      lastHeartbeat: now,
      expiresAt: now + 35_000,
      duelId: null,
      opponentInfo: null,
      matchedAt: null,
    }

    await setDoc(selfTicketRef, ticketData, { merge: true })

    return NextResponse.json({ status: 'waiting' })
  } catch (err: any) {
    console.error('[/api/duel/match ERROR]:', err)
    return NextResponse.json({ error: err?.message || 'Erro no matchmaking' }, { status: 500 })
  }
}
