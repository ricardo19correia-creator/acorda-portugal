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
    <div className="relative min-h-screen w-full isolate overflow-x-hidden bg-transparent text-white flex flex-col justify-between">
      {/* 1. FUNDO GLOBAL OFICIAL (FORA DE JOGO) OU ARENA EQUIPADA (DURANTE O JOGO) */}
      <AppBackground
        customImage={isPlaying ? (arenaImage || '/arenas/arena-1.jpg') : undefined}
      />

      {/* 2. CONTEÚDO DA CENTRAL DE JOGO / TABULEIRO DE QUIZ */}
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
