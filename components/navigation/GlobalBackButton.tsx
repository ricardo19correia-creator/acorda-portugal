'use client'

import React, { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GlobalBackButtonProps {
  label?: string
  fallbackUrl?: string
  className?: string
  variant?: 'header' | 'standalone' | 'inline'
  showAlways?: boolean
  iconOnly?: boolean
  title?: string
  onClick?: () => void
}

/**
 * Hook para navegação segura de regresso.
 * Se existir histórico interno válido na sessão -> router.back()
 * Se não existir histórico interno (ex: link direto, nova janela, referrer externo) -> fallbackUrl ('/')
 */
export function useSafeBack(fallbackUrl: string = '/') {
  const router = useRouter()
  const pathname = usePathname()

  const goBack = useCallback(() => {
    if (typeof window === 'undefined') return

    // Se já estivermos na raiz e o destino for a raiz, nada a fazer
    if (pathname === '/' && fallbackUrl === '/') return

    try {
      // 1. Verificar profundidade registada na sessão
      const rawDepth = sessionStorage.getItem('ap_nav_depth')
      const depth = rawDepth ? parseInt(rawDepth, 10) : 0
      const hasSessionDepth = !isNaN(depth) && depth > 0

      // 2. Verificar referrer do mesmo domínio
      const hasSameOriginReferrer =
        Boolean(document.referrer && document.referrer.startsWith(window.location.origin))

      // 3. Verificar estado de histórico do browser
      const hasHistoryState = Boolean(
        window.history.state &&
        typeof window.history.state.idx === 'number' &&
        window.history.state.idx > 0
      )

      const hasValidInternalHistory =
        (hasSessionDepth || hasSameOriginReferrer || hasHistoryState) &&
        window.history.length > 1

      if (hasValidInternalHistory) {
        // Reduzir profundidade antes de voltar
        if (depth > 0) {
          sessionStorage.setItem('ap_nav_depth', String(depth - 1))
        }

        const initialLoc = window.location.pathname + window.location.search

        // Executar regresso pelo histórico do navegador
        router.back()

        // Salvaguarda caso router.back() fique retido
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname + window.location.search === initialLoc) {
            router.push(fallbackUrl)
          }
        }, 300)
      } else {
        // Sem histórico interno válido -> Navegar para o Início/Home
        router.push(fallbackUrl)
      }
    } catch {
      router.push(fallbackUrl)
    }
  }, [pathname, router, fallbackUrl])

  return { goBack }
}

/**
 * 🇵🇹 ACORDA PORTUGAL — COMPONENTE GLOBAL DE NAVEGAÇÃO REUTILIZÁVEL «← VOLTAR»
 *
 * Garante que em qualquer página do jogo o utilizador tem uma saída clara e direta:
 * - Se existir histórico de navegação anterior -> recua para a página anterior real.
 * - Se não houver histórico válido -> conduz diretamente para o Início/Home.
 * - Compatível a 100% com Website e Capacitor APK (Android/iOS).
 * - Oculta-se automaticamente na página inicial ('/') por omissão.
 */
export function GlobalBackButton({
  label = 'Voltar',
  fallbackUrl = '/',
  className,
  variant = 'header',
  showAlways = false,
  iconOnly = false,
  title,
  onClick,
}: GlobalBackButtonProps) {
  const pathname = usePathname()
  const { goBack } = useSafeBack(fallbackUrl)

  // Por defeito, não exibir na página inicial a menos que explicitamente solicitado
  if (!showAlways && pathname === '/') {
    return null
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick()
    } else {
      goBack()
    }
  }

  const baseStyles =
    'group inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer transition-all active:scale-95 text-slate-200'

  const variantStyles = {
    header:
      'gap-1.5 rounded-xl border border-white/15 bg-slate-900/85 px-3 py-1.5 text-xs sm:text-sm hover:bg-slate-800 hover:text-white hover:border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md shrink-0 shadow-sm min-h-[36px] sm:min-h-[38px]',
    standalone:
      'gap-2 rounded-xl border border-slate-700/60 bg-slate-900/85 px-3.5 py-2 text-xs sm:text-sm hover:bg-slate-800 hover:text-white hover:border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md shadow-md min-h-[40px]',
    inline:
      'gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white py-1',
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label || 'Voltar à página anterior'}
      title={title || 'Voltar à página anterior (ou Início)'}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      <ArrowLeft className="h-4 w-4 shrink-0 text-emerald-400 transition-transform group-hover:-translate-x-0.5 pointer-events-none" />
      {!iconOnly && (
        <span className="leading-none pointer-events-none">{label}</span>
      )}
    </button>
  )
}

export default GlobalBackButton
