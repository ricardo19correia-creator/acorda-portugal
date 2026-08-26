'use client'

import React from 'react'
import Link from 'next/link'
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
import { UserAvatar } from '@/components/user-avatar'

const TRENDING_TOPICS = [
  { tag: '#ModoMaluco', posts: 64, trend: '+18%' },
  { tag: '#TorneioDistrital', posts: 52, trend: '+35%' },
  { tag: '#GastronomiaLusa', posts: 41, trend: '+12%' },
  { tag: '#Descobrimentos', posts: 38, trend: '+9%' },
  { tag: '#SelecaoNacional', posts: 29, trend: '+22%' },
]

const TOP_CREATORS = [
  {
    name: 'Gonçalo Ribeiro',
    username: 'tripeiro_raiz',
    district: 'Porto',
    avatar: '/images/avatars/avatar_camões.png',
    level: 28,
    points: '1.420',
  },
  {
    name: 'Mariana Vicente',
    username: 'algarvia_mar',
    district: 'Faro',
    avatar: '/images/avatars/avatar_padeira.png',
    level: 22,
    points: '1.180',
  },
  {
    name: 'Tiago Antunes',
    username: 'minhoto_guerreiro',
    district: 'Braga',
    avatar: '/images/avatars/avatar_ze_povinho.png',
    level: 19,
    points: '960',
  },
]

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

        {DAILY_CHALLENGE.featuredResponse && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-400">
                {DAILY_CHALLENGE.featuredResponse.authorName} ({DAILY_CHALLENGE.featuredResponse.authorDistrict})
              </span>
              <span className="text-slate-400">🏆 Destaque</span>
            </div>
            <p className="text-xs text-slate-300 italic">
              "{DAILY_CHALLENGE.featuredResponse.text}"
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenCreateForChallenge}
          className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 transition-all cursor-pointer shadow-md"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Responder ao Desafio</span>
        </button>
      </div>

      {/* Bloco 2: 🔥 Tendências ("Agora em Portugal") */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-400" />
            <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">
              Agora em Portugal
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Ao Vivo</span>
        </div>

        <div className="space-y-2">
          {TRENDING_TOPICS.map((topic) => (
            <button
              key={topic.tag}
              type="button"
              onClick={() => onSelectTopic && onSelectTopic(topic.tag.replace('#', ''))}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-left text-xs cursor-pointer group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {topic.tag}
                </span>
                <span className="text-[10px] text-slate-400">{topic.posts} publicações</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {topic.trend}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bloco 3: 💡 Ideias em Desenvolvimento para o Jogo */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Lightbulb className="h-4 w-4 text-emerald-400" />
          <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">
            Do Jogador para o Jogo
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-cyan-300 uppercase">🛠️ Em Desenvolvimento</span>
              <span className="text-slate-400">92% aprovação</span>
            </div>
            <div className="font-bold text-white text-[11px]">Torneio Semanal Distrital</div>
            <p className="text-[11px] text-slate-400">Sugerido por @tripeiro_raiz</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-300 uppercase">✅ Implementada</span>
              <span className="text-slate-400">Versão 2026</span>
            </div>
            <div className="font-bold text-white text-[11px]">Centro Comunitário Os Criadores</div>
            <p className="text-[11px] text-slate-400">Construído a pedido da comunidade</p>
          </div>
        </div>
      </div>

      {/* Bloco 4: 🏆 Top Criadores da Comunidade */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">
              Criadores Destaque
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Semana</span>
        </div>

        <div className="space-y-3">
          {TOP_CREATORS.map((c, idx) => (
            <Link
              key={c.username}
              href={`/criadores/${c.username}`}
              className="flex items-center justify-between gap-2 p-1.5 rounded-2xl hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <UserAvatar avatarUrl={c.avatar} size="sm" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950 border border-slate-900">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{c.district} • Nv. {c.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-[11px] font-black text-amber-400">
                <span>{c.points}</span>
                <span className="text-[9px] text-slate-400">pts</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
