'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Sparkles, X, Clock, Flame, Zap, Shield, Crown } from 'lucide-react'
import { OFFICIAL_EMOTES, DEFAULT_EQUIPPED_EMOTES, getEmoteById, getEmoteRarityBadge, type EmoteItem } from '@/src/data/emotes'
import { cn } from '@/lib/utils'

interface DuelEmoteBubbleProps {
  emote: {
    emoji: string
    label: string
    text: string
    senderId: string
  }
  isMe: boolean
  className?: string
}

/**
 * Bolha animada de Emote flutuante junto ao avatar
 */
export function DuelEmoteBubble({ emote, isMe, className }: DuelEmoteBubbleProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
    }, 2800)
    return () => clearTimeout(timer)
  }, [emote])

  if (!visible) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-50 transition-all duration-300 transform animate-rise',
        isMe ? 'right-0 -top-14 origin-bottom-right' : 'left-0 -top-14 origin-bottom-left',
        className
      )}
    >
      <div
        className={cn(
          'relative flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-black shadow-2xl backdrop-blur-xl border border-white/20',
          isMe
            ? 'bg-gradient-to-r from-emerald-950/90 to-slate-900/90 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
            : 'bg-gradient-to-r from-purple-950/90 to-slate-900/90 text-purple-300 border-purple-500/40 shadow-purple-500/20'
        )}
      >
        <span className="text-xl sm:text-2xl animate-bounce filter drop-shadow">{emote.emoji}</span>
        <span className="font-display uppercase tracking-wider">{emote.label}</span>

        {/* Cauda da bolha de fala */}
        <div
          className={cn(
            'absolute -bottom-2 w-3 h-3 rotate-45 border-b border-r border-white/20',
            isMe ? 'right-5 bg-slate-900/90 border-emerald-500/40' : 'left-5 bg-slate-900/90 border-purple-500/40'
          )}
        />
      </div>
    </div>
  )
}

interface DuelEmotePickerProps {
  isOpen: boolean
  onClose: () => void
  onSendEmote: (emote: EmoteItem) => void
  cooldown: number
  equippedEmoteIds?: string[]
}

/**
 * Painel compacto de seleção de 8 emotes equipados durante o 1v1
 */
export function DuelEmotePicker({
  isOpen,
  onClose,
  onSendEmote,
  cooldown,
  equippedEmoteIds,
}: DuelEmotePickerProps) {
  const [equippedList, setEquippedList] = useState<EmoteItem[]>([])

  useEffect(() => {
    let ids = equippedEmoteIds
    if (!ids || ids.length === 0) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('equipped_emotes')
        if (saved) {
          try {
            ids = JSON.parse(saved)
          } catch {}
        }
      }
    }
    if (!ids || ids.length === 0) {
      ids = DEFAULT_EQUIPPED_EMOTES
    }

    const items = ids
      .map((id) => getEmoteById(id))
      .filter((e): e is EmoteItem => Boolean(e))
      .slice(0, 8)

    setEquippedList(items.length > 0 ? items : OFFICIAL_EMOTES.slice(0, 8))
  }, [equippedEmoteIds, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <MessageSquare className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Reações Rápidas 1v1
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cooldown Warning Notice */}
        {cooldown > 0 && (
          <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            <span>Aguarda {cooldown}s para nova reação...</span>
          </div>
        )}

        {/* Emote Grid (8 slots) */}
        <div className="grid grid-cols-2 gap-2.5">
          {equippedList.map((emote) => {
            const rarityClass = getEmoteRarityBadge(emote.rarity)
            return (
              <button
                key={emote.id}
                disabled={cooldown > 0}
                onClick={() => {
                  onSendEmote(emote)
                  onClose()
                }}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-2xl p-2.5 text-left border transition-all active:scale-95',
                  cooldown > 0
                    ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5'
                    : 'cursor-pointer border-white/10 bg-white/5 hover:bg-white/15 hover:border-emerald-400/50 hover:shadow-lg'
                )}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
                  {emote.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xs font-black truncate text-white group-hover:text-emerald-300">
                    {emote.label}
                  </p>
                  <span className={cn('inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border', rarityClass)}>
                    {emote.rarity}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
          Personaliza os teus 8 emotes na Loja ou no Perfil.
        </p>
      </div>
    </div>
  )
}
