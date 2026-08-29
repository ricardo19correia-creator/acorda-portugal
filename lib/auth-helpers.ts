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
import { ECONOMY_CONFIG } from '@/src/data/economy'

const REDIRECT_TARGET_KEY = 'acorda_auth_redirect_target'

/**
 * Valida e sanitiza URLs de redirecionamento para prevenir vulnerabilidades de Open Redirect.
 * Apenas rotas internas (iniciadas por '/' e sem barras duplas ou esquemas de protocolo) são permitidas.
 */
export function sanitizeRedirectUrl(target: unknown, fallback = '/jogar'): string {
  if (typeof target !== 'string') return fallback
  const trimmed = target.trim()
  if (!trimmed) return fallback

  // Rejeitar protocolos externos (http:, https:, javascript:, mailto:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback
  }

  // Rejeitar URLs relativos a protocolo (//malicious.com) ou caminhos invertidos (/\)
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return fallback
  }

  // Deve começar com '/'
  if (!trimmed.startsWith('/')) {
    return fallback
  }

  return trimmed
}

/**
 * Retorna uma instância configurada do GoogleAuthProvider
 */
export function getGoogleAuthProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

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
 * Guarda o URL de destino pretendido antes de iniciar o fluxo de login (sanitizado)
 */
export function setPostLoginRedirectTarget(target: string) {
  if (typeof window === 'undefined') return
  const safeTarget = sanitizeRedirectUrl(target)
  try {
    sessionStorage.setItem(REDIRECT_TARGET_KEY, safeTarget)
    localStorage.setItem(REDIRECT_TARGET_KEY, safeTarget)
  } catch (err) {
    console.warn('[AUTH] Não foi possível gravar redirect target no storage:', err)
  }
}

/**
 * Recupera e limpa o URL de destino pretendido após o login (sanitizado)
 */
export function getPostLoginRedirectTarget(fallback = '/jogar'): string {
  const safeFallback = sanitizeRedirectUrl(fallback, '/jogar')
  if (typeof window === 'undefined') return safeFallback
  try {
    const rawTarget =
      sessionStorage.getItem(REDIRECT_TARGET_KEY) ||
      localStorage.getItem(REDIRECT_TARGET_KEY) ||
      safeFallback
    sessionStorage.removeItem(REDIRECT_TARGET_KEY)
    localStorage.removeItem(REDIRECT_TARGET_KEY)
    return sanitizeRedirectUrl(rawTarget, safeFallback)
  } catch {
    return safeFallback
  }
}

/**
 * Tradução e mapeamento amigável de erros de autenticação Firebase / OAuth
 */
export function mapAuthErrorMessage(error: any): string {
  const code = error?.code || ''
  const message = error?.message || ''

  console.error('[AUTH ERROR FULL DIAGNOSTIC]', {
    code,
    message,
    name: error?.name,
    stack: error?.stack,
    customData: error?.customData,
    rawError: error,
  })

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação foi fechada antes de concluir o login.'
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela de autenticação. Permite popups ou tenta novamente.'
    case 'auth/cancelled-popup-request':
      return 'O pedido de autenticação anterior foi substituído. Tenta novamente.'
    case 'auth/unauthorized-domain':
      return 'Domínio não autorizado nas configurações de segurança do Firebase (auth/unauthorized-domain). Confirma se acordaportugal.pt está em Authentication > Settings > Authorized domains.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email ou palavra-passe incorretos.'
    case 'auth/email-already-in-use':
      return 'Já existe uma conta registada com este endereço de email.'
    case 'auth/weak-password':
      return 'A palavra-passe deve conter pelo menos 6 caracteres.'
    case 'auth/operation-not-allowed':
      return 'Este método de autenticação não está ativo no Firebase Console (auth/operation-not-allowed).'
    case 'auth/network-request-failed':
      return 'Erro de ligação à rede. Verifica a tua ligação à internet (auth/network-request-failed).'
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas de autenticação. Por favor, aguarda alguns momentos (auth/too-many-requests).'
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta associada a este email com outro método de login (auth/account-exists-with-different-credential).'
    case 'auth/requires-recent-login':
      return 'Por motivos de segurança, deves iniciar sessão novamente antes de continuar.'
    case 'auth/invalid-api-key':
      return 'Chave de configuração de autenticação inválida (auth/invalid-api-key).'
    default:
      if (message.includes('invalid_client') || message.includes('OAuth client was not found')) {
        return 'Erro na configuração do cliente OAuth Google (invalid_client).'
      }
      if (code) {
        return `Erro na autenticação (${code}): ${message || 'Tenta novamente.'}`
      }
      return message || 'Não foi possível iniciar sessão com o Google. Tenta novamente.'
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

  const provider = getGoogleAuthProvider()
  console.log('[AUTH] A iniciar signInWithPopup com Google...')
  const cred = await signInWithPopup(auth, provider)
  if (cred?.user) {
    const { registerUserSession } = await import('@/lib/session-manager')
    await registerUserSession(cred.user)
  }
  return cred
}

/**
 * Executa o Login Google via signInWithRedirect para suporte a WebView, APK e browsers com popups bloqueados
 */
export const handleGoogleLogin = async (redirectTarget = '/jogar'): Promise<void> => {
  if (!auth) {
    console.error('[AUTH DIAGNOSTIC] Erro: auth está nulo ou indefinido.')
    throw new Error('Firebase Auth não está inicializado.')
  }

  const safeTarget = sanitizeRedirectUrl(redirectTarget)
  setPostLoginRedirectTarget(safeTarget)

  const provider = getGoogleAuthProvider()
  console.log('[AUTH] A iniciar signInWithRedirect com Google para destino:', safeTarget)
  await signInWithRedirect(auth, provider)
}

/**
 * Alias mantido para compatibilidade em toda a aplicação
 */
export const performGoogleSignIn = handleGoogleLogin

/**
 * Hook para processar o regresso da autenticação via redirect
 */
export const useCheckRedirectLogin = (
  defaultFallback = '/jogar',
  onError?: (errorMsg: string) => void
) => {
  const router = useRouter()

  useEffect(() => {
    if (!auth) return

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('[AUTH REDIRECT RESULT] Utilizador autenticado via redirect:', result.user.uid)
          const { registerUserSession } = await import('@/lib/session-manager')
          await registerUserSession(result.user)
        }
      })
      .catch((error) => {
        console.error('[AUTH REDIRECT ERROR] Erro no retorno do login Google:', error)
        if (error && error?.code && onError) {
          onError(mapAuthErrorMessage(error))
        }
      })
  }, [onError])
}

/**
 * Limpeza total e definitiva da sessão (Firebase, Storage, Cookies e Memória)
 */
export async function performLogout(redirectUrl = '/'): Promise<void> {
  const safeRedirect = sanitizeRedirectUrl(redirectUrl, '/')

  try {
    if (auth) {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    }
  } catch (err) {
    console.warn('[AUTH] Aviso ao terminar sessão no Firebase:', err)
  }

  // Limpeza segura e total de dados de sessão em localStorage e sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove = [
        'user_coins',
        'user_euros',
        'user_display_name',
        'user_district',
        'user_city',
        'user_represented_district',
        'user_represented_city',
        'selected_district',
        'selected_city',
        'user_equipped_avatar',
        'user_equipped_avatar_id',
        'equipped_avatar_id',
        'user_equipped_frame',
        'equipped_arena',
        'equipped_arena_image',
        'equipped_title',
        'user_equipped_title',
        'equipped_taunt_id',
        'equipped_emotes',
        'equipped_taunts',
        'user_inventory',
        'user_inventory_taunts',
        'user_inventory_emotes',
        'user_unlocked_items',
        'user_consumables',
        'user_claimed_achievements',
        'user_help5050',
        'user_freezeTime',
        'user_publicVote',
        'user_is_founder',
        'ap_user_inventory_v3',
        'ap_user_inventory',
        'ap_equipped_items',
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

    // Limpeza de cookies de autenticação da aplicação
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

    // Redirecionamento limpo e seguro
    window.location.href = safeRedirect
  }
}

export const logoutUser = performLogout

/**
 * Criação padronizada e imutável do documento do novo utilizador no Firestore
 */
export async function createNewUserDocument(
  user: any,
  selectedDistrict: string,
  selectedCity?: string,
  username?: string,
  customAvatarUrl?: string
): Promise<void> {
  if (!user?.uid) return
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const { db } = await import('@/lib/firebase')
  const { DEFAULT_AVATAR_URL, DEFAULT_AVATAR_ID } = await import('@/data/constants')
  const { normalizeDistrict, getDefaultCityForDistrict, isValidCityForDistrict } = await import('@/data/districts')

  const cleanName = (username || user.displayName || user.email?.split('@')[0] || 'Noviço da Nação').trim()
  const photoURL = customAvatarUrl || user.photoURL || DEFAULT_AVATAR_URL

  const canonicalDistrict = normalizeDistrict(selectedDistrict) || selectedDistrict.trim()
  const rawCity = selectedCity ? selectedCity.trim() : ''
  const canonicalCity =
    rawCity && isValidCityForDistrict(canonicalDistrict, rawCity)
      ? rawCity
      : rawCity || getDefaultCityForDistrict(canonicalDistrict)

  const initialData = {
    uid: user.uid,
    displayName: cleanName,
    name: cleanName,
    email: user.email || '',
    photoURL: photoURL,
    avatar: photoURL,
    avatarId: DEFAULT_AVATAR_ID,
    equippedAvatar: DEFAULT_AVATAR_ID,
    district: canonicalDistrict, // Definido no registo/onboarding e PERMANENTE
    city: canonicalCity,         // Definido no registo/onboarding e PERMANENTE
    representedDistrict: canonicalDistrict,
    representedCity: canonicalCity,
    districtLocked: true,
    cityLocked: true,
    level: 1,
    xp: 0,
    coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
    euros: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
    streak: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalQuestions: 0,
    bestStreak: 0,
    title: 'Noviço da Nação',
    equippedTitle: 'Noviço da Nação',
    equippedFrame: 'default',
    unlockedFrames: ['default'],
    unlockedAvatars: [DEFAULT_AVATAR_ID],
    unlockedAchievements: [],
    claimedAchievements: {},
    badges: ['novico'],
    inventory: {
      avatars: [DEFAULT_AVATAR_ID],
      arenas: ['arena_1'],
      titles: ['tit_novico'],
      taunts: ['pack_basico'],
      frames: ['default'],
      utilities: {
        fiftyFifty: 0,
        freezeTime: 0,
        publicVote: 0,
      },
    },
    equipped: {
      avatar: photoURL,
      avatarId: DEFAULT_AVATAR_ID,
      title: 'Noviço da Nação',
      arena: 'arena_1',
      frameId: 'default',
    },
    consumables: {
      help5050: 0,
      freezeTime: 0,
      publicVote: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const userRef = doc(db, 'users', user.uid)
  await setDoc(userRef, initialData, { merge: true })

  try {
    const publicProfileRef = doc(db, 'publicProfiles', user.uid)
    await setDoc(
      publicProfileRef,
      {
        uid: user.uid,
        displayName: cleanName,
        photoURL: photoURL,
        avatarId: DEFAULT_AVATAR_ID,
        district: canonicalDistrict,
        city: canonicalCity,
        representedDistrict: canonicalDistrict,
        representedCity: canonicalCity,
        level: 1,
        xp: 0,
        equippedTitle: 'Noviço da Nação',
        equippedFrame: 'default',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    console.warn('[AUTH] Aviso ao sincronizar publicProfiles inicial:', err)
  }
}


