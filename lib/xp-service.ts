import { doc, runTransaction, serverTimestamp, increment, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'
import { calculateLevelUpCoinReward, calculateMatchCoinReward, ECONOMY_CONFIG } from '@/lib/economy'
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

export interface UnlockedAchievementInfo {
  id: string
  title: string
  icon: string
  description?: string
}

export interface CompletedMissionInfo {
  id: string
  title: string
  reward: string
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
  oldStreak: number
  newStreak: number
  unlockedAchievements: UnlockedAchievementInfo[]
  completedMissions: CompletedMissionInfo[]
}

// In-memory cache de matchIds processados no cliente para resposta e retry instantâneos
const clientProcessedMatches = new Map<string, MatchRewardOutcome>()

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
    return clientProcessedMatches.get(matchId)!
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

    calculatedCoins = calculateMatchCoinReward({
      correctCount: correctAnswers,
      totalQuestions,
      bestStreak,
      difficulty: difficultyMultiplier,
    })
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
        const existingOutcome: MatchRewardOutcome = {
          alreadyProcessed: true,
          matchId,
          xpEarned: typeof rData.xpEarned === 'number' ? rData.xpEarned : calculatedXp,
          coinsEarned: typeof rData.coinsEarned === 'number' ? rData.coinsEarned : calculatedCoins,
          oldXp: typeof rData.oldXp === 'number' ? rData.oldXp : 0,
          newTotalXp: typeof rData.newTotalXp === 'number' ? rData.newTotalXp : (rData.oldXp || 0) + calculatedXp,
          oldCoins: typeof rData.oldCoins === 'number' ? rData.oldCoins : 0,
          newTotalCoins: typeof rData.newTotalCoins === 'number' ? rData.newTotalCoins : (rData.oldCoins || 0) + calculatedCoins,
          oldLevel: typeof rData.oldLevel === 'number' ? rData.oldLevel : 1,
          newLevel: typeof rData.newLevel === 'number' ? rData.newLevel : 1,
          leveledUp: (rData.newLevel || 1) > (rData.oldLevel || 1),
          levelTitle: calculateLevelProgress(rData.newTotalXp || 0).currentLevel.title,
          oldStreak: typeof rData.oldStreak === 'number' ? rData.oldStreak : 0,
          newStreak: typeof rData.newStreak === 'number' ? rData.newStreak : 1,
          unlockedAchievements: Array.isArray(rData.unlockedAchievements) ? rData.unlockedAchievements : [],
          completedMissions: Array.isArray(rData.completedMissions) ? rData.completedMissions : [],
        }
        return existingOutcome
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

      // D. Cálculo de Sequência Diária (Streak em dias consecutivos)
      const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      const lastDate = typeof (userData as any).lastPlayedDate === 'string' ? (userData as any).lastPlayedDate : ''
      const currentStreak = typeof userData.streak === 'number' ? userData.streak : 0
      let nextStreak = currentStreak

      if (lastDate === todayStr) {
        nextStreak = currentStreak > 0 ? currentStreak : 1
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)
        if (lastDate === yesterdayStr) {
          nextStreak = currentStreak + 1
        } else {
          nextStreak = 1
        }
      }

      // E. Atualização estatística de categorias
      const existingCategoryStats = (userData as any).categoryStats || {}
      const curCat = existingCategoryStats[categorySlug] || { totalQuestions: 0, correctAnswers: 0, gamesPlayed: 0, score: 0 }
      const updatedCat = {
        totalQuestions: (curCat.totalQuestions || 0) + totalQuestions,
        correctAnswers: (curCat.correctAnswers || 0) + correctAnswers,
        gamesPlayed: (curCat.gamesPlayed || 0) + 1,
        score: (curCat.score || 0) + score,
      }

      // F. Verificação de Conquistas alcançadas nesta partida
      const existingAchievements = Array.isArray(userData.unlockedAchievements) ? userData.unlockedAchievements : []
      const newlyUnlocked: UnlockedAchievementInfo[] = []

      const totalGamesAfter = (userData.gamesPlayed || 0) + 1
      const totalQuestionsAfter = (userData.questionsAnswered || 0) + totalQuestions
      const totalCorrectAfter = (userData.correctAnswers || 0) + correctAnswers

      if (!existingAchievements.includes('ach_primeiros_passos') && totalGamesAfter >= 1) {
        newlyUnlocked.push({ id: 'ach_primeiros_passos', title: 'Primeiros Passos', icon: '🎯', description: 'Concluíste a tua primeira partida de quiz!' })
      }
      if (!existingAchievements.includes('ach_aprendiz_lusitano') && totalQuestionsAfter >= 25) {
        newlyUnlocked.push({ id: 'ach_aprendiz_lusitano', title: 'Aprendiz Lusitano', icon: '📚', description: 'Respondeste a 25 perguntas no total!' })
      }
      if (!existingAchievements.includes('ach_sabio_nacao') && totalQuestionsAfter >= 100) {
        newlyUnlocked.push({ id: 'ach_sabio_nacao', title: 'Sábio da Nação', icon: '🧠', description: 'Respondeste a 100 perguntas!' })
      }
      if (!existingAchievements.includes('ach_nivel_5') && newLevel >= 5) {
        newlyUnlocked.push({ id: 'ach_nivel_5', title: 'Veterano em Ascensão', icon: '⚡', description: 'Alcançaste o Nível 5!' })
      }
      if (!existingAchievements.includes('ach_nivel_10') && newLevel >= 10) {
        newlyUnlocked.push({ id: 'ach_nivel_10', title: 'Lenda Viva', icon: '🌟', description: 'Alcançaste o Nível 10!' })
      }
      if (!existingAchievements.includes('ach_sequencia_ouro') && nextStreak >= 7) {
        newlyUnlocked.push({ id: 'ach_sequencia_ouro', title: 'Fidelidade de Ouro', icon: '🔥', description: '7 dias consecutivos de jogo!' })
      }

      // G. Verificação de Missões Diárias concluídas
      const completedMissions: CompletedMissionInfo[] = []
      if (totalGamesAfter >= 1) {
        completedMissions.push({ id: 'daily_match_1', title: 'Participação Diária', reward: '+€50' })
      }
      if (correctAnswers >= 5) {
        completedMissions.push({ id: 'daily_correct_5', title: 'Precisão Lusa', reward: '+€100' })
      }

      // H. Registar documento de recompensa única (Garante idempotência absoluta)
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
        oldCoins: currentCoins,
        newTotalCoins: nextTotalCoins,
        oldLevel,
        newLevel,
        oldStreak: currentStreak,
        newStreak: nextStreak,
        unlockedAchievements: newlyUnlocked,
        completedMissions,
        processedAt: serverTimestamp(),
      })

      // I. Atualizar documento do utilizador
      const userUpdatePayload: Record<string, any> = {
        xp: nextTotalXp,
        coins: nextTotalCoins,
        euros: nextTotalCoins,
        level: newLevel,
        streak: nextStreak,
        lastPlayedDate: todayStr,
        gamesPlayed: increment(1),
        questionsAnswered: increment(totalQuestions),
        correctAnswers: increment(correctAnswers),
        incorrectAnswers: increment(Math.max(0, totalQuestions - correctAnswers)),
        totalQuestions: increment(totalQuestions),
        [`categoryStats.${categorySlug}`]: updatedCat,
        lastPlayedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      if (newlyUnlocked.length > 0) {
        userUpdatePayload.unlockedAchievements = arrayUnion(...newlyUnlocked.map((a) => a.id))
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

      // J. Atualizar Perfil Público
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

      // K. Registar na coleção games
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
        oldStreak: currentStreak,
        newStreak: nextStreak,
        unlockedAchievements: newlyUnlocked,
        completedMissions,
      } as MatchRewardOutcome
    })

    clientProcessedMatches.set(matchId, outcome)

    // Sincronizar cache local e eventos imediatamente
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user_xp', String(outcome.newTotalXp))
        localStorage.setItem('user_level', String(outcome.newLevel))
        localStorage.setItem('user_coins', String(outcome.newTotalCoins))
        localStorage.setItem('user_euros', String(outcome.newTotalCoins))
        localStorage.setItem('user_streak', String(outcome.newStreak))
        localStorage.setItem(`match_reward_${matchId}`, '1')
      } catch {}

      window.dispatchEvent(new CustomEvent('balance_updated', { detail: { coins: outcome.newTotalCoins } }))
      window.dispatchEvent(
        new CustomEvent('profile_updated', {
          detail: {
            xp: outcome.newTotalXp,
            level: outcome.newLevel,
            coins: outcome.newTotalCoins,
            euros: outcome.newTotalCoins,
            streak: outcome.newStreak,
            gamesPlayed: 1,
            correctAnswers,
            questionsAnswered: totalQuestions,
            bestStreak,
          },
        })
      )
    }

    console.log(`[XP] PERSIST_SUCCESS (matchId: ${matchId}, newTotalXp: ${outcome.newTotalXp}, newLevel: ${outcome.newLevel}, streak: ${outcome.newStreak})`)
    console.log(`[XP] CURRENT_TOTAL (xp: ${outcome.newTotalXp}, level: ${outcome.newLevel})`)
    console.log(`[PROFILE] XP_REFRESH (dispatched events and updated localStorage)`)

    return outcome
  } catch (err: any) {
    console.error(`[XP] PERSIST_ERROR (matchId: ${matchId}):`, err?.message || err)
    throw err
  }
}