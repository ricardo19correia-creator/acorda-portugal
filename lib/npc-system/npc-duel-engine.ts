import type { NpcProfile } from './types'

export interface NpcQuestionResult {
  questionIndex: number
  isCorrect: boolean
  responseTimeSeconds: number
  pointsAwarded: number
}

export interface NpcDuelSimulationResult {
  npc: NpcProfile
  totalScore: number
  correctCount: number
  totalTimeSeconds: number
  questionResults: NpcQuestionResult[]
}

/**
 * Simula a prestação realista de um NPC num duelo 1v1 de 10 perguntas
 */
export function simulateNpcDuelPerformance(
  npc: NpcProfile,
  questionsCount = 10
): NpcDuelSimulationResult {
  const [minAcc, maxAcc] = npc.accuracyRange
  const effectiveAcc = minAcc + Math.random() * (maxAcc - minAcc)

  let totalScore = 0
  let correctCount = 0
  let totalTimeSeconds = 0
  const questionResults: NpcQuestionResult[] = []

  for (let i = 0; i < questionsCount; i++) {
    // Probabilidade estocástica com base na precisão do NPC
    const isCorrect = Math.random() <= effectiveAcc

    // Tempo gaussiano humanizado
    const baseTime = npc.avgResponseTimeSeconds
    const jitter = (Math.random() - 0.5) * 2.2
    const hesitation = !isCorrect ? 1.2 : 0
    const responseTimeSeconds = Number(Math.max(1.8, Math.min(9.5, baseTime + jitter + hesitation)).toFixed(1))

    totalTimeSeconds += responseTimeSeconds

    let pointsAwarded = 0
    if (isCorrect) {
      correctCount++
      // Sistema de pontuação: 100 base + bónus de rapidez (até +50)
      const speedBonus = Math.max(0, Math.round((10 - responseTimeSeconds) * 5))
      pointsAwarded = 100 + speedBonus
      totalScore += pointsAwarded
    }

    questionResults.push({
      questionIndex: i,
      isCorrect,
      responseTimeSeconds,
      pointsAwarded,
    })
  }

  return {
    npc,
    totalScore,
    correctCount,
    totalTimeSeconds: Number(totalTimeSeconds.toFixed(1)),
    questionResults,
  }
}
