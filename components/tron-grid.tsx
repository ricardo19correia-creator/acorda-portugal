'use client'

import React, { useEffect, useRef } from 'react'

interface Pulse {
  x: number
  y: number
  targetX: number
  targetY: number
  progress: number
  speed: number
  color: string
}

export function TronGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const gridSize = 60
    const colors = ['#00f3ff', '#39ff14', '#ffb703', '#00e5ff']
    const pulses: Pulse[] = []

    const spawnPulse = () => {
      if (pulses.length >= 25) return
      const cols = Math.floor(width / gridSize)
      const rows = Math.floor(height / gridSize)
      const startCol = Math.floor(Math.random() * cols)
      const startRow = Math.floor(Math.random() * rows)
      const isHorizontal = Math.random() > 0.5
      const length = (Math.floor(Math.random() * 4) + 2) * gridSize

      pulses.push({
        x: startCol * gridSize,
        y: startRow * gridSize,
        targetX: startCol * gridSize + (isHorizontal ? length : 0),
        targetY: startRow * gridSize + (!isHorizontal ? length : 0),
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Grelha de perspetiva subtil
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.07)'
      ctx.lineWidth = 1

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Criar novos feixes luminosos
      if (Math.random() < 0.25) spawnPulse()

      // Desenhar feixes em movimento
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.progress += p.speed

        const currX = p.x + (p.targetX - p.x) * p.progress
        const currY = p.y + (p.targetY - p.y) * p.progress
        const tailX = p.x + (p.targetX - p.x) * Math.max(0, p.progress - 0.35)
        const tailY = p.y + (p.targetY - p.y) * Math.max(0, p.progress - 0.35)

        ctx.save()
        ctx.shadowColor = p.color
        ctx.shadowBlur = 12
        ctx.strokeStyle = p.color
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(currX, currY)
        ctx.stroke()

        // Ponto brilhante na cabeça do feixe
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (p.progress >= 1) {
          pulses.splice(i, 1)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none w-full h-full"
      style={{ opacity: 0.85 }}
    />
  )
}
