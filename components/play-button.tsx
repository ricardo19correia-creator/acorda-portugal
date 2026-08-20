import Link from 'next/link'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The primary call-to-action of the whole app. Glowing gradient, animated sheen,
 * a pulsing play icon and a lift-on-hover microinteraction.
 */
export function PlayButton({
  className,
  size = 'lg',
  label = 'Jogar agora',
  href = '/jogar',
}: {
  className?: string
  size?: 'lg' | 'md'
  label?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'sheen group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] font-display font-bold uppercase tracking-wide text-primary-foreground shadow-[0_12px_40px_-8px_var(--primary)] outline-none ring-primary/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[position:100%_0] hover:shadow-[0_18px_54px_-6px_var(--primary)] focus-visible:ring-4 active:translate-y-0',
        size === 'lg' ? 'px-9 py-5 text-lg sm:px-11 sm:py-6 sm:text-xl' : 'px-6 py-3.5 text-base',
        className,
      )}
    >
      <span className="pointer-events-none relative grid place-items-center">
        <span className="pointer-events-none absolute h-9 w-9 rounded-full bg-primary-foreground/20 animate-pulse-ring" />
        <span className="pointer-events-none relative grid h-8 w-8 place-items-center rounded-full bg-primary-foreground/15">
          <Play className={cn('fill-current', size === 'lg' ? 'h-4.5 w-4.5' : 'h-4 w-4')} />
        </span>
      </span>
      <span className="pointer-events-none">{label}</span>
    </Link>
  )
}
