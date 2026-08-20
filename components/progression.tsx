'use client'

import { useState } from 'react'
import { Crown, Sparkles, ChevronRight, Trophy, Shield, Star, Flame, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { PROGRESSION_LEVELS, calculateLevelProgress, type LevelTier } from '@/lib/progression'
import { SectionHeading } from '@/components/section-heading'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

const CATEGORIES: { id: LevelTier['tierCategory']; label: string; icon: typeof Star; range: string }[] = [
  { id: 'Iniciação', label: 'Iniciação', icon: Star, range: 'Níveis 1–5' },
  { id: 'Intermédio', label: 'Intermédio', icon: Shield, range: 'Níveis 6–10' },
  { id: 'Avançado', label: 'Avançado', icon: Flame, range: 'Níveis 11–15' },
  { id: 'Elite', label: 'Elite', icon: Trophy, range: 'Níveis 16–19' },
  { id: 'Lendário', label: 'Lendário', icon: Crown, range: 'Níveis 20–21' },
]

export function Progression() {
  const { user, profile } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<LevelTier['tierCategory']>('Iniciação')

  // Calculate current user progression if authenticated
  const userXp = profile?.xp ?? 0
  const progressInfo = calculateLevelProgress(userXp)
  const isAuth = Boolean(user && profile)

  // Filter levels for the active category
  const filteredLevels = PROGRESSION_LEVELS.filter((l) => l.tierCategory === selectedCategory)

  return (
    <section id="progressao" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="A tua jornada"
        title="Sobe de nível"
        description="De Curioso a Mestre de Portugal. Cada nível desbloqueia novos desafios e distinção no ranking."
      />

      {/* Authenticated Player Status Card */}
      {isAuth && (
        <div className="mt-10 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/90 to-gold/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Current Level Info */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-2xl sm:text-3xl font-black text-primary-foreground shadow-lg ring-4 ring-primary/20">
                {progressInfo.isMaxLevel ? '👑' : progressInfo.currentLevel.level}
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-primary">
                  O teu nível atual
                </p>
                <h3 className="mt-0.5 font-display text-2xl sm:text-3xl font-black text-foreground">
                  {progressInfo.currentLevel.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  <span className="font-bold text-gold">{progressInfo.currentXp.toLocaleString('pt-PT')} XP</span> acumulados
                </p>
              </div>
            </div>

            {/* Next Level / Target */}
            {!progressInfo.isMaxLevel && progressInfo.nextLevel && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-left lg:text-right">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Próximo Objetivo
                </p>
                <p className="font-display text-base font-bold text-foreground flex items-center gap-1.5 lg:justify-end">
                  <span>Nível {progressInfo.nextLevel.level}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-primary">{progressInfo.nextLevel.title}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Faltam <strong className="text-foreground">{progressInfo.xpRemaining.toLocaleString('pt-PT')} XP</strong> ({progressInfo.nextLevel.xpRequired.toLocaleString('pt-PT')} XP total)
                </p>
              </div>
            )}

            {progressInfo.isMaxLevel && (
              <div className="rounded-2xl border border-gold/30 bg-gold/15 px-6 py-3.5 text-center">
                <Crown className="mx-auto h-6 w-6 text-gold animate-bounce" />
                <p className="font-display text-base font-black uppercase text-gold">
                  Topo Absoluto Atingido
                </p>
                <p className="text-xs text-gold/80">És um verdadeiro Mestre de Portugal!</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">
                {progressInfo.isMaxLevel ? 'Progresso Máximo' : `Progresso do Nível ${progressInfo.currentLevel.level}`}
              </span>
              <span className="font-bold text-primary">
                {progressInfo.progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-black/40 p-0.5 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-gold transition-all duration-700 ease-out"
                style={{ width: `${Math.max(2, progressInfo.progressPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id
          const Icon = cat.icon

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer outline-none',
                active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                  : 'border border-white/10 bg-card/60 text-muted-foreground hover:bg-white/10 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.label}</span>
              <span className={cn('text-[0.65rem] font-semibold opacity-70', active ? 'text-primary-foreground' : 'text-muted-foreground')}>
                ({cat.range})
              </span>
            </button>
          )
        })}
      </div>

      {/* Levels Grid for Selected Category */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLevels.map((lvl) => {
          const isUserLevel = isAuth && progressInfo.currentLevel.level === lvl.level
          const isUnlocked = isAuth && userXp >= lvl.xpRequired
          const isTopTier = lvl.level === 21

          return (
            <div
              key={lvl.level}
              className={cn(
                'relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300',
                isUserLevel
                  ? 'border-primary bg-primary/15 ring-2 ring-primary/40 shadow-xl scale-[1.02]'
                  : isTopTier
                  ? 'border-gold/40 bg-gradient-to-br from-gold/20 via-card/85 to-primary/10 sm:col-span-2 lg:col-span-3'
                  : 'border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/80',
              )}
            >
              {/* Header: Badge + XP */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-black',
                      isTopTier
                        ? 'bg-gold text-gold-foreground ring-2 ring-gold/40 text-base'
                        : isUnlocked
                        ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                        : 'bg-white/5 text-muted-foreground',
                    )}
                  >
                    {isTopTier ? '👑' : lvl.level}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Nível {lvl.level}
                      </span>
                      {isUserLevel && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.6rem] font-extrabold uppercase text-primary">
                          Atual
                        </span>
                      )}
                    </div>
                    <h4 className={cn('font-display text-lg font-bold', isTopTier ? 'text-gold-gradient text-xl' : 'text-foreground')}>
                      {lvl.title}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-sm font-black text-foreground/90">
                    {lvl.xpRequired.toLocaleString('pt-PT')}
                  </span>
                  <span className="block text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
                    XP Total
                  </span>
                </div>
              </div>

              {/* Reward Preview */}
              {lvl.rewardPreview && (
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>{lvl.rewardPreview}</span>
                  </span>
                  {isAuth && (
                    <span>
                      {isUnlocked ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ultimate Crown Highlight Footer */}
      <div className="mt-12 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/15 via-card/85 to-gold/15 p-6 sm:p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20 text-gold ring-2 ring-gold/40 shadow-lg">
          <Crown className="h-8 w-8" />
        </div>
        <p className="mt-3 text-[0.68rem] font-black uppercase tracking-[0.28em] text-gold">
          O Topo Absoluto da Progressão
        </p>
        <h3 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
          👑 Mestre de Portugal
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          3.000.000 XP acumulados. Apenas os jogadores mais dedicados e conhecedores do país alcançarão a distinção máxima na história de Portugal.
        </p>
      </div>
    </section>
  )
}
