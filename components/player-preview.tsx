import { Coins, Sparkles } from 'lucide-react'

/**
 * Visual-only guest status panel. It must not impersonate an authenticated user.
 */
export function PlayerPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-4 backdrop-blur-md">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
      <div className="flex items-center gap-4">
        {/* avatar */}
        <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 text-lg font-bold text-primary ring-1 ring-primary/40">
          ?
          <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-[0.6rem] font-black text-gold-foreground ring-2 ring-card">
            1
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Convidado
          </p>
          <p className="truncate font-display text-lg font-bold text-foreground">A jogar como convidado</p>
          <p className="text-xs font-medium text-primary">Nível 1</p>
        </div>

        {/* stats */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            0 XP
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-foreground">
            <Coins className="h-3.5 w-3.5 text-gold" />
            €0
          </span>
        </div>
      </div>

      {/* level progress */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[0.65rem] font-medium text-muted-foreground">
          <span>Progresso de nível</span>
          <span>0 / 500 XP</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[4%] rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>
    </div>
  )
}
