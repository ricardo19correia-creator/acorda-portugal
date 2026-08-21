'use client'

import React, { useState, useEffect } from 'react'
import { QuizPage } from '@/components/quiz/page'

export default function JogarPage() {
  const [arenaImage, setArenaImage] = useState<string>('/arenas/fundo-espaco.gif')

  useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const savedImage = localStorage.getItem('equipped_arena_image')
        const savedArena = localStorage.getItem('equipped_arena')

        if (savedImage && savedImage.startsWith('/')) {
          setArenaImage(savedImage)
        } else if (savedArena === 'arena_matriz_cosmica' || savedArena === 'theme_arena_cosmic_matrix') {
          setArenaImage('/arenas/fundo-espaco.gif')
        } else if (savedArena === 'arena_ponte_2077' || savedArena === 'arena_neon_2088') {
          setArenaImage('/arenas/arena-ponte-2077.gif')
        } else if (savedArena === 'arena_fado_alfama' || savedArena === 'theme_noite_fado') {
          setArenaImage('/images/shop/arena-fado-alfama.jpg')
        } else if (savedArena === 'arena_fogo_acores' || savedArena === 'theme_volcano_acores') {
          setArenaImage('/images/shop/arena-fogo-acores.jpg')
        } else if (savedArena === 'theme_arena_biblioteca_sagrada') {
          setArenaImage('/arenas/biblioteca-sagrada.jpg')
        } else {
          setArenaImage('/arenas/fundo-espaco.gif')
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
      {/* Camada de Fundo GIF Animado Forçado */}
      <div 
        className="fixed inset-0 -z-50 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 10, 20, 0.50), rgba(5, 10, 20, 0.80)), url('${arenaImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* CONTEÚDO DO QUIZ */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between bg-transparent">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col justify-between bg-transparent">
          <QuizPage />
        </div>
      </div>
    </div>
  )
}
