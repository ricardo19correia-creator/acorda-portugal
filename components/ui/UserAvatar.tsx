'use client'

import React, { useState, useEffect } from 'react'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { ANIMATED_FRAMES, getFrameById } from '@/src/data/frames'
import { cn } from '@/lib/utils'

export interface UserAvatarProps {
  src?: string | null
  avatarUrl?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isCurrentUser?: boolean
  showBadge?: boolean
  rank?: number
  frameId?: string | null
  activeFrame?: string | null
  borderGlowColor?: string
  className?: string
  onClick?: () => void
}

export function UserAvatar({
  src,
  avatarUrl,
  alt = 'Avatar do Jogador',
  size = 'md',
  isCurrentUser = false,
  showBadge = true,
  rank,
  frameId,
  activeFrame,
  borderGlowColor,
  className = '',
  onClick,
}: UserAvatarProps) {
  const [localFrame, setLocalFrame] = useState<string | null>(null)

  useEffect(() => {
    const syncFrame = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user_equipped_frame')
        setLocalFrame(stored || null)
      }
    }

    syncFrame()
    window.addEventListener('frameChanged', syncFrame)
    window.addEventListener('inventory_updated', syncFrame)
    window.addEventListener('storage', syncFrame)

    return () => {
      window.removeEventListener('frameChanged', syncFrame)
      window.removeEventListener('inventory_updated', syncFrame)
      window.removeEventListener('storage', syncFrame)
    }
  }, [])

  // Estilos de dimensão padronizados (sempre 1:1 aspect ratio e squircle / cantos curvos)
  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-24 h-24 rounded-3xl',
    xl: 'w-32 h-32 rounded-[28px]',
  }

  const rawCandidate = src || avatarUrl
  const imageSrc = getAvatarImage(rawCandidate)

  const effectiveFrameId = frameId || activeFrame || (isCurrentUser ? localFrame : null)
  const frameConfig = getFrameById(effectiveFrameId)

  const rankBorderClass = frameConfig
    ? frameConfig.cssClass
    : rank === 1
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
      className={cn('relative inline-flex shrink-0 aspect-square select-none', className)}
    >
      {/* Moldura Externa com Brilho / Border Curvo Padronizado / Moldura Viva */}
      <div
        className={cn(
          'w-full h-full p-0.5 overflow-hidden transition-all duration-300 bg-slate-950 flex items-center justify-center',
          sizeClasses[size] || sizeClasses.md,
          rankBorderClass,
        )}
        style={borderGlowColor && !frameConfig ? { borderColor: borderGlowColor } : undefined}
      >
        {/* Imagem Interna com Recorte Curvo Inherit */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={alt}
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

export default UserAvatar
