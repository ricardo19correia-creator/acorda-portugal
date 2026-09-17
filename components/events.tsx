'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Gamepad2, ChevronRight, Trophy, Sparkles } from 'lucide-react'
import {
  subscribePublishedEvents,
  type OfficialEventConfig,
} from '@/lib/events-service'

export function Events() {
  const [events, setEvents] = useState<OfficialEventConfig[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribePublishedEvents((published) => {
      setEvents(published)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* ========================================================================= */}
      {/* CABEÇALHO OFICIAL: EVENTOS                                               */}
      {/* ========================================================================= */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-amber-500/30 px-4 py-1.5 shadow-lg backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
            Competições &amp; Temporadas
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          EVENTOS
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Desafios especiais e competições oficiais do Acorda Portugal — Desafio Nacional.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* ESTADO VAZIO PROFISSIONAL                                                */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-9 w-9 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium">A verificar eventos disponíveis...</p>
        </div>
      ) : events.length === 0 ? (
        <section
          aria-label="Nenhum evento disponível"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0a1633]/85 via-[#050c1f]/90 to-[#020612]/95 p-8 sm:p-14 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-center"
        >
          {/* Efeitos de luz ambiente subtis (Portugal: verde, rubi e ouro) */}
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-6">
            <div className="mx-auto grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">
                Nenhum evento disponível neste momento.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Fica atento às próximas novidades e desafios nacionais. Novas competições e temporadas serão anunciadas aqui.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/jogar"
                className="w-full sm:w-auto button-game-gold inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Jogar Agora</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/rankings"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 px-6 py-3.5 font-display text-xs font-black uppercase tracking-wider text-slate-200 transition"
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Ver Rankings Globais</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        // Renderização dinâmica caso no futuro existam eventos reais publicados no Firestore
        <div className="space-y-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl"
            >
              <h3 className="font-display text-xl font-black uppercase text-white">{evt.title}</h3>
              <p className="text-sm text-slate-300 mt-1">{evt.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Events
