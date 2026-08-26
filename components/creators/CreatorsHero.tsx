'use client'

import React from 'react'
import { Sparkles, PenSquare, Flame, MessageSquare, Users, ShieldCheck } from 'lucide-react'

interface CreatorsHeroProps {
  onOpenCreateModal: () => void
  onSelectHighlights: () => void
  totalPostsCount: number
}

export function CreatorsHero({
  onOpenCreateModal,
  onSelectHighlights,
  totalPostsCount,
}: CreatorsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      {/* Luzes e Efeitos de Fundo Lusos */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-72 w-72 rounded-full bg-red-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-amber-500/15 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge Superior Patriótico */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-md">
          <span className="text-base">🇵🇹</span>
          <span>COMUNIDADE OFICIAL</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-amber-400">OS CRIADORES</span>
        </div>

        {/* Título Principal de Impacto */}
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
          Portugal não é só para jogar.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            É para participar.
          </span>
        </h1>

        {/* Subtítulo Inspirador */}
        <p className="mt-3 text-sm text-slate-300 sm:text-base lg:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Um espaço vivo onde cada português pode partilhar histórias, desabafos, humor, ideias criativas e sugerir melhorias diretas para o <strong className="text-emerald-400">Acorda Portugal</strong>.
        </p>

        {/* Botões de Ação Principais (CTAs) */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:scale-105 hover:from-emerald-400 hover:to-teal-400 active:scale-95 cursor-pointer"
          >
            <PenSquare className="h-4 w-4 transition-transform group-hover:rotate-12" />
            <span>✍️ Criar Publicação</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectHighlights) {
                onSelectHighlights()
              }
              const feedElement = document.getElementById('feed-publicacoes')
              if (feedElement) {
                feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer font-bold shadow-lg hover:scale-105 active:scale-95 text-sm"
          >
            🔥 <span>Ver Destaques</span>
          </button>
        </div>

        {/* Mini Estatísticas da Comunidade */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto text-xs text-slate-400">
          <div className="flex flex-col items-center">
            <span className="font-display text-lg sm:text-xl font-black text-emerald-400">9</span>
            <span className="font-semibold text-[11px] uppercase tracking-wider">Categorias</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <span className="font-display text-lg sm:text-xl font-black text-amber-400">100%</span>
            <span className="font-semibold text-[11px] uppercase tracking-wider">Comunitário</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-lg sm:text-xl font-black text-cyan-400">20</span>
            <span className="font-semibold text-[11px] uppercase tracking-wider">Distritos</span>
          </div>
        </div>
      </div>
    </section>
  )
}
