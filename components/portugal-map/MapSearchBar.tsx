'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search, MapPin, Trophy, X, ChevronRight } from 'lucide-react'
import { getAllTerritoriesList } from '@/lib/portugal-geojson'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type { MapSearchResult } from './types'
import { cn } from '@/lib/utils'

interface MapSearchBarProps {
  onSelectResult: (result: MapSearchResult) => void
  className?: string
}

export function MapSearchBar({ onSelectResult, className }: MapSearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const results = useMemo<MapSearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []

    const list: MapSearchResult[] = []

    // 1. Search Districts
    const territories = getAllTerritoriesList()
    for (const t of territories) {
      if (
        t.name.toLowerCase().includes(q) ||
        t.capital.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q)
      ) {
        list.push({
          id: `district_${t.id}`,
          title: t.name,
          subtitle: `Distrito (${t.capital}) • Região ${t.region}`,
          type: 'district',
          coordinates: t.center,
          zoom: t.zoom,
          pitch: t.pitch,
          bearing: t.bearing,
          metadata: t,
        })
      }
    }

    // 2. Search Arenas
    for (const a of OFFICIAL_MAP_ARENAS) {
      if (
        a.name.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      ) {
        list.push({
          id: `arena_${a.id}`,
          title: a.name,
          subtitle: `Arena ${a.rarity} • ${a.district}`,
          type: 'arena',
          coordinates: a.coordinates,
          zoom: 12.5,
          pitch: 55,
          bearing: -10,
          metadata: a,
        })
      }
    }

    return list.slice(0, 7)
  }, [query])

  const handleSelect = (res: MapSearchResult) => {
    onSelectResult(res)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative z-30 w-full max-w-sm pointer-events-auto', className)}
    >
      {/* Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Pesquisar distrito, cidade ou arena..."
          className="w-full pl-9 pr-9 py-2 rounded-2xl bg-slate-950/80 border border-white/15 focus:border-cyan-400 text-xs font-medium text-white placeholder:text-slate-400 backdrop-blur-md shadow-lg outline-none transition-colors"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl overflow-hidden py-1 divide-y divide-white/5 animate-in fade-in slide-in-from-top-1 duration-150">
          {results.map((res) => (
            <button
              key={res.id}
              type="button"
              onClick={() => handleSelect(res)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs',
                    res.type === 'arena'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  )}
                >
                  {res.type === 'arena' ? <Trophy className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-black text-xs text-white group-hover:text-cyan-300 truncate transition-colors">
                    {res.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {res.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
