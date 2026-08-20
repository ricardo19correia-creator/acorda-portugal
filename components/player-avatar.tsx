'use client'

import React, { useState, useEffect } from 'react'
import { getFrameStyle, getEquippedCosmetics } from '@/lib/cosmetics'
import type { UserProfile } from '@/lib/game-data'
import { getEquippedAvatarImage } from '@/lib/inventory'
import { cn } from '@/lib/utils'

export interface PlayerAvatarProps {
  profile?: Partial<UserProfile> | null
  photoURL?: string | null
  avatarImage?: string | null
  name?: string | null
  displayName?: string | null
  frameId?: string | null
  auraId?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  isCurrentUser?: boolean
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
  frameId,
  auraId,
  size = 'md',
  className,
  isCurrentUser = false,
}: PlayerAvatarProps) {
  const [globalEquippedAvatar, setGlobalEquippedAvatar] = useState<string | null>(null)

  useEffect(() => {
    const updateAvatar = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user_equipped_avatar')
        setGlobalEquippedAvatar(stored || getEquippedAvatarImage())
      }
    }

    updateAvatar()
    window.addEventListener('avatarChanged', updateAvatar)
    window.addEventListener('inventory_updated', updateAvatar)
    window.addEventListener('storage', updateAvatar)

    return () => {
      window.removeEventListener('avatarChanged', updateAvatar)
      window.removeEventListener('inventory_updated', updateAvatar)
      window.removeEventListener('storage', updateAvatar)
    }
  }, [])

  const cosmetics = getEquippedCosmetics(profile)
  const effectiveFrameId = frameId ?? cosmetics.frameId
  const effectiveAuraId = auraId ?? cosmetics.auraId

  // Prioridade de resolução de imagem:
  // 1. avatarImage direto
  // 2. Se for o utilizador atual (isCurrentUser ou quando profile é o próprio), usa o avatar equipado
  // 3. photoURL passado
  // 4. profile?.photoURL
  // 5. Fallback para avatar global
  const effectivePhotoURL =
    avatarImage ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    photoURL ??
    profile?.photoURL ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    (profile ? globalEquippedAvatar : null)

  const effectiveName = displayName ?? name ?? profile?.displayName ?? 'Jogador'
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
            'object-cover object-center transition-all duration-300 pointer-events-none',
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
