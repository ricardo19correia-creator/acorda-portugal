'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Crown,
  Sparkles,
  Shield,
  Zap,
  Play,
  Check,
  Lock,
  Flame,
  Building2,
  ArrowLeft,
  ExternalLink,
  Coins,
  Compass,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react'
import {
  getAllArenas,
  getVipArenas,
  resolveArena,
  type CanonicalArena,
  type ArenaCategoryType,
} from '@/src/data/arenaCatalog'
import { ArenaRenderer } from '@/components/ArenaRenderer'
import { AppBackground } from '@/components/AppBackground'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

export default function ArenasPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const allArenas = useMemo(() => getAllArenas(), [])
  const vipArenas = useMemo(() => getVipArenas(), [])

  const [selectedArenaId, setSelectedArenaId] = useState<string>('arena_palacio_nacional')
  const [equippedArenaId, setEquippedArenaId] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vip' | 'distrital' | 'historica' | 'futurista'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Sincronizar arena equipada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('equipped_arena')
      if (saved) {
        setEquippedArenaId(saved)
        setSelectedArenaId(saved)
      } else {
        setSelectedArenaId('arena_palacio_nacional')
      }
    }
  }, [])

  const selectedArena = useMemo(() => {
    return resolveArena(selectedArenaId) || allArenas[0]
  }, [selectedArenaId, allArenas])

  const filteredArenas = useMemo(() => {
    return allArenas.filter((arena) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arena.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arena.description.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (categoryFilter === 'vip') {
        return arena.category === 'vip_supreme' || arena.category === 'vip_ultimate'
      }
      if (categoryFilter === 'distrital') {
        return arena.category === 'distrital'
      }
      if (categoryFilter === 'historica') {
        return arena.category === 'historica' || arena.category === 'especial'
      }
      if (categoryFilter === 'futurista') {
        return arena.category === 'futurista' || arena.category === 'tematica'
      }
      return true
    })
  }, [allArenas, categoryFilter, searchQuery])

  const handleEquip = (arena: CanonicalArena) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('equipped_arena', arena.id)
      localStorage.setItem('arena_explicitly_equipped', 'true')
      window.dispatchEvent(new Event('arenaChanged'))
      window.dispatchEvent(new Event('inventory_updated'))
      setEquippedArenaId(arena.id)
      showToast(`Arena «${arena.name}» equipada com sucesso!`)
    }
  }

  const handleResetToAuto = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('equipped_arena')
      localStorage.removeItem('arena_explicitly_equipped')
      window.dispatchEvent(new Event('arenaChanged'))
      window.dispatchEvent(new Event('inventory_updated'))
      setEquippedArenaId('')
      showToast('Modo Automático reativado: a arena mudará com a categoria do jogo.')
    }
  }

  const handlePlayInArena = (arena: CanonicalArena) => {
    router.push(`/jogar?cat=desafio-nacional&arena=${encodeURIComponent(arena.id)}`)
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const isSelectedEquipped = equippedArenaId === selectedArena.id

  return (
    <div className="relative min-h-[100dvh] w-full text-white isolate overflow-x-hidden bg-transparent">
      {/* Background Global */}
      <AppBackground />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 px-4 py-3 font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* 1. NAVEGAÇÃO SUPERIOR & TÍTULO */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <Link
              href="/jogar"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Central de Jogo
            </Link>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-3d-chrome">
                  Câmara de Arenas 2150
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  Catálogo Oficial com todas as 43 Arenas Nacionais: 11 Supremas VIP e 32 Regionais.
                </p>
              </div>
            </div>
          </div>

          {/* Status do Modo Atual */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {equippedArenaId ? (
              <button
                onClick={handleResetToAuto}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer shadow-lg"
                title="Voltar a alternar arenas automaticamente conforme a categoria"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Modo Fixo Ativo (Repor Auto)</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Modo Automático: Por Categoria</span>
              </div>
            )}

            <Link
              href="/loja"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
            >
              <span>Loja VIP</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SHOWCASE HERO PRINCIPAL: RENDERIZADOR AO VIVO (ENGINE 2150) */}
        {/* ========================================================= */}
        <section className="mb-12 rounded-4xl border border-white/15 bg-slate-950/80 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual da Arena em Renderização Direta */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <ArenaRenderer
                arenaId={selectedArena.id}
                showAtmosphere={true}
                showLighting={true}
                showBadge={true}
                className="w-full h-full"
              />
            </div>

            {/* Metadados e Ações da Arena Selecionada */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/40 bg-amber-500/20 text-amber-300">
                    {selectedArena.rarity}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/10 text-slate-300">
                    {selectedArena.visualType === 'webp_raster' ? '3D Renderizado (WebP)' : 'Gráfico Vetorial (SVG)'}
                  </span>
                  {isSelectedEquipped && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Equipada
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
                  {selectedArena.name}
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/90 font-medium italic mt-1">
                  «{selectedArena.subtitle}»
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mt-4">
                  {selectedArena.description}
                </p>

                {selectedArena.quote && (
                  <blockquote className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 italic">
                    {selectedArena.quote}
                  </blockquote>
                )}
              </div>

              {/* Botões de Ação Imediata */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handlePlayInArena(selectedArena)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Jogar Nesta Arena</span>
                </button>

                <button
                  onClick={() => handleEquip(selectedArena)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer border',
                    isSelectedEquipped
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 pointer-events-none'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span>{isSelectedEquipped ? 'Equipada' : 'Equipar'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. FILTROS & BARRA DE PESQUISA */}
        {/* ========================================================= */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `Todas (${allArenas.length})` },
              { id: 'vip', label: `VIP Supremas (${vipArenas.length})` },
              { id: 'distrital', label: 'Distritais (20)' },
              { id: 'historica', label: 'Históricas (5)' },
              { id: 'futurista', label: 'Futuristas (7)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer',
                  categoryFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Campo de Pesquisa */}
          <div className="w-full md:w-64 relative">
            <input
              type="text"
              placeholder="Pesquisar arena..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. GRELHA DE TODAS AS ARENAS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredArenas.map((arena) => {
            const isCurrent = arena.id === selectedArena.id
            const isEquipped = arena.id === equippedArenaId

            return (
              <div
                key={arena.id}
                onClick={() => setSelectedArenaId(arena.id)}
                className={cn(
                  'group relative flex flex-col rounded-3xl border p-3.5 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl',
                  isCurrent
                    ? 'bg-slate-900/95 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40 scale-[1.02]'
                    : 'bg-slate-950/60 hover:bg-slate-900/80 border-white/10 hover:border-white/20'
                )}
              >
                {/* Thumbnail Visual */}
                <div className="relative w-full h-40 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden mb-3">
                  <img
                    src={arena.thumbnail || arena.assetPath}
                    alt={arena.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badge de Raridade */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 border border-white/15 text-[9px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm">
                    {arena.rarity}
                  </div>

                  {/* Badge Equipada */}
                  {isEquipped && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Equipada
                    </div>
                  )}
                </div>

                {/* Identificação */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {arena.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                      {arena.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono uppercase">{arena.category.replace('_', ' ')}</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      Ver Detalhes
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredArenas.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm font-mono">Nenhuma arena encontrada com o filtro selecionado.</p>
          </div>
        )}
      </main>
    </div>
  )
}
