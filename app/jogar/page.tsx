'use client'

import React, { useState, useEffect } from 'react'
import { QuizPage } from '@/components/quiz/page'

export default function JogarPage() {
  const [arenaImage, setArenaImage] = useState<string>('/arenas/arena-ponte-2077.jpg')

  useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const savedImage = localStorage.getItem('equipped_arena_image')
        const savedArena = localStorage.getItem('equipped_arena')
        if (savedImage && savedImage.startsWith('/')) {
          setArenaImage(savedImage)
        } else if (savedArena === 'theme_arena_biblioteca_sagrada') {
          setArenaImage('/arenas/biblioteca-sagrada.jpg')
        } else {
          setArenaImage('/arenas/arena-ponte-2077.jpg')
        }
      }
    }
    sync()
    window.addEventListener('arenaChanged', sync)
    window.addEventListener('inventory_updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('arenaChanged', sync)
      window.removeEventListener('inventory_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full text-white bg-transparent flex flex-col justify-between overflow-x-hidden">
      {/* CAMADA DA ARENA (Fica por cima do fundo global do site com z-0) */}
      <div 
        className="fixed inset-0 z-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 8, 18, 0.60), rgba(5, 8, 18, 0.70)), url('${arenaImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* CONTEÚDO DO QUIZ (Fica por cima da arena com z-10) */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col justify-between bg-transparent">
          <QuizPage />
        </div>
      </div>
    </div>
  )
}
