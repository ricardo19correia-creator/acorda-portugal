'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Gamepad2, Trophy, Calendar, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isMatchActiveFromRoute } from '@/lib/game-active-state'

export function MobileBottomBar() {
  const pathname = usePathname()

  // Verificar se está em jogo ativo/arena para esconder a barra apenas durante a partida
  const [isInArena, setIsInArena] = useState(false)

  useEffect(() => {
    const checkArena = () => {
      try {
        if (typeof window === 'undefined') return
        const currentPath = window.location.pathname
        const currentSearch = window.location.search

        // Verificar rigorosamente se está numa partida ativa (/jogar?cat=... ou /jogar/duelo?id=...)
        const isMatch = isMatchActiveFromRoute(currentPath, currentSearch)
        if (!isMatch) {
          if (document.documentElement.classList.contains('ap-arena-match')) {
            document.documentElement.classList.remove('ap-arena-match')
          }
          setIsInArena(false)
          return
        }

        setIsInArena(true)
      } catch {
        setIsInArena(false)
      }
    }

    checkArena()
    const interval = setInterval(checkArena, 200)
    window.addEventListener('popstate', checkArena)
    window.addEventListener('hashchange', checkArena)
    window.addEventListener('ap_route_change', checkArena)
    window.addEventListener('ap_match_state_change', checkArena)

    return () => {
      clearInterval(interval)
      window.removeEventListener('popstate', checkArena)
      window.removeEventListener('hashchange', checkArena)
      window.removeEventListener('ap_route_change', checkArena)
      window.removeEventListener('ap_match_state_change', checkArena)
    }
  }, [pathname])

  if (isInArena) {
    return null
  }

  // Ordem estrita obrigatória: INÍCIO → JOGAR → RANKINGS → EVENTOS → LOJA → PERFIL
  const NAV_ITEMS = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Jogar', href: '/jogar', icon: Gamepad2 },
    { label: 'Rankings', href: '/rankings', icon: Trophy },
    { label: 'Eventos', href: '/eventos', icon: Calendar },
    { label: 'Loja', href: '/loja', icon: ShoppingBag },
    { label: 'Perfil', href: '/perfil', icon: User },
  ]

  return (
    <nav
      id="mobile-bottom-dock"
      aria-label="Navegação rápida móvel"
      className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all duration-300"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1 sm:px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

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
                  'relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl transition-all',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500/40'
                    : 'text-slate-400'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
