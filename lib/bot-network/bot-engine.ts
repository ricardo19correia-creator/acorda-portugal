import type { BotPlayerRecord, BotAnswerDecision } from './types'
import type { DuelQuestion } from '@/lib/duel'

/**
 * Gera um desvio normal (Box-Muller) para tempo de resposta natural
 */
function randomGaussian(mean: number, stdev: number): number {
  const u1 = Math.max(0.0001, Math.random())
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return mean + z0 * stdev
}

/**
 * Calcula a decisão de resposta do bot sem acesso privilegiado a batotas
 */
export function decideBotAnswer(
  bot: BotPlayerRecord,
  question: DuelQuestion,
  difficultyLevel = 3,
  consecutiveStreak = 0,
): BotAnswerDecision {
  // 1. Obter proficiência na categoria
  const catKey = (question.category || 'portugal').toLowerCase()
  let categoryProficiency = bot.accuracyPercentage

  if (bot.categoryAffinities && bot.categoryAffinities[catKey] !== undefined) {
    categoryProficiency = bot.categoryAffinities[catKey]
  } else if (bot.strengths?.includes(catKey)) {
    categoryProficiency = Math.min(95, bot.accuracyPercentage + 15)
  } else if (bot.weaknesses?.includes(catKey)) {
    categoryProficiency = Math.max(35, bot.accuracyPercentage - 18)
  }

  // 2. Modificador por Dificuldade da Pergunta (1 a 5)
  let difficultyModifier = 0
  if (difficultyLevel === 1) difficultyModifier = +14
  else if (difficultyLevel === 2) difficultyModifier = +7
  else if (difficultyLevel === 3) difficultyModifier = 0
  else if (difficultyLevel === 4) difficultyModifier = -9
  else if (difficultyLevel === 5) difficultyModifier = -18

  // 3. Efeito de Fadiga / Momentum (Sequência)
  let streakModifier = 0
  if (consecutiveStreak > 4) {
    // Probabilidade ligeiramente maior de errar após streak muito longa (human-like)
    streakModifier = -6
  }

  const effectiveProbability = Math.max(
    25,
    Math.min(95, (categoryProficiency + difficultyModifier + streakModifier) / 100)
  )

  const roll = Math.random()
  const isCorrect = roll < effectiveProbability

  // 4. Seleção da Opção
  const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
  const correctKey = question.correct || 'A'

  let selectedOption: 'A' | 'B' | 'C' | 'D' = correctKey

  if (!isCorrect) {
    const wrongKeys = validKeys.filter((k) => k !== correctKey)
    selectedOption = wrongKeys[Math.floor(Math.random() * wrongKeys.length)]
  }

  // 5. Cálculo do Tempo de Resposta Human-Like
  const baseTimeMean = bot.avgResponseTimeMs || 4000
  let diffTimeMod = 0
  if (difficultyLevel === 1) diffTimeMod = -800
  else if (difficultyLevel === 2) diffTimeMod = -400
  else if (difficultyLevel === 4) diffTimeMod = +700
  else if (difficultyLevel === 5) diffTimeMod = +1400

  // Se o bot estiver em dúvida (errou), demora em média mais 500ms a responder
  const errorHesitation = isCorrect ? 0 : 500

  const targetMean = Math.max(1800, baseTimeMean + diffTimeMod + errorHesitation)
  const stdev = 600

  const responseTimeMs = Math.max(
    1500,
    Math.min(12000, Math.round(randomGaussian(targetMean, stdev)))
  )

  const timeSpentSeconds = Number((responseTimeMs / 1000).toFixed(1))

  return {
    selectedOption,
    isCorrect,
    timeSpentSeconds,
    confidenceScore: Number(effectiveProbability.toFixed(2)),
    reasoning: `Decisão baseada em proficiência de ${categoryProficiency}% na categoria "${catKey}" e dificuldade ${difficultyLevel}.`,
  }
}
