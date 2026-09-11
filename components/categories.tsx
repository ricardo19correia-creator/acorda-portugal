'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORIES, type Category } from '@/lib/game-data'
import { CategoryCard } from '@/components/category-card'
import { Search, ChevronRight, Sparkles, Flag, Globe, Drama, Trophy, Laugh, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CategoryGroupType = 'todos' | 'portugal' | 'mundo' | 'cultura' | 'desporto' | 'especiais'

export const CATEGORY_GROUPS_CONFIG: Record<
  CategoryGroupType,
  { label: string; icon: React.ComponentType<{ className?: string }>; slugs: string[] }
> = {
  todos: {
    label: 'Todas as 18 Categorias',
    icon: Sparkles,
    slugs: [],
  },
  portugal: {
    label: 'Portugal',
    icon: Flag,
    slugs: ['portugal', 'historia', 'geografia', 'portugal-politico', 'empresas-portuguesas', 'atualidade'],
  },
  mundo: {
    label: 'Mundo & Ciência',
    icon: Globe,
    slugs: ['mundo', 'ciencia-tecnologia'],
  },
  cultura: {
    label: 'Cultura & Sociedade',
    icon: Drama,
    slugs: ['cultura', 'musica', 'cinema-tv', 'gastronomia', 'personalidades', 'humor'],
  },
  desporto: {
    label: 'Desporto & Futebol',
    icon: Trophy,
    slugs: ['futebol-portugues', 'desporto'],
  },
  especiais: {
    label: 'Modos Especiais',
    icon: Laugh,
    slugs: ['modo-maluco', 'desafio-visual'],
  },
}

export function Categories() {
  const router = useRouter()
  const [activeGroup, setActiveGroup] = useState<CategoryGroupType>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => {
      // Filtro de Grupo
      if (activeGroup !== 'todos') {
        const groupConfig = CATEGORY_GROUPS_CONFIG[activeGroup]
        if (!groupConfig.slugs.includes(cat.slug)) return false
      }

      // Filtro de Pesquisa
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase()
        return (
          cat.name.toLowerCase().includes(term) ||
          cat.description.toLowerCase().includes(term)
        )
      }

      return true
    })
  }, [activeGroup, searchQuery])

  return (
    <section id="categorias" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Barra de Filtros por Grupos Canónicos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Abas dos 5 Grupos Oficiais */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(Object.keys(CATEGORY_GROUPS_CONFIG) as CategoryGroupType[]).map((groupKey) => {
            const grp = CATEGORY_GROUPS_CONFIG[groupKey]
            const Icon = grp.icon
            const isActive = activeGroup === groupKey

            return (
              <button
                key={groupKey}
                type="button"
                onClick={() => setActiveGroup(groupKey)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer select-none shadow-sm',
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-102 font-black ring-1 ring-emerald-400'
                    : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{grp.label}</span>
              </button>
            )
          })}
        </div>

        {/* Input de Pesquisa */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar tema ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
      </div>

      {/* Grelha de Categorias */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
          <p className="text-slate-400 text-sm">Nenhuma categoria encontrada para o filtro selecionado.</p>
          <button
            type="button"
            onClick={() => { setActiveGroup('todos'); setSearchQuery('') }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((cat) => (
            <CategoryCard key={cat.name} cat={cat} />
          ))}
        </div>
      )}
    </section>
  )
}
