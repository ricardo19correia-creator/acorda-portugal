/**
 * Utilitário de Contagem Regressiva em Tempo Real para o Acorda Portugal
 * acordaportugal.pt
 */

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalRemainingMs: number
  isLaunched: boolean
  formatted: {
    days: string
    hours: string
    minutes: string
    seconds: string
  }
}

/**
 * Calcula a diferença de tempo restante de forma pura e imutável.
 * Garante estritamente que valores negativos nunca são retornados e
 * que o estado isLaunched é ativado no momento exato do término.
 *
 * @param targetTimestampMs Timestamp absoluto do lançamento em milissegundos
 * @param currentTimestampMs Timestamp atual em milissegundos (default: Date.now())
 */
export function calculateTimeRemaining(
  targetTimestampMs: number,
  currentTimestampMs: number = Date.now()
): TimeRemaining {
  // Se os argumentos forem inválidos ou não-numéricos, retorna estado seguro lançado/zero
  if (typeof targetTimestampMs !== 'number' || isNaN(targetTimestampMs)) {
    return createZeroTimeRemaining(true)
  }

  const safeCurrent = typeof currentTimestampMs === 'number' && !isNaN(currentTimestampMs)
    ? currentTimestampMs
    : Date.now()

  const diff = targetTimestampMs - safeCurrent

  if (diff <= 0) {
    return createZeroTimeRemaining(true)
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.max(0, Math.floor(totalSeconds / (3600 * 24)))
  const hours = Math.max(0, Math.floor((totalSeconds % (3600 * 24)) / 3600))
  const minutes = Math.max(0, Math.floor((totalSeconds % 3600) / 60))
  const seconds = Math.max(0, Math.floor(totalSeconds % 60))

  return {
    days,
    hours,
    minutes,
    seconds,
    totalRemainingMs: diff,
    isLaunched: false,
    formatted: {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    },
  }
}

function createZeroTimeRemaining(isLaunched: boolean): TimeRemaining {
  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalRemainingMs: 0,
    isLaunched,
    formatted: {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
    },
  }
}
