import { cn } from '@/lib/utils'

/**
 * Compact video game brand lockup: glowing shield mark with metallic gradient + wordmark.
 */
export function BrandLogo({
  className,
  markOnly = false,
}: {
  className?: string
  markOnly?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary via-emerald-400 to-gold shadow-[0_0_20px_-2px_oklch(0.7_0.17_152/0.7)] ring-2 ring-white/20">
        <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40" />
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-black drop-shadow-sm font-black"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2 4 5v6c0 4.5 3.2 8.4 8 11 4.8-2.6 8-6.5 8-11V5l-8-3Z" fill="currentColor" fillOpacity="0.2" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      {!markOnly && (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-base font-black tracking-tight text-foreground uppercase">
            ACORDA <span className="text-brand-gradient">PORTUGAL</span>
          </span>
          <span className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-gold">
            Desafio Nacional
          </span>
        </span>
      )}
    </div>
  )
}
