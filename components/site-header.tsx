'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  Gamepad2,
  Trophy,
  LayoutGrid,
  User,
  ShoppingBag,
  Sparkles,
  Flag,
  Flame,
  HelpCircle,
  LogIn,
  UserPlus,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { PlayButton } from '@/components/play-button'
import { OnlineUsersBadge } from '@/components/online-users-badge'
import { PlayerAvatar } from '@/components/player-avatar'
import AudioPlayer from '@/components/AudioPlayer'
import { UserAvatar } from '@/components/user-avatar'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import { performLogout } from '@/lib/auth-helpers'
import { calculateLevelProgress } from '@/lib/progression'
import { useEconomy } from '@/context/economy-context'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()
  const { formattedCoins, isBalancePulsing } = useEconomy()
  const [open, setOpen] = useState(false)

  const progressInfo = profile?.xp ? calculateLevelProgress(profile.xp) : null
  const userLevel = profile?.level || progressInfo?.currentLevel.level || 1
  const userTier = progressInfo?.currentLevel.cleanTitle || 'Curioso'

  const handleLogout = async () => {
    setOpen(false)
    await performLogout('/')
  }

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '/jogar' || href.startsWith('/jogar')) {
      e.preventDefault()
      if (!user && !auth?.currentUser) {
        router.push(`/entrar?redirect=${encodeURIComponent(href)}`)
        setOpen(false)
        return
      }
      router.push(href)
      setOpen(false)
    }
  }

  const NAV = [
    { label: 'Jogar', href: '/jogar', icon: Gamepad2 },
    { label: 'Ranking', href: '/rankings', icon: Trophy },
    { label: 'Os Criadores 🇵🇹', href: '/criadores', icon: Sparkles },
    { label: 'Explorar', href: '/explorar', icon: Sparkles },
    { label: 'Loja', href: '/loja', icon: ShoppingBag },
    { label: 'Perfil', href: '/perfil', icon: User },
  ]

  const MOBILE_NAV = [
    { label: 'Jogar Agora', href: '/jogar', icon: Gamepad2 },
    { label: '🇵🇹 Os Criadores (Comunidade)', href: '/criadores', icon: Sparkles },
    { label: 'Explorar o Desafio', href: '/explorar', icon: Sparkles },
    { label: 'Categorias de Quiz', href: '/categorias', icon: LayoutGrid },
    { label: 'Ranking Nacional', href: '/rankings', icon: Trophy },
    { label: 'Mapa de Portugal', href: '/portugal', icon: Flag },
    { label: 'Eventos em Direto', href: '/eventos', icon: Flame },
    { label: 'Loja € Acorda', href: '/loja', icon: ShoppingBag },
    { label: 'Central de Ajuda', href: '/ajuda', icon: HelpCircle },
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
          ? 'shadow-lg shadow-black/40'
          : '',
      )}
      style={{
        background: 'rgba(10, 15, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Esquerda: Brand Logo (Oculta subtítulos longos no mobile para evitar sobreposição) */}
        <div className="flex items-center min-w-0 shrink">
          <Link
            href="/"
            onClick={handleLogoClick}
            aria-label="Acorda Portugal — início"
            className="group flex items-center min-w-0"
          >
            <BrandLogo />
          </Link>
        </div>

        {/* Centro: Badge Global de Saldo de Moedas (€ Acorda) com shrink-0 */}
        <Link
          href="/loja"
          title="O teu Saldo de € Acorda - Clica para abrir a Loja"
          className={cn(
            'flex items-center gap-1 sm:gap-1.5 rounded-full border px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 select-none',
            isBalancePulsing
              ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-105 ring-2 ring-emerald-400/50'
              : 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/60 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]',
          )}
        >
          <span className="font-extrabold text-emerald-400">€</span>
          <span className="tabular-nums tracking-wide">{formattedCoins}</span>
        </Link>

        {/* Desktop Navigation (lg+) */}
        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop Controls (lg+) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <AudioPlayer />
          <OnlineUsersBadge showMatches={true} />
          <PlayButton href="/jogar" size="md" label="Jogar" />
        </div>

        {/* Mobile / Tablet Controls (< lg): Som compacto, Online compacto e Botão Hambúrguer sempre visível */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:hidden">
          <AudioPlayer variant="compact" />
          <OnlineUsersBadge variant="compact" />

          {/* Botão Hambúrguer (Mobile) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/15 bg-slate-900/90 text-white transition-all hover:bg-slate-800 hover:border-white/30 cursor-pointer active:scale-95 shrink-0 shadow-md"
          >
            {open ? (
              <X className="h-5 w-5 pointer-events-none text-rose-400" />
            ) : (
              <Menu className="h-5 w-5 pointer-events-none text-slate-100" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav id="mobile-menu" className="border-t border-white/10 bg-background/95 px-4 py-4 md:hidden">
          <div className="mb-3 flex flex-col gap-2">
            <Link
              href="/loja"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-300 transition-all hover:bg-emerald-500/25"
            >
              <span className="text-muted-foreground uppercase tracking-wider text-[11px]">O Teu Saldo Virtual:</span>
              <span className="flex items-center gap-1 text-sm text-emerald-300 font-black">
                <span className="text-emerald-400 font-extrabold">€</span> {formattedCoins}
              </span>
            </Link>
            <OnlineUsersBadge variant="default" className="w-full justify-center" />
          </div>

          {!authResolved ? (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-3 text-xs text-muted-foreground animate-pulse">
              <div className="h-4 w-4 rounded-full bg-white/10" />
              <span>A verificar sessão...</span>
            </div>
          ) : user ? (
            <div className="mb-4 flex flex-col gap-2.5">
              {/* Mini-cartão do Utilizador Autenticado */}
              <Link
                href="/perfil"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-card/90 p-3.5 text-sm font-semibold text-foreground transition-all hover:border-emerald-500/40 hover:bg-card shadow-lg"
              >
                <UserAvatar
                  avatarUrl={profile?.photoURL || user?.photoURL || undefined}
                  isCurrentUser={true}
                  size="md"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {user.displayName || profile?.displayName || 'Jogador'}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
                      Nível {userLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-medium truncate">{userTier}</span>
                    <span>•</span>
                    <span className="text-muted-foreground">{profile?.district || 'Portugal'}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Botão de Destaque Vermelho: Terminar Sessão (Logout) */}
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-300 transition-all hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm active:scale-98"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          ) : (
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <Link
                href="/entrar"
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-3 text-xs font-black uppercase tracking-wider text-emerald-300 transition-all hover:bg-emerald-500/25 hover:border-emerald-400 cursor-pointer shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sessão</span>
              </Link>

              <Link
                href="/entrar?mode=register"
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-white/30 cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-cyan-400" />
                <span>Criar Conta</span>
              </Link>
            </div>
          )}

          <ul className="flex flex-col gap-1">
            {MOBILE_NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
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
