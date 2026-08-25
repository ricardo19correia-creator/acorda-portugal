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
        'w-full isolate text-white select-none',
        isPlaying
          ? 'fixed inset-0 h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none touch-none flex flex-col justify-between p-1 sm:p-2 bg-slate-950'
          : 'relative min-h-screen overflow-x-hidden bg-transparent flex flex-col justify-between',
      )}
    >
      {/* 1. FUNDO GLOBAL OFICIAL (FORA DE JOGO) OU ARENA EQUIPADA (DURANTE O JOGO) */}
      <AppBackground
        customImage={isPlaying ? (arenaImage || '/arenas/arena-1.jpg') : undefined}
      />

      {/* 2. CONTEÚDO DA CENTRAL DE JOGO / TABULEIRO DE QUIZ */}
      <main
        className={cn(
          'relative z-10 w-full max-w-4xl mx-auto flex flex-col justify-between bg-transparent',
          isPlaying ? 'h-full max-h-[100dvh] overflow-hidden p-1 sm:p-2' : 'min-h-screen p-4',
        )}
      >
        <QuizPage />
      </main>
    </div>
  )
}

export default function JogarPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-slate-950" />}>
      <JogarContainer />
    </Suspense>
  )
}
