'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Users, MapPin, Trophy, ArrowRight, Shield } from 'lucide-react'
import { useLivePresence } from '@/hooks/use-live-presence'

export function LivePortugalSection() {
  const { humanOnline, players, loading } = useLivePresence()

  // Calcular distritos com jogadores reais ativos neste momento
  const activeDistrictsCount = useMemo(() => {
    if (!players || players.length === 0) return 0
    const set = new Set(players.map((p) => (p.district || '').trim()).filter(Boolean))
    return set.size
  }, [players])

  return (
    <section
      aria-label="Portugal Está Vivo"
      className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10 select-none"
    >
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/80 border border-white/10 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Luzes ambiente de fundo */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Lado Esquerdo: Título, Indicadores Reais e CTA */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                REDE NACIONAL EM DIRETO
              </span>

              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white drop-shadow-md">
                PORTUGAL ESTÁ VIVO
              </h2>
            </div>

            {/* Indicadores Estritamente Reais */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              {/* 1. Jogadores Online Reais */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/20 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono">
                  {loading ? (
                    <span className="text-slate-400">A verificar...</span>
                  ) : humanOnline > 0 ? (
                    <>
                      <strong className="text-white font-bold">{humanOnline}</strong>{' '}
                      <span className="text-slate-300 uppercase text-[11px]">
                        {humanOnline === 1 ? 'jogador online' : 'jogadores online'}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-300 uppercase text-[11px]">Rede operacional</span>
                  )}
                </span>
              </div>

              {/* 2. Distritos Representados em Direto (apenas exibido se houver dados reais) */}
              {!loading && activeDistrictsCount > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-amber-500/20 shadow-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono">
                    <strong className="text-white font-bold">{activeDistrictsCount}</strong>{' '}
                    <span className="text-slate-300 uppercase text-[11px]">
                      {activeDistrictsCount === 1 ? 'distrito em jogo' : 'distritos em jogo'}
                    </span>
                  </span>
                </div>
              )}

              {/* 3. Temporada Oficial */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 shadow-sm">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-mono">
                  <strong className="text-amber-300 font-bold">TEMPORADA 01</strong>{' '}
                  <span className="text-slate-400 uppercase text-[11px]">ativa</span>
                </span>
              </div>
            </div>

            {/* CTA para o Mapa */}
            <div className="pt-2">
              <Link
                href="/portugal-mapa"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-white/20 hover:border-emerald-500/40 text-slate-100 hover:text-emerald-300 font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              >
                <span>EXPLORAR PORTUGAL</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Lado Direito: Elemento Visual Estilizado da Identidade Portuguesa (sem mapas pesados) */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-center p-4 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              {/* Anel giratório subtil */}
              <div className="absolute inset-0 rounded-full border border-dashed border-emerald-400/20 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-amber-400/20" />

              {/* Insígnia estilizada da esfera armilar / escudo de Portugal */}
              <div className="flex flex-col items-center justify-center text-center">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mb-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="font-display font-black text-[10px] tracking-widest text-amber-300 uppercase">
                  PORTUGAL
                </span>
                <span className="text-[9px] font-mono text-slate-400">2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
