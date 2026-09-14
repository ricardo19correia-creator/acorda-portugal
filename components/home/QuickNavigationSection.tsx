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
      aria-label="Barra de Navegação Inferior"
      className="w-full max-w-3xl mx-auto px-2 sm:px-4 select-none"
    >
      <div className="flex items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 w-full">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 font-display font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
