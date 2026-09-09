'use client'

import { useSyncExternalStore, useCallback } from 'react'

/**
 * 🇵🇹 ACORDA PORTUGAL — DEFINIÇÕES DE VÍDEO DE FUNDO
 * 
 * Permite ao utilizador ativar ou desativar a reprodução do vídeo global de fundo.
 * Persistência automática no localStorage existente sob a chave 'ap_bg_video_enabled'.
 * Implementado com useSyncExternalStore (React 19 / Next.js) para máxima reatividade
 * sem cascading renders nem erros de hidratação.
 */

const STORAGE_KEY = 'ap_bg_video_enabled'
const EVENT_NAME = 'ap_bg_video_changed'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener(EVENT_NAME, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(EVENT_NAME, callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const val = localStorage.getItem(STORAGE_KEY)
    if (val === null) return true // Por predefinição: ativado
    return val === 'true'
  } catch {
    return true
  }
}

function getServerSnapshot(): boolean {
  return true
}

export function getBackgroundVideoSetting(): boolean {
  return getSnapshot()
}

export function setBackgroundVideoSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { enabled } }))
  } catch (e) {
    console.warn('[VideoSettings] Erro ao gravar preferência no localStorage:', e)
  }
}

export function useBackgroundVideoSettings() {
  const isVideoEnabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(() => {
    setBackgroundVideoSetting(!getSnapshot())
  }, [])

  const setEnabled = useCallback((val: boolean) => {
    setBackgroundVideoSetting(val)
  }, [])

  return { isVideoEnabled, toggleVideo: toggle, setVideoEnabled: setEnabled }
}
