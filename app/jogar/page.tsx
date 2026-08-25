'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuizPage } from '@/components/quiz/page'
import { ARENA_SHOP_CATALOG } from '@/data/shopArenas'
import { AppBackground } from '@/components/AppBackground'
import { cn } from '@/lib/utils'

function JogarContainer() {
  const searchParams = useSearchParams()
  const categoryParam =
    searchParams.get('cat') ||
    searchParams.get('category') ||
    searchParams.get('categoria') ||
    searchParams.get('theme') ||
    searchParams.get('tema') ||
    searchParams.get('mode') ||
    searchParams.get('modo') ||
    searchParams.get('topic') ||
    searchParams.get('topico') ||
    searchParams.get('event') ||
    searchParams.get('evento') ||
    searchParams.get('dist') ||
    searchParams.get('distrito') ||
    searchParams.get('city') ||
    searchParams.get('cidade')
  const gameParam = searchParams.get('game') || searchParams.get('gameId')
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
    <div
      className={cn(
        'relative w-full isolate text-white flex flex-col justify-between',
        isPlaying ? 'h-[100dvh] overflow-hidden bg-slate-950' : 'min-h-screen overflow-x-hidden bg-transparent'
      )}
    >
      {/* 1. FUNDO GLOBAL OFICIAL (FORA DE JOGO) OU ARENA EQUIPADA (DURANTE O JOGO) */}
      <AppBackground
        customImage={isPlaying ? (arenaImage || '/arenas/arena-1.jpg') : undefined}
      />

      {/* 2. CONTEÚDO DA CENTRAL DE JOGO / TABULEIRO DE QUIZ */}
      <main
        className={cn(
          'relative z-10 w-full mx-auto flex flex-col justify-between bg-transparent',
          isPlaying ? 'h-full p-0 max-w-lg' : 'min-h-screen p-4 max-w-4xl'
        )}
      >
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
