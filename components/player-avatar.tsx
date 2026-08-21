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
  const [globalEquippedFrame, setGlobalEquippedFrame] = useState<string | null>(null)

  useEffect(() => {
    const updateCosmetics = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user_equipped_avatar')
        setGlobalEquippedAvatar(stored || getEquippedAvatarImage())
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

  const cosmetics = getEquippedCosmetics(profile)
  const effectiveFrameId = frameId ?? cosmetics.frameId
  const effectiveAuraId = auraId ?? cosmetics.auraId

  const effectivePhotoURL =
    avatarImage ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    photoURL ??
    profile?.photoURL ??
    (isCurrentUser ? globalEquippedAvatar : null) ??
    (profile ? globalEquippedAvatar : null)

  const effectiveFrameURL = (isCurrentUser ? globalEquippedFrame : null) || (profile as any)?.frameImage || null

  const effectiveName = displayName ?? name ?? profile?.displayName ?? 'Jogador'
  const initial = effectiveName.trim().charAt(0).toUpperCase() || 'J'

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const frameClass = getFrameStyle(effectiveFrameId)
  const hasAura = effectiveAuraId === 'prestige_aura_dourada'

  const isGoldFrame = effectiveFrameURL?.includes('moldura-ouro') || effectiveFrameURL?.includes('moldura_ouro_real')
  const isNeonFrame = effectiveFrameURL?.includes('moldura-neon') || effectiveFrameURL?.includes('moldura_neon_portugal')

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

      {/* Frame overlay */}
      {effectiveFrameURL && (
        <img
          src={effectiveFrameURL}
          alt="Moldura"
          className={cn(
            'absolute inset-0 z-10 w-full h-full object-contain pointer-events-none scale-110',
            isGoldFrame ? 'animate-frame-gold' : isNeonFrame ? 'animate-frame-neon' : 'animate-pulse'
          )}
        />
      )}
    </div>
  )
}
