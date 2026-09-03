'use client'

import { auth } from '@/lib/firebase'

/**
 * Verifica se existe um utilizador autenticado
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(auth?.currentUser)
}

/**
 * Valida a autenticação e redireciona para /entrar caso o utilizador não tenha sessão iniciada.
 * Retorna true se autenticado, ou false se redirecionou.
 */
export function requireAuthOrRedirect(
  router: { push: (url: string) => void },
  destinationUrl = '/jogar'
): boolean {
  if (!auth?.currentUser) {
    const target = `/entrar?redirect=${encodeURIComponent(destinationUrl)}`
    if (router && typeof router.push === 'function') {
      router.push(target)
    } else if (typeof window !== 'undefined') {
      window.location.assign(target)
    }
    return false
  }
  return true
}
