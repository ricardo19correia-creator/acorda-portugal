import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { BackgroundFx } from '@/components/background-fx'
import { Play, Home, Sparkles, ShieldCheck, Terminal, MessageSquarePlus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Beta Público — Acorda Portugal | Desafio Nacional',
  description:
    'O Desafio Nacional já está disponível para todos em Beta Público. Joga, descobre, desafia os teus conhecimentos e ajuda-nos a evoluir.',
  alternates: {
    canonical: 'https://acordaportugal.pt/beta',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/beta',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Beta Público — Acorda Portugal | Desafio Nacional',
    description:
      'O Desafio Nacional já está disponível para todos em Beta Público. Joga, descobre, desafia os teus conhecimentos e ajuda-nos a evoluir.',
  },
}

export default function BetaPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-emerald-500 selection:text-black">
      <BackgroundFx variant="default" />

      {/* Cabeçalho Oficial com Botão Voltar integrado */}
      <SiteHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14 max-w-5xl mx-auto w-full">
        {/* Glow de fundo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[580px] h-72 sm:h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Tag Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.25)] mb-6 animate-fadeIn">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-white/95 font-mono">🇵🇹 COMUNICAÇÃO OFICIAL</span>
        </div>

        {/* Cartão Central Glassmorphic */}
        <div className="relative w-full rounded-3xl sm:rounded-4xl border border-white/15 bg-slate-950/75 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.85)] text-center space-y-8">
          
          {/* Luz de Borda Superior */}
          <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

          {/* Título & Subtítulo Oficiais */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
              <span className="block drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                ACORDA PORTUGAL — DESAFIO NACIONAL
              </span>
            </h1>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                Beta Público
              </span>
            </div>
          </div>

          {/* Mensagem Principal */}
          <div className="max-w-2xl mx-auto space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed sm:leading-loose font-medium text-center">
            <p className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
              O Desafio Nacional já está disponível para todos.
            </p>

            <p className="text-slate-300">
              Sê um dos primeiros a experimentar o jogo em primeira mão, desafia os teus conhecimentos e ajuda-nos a construir a próxima geração do Desafio Nacional.
            </p>

            <p className="text-slate-300">
              Esta é uma versão Beta: algumas funcionalidades ainda estão em desenvolvimento e poderão existir erros, alterações ou melhorias ao longo do tempo.
            </p>

            <p className="text-slate-300">
              Estamos a trabalhar continuamente para melhorar o jogo, corrigir problemas, adicionar novas funcionalidades e tornar a experiência cada vez melhor.
            </p>

            {/* Chamada em Destaque */}
            <div className="pt-2">
              <p className="text-base sm:text-lg font-display font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 uppercase drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                Joga. Descobre. Participa. Ajuda-nos a evoluir.
              </p>
            </div>
          </div>

          {/* Pilares do Beta Público (Visual de Videojogo Profissional) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-1.5 hover:border-emerald-500/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-white tracking-wide">
                Disponível Agora
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                Podes jogar partidas completas, acumular XP, subir nos rankings e competir pelo país.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-1.5 hover:border-amber-500/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-white tracking-wide">
                Evolução Contínua
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                Atualizações frequentes com novas perguntas, arenas, otimizações e correções ativas.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-1.5 hover:border-teal-500/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-white tracking-wide">
                A Tua Participação
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                O teu feedback durante esta fase é essencial para elevar a qualidade do jogo nacional.
              </p>
            </div>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {/* Botão Principal: JOGAR AGORA */}
            <Link
              href="/jogar"
              className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 font-display font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.75)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-300/40"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="relative z-10 text-slate-950 font-black">JOGAR AGORA</span>
            </Link>

            {/* Botão Secundário: ENVIAR FEEDBACK */}
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-4.5 rounded-2xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 hover:border-amber-400 text-amber-300 font-display font-bold text-sm sm:text-base uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              <span>ENVIAR FEEDBACK</span>
            </Link>

            {/* Botão Secundário: VOLTAR AO INÍCIO */}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-4.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white font-display font-bold text-sm sm:text-base uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4 text-slate-300" />
              <span>VOLTAR AO INÍCIO</span>
            </Link>
          </div>

          {/* Rodapé Interno do Cartão */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[11px] font-mono text-slate-400">
              Acorda Portugal — Desafio Nacional • Versão Beta Pública • Lisboa, Portugal 🇵🇹
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
