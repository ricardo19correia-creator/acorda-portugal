'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackgroundFx } from '@/components/background-fx'
import { ArenaDynamicBackground } from '@/components/arena-dynamic-background'
import { DuelArena } from '@/components/duel-arena'
import { DuelMatchmakingModal } from '@/components/duel-matchmaking-modal'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowLeft, Swords, Play, Key, Sparkles, Trophy } from 'lucide-react'

function DuelPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const duelIdFromUrl = searchParams.get('id') || ''
  const [activeDuelId, setActiveDuelId] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(true)

  // Prioridade ao ID da URL para navegação limpa na revanche
  const effectiveDuelId = duelIdFromUrl || activeDuelId

  const handleDuelChange = (newDuelId: string) => {
    setActiveDuelId(newDuelId)
    router.push(`/jogar/duelo?id=${newDuelId}`)
  }

  if (!effectiveDuelId) {
    return (
      <div className="relative min-h-screen bg-transparent flex flex-col justify-between">
        <ArenaDynamicBackground />
        <BackgroundFx variant="multiplayer" />
        <div className="relative z-20 flex-1 flex flex-col">
          <SiteHeader />

          <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/jogar"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à Central de Jogo
            </Link>

            <div className="card-game-purple mt-6 overflow-hidden rounded-4xl p-8 sm:p-12 text-center shadow-2xl">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-purple-500/50 bg-purple-500/20 text-purple-400 shadow-xl shadow-purple-500/30 animate-pulse">
                <Swords className="h-10 w-10" />
              </div>

              <span className="badge-hud mt-6 text-purple-300 border-purple-500/40 bg-purple-500/20 shadow-sm shadow-purple-500/20">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Modo Multiplayer 1v1
              </span>

              <h1 className="mt-4 font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-foreground text-glow-purple">
                Arena de Duelos
              </h1>

              <p className="mt-3 max-w-lg mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
                Desafia outro jogador em tempo real. 10 perguntas simultâneas, 60 segundos por ronda e bónus de <strong className="text-gold text-glow-gold">+300 XP</strong> ao vencedor.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="button-game-purple w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-4 font-display text-base sm:text-lg font-black uppercase tracking-wider cursor-pointer"
                >
                  <Swords className="h-5 w-5 fill-current" />
                  <span>Procurar Adversário</span>
                </button>
              </div>
            </div>
          </main>

          <SiteFooter />
        </div>

        <DuelMatchmakingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onMatchStart={(id) => {
            console.log('[DUEL PAGE] MATCH INICIADO -> TRANSIÇÃO IMEDIATA PARA ARENA:', id)
            handleDuelChange(id)
            setModalOpen(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-transparent">
      <ArenaDynamicBackground />
      <BackgroundFx variant="multiplayer" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <DuelArena
          key={effectiveDuelId}
          duelId={effectiveDuelId}
          onDuelChange={handleDuelChange}
        />
      </div>
    </div>
  )
}

export default function DuelPage() {
  return (
    <Suspense fallback={null}>
      <DuelPageContent />
    </Suspense>
  )
}
