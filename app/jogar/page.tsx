'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuizPage } from '@/components/quiz/page'
import { ARENA_SHOP_CATALOG } from '@/data/shopArenas'
import { AppBackground } from '@/components/AppBackground'

function JogarContainer() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('cat')
  const gameParam = searchParams.get('game')
  const isPlaying = Boolean(categoryParam || gameParam)
  
  const [arenaImage, setArenaImage] = useState<string>('')

  useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const savedImage = localStorage.getItem('equipped_arena_image')
        const savedArena = localStorage.getItem('equipped_arena')

        if (savedImage && savedImage.startsWith('/') && !savedImage.includes('hero-bg') && !savedImage.includes('fundo-espaco')) {
          setArenaImage(savedImage)
        } else if (savedArena) {
          const catalogItem = ARENA_SHOP_CATALOG.find((a) => a.id === savedArena)
          if (catalogItem?.image) {
            setArenaImage(catalogItem.image)
          } else {
            setArenaImage('/arenas/arena-1.jpg')
          }
        } else {
          setArenaImage('')
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
    <div className="relative min-h-screen w-full isolate overflow-x-hidden bg-slate-950 text-white flex flex-col justify-between">
      {/* 1. FUNDO DINÂMICO DA ARENA ATIVA (Game Board Background) */}
      <div 
        className="game-arena-container pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-500 will-change-transform scale-[1.01]" 
        style={{
          backgroundImage: `url(${arenaImage || '/arenas/arena-1.jpg'})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100vw",
          height: "100vh"
        }}
      />

      {/* 2. MÁSCARA SUBTIL PARA LEGIBILIDADE DAS QUESTÕES */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-slate-950/40" />

      {/* 3. CONTEÚDO DA CENTRAL DE JOGO / TABULEIRO DE QUIZ */}
      <main className="relative z-10 w-full max-w-4xl mx-auto min-h-screen p-4 flex flex-col justify-between bg-transparent">
        <QuizPage />
      </main>
    </div>
  )
}

export default function JogarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <JogarContainer />
    </Suspense>
  )
}
