import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  markOnly = false,
  size = 'md',
}: {
  className?: string
  markOnly?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <div className={cn('flex items-center gap-3 group transition-transform duration-200 hover:scale-105', className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/logo-oficial.png"
          alt="Acorda Portugal — Desafio Nacional"
          width={56}
          height={56}
          className={cn(
            'w-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.65)]',
            size === 'sm' && 'h-8',
            size === 'md' && 'h-10 sm:h-11',
            size === 'lg' && 'h-14',
            size === 'xl' && 'h-20',
            !size && 'h-10 sm:h-11'
          )}
          priority
        />
      </div>
      {!markOnly && (
        <div className="flex flex-col text-left leading-none">
          <span className="font-display font-black text-sm sm:text-base tracking-wider text-white group-hover:text-emerald-400 transition-colors uppercase">
            ACORDA PORTUGAL
          </span>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-400 mt-1">
            Desafio Nacional
          </span>
        </div>
      )}
    </div>
  )
}
