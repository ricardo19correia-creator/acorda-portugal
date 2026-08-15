'use client'

import { useGlobalCounters } from '@/hooks/use-global-counters'

export function GlobalCountersDisplay() {
  const {
    onlineCount,
    playingCount,
    loading,
    error,
  } = useGlobalCounters()

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
        <span className="text-sm text-white/60">
          A carregar jogadores online...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
        <span className="text-sm text-white/60">
          {error}
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
        <div className="text-3xl font-bold text-emerald-400">
          {onlineCount}
        </div>
        <div className="mt-1 text-sm text-white/70">
          pessoas online
        </div>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-center">
        <div className="text-3xl font-bold text-blue-400">
          {playingCount}
        </div>
        <div className="mt-1 text-sm text-white/70">
          a jogar agora
        </div>
      </div>
    </div>
  )
}
