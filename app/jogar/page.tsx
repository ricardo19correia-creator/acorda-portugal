'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuizPage } from '@/components/quiz/page'
import { getArenaGameBackground } from '@/lib/arena-assets'
import { AppBackground } from '@/components/AppBackground'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'

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
        const savedArena = localStorage.getItem('equipped_arena')
        if (savedArena) {
          setArenaImage(getArenaGameBackground(savedArena) || '')
        } else {
          setArenaImage(getArenaGameBackground('arena_praca_liberdade') || '')
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
    <div className="relative min-h-[100dvh] w-full isolate overflow-x-hidden bg-transparent text-white flex flex-col justify-between">
      {/* 1. FUNDO GLOBAL OFICIAL DO JOGO */}
      <AppBackground customImage={isPlaying && arenaImage ? arenaImage : undefined} />

      {/* 2. CONTEÚDO DA CENTRAL DE JOGO / TABULEIRO DE QUIZ */}
      <main className="relative z-10 w-full max-w-4xl mx-auto min-h-[100dvh] p-2 sm:p-4 flex flex-col justify-between bg-transparent">
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
