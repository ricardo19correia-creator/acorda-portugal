'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Gamepad2, Trophy, LayoutGrid, User, ShoppingBag, Sparkles, Flag, Flame } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { PlayButton } from '@/components/play-button'
import { OnlineUsersBadge } from '@/components/online-users-badge'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const { user, profile, authResolved } = useAuth()
  const [open, setOpen] = useState(false)

  const NAV = [
    { label: 'Jogar', href: '/jogar', icon: Gamepad2 },
    { label: 'Ranking', href: '/rankings', icon: Trophy },
    { label: 'Explorar', href: '/explorar', icon: Sparkles },
    { label: 'Loja', href: '/loja', icon: ShoppingBag },
    { label: 'Perfil', href: '/perfil', icon: User },
  ]

  const MOBILE_NAV = [
    { label: 'Jogar Agora', href: '/jogar', icon: Gamepad2 },
    { label: 'Rankings & Competição', href: '/rankings', icon: Trophy },
    { label: 'Explorar & Sobre', href: '/explorar', icon: Sparkles },
    { label: 'Categorias', href: '/categorias', icon: LayoutGrid },
    { label: 'Portugal & Mapa', href: '/portugal', icon: Flag },
    { label: 'Eventos', href: '/eventos', icon: Flame },
    { label: 'Loja Acorda', href: '/loja', icon: ShoppingBag },
    { label: 'O Meu Perfil', href: '/perfil', icon: User },
  ]

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavLink = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2)
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        const target = document.getElementById(sectionId)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth' })
          window.history.pushState(null, '', href)
        }
      }
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/15 bg-background/85 backdrop-blur-2xl shadow-[0_12px_40px_-15px_rgba(0,0,0,0.8)]'
          : 'border-b border-white/5 bg-background/40 backdrop-blur-lg',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={handleLogoClick}
            aria-label="Acorda Portugal — início"
            className="shrink-0 hover:scale-102 transition-transform duration-200"
          >
            <BrandLogo />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavLink(item.href, e)}
              className="group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs lg:text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-white/[0.06]"
            >
              <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
              <span className="pointer-events-none">{item.label}</span>
              <span className="absolute bottom-0 left-3 right-3 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-primary to-accent transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}

          {/* Online Players Live Badge */}
          <div className="ml-2 mr-1">
            <OnlineUsersBadge />
          </div>

          {!authResolved ? (
            <div className="ml-2 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-xs font-medium text-muted-foreground animate-pulse">
              <div className="h-4 w-4 rounded-full bg-white/10" />
              <span>A carregar...</span>
            </div>
          ) : user ? (
            <Link
              href="/perfil"
              aria-label={`Ver perfil de ${user.displayName ?? 'Jogador'}`}
              className="ml-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-card/90 p-1.5 pr-4 text-xs font-black uppercase tracking-wider text-foreground shadow-md transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_20px_-4px_oklch(0.7_0.17_152/0.4)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="h-7 w-7 rounded-xl object-cover pointer-events-none ring-1 ring-white/30"
                />
              ) : (
                <div className="grid h-7 w-7 place-items-center rounded-xl bg-primary/20 text-primary pointer-events-none ring-1 ring-primary/40">
                  <User className="h-4 w-4 pointer-events-none" />
                </div>
              )}
              <div className="flex flex-col text-left leading-none">
                <span className="truncate max-w-[100px] pointer-events-none font-black text-foreground">
                  {user.displayName?.split(' ')[0] ?? 'Jogador'}
                </span>
                <span className="text-[0.62rem] text-gold font-bold pointer-events-none">
                  Nível {profile?.level || 1}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/entrar"
              className="ml-2 flex items-center gap-1.5 rounded-xl border border-primary/50 bg-primary/15 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer shadow-sm shadow-primary/20"
            >
              <User className="h-3.5 w-3.5" />
              <span>Entrar</span>
            </Link>
          )}

          <PlayButton href="/jogar" size="md" label="Jogar" className="ml-2" />
        </nav>

        {/* Mobile: Online Badge + Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <OnlineUsersBadge />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/5 text-foreground transition-all hover:bg-white/10 hover:border-white/30 cursor-pointer"
          >
            {open ? <X className="h-5 w-5 pointer-events-none" /> : <Menu className="h-5 w-5 pointer-events-none" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav id="mobile-menu" className="border-t border-white/10 bg-background/95 px-4 py-4 md:hidden">
          <div className="mb-3 flex justify-center">
            <OnlineUsersBadge variant="default" className="w-full justify-center" />
          </div>

          {!authResolved ? (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-3 text-xs text-muted-foreground animate-pulse">
              <div className="h-4 w-4 rounded-full bg-white/10" />
              <span>A verificar sessão...</span>
            </div>
          ) : user ? (
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-card/80 p-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-card"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30 pointer-events-none"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary ring-2 ring-primary/30 pointer-events-none">
                  <User className="h-5 w-5 pointer-events-none" />
                </div>
              )}
              <div className="flex flex-col min-w-0 pointer-events-none">
                <span className="truncate font-bold text-foreground">
                  {user.displayName ?? 'Conta'}
                </span>
                <span className="text-xs text-primary">Ver perfil e estatísticas →</span>
              </div>
            </Link>
          ) : (
            <div className="mb-4">
              <Link
                href="/entrar"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                <User className="h-4 w-4 pointer-events-none" />
                <span className="pointer-events-none">Entrar / Criar Conta</span>
              </Link>
            </div>
          )}

          <ul className="flex flex-col gap-1">
            {MOBILE_NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    setOpen(false)
                    handleNavLink(item.href, e)
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <item.icon className="h-4 w-4 text-primary pointer-events-none" />
                  <span className="pointer-events-none">{item.label}</span>
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
