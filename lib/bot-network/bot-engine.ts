import type { BotPlayerRecord, BotPlayerPrivateRecord, BotAnswerDecision } from './types'
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
 * Calcula a decisão de resposta estocástica do bot com base em intelligencePercent (1-99),
 * dificuldade da pergunta, afinidades por categoria e variação por pergunta.
 * Nunca faz batota nem acede previamente a respostas humanas.
 */
export function decideBotAnswer(
  bot: BotPlayerRecord,
  question: DuelQuestion,
  difficultyLevel = 3,
  consecutiveStreak = 0,
  privateConfig?: Partial<BotPlayerPrivateRecord> | null,
): BotAnswerDecision {
  // 1. Obter a inteligência base do bot (1–99)
  const baseIntelligence =
    privateConfig?.intelligencePercent ||
    (bot.accuracyPercentage ? Math.round(bot.accuracyPercentage * 0.9 + 5) : 60)

  // 2. Obter proficiência na categoria da pergunta
  const catKey = (question.category || 'portugal').toLowerCase()
  let categoryProficiency = baseIntelligence

  if (bot.categoryAffinities && bot.categoryAffinities[catKey] !== undefined) {
    categoryProficiency = bot.categoryAffinities[catKey]
  } else if (bot.strengths?.includes(catKey)) {
    categoryProficiency = Math.min(96, baseIntelligence + 18)
  } else if (bot.weaknesses?.includes(catKey)) {
    categoryProficiency = Math.max(30, baseIntelligence - 22)
  }

  // 3. Modificador por Dificuldade da Pergunta (1 a 5)
  // Pergunta fácil (+12%), Pergunta difícil (-15%)
  let difficultyModifier = 0
  if (difficultyLevel === 1) difficultyModifier = +12
  else if (difficultyLevel === 2) difficultyModifier = +6
  else if (difficultyLevel === 3) difficultyModifier = 0
  else if (difficultyLevel === 4) difficultyModifier = -8
  else if (difficultyLevel === 5) difficultyModifier = -16

  // 4. Efeito de Momentum / Sequência (Streak de Acertos)
  let streakModifier = 0
  if (consecutiveStreak > 4) {
    // Pequena fadiga após sequência muito longa (human-like)
    streakModifier = -4
  } else if (consecutiveStreak > 1) {
    streakModifier = +2
  }

  // 5. Ruído estocástico suave (-4% a +4%) para variabilidade natural
  const stochasticJitter = (Math.random() * 8) - 4

  const effectiveProbability = Math.max(
    20,
    Math.min(96, (categoryProficiency + difficultyModifier + streakModifier + stochasticJitter) / 100)
  )

  const roll = Math.random()
  const isCorrect = roll < effectiveProbability

  // 6. Seleção da Opção (A, B, C, D)
  const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
  const correctKey = question.correct || 'A'

  let selectedOption: 'A' | 'B' | 'C' | 'D' = correctKey

  if (!isCorrect) {
    const wrongKeys = validKeys.filter((k) => k !== correctKey)
    selectedOption = wrongKeys[Math.floor(Math.random() * wrongKeys.length)]
  }

  // 7. Cálculo do Tempo de Resposta Human-Like com Distribuição Gaussiana
  const baseTimeMean = bot.avgResponseTimeMs || 4000
  let diffTimeMod = 0
  if (difficultyLevel === 1) diffTimeMod = -700
  else if (difficultyLevel === 2) diffTimeMod = -350
  else if (difficultyLevel === 4) diffTimeMod = +600
  else if (difficultyLevel === 5) diffTimeMod = +1300

  // Se o bot estiver em dúvida / errou, hesita em média mais 450ms
  const errorHesitation = isCorrect ? 0 : 450

  const targetMean = Math.max(1600, baseTimeMean + diffTimeMod + errorHesitation)
  const stdev = privateConfig?.responseModel?.baseJitterMs || 650

  const minBound = bot.minResponseTimeMs || 1500
  const maxBound = bot.maxResponseTimeMs || 11000

  const responseTimeMs = Math.max(
    minBound,
    Math.min(maxBound, Math.round(randomGaussian(targetMean, stdev)))
  )

  const timeSpentSeconds = Number((responseTimeMs / 1000).toFixed(1))

  return {
    selectedOption,
    isCorrect,
    timeSpentSeconds,
    confidenceScore: Number(effectiveProbability.toFixed(2)),
    reasoning: `Decisão baseada em inteligência base ${baseIntelligence}%, proficiência na categoria "${catKey}" (${categoryProficiency}%) e nível de dificuldade ${difficultyLevel}.`,
  }
}
