import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  calculateEventPoints,
  getLisbonDateString,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  canonicalizeEventId,
  type OfficialEventConfig,
} from '@/lib/events-service'
import { calculateLevelProgress } from '@/lib/progression'
import { calculateMatchCoinReward, calculateLevelUpCoinReward } from '@/lib/economy'
import { extractUserXp, extractUserCoins } from '@/lib/economy-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Token de sessão obrigatório.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const matchId = body.matchId || body.gameId
    const {
      score = 0,
      correctAnswers = 0,
      totalQuestions = 0,
      isAbandoned = false,
      eventId: requestedEventId,
      eventSlug,
      gameType,
    } = body

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId inválido.' }, { status: 400 })
    }

    // 🔒 VALIDAÇÃO ESTRITA: APENAS PARTIDAS DE EVENTO COM eventId EXPLÍCITO SÃO ACEITES
    if (!requestedEventId || typeof requestedEventId !== 'string') {
      return NextResponse.json(
        { error: 'eventId obrigatório para registar partida de evento. Partidas normais não podem entrar no evento.' },
        { status: 400 }
      )
    }

    if (gameType && gameType !== 'event') {
      return NextResponse.json(
        { error: 'Apenas partidas com gameType === "event" podem ser registadas no evento.' },
        { status: 400 }
      )
    }

    // Validação estrita: partidas abandonadas, incompletas ou corruptas não geram pontos de evento
    if (isAbandoned === true || totalQuestions < 3 || typeof score !== 'number' || isNaN(score) || score < 0) {
      return NextResponse.json({
        success: false,
        message: 'Partida não elegível para pontos de evento (abandonada, incompleta ou inválida).',
        eventPointsAdded: 0,
      })
    }

    const db = getAdminFirestore()
    const targetEventId = canonicalizeEventId(requestedEventId)

    // Obter documento do evento oficial no Firestore
    const eventDocRef = db.collection('events').doc(targetEventId)
    let eventSnap = await eventDocRef.get().catch(() => null)

    let activeEvent: OfficialEventConfig

    const baseDefaultEvent =
      targetEventId === OFFICIAL_PORTO_LISBOA_ID
        ? OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
        : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

    if (!eventSnap || !eventSnap.exists) {
      activeEvent = baseDefaultEvent
      await eventDocRef
        .set(
          {
            ...activeEvent,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
        .catch((e: any) => console.warn('[RECORD_MATCH_SEED_WARN]', e))
    } else {
      activeEvent = eventSnap.data() as OfficialEventConfig
    }

    // Verificar datas oficiais de vigência (Europe/Lisbon) e estado de encerramento
    const now = Date.now()
    const startStr = activeEvent.startDate || activeEvent.startAt || baseDefaultEvent.startDate
    const endStr = activeEvent.endDate || activeEvent.endAt || baseDefaultEvent.endDate
    const startMs = new Date(startStr).getTime()
    const endMs = new Date(endStr).getTime()

    if (now < startMs) {
      return NextResponse.json({
        success: false,
        message: `O evento ainda não iniciou (início previsto para ${startStr}).`,
        eventPointsAdded: 0,
      })
    }

    // Regra Canónica de Encerramento e Partidas em Curso:
    // Se o ranking já foi congelado definitivamente:
    const isFrozenOrEnded =
      activeEvent.status === 'processing' ||
      activeEvent.status === 'ended' ||
      activeEvent.active === false ||
      activeEvent.rewardsDistributed === true

    if (isFrozenOrEnded) {
      return NextResponse.json({
        success: false,
        message: `O evento está oficialmente encerrado e os resultados definitivos já foram congelados.`,
        eventPointsAdded: 0,
        eventEnded: true,
      })
    }

    // Se o evento ultrapassou o horário oficial de fim ou está na fase "closing":
    const isPastEnd = now > endMs || activeEvent.status === 'closing'
    if (isPastEnd) {
      // Verificar se a partida já estava legitimamente iniciada ANTES do encerramento oficial
      const preCheckMatchSnap = await eventDocRef.collection('matches').doc(matchId).get().catch(() => null)
      if (!preCheckMatchSnap || !preCheckMatchSnap.exists) {
        return NextResponse.json({
          success: false,
          message: `O evento já terminou em ${endStr}. Novas partidas não são aceites.`,
          eventPointsAdded: 0,
          eventEnded: true,
        })
      }

      const matchData = preCheckMatchSnap.data() || {}
      const startedAt = Number(
        matchData.startedAtMs ||
        matchData.createdAtMs ||
        (matchData.createdAt?.toMillis ? matchData.createdAt.toMillis() : 0)
      )

      if (startedAt && startedAt > endMs) {
        return NextResponse.json({
          success: false,
          message: `Esta partida foi iniciada após o horário oficial de encerramento (${endStr}) e não pontua no evento.`,
          eventPointsAdded: 0,
          eventEnded: true,
        })
      }
      console.log(`[EVENT_CUTOFF] Partida ${matchId} permitida a terminar pois foi iniciada legitimamente antes do encerramento.`)
    }

    const isPortoLisboa = targetEventId === OFFICIAL_PORTO_LISBOA_ID
    const pointDivisor = Number(activeEvent.rules?.pointDivisor || (isPortoLisboa ? 1 : 10))
    const maxPointsPerMatch = Number(activeEvent.rules?.maxEventPointsPerMatch || (isPortoLisboa ? 3000 : 100))
    const maxDailyMatches = Number(activeEvent.rules?.maxDailyMatches || activeEvent.dailyMatchLimit || 10)

    // Data de hoje calculada de forma autoritativa no fuso de Lisboa
    const todayDateStr = getLisbonDateString()

    // Validação estrita anti-fraude da pontuação:
    let safeScore = typeof score === 'number' && !isNaN(score) ? Math.max(0, Math.round(score)) : 0
    if (correctAnswers === 0) {
      safeScore = 0
    } else if (safeScore > (totalQuestions || 10) * 350) {
      safeScore = (totalQuestions || 10) * 350
    }

    // Cálculo dos pontos do evento:
    // No Porto vs Lisboa são os pontos reais da partida (ex: 800, 600)
    const potentialEventPoints = isPortoLisboa
      ? safeScore
      : calculateEventPoints(safeScore, pointDivisor, maxPointsPerMatch)

    console.log(`[EVENT] partida terminada: matchId=${matchId}, userId=${userId}, score=${safeScore}`)
    console.log(`[EVENT] evento identificado: eventId=${targetEventId}`)
    console.log(`[EVENT] resultado calculado: score=${safeScore}, potentialEventPoints=${potentialEventPoints}`)

    const matchRef = eventDocRef.collection('matches').doc(matchId)
    const participantRef = eventDocRef.collection('participants').doc(userId)
    const userRef = db.collection('users').doc(userId)

    // TRANSAÇÃO ATÓMICA E IDEMPOTENTE:
    // Garante atomicamente que o mesmo matchId NUNCA é processado duas vezes.
    const result = await db.runTransaction(async (transaction: any) => {
      const matchSnap = await transaction.get(matchRef)
      if (matchSnap.exists) {
        const mData = matchSnap.data() || {}
        // Se a partida pertencer a outro utilizador
        if (mData.userId && mData.userId !== userId) {
          throw new Error('Esta partida pertence a outro jogador.')
        }

        // Se a partida já foi concluída/processada anteriormente: IDEMPOTÊNCIA TOTAL
        if (mData.status === 'completed' || mData.processed === true) {
          console.log(`[EVENT] partida já processada previamente (idempotência): matchId=${matchId}`)
          return {
            alreadyProcessed: true,
            eventPointsAdded: mData.eventPoints || mData.points || 0,
            dailyLimitReached: Boolean(mData.dailyCapReached),
            dailyMatchesToday: mData.dailyMatchesToday ?? mData.matchesToday ?? null,
            message: 'Partida já registada anteriormente no evento.',
          }
        }
      }

      const [pSnap, uSnap] = await Promise.all([
        transaction.get(participantRef),
        transaction.get(userRef),
      ])

      const pData = pSnap.exists ? pSnap.data() : {}
      const uData = uSnap.exists ? uSnap.data() : {}

      // Identificar equipa do utilizador
      const userTeam: 'porto' | 'lisboa' | null =
        pData.team ||
        uData.events?.[targetEventId]?.team ||
        null

      const dailyMatches = pData.dailyMatches || {}
      const todayCount = Number(dailyMatches[todayDateStr] ?? pData.matchesToday ?? 0)

      const displayName =
        pData.displayName ||
        uData.displayName ||
        uData.username ||
        uData.email?.split('@')[0] ||
        decodedToken.email?.split('@')[0] ||
        'Jogador'
      const photoURL =
        pData.photoURL ??
        pData.avatar ??
        uData.photoURL ??
        uData.avatar ??
        '/images/avatars/avatar_01.png'
      const district =
        pData.district ||
        pData.distrito ||
        uData.district ||
        uData.distrito ||
        'Portugal'

      // Cálculo determinístico e autoritativo de XP e Moedas da partida
      const baseMatchXp = Math.max(10, correctAnswers * 50 + Math.round(score / 10))
      const earnedXp = potentialEventPoints > 0 ? potentialEventPoints : baseMatchXp
      const earnedCoins = calculateMatchCoinReward({
        correctCount: correctAnswers,
        totalQuestions: totalQuestions || 10,
        bestStreak: 1,
        difficulty: 1,
      })

      const currentXp = extractUserXp(uData, 0)
      const currentCoins = extractUserCoins(uData, 50)
      const oldLevel = calculateLevelProgress(currentXp).currentLevel.level
      const newTotalXp = currentXp + earnedXp
      const newLevelProg = calculateLevelProgress(newTotalXp)
      const newLevel = newLevelProg.currentLevel.level
      const leveledUp = newLevel > oldLevel
      const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0
      const totalAwardedCoins = earnedCoins + levelUpCoins
      const newTotalCoins = currentCoins + totalAwardedCoins

      const userUpdatePayload: Record<string, any> = {
        xp: FieldValue.increment(earnedXp),
        coins: FieldValue.increment(totalAwardedCoins),
        euros: FieldValue.increment(totalAwardedCoins),
        acordas: FieldValue.increment(totalAwardedCoins),
        moedas: FieldValue.increment(totalAwardedCoins),
        level: newLevel,
        gamesPlayed: FieldValue.increment(1),
        questionsAnswered: FieldValue.increment(totalQuestions),
        correctAnswers: FieldValue.increment(correctAnswers),
        incorrectAnswers: FieldValue.increment(Math.max(0, totalQuestions - correctAnswers)),
        totalQuestions: FieldValue.increment(totalQuestions),
        'stats.totalGames': FieldValue.increment(1),
        'stats.totalScore': FieldValue.increment(score),
        'stats.totalXp': FieldValue.increment(earnedXp),
        [`events.${targetEventId}.matches`]: FieldValue.increment(1),
        [`events.${targetEventId}.points`]: FieldValue.increment(potentialEventPoints),
        lastPlayedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      transaction.set(userRef, userUpdatePayload, { merge: true })

      // Sincronizar Perfil Público
      const publicProfileRef = db.collection('publicProfiles').doc(userId)
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          level: newLevel,
          xp: FieldValue.increment(earnedXp),
          gamesPlayed: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Registo na subcoleção match_rewards para idempotência
      const rewardRef = userRef.collection('match_rewards').doc(matchId)
      transaction.set(
        rewardRef,
        {
          matchId,
          userId,
          gameType: 'event',
          eventId: targetEventId,
          score,
          correctAnswers,
          totalQuestions,
          xpEarned: earnedXp,
          coinsEarned: totalAwardedCoins,
          processedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Registo de transação económica se ganhou moedas
      if (totalAwardedCoins > 0) {
        const txRef = userRef.collection('transactions').doc()
        transaction.set(txRef, {
          id: txRef.id,
          userId,
          type: 'earn',
          amount: totalAwardedCoins,
          reason: `Evento Oficial: Portugal em Jogo (${correctAnswers}/${totalQuestions} corretas)`,
          matchId,
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      // Se já atingiu o limite de 10 partidas no dia atual em Lisboa:
      if (todayCount >= maxDailyMatches) {
        transaction.set(
          matchRef,
          {
            id: matchId,
            matchId,
            gameType: 'event',
            eventId: targetEventId,
            eventSlug: eventSlug || 'primeiro-desafio-nacional-portugal-em-jogo',
            userId,
            team: userTeam || null,
            score,
            correctAnswers,
            totalQuestions,
            eventPoints: 0,
            points: 0,
            date: todayDateStr,
            dailyCapReached: true,
            dailyMatchesToday: todayCount,
            matchesToday: todayCount,
            status: 'completed',
            processed: true,
            completedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        // Incrementar apenas totalMatches informativo sem dar pontos de evento nem incrementar countedMatches
        transaction.set(
          participantRef,
          {
            userId,
            displayName,
            photoURL,
            avatar: photoURL,
            district,
            distrito: district,
            team: userTeam || null,
            totalMatches: FieldValue.increment(1),
            correctAnswers: FieldValue.increment(correctAnswers),
            incorrectAnswers: FieldValue.increment(Math.max(0, totalQuestions - correctAnswers)),
            questionsAnswered: FieldValue.increment(totalQuestions),
            lastPlayedDate: todayDateStr,
            lastPlayedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        console.log(`[EVENT] limite diário de ${maxDailyMatches} partidas atingido: userId=${userId}`)

        return {
          alreadyProcessed: false,
          eventPointsAdded: 0,
          team: userTeam || null,
          teamName: userTeam === 'porto' ? 'Equipa Porto' : userTeam === 'lisboa' ? 'Equipa Lisboa' : null,
          teamPointsAdded: 0,
          dailyLimitReached: true,
          dailyMatchesToday: todayCount,
          matchesToday: todayCount,
          maxDailyMatches,
          newTotalXp,
          newTotalCoins,
          newLevel,
          leveledUp,
          xpReward: earnedXp,
          coinReward: totalAwardedCoins,
          message: `Limite diário de ${maxDailyMatches} partidas de evento atingido hoje. O teu XP e moedas normais foram creditados a 100%!`,
        }
      }

      // Dentro do limite de 10 partidas válidas do dia:
      const newDailyCount = todayCount + 1
      const currentEventPoints = Number(pData.eventPoints ?? pData.points ?? 0)
      const newEventPoints = currentEventPoints + potentialEventPoints
      const countedMatches = Number(pData.countedMatches ?? pData.totalMatches ?? 0) + 1
      const totalMatches = Number(pData.totalMatches ?? pData.countedMatches ?? 0) + 1
      const totalScore = Number(pData.totalScore || 0) + score
      const bestScore = Math.max(Number(pData.bestScore || 0), score)

      transaction.set(
        matchRef,
        {
          id: matchId,
          matchId,
          gameType: 'event',
          eventId: targetEventId,
          eventSlug: eventSlug || (targetEventId === OFFICIAL_PORTO_LISBOA_ID ? 'porto-lisboa-o-grande-duelo' : 'primeiro-desafio-nacional-portugal-em-jogo'),
          userId,
          team: userTeam || null,
          score,
          points: potentialEventPoints,
          eventPoints: potentialEventPoints,
          totalPoints: potentialEventPoints,
          correctAnswers,
          totalQuestions,
          date: todayDateStr,
          dailyCapReached: false,
          dailyMatchesToday: newDailyCount,
          matchesToday: newDailyCount,
          status: 'completed',
          processed: true,
          completedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Registo de xpTransaction para rastreabilidade de origem (sourceType: 'event')
      const xpTxRef = userRef.collection('xp_transactions').doc(matchId)
      transaction.set(
        xpTxRef,
        {
          id: `event_${matchId}`,
          userId,
          amount: earnedXp,
          sourceType: 'event',
          sourceId: targetEventId,
          matchId,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Se for o Grande Duelo e o utilizador tiver equipa, somar pontos da equipa atomicamente
      if (targetEventId === OFFICIAL_PORTO_LISBOA_ID && userTeam) {
        transaction.update(
          eventDocRef,
          {
            [`teams.${userTeam}.points`]: FieldValue.increment(potentialEventPoints),
            [`teams.${userTeam}.matchesPlayed`]: FieldValue.increment(1),
            totalMatches: FieldValue.increment(1),
            totalPoints: FieldValue.increment(potentialEventPoints),
            updatedAt: FieldValue.serverTimestamp(),
          }
        )
      }

      transaction.set(
        participantRef,
        {
          userId,
          eventId: targetEventId,
          displayName,
          photoURL,
          avatar: photoURL,
          district,
          distrito: district,
          team: userTeam || null,
          totalPoints: newEventPoints,
          eventPoints: newEventPoints,
          points: newEventPoints,
          gamesPlayed: countedMatches,
          countedMatches,
          totalMatches,
          matchesToday: newDailyCount,
          totalScore,
          bestScore,
          correctAnswers: FieldValue.increment(correctAnswers),
          incorrectAnswers: FieldValue.increment(Math.max(0, totalQuestions - correctAnswers)),
          questionsAnswered: FieldValue.increment(totalQuestions),
          dailyMatches: {
            ...dailyMatches,
            [todayDateStr]: newDailyCount,
          },
          lastPlayedDate: todayDateStr,
          lastPlayedAt: FieldValue.serverTimestamp(),
          createdAt: pData.createdAt || FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      console.log(`[GAME_COMPLETE]\nuid=${userId}\nmatchId=${matchId}\nxpBefore=${currentXp}\nxpEarned=${earnedXp}\nxpAfter=${newTotalXp}\npersisted=true`)
      console.log(`[EVENT] resultado gravado: matchId=${matchId}, eventPointsAdded=${potentialEventPoints}, team=${userTeam}, xpAdded=${earnedXp}, coinsAdded=${totalAwardedCoins}`)
      console.log(`[EVENT] participante atualizado: userId=${userId}, newPoints=${newEventPoints}, matches=${countedMatches}`)
      console.log(`[EVENT] ranking e conta global atualizados`)

      return {
        alreadyProcessed: false,
        eventPointsAdded: potentialEventPoints,
        newEventPoints,
        points: newEventPoints,
        eventPoints: newEventPoints,
        totalPoints: newEventPoints,
        gamesPlayed: countedMatches,
        team: userTeam || null,
        teamName: userTeam === 'porto' ? 'Equipa Porto' : userTeam === 'lisboa' ? 'Equipa Lisboa' : null,
        teamPointsAdded: potentialEventPoints,
        dailyMatchesToday: newDailyCount,
        matchesToday: newDailyCount,
        countedMatches,
        totalMatches,
        maxDailyMatches,
        dailyLimitReached: newDailyCount >= maxDailyMatches,
        oldXp: currentXp,
        newTotalXp,
        oldCoins: currentCoins,
        newTotalCoins,
        oldLevel,
        newLevel,
        leveledUp,
        xpReward: earnedXp,
        coinReward: totalAwardedCoins,
        message: userTeam
          ? `+${potentialEventPoints} Pontos para ti e para a tua Equipa ${userTeam === 'porto' ? 'Porto 🔵' : 'Lisboa 🔴'}! (+${earnedXp} XP, +${totalAwardedCoins} Moedas)`
          : `+${potentialEventPoints} Pontos de Evento creditados com sucesso! (+${earnedXp} XP, +${totalAwardedCoins} Moedas)`,
      }
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('[API /api/events/record-match ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao registar partida no evento.' },
      { status: 500 }
    )
  }
}
