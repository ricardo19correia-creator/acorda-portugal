'use client'

import React, { useEffect, useRef } from 'react'
import type { SupremeArenaEffectType } from '@/lib/supreme-arenas'

export interface SupremeArenaAtmosphereProps {
  effectType?: SupremeArenaEffectType | string
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  burstTrigger?: 'correct' | 'wrong' | null
  className?: string
}

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  alpha: number
  baseAlpha: number
  color: string
  pulseSpeed?: number
  phase?: number
  shape?: 'circle' | 'star' | 'square' | 'ray'
}

export function SupremeArenaAtmosphere({
  effectType = 'palacio_dourado',
  quality = 'ultra',
  burstTrigger = null,
  className = '',
}: SupremeArenaAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number | null>(null)
  const burstTimeRef = useRef<number>(0)
  const burstTypeRef = useRef<'correct' | 'wrong' | null>(null)

  // Disparar efeito explosivo em resposta
  useEffect(() => {
    if (burstTrigger) {
      burstTimeRef.current = Date.now()
      burstTypeRef.current = burstTrigger

      // Injetar 40 partículas explosivas no centro
      const canvas = canvasRef.current
      if (canvas) {
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const isCorrect = burstTrigger === 'correct'
        const burstColor = isCorrect ? '#fbbf24' : '#ef4444'

        for (let i = 0; i < 45; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 8 + 4
          particlesRef.current.push({
            x: cx,
            y: cy,
            size: Math.random() * 4 + 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            baseAlpha: 1,
            color: isCorrect ? (Math.random() > 0.5 ? '#fef08a' : '#f59e0b') : burstColor,
            pulseSpeed: 0.05,
          })
        }
      }
    }
  }, [burstTrigger])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const multiplier = quality === 'low' ? 0.35 : quality === 'medium' ? 0.7 : quality === 'high' ? 1.0 : 1.5
    const baseCount = Math.floor(45 * multiplier)

    // Inicializar partículas conforme a atmosfera
    const particles: Particle[] = []

    for (let i = 0; i < baseCount; i++) {
      let color = '#fbbf24'
      let vy = -0.5
      let vx = (Math.random() - 0.5) * 0.4
      let size = Math.random() * 3 + 1.2
      let shape: 'circle' | 'star' | 'square' | 'ray' = 'circle'

      if (effectType === 'palacio_dourado' || effectType === 'trono_supremo_final') {
        color = Math.random() > 0.4 ? '#fef08a' : Math.random() > 0.5 ? '#f59e0b' : '#fbbf24'
        vy = -(Math.random() * 0.8 + 0.3)
        vx = (Math.random() - 0.5) * 0.5
        shape = Math.random() > 0.7 ? 'star' : 'circle'
      } else if (effectType === 'estadio_holofotes') {
        color = Math.random() > 0.6 ? '#34d399' : Math.random() > 0.3 ? '#38bdf8' : '#ffffff'
        vy = Math.random() * 1.5 + 0.5
        vx = (Math.random() - 0.5) * 1.2
      } else if (effectType === 'portugal_3d_grid' || effectType === 'portugal_celestial_nebula') {
        color = Math.random() > 0.5 ? '#22d3ee' : Math.random() > 0.3 ? '#c084fc' : '#38bdf8'
        vy = (Math.random() - 0.5) * 0.6
        vx = (Math.random() - 0.5) * 0.6
      } else if (effectType === 'trono_chamas' || effectType === 'coliseu_campeonato') {
        color = Math.random() > 0.6 ? '#ef4444' : Math.random() > 0.3 ? '#f97316' : '#f59e0b'
        vy = -(Math.random() * 1.8 + 0.8)
        vx = (Math.random() - 0.5) * 0.8
      } else if (effectType === 'castelo_nevoeiro' || effectType === 'cidadela_montanhas') {
        color = Math.random() > 0.5 ? '#cbd5e1' : '#94a3b8'
        vy = (Math.random() - 0.5) * 0.3
        vx = Math.random() * 0.8 + 0.2
        size = Math.random() * 6 + 3
      } else if (effectType === 'ceu_aurora') {
        color = Math.random() > 0.5 ? '#10b981' : Math.random() > 0.5 ? '#ec4899' : '#8b5cf6'
        vy = (Math.random() - 0.5) * 0.4
        vx = (Math.random() - 0.5) * 0.4
        shape = 'star'
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        vx,
        vy,
        alpha: Math.random() * 0.7 + 0.2,
        baseAlpha: Math.random() * 0.7 + 0.2,
        color,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        shape,
      })
    }

    particlesRef.current = particles

    let tick = 0

    const render = () => {
      tick++
      ctx.clearRect(0, 0, width, height)

      // Efeito de onda de choque no acerto/erro
      if (burstTimeRef.current > 0) {
        const elapsed = Date.now() - burstTimeRef.current
        if (elapsed < 800) {
          const progress = elapsed / 800
          const radius = progress * Math.max(width, height) * 0.8
          const alpha = (1 - progress) * 0.35

          ctx.save()
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
          ctx.strokeStyle =
            burstTypeRef.current === 'correct'
              ? `rgba(250, 204, 21, ${alpha})`
              : `rgba(239, 68, 68, ${alpha})`
          ctx.lineWidth = 14 * (1 - progress)
          ctx.stroke()
          ctx.restore()
        }
      }

      // Desenhar holofotes dinâmicos para Estádio
      if (effectType === 'estadio_holofotes') {
        const beamAngle1 = Math.sin(tick * 0.02) * 0.35
        const beamAngle2 = -Math.sin(tick * 0.022) * 0.35

        ctx.save()
        // Holofote Esquerdo
        ctx.beginPath()
        ctx.moveTo(150, 60)
        ctx.lineTo(width / 2 + Math.tan(beamAngle1) * height - 120, height)
        ctx.lineTo(width / 2 + Math.tan(beamAngle1) * height + 120, height)
        ctx.closePath()
        const gradL = ctx.createLinearGradient(150, 60, width / 2, height)
        gradL.addColorStop(0, 'rgba(56, 189, 248, 0.35)')
        gradL.addColorStop(1, 'rgba(56, 189, 248, 0)')
        ctx.fillStyle = gradL
        ctx.fill()

        // Holofote Direito
        ctx.beginPath()
        ctx.moveTo(width - 150, 60)
        ctx.lineTo(width / 2 + Math.tan(beamAngle2) * height - 120, height)
        ctx.lineTo(width / 2 + Math.tan(beamAngle2) * height + 120, height)
        ctx.closePath()
        const gradR = ctx.createLinearGradient(width - 150, 60, width / 2, height)
        gradR.addColorStop(0, 'rgba(52, 211, 153, 0.35)')
        gradR.addColorStop(1, 'rgba(52, 211, 153, 0)')
        ctx.fillStyle = gradR
        ctx.fill()
        ctx.restore()
      }

      // Desenhar Partículas
      const currentList = particlesRef.current
      for (let i = currentList.length - 1; i >= 0; i--) {
        const p = currentList[i]
        p.x += p.vx
        p.y += p.vy

        if (p.phase !== undefined && p.pulseSpeed !== undefined) {
          p.phase += p.pulseSpeed
          p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase))
        }

        // Reciclagem de partículas
        if (p.y < -20) p.y = height + 10
        if (p.y > height + 20) p.y = -10
        if (p.x < -20) p.x = width + 10
        if (p.x > width + 20) p.x = -10

        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = quality === 'ultra' ? 12 : 6

        if (p.shape === 'star') {
          // Desenhar estrela de 4 pontas
          ctx.beginPath()
          const s = p.size * 1.5
          ctx.moveTo(p.x, p.y - s)
          ctx.lineTo(p.x + s * 0.3, p.y - s * 0.3)
          ctx.lineTo(p.x + s, p.y)
          ctx.lineTo(p.x + s * 0.3, p.y + s * 0.3)
          ctx.lineTo(p.x, p.y + s)
          ctx.lineTo(p.x - s * 0.3, p.y + s * 0.3)
          ctx.lineTo(p.x - s, p.y)
          ctx.lineTo(p.x - s * 0.3, p.y - s * 0.3)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [effectType, quality])

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
