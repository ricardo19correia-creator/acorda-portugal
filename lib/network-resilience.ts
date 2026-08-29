/**
 * Mecanismo de Silent Retry e Resiliência de Rede
 * Garante que pequenas oscilações de rede (mobile 4G/5G, Wi-Fi handoff) não quebrem o jogo.
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (error: any, attempt: number) => boolean
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 4,
  baseDelayMs: 800,
  maxDelayMs: 6000,
  shouldRetry: (error: any) => {
    if (!error) return false
    const msg = String(error?.message || error || '').toLowerCase()
    if (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('failed to fetch') ||
      msg.includes('timeout') ||
      msg.includes('offline') ||
      msg.includes('abort') ||
      msg.includes('connection')
    ) {
      return true
    }
    return true
  },
}

/**
 * Executa uma função assíncrona com Silent Retry e Backoff Exponencial
 */
export async function silentAsyncRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: any = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      if (attempt < config.maxRetries && config.shouldRetry(err, attempt)) {
        // Backoff exponencial com jitter aleatório para evitar colisão
        const expDelay = Math.min(
          config.maxDelayMs,
          config.baseDelayMs * Math.pow(2, attempt)
        )
        const jitter = Math.random() * 300
        const delay = expDelay + jitter
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }

  throw lastError
}

/**
 * Wrapper de fetch com Silent Retry transparente
 */
export async function silentFetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return silentAsyncRetry(async () => {
    const res = await fetch(input, init)
    // Se o servidor devolver 502, 503 ou 504 (bad gateway / service unavailable), tenta de novo
    if (res.status >= 502 && res.status <= 504) {
      throw new Error(`Temporary Server Oscillation (${res.status})`)
    }
    return res
  }, options)
}
