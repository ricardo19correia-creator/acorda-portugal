'use client'

import React, { useState, useEffect } from 'react'
import type { UserProfile } from '@/lib/game-data'
import { getEquippedAvatarImage } from '@/lib/inventory'
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
  xs: 'h-7 w-7 rounded-xl text-xs',
  sm: 'h-10 w-10 rounded-xl text-sm',
  md: 'h-16 w-16 rounded-2xl text-2xl',
  lg: 'h-20 w-20 rounded-3xl text-3xl',
  xl: 'h-28 w-28 sm:h-32 sm:w-32 rounded-4xl text-4xl sm:text-5xl',
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
        setGlobalEquippedAvatar(stored || getEquippedAvatarImage())
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

  let effectivePhotoURL =
    avatarImage ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    photoURL ??
    profile?.photoURL ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    (profile ? globalEquippedAvatar : null)

  if (effectivePhotoURL && effectivePhotoURL.includes('moldura')) {
    effectivePhotoURL = '/images/avatars/guardiao-vulcanico.jpg'
  }

  const effectiveName = displayName ?? name ?? profile?.displayName ?? 'Jogador'
  const initial = effectiveName.trim().charAt(0).toUpperCase() || 'J'

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
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
            'object-cover object-center transition-all duration-300 pointer-events-none border border-slate-700/80 shadow-md',
          )}
          onError={(e) => {
            e.currentTarget.src = '/images/avatars/guardiao-vulcanico.jpg'
          }}
        />
      ) : (
        <div
          className={cn(
            sizeClass,
            'grid place-items-center bg-gradient-to-br from-primary/35 to-accent/20 font-display font-black text-primary transition-all duration-300 pointer-events-none border border-slate-700/80 shadow-md',
          )}
        >
          {initial}
        </div>
      )}
    </div>
  )
}
export default PlayerAvatar
