'use client'

import React, { useRef, useEffect, useState, useMemo, memo } from 'react'
import { useIsActiveArenaGame } from '@/lib/game-active-state'
import { useBackgroundVideoSettings } from '@/lib/video-background-settings'

/**
 * 🇵🇹 ACORDA PORTUGAL — GLOBAL BACKGROUND VIDEO
 * 
 * Fundo visual global oficial de todas as páginas normais do jogo.
 * Elemento: public/videos/global-background.mp4
 * 
 * Hierarquia Visual Estrita:
 *   0  → #global-background-video (position: fixed, inset: 0, 100vw, 100vh, z-index: 0)
 *   1  → #global-background-overlay (rgba(5, 7, 6, 0.18), z-index: 1)
 *   10 → UI / Conteúdo da aplicação (relative z-10)
 * 
 * Regra de Ouro:
 *   - SEM fallback visual estático
 *   - SEM poster
 *   - SEM imagem estática
 *   - Exceção única: Durante partida ativa de arena (isActiveArenaGame === true),
 *     o vídeo global é desligado (OFF) e o background próprio da arena assume o ecrã.
 */
export function GlobalBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isActiveArenaGame = useIsActiveArenaGame()
  const { isVideoEnabled } = useBackgroundVideoSettings()

  const shouldPlayVideo = useMemo(() => {
    return !isActiveArenaGame && isVideoEnabled
  }, [isActiveArenaGame, isVideoEnabled])

  if (typeof window !== 'undefined') {
    ;(window as any).__GLOBAL_BG_DEBUG = {
      isActiveArenaGame,
      isVideoEnabled,
      shouldPlayVideo,
      time: Date.now()
    }
  }

  // 1. Gestão e Autoplay do Vídeo com Retry Seguro
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Resolução crítica do React bug #10389: forçar propriedades nativas no nó DOM
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')

    let retryTimeout: NodeJS.Timeout | null = null

    const attemptPlay = () => {
      if (!shouldPlayVideo || !video) return
      if (typeof document !== 'undefined' && document.documentElement.classList.contains('ap-arena-match')) return
      video.muted = true
      const p = video.play()
      if (p !== undefined) {
        p.catch(() => {
          // Retry seguro caso o browser ainda esteja a descodificar o primeiro frame
          if (retryTimeout) clearTimeout(retryTimeout)
          retryTimeout = setTimeout(() => {
            if (shouldPlayVideo && video && video.paused) {
              video.muted = true
              video.play().catch(() => {})
            }
          }, 400)
        })
      }
    }

    if (shouldPlayVideo) {
      attemptPlay()
    } else {
      video.pause()
    }

    video.addEventListener('loadeddata', attemptPlay)
    video.addEventListener('loadedmetadata', attemptPlay)
    video.addEventListener('canplay', attemptPlay)
    video.addEventListener('canplaythrough', attemptPlay)

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      video.removeEventListener('loadeddata', attemptPlay)
      video.removeEventListener('loadedmetadata', attemptPlay)
      video.removeEventListener('canplay', attemptPlay)
      video.removeEventListener('canplaythrough', attemptPlay)
    }
  }, [shouldPlayVideo])

  // 2. Desbloquear autoplay em interações do utilizador caso o browser restrinja
  useEffect(() => {
    if (!shouldPlayVideo || typeof window === 'undefined') return

    const handleInteraction = () => {
      const video = videoRef.current
      if (video && video.paused && shouldPlayVideo) {
        video.muted = true
        video.play().catch(() => {})
      }
    }

    window.addEventListener('click', handleInteraction, { passive: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true })
    window.addEventListener('pointerdown', handleInteraction, { passive: true })
    window.addEventListener('scroll', handleInteraction, { passive: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [shouldPlayVideo])

  // 3. Gestão de Mudança de Visibilidade (Tab / Mobile Backgrounding)
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      const video = videoRef.current
      if (!video) return

      if (document.hidden || !shouldPlayVideo) {
        video.pause()
      } else {
        video.muted = true
        video.play().catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [shouldPlayVideo])

  // 4. Blindagem direta de DOM: pausa e oculta se estiver em partida ativa de arena
  useEffect(() => {
    if (typeof document === 'undefined') return
    const v = videoRef.current || (document.getElementById('global-background-video') as HTMLVideoElement | null)
    const o = document.getElementById('global-background-overlay')
    const c = document.getElementById('global-background-container')

    if (!shouldPlayVideo) {
      document.documentElement.classList.add('ap-arena-match')
      if (v) {
        v.pause()
        v.style.setProperty('display', 'none', 'important')
      }
      if (o) o.style.setProperty('display', 'none', 'important')
      if (c) c.style.setProperty('display', 'none', 'important')
    } else {
      document.documentElement.classList.remove('ap-arena-match')
      if (v) {
        v.style.display = 'block'
        v.muted = true
        v.play().catch(() => {})
      }
      if (o) o.style.display = 'block'
      if (c) c.style.display = 'block'
    }
  }, [shouldPlayVideo])

  return (
    <div
      id="global-background-container"
      className={shouldPlayVideo ? 'block' : 'hidden'}
      style={{ display: shouldPlayVideo ? 'block' : 'none' }}
      aria-hidden={!shouldPlayVideo}
    >
      {/* 0 → GLOBAL VIDEO */}
      <video
        ref={videoRef}
        id="global-background-video"
        src="/videos/global-background.mp4"
        autoPlay
        muted
        loop
        playsInline
        // @ts-ignore - atributo específico para iOS WebKit / Safari / Capacitor
        webkit-playsinline="true"
        preload="auto"
        className={
          shouldPlayVideo
            ? 'fixed inset-0 w-screen h-screen object-cover pointer-events-none select-none block'
            : 'hidden'
        }
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          display: shouldPlayVideo ? 'block' : 'none',
        }}
      >
        <source src="/videos/global-background.mp4" type="video/mp4" />
      </video>

      {/* 1 → OVERLAY TRANSPARENTE PARA CONTRASTE DA UI */}
      <div
        id="global-background-overlay"
        className={
          shouldPlayVideo
            ? 'fixed inset-0 w-screen h-screen pointer-events-none select-none block'
            : 'hidden'
        }
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          background: 'rgba(5, 7, 6, 0.18)',
          display: shouldPlayVideo ? 'block' : 'none',
        }}
      />
    </div>
  )
}

export default memo(GlobalBackgroundVideo)

