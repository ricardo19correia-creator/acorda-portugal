'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Sparkles, X, Clock, Flame, Zap, Shield, Crown } from 'lucide-react'
import { OFFICIAL_EMOTES, DEFAULT_EQUIPPED_EMOTES, getEmoteById, getEmoteRarityBadge, type EmoteItem } from '@/src/data/emotes'
import { playEmoteSound } from '@/lib/sound-engine'
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
 * Bolha animada de Provocação/Emote flutuante junto ao avatar (3 segundos com fade-out e som)
 */
export function DuelEmoteBubble({ emote, isMe, className }: DuelEmoteBubbleProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    playEmoteSound(emote.label)
    const timer = setTimeout(() => {
      setVisible(false)
    }, 3000)
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
          'relative flex items-center gap-2.5 rounded-2xl px-4 py-2 text-xs sm:text-sm font-black shadow-2xl backdrop-blur-xl border border-white/20 animate-bounce',
          isMe
            ? 'bg-gradient-to-r from-emerald-950/95 to-slate-900/95 text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-r from-purple-950/95 to-slate-900/95 text-purple-300 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
        )}
      >
        <span className="text-2xl filter drop-shadow-md">{emote.emoji}</span>
        <span className="font-display uppercase tracking-wider text-white drop-shadow">{emote.label}</span>

        {/* Cauda da bolha de fala */}
        <div
          className={cn(
            'absolute -bottom-2 w-3 h-3 rotate-45 border-b border-r border-white/20',
            isMe ? 'right-5 bg-slate-900 border-emerald-500/50' : 'left-5 bg-slate-900 border-purple-500/50'
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
 * Painel rápido e modal de seleção das 4 provocações ativas durante o duelo 1v1
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
        className="relative w-full max-w-sm rounded-3xl border border-purple-500/40 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <MessageSquare className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              4 Atalhos de Reações 1v1
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

        {/* 4 Quick Shortcut Slots Grid */}
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
                  'group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center border transition-all active:scale-95',
                  cooldown > 0
                    ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5'
                    : 'cursor-pointer border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                )}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-200">
                  {emote.emoji}
                </span>
                <span className="font-display text-xs font-black text-white group-hover:text-emerald-300">
                  {emote.label}
                </span>
                <span className="text-[9px] text-purple-300/80 font-bold uppercase tracking-wider">
                  Atalho {idx + 1}
                </span>
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
          Configura os teus 4 atalhos favoritos na Loja ou no Perfil.
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
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-purple-500/30 shadow-lg backdrop-blur-md">
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
              : 'hover:bg-purple-600/30 hover:scale-115 hover:shadow-md'
          )}
        >
          <span>{emote.emoji}</span>
        </button>
      ))}
    </div>
  )
}
