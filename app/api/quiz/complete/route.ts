import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { calculateLevelProgress } from '@/lib/progression'
import { ECONOMY_CONFIG, calculateLevelUpCoinReward, calculateMatchCoinReward } from '@/lib/economy'
import { QuestionRegistry } from '@/lib/question-system/registry'
import {
  computeCategoryBreakdownFromAnswers,
  type MatchAnswerPayload,
} from '@/lib/category-registry'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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
    const body = await request.json().catch(() => ({}))
    const { gameId, categorySlug = 'portugal', answers = [], timeSpent = 0 } = body

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Respostas inválidas.' }, { status: 400 })
    }

    // 1. Validação Server-Side das Respostas e Perguntas
    const registry = QuestionRegistry.getInstance()
    let correctCount = 0
    let score = 0
    const answeredIds: string[] = []
    const enrichedAnswers: MatchAnswerPayload[] = []

    for (const ans of answers) {
      const qId = String(ans.questionId)
      answeredIds.push(qId)
      const canonicalQ = registry.getQuestionById(qId)

      let isCorrect = false
      if (canonicalQ) {
        const correctIndex = typeof canonicalQ.correctAnswer === 'number' ? canonicalQ.correctAnswer : (typeof (canonicalQ as any).respostaCorreta === 'number' ? (canonicalQ as any).respostaCorreta : 0)
        const letters = ['A', 'B', 'C', 'D']
        const correctLetter = letters[correctIndex] || 'A'
        isCorrect = ans.selectedOption === correctLetter
      } else {
        // Fallback se não encontrada no registry (usar validação do payload)
        isCorrect = Boolean(ans.isCorrect)
      }

      if (isCorrect) {
        correctCount++
        score += 100
      }

      enrichedAnswers.push({
        questionId: qId,
        categoryId: ans.categoryId || canonicalQ?.category || categorySlug,
        subcategory: canonicalQ?.subcategory,
        prompt: canonicalQ?.question,
        selectedOption: ans.selectedOption,
        isCorrect,
      })
    }

    // 2. Cálculo Server-Side de XP e Moedas
    // 100 XP por resposta certa + bónus de perfeição
    const baseWinXp = correctCount * 100
    const perfectBonus = correctCount === answers.length && answers.length >= 10 ? 250 : 0
    const xpReward = baseWinXp + perfectBonus

    const coinReward = calculateMatchCoinReward({
      correctCount,
      totalQuestions: answers.length || 1,
      bestStreak: 1,
      difficulty: 1,
    })

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const publicProfileRef = db.collection('publicProfiles').doc(userId)
    const gameRef = gameId ? db.collection('games').doc(String(gameId)) : null

    const result = await db.runTransaction(async (transaction) => {
      // 2.1 Verificação de idempotência: se o jogo já foi processado, não duplicar recompensas
      if (gameRef) {
        const gameSnap = await transaction.get(gameRef)
        if (gameSnap.exists && gameSnap.data()?.processed === true) {
          const gData = gameSnap.data() || {}
          return {
            newTotalXp: gData.newTotalXp || 0,
            newTotalCoins: gData.newTotalCoins || 0,
            newLevel: gData.newLevel || 1,
            leveledUp: false,
            xpReward: 0,
            coinReward: 0,
            correctCount,
            totalCount: answers.length,
            alreadyProcessed: true,
          }
        }
      }

      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        throw new Error('Utilizador não registado no sistema.')
      }

      const userData = userSnap.data() || {}
      const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
      const currentCoins = typeof userData.coins === 'number' ? userData.coins : typeof userData.euros === 'number' ? userData.euros : 50
      const oldLevel = typeof userData.level === 'number' ? userData.level : 1

      const newTotalXp = currentXp + xpReward
      const levelProgress = calculateLevelProgress(newTotalXp)
      const newLevel = levelProgress.currentLevel.level
      const leveledUp = newLevel > oldLevel
      const levelUpCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0

      const totalAwardedCoins = coinReward + levelUpCoins
      const newTotalCoins = currentCoins + totalAwardedCoins

      const catStats = userData.categoryStats || {}
      const categoryBreakdown = computeCategoryBreakdownFromAnswers(enrichedAnswers, categorySlug)
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

      const updatePayload: Record<string, any> = {
        xp: newTotalXp,
        coins: newTotalCoins,
        euros: newTotalCoins,
        level: newLevel,
        gamesPlayed: FieldValue.increment(1),
        questionsAnswered: FieldValue.increment(answers.length),
        correctAnswers: FieldValue.increment(correctCount),
        incorrectAnswers: FieldValue.increment(answers.length - correctCount),
        totalQuestions: FieldValue.increment(answers.length),
        lastPlayedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      for (const [catKey, catData] of Object.entries(updatedCategoryStatsMap)) {
        updatePayload[`categoryStats.${catKey}`] = catData
      }

      if (answeredIds.length > 0) {
        updatePayload.answeredQuestionIds = FieldValue.arrayUnion(...answeredIds.slice(0, 100))
      }

      transaction.update(userRef, updatePayload)

      // Atualizar Perfil Público (Single Source of Truth para Rankings e Pesquisas)
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          displayName: userData.displayName || 'Jogador',
          photoURL: userData.photoURL || null,
          district: userData.district || 'Portugal',
          level: newLevel,
          xp: newTotalXp,
          updatedAt: Date.now(),
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
          reason: `Quiz: ${categorySlug} (${correctCount}/${answers.length} corretas)`,
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      // Marcar partida como processada atomicamente
      if (gameRef) {
        transaction.set(
          gameRef,
          {
            id: String(gameId),
            userId,
            category: categorySlug,
            correctAnswers: correctCount,
            totalQuestions: answers.length,
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
      }

      return {
        newTotalXp,
        newTotalCoins,
        newLevel,
        leveledUp,
        xpReward,
        coinReward: totalAwardedCoins,
        correctCount,
        totalCount: answers.length,
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
