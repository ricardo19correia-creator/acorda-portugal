'use client'

import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Flame,
  Volume2,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Coins,
  Crown,
  Play,
} from 'lucide-react'
import { ArenaDynamicBackground } from '@/components/arena-dynamic-background'
import { getThemeMeta, type ShopItem } from '@/lib/cosmetics'
import { triggerSoundpackAudio } from '@/lib/sound-engine'
import { cn } from '@/lib/utils'

interface ArenaPreviewModalProps {
  isOpen: boolean
  item: ShopItem | null
  isOwned: boolean
  isEquipped: boolean
  onClose: () => void
  onBuy?: (item: ShopItem) => void
  onEquip?: (item: ShopItem) => void
}

export function ArenaPreviewModal({
  isOpen,
  item,
  isOwned,
  isEquipped,
  onClose,
  onBuy,
  onEquip,
}: ArenaPreviewModalProps) {
  const [mockSelected, setMockSelected] = useState<string | null>(null)
  const [mockFeedback, setMockFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [mockStreak, setMockStreak] = useState<number>(3)
  const [soundTestPack, setSoundTestPack] = useState<string>('soundpack_comentador_futebol')

  if (!isOpen || !item) return null

  const isTheme = item.slot === 'theme' || item.id.startsWith('theme_')
  const isSoundpack = item.slot === 'soundpack' || item.id.startsWith('soundpack_')
  const isStreakEffect = item.slot === 'streak_effect' || item.id.startsWith('streak_') || item.id.startsWith('sfx_')

  const previewThemeId = isTheme ? item.id : 'theme_vulcao_acores'
  const themeMeta = getThemeMeta(previewThemeId)

  const handleMockAnswer = (key: string, isCorrect: boolean) => {
    setMockSelected(key)
    setMockFeedback(isCorrect ? 'correct' : 'wrong')

    const packToPlay = isSoundpack ? item.id : soundTestPack
    triggerSoundpackAudio(packToPlay, isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      setMockStreak((prev) => prev + 1)
    } else {
      setMockStreak(0)
    }

    setTimeout(() => {
      setMockFeedback(null)
      setMockSelected(null)
    }, 1800)
  }

  const handleTestSound = (event: 'correct' | 'wrong' | 'streak' | 'last_second_correct') => {
    const packToPlay = isSoundpack ? item.id : soundTestPack
    triggerSoundpackAudio(packToPlay, event)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade">
      {/* Dynamic Animated Arena Background inside Modal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <ArenaDynamicBackground overrideThemeId={previewThemeId} streak={mockStreak} />
      </div>

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-4xl border border-white/20 bg-card/90 p-5 sm:p-8 backdrop-blur-2xl shadow-2xl z-10 animate-scale-in">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] font-black uppercase tracking-wider text-primary">
                  Pré-Visualização ao Vivo
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-bold text-muted-foreground uppercase">
                  {item.rarity}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-foreground">
                {item.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Theme / Product Badge Details */}
        <div className="mt-4 rounded-2xl bg-white/[0.04] p-3 border border-white/10 text-xs text-muted-foreground flex items-center justify-between">
          <span>{item.description}</span>
          <span className="font-display font-black text-gold text-sm shrink-0 ml-3 flex items-center gap-1">
            <Coins className="h-4 w-4" />
            €{item.price.toLocaleString('pt-PT')}
          </span>
        </div>

        {/* Soundpack Test Controls if previewing a Soundpack */}
        {isSoundpack && (
          <div className="mt-5 rounded-3xl border border-gold/30 bg-gold/10 p-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-wider text-gold flex items-center gap-1.5 mb-3">
              <Volume2 className="h-4 w-4" />
              Testar Áudios e Reações de Voz:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTestSound('correct')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Acerto / Golo</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('last_second_correct')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gold/20 border border-gold/40 p-2.5 text-xs font-bold text-gold hover:bg-gold/30 transition cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Último Segundo</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('wrong')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-flag-red/20 border border-flag-red/40 p-2.5 text-xs font-bold text-flag-red hover:bg-flag-red/30 transition cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Erro / Ao Poste</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('streak')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 p-2.5 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>3x Streak</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Simulated Quiz Question Box */}
        <div className="mt-5 rounded-3xl border border-white/15 bg-card/85 p-5 text-center shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground uppercase">
                Simulação de Partida
              </span>
              <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[0.65rem] font-bold text-primary">
                ⏱️ 60s por Pergunta
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-flag-red bg-flag-red/15 px-2.5 py-0.5 rounded-full border border-flag-red/30">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>{mockStreak}x Streak</span>
            </div>
          </div>

          <h3 className="font-display text-base sm:text-lg font-black text-foreground leading-snug">
            «Em que cidade portuguesa fica localizado o Templo de Diana?»
          </h3>

          {/* Feedback message */}
          {mockFeedback && (
            <div
              className={cn(
                'mt-3 flex items-center justify-center gap-2 rounded-2xl p-2.5 font-display text-xs font-black animate-pop',
                mockFeedback === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-flag-red/20 text-flag-red border border-flag-red/40',
              )}
            >
              {mockFeedback === 'correct' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>{mockFeedback === 'correct' ? 'Correto! Resposta certeira!' : 'Incorreto! Tenta novamente.'}</span>
            </div>
          )}

          {/* Answer buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              { key: 'A', text: 'Évora', correct: true },
              { key: 'B', text: 'Coimbra', correct: false },
              { key: 'C', text: 'Braga', correct: false },
              { key: 'D', text: 'Faro', correct: false },
            ].map((opt) => {
              const isSelected = mockSelected === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleMockAnswer(opt.key, opt.correct)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border p-3 text-left font-display text-xs font-bold transition-all cursor-pointer shadow-md',
                    isSelected && opt.correct
                      ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300'
                      : isSelected && !opt.correct
                        ? 'border-flag-red bg-flag-red/30 text-flag-red'
                        : 'border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:border-white/20',
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10 font-mono text-[0.65rem]">
                    {opt.key}
                  </span>
                  <span className="truncate">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Streak Controls simulation */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground px-2">
          <span>Testar efeito de Streak:</span>
          <div className="flex items-center gap-1.5">
            {[0, 3, 5, 10].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMockStreak(s)}
                className={cn(
                  'rounded-lg px-2.5 py-1 font-bold transition cursor-pointer',
                  mockStreak === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/10',
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex-1 rounded-2xl bg-white/5 py-3 text-xs font-bold text-muted-foreground hover:bg-white/10 hover:text-foreground transition cursor-pointer"
          >
            Fechar Amostra
          </button>

          {isOwned || item.id === 'theme_matriz_tron' || item.price === 0 ? (
            <button
              type="button"
              onClick={() => {
                onEquip?.(item)
                onClose()
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-black uppercase text-black shadow-lg shadow-emerald-500/25 hover:brightness-110 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isEquipped ? 'Arena em Uso' : 'Equipar Arena'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onBuy?.(item)
                onClose()
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 transition cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Comprar por €{item.price.toLocaleString('pt-PT')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
