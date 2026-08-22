'use client'

import React from 'react'

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
  size = 'md',
  className = '',
  alt = 'Avatar do Jogador',
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }

  const fallbackAvatar = '/images/avatars/guardiao-vulcanico.jpg'
  const given = avatarUrl || src
  const imageSrc = given && !given.includes('moldura') ? given : fallbackAvatar

  return (
    <div
      className={`relative shrink-0 aspect-square rounded-2xl p-[2px] bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] ${sizeClasses[size]} ${className}`}
    >
      <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950">
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover object-center block"
          onError={(e) => {
            e.currentTarget.src = fallbackAvatar
          }}
        />
      </div>
    </div>
  )
}

export default UserAvatar
