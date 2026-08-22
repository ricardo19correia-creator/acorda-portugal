'use client'

import { useEffect } from 'react'
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

const REDIRECT_TARGET_KEY = 'acorda_auth_redirect_target'

/**
 * Deteta se o utilizador está num dispositivo móvel ou wrapper
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ''
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
  const isSmallScreen = window.innerWidth <= 820

  return isMobileUA || (isTouch && isSmallScreen)
}

/**
 * Guarda o URL de destino pretendido antes de iniciar o fluxo de login
 */
export function setPostLoginRedirectTarget(target: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(REDIRECT_TARGET_KEY, target)
    localStorage.setItem(REDIRECT_TARGET_KEY, target)
  } catch (err) {
    console.warn('Não foi possível gravar redirect target no storage:', err)
  }
}

/**
 * Recupera e limpa o URL de destino pretendido após o login
 */
export function getPostLoginRedirectTarget(fallback = '/jogar'): string {
  if (typeof window === 'undefined') return fallback
  try {
    const target =
      sessionStorage.getItem(REDIRECT_TARGET_KEY) ||
      localStorage.getItem(REDIRECT_TARGET_KEY) ||
      fallback
    sessionStorage.removeItem(REDIRECT_TARGET_KEY)
    localStorage.removeItem(REDIRECT_TARGET_KEY)
    return target
  } catch {
    return fallback
  }
}

/**
 * Executa o Login Google via signInWithRedirect para suporte a WebView, APK e browsers
 */
export const handleGoogleLogin = async (redirectTarget = '/jogar'): Promise<void> => {
  if (!auth) {
    console.error('[AUTH DIAGNOSTIC] Erro: auth está nulo ou indefinido.')
    throw new Error('Firebase Auth não está inicializado.')
  }

  const validTarget = typeof redirectTarget === 'string' && redirectTarget.trim() ? redirectTarget.trim() : '/jogar'
  setPostLoginRedirectTarget(validTarget)

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  console.log('[AUTH] A iniciar signInWithRedirect com Google para destino:', validTarget)
  await signInWithRedirect(auth, provider)
}

/**
 * Alias mantido para compatibilidade em toda a aplicação
 */
export const performGoogleSignIn = handleGoogleLogin

/**
 * Hook para processar o regresso da autenticação na página de login:
 */
export const useCheckRedirectLogin = (defaultFallback = '/jogar') => {
  const router = useRouter()

  useEffect(() => {
    if (!auth) return

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const destination = getPostLoginRedirectTarget(defaultFallback)
          router.push(destination)
        }
      })
      .catch((error) => {
        console.error('Erro no retorno do login Google:', error)
      })
  }, [router, defaultFallback])
}
