'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isMatchActiveFromRoute, resetGlobalArenaState } from '@/lib/game-active-state'

/**
 * 🇵🇹 ACORDA PORTUGAL — SINCRONIZADOR GLOBAL DE LAYOUT & ROTA
 *
 * Garante que qualquer transição de saída de partida (voltar à Home, hub de jogos,
 * rankings, perfil, botão 'Voltar' do browser, gesto mobile ou Capacitor APK)
 * limpa imediatamente o modo de jogo (classe .ap-arena-match) e restaura em 0ms:
 * 1. O fundo oficial global (/images/desafio-nacional-background.jpg)
 * 2. A barra de navegação inferior mobile (MobileBottomBar)
 */
export function ArenaLayoutSync() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncLayoutState = () => {
      const currentPath = window.location.pathname
      const currentSearch = window.location.search
      const isRouteMatch = isMatchActiveFromRoute(currentPath, currentSearch)

      // Se estamos na Home ('/'), no lobby / hub ou em qualquer rota fora de jogo:
      // Restaurar IMEDIATAMENTE o layout oficial global
      if (currentPath === '/' || pathname === '/' || !isRouteMatch) {
        resetGlobalArenaState()
      }
    }

    syncLayoutState()

    window.addEventListener('popstate', syncLayoutState)
    window.addEventListener('hashchange', syncLayoutState)
    window.addEventListener('ap_route_change', syncLayoutState)
    window.addEventListener('ap_match_state_change', syncLayoutState)

    return () => {
      window.removeEventListener('popstate', syncLayoutState)
      window.removeEventListener('hashchange', syncLayoutState)
      window.removeEventListener('ap_route_change', syncLayoutState)
      window.removeEventListener('ap_match_state_change', syncLayoutState)
    }
  }, [pathname])

  return null
}

export default ArenaLayoutSync
