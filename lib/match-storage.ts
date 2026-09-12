/**
 * 🇵🇹 ACORDA PORTUGAL — GESTOR SEGURO DE ESTADO E ARMAZENAMENTO DE PARTIDAS
 * Single Source of Truth (SSOT) para limpeza de sessões, prevenção de loops
 * e recuperação limpa de partidas na rota /jogar.
 */

export const MATCH_STORAGE_KEYS = [
  'current_match',
  'quiz_state',
  'active_game',
  'active_game_session',
  'active_session_id',
  'ap_error_auto_retried',
  'game_session',
  'match_session',
  'last_played_match',
] as const

/**
 * Limpa explicitamente do localStorage e sessionStorage qualquer chave residual de partidas:
 * current_match, quiz_state, active_game, active_game_session, active_session_id, ap_quiz_state_*, etc.
 * Totalmente defensivo contra erros de quota, contextos restritos ou SSR.
 */
export function clearAllMatchStorage(): void {
  if (typeof window === 'undefined') return

  try {
    // 1. Limpeza direta das chaves canónicas
    for (const key of MATCH_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key)
      } catch {}
      try {
        sessionStorage.removeItem(key)
      } catch {}
    }

    // 2. Limpeza por padrão no sessionStorage
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (
          key &&
          (key.startsWith('ap_quiz_state_') ||
            key.startsWith('quiz_') ||
            key.startsWith('match_') ||
            key.startsWith('game_') ||
            key.includes('current_match') ||
            key.includes('quiz_state') ||
            key.includes('active_game') ||
            key.includes('session') ||
            key.includes('challenge'))
        ) {
          sessionStorage.removeItem(key)
        }
      }
    } catch {}

    // 3. Limpeza por padrão no localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.startsWith('ap_quiz_state_') ||
            key.startsWith('quiz_') ||
            key.startsWith('match_') ||
            key.startsWith('game_') ||
            key.includes('current_match') ||
            key.includes('quiz_state') ||
            key.includes('active_game') ||
            key.includes('session') ||
            key.includes('challenge'))
        ) {
          localStorage.removeItem(key)
        }
      }
    } catch {}
  } catch (err) {
    console.warn('[clearAllMatchStorage] Aviso na limpeza de armazenamento:', err)
  }
}
