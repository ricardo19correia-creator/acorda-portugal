'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import {
  type RealPlayerPresence,
  type RealCommunityState,
  filterActiveRealPlayers,
} from '@/lib/real-presence'
import { LivePlayersModal } from '@/components/live-players-modal'
import { ArrowRight, Flame, Swords, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LiveOnlineCard() {
  const { user } = useAuth()
  const [rawDocs, setRawDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Subscrição única ao Firestore para a coleção de presença pública
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      const presenceCol = collection(db, 'publicPresence')
      const q = query(presenceCol, where('online', '==', true), limit(250))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (data && data.userId) {
              docs.push(data)
            }
          })
          setRawDocs(docs)
          setLoading(false)
        },
        (error) => {
          console.debug('[PRESENCE] Erro na subscrição:', error)
          setLoading(false)
        }
      )
    } catch (err) {
      console.debug('[PRESENCE] Falha ao configurar listener:', err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Atualização periódica a cada 15s para expirar jogadores inativos (TTL) sem nova query ao Firestore
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 15_000)
    return () => clearInterval(timer)
  }, [])

  // Derivação pura do estado comunitário (100% Humano e Real)
  const community: RealCommunityState = useMemo(() => {
    return filterActiveRealPlayers(rawDocs, user?.uid, now)
  }, [rawDocs, user?.uid, now])

  const { humanOnline, playingCount, duelCount, players } = community

  // Primeiros 5 avatares visíveis
  const displayedPlayers = players.slice(0, 5)
  const remainingCount = Math.max(0, humanOnline - displayedPlayers.length)

  // Skeleton Loading elegante
  if (loading) {
    return (
      <section className="relative mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl animate-pulse">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
              <div className="h-4 w-32 rounded-lg bg-white/10" />
            </div>
            <div className="h-8 w-40 rounded-xl bg-white/10" />
            <div className="h-9 w-28 rounded-xl bg-white/10" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section
        aria-label="Jogadores Online Agora"
        className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 my-2"
      >
        {/* Card Principal: Glassmorphism Cyberpunk */}
        <div className="card-hud-cyber group relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)]">
          {/* Luz de fundo decorativa subtil */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Lado Esquerdo: Indicador LIVE + Contagem + Mensagem */}
            <div className="space-y-1.5">
              {/* Badge "JOGADORES AGORA" */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 shadow-sm">
                {/* Indicador verde LIVE: animação lenta e sofisticada */}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40 duration-1000" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                </span>
                <span>JOGADORES AGORA</span>
              </div>

              {/* Contagem Principal */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {humanOnline}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-300">
                  {humanOnline === 1 ? 'jogador online' : 'jogadores online'}
                </span>
              </div>

              {/* Subtítulo Dinâmico e Motivador */}
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {humanOnline > 0
                  ? 'Portugal está a jogar agora 🇵🇹'
                  : 'Portugal está acordado 🇵🇹 Sê o primeiro a entrar!'}
              </p>
            </div>

            {/* Centro: Avatares Reais Sobrepostos */}
            {humanOnline > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3 overflow-hidden py-1">
                  {displayedPlayers.map((player) => (
                    <div
                      key={player.userId}
                      title={`${player.displayName} (${player.district})`}
                      className="relative inline-block transition-transform duration-200 hover:scale-110 hover:z-20 cursor-pointer"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <img
                        src={player.photoURL || '/images/avatars/avatar_01.png'}
                        alt={player.displayName}
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-slate-900 bg-slate-800 shadow-md ring-1 ring-emerald-500/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/avatars/avatar_01.png'
                        }}
                      />
                    </div>
                  ))}

                  {/* Badge +N de jogadores restantes */}
                  {remainingCount > 0 && (
                    <div
                      onClick={() => setIsModalOpen(true)}
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-950/90 text-xs font-black text-emerald-300 shadow-md ring-1 ring-emerald-500/40 hover:scale-110 transition-transform cursor-pointer"
                    >
                      +{remainingCount}
                    </div>
                  )}
                </div>

                {/* Estatísticas secundárias (apenas se existirem dados reais) */}
                {(playingCount > 0 || duelCount > 0) && (
                  <div className="hidden lg:flex flex-col gap-1 border-l border-white/10 pl-3.5 text-xs font-semibold text-slate-300">
                    {playingCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-amber-300">
                        <Flame className="h-3.5 w-3.5 text-amber-400" />
                        {playingCount} em partida
                      </span>
                    )}
                    {duelCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-purple-300">
                        <Swords className="h-3.5 w-3.5 text-purple-400" />
                        {duelCount} em duelo
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5">
                <Users className="h-4 w-4 text-emerald-400/70" />
                <span>Salas prontas para novos concorrentes</span>
              </div>
            )}

            {/* Lado Direito: Botão Ação "VER JOGADORES →" */}
            <div className="flex items-center justify-start md:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 hover:text-emerald-200 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <span>Ver Jogadores</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal detalhado de jogadores online */}
      <LivePlayersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        players={players}
        currentUid={user?.uid}
      />
    </>
  )
}