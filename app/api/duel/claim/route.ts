import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { calculateLevelProgress } from '@/lib/progression'
import { ECONOMY_CONFIG, calculateLevelUpCoinReward } from '@/lib/economy'
import { extractUserXp } from '@/lib/economy-helpers'
import { computeCategoryBreakdownFromAnswers, type MatchAnswerPayload } from '@/lib/category-registry'
import type { DuelDocument, DuelPlayerData } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let duelIdForLog = 'unknown'
  let userIdForLog = 'unknown'

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const userId = decodedToken.uid
    userIdForLog = userId
    const body = await request.json().catch(() => ({}))
    const { duelId } = body
    duelIdForLog = duelId || 'unknown'

    if (!duelId) {
      return NextResponse.json({ error: 'duelId obrigatório.' }, { status: 400 })
    }

    console.log(`[DUEL_FINISH_STARTED] duelId=${duelId} playerId=${userId}`)

    const db = getAdminFirestore()
    const duelRef = db.collection('duels').doc(duelId)
    const userRef = db.collection('users').doc(userId)
    const publicProfileRef = db.collection('publicProfiles').doc(userId)
    const matchRewardRef = userRef.collection('match_rewards').doc(duelId)

    const rewardResult = await db.runTransaction(async (transaction: any) => {
      // 1. Leituras atómicas concorrentes no início da transação
      const [duelSnap, userSnap, publicProfileSnap, matchRewardSnap] = await Promise.all([
        transaction.get(duelRef),
        transaction.get(userRef),
        transaction.get(publicProfileRef),
        transaction.get(matchRewardRef),
      ])

      if (!duelSnap.exists) {
        throw new Error('Duelo não encontrado.')
      }

      const duel = duelSnap.data() as DuelDocument
      const isPlayerA = duel.playerA?.uid === userId
      const isPlayerB = duel.playerB?.uid === userId

      if (!isPlayerA && !isPlayerB) {
        throw new Error('Não pertences a este duelo.')
      }

      const player: DuelPlayerData = isPlayerA ? duel.playerA : duel.playerB!
      const opponent: DuelPlayerData | null = isPlayerA ? (duel.playerB || null) : duel.playerA

      // 2. Resolução defensiva de finalização caso ambos tenham terminado mas status ainda não seja 'finished'
      let winnerUid = duel.winnerUid
      let winnerReason = duel.winnerReason
      let isDuelFinished = duel.status === 'finished'

      const myFinished = player.finished || (player.answers && player.answers.length >= (duel.questions?.length || 10))
      const oppFinished = opponent ? (opponent.finished || (opponent.answers && opponent.answers.length >= (duel.questions?.length || 10))) : false

      if (!isDuelFinished) {
        if (myFinished && oppFinished) {
          isDuelFinished = true
          const scoreA = duel.playerA?.score || 0
          const scoreB = duel.playerB?.score || 0
          const timeA = (duel.playerA?.answers || []).reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0)
          const timeB = (duel.playerB?.answers || []).reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0)

          if (scoreA > scoreB) {
            winnerUid = duel.playerA.uid
            winnerReason = 'score'
          } else if (scoreB > scoreA) {
            winnerUid = duel.playerB?.uid || 'opponent'
            winnerReason = 'score'
          } else if (timeA < timeB) {
            winnerUid = duel.playerA.uid
            winnerReason = 'score'
          } else if (timeB < timeA) {
            winnerUid = duel.playerB?.uid || 'opponent'
            winnerReason = 'score'
          } else {
            winnerUid = null
            winnerReason = 'draw'
          }
        } else if (winnerReason === 'opponent_forfeit' || winnerReason === 'surrender' || duel.abandonedBy) {
          isDuelFinished = true
        } else {
          // Partida ainda a decorrer e adversário dentro do tempo
          throw new Error('Partida ainda em curso. Aguarda a conclusão do adversário.')
        }
      }

      const isWinner = Boolean(winnerUid && winnerUid === userId)
      const isDraw = winnerUid === null
      const isLoser = !isWinner && !isDraw

      const winnerId = winnerUid || (isDraw ? 'draw' : 'unknown')
      const loserId = isDraw ? 'draw' : isWinner ? (opponent?.uid || 'opponent') : userId
      const winnerScore = isWinner ? player.score : (opponent?.score || 0)
      const loserScore = isWinner ? (opponent?.score || 0) : player.score

      console.log(
        `[DUEL_RESULT_RESOLVED] winnerId=${winnerId} loserId=${loserId} winnerScore=${winnerScore} loserScore=${loserScore}`
      )

      // 3. Verificação estrita de idempotência
      const duelRewardsClaimed = duel.rewardsClaimed || {}
      const savedDuelRewards = (duel as any).rewards || {}
      const existingSavedReward = savedDuelRewards[userId]

      const userData = userSnap.exists ? userSnap.data() || {} : {}
      const currentXp = extractUserXp(userData, 0)
      const currentCoins =
        typeof userData.coins === 'number'
          ? userData.coins
          : typeof userData.euros === 'number'
          ? userData.euros
          : 50
      const currentRating = typeof userData.rating === 'number' ? userData.rating : 1000
      const currentLevelProg = calculateLevelProgress(currentXp)
      const oldLevel = currentLevelProg.currentLevel.level

      if (duelRewardsClaimed[userId] || matchRewardSnap.exists || existingSavedReward) {
        const persistedXp =
          existingSavedReward?.xp ??
          matchRewardSnap.data()?.xpEarned ??
          (isWinner ? 300 + (player.correctCount || 0) * 15 : isDraw ? 150 + (player.correctCount || 0) * 15 : 100 + (player.correctCount || 0) * 15)
        const persistedCoins =
          existingSavedReward?.coins ??
          matchRewardSnap.data()?.coinsEarned ??
          (isWinner ? 15 + ((player.correctCount || 0) === 10 ? 10 : 0) + (player.correctCount || 0) : isDraw ? 10 + (player.correctCount || 0) : 5 + (player.correctCount || 0))

        const txId = existingSavedReward?.transactionId || `1v1_${duelId}_${userId}`
        console.log(`[DUEL_REWARD_ALREADY_PROCESSED] playerId=${userId} transactionId=${txId}`)

        return {
          xp: persistedXp,
          coins: persistedCoins,
          isWinner,
          isDraw,
          isLoser,
          oldXp: existingSavedReward?.oldXp ?? currentXp,
          newXp: existingSavedReward?.newXp ?? currentXp,
          oldCoins: existingSavedReward?.oldCoins ?? currentCoins,
          newCoins: existingSavedReward?.newCoins ?? currentCoins,
          oldLevel: existingSavedReward?.oldLevel ?? oldLevel,
          newLevel: existingSavedReward?.newLevel ?? currentLevelProg.currentLevel.level,
          leveledUp: Boolean(existingSavedReward?.leveledUp),
          levelTitle: currentLevelProg.currentLevel.title,
          alreadyClaimed: true,
          transactionId: txId,
        }
      }

      // 4. Cálculo Determinístico Server-Side das Recompensas
      // 4.1 XP: Base de conclusão/resultado + mérito de respostas certas
      const correctCount = Math.max(0, Math.min(10, Number(player.correctCount) || 0))
      const performanceXp = correctCount * 15
      const baseOutcomeXp = isWinner ? 300 : isDraw ? 150 : 100
      const xpReward = baseOutcomeXp + performanceXp

      // 4.2 € Acorda Virtual: Base por resultado + mérito de respostas certas + bónus de 100%
      const baseWinCoins = ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS // 15
      const perfectScoreBonus = correctCount === 10 ? ECONOMY_CONFIG.MATCH_REWARDS.PERFECT_SCORE_BONUS : 0 // 10
      const performanceCoins = Math.round(correctCount * 1) // +1 moeda por acerto
      const baseCoinReward = isWinner
        ? baseWinCoins + perfectScoreBonus + performanceCoins
        : isDraw
        ? 10 + performanceCoins
        : 5 + performanceCoins // Derrotado recebe participação garantida + acertos!

      const reasonStr = isWinner
        ? `⚔️ Vitória em Duelo 1v1 (${duel.code})`
        : isDraw
        ? `🤝 Empate em Duelo 1v1 (${duel.code})`
        : `💪 Participação em Duelo 1v1 (${duel.code})`

      console.log(
        `[DUEL_REWARD_CALCULATED] playerId=${userId} xp=${xpReward} acordaVirtual=${baseCoinReward} reason="${reasonStr}"`
      )

      // 4.3 Cálculo de Level Up e Moedas de Progressão
      const newTotalXp = currentXp + xpReward
      const nextLevelProg = calculateLevelProgress(newTotalXp)
      const newLevel = nextLevelProg.currentLevel.level
      const leveledUp = newLevel > oldLevel
      const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0
      const totalAwardedCoins = baseCoinReward + levelUpCoins
      const newTotalCoins = currentCoins + totalAwardedCoins

      const ratingDelta = isDraw ? 0 : isWinner ? +18 : -14
      const nextRating = Math.max(500, Math.min(3000, currentRating + ratingDelta))

      const transactionId = `1v1_${duelId}_${userId}`

      // 5. Atualização do documento do Duelo
      const duelUpdates: Record<string, any> = {
        [`rewardsClaimed.${userId}`]: true,
        [`rewards.${userId}`]: {
          xp: xpReward,
          coins: totalAwardedCoins,
          isWinner,
          isDraw,
          isLoser,
          oldXp: currentXp,
          newXp: newTotalXp,
          oldCoins: currentCoins,
          newCoins: newTotalCoins,
          oldLevel,
          newLevel,
          leveledUp,
          levelTitle: nextLevelProg.currentLevel.title,
          transactionId,
          processedAt: Date.now(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (duel.status !== 'finished') {
        duelUpdates.status = 'finished'
        duelUpdates.winnerUid = winnerUid
        duelUpdates.winnerReason = winnerReason
        duelUpdates.finishedAt = duel.finishedAt || Date.now()
      }

      transaction.update(duelRef, duelUpdates)

      // 6. Atualização do Perfil Global do Jogador (`users/${userId}`)
      if (userSnap.exists) {
        const questionsList = Array.isArray(duel.questions) ? duel.questions : []
        const duelAnswers: MatchAnswerPayload[] = []
        for (let i = 0; i < questionsList.length; i++) {
          const q: any = questionsList[i]
          const ansObj = player.answers ? (Array.isArray(player.answers) ? player.answers[i] : player.answers[q?.id || i]) : undefined
          const isAnsCorrect = ansObj ? Boolean(ansObj.isCorrect) : false
          duelAnswers.push({
            questionId: String(q?.id || `duel_${i}`),
            categoryId: q?.category || 'desafio-nacional',
            subcategory: q?.subcategory,
            prompt: q?.question || q?.pergunta,
            isCorrect: isAnsCorrect,
            timeSpentSeconds: ansObj?.timeSpentSeconds,
            isTimeout: ansObj?.status === 'TIMEOUT',
          })
        }

        const validDuelTimes = (Array.isArray(player.answers) ? player.answers : [])
          .filter(
            (a) =>
              a &&
              a.status !== 'TIMEOUT' &&
              typeof a.timeSpentSeconds === 'number' &&
              !isNaN(a.timeSpentSeconds) &&
              a.timeSpentSeconds >= 0.3 &&
              a.timeSpentSeconds <= 60,
          )
          .map((a) => a.timeSpentSeconds)
        const totalDuelResponseTime = validDuelTimes.reduce((acc, t) => acc + t, 0)
        const validDuelResponseCount = validDuelTimes.length

        const existingCatStats = (userData.categoryStats as Record<string, any>) || {}
        const categoryBreakdown = computeCategoryBreakdownFromAnswers(duelAnswers, 'desafio-nacional')
        const updatedCategoryStatsMap: Record<string, any> = { ...existingCatStats }

        for (const [catKey, inc] of Object.entries(categoryBreakdown)) {
          const curCat = existingCatStats[catKey] || {
            totalQuestions: 0,
            correctAnswers: 0,
            total: 0,
            correct: 0,
            gamesPlayed: 0,
            score: 0,
          }
          const newTotal = (curCat.totalQuestions || curCat.total || 0) + inc.totalQuestions
          const newCorrect = (curCat.correctAnswers || curCat.correct || 0) + inc.correctAnswers
          const newGames = (curCat.gamesPlayed || 0) + (inc.gamesPlayed || 1)
          const newScore = (curCat.score || 0) + inc.score

          updatedCategoryStatsMap[catKey] = {
            totalQuestions: newTotal,
            correctAnswers: newCorrect,
            total: newTotal,
            correct: newCorrect,
            gamesPlayed: newGames,
            score: newScore,
            accuracy: newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0,
          }
        }

        const userUpdates: Record<string, any> = {
          xp: newTotalXp,
          coins: newTotalCoins,
          euros: newTotalCoins,
          acordas: newTotalCoins,
          moedas: newTotalCoins,
          level: newLevel,
          rating: nextRating,
          gamesPlayed: FieldValue.increment(1),
          wins: FieldValue.increment(isWinner ? 1 : 0),
          losses: FieldValue.increment(isLoser ? 1 : 0),
          draws: FieldValue.increment(isDraw ? 1 : 0),
          wins1v1: FieldValue.increment(isWinner ? 1 : 0),
          losses1v1: FieldValue.increment(isLoser ? 1 : 0),
          draws1v1: FieldValue.increment(isDraw ? 1 : 0),
          streak: isWinner ? FieldValue.increment(1) : 0,
          totalQuestions: FieldValue.increment(questionsList.length || 10),
          questionsAnswered: FieldValue.increment(questionsList.length || 10),
          correctAnswers: FieldValue.increment(correctCount),
          incorrectAnswers: FieldValue.increment(Math.max(0, (questionsList.length || 10) - correctCount)),
          'multiplayer.wins': FieldValue.increment(isWinner ? 1 : 0),
          'multiplayer.losses': FieldValue.increment(isLoser ? 1 : 0),
          'multiplayer.draws': FieldValue.increment(isDraw ? 1 : 0),
          'multiplayer.gamesPlayed': FieldValue.increment(1),
          'multiplayer.points': FieldValue.increment(player.score || 0),
          'multiplayer.xp': FieldValue.increment(xpReward),
          'stats.totalGames': FieldValue.increment(1),
          'stats.totalScore': FieldValue.increment(player.score || 0),
          'stats.totalXp': FieldValue.increment(xpReward),
          'stats.totalDuels': FieldValue.increment(1),
          'stats.duelsWon': FieldValue.increment(isWinner ? 1 : 0),
          'stats.duelsLost': FieldValue.increment(isLoser ? 1 : 0),
          'stats.duelsDrawn': FieldValue.increment(isDraw ? 1 : 0),
          'stats.duelPoints': FieldValue.increment(player.score || 0),
          'stats.duelXp': FieldValue.increment(xpReward),
          'stats.multiplayerGames': FieldValue.increment(1),
          'stats.multiplayerWins': FieldValue.increment(isWinner ? 1 : 0),
          'stats.multiplayerLosses': FieldValue.increment(isLoser ? 1 : 0),
          'stats.multiplayerDraws': FieldValue.increment(isDraw ? 1 : 0),
          'stats.multiplayerPoints': FieldValue.increment(player.score || 0),
          'stats.multiplayerXp': FieldValue.increment(xpReward),
          lastPlayedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }

        if (validDuelResponseCount > 0) {
          userUpdates['stats.totalResponseTime'] = FieldValue.increment(Number(totalDuelResponseTime.toFixed(1)))
          userUpdates['stats.validResponseTimeCount'] = FieldValue.increment(validDuelResponseCount)
        }

        for (const [catKey, catData] of Object.entries(updatedCategoryStatsMap)) {
          userUpdates[`categoryStats.${catKey}`] = catData
        }

        transaction.update(userRef, userUpdates)

        // Atualizar publicProfiles/${userId}
        transaction.set(
          publicProfileRef,
          {
            uid: userId,
            displayName: userData.displayName || 'Jogador',
            photoURL: userData.photoURL || null,
            district: userData.district || 'Portugal',
            xp: newTotalXp,
            level: newLevel,
            rating: nextRating,
            wins1v1: FieldValue.increment(isWinner ? 1 : 0),
            losses1v1: FieldValue.increment(isLoser ? 1 : 0),
            draws1v1: FieldValue.increment(isDraw ? 1 : 0),
            gamesPlayed: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        )

        // Registar transação financeira
        const txRef = userRef.collection('transactions').doc()
        transaction.set(txRef, {
          id: txRef.id,
          userId,
          type: 'earn',
          amount: totalAwardedCoins,
          reason: reasonStr,
          matchId: duelId,
          createdAt: FieldValue.serverTimestamp(),
        })

        // Registar idempotência de recompensa
        transaction.set(matchRewardRef, {
          matchId: duelId,
          userId,
          gameType: '1v1',
          matchType: 'duel_1v1',
          xpEarned: xpReward,
          coinsEarned: totalAwardedCoins,
          newTotalXp,
          newLevel,
          processedAt: FieldValue.serverTimestamp(),
        })

        // Registar histórico de transação de XP
        const xpTxRef = userRef.collection('xp_transactions').doc(duelId)
        transaction.set(xpTxRef, {
          id: transactionId,
          userId,
          amount: xpReward,
          sourceType: '1v1',
          sourceId: duelId,
          matchId: duelId,
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      console.log(
        `[DUEL_REWARD_PERSISTED] playerId=${userId} xp=${xpReward} acordaVirtual=${totalAwardedCoins} transactionId=${transactionId}`
      )
      console.log(
        `[GAME_COMPLETE]\nuid=${userId}\nmatchId=${duelId}\nxpBefore=${currentXp}\nxpEarned=${xpReward}\nxpAfter=${newTotalXp}\npersisted=true`
      )

      return {
        xp: xpReward,
        coins: totalAwardedCoins,
        isWinner,
        isDraw,
        isLoser,
        oldXp: currentXp,
        newXp: newTotalXp,
        oldCoins: currentCoins,
        newCoins: newTotalCoins,
        oldLevel,
        newLevel,
        leveledUp,
        levelTitle: nextLevelProg.currentLevel.title,
        ratingDelta,
        newRating: nextRating,
        alreadyClaimed: false,
        transactionId,
      }
    })

    return NextResponse.json({
      success: true,
      data: rewardResult,
      // Propriedades raiz para compatibilidade total com clientes e testes
      xp: rewardResult.xp,
      xpEarned: rewardResult.xp,
      coins: rewardResult.coins,
      coinsEarned: rewardResult.coins,
      euros: rewardResult.coins,
      isWinner: rewardResult.isWinner,
      isDraw: rewardResult.isDraw,
      isLoser: rewardResult.isLoser,
      oldXp: rewardResult.oldXp,
      newXp: rewardResult.newXp,
      oldCoins: rewardResult.oldCoins,
      newCoins: rewardResult.newCoins,
      oldEuros: rewardResult.oldCoins,
      newEuros: rewardResult.newCoins,
      oldLevel: rewardResult.oldLevel,
      newLevel: rewardResult.newLevel,
      leveledUp: rewardResult.leveledUp,
      levelTitle: rewardResult.levelTitle,
      ratingDelta: rewardResult.ratingDelta,
      newRating: rewardResult.newRating,
      alreadyClaimed: rewardResult.alreadyClaimed,
      transactionId: rewardResult.transactionId,
    })
  } catch (error: any) {
    console.error(`[DUEL_REWARD_FAILED] duelId=${duelIdForLog} playerId=${userIdForLog} error=${error.message || error}`)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao atribuir recompensas do duelo.',
      },
      { status: error.message?.includes('em curso') ? 409 : 500 }
    )
  }
}
