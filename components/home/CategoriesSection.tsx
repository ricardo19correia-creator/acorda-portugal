'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/game-data'
import { LayoutGrid, ChevronRight, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react'

interface CategoriesSectionProps {
  onStartGame: (route: string) => void
}

export function CategoriesSection({ onStartGame }: CategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <section
      aria-label="Categorias de jogo"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header da Secção com Controlo de Scroll no Desktop */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3 backdrop-blur-md">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>UNIVERSO DO CONHECIMENTO</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            O QUE SABES?
          </h2>
          <p className="mt-2 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
            18 temas canónicos para testares a tua cultura, memória e velocidade de raciocínio.
          </p>
        </div>

        {/* Botões de Scroll Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll para a esquerda"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-400 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll para a direita"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-400 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Faixa Horizontal Scrollable */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const toneBorder =
            cat.tone === 'primary'
              ? 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : cat.tone === 'gold'
              ? 'border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : cat.tone === 'red'
              ? 'border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]'
              : 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]'

          const toneIcon =
            cat.tone === 'primary'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : cat.tone === 'gold'
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : cat.tone === 'red'
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'

          return (
            <div
              key={cat.slug}
              onClick={() => onStartGame(`/jogar?cat=${cat.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onStartGame(`/jogar?cat=${cat.slug}`)}
              className={`group flex-none w-64 sm:w-72 rounded-3xl p-5 sm:p-6 bg-slate-900/85 backdrop-blur-xl border ${toneBorder} transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between snap-start overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${toneIcon} shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    {cat.questions} Perguntas
                  </span>
                </div>

                <h3 className="font-display font-black text-lg sm:text-xl uppercase text-white tracking-wide group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed font-medium line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                <span className="text-[11px] uppercase tracking-wider">Jogar Tema</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA de Rodapé da Secção */}
      <div className="mt-8 text-center">
        <Link
          href="/categorias"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors group"
        >
          <span>EXPLORAR TODAS AS 18 CATEGORIAS</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
