'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Sparkles, X, Clock } from 'lucide-react'
import { OFFICIAL_EMOTES, DEFAULT_EQUIPPED_EMOTES, getEmoteById, getEmoteRarityBadge, type EmoteItem } from '@/src/data/emotes'
import { playEmoteSound } from '@/lib/sound-engine'
import { cn } from '@/lib/utils'

interface DuelEmoteBubbleProps {
  emote: {
    emoji: string
    label: string
    text: string
    senderId?: string
  }
  isMe: boolean
  className?: string
}

/**
 * Balão de Reação Animado 1v1 (2.5s de duração com fade-out e som)
 * Estilo visual:
 * - position: absolute; top: -50px;
 * - background: rgba(18, 24, 27, 0.95);
 * - border: 1px solid rgba(0, 255, 136, 0.4);
 * - box-shadow: 0 4px 15px rgba(0, 255, 136, 0.2);
 * - border-radius: 12px; padding: 6px 14px;
 */
export function DuelEmoteBubble({ emote, isMe, className }: DuelEmoteBubbleProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [emote])

  if (!visible) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-50 transition-all duration-300 animate-in zoom-in-75 fade-in duration-200 select-none whitespace-nowrap',
        isMe ? 'right-0 -top-[52px] origin-bottom-right' : 'left-0 -top-[52px] origin-bottom-left',
        className
      )}
      style={{
        position: 'absolute',
        top: '-50px',
        background: 'rgba(18, 24, 27, 0.95)',
        border: isMe ? '1px solid rgba(0, 255, 136, 0.5)' : '1px solid rgba(168, 85, 247, 0.5)',
        boxShadow: isMe ? '0 4px 15px rgba(0, 255, 136, 0.25)' : '0 4px 15px rgba(168, 85, 247, 0.25)',
        borderRadius: '12px',
        padding: '6px 14px',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl animate-bounce filter drop-shadow">{emote.emoji || '💬'}</span>
        <span className={cn(
          "font-display font-black text-sm tracking-wide drop-shadow",
          isMe ? "text-emerald-300" : "text-purple-300"
        )}>
          {emote.label || emote.text}
        </span>
      </div>

      {/* Cauda / Ponteiro do Balão de Diálogo */}
      <div
        className={cn(
          'absolute -bottom-1.5 w-3 h-3 rotate-45 border-r border-b',
          isMe ? 'right-4' : 'left-4'
        )}
        style={{
          background: 'rgba(18, 24, 27, 0.95)',
          borderColor: isMe ? 'rgba(0, 255, 136, 0.5)' : 'rgba(168, 85, 247, 0.5)',
        }}
      />
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
 * Menu rápido suspenso com as 4 reações equipadas do jogador
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
        const saved = localStorage.getItem('equipped_emotes') || localStorage.getItem('equipped_taunts')
        if (saved) {
          try {
            ids = JSON.parse(saved)
          } catch {}
        }
      }
    }
    if (!ids || ids.length === 0) {
      ids = DEFAULT_EQUIPPED_EMOTES.slice(0, 4)
    }

    const items = ids
      .map((id) => getEmoteById(id))
      .filter((e): e is EmoteItem => Boolean(e))
      .slice(0, 4)

    setEquippedList(items.length > 0 ? items : OFFICIAL_EMOTES.slice(0, 4))
  }, [equippedEmoteIds, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(18, 24, 27, 0.98)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 255, 136, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Reações Rápidas 1v1
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
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

        {/* 4 Quick Reaction Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {equippedList.map((emote, idx) => {
            return (
              <button
                key={emote.id}
                disabled={cooldown > 0}
                onClick={() => {
                  playEmoteSound(emote.label)
                  onSendEmote(emote)
                  onClose()
                }}
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center border transition-all active:scale-95 cursor-pointer',
                  cooldown > 0
                    ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5'
                    : 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                )}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-200">
                  {emote.emoji}
                </span>
                <span className="font-display text-xs font-black text-white group-hover:text-emerald-300">
                  {emote.label}
                </span>
                <span className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider">
                  Reação {idx + 1}
                </span>
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
          Personaliza os teus 4 atalhos na Loja ou no Perfil.
        </p>
      </div>
    </div>
  )
}

/**
 * Dock rápido de 4 atalhos na HUD durante a partida
 */
export function DuelEmoteQuickDock({
  equippedEmoteIds,
  onSendEmote,
  cooldown,
}: {
  equippedEmoteIds?: string[]
  onSendEmote: (emote: EmoteItem) => void
  cooldown: number
}) {
  const [emotes, setEmotes] = useState<EmoteItem[]>([])

  useEffect(() => {
    let ids = equippedEmoteIds
    if (!ids || ids.length === 0) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('equipped_emotes') || localStorage.getItem('equipped_taunts')
        if (saved) {
          try {
            ids = JSON.parse(saved)
          } catch {}
        }
      }
    }
    if (!ids || ids.length === 0) {
      ids = DEFAULT_EQUIPPED_EMOTES.slice(0, 4)
    }

    const items = ids
      .map((id) => getEmoteById(id))
      .filter((e): e is EmoteItem => Boolean(e))
      .slice(0, 4)

    setEmotes(items.length > 0 ? items : OFFICIAL_EMOTES.slice(0, 4))
  }, [equippedEmoteIds])

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-lg backdrop-blur-md">
      {emotes.map((emote) => (
        <button
          key={emote.id}
          disabled={cooldown > 0}
          onClick={() => {
            playEmoteSound(emote.label)
            onSendEmote(emote)
          }}
          title={emote.text}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-xl text-lg transition-all active:scale-95 cursor-pointer select-none',
            cooldown > 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-emerald-600/30 hover:scale-115 hover:shadow-md'
          )}
        >
          <span>{emote.emoji}</span>
        </button>
      ))}
    </div>
  )
}
