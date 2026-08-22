'use client'

import React, { useEffect, useRef } from 'react'
import type { ArenaEffect } from '@/data/shopArenas'

interface ArenaEffectsLayerProps {
  effect?: ArenaEffect
  intensity?: 'low' | 'medium' | 'high'
  showContrastOverlay?: boolean
  className?: string
}

export function ArenaEffectsLayer({
  effect = 'particles',
  intensity = 'medium',
  showContrastOverlay = true,
  className = '',
}: ArenaEffectsLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (effect === 'none') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Particle multiplier
    const countMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1.0

    // Effect Items
    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      alpha: number
      color: string
      phase?: number
      length?: number
    }

    const particles: Particle[] = []

    if (effect === 'rain') {
      const count = Math.floor(70 * countMultiplier)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.8,
          speedX: -1.5,
          speedY: Math.random() * 8 + 12,
          alpha: Math.random() * 0.4 + 0.2,
          color: '#38bdf8',
          length: Math.random() * 15 + 10,
        })
      }
    } else if (effect === 'fire' || effect === 'lava') {
      const count = Math.floor((effect === 'lava' ? 55 : 45) * countMultiplier)
      const colors = effect === 'lava' ? ['#f97316', '#ef4444', '#fbbf24', '#dc2626'] : ['#f59e0b', '#ef4444', '#f97316', '#fbbf24']
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: height + Math.random() * 40,
          size: Math.random() * 3.5 + 1.5,
          speedX: (Math.random() - 0.5) * 1.8,
          speedY: -(Math.random() * 2.5 + 1.5),
          alpha: Math.random() * 0.8 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else if (effect === 'stars') {
      const count = Math.floor(60 * countMultiplier)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.8,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          alpha: Math.random() * 0.8 + 0.2,
          color: Math.random() > 0.3 ? '#ffffff' : '#38bdf8',
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else if (effect === 'waves' || effect === 'fog') {
      const count = Math.floor(25 * countMultiplier)
      const color = effect === 'waves' ? '#06b6d4' : '#94a3b8'
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 60 + 40,
          speedX: Math.random() * 0.4 + 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          alpha: Math.random() * 0.12 + 0.04,
          color,
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else if (effect === 'fireworks') {
      const count = Math.floor(50 * countMultiplier)
      const colors = ['#f43f5e', '#fbbf24', '#06b6d4', '#a855f7', '#10b981', '#ffffff']
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3,
          alpha: Math.random() * 0.7 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else if (effect === 'lightning') {
      const count = Math.floor(35 * countMultiplier)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          alpha: Math.random() * 0.7 + 0.2,
          color: Math.random() > 0.4 ? '#a855f7' : '#38bdf8',
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else {
      // General Glowing particles (Gold/Cyan)
      const count = Math.floor(40 * countMultiplier)
      const colors = ['#f59e0b', '#06b6d4', '#10b981', '#ffffff']
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          alpha: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    let lightningFlash = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Optional Lightning Random Flashes
      if (effect === 'lightning') {
        if (Math.random() < 0.015 && lightningFlash <= 0) {
          lightningFlash = Math.random() * 0.25 + 0.1
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(168, 85, 247, ${lightningFlash})`
          ctx.fillRect(0, 0, width, height)
          lightningFlash -= 0.03
        }
      }

      particles.forEach((p) => {
        if (effect === 'rain') {
          ctx.beginPath()
          ctx.strokeStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.lineWidth = p.size
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.speedX * 2, p.y + (p.length || 12))
          ctx.stroke()

          p.x += p.speedX
          p.y += p.speedY

          if (p.y > height) {
            p.y = -10
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x = width
        } else if (effect === 'waves' || effect === 'fog') {
          p.phase = (p.phase || 0) + 0.01
          const pulse = Math.sin(p.phase) * 0.03

          ctx.beginPath()
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
          grad.addColorStop(0, p.color)
          grad.addColorStop(1, 'transparent')
          ctx.fillStyle = grad
          ctx.globalAlpha = Math.max(0.01, p.alpha + pulse)
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()

          p.x += p.speedX
          p.y += p.speedY

          if (p.x - p.size > width) p.x = -p.size
        } else {
          // Dots / Ember particles
          p.phase = (p.phase || 0) + 0.03
          const pulse = Math.sin(p.phase) * 0.2

          ctx.beginPath()
          ctx.fillStyle = p.color
          ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha + pulse))
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()

          p.x += p.speedX
          p.y += p.speedY

          if (effect === 'fire' || effect === 'lava') {
            if (p.y < -10) {
              p.y = height + 10
              p.x = Math.random() * width
            }
          } else {
            if (p.x < 0) p.x = width
            if (p.x > width) p.x = 0
            if (p.y < 0) p.y = height
            if (p.y > height) p.y = 0
          }
        }
      })

      ctx.globalAlpha = 1.0
      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [effect, intensity])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Dynamic Particle Canvas */}
      {effect !== 'none' && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
      )}

      {/* Camada de contraste escuro e legibilidade máxima para o Quiz */}
      {showContrastOverlay && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
      )}
    </div>
  )
}
export default ArenaEffectsLayer
