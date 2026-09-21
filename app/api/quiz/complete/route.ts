import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { calculateLevelProgress } from '@/lib/progression'
import { ECONOMY_CONFIG, calculateLevelUpCoinReward, calculateMatchCoinReward } from '@/lib/economy'
import { QuestionRegistry } from '@/lib/question-system/registry'
import {
  computeCategoryBreakdownFromAnswers,
  getCanonicalCategory,
  type MatchAnswerPayload,
} from '@/lib/category-registry'
import { extractUserXp, extractUserCoins } from '@/lib/economy-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Token em falta.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const {
      gameId,
      categorySlug = 'portugal',
      categoryName = 'Portugal',
      matchType = 'solo_quiz',
      answers = [],
      score: clientScore = 0,
      correctCount: clientCorrectCount,
      totalQuestions: clientTotalQuestions,
      bestStreak = 0,
      difficultyMultiplier = 1,
      district,
      city,
      timeSpent = 0,
    } = body

    if (!gameId) {
      return NextResponse.json({ error: 'gameId obrigatório.' }, { status: 400 })
    }

    // 1. Validação e Enriquecimento das Respostas
    let correctCount = 0
    let evaluatedScore = 0
    const answeredIds: string[] = []
    const enrichedAnswers: MatchAnswerPayload[] = []

    let registry: QuestionRegistry | null = null
    try {
      registry = QuestionRegistry.getInstance()
    } catch {
      registry = null
    }

    if (Array.isArray(answers) && answers.length > 0) {
      for (const ans of answers) {
        const qId = String(ans.questionId || '')
        if (qId) answeredIds.push(qId)

        let isCorrect = false
        const canonicalQ = registry ? registry.getQuestionById(qId) : null

        if (canonicalQ) {
          const correctIndex =
            typeof canonicalQ.correctAnswer === 'number'
              ? canonicalQ.correctAnswer
              : typeof (canonicalQ as any).respostaCorreta === 'number'
              ? (canonicalQ as any).respostaCorreta
              : 0
          const letters = ['A', 'B', 'C', 'D']
          const correctLetter = letters[correctIndex] || 'A'
          isCorrect = ans.selectedOption === correctLetter
        } else {
          isCorrect = Boolean(ans.isCorrect)
        }

        if (isCorrect) {
          correctCount++
          evaluatedScore += 100
        }

        enrichedAnswers.push({
          questionId: qId,
          categoryId: ans.categoryId || canonicalQ?.category || categorySlug,
          subcategory: canonicalQ?.subcategory,
          prompt: canonicalQ?.question || ans.prompt,
          selectedOption: ans.selectedOption,
          isCorrect,
          timeSpentSeconds: ans.timeSpentSeconds,
        })
      }
    }

    const finalCorrectCount =
      enrichedAnswers.length > 0
        ? correctCount
        : typeof clientCorrectCount === 'number'
        ? Math.max(0, clientCorrectCount)
        : 0

    const finalTotalQuestions =
      enrichedAnswers.length > 0
        ? enrichedAnswers.length
        : typeof clientTotalQuestions === 'number' && clientTotalQuestions > 0
        ? clientTotalQuestions
        : 10

    const finalScore =
      evaluatedScore > 0
        ? evaluatedScore
        : typeof clientScore === 'number' && clientScore >= 0
        ? clientScore
        : finalCorrectCount * 100

    // 2. Cálculo Server-Side Canónico de XP e Moedas
    const effectiveDiffMult =
      typeof difficultyMultiplier === 'number' && difficultyMultiplier > 0
        ? difficultyMultiplier
        : 1
    const baseMatchXp = finalCorrectCount * 50 + Math.round(finalScore / 10)
    const xpReward = Math.max(10, Math.round(baseMatchXp * effectiveDiffMult))

    const coinReward = calculateMatchCoinReward({
      correctCount: finalCorrectCount,
      totalQuestions: finalTotalQuestions,
      bestStreak: bestStreak || 0,
      difficulty: effectiveDiffMult,
    })

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const publicProfileRef = db.collection('publicProfiles').doc(userId)
    const gameRef = db.collection('games').doc(String(gameId))
    const rewardRef = userRef.collection('match_rewards').doc(String(gameId))

    const result = await db.runTransaction(async (transaction: any) => {
      // 2.1 Verificação de Idempotência: Se o jogo ou recompensa já foi processado
      const [gameSnap, rewardSnap, userSnap] = await Promise.all([
        transaction.get(gameRef),
        transaction.get(rewardRef),
        transaction.get(userRef),
      ])

      if (gameSnap.exists && gameSnap.data()?.processed === true) {
        const gData = gameSnap.data() || {}
        const currentXp = userSnap.exists ? extractUserXp(userSnap.data(), 0) : gData.newTotalXp || 0
        return {
          alreadyProcessed: true,
          matchId: String(gameId),
          newTotalXp: gData.newTotalXp || currentXp,
          newTotalCoins: gData.newTotalCoins || 0,
          newLevel: gData.newLevel || 1,
          oldXp: currentXp,
          oldCoins: gData.newTotalCoins || 0,
          oldLevel: gData.newLevel || 1,
          leveledUp: false,
          xpReward: 0,
          coinReward: 0,
          newStreak: 1,
          oldStreak: 1,
          correctCount: finalCorrectCount,
          totalCount: finalTotalQuestions,
        }
      }

      if (rewardSnap.exists) {
        const rData = rewardSnap.data() || {}
        const currentXp = userSnap.exists ? extractUserXp(userSnap.data(), 0) : rData.newTotalXp || 0
        return {
          alreadyProcessed: true,
          matchId: String(gameId),
          newTotalXp: rData.newTotalXp || currentXp,
          newTotalCoins: rData.newTotalCoins || 0,
          newLevel: rData.newLevel || 1,
          oldXp: currentXp,
          oldCoins: rData.newTotalCoins || 0,
          oldLevel: rData.newLevel || 1,
          leveledUp: false,
          xpReward: 0,
          coinReward: 0,
          newStreak: 1,
          oldStreak: 1,
          correctCount: finalCorrectCount,
          totalCount: finalTotalQuestions,
        }
      }

      const userData = userSnap.exists ? userSnap.data() || {} : {}
      const currentXp = extractUserXp(userData, 0)
      const currentCoins = extractUserCoins(userData, ECONOMY_CONFIG.INITIAL_BONUS_COINS)
      const oldLevel = calculateLevelProgress(currentXp).currentLevel.level

      const newTotalXp = currentXp + xpReward
      const levelProgress = calculateLevelProgress(newTotalXp)
      const newLevel = levelProgress.currentLevel.level
      const leveledUp = newLevel > oldLevel
      const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0

      const totalAwardedCoins = coinReward + levelUpCoins
      const newTotalCoins = currentCoins + totalAwardedCoins

      // Sequência Diária (Streak)
      const todayStr = new Date().toISOString().slice(0, 10)
      const lastDate = typeof userData.lastPlayedDate === 'string' ? userData.lastPlayedDate : ''
      const currentStreak = typeof userData.streak === 'number' ? userData.streak : 0
      let nextStreak = currentStreak

      if (lastDate === todayStr) {
        nextStreak = currentStreak > 0 ? currentStreak : 1
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)
        nextStreak = lastDate === yesterdayStr ? currentStreak + 1 : 1
      }

      // Estatísticas de Categorias
      const catStats = userData.categoryStats || {}
      const categoryBreakdown = computeCategoryBreakdownFromAnswers(
        enrichedAnswers.length > 0
          ? enrichedAnswers
          : [
              {
                questionId: 'match_solo',
                categoryId: categorySlug,
                isCorrect: true,
              },
            ],
        categorySlug
      )

      if (enrichedAnswers.length === 0) {
        const canonicalKey = getCanonicalCategory(categorySlug)
        categoryBreakdown[canonicalKey] = {
          totalQuestions: finalTotalQuestions,
          correctAnswers: finalCorrectCount,
          score: finalScore,
          gamesPlayed: 1,
        }
      }

      const updatedCategoryStatsMap: Record<string, any> = { ...catStats }
      for (const [catKey, inc] of Object.entries(categoryBreakdown)) {
        const curCat = catStats[catKey] || {
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
        const newCatScore = (curCat.score || 0) + inc.score

        updatedCategoryStatsMap[catKey] = {
          totalQuestions: newTotal,
          correctAnswers: newCorrect,
          total: newTotal,
          correct: newCorrect,
          gamesPlayed: newGames,
          score: newCatScore,
          accuracy: newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0,
        }
      }

      const userUpdatePayload: Record<string, any> = {
        uid: userId,
        xp: FieldValue.increment(xpReward),
        coins: FieldValue.increment(totalAwardedCoins),
        euros: FieldValue.increment(totalAwardedCoins),
        acordas: FieldValue.increment(totalAwardedCoins),
        moedas: FieldValue.increment(totalAwardedCoins),
        level: newLevel,
        streak: nextStreak,
        lastPlayedDate: todayStr,
        gamesPlayed: FieldValue.increment(1),
        questionsAnswered: FieldValue.increment(finalTotalQuestions),
        correctAnswers: FieldValue.increment(finalCorrectCount),
        incorrectAnswers: FieldValue.increment(Math.max(0, finalTotalQuestions - finalCorrectCount)),
        totalQuestions: FieldValue.increment(finalTotalQuestions),
        'stats.totalGames': FieldValue.increment(1),
        'stats.totalQuestions': FieldValue.increment(finalTotalQuestions),
        'stats.correctAnswers': FieldValue.increment(finalCorrectCount),
        'stats.incorrectAnswers': FieldValue.increment(Math.max(0, finalTotalQuestions - finalCorrectCount)),
        'stats.totalScore': FieldValue.increment(finalScore),
        'stats.totalXp': FieldValue.increment(xpReward),
        lastPlayedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      for (const [catKey, catData] of Object.entries(updatedCategoryStatsMap)) {
        userUpdatePayload[`categoryStats.${catKey}`] = catData
      }

      if (answeredIds.length > 0) {
        userUpdatePayload.answeredQuestionIds = FieldValue.arrayUnion(...answeredIds.slice(0, 100))
      }

      if (matchType === 'conquista_distrito') {
        userUpdatePayload.districtPoints = FieldValue.increment(xpReward)
        userUpdatePayload.districtGamesPlayed = FieldValue.increment(1)
      } else if (matchType === 'desafio_cidade') {
        userUpdatePayload.cityPoints = FieldValue.increment(xpReward)
        userUpdatePayload.cityGamesPlayed = FieldValue.increment(1)
      }

      // Atualizar documento do utilizador (merge: true previne destruição de campos)
      transaction.set(userRef, userUpdatePayload, { merge: true })

      // Atualizar Perfil Público (SSOT para Rankings - Atómico para Concorrência)
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          displayName: userData.displayName || userData.name || decodedToken.name || 'Jogador',
          photoURL: userData.photoURL || userData.avatar || null,
          district: userData.district || district || 'Portugal',
          city: userData.city || city || '',
          level: newLevel,
          xp: FieldValue.increment(xpReward),
          gamesPlayed: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Registar Transação Económica se foram ganhas moedas
      if (totalAwardedCoins > 0) {
        const txRef = userRef.collection('transactions').doc()
        transaction.set(txRef, {
          id: txRef.id,
          userId,
          type: 'earn',
          amount: totalAwardedCoins,
          reason: `Quiz: ${categorySlug} (${finalCorrectCount}/${finalTotalQuestions} corretas)`,
          matchId: String(gameId),
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      // Registar Transação Canónica de XP (Rastreabilidade)
      const xpTxRef = userRef.collection('xp_transactions').doc(String(gameId))
      transaction.set(
        xpTxRef,
        {
          id: `solo_${gameId}`,
          userId,
          amount: xpReward,
          sourceType: 'solo_quiz',
          sourceId: categorySlug,
          matchId: String(gameId),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Registar recompensa para idempotência
      transaction.set(
        rewardRef,
        {
          matchId: String(gameId),
          userId,
          gameType: 'normal',
          matchType,
          categorySlug,
          score: finalScore,
          correctAnswers: finalCorrectCount,
          totalQuestions: finalTotalQuestions,
          xpEarned: xpReward,
          coinsEarned: totalAwardedCoins,
          oldXp: currentXp,
          newTotalXp,
          oldCoins: currentCoins,
          newTotalCoins,
          oldLevel,
          newLevel,
          oldStreak: currentStreak,
          newStreak: nextStreak,
          processed: true,
          processedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Marcar partida como processada atomicamente
      transaction.set(
        gameRef,
        {
          id: String(gameId),
          userId,
          category: categorySlug,
          categoryName,
          correctAnswers: finalCorrectCount,
          totalQuestions: finalTotalQuestions,
          score: finalScore,
          xpEarned: xpReward,
          coinsEarned: totalAwardedCoins,
          newTotalXp,
          newTotalCoins,
          newLevel,
          processed: true,
          processedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Registo de log server-side estrito conforme exigido
      console.log(`[GAME_COMPLETE]\nuid=${userId}\nmatchId=${gameId}\nxpBefore=${currentXp}\nxpEarned=${xpReward}\nxpAfter=${newTotalXp}\npersisted=true`)

      return {
        alreadyProcessed: false,
        matchId: String(gameId),
        newTotalXp,
        newTotalCoins,
        newLevel,
        oldLevel,
        oldXp: currentXp,
        oldCoins: currentCoins,
        leveledUp,
        xpReward,
        coinReward: totalAwardedCoins,
        newStreak: nextStreak,
        oldStreak: currentStreak,
        correctCount: finalCorrectCount,
        totalCount: finalTotalQuestions,
        categoryStats: updatedCategoryStatsMap,
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('[API QUIZ COMPLETE ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar resultado do quiz.' }, { status: 500 })
  }
}
