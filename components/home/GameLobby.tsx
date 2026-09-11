'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Swords,
  MapPin,
  Compass,
  Trophy,
  ShoppingBag,
  Sparkles,
  User,
  LayoutGrid,
  Eye,
  Laugh,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react'
import type { UserProfile } from '@/lib/game-data'
import { VALID_DISTRICTS, type ValidDistrict } from '@/data/districts'
import { cn } from '@/lib/utils'

interface GameLobbyProps {
  user: any
  profile: UserProfile | null
  onStartGame: (route: string) => void
}

export function GameLobby({ user, profile, onStartGame }: GameLobbyProps) {
  const router = useRouter()

  const displayName = profile?.displayName || user?.displayName || 'Explorador'

  // Leitura segura e estrita de distrito sem forçar Lisboa como padrão
  const [userDistrict, setUserDistrict] = useState<string | null>(null)
  const [userCity, setUserCity] = useState<string | null>(null)

  useEffect(() => {
    let d: string | null = null
    let c: string | null = null

    if (profile?.district && profile.district.trim() !== '') {
      d = profile.district.trim()
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_district')
      if (saved && saved.trim() !== '') d = saved.trim()
    }

    if ((profile as any)?.city && (profile as any).city.trim() !== '') {
      c = (profile as any).city.trim()
    } else if (typeof window !== 'undefined') {
      const savedC = localStorage.getItem('user_city')
      if (savedC && savedC.trim() !== '') c = savedC.trim()
    }

    if (d && VALID_DISTRICTS.includes(d as ValidDistrict)) {
      setUserDistrict(d)
      setUserCity(c)
    } else {
      setUserDistrict(null)
      setUserCity(null)
    }
  }, [profile?.district, (profile as any)?.city])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:px-6 lg:px-8 w-full">
      {/* 1. STATUS BAR DO LOBBY: INDICAÇÃO DE SESSÃO DISCRETA */}
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
            <span>
              Jogador: <strong className="text-white group-hover:text-emerald-300">{displayName}</strong>
            </span>
            <span className="text-emerald-400 text-[11px] group-hover:translate-x-0.5 transition-transform">
              Ver Perfil ➔
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Convidado</span>
            <span className="text-white/20">•</span>
            <Link
              href="/entrar"
              className="text-emerald-400 font-bold hover:underline"
            >
              Entrar ➔
            </Link>
          </div>
        )}
      </div>

      {/* 2. HERO / LOBBY */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          ACORDA PORTUGAL
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase font-display text-white tracking-tight text-glow-primary">
          O Que Queres Jogar Agora?
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mt-2 font-medium">
          Escolhe o teu desafio e entra diretamente no jogo.
        </p>
      </div>

      {/* 3. OS 3 GRANDES MODOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
        {/* MODO 1: JOGAR AGORA */}
        <div
          onClick={() => onStartGame('/jogar?cat=desafio-nacional')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar?cat=desafio-nacional')}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-emerald-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                Ronda Rápida
              </span>
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <Play className="w-5 h-5 fill-current" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-emerald-300 transition-colors">
              Jogar Agora
            </h2>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-1">
              Conhecimento Geral de Portugal
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              10 perguntas rápidas sobre história, geografia, cultura e identidade nacional. Sem configuração complicada.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300">
            <span className="font-mono text-[11px] text-slate-400">10 Perguntas • 60s</span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 group-hover:translate-x-1 transition-all">
              JOGAR AGORA ➔
            </span>
          </div>
        </div>

        {/* MODO 2: DUELO 1V1 */}
        <div
          onClick={() => onStartGame('/jogar/duelo')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar/duelo')}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-slate-900 border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-purple-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white shadow-md">
                Competição 1v1
              </span>
              <div className="h-11 w-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Swords className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-purple-300 transition-colors">
              Duelo 1v1
            </h2>
            <p className="text-xs sm:text-sm font-bold text-purple-400 mt-1">
              Combate Competitivo em Tempo Real
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              Enfrenta outro jogador individualmente. Mesmas perguntas, mesmo tempo. Quem responder melhor e mais rápido sobe no ranking Elo.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-300">
            <span className="font-mono text-[11px] text-slate-400">Liga Elo • XP e Divisões</span>
            <span className="inline-flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500 hover:text-white px-3.5 py-1.5 rounded-xl border border-purple-500/40 group-hover:translate-x-1 transition-all">
              ENTRAR NO DUELO ➔
            </span>
          </div>
        </div>

        {/* MODO 3: MEU DISTRITO (ÚNICO MODO TERRITORIAL) */}
        <div
          onClick={() => {
            if (userDistrict) {
              onStartGame(`/meu-distrito`)
            } else {
              router.push('/meu-distrito')
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('/meu-distrito')}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-slate-900 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-cyan-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-md">
                Modo Territorial
              </span>
              <div className="h-11 w-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                <MapPin className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white tracking-wide group-hover:text-cyan-300 transition-colors">
              Meu Distrito
            </h2>
            <p className="text-xs sm:text-sm font-bold text-cyan-400 mt-1">
              {userDistrict ? `Território: ${userDistrict}` : 'Escolhe o teu distrito'}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              {userDistrict
                ? `Defende a soberania do distrito de ${userDistrict}${userCity ? ` e do concelho de ${userCity}` : ''}. Pontuação direta para a Guerra dos Distritos.`
                : 'Representa a tua terra natal. Seleciona o teu distrito para defender território, concelhos e disputar o título de Rei do Distrito.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300">
            <span className="font-mono text-[11px] text-slate-400">
              {userDistrict ? `📍 ${userDistrict}` : 'Soberania Territorial'}
            </span>
            <span className="inline-flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 group-hover:translate-x-1 transition-all">
              {userDistrict ? 'MEU DISTRITO ➔' : 'ESCOLHER DISTRITO ➔'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. EXPLORAR */}
      <div className="mb-10">
        <h3 className="text-xs font-black uppercase font-mono tracking-widest text-slate-400 mb-3 px-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          EXPLORAR
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Atalho 1: Mapa */}
          <Link
            href="/mapa"
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-md"
          >
            <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-sm text-white block group-hover:text-cyan-300 transition-colors">
                Mapa
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Mapa oficial de Portugal 2026 e soberania
              </span>
            </div>
          </Link>

          {/* Atalho 2: Rankings */}
          <Link
            href="/rankings"
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 transition-all shadow-md"
          >
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-sm text-white block group-hover:text-amber-300 transition-colors">
                Rankings
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Nacional, distritos, concelhos e 1v1
              </span>
            </div>
          </Link>

          {/* Atalho 3: Loja */}
          <Link
            href="/loja"
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md"
          >
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-sm text-white block group-hover:text-emerald-300 transition-colors">
                Loja
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Avatares, molduras, títulos e cosméticos
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. QUERES MAIS? */}
      <div>
        <h3 className="text-xs font-black uppercase font-mono tracking-widest text-slate-400 mb-3 px-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          QUERES MAIS?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Acesso Único: Categorias */}
          <Link
            href="/categorias"
            className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/50 transition-all shadow-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-black text-sm sm:text-base text-white block group-hover:text-emerald-300 transition-colors">
                  Categorias
                </span>
                <span className="text-xs text-slate-400 block truncate">
                  Explorar todos os 18 temas de Portugal ao Mundo
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </Link>

          {/* Modos Especiais */}
          <div className="flex items-center gap-2">
            <Link
              href="/jogar?cat=modo-maluco"
              className="flex-1 group flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-purple-500/50 transition-all shadow-md"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Laugh className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-black text-xs sm:text-sm text-white block group-hover:text-purple-300 transition-colors">
                  Modo Maluco
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Humor, absurdo e caos
                </span>
              </div>
            </Link>

            <Link
              href="/jogar?cat=desafio-visual"
              className="flex-1 group flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/50 transition-all shadow-md"
            >
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-black text-xs sm:text-sm text-white block group-hover:text-cyan-300 transition-colors">
                  Desafio Visual
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Perguntas por imagem
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
