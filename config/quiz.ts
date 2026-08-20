/**
 * Global Quiz & Gameplay Configuration
 * Fonte única de verdade para temporizadores, bónus de rapidez e alertas em todos os modos de jogo.
 */

export const QUESTION_TIME_SECONDS = 60
export const QUESTION_TIME_MS = 60000
export const WARNING_TIME_THRESHOLD = 10 // Alerta vermelho nos últimos 10s
export const MAX_TIME_BONUS_XP = 200

/**
 * Calcula o bónus de rapidez com base no tempo restante e no teto de 60s
 */
export function calculateTimeBonus(
  secondsRemaining: number,
  maxSeconds: number = QUESTION_TIME_SECONDS,
  maxBonus: number = MAX_TIME_BONUS_XP,
): number {
  if (secondsRemaining <= 0) return 0
  const ratio = Math.min(1, Math.max(0, secondsRemaining / maxSeconds))
  return Math.round(ratio * maxBonus)
}

/**
 * Calcula a percentagem da barra de tempo (0% a 100%)
 */
export function calculateTimePercentage(
  secondsRemaining: number,
  maxSeconds: number = QUESTION_TIME_SECONDS,
): number {
  return Math.max(0, Math.min(100, (secondsRemaining / maxSeconds) * 100))
}
