'use client'

import React, { useState, useEffect } from 'react'
import type { UserProfile } from '@/lib/game-data'
import { getEquippedAvatarImage } from '@/lib/inventory'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
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
  // Deprecated / removed
  frameId?: string | null
}

const SIZE_CLASSES = {
  xs: 'h-7 w-7 rounded-xl',
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-16 w-16 rounded-2xl',
  lg: 'h-20 w-20 rounded-3xl',
  xl: 'h-28 w-28 sm:h-32 sm:w-32 rounded-4xl',
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
}: PlayerAvatarProps) {
  const [globalEquippedAvatar, setGlobalEquippedAvatar] = useState<string | null>(null)

  useEffect(() => {
    const updateCosmetics = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user_equipped_avatar')
        setGlobalEquippedAvatar(stored ? getAvatarImage(stored) : getEquippedAvatarImage())
      }
    }

    updateCosmetics()
    window.addEventListener('avatarChanged', updateCosmetics)
    window.addEventListener('inventory_updated', updateCosmetics)
    window.addEventListener('storage', updateCosmetics)

    return () => {
      window.removeEventListener('avatarChanged', updateCosmetics)
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
    (profile as any)?.avatar ??
    (profile as any)?.equippedAvatar ??
    (profile as any)?.equipped?.avatar ??
    globalEquippedAvatar

  const effectivePhotoURL = getAvatarImage(rawCandidate)
  const effectiveName = displayName ?? name ?? profile?.displayName ?? 'Jogador'

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const hasAura = effectiveAuraId === 'prestige_aura_dourada'

  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center select-none', className)}>
      {/* Radiant Golden Aura effect */}
      {hasAura && (
        <div className="pointer-events-none absolute -inset-2.5 rounded-full bg-gold/25 blur-md animate-pulse" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={effectivePhotoURL}
        alt={effectiveName}
        className={cn(
          sizeClass,
          'object-cover object-center transition-all duration-300 pointer-events-none border border-slate-700/80 shadow-md',
        )}
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR.image
        }}
      />
    </div>
  )
}
export default PlayerAvatar

