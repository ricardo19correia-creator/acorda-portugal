'use client'

import { useState, useEffect } from 'react'

/**
 * 🇵🇹 ACORDA PORTUGAL — ESTADO GLOBAL DE PARTIDA ATIVA EM ARENA
 * 
 * Fonte Única de Verdade (SSOT) para determinar se o jogador está numa partida ativa
 * dentro de uma arena.
 * 
 * Regra Absoluta:
 * Durante uma partida ativa, o GlobalBackgroundVideo é desligado (OFF) para que a arena
 * assuma 100% do controlo visual e zero recursos (CPU/GPU) sejam desperdiçados no vídeo.
 */

let imperativeMatchActive = false
const listeners = new Set<() => void>()

// Patch global de history.pushState e replaceState para detetar transições do Next.js App Router em 0ms
if (typeof window !== 'undefined' && !(window as any).__AP_HISTORY_PATCHED) {
  ;(window as any).__AP_HISTORY_PATCHED = true
  const origPush = window.history.pushState
  window.history.pushState = function (...args) {
    const res = origPush.apply(this, args)
    window.dispatchEvent(new Event('ap_route_change'))
    return res
  }
  const origReplace = window.history.replaceState
  window.history.replaceState = function (...args) {
    const res = origReplace.apply(this, args)
    window.dispatchEvent(new Event('ap_route_change'))
    return res
  }
}

/**
 * Permite que qualquer componente (ex: QuizScreen, DuelArena) sinalize imperativamente
 * o início ou fim de uma partida ativa.
 */
export function setGlobalArenaMatchActive(active: boolean) {
  const changed = imperativeMatchActive !== active
  imperativeMatchActive = active

  if (typeof window !== 'undefined') {
    if (active) {
      document.documentElement.classList.add('ap-arena-match')
    } else {
      document.documentElement.classList.remove('ap-arena-match')
    }

    if (changed) {
      listeners.forEach((listener) => listener())
      window.dispatchEvent(new CustomEvent('ap_match_state_change', { detail: { active } }))
    }
  }
}

/**
 * Força o reset imediato e total de qualquer estado de arena/partida.
 * Utilizado para garantir restauração instantânea do layout oficial ao voltar à Home.
 */
export function resetGlobalArenaState() {
  imperativeMatchActive = false
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('ap-arena-match')
    listeners.forEach((listener) => listener())
    window.dispatchEvent(new CustomEvent('ap_match_state_change', { detail: { active: false } }))
  }
}

export function getImperativeMatchActive(): boolean {
  return imperativeMatchActive
}

function subscribeImperative(callback: () => void) {
  listeners.add(callback)
  const handleEvent = () => callback()
  if (typeof window !== 'undefined') {
    window.addEventListener('ap_match_state_change', handleEvent)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('ap_match_state_change', handleEvent)
    }
  }
}

/**
 * Lógica pura para detetar se uma rota e a query string indicam uma partida ativa.
 */
export function isMatchActiveFromRoute(
  pathname: string | null,
  searchString?: string | null
): boolean {
  if (!pathname) return false

  const path = pathname.toLowerCase()

  // A Home ('/') NUNCA é uma partida ativa de arena
  if (path === '/' || path === '') return false

  const search = searchString || ''

  // 1. Rota /jogar ou /jogo
  // Uma partida está ativa APENAS quando há categoria, tema, modo territorial ou ID de jogo ativo
  if (path === '/jogar' || path === '/jogo') {
    if (!search) return false
    const searchParams = new URLSearchParams(search)

    const rawCategory =
      searchParams.get('cat') ||
      searchParams.get('category') ||
      searchParams.get('categoria') ||
      searchParams.get('theme') ||
      searchParams.get('tema') ||
      searchParams.get('mode') ||
      searchParams.get('modo') ||
      searchParams.get('topic') ||
      searchParams.get('topico') ||
      searchParams.get('event') ||
      searchParams.get('evento')

    const districtParam =
      searchParams.get('district') || searchParams.get('dist') || searchParams.get('distrito')
    const cityParam = searchParams.get('city') || searchParams.get('cidade')
    const gameParam = searchParams.get('game') || searchParams.get('gameId')
    const playParam = searchParams.get('play') === 'true'

    const effectiveCategory =
      rawCategory ||
      (districtParam ? 'o-meu-distrito' : null) ||
      (cityParam ? 'desafio-cidade' : null) ||
      (gameParam ? 'desafio-nacional' : null)

    return Boolean(effectiveCategory || gameParam || playParam)
  }

  // 2. Rota /jogar/duelo
  // Uma partida está ativa APENAS quando há um ID de duelo na URL (?id=...)
  // Fora disso (sem ID), o utilizador está na página de matchmaking (página normal com vídeo ON)
  if (path === '/jogar/duelo') {
    if (!search) return false
    const searchParams = new URLSearchParams(search)
    const duelId = searchParams.get('id')
    return Boolean(duelId && duelId.trim().length > 0)
  }

  return false
}

/**
 * Hook reactivo unificado que determina se o jogador está numa partida ativa de arena.
 * Avalia de forma segura no cliente (rota URL + sinal imperativo) com atualização imediata.
 */
export function useIsActiveArenaGame(): boolean {
  const [isActive, setIsActive] = useState(() => {
    if (typeof window === 'undefined') return false
    const isRoute = isMatchActiveFromRoute(window.location.pathname, window.location.search)
    const active = isRoute && getImperativeMatchActive()
    if (active) {
      document.documentElement.classList.add('ap-arena-match')
    } else {
      document.documentElement.classList.remove('ap-arena-match')
    }
    return active
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const evaluate = () => {
      const isRoute = isMatchActiveFromRoute(window.location.pathname, window.location.search)
      const isImperative = getImperativeMatchActive()
      const active = isRoute && isImperative

      if (active) {
        document.documentElement.classList.add('ap-arena-match')
      } else {
        document.documentElement.classList.remove('ap-arena-match')
        if (!isRoute && isImperative) {
          imperativeMatchActive = false
        }
      }

      setIsActive(active)
    }

    evaluate()
    const interval = setInterval(evaluate, 150)
    window.addEventListener('popstate', evaluate)
    window.addEventListener('hashchange', evaluate)
    window.addEventListener('ap_route_change', evaluate)
    window.addEventListener('ap_match_state_change', evaluate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('popstate', evaluate)
      window.removeEventListener('hashchange', evaluate)
      window.removeEventListener('ap_route_change', evaluate)
      window.removeEventListener('ap_match_state_change', evaluate)
    }
  }, [])

  return isActive
}

