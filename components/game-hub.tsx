'use client'

import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import {
  HUB_CATEGORIES,
  DIFFICULTY_LEVELS,
  getSubcategoriesForCategory,
  type GameDifficulty,
  type CategoryGroupKey,
  type HubCategory,
} from '@/lib/quiz-engine'
import { getDefaultCityForDistrict } from '@/data/districts'
import { calculateLevelProgress } from '@/lib/progression'
import { DuelMatchmakingModal } from '@/components/duel-matchmaking-modal'
import { cn, safeRandomUUID } from '@/lib/utils'

export function GameHub() {
  const router = useRouter()
  const { user, profile } = useAuth()

  // State
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(2)
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryGroupKey>('portugal')
  const [searchCategory, setSearchCategory] = useState('')
  const [subcatModalCategory, setSubcatModalCategory] = useState<HubCategory | null>(null)

  // Representação Territorial Permanente e Inalterável da Conta
  const userDistrict = useMemo(() => {
    return (
      profile?.district ||
      profile?.representedDistrict ||
      (typeof window !== 'undefined' ? localStorage.getItem('user_district') : null) ||
      'Portugal'
    )
  }, [profile?.district, profile?.representedDistrict])

  const userCity = useMemo(() => {
    return (
      profile?.city ||
      profile?.representedCity ||
      (typeof window !== 'undefined' ? localStorage.getItem('user_city') : null) ||
      (userDistrict !== 'Portugal' ? getDefaultCityForDistrict(userDistrict) : 'Portugal')
    )
  }, [profile?.city, profile?.representedCity, userDistrict])

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

    router.push(url)
  }

  const handleOpenDuelModal = () => {
    setShowDuelModal(true)
  }

  const currentDiffConfig = DIFFICULTY_LEVELS[selectedDifficulty]

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
      {/* 3. 🔥 JOGAR AGORA — PRINCIPAL HERO CARD */}
      {/* ========================================================= */}
      <div className="mt-8 relative overflow-hidden rounded-4xl border border-primary/40 bg-gradient-to-br from-card/90 via-card/75 to-primary/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-primary/60">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[0.68rem] font-black uppercase tracking-widest text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Partida Imediata
            </div>

            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground">
              ▶ Jogar Agora
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Entra diretamente numa partida rápida com perguntas variadas de Portugal. Ganha XP imediato, euros virtuais e sobe de nível.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1 rounded-lg bg-gold/15 px-2.5 py-1 text-gold">
                <Sparkles className="h-3.5 w-3.5" /> +250 XP Base
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-primary">
                <Coins className="h-3.5 w-3.5" /> +€50 Acorda
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-foreground">
                <Trophy className="h-3.5 w-3.5 text-gold" /> Ranking Nacional
              </span>
            </div>
          </div>

          {/* Big Launch Button */}
          <button
            onClick={() => handleLaunchGame({ categorySlug: 'desafio-nacional' })}
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary via-primary to-emerald-400 px-8 py-5 font-display text-lg sm:text-xl font-black uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer self-start lg:self-auto w-full sm:w-auto"
          >
            <Play className="h-6 w-6 fill-current transition-transform group-hover:scale-110" />
            <span>Iniciar Partida</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MODOS PRINCIPAIS DE COMPETIÇÃO NACIONAL & TERRITORIAL */}
      {/* ========================================================= */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
              Modos Territoriais
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compete pelo país, pelo teu distrito ou pela tua cidade.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* CARD 1: 🏆 DESAFIO NACIONAL */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gold/30 bg-card/75 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-gold ring-1 ring-gold/40">
                  <Trophy className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider text-gold">
                  Nacional
                </span>
              </div>

              <h4 className="mt-4 font-display text-xl font-black uppercase text-foreground">
                🏆 Desafio Nacional
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Compete contra Portugal inteiro. Perguntas de todas as categorias oficiais. Sobe na tabela nacional.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                <span className="text-gold">+300 XP</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-primary">+€75 Acorda</span>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame({ categorySlug: 'desafio-nacional' })}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gold/20 border border-gold/40 px-4 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-gold hover:bg-gold hover:text-black transition-all cursor-pointer"
            >
              <span>Jogar Desafio</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* CARD 2: 📍 O MEU DISTRITO */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-primary/30 bg-card/75 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-primary/15 border border-primary/30 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider text-primary">
                  {userDistrict}
                </span>
              </div>

              <h4 className="mt-4 font-display text-xl font-black uppercase text-foreground">
                📍 O Meu Distrito
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Representa o distrito de <strong className="text-primary font-bold">{userDistrict}</strong>. Cada resposta certa soma pontos ao mapa distrital.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                <span className="text-gold">+250 XP</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-primary">+€50 Acorda</span>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame({ categorySlug: 'o-meu-distrito', district: userDistrict })}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/25 transition-all cursor-pointer"
            >
              <span>Representar {userDistrict}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* CARD 3: 🏙️ DESAFIO DA CIDADE */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent/30 bg-card/75 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 shadow-xl sm:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/20 text-accent ring-1 ring-accent/40">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-accent/15 border border-accent/30 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider text-accent">
                  {userCity}
                </span>
              </div>

              <h4 className="mt-4 font-display text-xl font-black uppercase text-foreground">
                🏙️ Desafio da Cidade
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Conheces mesmo <strong className="text-accent font-bold">{userCity}</strong>? Perguntas locais sobre monumentos, ruas e tradições.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                <span className="text-gold">+200 XP</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-accent">+€40 Acorda</span>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame({ categorySlug: 'desafio-cidade', city: userCity, district: userDistrict })}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-accent/20 border border-accent/40 px-4 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-accent hover:bg-accent hover:text-black transition-all cursor-pointer"
            >
              <span>Jogar {userCity}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MODOS ESPECIAIS: 🤪 MODO MALUCO & ⚔️ DUELO 1v1 MATCHMAKING */}
      {/* ========================================================= */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {/* MODO MALUCO */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-flag-red/40 bg-gradient-to-br from-card/85 via-card/75 to-flag-red/10 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-flag-red">
          <div>
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-flag-red/20 text-flag-red ring-1 ring-flag-red/40">
                <Laugh className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-flag-red/15 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider text-flag-red">
                Especial • Humor
              </span>
            </div>

            <h4 className="mt-4 font-display text-2xl font-black uppercase text-flag-red">
              🤪 Modo Maluco
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              As perguntas que não deviam existir. Raciocínio absurdo, rasteiras inacreditáveis e diversão sem filtros.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-bold">
              <span className="text-gold">+200 XP</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-flag-red">+€50 Acorda</span>
            </div>
          </div>

          <button
            onClick={() => handleLaunchGame({ categorySlug: 'modo-maluco' })}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-flag-red px-4 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg shadow-flag-red/25 transition-all cursor-pointer"
          >
            <span>Entrar no Modo Maluco</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* DUELO 1v1 MATCHMAKING AUTOMÁTICO */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-card/90 via-card/80 to-purple-500/15 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-purple-500">
          <div>
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40">
                <Swords className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider text-purple-300">
                ⚔️ Matchmaking 1v1
              </span>
            </div>

            <h4 className="mt-4 font-display text-2xl font-black uppercase text-foreground">
              ⚔️ Duelo 1v1 em Direto
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Clica para procurar adversário instantâneo. Confronto de 10 perguntas com contagem 3..2..1 e validação em tempo real no servidor.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-gold">+300 XP Vitória</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-purple-400">+€100 Acorda</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary">Matchmaking por Nível</span>
            </div>
          </div>

          <button
            onClick={handleOpenDuelModal}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Swords className="h-4 w-4" />
            <span>Jogar Duelo 1v1</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. 🧠 CATEGORIAS OFICIAIS (3 Grandes Abas) */}
      {/* ========================================================= */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
              🧠 Escolher por Categoria
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Seleciona o teu tema preferido e testa o teu conhecimento especializado.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              placeholder="Pesquisar categoria..."
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
            🇵🇹 Portugal & Sociedade ({HUB_CATEGORIES.filter((c) => c.group === 'portugal').length})
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
            🤯 Entretenimento & Especial ({HUB_CATEGORIES.filter((c) => c.group === 'entretenimento_especial').length})
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

                  <h5 className="mt-3 font-display text-base font-black text-foreground group-hover:text-primary transition">
                    {cat.name}
                  </h5>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchGame({ categorySlug: cat.slug })}
                    className="flex-1 inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground hover:border-transparent cursor-pointer"
                  >
                    <span>Jogar</span>
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
      </div>

      {/* ========================================================= */}
      {/* SUBCATEGORY SELECTION MODAL */}
      {/* ========================================================= */}
      {subcatModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-card p-6 shadow-2xl animate-scale-in">
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
                    Escolhe um subtema específico para jogar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubcatModalCategory(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Play Main Category */}
            <div className="mt-4 p-3.5 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-primary">Tema Completo</p>
                <p className="text-xs text-muted-foreground">Mistura de todos os subtemas</p>
              </div>
              <button
                onClick={() => {
                  const slug = subcatModalCategory.slug
                  setSubcatModalCategory(null)
                  handleLaunchGame({ categorySlug: slug })
                }}
                className="rounded-xl bg-primary px-3.5 py-2 text-xs font-black uppercase text-primary-foreground hover:brightness-110 cursor-pointer"
              >
                Jogar Tudo
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
