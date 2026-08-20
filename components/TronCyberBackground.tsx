'use client'

import React, { useEffect, useRef } from 'react'

export default function TronCyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

    // Configuração dos Feixes de Luz / Linhas Neon
    const isMobile = window.innerWidth < 768
    const lineCount = isMobile ? 18 : 35
    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#10b981']

    interface Beam {
      x: number
      y: number
      length: number
      speed: number
      horizontal: boolean
      color: string
      alpha: number
    }

    const beams: Beam[] = Array.from({ length: lineCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 120 + 80,
      speed: (Math.random() * 1.5 + 0.8) * (Math.random() > 0.5 ? 1 : -1),
      horizontal: Math.random() > 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.3,
    }))

    const render = () => {
      // Fundo preto com ligeira transparência para efeito de rasto suave
      ctx.fillStyle = '#060807'
      ctx.fillRect(0, 0, width, height)

      // 1. Desenhar Grelha Tron Subtil
      const gridSize = isMobile ? 50 : 60
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)'
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

      // 2. Animar e Desenhar Feixes de Luz Néon
      beams.forEach((beam) => {
        ctx.save()
        ctx.strokeStyle = beam.color
        ctx.lineWidth = 2
        ctx.shadowBlur = 12
        ctx.shadowColor = beam.color
        ctx.globalAlpha = beam.alpha

        ctx.beginPath()
        if (beam.horizontal) {
          const grad = ctx.createLinearGradient(beam.x, beam.y, beam.x + beam.length, beam.y)
          grad.addColorStop(0, 'transparent')
          grad.addColorStop(0.5, beam.color)
          grad.addColorStop(1, '#ffffff')
          ctx.strokeStyle = grad

          ctx.moveTo(beam.x, beam.y)
          ctx.lineTo(beam.x + beam.length, beam.y)
          beam.x += beam.speed

          if (beam.x > width) beam.x = -beam.length
          if (beam.x < -beam.length) beam.x = width
        } else {
          const grad = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.length)
          grad.addColorStop(0, 'transparent')
          grad.addColorStop(0.5, beam.color)
          grad.addColorStop(1, '#ffffff')
          ctx.strokeStyle = grad

          ctx.moveTo(beam.x, beam.y)
          ctx.lineTo(beam.x, beam.y + beam.length)
          beam.y += beam.speed

          if (beam.y > height) beam.y = -beam.length
          if (beam.y < -beam.length) beam.y = height
        }
        ctx.stroke()
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] w-full h-full"
      style={{ background: '#050706' }}
    />
  )
}
