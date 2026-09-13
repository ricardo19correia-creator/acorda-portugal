'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, MapPin, Calendar, Compass, UserCheck } from 'lucide-react'

export function HistoryHero() {
  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Botão de Regresso */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white hover:border-emerald-500/40 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Jogo</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono tracking-wider">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>MEMÓRIA & DOCUMENTAÇÃO OFICIAL</span>
          </div>
        </div>

        {/* Hero Card Central */}
        <div className="relative rounded-3xl border border-white/15 bg-zinc-950/70 p-6 sm:p-10 md:p-14 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Luzes de Fundo Subtis */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Pequena Etiqueta */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>A HISTÓRIA DO ACORDA PORTUGAL</span>
            </div>

            {/* Título */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              ONDE TUDO COMEÇOU
            </h1>

            {/* Grande Frase Mestre */}
            <p className="mt-6 font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-200 to-amber-400 max-w-3xl leading-snug drop-shadow-md">
              “Antes de existir o jogo, existia uma ideia.”
            </p>

            {/* Texto Narrativo do Hero */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-3xl">
              Uma ideia criada em Portugal, em Vila Real, que começou por imaginar uma nova forma de ligar informação, comunidade e identidade nacional. Ao longo de 2026, essa visão ganhou identidade, estrutura e novas formas de participação — até dar origem ao Desafio Nacional.
            </p>

            {/* Metadados Discretos de Autoria e Origem */}
            <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-400">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-zinc-300 font-medium">António Ricardo Correia Moreira</span>
                <span className="text-zinc-500">·</span>
                <span className="text-emerald-400 font-bold">Riky Moreira</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span className="text-zinc-300 font-medium">Vila Real</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300">Portugal</span>
                <span className="text-zinc-500">·</span>
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-amber-400 font-semibold">2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
