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

  // 1. Gestão e Autoplay do Vídeo com Retry Seguro e Resiliente
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Resolução crítica do React bug #10389: forçar propriedades nativas no nó DOM
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', 'true')

    let retryTimeout: NodeJS.Timeout | null = null
    let rafId: number | null = null

    const attemptPlay = () => {
      if (!shouldPlayVideo || !video) return
      if (typeof document !== 'undefined' && document.documentElement.classList.contains('ap-arena-match')) return

      video.muted = true
      const p = video.play()
      if (p !== undefined) {
        p.catch(() => {
          // Retry no próximo frame de animação ou timeout caso o decoder ainda esteja a preparar o primeiro frame
          if (typeof window !== 'undefined') {
            rafId = window.requestAnimationFrame(() => {
              if (shouldPlayVideo && video && video.paused) {
                video.muted = true
                video.play().catch(() => {})
              }
            })
          }
          if (retryTimeout) clearTimeout(retryTimeout)
          retryTimeout = setTimeout(() => {
            if (shouldPlayVideo && video && video.paused) {
              video.muted = true
              video.play().catch(() => {})
            }
          }, 300)
        })
      }
    }

    if (shouldPlayVideo) {
      attemptPlay()
    } else {
      video.pause()
    }

    video.addEventListener('loadedmetadata', attemptPlay)
    video.addEventListener('loadeddata', attemptPlay)
    video.addEventListener('canplay', attemptPlay)
    video.addEventListener('canplaythrough', attemptPlay)

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      if (rafId && typeof window !== 'undefined') window.cancelAnimationFrame(rafId)
      video.removeEventListener('loadedmetadata', attemptPlay)
      video.removeEventListener('loadeddata', attemptPlay)
      video.removeEventListener('canplay', attemptPlay)
      video.removeEventListener('canplaythrough', attemptPlay)
    }
  }, [shouldPlayVideo])

  // 2. Desbloquear autoplay em interações do utilizador caso o browser/WebView exija gesto inicial
  useEffect(() => {
    if (!shouldPlayVideo || typeof window === 'undefined') return

    const handleInteraction = () => {
      const video = videoRef.current
      if (video && video.paused && shouldPlayVideo) {
        video.muted = true
        video.play().catch(() => {})
      }
    }

    window.addEventListener('click', handleInteraction, { passive: true, once: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true, once: true })
    window.addEventListener('pointerdown', handleInteraction, { passive: true, once: true })
    window.addEventListener('scroll', handleInteraction, { passive: true, once: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [shouldPlayVideo])

  // 3. Gestão de Mudança de Visibilidade (Troca de Tab / Segundo Plano no Mobile/APK)
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

  // 4. Blindagem direta do DOM para a Exceção da Arena
  useEffect(() => {
    if (typeof document === 'undefined') return
    const v = videoRef.current || (document.getElementById('global-background-video') as HTMLVideoElement | null)
    const c = document.getElementById('global-background-container')

    if (!shouldPlayVideo) {
      document.documentElement.classList.add('ap-arena-match')
      if (v) {
        v.pause()
        v.style.setProperty('display', 'none', 'important')
      }
      if (c) c.style.setProperty('display', 'none', 'important')
    } else {
      document.documentElement.classList.remove('ap-arena-match')
      if (v) {
        v.style.display = 'block'
        v.muted = true
        v.play().catch(() => {})
      }
      if (c) c.style.display = 'block'
    }
  }, [shouldPlayVideo])

  return (
    <div
      id="global-background-container"
      className={
        shouldPlayVideo
          ? 'fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden block'
          : 'hidden'
      }
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#050706',
        display: shouldPlayVideo ? 'block' : 'none',
      }}
      aria-hidden={!shouldPlayVideo}
    >
      {/* 0 → VÍDEO GLOBAL DE FUNDO */}
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
        controls={false}
        disablePictureInPicture
        // @ts-ignore
        disableRemotePlayback
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none block"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          display: 'block',
        }}
      >
        <source src="/videos/global-background.mp4" type="video/mp4" />
      </video>

      {/* 1 → OVERLAY SUAVE PARA GARANTIR CONTRASTE E LEGIBILIDADE DA UI */}
      <div
        id="global-background-overlay"
        className="absolute inset-0 w-full h-full pointer-events-none select-none block"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: 'rgba(5, 7, 6, 0.18)',
        }}
      />
    </div>
  )
}

export default memo(GlobalBackgroundVideo)

