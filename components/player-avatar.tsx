'use client'

import React from 'react'
import { getFrameStyle, getEquippedCosmetics } from '@/lib/cosmetics'
import type { UserProfile } from '@/lib/game-data'
import { cn } from '@/lib/utils'

export interface PlayerAvatarProps {
  profile?: Partial<UserProfile> | null
  photoURL?: string | null
  displayName?: string | null
  frameId?: string | null
  auraId?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = {
  xs: 'h-7 w-7 rounded-xl text-xs',
  sm: 'h-10 w-10 rounded-xl text-sm',
  md: 'h-16 w-16 rounded-2xl text-2xl',
  lg: 'h-20 w-20 rounded-3xl text-3xl',
  xl: 'h-28 w-28 sm:h-32 sm:w-32 rounded-4xl text-4xl sm:text-5xl',
}

export function PlayerAvatar({
  profile,
  photoURL,
  displayName,
  frameId,
  auraId,
  size = 'md',
  className,
}: PlayerAvatarProps) {
  const cosmetics = getEquippedCosmetics(profile)
  const effectiveFrameId = frameId ?? cosmetics.frameId
  const effectiveAuraId = auraId ?? cosmetics.auraId
  const effectivePhotoURL = photoURL ?? profile?.photoURL ?? null
  const effectiveName = displayName ?? profile?.displayName ?? 'Jogador'
  const initial = effectiveName.trim().charAt(0).toUpperCase() || 'J'

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const frameClass = getFrameStyle(effectiveFrameId)
  const hasAura = effectiveAuraId === 'prestige_aura_dourada'

  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center select-none', className)}>
      {/* Radiant Golden Aura effect */}
      {hasAura && (
        <div className="pointer-events-none absolute -inset-2.5 rounded-full bg-gold/25 blur-md animate-pulse" />
      )}

      {effectivePhotoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={effectivePhotoURL}
          alt={effectiveName}
          className={cn(
            sizeClass,
            'object-cover transition-all duration-300 pointer-events-none',
            frameClass,
          )}
        />
      ) : (
        <div
          className={cn(
            sizeClass,
            'grid place-items-center bg-gradient-to-br from-primary/35 to-accent/20 font-display font-black text-primary transition-all duration-300 pointer-events-none',
            frameClass,
          )}
        >
          {initial}
        </div>
      )}
    </div>
  )
}
