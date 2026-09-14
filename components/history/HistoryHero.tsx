'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Compass, Radio, MapPin } from 'lucide-react'

export function HistoryHero() {
  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Botão de Regresso e Tag de Memória */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white hover:border-emerald-500/40 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Início</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono tracking-wider">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>ORIGEM REAL & DOCUMENTAÇÃO</span>
          </div>
        </div>

        {/* Hero Card Central */}
        <div className="relative rounded-3xl sm:rounded-4xl border border-white/15 bg-zinc-950/80 p-6 sm:p-10 md:p-14 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Luzes de Fundo */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Etiqueta */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>01 — ONDE TUDO COMEÇOU</span>
            </div>

            {/* Título */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              ONDE TUDO COMEÇOU
            </h1>

            {/* Grande Frase de Abertura Real */}
            <div className="mt-8 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/10 max-w-2xl">
              <p className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-amber-400 leading-snug">
                “Antes do jogo.<br />
                Antes dos rankings.<br />
                Antes das perguntas.<br />
                Havia uma ideia.”
              </p>
            </div>

            {/* Texto Narrativo do Hero */}
            <p className="mt-8 text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-3xl">
              Uma ideia nascida em Portugal, em Vila Real, com uma ambição muito clara: criar o <strong className="text-white font-semibold">verdadeiro Acorda Portugal</strong> — uma plataforma de informação móvel pensada para aproximar as pessoas dos acontecimentos enquanto eles estão a acontecer e permitir que o próprio cidadão esteja no centro da notícia.
            </p>

            {/* Badges de Princípios de Origem */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs text-zinc-400 font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                Vila Real, Portugal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                Informação em Primeira Mão
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                Cidadão como Repórter
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
