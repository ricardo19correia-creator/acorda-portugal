'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, LayoutGrid, ShoppingBag, Award, User } from 'lucide-react'

export function QuickNavigationSection() {
  const SHORTCUTS = [
    { label: 'RANKINGS', href: '/rankings', icon: Trophy },
    { label: 'CATEGORIAS', href: '/categorias', icon: LayoutGrid },
    { label: 'LOJA', href: '/loja', icon: ShoppingBag },
    { label: 'CONQUISTAS', href: '/conquistas', icon: Award },
    { label: 'PERFIL', href: '/perfil', icon: User },
  ]

  return (
    <section
      aria-label="Atalhos do Jogo"
      className="w-full max-w-4xl mx-auto px-4 py-8 select-none"
    >
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/90 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              <Icon className="w-4 h-4 text-emerald-400" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
