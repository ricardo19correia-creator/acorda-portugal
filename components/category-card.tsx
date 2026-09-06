'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import type { Category, Tone } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { logGameFlow } from '@/lib/game-session'

const TONE_TEXT: Record<Tone, string> = {
  primary: 'text-primary',
  gold: 'text-gold',
  red: 'text-flag-red',
  accent: 'text-accent',
}
const TONE_FROM: Record<Tone, string> = {
  primary: 'from-primary/25',
  gold: 'from-gold/25',
  red: 'from-flag-red/25',
  accent: 'from-accent/25',
}
const TONE_RING: Record<Tone, string> = {
  primary: 'group-hover:border-primary/45',
  gold: 'group-hover:border-gold/45',
  red: 'group-hover:border-flag-red/45',
  accent: 'group-hover:border-accent/45',
}
const DIFFICULTY: Record<string, string> = {
  Fácil: 'text-primary',
  Médio: 'text-gold',
  Difícil: 'text-flag-red',
  Variado: 'text-accent',
}

export function CategoryCard({ cat, className }: { cat: Category; className?: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const special = cat.special
  const targetUrl = `/jogar?cat=${cat.slug}`

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    logGameFlow('JOGAR_CLICK', {
      from: 'CategoryCard',
      categorySlug: cat.slug,
      categoryName: cat.name,
    })
    logGameFlow('CATEGORY_SELECT', {
      categorySlug: cat.slug,
      categoryName: cat.name,
      from: 'CategoryCard',
    })
    router.push(targetUrl)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative flex w-60 shrink-0 snap-start flex-col overflow-hidden rounded-3xl border p-5 text-left backdrop-blur transition-all duration-300 hover:-translate-y-1.5 sm:w-auto cursor-pointer',
        special
          ? 'border-flag-red/30 bg-gradient-to-br from-flag-red/15 via-card/70 to-gold/10'
          : cn('border-white/10 bg-card/60 hover:bg-card/90', TONE_RING[cat.tone]),
        className,
      )}
    >
      {/* hover glow wash */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          TONE_FROM[cat.tone],
        )}
      />

      <div className="relative flex items-center justify-between">
        <div
          className={cn(
            'grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br to-transparent transition-transform duration-300 group-hover:scale-110',
            TONE_FROM[cat.tone],
          )}
        >
          <cat.icon className={cn('h-7 w-7', TONE_TEXT[cat.tone])} />
        </div>
        {special ? (
          <span className="animate-pop flex items-center gap-1 rounded-full bg-flag-red px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wide text-flag-red-foreground shadow-[0_0_18px_-4px_var(--flag-red)]">
            <Sparkles className="h-3 w-3" />
            Modo Especial
          </span>
        ) : (
          <span className={cn('font-display text-lg font-black', TONE_TEXT[cat.tone])}>
            {cat.questions}
          </span>
        )}
      </div>

      <h3 className="relative mt-4 font-display text-lg font-bold uppercase tracking-tight text-foreground">
        {cat.name}
      </h3>
      <p className="relative mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
        {cat.description}
      </p>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[0.7rem] font-semibold">
        <span className="text-muted-foreground">
          <span className="text-foreground">{cat.questions}</span> perguntas
        </span>
        <span className={DIFFICULTY[cat.difficulty]}>{cat.difficulty}</span>
      </div>
    </button>
  )
}
