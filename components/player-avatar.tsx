'use client'

import React, { useState, useEffect } from 'react'
import type { UserProfile } from '@/lib/game-data'
import { getEquippedAvatarImage } from '@/lib/inventory'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { ANIMATED_FRAMES, getFrameById } from '@/data/frames'
import { AnimatedFrameWrapper } from '@/components/ui/AnimatedFrameWrapper'
import { cn } from '@/lib/utils'

export interface PlayerAvatarProps {
  profile?: Partial<UserProfile> | null
  photoURL?: string | null
  avatarImage?: string | null
  name?: string | null
  displayName?: string | null
  auraId?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  isCurrentUser?: boolean
  showBadge?: boolean
  rank?: number
  borderGlowColor?: string
  onClick?: () => void
  frameId?: string | null
  activeFrame?: string | null
  equippedFrame?: string | null
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 rounded-lg',
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-24 h-24 rounded-3xl',
  xl: 'w-32 h-32 rounded-[28px]',
}

export function PlayerAvatar({
  profile,
  photoURL,
  avatarImage,
  name,
  displayName,
  auraId,
  size = 'md',
  className,
  isCurrentUser = false,
  showBadge = true,
  rank,
  borderGlowColor,
  onClick,
  frameId,
  activeFrame,
  equippedFrame,
}: PlayerAvatarProps) {
  const [globalEquippedAvatar, setGlobalEquippedAvatar] = useState<string | null>(null)
  const [globalEquippedFrame, setGlobalEquippedFrame] = useState<string | null>(null)

  useEffect(() => {
    const updateCosmetics = () => {
      if (typeof window !== 'undefined') {
        const storedAvatar = localStorage.getItem('user_equipped_avatar')
        setGlobalEquippedAvatar(storedAvatar ? getAvatarImage(storedAvatar) : getEquippedAvatarImage())

        const storedFrame = localStorage.getItem('user_equipped_frame')
        setGlobalEquippedFrame(storedFrame || null)
      }
    }

    updateCosmetics()
    window.addEventListener('avatarChanged', updateCosmetics)
    window.addEventListener('frameChanged', updateCosmetics)
    window.addEventListener('inventory_updated', updateCosmetics)
    window.addEventListener('storage', updateCosmetics)

    return () => {
      window.removeEventListener('avatarChanged', updateCosmetics)
      window.removeEventListener('frameChanged', updateCosmetics)
      window.removeEventListener('inventory_updated', updateCosmetics)
      window.removeEventListener('storage', updateCosmetics)
    }
  }, [])

  const effectiveAuraId = auraId ?? (profile as any)?.equipped?.auraId

  const rawCandidate =
    avatarImage ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    photoURL ??
    profile?.photoURL ??
    (profile as any)?.avatarUrl ??
    (profile as any)?.avatar ??
    (profile as any)?.equippedAvatar ??
    (profile as any)?.equipped?.avatar ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    DEFAULT_AVATAR.image

  const effectivePhotoURL = getAvatarImage(rawCandidate)
  const effectiveName = displayName ?? name ?? profile?.displayName ?? 'Jogador'

  const hasAura = effectiveAuraId === 'prestige_aura_dourada'

  const effectiveFrameId =
    frameId ||
    activeFrame ||
    equippedFrame ||
    (profile as any)?.equippedFrame ||
    (profile as any)?.equipped?.frameId ||
    (isCurrentUser ? globalEquippedFrame : null)

  const frameConfig = getFrameById(effectiveFrameId)

  if (frameConfig) {
    return (
      <div
        onClick={onClick}
        className={cn('relative inline-flex shrink-0 aspect-square select-none items-center justify-center', SIZE_CLASSES[size] || SIZE_CLASSES.md, className)}
      >
        {hasAura && (
          <div className="pointer-events-none absolute -inset-2.5 rounded-full bg-gold/25 blur-md animate-pulse" />
        )}
        <AnimatedFrameWrapper frameId={effectiveFrameId} className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectivePhotoURL}
            alt={effectiveName}
            className="w-full h-full object-cover object-center rounded-[inherit] pointer-events-none"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR.image
            }}
          />
        </AnimatedFrameWrapper>

        {isCurrentUser && showBadge && size !== 'xs' && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md z-20 pointer-events-none leading-none">
            TU
          </span>
        )}
      </div>
    )
  }

  const rankBorderClass = rank === 1
    ? 'border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
    : rank === 2
    ? 'border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.5)]'
    : rank === 3
    ? 'border-2 border-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.5)]'
    : isCurrentUser
    ? 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
    : 'border border-slate-700/80 shadow-md'

  return (
    <div
      onClick={onClick}
      className={cn('relative inline-flex shrink-0 aspect-square select-none items-center justify-center', className)}
    >
      {/* Radiant Golden Aura effect */}
      {hasAura && (
        <div className="pointer-events-none absolute -inset-2.5 rounded-full bg-gold/25 blur-md animate-pulse" />
      )}

      {/* Moldura Externa com Brilho / Squircle Padronizado */}
      <div
        className={cn(
          'w-full h-full p-0.5 overflow-hidden transition-all duration-300 bg-slate-950 flex items-center justify-center',
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
          rankBorderClass,
        )}
        style={borderGlowColor ? { borderColor: borderGlowColor } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={effectivePhotoURL}
          alt={effectiveName}
          className="w-full h-full object-cover object-center rounded-[inherit] pointer-events-none"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR.image
          }}
        />
      </div>

      {/* Crachá 'TU' (caso seja o próprio utilizador) */}
      {isCurrentUser && showBadge && size !== 'xs' && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md z-10 pointer-events-none leading-none">
          TU
        </span>
      )}
    </div>
  )
}
export default PlayerAvatar
