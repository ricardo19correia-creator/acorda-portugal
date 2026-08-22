'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuizPage } from '@/components/quiz/page'
import { ARENA_SHOP_CATALOG } from '@/data/shopArenas'

function JogarContainer() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('cat')
  const gameParam = searchParams.get('game')
  const isPlaying = Boolean(categoryParam || gameParam)
  
  const [arenaImage, setArenaImage] = useState<string>('/images/hero-bg.jpg')

  useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const savedImage = localStorage.getItem('equipped_arena_image')
        const savedArena = localStorage.getItem('equipped_arena')

        if (savedImage && savedImage.startsWith('/') && !savedImage.includes('fundo-espaco')) {
          setArenaImage(savedImage)
        } else if (savedArena) {
          const catalogItem = ARENA_SHOP_CATALOG.find((a) => a.id === savedArena)
          if (catalogItem?.image) {
            setArenaImage(catalogItem.image)
          } else if (savedArena === 'arena_ponte_2077' || savedArena === 'arena_neon_2088') {
            setArenaImage('/arenas/arena-ponte-2077.gif')
          } else if (savedArena === 'arena_fado_alfama' || savedArena === 'theme_noite_fado') {
            setArenaImage('/images/shop/arena-fado-alfama.jpg')
          } else if (savedArena === 'arena_fogo_acores' || savedArena === 'theme_volcano_acores' || savedArena === 'arena_vulcao_erupcao') {
            setArenaImage('/images/shop/arena-fogo-acores.jpg')
          } else {
            setArenaImage('/images/hero-bg.jpg')
          }
        } else {
          setArenaImage('/images/hero-bg.jpg')
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
      {/* 1. SE A PARTIDA ESTIVER ATIVA (isPlaying === true): Exibe a imagem da arena equipada COM 100% DE BRILHO E NITIDEZ, SEM OVERLAYS ESCUROS */}
      {isPlaying && arenaImage && (
        <div 
          className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url('${arenaImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* 2. CONTEÚDO DA CENTRAL DE JOGO / SESSÃO ATIVA DE QUIZ */}
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
