'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuizPage } from '@/components/quiz/page'
import { ARENA_SHOP_CATALOG } from '@/data/shopArenas'
import { AppBackground } from '@/components/AppBackground'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'

function JogarContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, authResolved } = useAuth()

  // Bloqueio Total: Redirecionamento obrigatório para /entrar para utilizadores não autenticados
  useEffect(() => {
    if (authResolved && !user && !auth?.currentUser) {
      const search = searchParams?.toString()
      const currentUrl = search ? `/jogar?${search}` : '/jogar'
      router.replace(`/entrar?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }, [user, authResolved, router, searchParams])

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

  // Enquanto verifica autenticação ou se não houver utilizador autenticado, bloqueia renderização
  if (!authResolved || (!user && !auth?.currentUser)) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-cyan-400 font-bold text-lg">A verificar autenticação...</p>
        <p className="text-slate-400 text-sm mt-1">Redirecionando para o ecrã de início de sessão.</p>
      </main>
    )
  }

  return (
    <div className="relative min-h-[100dvh] w-full isolate overflow-x-hidden bg-transparent text-white flex flex-col justify-between">
      {/* 1. FUNDO GLOBAL OFICIAL (FORA DE JOGO) OU ARENA EQUIPADA (DURANTE O JOGO) */}
      <AppBackground
        customImage={isPlaying ? (arenaImage || '/arenas/arena-1.jpg') : undefined}
      />

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
