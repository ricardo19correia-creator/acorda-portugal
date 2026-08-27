import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { BotPlayerRecord, BotMatchSimulationResult } from './types'
import { decideBotAnswer } from './bot-engine'
import type { DuelDocument, DuelQuestion, DuelAnswer } from '@/lib/duel'

/**
 * Simula a execução completa e human-like das 10 perguntas pelo bot
 */
export function generateBotDuelAnswers(
  bot: BotPlayerRecord,
  questions: DuelQuestion[],
  startedAt: number,
): { answers: DuelAnswer[]; totalScore: number; correctCount: number; totalTimeSpent: number } {
  const answers: DuelAnswer[] = []
  let totalScore = 0
  let correctCount = 0
  let totalTimeSpent = 0
  let currentStreak = 0
  let runningTimestamp = startedAt

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const decision = decideBotAnswer(bot, q, 3, currentStreak)

    const pointsGained = decision.isCorrect ? 100 : 0
    totalScore += pointsGained
    if (decision.isCorrect) {
      correctCount++
      currentStreak++
    } else {
      currentStreak = 0
    }

    runningTimestamp += Math.round(decision.timeSpentSeconds * 1000)
    totalTimeSpent += decision.timeSpentSeconds

    answers.push({
      questionId: q.id,
      questionIndex: i,
      selectedOption: decision.selectedOption,
      correctOption: q.correct,
      isCorrect: decision.isCorrect,
      status: decision.isCorrect ? 'CORRECT' : 'WRONG',
      pointsAwarded: pointsGained,
      answeredAt: runningTimestamp,
      timeSpentSeconds: decision.timeSpentSeconds,
    })
  }

  return {
    answers,
    totalScore,
    correctCount,
    totalTimeSpent,
  }
}

/**
 * Atualiza as estatísticas e progressão do Bot após a partida
 */
export async function updateBotPostMatchStats(
  botId: string,
  won: boolean,
  isDraw: boolean,
  scoreGained: number,
): Promise<void> {
  try {
    const db = getAdminFirestore()
    const botRef = db.collection('botPlayers').doc(botId)
    const snap = await botRef.get()

    if (!snap.exists) return

    const bot = snap.data() as BotPlayerRecord
    const currentRating = bot.rating || 1200
    const ratingDelta = isDraw ? 0 : won ? +16 : -12
    const nextRating = Math.max(700, Math.min(2400, currentRating + ratingDelta))

    const nextWins = won ? (bot.wins || 0) + 1 : bot.wins || 0
    const nextLosses = !won && !isDraw ? (bot.losses || 0) + 1 : bot.losses || 0
    const nextDraws = isDraw ? (bot.draws || 0) + 1 : bot.draws || 0
    const nextStreak = won ? (bot.streak || 0) + 1 : 0
    const nextXp = (bot.xp || 0) + (won ? 150 : 50)
    const nextCoins = (bot.coins || 0) + (won ? 50 : 15)

    // Recalcular Nível: Level = floor(sqrt(XP / 85))
    const calculatedLevel = Math.max(1, Math.min(40, Math.floor(Math.sqrt(nextXp / 85))))

    await botRef.update({
      rating: nextRating,
      wins: nextWins,
      losses: nextLosses,
      draws: nextDraws,
      streak: nextStreak,
      xp: nextXp,
      coins: nextCoins,
      level: calculatedLevel,
      status: 'ACTIVE', // Liberta o bot para novas partidas
      lastActiveAt: Date.now(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error('[BOT RUNNER] Erro ao atualizar estatísticas do bot:', err)
  }
}

/**
 * Simula uma partida inteira entre dois Bots (QA / Master Control Simulator)
 */
export function simulateBotVsBotMatch(
  botA: BotPlayerRecord,
  botB: BotPlayerRecord,
  questions: DuelQuestion[],
): BotMatchSimulationResult {
  const matchId = `SIM_${Date.now()}`
  const now = Date.now()

  const simA = generateBotDuelAnswers(botA, questions, now)
  const simB = generateBotDuelAnswers(botB, questions, now)

  let winnerId: string | null = null
  let winnerReason: 'score' | 'time' | 'draw' = 'score'

  if (simA.totalScore > simB.totalScore) {
    winnerId = botA.id
    winnerReason = 'score'
  } else if (simB.totalScore > simA.totalScore) {
    winnerId = botB.id
    winnerReason = 'score'
  } else if (simA.totalTimeSpent < simB.totalTimeSpent) {
    winnerId = botA.id
    winnerReason = 'time'
  } else if (simB.totalTimeSpent < simA.totalTimeSpent) {
    winnerId = botB.id
    winnerReason = 'time'
  } else {
    winnerId = null
    winnerReason = 'draw'
  }

  const questionsSummary = questions.map((q, idx) => ({
    questionId: q.id,
    category: q.category || 'Geral',
    botACorrect: simA.answers[idx]?.isCorrect || false,
    botBCorrect: simB.answers[idx]?.isCorrect || false,
    botATime: simA.answers[idx]?.timeSpentSeconds || 3.5,
    botBTime: simB.answers[idx]?.timeSpentSeconds || 3.5,
  }))

  return {
    matchId,
    botA: { id: botA.id, name: botA.displayName, score: simA.totalScore, correctCount: simA.correctCount },
    botB: { id: botB.id, name: botB.displayName, score: simB.totalScore, correctCount: simB.correctCount },
    winnerId,
    winnerReason,
    durationSeconds: Math.round(Math.max(simA.totalTimeSpent, simB.totalTimeSpent)),
    questionsSummary,
  }
}
