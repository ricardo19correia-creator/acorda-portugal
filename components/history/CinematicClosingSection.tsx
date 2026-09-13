'use client'

import React from 'react'
import Link from 'next/link'
import { Gamepad2, LayoutGrid, ShieldCheck } from 'lucide-react'

export function CinematicClosingSection() {
  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 border-t border-white/10 bg-black/60 overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Título de Encerramento */}
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-md">
          E ISTO AINDA NÃO ACABOU.
        </h2>

        {/* Manifesto Poético Espaçado */}
        <div className="mt-8 space-y-2 text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
          <p>O ACORDA PORTUGAL começou como uma ideia.</p>
          <p>Ganhou uma identidade.</p>
          <p>Criou uma visão.</p>
          <p className="text-emerald-400 font-medium">Transformou-se num desafio.</p>
          <p className="text-amber-400 font-semibold">E continua a evoluir.</p>
        </div>

        {/* Grande Chamada */}
        <div className="mt-14 mb-10">
          <h3 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-zinc-100 to-amber-400 drop-shadow-[0_4px_30px_rgba(16,185,129,0.3)]">
            A HISTÓRIA CONTINUA.
          </h3>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/jogar"
            className="button-game-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-black uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Gamepad2 className="h-5 w-5" />
            <span>COMEÇAR A JOGAR</span>
          </Link>

          <Link
            href="/categorias"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-xl shadow-lg transition-all hover:bg-white/20 hover:border-white/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <LayoutGrid className="h-5 w-5 text-amber-400" />
            <span>EXPLORAR O DESAFIO</span>
          </Link>
        </div>

        {/* Rodapé Discreto: Arquivo de Origem */}
        <div className="mt-20 pt-10 border-t border-white/10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
            <span>ARQUIVO DE ORIGEM</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-normal">
            Esta história foi reconstruída a partir da documentação criada ao longo do desenvolvimento do ACORDA PORTUGAL: conceitos, Master Plans, documentos de produto, identidade, arquitetura, segurança, moderação e evolução do projeto.
          </p>
        </div>
      </div>
    </section>
  )
}
