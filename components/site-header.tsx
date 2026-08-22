'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Gamepad2, Trophy, LayoutGrid, User, ShoppingBag, Sparkles, Flag, Flame } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { PlayButton } from '@/components/play-button'
import { OnlineUsersBadge } from '@/components/online-users-badge'
import { PlayerAvatar } from '@/components/player-avatar'
import AudioPlayer from '@/components/AudioPlayer'
import { UserAvatar } from '@/components/user-avatar'
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
    { label: 'Explorar o Desafio', href: '/explorar', icon: Sparkles },
    { label: 'Categorias de Quiz', href: '/categorias', icon: LayoutGrid },
    { label: 'Ranking Nacional', href: '/rankings', icon: Trophy },
    { label: 'Mapa de Portugal', href: '/portugal', icon: Flag },
    { label: 'Eventos em Direto', href: '/eventos', icon: Flame },
    { label: 'Loja € Acorda', href: '/loja', icon: ShoppingBag },
    { label: 'O Meu Perfil', href: '/perfil', icon: User },
  ]

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogoClick = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-emerald-500/30 bg-zinc-950/85 backdrop-blur-2xl shadow-[0_12px_40px_-15px_rgba(0,0,0,0.9)]'
          : 'border-b border-white/10 bg-zinc-950/40 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={handleLogoClick}
            aria-label="Acorda Portugal — início"
            className="group flex items-center transition-transform hover:scale-105"
          >
            <BrandLogo />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Audio Player + Online Users Badge + Play CTA */}
        <nav aria-label="Ações de utilizador" className="hidden items-center gap-3 md:flex">
          {/* Botão Compacto de Áudio */}
          <AudioPlayer />

          {/* Indicador de Utilizadores Online */}
          <OnlineUsersBadge />

          {/* Botão Principal Jogar */}
          <PlayButton href="/jogar" size="md" label="Jogar" />
        </nav>

        {/* Mobile: Audio + Online Badge + Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <AudioPlayer />
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
          <div className="mb-3 flex flex-col gap-2">
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
              <UserAvatar avatarUrl={profile?.photoURL || user?.photoURL || undefined} size="md" />
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
                  onClick={() => setOpen(false)}
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
