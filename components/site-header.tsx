'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Gamepad2, Trophy, LayoutGrid, User } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { PlayButton } from '@/components/play-button'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const NAV = [
    { label: 'Jogar', href: '/jogar', icon: Gamepad2 },
    { label: 'Ranking', href: '/#ranking', icon: Trophy },
    { label: 'Categorias', href: '/#categorias', icon: LayoutGrid }, // This now correctly points to the homepage section
    { label: 'Perfil', href: '/#perfil', icon: User },
  ]

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-background/80 backdrop-blur-xl shadow-[0_8px_30px_-12px_oklch(0_0_0/0.6)]'
          : 'border-b border-transparent bg-background/30 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Acorda Portugal — início">
          <BrandLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <PlayButton href="/jogar" size="md" label="Jogar" className="ml-2 rounded-xl px-5 py-2.5 text-sm" />
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-foreground transition-colors hover:bg-white/10 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav id="mobile-menu" className="border-t border-white/10 bg-background/95 px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <PlayButton
            label="Jogar agora"
            href="/jogar"
            className="mt-3 w-full rounded-xl py-4 text-base"
          />
        </nav>
      )}
    </header>
  )
}
