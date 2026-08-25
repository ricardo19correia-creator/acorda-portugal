'use client'

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const ACTIVE_SESSION_STORAGE_KEY = 'active_session_id'

/**
 * Gera um identificador único de sessão e regista-o no Firestore e no armazenamento do browser
 */
export async function registerUserSession(user: { uid: string }): Promise<string> {
  if (!user?.uid) return ''

  // Gerar ID único de sessão
  const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)
    } catch (e) {
      console.warn('[SESSION] Erro ao guardar sessão local:', e)
    }
  }

  try {
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      currentSessionId: sessionId,
      lastLoginAt: new Date().toISOString(),
      lastSessionUpdate: serverTimestamp(),
    })
    console.log('[SESSION] Nova sessão registada com sucesso:', sessionId)
  } catch (error) {
    console.warn('[SESSION] Aviso ao registar sessão no Firestore:', error)
  }

  return sessionId
}

/**
 * Obtém o ID da sessão ativa neste navegador/aba
 */
export function getLocalSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) || localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Define o ID da sessão local
 */
export function setLocalSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)
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
  } catch {}
}
