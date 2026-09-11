'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Trophy,
  MapPin,
  Building2,
  Swords,
  Laugh,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Flame,
  Coins,
  Crown,
  Search,
  Check,
  Zap,
  SlidersHorizontal,
  Compass,
  Award,
  Dices,
  Clock,
  X,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import { LoadingQuiz } from '@/components/quiz/loading-quiz'
import {
  HUB_CATEGORIES,
  DIFFICULTY_LEVELS,
  getSubcategoriesForCategory,
  type GameDifficulty,
  type CategoryGroupKey,
  type HubCategory,
} from '@/lib/quiz-engine'
import {
  VALID_DISTRICTS,
  DISTRICT_CITIES_MAP,
  getDefaultCityForDistrict,
} from '@/data/districts'
import { calculateLevelProgress } from '@/lib/progression'
import { DuelMatchmakingModal } from '@/components/duel-matchmaking-modal'
import { resolveArena, VIP_ARENAS } from '@/src/data/arenaCatalog'
import { cn, safeRandomUUID } from '@/lib/utils'
import { logGameFlow } from '@/lib/game-session'
import { EVENTS } from '@/lib/game-data'

/**
 * Subcomponente para exibir com máxima clareza os 4 atributos mandatórios de cada modo:
 * O QUE É | CONTRA QUEM JOGO | QUE PERGUNTAS RECEBO | O QUE GANHO
 */
function ModeSpecs({
  whatIs,
  againstWhom,
  questionsType,
  rewards,
}: {
  whatIs: string
  againstWhom: string
  questionsType: string
  rewards: string
}) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
      <div className="rounded-xl bg-white/[0.04] p-2.5 border border-white/5 flex flex-col justify-between">
        <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground">
          🎯 O Que É
        </span>
        <span className="text-foreground text-[0.76rem] font-medium leading-snug mt-0.5">
          {whatIs}
        </span>
      </div>
      <div className="rounded-xl bg-white/[0.04] p-2.5 border border-white/5 flex flex-col justify-between">
        <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground">
          👥 Contra Quem Jogo
        </span>
        <span className="text-foreground text-[0.76rem] font-medium leading-snug mt-0.5">
          {againstWhom}
        </span>
      </div>
      <div className="rounded-xl bg-white/[0.04] p-2.5 border border-white/5 flex flex-col justify-between">
        <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground">
          ❓ Que Perguntas Recebo
        </span>
        <span className="text-foreground text-[0.76rem] font-medium leading-snug mt-0.5">
          {questionsType}
        </span>
      </div>
      <div className="rounded-xl bg-gold/10 p-2.5 border border-gold/20 flex flex-col justify-between">
        <span className="text-[0.65rem] font-black uppercase tracking-wider text-gold">
          🎁 O Que Ganho
        </span>
        <span className="text-gold text-[0.76rem] font-bold leading-snug mt-0.5">
          {rewards}
        </span>
      </div>
    </div>
  )
}

export function GameHub() {
  const router = useRouter()
  const { user, profile, authResolved, profileLoading } = useAuth()

  // State
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(2)
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryGroupKey>('portugal')
  const [searchCategory, setSearchCategory] = useState('')
  const [subcatModalCategory, setSubcatModalCategory] = useState<HubCategory | null>(null)
  const [selectedArenaId, setSelectedArenaId] = useState<string>('auto')
  const [localDistrict, setLocalDistrict] = useState<string | null>(null)
  const [localCity, setLocalCity] = useState<string | null>(null)

  // Modais de Seleção Territorial
  const [showDistrictModal, setShowDistrictModal] = useState(false)
  const [showCityModal, setShowCityModal] = useState(false)
  const [citySearchFilter, setCitySearchFilter] = useState('')

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('equipped_arena')
        if (saved && saved !== 'arena_palacio_nacional') {
          setSelectedArenaId(saved)
        } else if (saved === 'arena_palacio_nacional') {
          const explicitlyEquipped = localStorage.getItem('arena_explicitly_equipped') === 'true'
          if (explicitlyEquipped) {
            setSelectedArenaId(saved)
          }
        }

        const d = localStorage.getItem('user_district')
        if (d) setLocalDistrict(d)
        const c = localStorage.getItem('user_city')
        if (c) setLocalCity(c)
      }
    } catch (err) {
      console.warn('[GameHub] Erro seguro ao aceder a localStorage:', err)
    }
  }, [])

  const currentArenaObj = useMemo(() => {
    if (selectedArenaId === 'auto') return null
    return resolveArena(selectedArenaId)
  }, [selectedArenaId])

  // Representação Territorial Permanente e Inalterável da Conta (sem leituras diretas de window durante a renderização)
  const userDistrict = useMemo(() => {
    return (
      profile?.district ||
      profile?.representedDistrict ||
      localDistrict ||
      'Portugal'
    )
  }, [profile?.district, profile?.representedDistrict, localDistrict])

  const userCity = useMemo(() => {
    return (
      profile?.city ||
      profile?.representedCity ||
      localCity ||
      (userDistrict !== 'Portugal' ? getDefaultCityForDistrict(userDistrict) : 'Portugal')
    )
  }, [profile?.city, profile?.representedCity, localCity, userDistrict])

  const handleSelectDistrict = (newDist: string) => {
    setLocalDistrict(newDist)
    const newDefaultCity = getDefaultCityForDistrict(newDist)
    setLocalCity(newDefaultCity)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_district', newDist)
        localStorage.setItem('user_city', newDefaultCity)
      }
    } catch {}
    setShowDistrictModal(false)
  }

  const handleSelectCity = (newCity: string) => {
    setLocalCity(newCity)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_city', newCity)
      }
    } catch {}
    setShowCityModal(false)
  }

  // Lista de todas as cidades disponíveis para o modal de seleção
  const allAvailableCities = useMemo(() => {
    const list: { city: string; district: string }[] = []
    for (const [dist, cities] of Object.entries(DISTRICT_CITIES_MAP)) {
      for (const c of cities) {
        list.push({ city: c, district: dist })
      }
    }
    return list.filter((item) => {
      if (!citySearchFilter.trim()) return true
      return (
        item.city.toLowerCase().includes(citySearchFilter.toLowerCase()) ||
        item.district.toLowerCase().includes(citySearchFilter.toLowerCase())
      )
    })
  }, [citySearchFilter])

  // 1v1 Duel Matchmaking Modal State
  const [showDuelModal, setShowDuelModal] = useState(false)

  // Level progress
  const levelInfo = useMemo(() => {
    return calculateLevelProgress(profile?.xp || 0)
  }, [profile?.xp])

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return HUB_CATEGORIES.filter((cat) => {
      const matchesTab = cat.group === activeCategoryTab
      const matchesSearch =
        searchCategory.trim() === '' ||
        cat.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchCategory.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeCategoryTab, searchCategory])

  // Handlers to launch solo games with safe UUID and guest support
  const handleLaunchGame = (params: {
    categorySlug: string
    subcategorySlug?: string
    district?: string
    city?: string
    difficulty?: GameDifficulty
    arenaId?: string
  }) => {
    const gameId = safeRandomUUID()
    const diff = params.difficulty || selectedDifficulty
    let url = `/jogar?cat=${encodeURIComponent(params.categorySlug)}&game=${gameId}&diff=${diff}`
    if (params.subcategorySlug) {
      url += `&subcat=${encodeURIComponent(params.subcategorySlug)}`
    }
    if (params.district) {
      url += `&dist=${encodeURIComponent(params.district)}`
    }
    if (params.city) {
      url += `&city=${encodeURIComponent(params.city)}`
    }
    const chosenArena = params.arenaId || (selectedArenaId !== 'auto' ? selectedArenaId : undefined)
    if (chosenArena) {
      url += `&arena=${encodeURIComponent(chosenArena)}`
    }

    logGameFlow('JOGAR_CLICK', {
      from: 'GameHub',
      categorySlug: params.categorySlug,
      difficulty: diff,
    })
    logGameFlow('CATEGORY_SELECT', {
      categorySlug: params.categorySlug,
      subcategorySlug: params.subcategorySlug,
      district: params.district,
      city: params.city,
      difficulty: diff,
      arenaId: chosenArena,
    })

    router.push(url)
  }

  const handleOpenDuelModal = () => {
    setShowDuelModal(true)
  }

  const currentDiffConfig = DIFFICULTY_LEVELS[selectedDifficulty]

  // Blindagem do Ciclo de Vida da Sessão Firebase
  if (!authResolved || (user && profileLoading)) {
    return <LoadingQuiz message="A carregar central de jogos..." submessage="A sincronizar a tua sessão e perfil..." />
  }

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & PLAYER HUD */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Menu Inicial
          </Link>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-3d-chrome">
            Central de Jogo
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Escolhe como queres jogar e conquista o topo de Portugal.
          </p>
        </div>

        {/* Player Status HUD */}
        <div className="flex items-center gap-3 self-start lg:self-auto rounded-2xl border border-white/10 bg-card/80 p-3 backdrop-blur-xl shadow-lg">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-primary font-black text-sm ring-1 ring-primary/40">
            {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : '🇵🇹'}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-black text-foreground truncate max-w-[130px]">
                {profile?.displayName || 'Jogador'}
              </span>
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.62rem] font-black text-gold">
                Nível {levelInfo.currentLevel.level}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="flex items-center gap-1 font-bold text-gold">
                <Coins className="h-3.5 w-3.5" />
                €{((profile?.coins ?? profile?.euros) || 0).toLocaleString('pt-PT')}
              </span>
              <span className="flex items-center gap-1 font-bold text-flag-red">
                <Flame className="h-3.5 w-3.5 fill-current" />
                {profile?.streak || 0}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DIFICULDADE SELETOR HUD */}
      {/* ========================================================= */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-foreground">
              Dificuldade da Sessão
            </p>
            <p className="text-[0.72rem] text-muted-foreground">
              Multiplicador: <strong className="text-gold font-bold">{currentDiffConfig.xpMultiplier}x XP</strong> &amp; Recompensas
            </p>
          </div>
        </div>

        {/* Difficulty Pills */}
        <div className="grid grid-cols-5 gap-1.5 sm:flex sm:items-center">
          {([1, 2, 3, 4, 5] as GameDifficulty[]).map((lvl) => {
            const cfg = DIFFICULTY_LEVELS[lvl]
            const isSelected = selectedDifficulty === lvl
            return (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={cn(
                  'badge-level-selector rounded-xl px-2.5 py-2 text-xs font-black uppercase cursor-pointer flex flex-col sm:flex-row items-center gap-1',
                  isSelected && 'active scale-105 ring-1 ring-emerald-400',
                )}
              >
                <span>Nvl {lvl}</span>
                <span className="hidden sm:inline text-[0.65rem] opacity-80">({cfg.xpMultiplier}x)</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2.5 ARENA ATIVA & SELETOR 2026                            */}
      {/* ========================================================= */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-500/20 bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <Crown className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-foreground">
              Arena do Desafio // 2026
            </p>
            <p className="text-[0.72rem] text-muted-foreground">
              {currentArenaObj ? (
                <>Ativa: <strong className="text-amber-400 font-bold">{currentArenaObj.name}</strong> ({currentArenaObj.rarity})</>
              ) : (
                <>Modo: <strong className="text-emerald-400 font-bold">Dinâmico por Categoria</strong></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/arenas"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Explorar 43 Arenas</span>
          </Link>
          {selectedArenaId !== 'auto' && (
            <button
              onClick={() => {
                setSelectedArenaId('auto')
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('equipped_arena')
                  localStorage.removeItem('arena_explicitly_equipped')
                }
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[0.7rem] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
              title="Voltar ao modo dinâmico por categoria"
            >
              Reset Auto
            </button>
          )}
        </div>
      </div>


      {/* ========================================================= */}
      {/* 1. PRINCIPAL // 🏆 JOGAR AGORA, ⚔️ DUELO 1v1, 📍 MEU DISTRITO */}
      {/* ========================================================= */}
      <section aria-labelledby="heading-principal" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 id="heading-principal" className="font-display text-xs font-black uppercase tracking-widest text-emerald-400">
              1. Modos Principais // Ação Imediata &amp; Competição
            </h2>
          </div>
          <span className="text-[0.7rem] font-bold text-muted-foreground">Competição Geral, PvP &amp; Território</span>
        </div>

        {/* MODO 1: 🏆 JOGAR AGORA (DESAFIO NACIONAL) */}
        <div className="relative overflow-hidden rounded-4xl border-2 border-gold/50 bg-gradient-to-br from-card/95 via-card/85 to-gold/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-gold mb-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold/15 blur-3xl animate-pulse-glow" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-[0.68rem] font-black uppercase tracking-widest text-gold">
                <Trophy className="h-3.5 w-3.5" />
                Modo Rápido • Conhecimento Geral
              </div>

              <h3 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground">
                🏆 Jogar Agora
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                A grande prova do conhecimento luso. 10 perguntas sorteadas e rigorosamente balanceadas por todas as categorias oficiais do país. O teu resultado define a tua posição no Ranking Nacional.
              </p>

              <ModeSpecs
                whatIs="A principal competição nacional de conhecimento de Portugal."
                againstWhom="Todos os jogadores de Portugal e da diáspora no Ranking Geral."
                questionsType="10 perguntas balanceadas de conhecimento geral nacional."
                rewards="+300 XP Base, €75 Acorda e pontuação direta para a Tabela Nacional Top 50."
              />
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0 self-start lg:self-auto w-full sm:w-auto">
              <button
                onClick={() => handleLaunchGame({ categorySlug: 'desafio-nacional' })}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-amber-500 px-8 py-5 font-display text-lg sm:text-xl font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer w-full sm:w-auto"
              >
                <Play className="h-6 w-6 fill-current transition-transform group-hover:scale-110" />
                <span>Jogar Agora</span>
              </button>
              <span className="text-[0.7rem] text-muted-foreground font-bold">
                10 Perguntas • Cronómetro Oficial • 60s
              </span>
            </div>
          </div>
        </div>

        {/* MODOS 2 E 3: ⚔️ DUELO 1V1 E 📍 MEU DISTRITO */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* MODO 2: ⚔️ DUELO 1V1 */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-purple-500/40 bg-gradient-to-br from-card/90 via-card/80 to-purple-500/15 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-purple-400">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40">
                  <Swords className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-purple-300">
                  ⚔️ Matchmaking 1v1
                </span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-black uppercase text-foreground">
                ⚔️ Duelo 1v1
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Confronto direto contra outro jogador em tempo real. As mesmas perguntas, o mesmo tempo. Quem acertar melhor e mais rápido sobe no ranking Elo competitivo.
              </p>

              <ModeSpecs
                whatIs="Duelo PvP direto em tempo real com contagem decrescente."
                againstWhom="Adversário humano emparelhado pelo teu nível e Elo."
                questionsType="Perguntas rápidas e idênticas para ambos os jogadores."
                rewards="+300 XP ao vencedor, Troféus de Duelo e subida de Divisão Elo."
              />
            </div>

            <button
              onClick={() => setShowDuelModal(true)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Swords className="h-4 w-4" />
              <span>Entrar no Duelo 1v1</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* MODO 3: 📍 MEU DISTRITO (ÚNICO MODO TERRITORIAL: DISTRITO + CONCELHO) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-card/90 via-card/80 to-cyan-500/15 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-cyan-400">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-cyan-300">
                    {userDistrict} {userCity ? `• ${userCity}` : ''}
                  </span>
                  <button
                    onClick={() => setShowDistrictModal(true)}
                    className="text-[0.68rem] text-muted-foreground hover:text-white underline font-bold cursor-pointer"
                  >
                    Mudar
                  </button>
                </div>
              </div>

              <h3 className="mt-4 font-display text-2xl font-black uppercase text-foreground">
                📍 Meu Distrito
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Modo territorial único: representa o distrito de <strong className="text-cyan-400 font-bold">{userDistrict}</strong> e o concelho de <strong className="text-amber-400 font-bold">{userCity}</strong>. Conquista poder territorial e sobe nos rankings distrital e municipal.
              </p>

              <ModeSpecs
                whatIs="Sistema territorial integrado: Portugal → Distrito → Concelho."
                againstWhom="Outros 19 distritos e concorrentes municipais da tua terra."
                questionsType={`Geografia, história, património e concelhos de ${userDistrict}.`}
                rewards="XP + Moedas + Poder Territorial e disputa pelo Rei do Distrito."
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => handleLaunchGame({ categorySlug: 'conquista-do-distrito', district: userDistrict })}
                className="flex-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 hover:brightness-110 shadow-md transition-all cursor-pointer"
              >
                <MapPin className="h-4 w-4 fill-current" />
                <span>Distrito ({userDistrict})</span>
              </button>

              <Link
                href="/meu-distrito"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                <span>Painel Territorial</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* ========================================================= */}
      {/* 2. MODOS ESPECIAIS // 🤪 MODO MALUCO, 👁️ DESAFIO VISUAL, 🏟️ ARENAS */}
      {/* ========================================================= */}
      <section aria-labelledby="heading-especiais" className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-400" />
            <h2 id="heading-especiais" className="font-display text-xs font-black uppercase tracking-widest text-purple-400">
              2. Modos Especiais // Humor Absurdo, Visual &amp; Arenas
            </h2>
          </div>
          <span className="text-[0.7rem] font-bold text-muted-foreground">Desafios Alternativos</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* CARD A: 🤪 MODO MALUCO */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-flag-red/40 bg-gradient-to-br from-card/90 via-card/80 to-flag-red/15 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-flag-red">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-flag-red/20 text-flag-red ring-1 ring-flag-red/40">
                  <Laugh className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-flag-red/20 border border-flag-red/40 px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-flag-red">
                  Humor &amp; Caos
                </span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-black uppercase text-flag-red">
                🤪 Modo Maluco
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                As perguntas que não deviam existir. Raciocínio absurdo, rasteiras inacreditáveis, humor luso e diversão sem filtros.
              </p>
            </div>

            <button
              onClick={() => handleLaunchGame({ categorySlug: 'modo-maluco' })}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-flag-red px-5 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg shadow-flag-red/30 transition-all cursor-pointer"
            >
              <span>Entrar no Modo Maluco</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* CARD B: 👁️ DESAFIO VISUAL */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-card/90 via-card/80 to-cyan-500/15 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-cyan-400">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
                  <Eye className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-cyan-300">
                  Perguntas com Imagem
                </span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-black uppercase text-cyan-300">
                👁️ Desafio Visual
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Perguntas baseadas em imagens, mapas históricos, monumentos e pormenores fotográficos de Portugal.
              </p>
            </div>

            <button
              onClick={() => handleLaunchGame({ categorySlug: 'desafio-visual' })}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <span>Jogar Desafio Visual</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* CARD C: 🏟️ ARENAS DE PORTUGAL */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-card/90 via-card/80 to-amber-500/15 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-amber-400">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                  <Crown className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-amber-300">
                  43 Arenas Oficiais
                </span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-black uppercase text-foreground">
                🏟️ Arenas de Portugal
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Batalhas em cenários históricos, distritais e futuristas com fundos e efeitos únicos.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/arenas"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 px-3 py-3.5 font-display text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
              >
                <Compass className="h-4 w-4" />
                <span>Explorar Arenas</span>
              </Link>
              <button
                onClick={() => handleLaunchGame({ categorySlug: 'desafio-nacional', arenaId: selectedArenaId !== 'auto' ? selectedArenaId : undefined })}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-3.5 font-display text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jogar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 3. CATEGORIAS // 🧠 EXPLORAR CATEGORIAS & BANCO TEMÁTICO */}
      {/* ========================================================= */}
      <section aria-labelledby="heading-categorias" className="mt-12 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-400" />
              <h2 id="heading-categorias" className="font-display text-xs font-black uppercase tracking-widest text-blue-400">
                3. Categorias // Explorar Categorias &amp; Treino Temático
              </h2>
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                Explorar Categorias
              </h3>
              <Link
                href="/categorias"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors self-start"
              >
                <span>Ver Catálogo Oficial ➔</span>
              </Link>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Treina temas específicos de Portugal ao Mundo ou entra diretamente no catálogo oficial de categorias.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              placeholder="Pesquisar tema ou categoria..."
              className="w-full rounded-xl border border-white/10 bg-card/80 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveCategoryTab('portugal')}
            className={cn(
              'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer',
              activeCategoryTab === 'portugal'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card/60 text-muted-foreground hover:bg-white/10 hover:text-foreground',
            )}
          >
            🇵🇹 Portugal &amp; Sociedade ({HUB_CATEGORIES.filter((c) => c.group === 'portugal').length})
          </button>
          <button
            onClick={() => setActiveCategoryTab('conhecimento_geral')}
            className={cn(
              'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer',
              activeCategoryTab === 'conhecimento_geral'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card/60 text-muted-foreground hover:bg-white/10 hover:text-foreground',
            )}
          >
            🌍 Conhecimento Geral ({HUB_CATEGORIES.filter((c) => c.group === 'conhecimento_geral').length})
          </button>
          <button
            onClick={() => setActiveCategoryTab('entretenimento_especial')}
            className={cn(
              'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer',
              activeCategoryTab === 'entretenimento_especial'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card/60 text-muted-foreground hover:bg-white/10 hover:text-foreground',
            )}
          >
            🤯 Entretenimento ({HUB_CATEGORIES.filter((c) => c.group === 'entretenimento_especial').length})
          </button>
        </div>

        {/* Category Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon
            const subCount = getSubcategoriesForCategory(cat.slug).length
            return (
              <div
                key={cat.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-card/60 p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-foreground transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[0.62rem] font-bold text-muted-foreground">
                      {cat.difficultyLabel}
                    </span>
                  </div>

                  <h4 className="mt-3 font-display text-base font-black text-foreground group-hover:text-primary transition">
                    {cat.name}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchGame({ categorySlug: cat.slug })}
                    className="flex-1 inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground hover:border-transparent cursor-pointer"
                  >
                    <span>Treinar Tema</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  {subCount > 0 && (
                    <button
                      onClick={() => setSubcatModalCategory(cat)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-2 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-foreground cursor-pointer"
                      title="Explorar subtemas"
                    >
                      <span>Subtemas</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. EVENTOS // 🔥 TEMPORADAS & CAMPEONATOS ESPECIAIS */}
      {/* ========================================================= */}
      <section aria-labelledby="heading-eventos" className="mt-12 pt-6 border-t border-white/10">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400" />
              <h2 id="heading-eventos" className="font-display text-xs font-black uppercase tracking-widest text-amber-400">
                4. Eventos // Temporadas &amp; Campeonatos Especiais
              </h2>
            </div>
            <h3 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-foreground">
              Desafios com Recompensas Temporárias
            </h3>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 transition"
          >
            <span>Ver Todos os Eventos</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((event) => (
            <div
              key={event.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-white/5 p-4 backdrop-blur-xl shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[0.62rem] font-black uppercase text-amber-400">
                    {event.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[0.65rem] text-muted-foreground font-bold">
                    <Clock className="h-3 w-3" />
                    <span>{event.timeLeft}</span>
                  </div>
                </div>

                <h4 className="mt-3 font-display text-base font-black text-foreground">
                  {event.title}
                </h4>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-gold">
                  <Award className="h-3.5 w-3.5" />
                  <span>{event.reward}</span>
                </div>
              </div>

              <Link
                href={`/jogar?cat=desafio-nacional&event=${encodeURIComponent(event.title)}`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                <span>Participar no Evento</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODAL: SELEÇÃO DE DISTRITO */}
      {/* ========================================================= */}
      {showDistrictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-xl font-black text-foreground">
                    Escolher Distrito Representado
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Os teus pontos na Conquista do Distrito somam ao distrito selecionado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDistrictModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-96">
              {VALID_DISTRICTS.map((dist) => {
                const isCurrent = userDistrict === dist
                return (
                  <button
                    key={dist}
                    onClick={() => handleSelectDistrict(dist)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer',
                      isCurrent
                        ? 'border-primary bg-primary/20 text-white'
                        : 'border-white/10 bg-white/[0.03] hover:border-primary/50 hover:bg-white/[0.08] text-foreground',
                    )}
                  >
                    <span className="font-display text-sm font-bold">{dist}</span>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-primary">
                        <Check className="h-4 w-4" /> Ativo
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Representar</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SELEÇÃO DE CIDADE / MUNICÍPIO */}
      {/* ========================================================= */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-xl font-black text-foreground">
                    Escolher Cidade / Município
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Seleciona a cidade para o teu Desafio da Cidade hiperlocal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCityModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={citySearchFilter}
                  onChange={(e) => setCitySearchFilter(e.target.value)}
                  placeholder="Pesquisar concelho ou cidade..."
                  className="w-full rounded-xl border border-white/10 bg-card/80 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-400 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-80">
              {allAvailableCities.slice(0, 50).map((item) => {
                const isCurrent = userCity.toLowerCase() === item.city.toLowerCase()
                return (
                  <button
                    key={`${item.district}-${item.city}`}
                    onClick={() => handleSelectCity(item.city)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer',
                      isCurrent
                        ? 'border-cyan-400 bg-cyan-500/20 text-white'
                        : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/50 hover:bg-white/[0.08] text-foreground',
                    )}
                  >
                    <div>
                      <p className="font-display text-sm font-bold">{item.city}</p>
                      <p className="text-[0.68rem] text-muted-foreground">Distrito de {item.district}</p>
                    </div>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-cyan-400">
                        <Check className="h-4 w-4" /> Selecionada
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Escolher</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SELEÇÃO DE SUBCATEGORIAS */}
      {/* ========================================================= */}
      {subcatModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary">
                  <subcatModalCategory.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-xl font-black text-foreground">
                    {subcatModalCategory.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Escolhe um subtema específico para treinar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubcatModalCategory(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Treinar Tema Completo */}
            <div className="mt-4 p-3.5 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-primary">Tema Completo</p>
                <p className="text-xs text-muted-foreground">Mistura equilibrada de todos os subtemas</p>
              </div>
              <button
                onClick={() => {
                  const slug = subcatModalCategory.slug
                  setSubcatModalCategory(null)
                  handleLaunchGame({ categorySlug: slug })
                }}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase text-primary-foreground hover:brightness-110 cursor-pointer"
              >
                Treinar Tudo
              </button>
            </div>

            {/* Subcategories Grid */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-2 max-h-96">
              {getSubcategoriesForCategory(subcatModalCategory.slug).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    const catSlug = subcatModalCategory.slug
                    setSubcatModalCategory(null)
                    handleLaunchGame({ categorySlug: catSlug, subcategorySlug: sub.id })
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-primary/50 hover:bg-white/[0.08] cursor-pointer group"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-foreground group-hover:text-primary transition">
                      {sub.name}
                    </p>
                    {sub.tags && sub.tags.length > 0 && (
                      <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                        #{sub.tags.slice(0, 3).join(' #')}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* AUTOMATIC 1V1 MATCHMAKING MODAL */}
      {/* ========================================================= */}
      <DuelMatchmakingModal
        isOpen={showDuelModal}
        onClose={() => setShowDuelModal(false)}
        onMatchStart={(id) => {
          console.log('[GAME HUB] MATCH INICIADO -> NAVEGANDO PARA ARENA:', id)
          setShowDuelModal(false)
          router.push(`/jogar/duelo?id=${id}`)
        }}
      />
    </div>
  )
}
