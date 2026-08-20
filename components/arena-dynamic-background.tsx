'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { useGameTheme } from '@/context/game-theme-context'
import { normalizeThemeId } from '@/lib/cosmetics'
import { cn } from '@/lib/utils'

interface ArenaDynamicBackgroundProps {
  className?: string
  overrideThemeId?: string | null
  streak?: number
  isAnswering?: boolean
}

export const ArenaBackground = ArenaDynamicBackground

export function ArenaDynamicBackground({
  className,
  overrideThemeId,
  streak = 0,
  isAnswering = false,
}: ArenaDynamicBackgroundProps) {
  const { themeId: contextThemeId, currentStreak } = useGameTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const effectiveThemeId = normalizeThemeId(overrideThemeId || contextThemeId || 'default')
  const effectiveStreak = streak || currentStreak || 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const isMobile = width < 768
    const particleCount = isMobile ? 25 : 50

    // Configuração de partículas por tema
    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      alpha: number
      pulseSpeed: number
      pulsePhase: number
    }

    const getThemeColors = (theme: string) => {
      switch (theme) {
        case 'theme_fado_cyberpunk':
          return ['#a855f7', '#f59e0b', '#c084fc', '#d97706', '#fbbf24']
        case 'theme_ondas_nazare':
          return ['#06b6d4', '#3b82f6', '#22d3ee', '#60a5fa', '#38bdf8']
        case 'theme_vulcao_acores':
          return ['#ef4444', '#f97316', '#fbbf24', '#dc2626', '#ea580c']
        case 'theme_matriz_tron':
          return ['#10b981', '#06b6d4', '#34d399', '#22d3ee']
        case 'theme_templo_dinis':
          return ['#eab308', '#f59e0b', '#fde047', '#fef08a', '#d97706']
        case 'theme_matriz_cosmica':
          return ['#8b5cf6', '#06b6d4', '#c084fc', '#67e8f9', '#a855f7']
        default:
          return ['#10b981', '#06b6d4', '#f59e0b']
      }
    }

    const colors = getThemeColors(effectiveThemeId)

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.2,
      speedX: (Math.random() - 0.5) * (effectiveThemeId === 'theme_vulcao_acores' ? 0.6 : 0.8),
      speedY:
        effectiveThemeId === 'theme_vulcao_acores'
          ? -(Math.random() * 1.8 + 0.8) // Brasas a subir no vulcão
          : effectiveThemeId === 'theme_ondas_nazare'
            ? Math.sin(Math.random() * Math.PI) * 0.9
            : (Math.random() - 0.5) * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    let time = 0

    const render = () => {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      // 1. FUNDOS ESPECÍFICOS DE ARENA
      if (effectiveThemeId === 'theme_fado_cyberpunk') {
        // Fundo em tons púrpura e néon âmbar com névoa
        const grad = ctx.createLinearGradient(0, 0, width, height)
        grad.addColorStop(0, '#130826')
        grad.addColorStop(0.5, '#1e0f1d')
        grad.addColorStop(1, '#08030e')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        // Névoa animada púrpura
        const fogAlpha = 0.08 + Math.sin(time * 0.8) * 0.03
        ctx.fillStyle = `rgba(168, 85, 247, ${fogAlpha})`
        ctx.beginPath()
        ctx.arc(width * 0.3, height * 0.4, width * 0.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(245, 158, 11, ${fogAlpha * 0.8})`
        ctx.beginPath()
        ctx.arc(width * 0.75, height * 0.6, width * 0.4, 0, Math.PI * 2)
        ctx.fill()
      } else if (effectiveThemeId === 'theme_ondas_nazare') {
        // Fundo azul-marinho profundo com feixes de luz bio-luminescentes
        const grad = ctx.createLinearGradient(0, 0, 0, height)
        grad.addColorStop(0, '#031124')
        grad.addColorStop(0.5, '#051833')
        grad.addColorStop(1, '#020712')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        // Feixes de luz submarinos verticais
        for (let i = 0; i < 4; i++) {
          const beamX = width * (0.2 + i * 0.22) + Math.sin(time + i) * 30
          const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 40, height)
          beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0.12)')
          beamGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.05)')
          beamGrad.addColorStop(1, 'transparent')

          ctx.fillStyle = beamGrad
          ctx.beginPath()
          ctx.moveTo(beamX, 0)
          ctx.lineTo(beamX + 60, 0)
          ctx.lineTo(beamX + 180, height)
          ctx.lineTo(beamX - 40, height)
          ctx.closePath()
          ctx.fill()
        }
      } else if (effectiveThemeId === 'theme_vulcao_acores') {
        // Fundo de basalto vulcânico com brasas ardentes
        const grad = ctx.createLinearGradient(0, height, 0, 0)
        grad.addColorStop(0, '#260606')
        grad.addColorStop(0.4, '#140404')
        grad.addColorStop(1, '#060101')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        // Pulso de calor na base
        const magmaGlow = 0.15 + Math.sin(time * 2) * 0.06
        const baseGrad = ctx.createRadialGradient(
          width / 2,
          height,
          50,
          width / 2,
          height,
          height * 0.7,
        )
        baseGrad.addColorStop(0, `rgba(239, 68, 68, ${magmaGlow})`)
        baseGrad.addColorStop(0.5, `rgba(249, 115, 22, ${magmaGlow * 0.6})`)
        baseGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = baseGrad
        ctx.fillRect(0, 0, width, height)
      } else if (effectiveThemeId === 'theme_matriz_tron') {
        // Grelha digital verde-esmeralda vibrante
        ctx.fillStyle = '#030a06'
        ctx.fillRect(0, 0, width, height)

        const gridSize = isMobile ? 40 : 55
        const gridAlpha = 0.06 + Math.sin(time * 1.5) * 0.02
        ctx.strokeStyle = `rgba(16, 185, 129, ${gridAlpha})`
        ctx.lineWidth = 1

        ctx.beginPath()
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()
      } else if (effectiveThemeId === 'theme_templo_dinis') {
        // Fundo preto e ouro puro escovado com reflexos volumétricos
        const grad = ctx.createRadialGradient(
          width / 2,
          height * 0.3,
          20,
          width / 2,
          height * 0.5,
          width * 0.8,
        )
        grad.addColorStop(0, '#231804')
        grad.addColorStop(0.5, '#120d02')
        grad.addColorStop(1, '#050400')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        // Feixes de luz volumétrica dourada do topo
        const goldBeam = ctx.createLinearGradient(width / 2, 0, width / 2, height)
        goldBeam.addColorStop(0, 'rgba(234, 179, 8, 0.12)')
        goldBeam.addColorStop(0.6, 'rgba(245, 158, 11, 0.04)')
        goldBeam.addColorStop(1, 'transparent')
        ctx.fillStyle = goldBeam
        ctx.fillRect(0, 0, width, height)
      } else if (effectiveThemeId === 'theme_matriz_cosmica') {
        // Matriz Cósmica dos Descobrimentos: Índigo/Violeta com Nebulosa e Constelações
        const grad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.4,
          50,
          width * 0.5,
          height * 0.5,
          width * 0.9,
        )
        grad.addColorStop(0, '#1a0b36')
        grad.addColorStop(0.5, '#0e0524')
        grad.addColorStop(1, '#03010a')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        // Ondas de choque néon e poeira holográfica
        const shockWaveRadius = ((time * 40) % (width * 0.8)) + 30
        const shockAlpha = Math.max(0, 0.15 - (shockWaveRadius / (width * 0.8)) * 0.15)
        ctx.strokeStyle = `rgba(139, 92, 246, ${shockAlpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(width * 0.5, height * 0.45, shockWaveRadius, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // Default nacional
        ctx.fillStyle = '#060907'
        ctx.fillRect(0, 0, width, height)
      }

      // 2. DESENHAR E ANIMAR PARTÍCULAS VIVAS
      particles.forEach((p) => {
        p.pulsePhase += p.pulseSpeed
        const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulsePhase) * 0.4)

        ctx.save()
        ctx.fillStyle = p.color
        ctx.globalAlpha = currentAlpha
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        p.x += p.speedX
        p.y += p.speedY

        // Reposicionamento suave ao sair dos limites
        if (effectiveThemeId === 'theme_vulcao_acores') {
          if (p.y < -10) {
            p.y = height + 10
            p.x = Math.random() * width
          }
        } else {
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          if (p.y > height + 10) p.y = -10
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [effectiveThemeId])

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-[-1] overflow-hidden select-none',
        className,
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* VULCÃO DOS AÇORES: REBORDO DE ECRÃ A PULSAR EM VERMELHO-LAVA NOS STREAKS ALTOS (>= 3) */}
      {effectiveThemeId === 'theme_vulcao_acores' && effectiveStreak >= 3 && (
        <div className="absolute inset-0 pointer-events-none border-4 sm:border-8 border-red-500/60 shadow-[inset_0_0_60px_rgba(239,68,68,0.5)] animate-pulse" />
      )}

      {/* CHAMA TRIPLA: CONTORNO VERDE NÉON INCANDESCENTE */}
      {effectiveStreak >= 3 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981]" />
      )}
    </div>
  )
}
