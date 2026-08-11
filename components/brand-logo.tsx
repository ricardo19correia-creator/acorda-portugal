import { cn } from '@/lib/utils'

/**
 * Compact brand lockup: a glowing shield mark + the two-line wordmark.
 * Reused in the header and footer.
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
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_-2px_var(--primary)]">
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/60" />
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2 4 5v6c0 4.5 3.2 8.4 8 11 4.8-2.6 8-6.5 8-11V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-foreground">
            ACORDA PORTUGAL
          </span>
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-primary">
            Desafio Nacional
          </span>
        </span>
      )}
    </div>
  )
}
