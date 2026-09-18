'use client'

import { doc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

export const ACTIVE_SESSION_STORAGE_KEY = 'ap_active_session_id'
export const LEGACY_SESSION_STORAGE_KEY = 'active_session_id'
export const DEVICE_ID_STORAGE_KEY = 'ap_device_id'
export const SESSION_CONFLICT_MESSAGE_KEY = 'ap_session_conflict_message'

export type PlatformType = 'android_apk' | 'mobile_web' | 'desktop_web'

export interface ActiveSessionData {
  sessionId: string
  deviceId: string
  platform: PlatformType
  deviceInfo: string
  createdAt: any
  lastSeen: any
  isActive: boolean
}

// Flag em memória para interromper imediatamente timers e chamadas quando a sessão for terminada
let sessionTerminatedInMemory = false

export function isSessionTerminated(): boolean {
  return sessionTerminatedInMemory
}

export function markSessionTerminated(): void {
  sessionTerminatedInMemory = true
}

export function resetSessionTerminated(): void {
  sessionTerminatedInMemory = false
}

/**
 * Obtém ou gera um identificador persistente e único para o dispositivo/navegador atual
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device'
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (!deviceId || deviceId.trim() === '') {
      deviceId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? `dev_${crypto.randomUUID()}`
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
    }
    return deviceId
  } catch {
    return 'fallback_device'
  }
}

/**
 * Deteta a plataforma do dispositivo e descrição do ambiente
 */
export function getDeviceInfo(): { platform: PlatformType; deviceInfo: string } {
  if (typeof window === 'undefined') {
    return { platform: 'desktop_web', deviceInfo: 'Servidor / SSR' }
  }

  const isCapacitor =
    Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
    (window as any).Capacitor?.platform === 'android' ||
    navigator.userAgent.includes('Capacitor') ||
    window.location.protocol === 'capacitor:'

  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(navigator.userAgent)

  let platform: PlatformType = 'desktop_web'
  if (isCapacitor) {
    platform = 'android_apk'
  } else if (isMobile) {
    platform = 'mobile_web'
  }

  const ua = navigator.userAgent || ''
  let browser = 'Browser'
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'

  let os = 'Dispositivo'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Macintosh')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'

  const deviceInfo = isCapacitor
    ? `App Android (APK) · ${os}`
    : `${browser} · ${os}`

  return { platform, deviceInfo }
}

/**
 * Gera um ID único e aleatório de sessão
 */
export function generateNewSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `sess_${Date.now()}_${crypto.randomUUID()}`
  }
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Obtém o ID da sessão ativa neste navegador / aba
 */
export function getLocalSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return (
      sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) ||
      localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) ||
      sessionStorage.getItem(LEGACY_SESSION_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_SESSION_STORAGE_KEY) ||
      null
    )
  } catch {
    return null
  }
}

/**
 * Define o ID da sessão local tanto em sessionStorage como em localStorage
 */
export function setLocalSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)
    // Manter chave legada sincronizada
    sessionStorage.setItem(LEGACY_SESSION_STORAGE_KEY, sessionId)
    localStorage.setItem(LEGACY_SESSION_STORAGE_KEY, sessionId)
  } catch {}
}

/**
 * Limpa o ID da sessão local
 */
export function clearLocalSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(LEGACY_SESSION_STORAGE_KEY)
    localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY)
  } catch {}
}

/**
 * Regista o acesso da sessão atual de forma não-bloqueante no Firestore e no armazenamento local.
 * Suporta múltiplos dispositivos e abas em simultâneo sob a mesma conta Firebase.
 */
export async function registerUserSession(user: { uid: string }): Promise<string> {
  if (!user?.uid) return ''
  resetSessionTerminated()

  const sessionId = generateNewSessionId()
  const deviceId = getOrCreateDeviceId()
  const { platform, deviceInfo } = getDeviceInfo()

  // Guardar no armazenamento local para fins de telemetria/diagnóstico
  setLocalSessionId(sessionId)

  try {
    const sessionData: ActiveSessionData = {
      sessionId,
      deviceId,
      platform,
      deviceInfo,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      isActive: true,
    }

    const userRef = doc(db, 'users', user.uid)
    await setDoc(
      userRef,
      {
        activeSession: sessionData,
        currentSessionId: sessionId, // Mantido para compatibilidade sem efeito de bloqueio
        lastLoginAt: new Date().toISOString(),
        lastSessionUpdate: serverTimestamp(),
        lastPlatform: platform,
        lastDeviceInfo: deviceInfo,
      },
      { merge: true }
    )

    console.log('[SESSION] Sessão registada com sucesso no Firebase (Multi-dispositivo ativo):', {
      uid: user.uid,
      platform,
      deviceInfo,
    })
  } catch (error) {
    console.warn('[SESSION] Aviso ao registar sessão no Firestore:', error)
  }

  return sessionId
}

/**
 * Valida a sessão local.
 * No modelo multi-dispositivo, qualquer dispositivo autenticado com a conta é válido.
 */
export function isSessionValid(userData: any): boolean {
  if (!userData) return false
  return true
}

/**
 * Valida a existência do utilizador no servidor Firestore.
 * Não bloqueia por dispositivo nem compara sessionIds exclusivos.
 */
export async function validateSessionWithServer(userId: string): Promise<boolean> {
  if (!userId || typeof window === 'undefined') return false

  try {
    const userRef = doc(db, 'users', userId)
    const serverSnap = await getDocFromServer(userRef)
    return serverSnap.exists()
  } catch (err) {
    console.warn('[SESSION] Aviso na verificação de conectividade com servidor:', err)
    return true // Falhas momentâneas de rede não invalidam o utilizador
  }
}

/**
 * Termina apenas a sessão do cliente local (ex.: logout explícito do utilizador).
 * Nunca bloqueia a conta global nem exibe mensagem de conflito de dispositivos.
 */
export async function terminateLocalSession(
  _reason?: string
): Promise<void> {
  markSessionTerminated()
  clearLocalSession()

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_CONFLICT_MESSAGE_KEY)
      sessionStorage.removeItem(SESSION_CONFLICT_MESSAGE_KEY)
    } catch {}
  }

  try {
    if (auth && auth.currentUser) {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    }
  } catch (err) {
    console.warn('[SESSION] Erro ao executar signOut local:', err)
  }
}

