'use client'

import React, { useState, useEffect } from 'react'
import { QuizPage } from '@/components/quiz/page'

export default function JogarPage() {
  const [arenaBg, setArenaBg] = useState<string>('/arenas/arena-ponte-2077.jpg')

  useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const savedArena = localStorage.getItem('equipped_arena')
        const savedImage = localStorage.getItem('equipped_arena_image')
        if (savedImage) {
          setArenaBg(savedImage)
        } else if (savedArena === 'arena_ponte_2077' || !savedArena) {
          setArenaBg('/arenas/arena-ponte-2077.jpg')
        } else if (savedArena === 'theme_arena_biblioteca_sagrada') {
          setArenaBg('/arenas/biblioteca-sagrada.jpg')
        } else if (savedArena.startsWith('/')) {
          setArenaBg(savedArena)
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      {/* Imagem de Fundo da Arena */}
      <div 
        className="fixed inset-0 -z-10 w-full h-full pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 29, 0.75), rgba(10, 15, 29, 0.90)), url('${arenaBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Conteúdo da partida (Cards, Pergunta, Botões) */}
      <div className="relative z-10">
        <QuizPage />
      </div>
    </div>
  )
}
