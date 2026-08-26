'use client'

import React from 'react'
import {
  Flame,
  Sparkles,
  Award,
  Crown,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  HelpCircle,
} from 'lucide-react'
import { DAILY_CHALLENGE } from '@/lib/creators-service'

interface CreatorsSidebarProps {
  onSelectTopic?: (topic: string) => void
  onOpenCreateForChallenge?: () => void
}

export function CreatorsSidebar({
  onSelectTopic,
  onOpenCreateForChallenge,
}: CreatorsSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Bloco 1: 🇵🇹 Desafio do Dia */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-5 shadow-xl backdrop-blur-md">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
          <span className="text-base">🇵🇹</span>
          <span>{DAILY_CHALLENGE.title}</span>
        </div>

        <p className="mt-2.5 font-display text-sm font-black text-white leading-snug">
          "{DAILY_CHALLENGE.question}"
        </p>

        <button
          type="button"
          onClick={onOpenCreateForChallenge}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 transition-all cursor-pointer shadow-md"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Responder ao Desafio</span>
        </button>
      </div>

      {/* Bloco 2: 💡 Do Jogador para o Jogo */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Lightbulb className="h-4 w-4 text-emerald-400" />
          <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">
            Do Jogador para o Jogo
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-300 uppercase">✅ Ativo</span>
              <span className="text-slate-400">Edição 2026</span>
            </div>
            <div className="font-bold text-white text-[11px]">Centro Comunitário Os Criadores</div>
            <p className="text-[11px] text-slate-400">Espaço em tempo real construído para a voz de Portugal</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-cyan-300 uppercase">🛠️ Em Desenvolvimento</span>
              <span className="text-slate-400">Lançamento Mobile</span>
            </div>
            <div className="font-bold text-white text-[11px]">Aplicação Oficial Android + iOS</div>
            <p className="text-[11px] text-slate-400">Data Oficial: 11 de setembro de 2026</p>
          </div>
        </div>
      </div>

      {/* Bloco 3: 🛡️ Regras da Comunidade */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">
              Espaço Comunitário
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Partilha ideias, debates, memórias das tuas terras e sugestões para o <strong className="text-emerald-400">Acorda Portugal</strong>. As melhores propostas são avaliadas pela equipa oficial.
        </p>
      </div>
    </aside>
  )
}
