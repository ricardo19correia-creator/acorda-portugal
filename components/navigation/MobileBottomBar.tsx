'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2, Flag, Trophy, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomBar() {
  const pathname = usePathname()

  const NAV_ITEMS = [
    { label: 'Jogar', href: '/jogar', icon: Gamepad2 },
    { label: 'Mapa', href: '/portugal-mapa', icon: Flag },
    { label: 'Rankings', href: '/rankings', icon: Trophy },
    { label: 'Loja', href: '/loja', icon: ShoppingBag },
    { label: 'Perfil', href: '/perfil', icon: User },
  ]

  // Se estiver numa rota que já tem navegação específica ou se estiver na raiz
  return (
    <nav
      id="mobile-bottom-dock"
      aria-label="Navegação rápida móvel"
      className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all duration-300"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer select-none active:scale-90',
                isActive
                  ? 'text-emerald-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500/40'
                    : 'text-slate-400'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
