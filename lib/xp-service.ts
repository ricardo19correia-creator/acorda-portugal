import { doc, runTransaction, serverTimestamp, increment, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'
import { calculateLevelUpCoinReward, ECONOMY_CONFIG } from '@/lib/economy'
import type { UserProfile } from '@/lib/game-data'

export interface AwardMatchRewardParams {
  userId: string
  matchId: string
  categorySlug: string
  categoryName?: string
  matchType?: 'solo_quiz' | 'duel_1v1'
  correctAnswers: number
  totalQuestions: number
  score: number
  bestStreak?: number
  difficultyMultiplier?: number
  isWinner?: boolean
  isDraw?: boolean
  answeredQuestionIds?: string[]
}

export interface MatchRewardOutcome {
  alreadyProcessed: boolean
  matchId: string
  xpEarned: number
  coinsEarned: number
  oldXp: number
  newTotalXp: number
  oldCoins: number
  newTotalCoins: number
  oldLevel: number
  newLevel: number
  leveledUp: boolean
  levelTitle: string
}

// In-memory cache de matchIds processados no cliente para resposta instantânea
const clientProcessedMatches = new Set<string>()

/**
 * Atribui XP e moedas de forma estritamente ATÓMICA e IDEMPOTENTE no Firestore.
 * 
 * Garante:
 * 1. Idempotência por matchId: nunca atribui XP duas vezes para a mesma partida.
 * 2. Transação Firestore segura contra concorrência.
 * 3. Sincronização imediata de cache local (localStorage) e eventos de perfil.
 * 4. Logs forenses estruturados ([GAME], [XP], [PROFILE]).
 */
export async function awardMatchReward(params: AwardMatchRewardParams): Promise<MatchRewardOutcome> {
  const {
    userId,
    matchId,
    categorySlug,
    categoryName = 'Portugal',
    matchType = 'solo_quiz',
    correctAnswers,
    totalQuestions,
    score,
    bestStreak = 0,
    difficultyMultiplier = 1,
    isWinner,
    isDraw,
    answeredQuestionIds = [],
  } = params

  if (!userId || !matchId) {
    throw new Error('userId e matchId são obrigatórios para atribuir recompensa.')
  }

  console.log(`[GAME] MATCH_COMPLETE (id: ${matchId}, type: ${matchType}, correct: ${correctAnswers}/${totalQuestions}, score: ${score})`)

  // 1. Verificação rápida em memória no cliente
  if (clientProcessedMatches.has(matchId)) {
    console.log(`[XP] REWARD_ALREADY_PROCESSED (in-memory matchId: ${matchId})`)
    const savedXp = typeof window !== 'undefined' ? Number(localStorage.getItem('user_xp') || 0) : 0
    const savedCoins = typeof window !== 'undefined' ? Number(localStorage.getItem('user_coins') || 0) : 0
    const prog = calculateLevelProgress(savedXp)
    return {
      alreadyProcessed: true,
      matchId,
      xpEarned: 0,
      coinsEarned: 0,
      oldXp: savedXp,
      newTotalXp: savedXp,
      oldCoins: savedCoins,
      newTotalCoins: savedCoins,
      oldLevel: prog.currentLevel.level,
      newLevel: prog.currentLevel.level,
      leveledUp: false,
      levelTitle: prog.currentLevel.title,
    }
  }

  // 2. Cálculo determinístico da recompensa
  let calculatedXp = 0
  let calculatedCoins = 0

  if (matchType === 'duel_1v1') {
    calculatedXp = isWinner ? 300 : isDraw ? 150 : 100
    const baseWinCoins = ECONOMY_CONFIG.MATCH_REWARDS.BASE_WIN_COINS
    calculatedCoins = isWinner ? baseWinCoins + ECONOMY_CONFIG.MATCH_REWARDS.PERFECT_SCORE_BONUS : isDraw ? baseWinCoins : 5
  } else {
    // Solo Quiz
    const baseMatchXp = correctAnswers * 50 + Math.round(score / 10)
    calculatedXp = Math.max(10, Math.round(baseMatchXp * difficultyMultiplier))

    const baseWinCoins = Math.round(correctAnswers * ECONOMY_CONFIG.QUIZ_REWARDS.COINS_PER_CORRECT_ANSWER)
    const streakBonus = bestStreak >= 5 ? ECONOMY_CONFIG.STREAK_BONUSES.STREAK_5 : 0
    calculatedCoins = baseWinCoins + streakBonus
  }

  console.log(`[XP] CALCULATED (xp: +${calculatedXp}, coins: +${calculatedCoins}, matchId: ${matchId})`)
  console.log(`[XP] PERSIST_START (userId: ${userId}, matchId: ${matchId})`)

  const userRef = doc(db, 'users', userId)
  const rewardRef = doc(db, 'users', userId, 'match_rewards', matchId)
  const publicProfileRef = doc(db, 'publicProfiles', userId)
  const gameRef = doc(db, 'games', matchId)

  try {
    const outcome = await runTransaction(db, async (transaction) => {
      // A. Verificar idempotência no Firestore
      const rewardSnap = await transaction.get(rewardRef)
      if (rewardSnap.exists()) {
        const rData = rewardSnap.data() || {}
        console.log(`[XP] REWARD_ALREADY_PROCESSED (firestore matchId: ${matchId})`)
        return {
          alreadyProcessed: true,
          matchId,
          xpEarned: 0,
          coinsEarned: 0,
          oldXp: rData.newTotalXp || 0,
          newTotalXp: rData.newTotalXp || 0,
          oldCoins: rData.newTotalCoins || 0,
          newTotalCoins: rData.newTotalCoins || 0,
          oldLevel: rData.newLevel || 1,
          newLevel: rData.newLevel || 1,
          leveledUp: false,
          levelTitle: '',
        } as MatchRewardOutcome
      }

      // B. Ler utilizador atual
      const userSnap = await transaction.get(userRef)
      const userData = userSnap.exists() ? (userSnap.data() as Partial<UserProfile>) : {}

      const currentXp = typeof userData.xp === 'number' && !isNaN(userData.xp) ? Math.max(0, userData.xp) : 0
      const currentCoins = typeof userData.coins === 'number' ? userData.coins : (typeof userData.euros === 'number' ? userData.euros : 50)
      const oldLevel = typeof userData.level === 'number' ? userData.level : calculateLevelProgress(currentXp).currentLevel.level

      // C. Novo Total e Subida de Nível
      const nextTotalXp = currentXp + calculatedXp
      const levelProg = calculateLevelProgress(nextTotalXp)
      const newLevel = levelProg.currentLevel.level
      const leveledUp = newLevel > oldLevel

      const levelUpBonusCoins = leveledUp ? calculateLevelUpCoinReward(oldLevel, newLevel) : 0
      const totalAwardedCoins = calculatedCoins + levelUpBonusCoins
      const nextTotalCoins = currentCoins + totalAwardedCoins

      // D. Atualização estatística de categorias
      const existingCategoryStats = (userData as any).categoryStats || {}
      const curCat = existingCategoryStats[categorySlug] || { totalQuestions: 0, correctAnswers: 0, gamesPlayed: 0, score: 0 }
      const updatedCat = {
        totalQuestions: (curCat.totalQuestions || 0) + totalQuestions,
        correctAnswers: (curCat.correctAnswers || 0) + correctAnswers,
        gamesPlayed: (curCat.gamesPlayed || 0) + 1,
        score: (curCat.score || 0) + score,
      }

      // E. Registar documento de recompensa única (Garante idempotência absoluta)
      transaction.set(rewardRef, {
        matchId,
        userId,
        matchType,
        categorySlug,
        score,
        correctAnswers,
        totalQuestions,
        xpEarned: calculatedXp,
        coinsEarned: totalAwardedCoins,
        oldXp: currentXp,
        newTotalXp: nextTotalXp,
        oldLevel,
        newLevel,
        processedAt: serverTimestamp(),
      })

      // F. Atualizar documento do utilizador
      const userUpdatePayload: Record<string, any> = {
        xp: nextTotalXp,
        coins: nextTotalCoins,
        euros: nextTotalCoins,
        level: newLevel,
        gamesPlayed: increment(1),
        questionsAnswered: increment(totalQuestions),
        correctAnswers: increment(correctAnswers),
        incorrectAnswers: increment(Math.max(0, totalQuestions - correctAnswers)),
        totalQuestions: increment(totalQuestions),
        [`categoryStats.${categorySlug}`]: updatedCat,
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      if (matchType === 'duel_1v1') {
        if (isWinner) userUpdatePayload.wins = increment(1)
        else if (isDraw) userUpdatePayload.draws = increment(1)
        else userUpdatePayload.losses = increment(1)
      }

      if (bestStreak > 0) {
        const currentBest = typeof userData.bestStreak === 'number' ? userData.bestStreak : 0
        if (bestStreak > currentBest) {
          userUpdatePayload.bestStreak = bestStreak
        }
      }

      if (answeredQuestionIds.length > 0) {
        userUpdatePayload.answeredQuestionIds = arrayUnion(...answeredQuestionIds.slice(0, 50))
      }

      transaction.update(userRef, userUpdatePayload)

      // G. Atualizar Perfil Público
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          displayName: userData.displayName || 'Jogador',
          photoURL: userData.photoURL || null,
          district: userData.district || 'Portugal',
          level: newLevel,
          xp: nextTotalXp,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      // H. Registar na coleção games
      transaction.set(
        gameRef,
        {
          id: matchId,
          userId,
          matchType,
          category: categorySlug,
          categoryName,
          score,
          correctAnswers,
          totalQuestions,
          xpEarned: calculatedXp,
          coinsEarned: totalAwardedCoins,
          newTotalXp: nextTotalXp,
          newTotalCoins: nextTotalCoins,
          newLevel,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      )

      return {
        alreadyProcessed: false,
        matchId,
        xpEarned: calculatedXp,
        coinsEarned: totalAwardedCoins,
        oldXp: currentXp,
        newTotalXp: nextTotalXp,
        oldCoins: currentCoins,
        newTotalCoins: nextTotalCoins,
        oldLevel,
        newLevel,
        leveledUp,
        levelTitle: levelProg.currentLevel.title,
      } as MatchRewardOutcome
    })

    clientProcessedMatches.add(matchId)

    // Sincronizar cache local imediatamente
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user_xp', String(outcome.newTotalXp))
        localStorage.setItem('user_level', String(outcome.newLevel))
        localStorage.setItem('user_coins', String(outcome.newTotalCoins))
        localStorage.setItem('user_euros', String(outcome.newTotalCoins))
        localStorage.setItem(`match_reward_${matchId}`, '1')
      } catch {}

      window.dispatchEvent(new CustomEvent('balance_updated', { detail: { coins: outcome.newTotalCoins } }))
      window.dispatchEvent(new CustomEvent('profile_updated', { detail: { xp: outcome.newTotalXp, level: outcome.newLevel } }))
    }

    console.log(`[XP] PERSIST_SUCCESS (matchId: ${matchId}, newTotalXp: ${outcome.newTotalXp}, newLevel: ${outcome.newLevel})`)
    console.log(`[XP] CURRENT_TOTAL (xp: ${outcome.newTotalXp}, level: ${outcome.newLevel})`)
    console.log(`[PROFILE] XP_REFRESH (dispatched events and updated localStorage)`)

    return outcome
  } catch (err: any) {
    console.error(`[XP] PERSIST_ERROR (matchId: ${matchId}):`, err?.message || err)
    throw err
  }
}