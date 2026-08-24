'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Sparkles, X, Clock } from 'lucide-react'
import { OFFICIAL_EMOTES, DEFAULT_EQUIPPED_EMOTES, getEmoteById, getEmoteRarityBadge, type EmoteItem } from '@/src/data/emotes'
import { playEmoteSound } from '@/lib/sound-engine'
import { cn } from '@/lib/utils'

export interface DuelEmoteBubbleProps {
  emote: {
    emoji?: string
    icon?: string
    label?: string
    text: string
    senderId?: string
  }
  isMe?: boolean
  className?: string
}

/**
 * Balão de Fala Animado (2.5s de duração com fade-out e som)
 * Estilo visual exato:
 * - position: absolute; top: -45px; left: 50%; transform: translateX(-50%);
 * - background: rgba(15, 23, 42, 0.95);
 * - border: 1px solid #a855f7;
 * - border-radius: 12px;
 * - padding: 6px 14px;
 * - box-shadow: 0 4px 20px rgba(0,0,0,0.5);
 * - z-index: 50;
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

  const icon = emote.emoji || emote.icon || '💬'
  const text = emote.label || emote.text

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-50 transition-all duration-300 animate-in zoom-in-75 fade-in duration-200 select-none whitespace-nowrap',
        className
      )}
      style={{
        position: 'absolute',
        top: '-45px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #a855f7',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(168, 85, 247, 0.35)',
        borderRadius: '12px',
        padding: '6px 14px',
        zIndex: 50,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl animate-bounce filter drop-shadow">{icon}</span>
        <span className="font-display font-black text-xs sm:text-sm tracking-wide text-white drop-shadow">
          {text}
        </span>
      </div>

      {/* Cauda / Ponteiro do Balão */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderRight: '1px solid #a855f7',
          borderBottom: '1px solid #a855f7',
        }}
      />
    </div>
  )
}

/**
 * Menu Seletor Pop-over Flutuante ancorado ao botão "REAGIR"
 */
export function DuelEmoteFloatingBar({
  isOpen,
  onClose,
  onSendEmote,
  cooldown,
  equippedEmoteIds,
}: {
  isOpen: boolean
  onClose: () => void
  onSendEmote: (emote: EmoteItem) => void
  cooldown: number
  equippedEmoteIds?: string[]
}) {
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
      ids = DEFAULT_EQUIPPED_EMOTES
    }

    const items = ids
      .map((id) => getEmoteById(id))
      .filter((e): e is EmoteItem => Boolean(e))
      .slice(0, 4)

    setEquippedList(items.length > 0 ? items : OFFICIAL_EMOTES.slice(0, 4))
  }, [equippedEmoteIds, isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop invisível para fechar ao clicar fora */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="absolute left-0 top-full mt-2 z-50 flex items-center gap-1.5 p-2 rounded-2xl border border-purple-500/60 shadow-2xl backdrop-blur-2xl animate-in zoom-in-90 fade-in duration-150"
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
          boxShadow: '0 10px 35px 0 rgba(0, 0, 0, 0.7), 0 0 25px rgba(168, 85, 247, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {equippedList.map((emote) => (
          <button
            key={emote.id}
            type="button"
            disabled={cooldown > 0}
            onClick={() => {
              playEmoteSound(emote.label)
              onSendEmote(emote)
              onClose()
            }}
            title={emote.text}
            className={cn(
              'group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap border',
              cooldown > 0
                ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5'
                : 'border-purple-500/40 bg-purple-950/50 text-white hover:bg-purple-600 hover:border-purple-400 hover:shadow-[0_0_14px_rgba(168,85,247,0.6)]'
            )}
          >
            <span className="text-base group-hover:scale-125 transition-transform">{emote.emoji}</span>
            <span className="inline">{emote.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer ml-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  )
}

/**
 * Modal Completo de Seleção dos 4 Atalhos de Reações 1v1
 */
export function DuelEmotePicker({
  isOpen,
  onClose,
  onSendEmote,
  cooldown,
  equippedEmoteIds,
}: {
  isOpen: boolean
  onClose: () => void
  onSendEmote: (emote: EmoteItem) => void
  cooldown: number
  equippedEmoteIds?: string[]
}) {
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
      ids = DEFAULT_EQUIPPED_EMOTES
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
        className="relative w-full max-w-sm rounded-3xl border border-purple-500/40 p-5 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.25)',
        }}
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
                    : 'border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                )}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-200">
                  {emote.emoji}
                </span>
                <span className="font-display text-xs font-black text-white group-hover:text-purple-300">
                  {emote.label}
                </span>
                <span className="text-[9px] text-purple-400/80 font-bold uppercase tracking-wider">
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
      ids = DEFAULT_EQUIPPED_EMOTES
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
