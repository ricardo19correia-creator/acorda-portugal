'use client'

import React, { useState, useEffect } from 'react'

export interface UserAvatarProps {
  src?: string
  frameSrc?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  isCurrentUser?: boolean
  alt?: string
}

export function UserAvatar({
  src = '/images/avatars/camoes-2050.jpg',
  frameSrc,
  size = 'md',
  className = '',
  isCurrentUser = false,
  alt = 'Avatar de Jogador',
}: UserAvatarProps) {
  const [activeAvatar, setActiveAvatar] = useState<string>(src)
  const [activeFrame, setActiveFrame] = useState<string | null>(frameSrc || null)

  useEffect(() => {
    const syncCosmetics = () => {
      if (typeof window !== 'undefined') {
        const localAvatar = localStorage.getItem('user_equipped_avatar')
        if (localAvatar && (isCurrentUser || !src || src === '/images/avatars/camoes-2050.jpg')) {
          setActiveAvatar(localAvatar)
        } else if (src) {
          setActiveAvatar(src)
        }

        if (!frameSrc) {
          const localFrame = localStorage.getItem('user_equipped_frame')
          setActiveFrame(localFrame || null)
        } else {
          setActiveFrame(frameSrc)
        }
      }
    }

    syncCosmetics()

    window.addEventListener('avatarChanged', syncCosmetics)
    window.addEventListener('frameChanged', syncCosmetics)
    window.addEventListener('inventory_updated', syncCosmetics)
    window.addEventListener('storage', syncCosmetics)

    return () => {
      window.removeEventListener('avatarChanged', syncCosmetics)
      window.removeEventListener('frameChanged', syncCosmetics)
      window.removeEventListener('inventory_updated', syncCosmetics)
      window.removeEventListener('storage', syncCosmetics)
    }
  }, [src, frameSrc, isCurrentUser])

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-28 h-28 md:w-36 md:h-36',
  }

  const isGoldFrame = activeFrame?.includes('moldura-ouro') || activeFrame?.includes('moldura_ouro_real')
  const isNeonFrame = activeFrame?.includes('moldura-neon') || activeFrame?.includes('moldura_neon_portugal')

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {/* Avatar Base Image */}
      <div className="w-[82%] h-[82%] rounded-2xl overflow-hidden bg-slate-900 shadow-inner border border-slate-800/80">
        <img
          src={activeAvatar}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/camoes-2050.jpg'
          }}
        />
      </div>

      {/* Active Equipped Frame Overlay */}
      {activeFrame && (
        <img
          src={activeFrame}
          alt="Moldura Ativa"
          className={`absolute inset-0 z-10 w-full h-full object-contain pointer-events-none ${
            isGoldFrame
              ? 'animate-frame-gold drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : isNeonFrame
              ? 'animate-frame-neon drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]'
              : 'animate-pulse drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]'
          }`}
        />
      )}
    </div>
  )
}

export default UserAvatar
