import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  browserPopupRedirectResolver,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

const REDIRECT_TARGET_KEY = 'acorda_auth_redirect_target'

/**
 * Deteta se o utilizador está num dispositivo móvel (iOS, Android, etc.)
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
export function getPostLoginRedirectTarget(fallback = '/'): string {
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
 * Executa o Login Google de forma fiável em qualquer dispositivo:
 * - Tenta signInWithPopup primeiro (em desktop e mobile através do toque direto, evitando o loop de redirecionamento do Safari/Chrome mobile)
 * - Faz fallback transparente para signInWithRedirect apenas se o popup estiver bloqueado
 */
export async function performGoogleSignIn(redirectTarget = '/'): Promise<UserCredential | void> {
  if (!auth) {
    console.error('[AUTH DIAGNOSTIC] Erro: auth está nulo ou indefinido.')
    throw new Error('Firebase Auth não está inicializado.')
  }

  const validTarget = typeof redirectTarget === 'string' && redirectTarget.trim() ? redirectTarget.trim() : '/'
  setPostLoginRedirectTarget(validTarget)

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const isMobile = isMobileDevice()

  // Logging diagnóstico detalhado antes da chamada Firebase
  console.log('=== [FIREBASE AUTH PRE-CALL DIAGNOSTIC] ===', {
    metodoPrimario: 'signInWithPopup',
    isMobile,
    provider: {
      providerId: provider.providerId,
      scopes: provider.getScopes ? provider.getScopes() : [],
      isInstanceOfGoogleAuthProvider: provider instanceof GoogleAuthProvider,
    },
    authInstance: {
      isAuthDefined: Boolean(auth),
      appName: auth.app?.name,
      currentUser: auth.currentUser ? auth.currentUser.uid : null,
      authDomain: auth.config?.authDomain,
      projectId: auth.app?.options?.projectId,
    },
    resolver: {
      isResolverDefined: Boolean(browserPopupRedirectResolver),
    },
  })

  try {
    console.log('[AUTH] A invocar signInWithPopup(auth, provider, browserPopupRedirectResolver)...')
    const cred = await signInWithPopup(auth, provider, browserPopupRedirectResolver)
    console.log('[AUTH] signInWithPopup bem-sucedido! UID:', cred.user?.uid)
    return cred
  } catch (err: any) {
    const code = err?.code || ''
    console.warn('[AUTH] signInWithPopup retornou código/erro:', code, err?.message)

    // Se o popup for bloqueado pelo navegador, recorrer ao redirecionamento como fallback
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      console.log('[AUTH] Popup bloqueado pelo browser, a recorrer a signInWithRedirect como fallback...')
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver)
      return
    }

    // Se o utilizador apenas fechou a janela do popup, não fazer nada
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return
    }

    throw err
  }
}
