'use client'

import React from 'react'
import { CREATOR_CATEGORIES } from '@/lib/creators-service'
import type { CreatorCategorySlug } from '@/src/types/creators'
import { cn } from '@/lib/utils'

interface CreatorsCategoriesBarProps {
  selectedCategory: CreatorCategorySlug | 'todas'
  onSelectCategory: (cat: CreatorCategorySlug | 'todas') => void
  categoryCounts?: Record<string, number>
}

export function CreatorsCategoriesBar({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}: CreatorsCategoriesBarProps) {
  return (
    <div className="w-full">
      {/* Scroll horizontal no mobile, flex-wrap no desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap">
        {/* Botão "Todas" */}
        <button
          type="button"
          onClick={() => onSelectCategory('todas')}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm',
            selectedCategory === 'todas'
              ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50'
              : 'border-white/10 bg-slate-900/80 text-slate-400 hover:border-white/20 hover:bg-slate-800 hover:text-white',
          )}
        >
          <span className="text-sm">✨</span>
          <span>Todas</span>
          {categoryCounts['todas'] !== undefined && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-black text-slate-300">
              {categoryCounts['todas']}
            </span>
          )}
        </button>

        {/* 9 Categorias Oficiais */}
        {CREATOR_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.slug
          const count = categoryCounts[cat.slug]

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              title={cat.tagline}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm',
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/40 font-black'
                  : 'border-white/10 bg-slate-900/80 text-slate-400 hover:border-white/25 hover:bg-slate-800 hover:text-white',
              )}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                    isSelected
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-white/10 text-slate-300',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
