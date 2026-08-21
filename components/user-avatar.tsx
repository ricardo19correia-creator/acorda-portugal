'use client'

import React, { useState, useEffect } from 'react'

export interface UserAvatarProps {
  avatarUrl?: string
  src?: string
  frameId?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  isCurrentUser?: boolean
  alt?: string
}

export function UserAvatar({
  avatarUrl,
  src,
  frameId,
  size = 'lg',
  className = '',
  isCurrentUser = false,
  alt = 'Avatar de Jogador',
}: UserAvatarProps) {
  const [currentAvatar, setCurrentAvatar] = useState<string>(avatarUrl || src || '/images/avatars/guardiao-vulcanico.jpg')
  const [currentFrame, setCurrentFrame] = useState<string | null>(frameId || null)

  useEffect(() => {
    const syncCosmetics = () => {
      if (typeof window !== 'undefined') {
        const localAvatar = localStorage.getItem('user_equipped_avatar')
        if (localAvatar && (isCurrentUser || (!avatarUrl && !src))) {
          // Garante que se o avatar guardado for incorretamente uma moldura, faz fallback para personagem
          if (localAvatar.includes('moldura')) {
            setCurrentAvatar('/images/avatars/guardiao-vulcanico.jpg')
            localStorage.setItem('user_equipped_avatar', '/images/avatars/guardiao-vulcanico.jpg')
          } else {
            setCurrentAvatar(localAvatar)
          }
        } else if (avatarUrl || src) {
          const given = avatarUrl || src
          if (given && !given.includes('moldura')) {
            setCurrentAvatar(given)
          } else {
            setCurrentAvatar('/images/avatars/guardiao-vulcanico.jpg')
          }
        }

        if (frameId !== undefined && frameId !== null) {
          setCurrentFrame(frameId)
        } else {
          const localFrame = localStorage.getItem('equipped_frame') || localStorage.getItem('user_equipped_frame')
          setCurrentFrame(localFrame || null)
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
  }, [avatarUrl, src, frameId, isCurrentUser])

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-28 h-28 md:w-36 md:h-36',
  }

  // Efeitos visuais dinâmicos para cada moldura
  const getFrameStyle = () => {
    if (currentFrame === 'moldura_quinas_neon' || currentFrame === 'moldura_neon_portugal' || currentFrame?.includes('neon')) {
      return 'p-1 rounded-2xl bg-gradient-to-tr from-emerald-500 via-red-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-pulse'
    }
    if (currentFrame === 'moldura_ouro_real' || currentFrame?.includes('ouro')) {
      return 'p-1.5 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-200 shadow-[0_0_22px_rgba(234,179,8,0.8)] animate-pulse'
    }
    return 'p-0.5 rounded-2xl bg-slate-700/50'
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size] || sizeClasses.lg} ${getFrameStyle()} ${className}`}>
      {/* Imagem Real do Avatar no Interior */}
      <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 shadow-inner">
        <img
          src={currentAvatar}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/guardiao-vulcanico.jpg'
          }}
        />
      </div>
    </div>
  )
}

export default UserAvatar
