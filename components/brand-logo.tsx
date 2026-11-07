'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  markOnly = false,
  size = 'md',
  variant = 'auto',
  subtitle,
}: {
  className?: string
  markOnly?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'institutional' | 'game' | 'auto'
  subtitle?: string
}) {
  const pathname = usePathname()
  const isGameRoute =
    variant === 'game' ||
    (variant === 'auto' &&
      pathname &&
      (pathname.startsWith('/jogar') ||
        pathname.startsWith('/loja') ||
        pathname.startsWith('/cofre') ||
        pathname.startsWith('/arenas') ||
        pathname.startsWith('/conquistas') ||
        pathname.startsWith('/desafio-nacional')))

  const displaySubtitle =
    subtitle || (isGameRoute ? 'DESAFIO NACIONAL' : 'INFORMAÇÃO & CIDADANIA')

  return (
    <div className={cn('flex items-center gap-2 group transition-transform duration-200 hover:scale-105 min-w-0 shrink', className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/logo-oficial.png"
          alt="Acorda Portugal"
          width={56}
          height={56}
          className={cn(
            'w-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.65)]',
            size === 'sm' && 'h-7 sm:h-8',
            size === 'md' && 'h-7 sm:h-9 md:h-11',
            size === 'lg' && 'h-14',
            size === 'xl' && 'h-20',
            !size && 'h-7 sm:h-9 md:h-11'
          )}
          priority
        />
      </div>
      {!markOnly && (
        <div className="flex flex-col text-left leading-tight min-w-0">
          {/* Nome principal sempre legível */}
          <span className="font-display font-black text-xs sm:text-sm md:text-base tracking-wider text-white group-hover:text-emerald-400 transition-colors uppercase truncate">
            ACORDA PORTUGAL
          </span>
          {/* Subtítulo dinâmico: Institucional vs Jogo */}
          <span
            className={cn(
              'hidden sm:inline text-[9.5px] md:text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap',
              isGameRoute ? 'text-amber-400' : 'text-emerald-400'
            )}
          >
            {displaySubtitle}
          </span>
        </div>
      )}
    </div>
  )
}

