'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, MapPin, Building2, Compass } from 'lucide-react'
import { DISTRICTS_LIST } from '@/src/data/districts'
import { CANONICAL_CITIES } from '@/lib/portugal-map-nexus-data'
import { cn } from '@/lib/utils'

export interface SearchResultItem {
  id: string
  name: string
  subtitle: string
  type: 'district' | 'city' | 'island'
  coordinates?: [number, number]
  slug?: string
}

interface MapSearchBarProps {
  onSelectResult: (result: SearchResultItem) => void
  onClose?: () => void
  className?: string
}

export function MapSearchBar({
  onSelectResult,
  onClose,
  className,
}: MapSearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. Índice local de pesquisa de alta performance (sem chamadas externas!)
  const searchIndex = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = []

    // 1.1. Distritos e Ilhas
    for (const d of DISTRICTS_LIST) {
      items.push({
        id: `dist_${d.id}`,
        name: d.name,
        subtitle: d.type === 'island' ? `Ilha • ${d.region}` : `Distrito • ${d.region}`,
        type: d.type === 'island' ? 'island' : 'district',
        coordinates: d.center,
        slug: d.slug,
      })
    }

    // 1.2. Cidades Canónicas
    for (const c of CANONICAL_CITIES) {
      items.push({
        id: `city_${c.id}`,
        name: c.name,
        subtitle: `Cidade • ${c.district}`,
        type: 'city',
        coordinates: c.coordinates,
        slug: c.district.toLowerCase(),
      })
    }

    return items
  }, [])

  // 2. Filtragem rápida
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []

    return searchIndex
      .filter((item) => item.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query, searchIndex])

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: SearchResultItem) => {
    setQuery(item.name)
    setIsOpen(false)
    onSelectResult(item)
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-xs', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-3.5 w-3.5 text-cyan-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Pesquisar cidade, distrito..."
          className="w-full h-8 pl-8 pr-7 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 backdrop-blur-md transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-slate-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados Autocomplete */}
      {isOpen && filteredResults.length > 0 && (
        <div className="absolute top-10 left-0 right-0 z-50 rounded-2xl bg-slate-950/95 border border-white/15 p-1 shadow-2xl backdrop-blur-xl animate-fadeIn">
          {filteredResults.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.type === 'city' ? (
                  <Building2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                ) : item.type === 'island' ? (
                  <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <span className="shrink-0 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                {item.type === 'city' ? 'Cidade' : item.type === 'island' ? 'Ilha' : 'Distrito'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
