'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Swords,
  MapPin,
  Building2,
  Compass,
  Trophy,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react'
import type { UserProfile } from '@/lib/game-data'
import { getDefaultCityForDistrict } from '@/data/districts'

interface GameLobbyProps {
  user: any
  profile: UserProfile | null
  onStartGame: (route: string) => void
}

export function GameLobby({ user, profile, onStartGame }: GameLobbyProps) {
  const router = useRouter()

  const displayName = profile?.displayName || user?.displayName || 'Explorador'
  const userDistrict = (profile?.district || 'Lisboa').trim()
  const userCity = (profile as any)?.city || getDefaultCityForDistrict(userDistrict) || 'Lisboa'

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-8 sm:px-6 lg:px-8 w-full">
      {/* 1. STATUS BAR DO LOBBY: INDICAÇÃO DE SESSÃO DISCRETA COM LINK PARA PERFIL */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 p-3 sm:px-5 sm:py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-slate-300">LOBBY PRINCIPAL</span>
          <span className="text-white/20">|</span>
          <span className="text-cyan-400 font-black">ACORDA PORTUGAL</span>
        </div>

        {user ? (
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors group"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jogador: <strong className="text-white group-hover:text-emerald-300">{displayName}</strong></span>
            <span className="text-emerald-400 text-[11px] group-hover:translate-x-0.5 transition-transform">Ver Perfil ➔</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Modo Convidado</span>
            <Link
              href="/entrar"
              className="text-emerald-400 font-bold hover:underline"
            >
              Iniciar Sessão ➔
            </Link>
          </div>
        )}
      </div>

      {/* 2. TÍTULO DE IMPACTO DO LOBBY */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Central de Jogo Oficial
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase font-display text-white tracking-tight text-glow-primary">
          O Que Queres Jogar Agora?
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-2 font-medium">
          Escolhe o teu desafio imediato. Cada resposta certa soma pontuação nacional e afirma o teu distrito no mapa.
        </p>
      </div>

      {/* 3. GRELHA DE MODOS PRIORITÁRIOS (PRIORIDADE VISUAL ABSOLUTA: 1, 2, 3, 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-8">
        {/* MODO 1: JOGAR AGORA (DESTAQUE MÁXIMO) */}
        <div
          onClick={() => onStartGame('/jogar')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar')}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-emerald-500/25 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                Modo Rápido
              </span>
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <Play className="w-5 h-5 fill-current" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-emerald-300 transition-colors">
              Jogar Agora
            </h2>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-1">
              Desafio Nacional Imediato
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Entra diretamente numa ronda de 10 perguntas de conhecimento geral de Portugal. Fácil de começar, pontuação direta para o ranking.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300">
            <span className="flex items-center gap-1.5 font-mono">
              <span>⏱️ 60s por pergunta</span>
              <span>•</span>
              <span>10 Perguntas</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/40 group-hover:translate-x-1 transition-all">
              Começar ➔
            </span>
          </div>
        </div>

        {/* MODO 2: DUELO 1V1 (COMPETIÇÃO MULTIPLAYER) */}
        <div
          onClick={() => onStartGame('/jogar/duelo')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar/duelo')}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-slate-900 border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-purple-500/25 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white shadow-md">
                Multiplayer 1v1
              </span>
              <div className="h-11 w-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Swords className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-purple-300 transition-colors">
              Duelo 1v1
            </h2>
            <p className="text-xs sm:text-sm font-bold text-purple-400 mt-1">
              Combate em Tempo Real
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Enfrenta outro jogador simultaneamente. As mesmas perguntas, o mesmo tempo. Quem acertar mais rápido ganha os pontos e sobe na liga Elo.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-300">
            <span className="flex items-center gap-1.5 font-mono">
              <span>⚔️ Matchmaking Rápido</span>
              <span>•</span>
              <span>+300 XP ao Vencedor</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500 hover:text-white px-3 py-1.5 rounded-xl border border-purple-500/40 group-hover:translate-x-1 transition-all">
              Duelo ➔
            </span>
          </div>
        </div>

        {/* MODO 3: MEU DISTRITO (GUERRA TERRITORIAL DISTRITAL) */}
        <div
          onClick={() => onStartGame(`/jogar?cat=conquista-do-distrito&dist=${encodeURIComponent(userDistrict)}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame(`/jogar?cat=conquista-do-distrito&dist=${encodeURIComponent(userDistrict)}`)}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-slate-900 border-2 border-cyan-500/40 hover:border-cyan-400 transition-all duration-300 shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-cyan-500/25 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-md">
                Guerra de Territórios
              </span>
              <div className="h-11 w-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                <MapPin className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-cyan-300 transition-colors">
              Meu Distrito
            </h2>
            <p className="text-xs sm:text-sm font-bold text-cyan-400 mt-1">
              Batalha Regional: {userDistrict}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Joga para conquistar e defender a soberania do distrito de {userDistrict}. Perguntas de geografia, história e herança do território distrital.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300">
            <span className="flex items-center gap-1.5 font-mono">
              <span>📍 {userDistrict}</span>
              <span>•</span>
              <span>Poder Territorial</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/40 group-hover:translate-x-1 transition-all">
              Defender ➔
            </span>
          </div>
        </div>

        {/* MODO 4: DESAFIO DA CIDADE (COMPETIÇÃO MUNICIPAL LOCAL) */}
        <div
          onClick={() => onStartGame(`/jogar?cat=desafio-cidade&city=${encodeURIComponent(userCity)}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame(`/jogar?cat=desafio-cidade&city=${encodeURIComponent(userCity)}`)}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-slate-900 border-2 border-amber-500/40 hover:border-amber-400 transition-all duration-300 shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-amber-500/25 transition-all" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                Competição Municipal
              </span>
              <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-amber-300 transition-colors">
              Desafio da Cidade
            </h2>
            <p className="text-xs sm:text-sm font-bold text-amber-400 mt-1">
              Conhecimento Local: {userCity}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Perguntas detalhadas sobre {userCity}. Tradições do concelho, património urbano, monumentos locais e figuras da tua terra natal.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5 font-mono">
              <span>🏙️ {userCity}</span>
              <span>•</span>
              <span>Ranking Municipal</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/40 group-hover:translate-x-1 transition-all">
              Jogar Cidade ➔
            </span>
          </div>
        </div>
      </div>

      {/* 4. ATALHOS SECUNDÁRIOS ESSENCIAIS (MAPA DE PORTUGAL, RANKINGS, LOJA) */}
      <div className="pt-2">
        <h3 className="text-xs font-black uppercase font-mono tracking-widest text-slate-400 mb-3 px-1">
          Navegação Rápida do Jogo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Atalho 1: Mapa de Portugal 3D */}
          <Link
            href="/portugal-mapa"
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-md"
          >
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-sm text-white block group-hover:text-cyan-300 transition-colors">
                Mapa de Portugal 3D
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Territórios e soberania nacional
              </span>
            </div>
          </Link>

          {/* Atalho 2: Rankings */}
          <Link
            href="/rankings"
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 transition-all shadow-md"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-sm text-white block group-hover:text-amber-300 transition-colors">
                Rankings & Competição
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Tabela nacional e por distrito
              </span>
            </div>
          </Link>

          {/* Atalho 3: Loja */}
          <Link
            href="/loja"
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-sm text-white block group-hover:text-emerald-300 transition-colors">
                Loja Oficial
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Avatares, molduras e cosméticos
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
