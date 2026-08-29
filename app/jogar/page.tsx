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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, authResolved, authStatus } = useAuth()

  // Redirecionamento seguro apenas quando a autenticação estiver formalmente resolvida como não autenticado
  useEffect(() => {
    if (authResolved && !user && !auth?.currentUser && authStatus === 'AUTH_UNAUTHENTICATED') {
      const search = searchParams?.toString()
      const currentUrl = search ? `/jogar?${search}` : '/jogar'
      router.replace(`/entrar?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }, [user, authResolved, authStatus, router, searchParams])

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

  // Durante a inicialização do Firebase Auth, renderiza um loading discreto sem mensagens alarmistas
  if (!authResolved) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
        <p className="text-emerald-400 font-black uppercase tracking-wider text-sm">A carregar o Desafio Nacional...</p>
        <p className="text-slate-400 text-xs mt-1">A preparar a tua sessão de jogo com segurança.</p>
      </main>
    )
  }

  // Se confirmado como não autenticado, aguarda transição para /entrar
  if (!user && !auth?.currentUser) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4 text-white">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-slate-300 text-sm font-medium">A aceder à autenticação...</p>
      </main>
    )
  }

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
