'use client'

import { useEffect } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
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
 * Executa o Login com Google utilizando o fluxo padrão do Firebase (signInWithPopup)
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    console.error('[AUTH DIAGNOSTIC] Erro: auth está nulo ou indefinido.')
    throw new Error('Firebase Auth não está inicializado.')
  }

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  console.log('[AUTH] A iniciar signInWithPopup com Google...')
  return await signInWithPopup(auth, provider)
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


/**
 * Limpeza total e definitiva da sessão (Firebase, Storage, Cookies e Memória)
 */
export async function performLogout(redirectUrl = '/'): Promise<void> {
  try {
    // 1. Firebase Auth SignOut oficial e seguro
    if (auth) {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    }
  } catch (err) {
    console.warn('[AUTH] Aviso ao terminar sessão no Firebase:', err)
  }

  // 2. Limpeza segura de dados de sessão em localStorage e sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove = [
        'user_coins',
        'user_euros',
        'user_display_name',
        'user_district',
        'user_equipped_avatar',
        'equipped_avatar_id',
        'equipped_arena',
        'equipped_arena_image',
        'equipped_title',
        'equipped_emotes',
        'equipped_taunts',
        'ap_auth_token',
        'acorda_auth_redirect_target',
        'guest_duel_session_id',
        'firebase_user_cache',
      ]
      keysToRemove.forEach((key) => localStorage.removeItem(key))
      sessionStorage.clear()
    } catch (e) {
      console.warn('[AUTH] Erro ao limpar Storage:', e)
    }

    // 3. Limpeza de cookies de autenticação da aplicação
    if (typeof document !== 'undefined') {
      try {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i]
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
          if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`
          }
        }
      } catch (e) {
        console.warn('[AUTH] Erro ao limpar cookies:', e)
      }
    }

    // 4. Redirecionamento limpo
    window.location.href = redirectUrl
  }
}

export const logoutUser = performLogout
