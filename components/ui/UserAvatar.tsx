'use client';

import React, { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/game-data';
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars';
import { getEquippedAvatarImage } from '@/lib/inventory';
import { getFrameById } from '@/data/frames';
import { AnimatedFrameWrapper } from '@/components/ui/AnimatedFrameWrapper';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  profile?: Partial<UserProfile> | null;
  src?: string | null;
  avatarUrl?: string | null;
  avatarImage?: string | null;
  photoURL?: string | null;
  name?: string | null;
  displayName?: string | null;
  alt?: string;
  auraId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isCurrentUser?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  rank?: number;
  borderGlowColor?: string;
  frameId?: string | null;
  activeFrame?: string | null;
  equippedFrame?: string | null;
  onClick?: () => void;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 rounded-lg',
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-24 h-24 rounded-3xl',
  xl: 'w-32 h-32 rounded-[28px]',
};

/**
 * Componente Único Mestre de Avatar + Moldura
 * 
 * Centraliza a resolução de avatar, aplicação de molduras vivas com bisel concêntrico,
 * suporte para crachás independentes e integração com eventos em tempo real.
 */
export function UserAvatar({
  profile,
  src,
  avatarUrl,
  avatarImage,
  photoURL,
  name,
  displayName,
  alt = 'Avatar do Jogador',
  auraId,
  size = 'md',
  className = '',
  isCurrentUser = false,
  showBadge = true,
  badgeText = 'TU',
  rank,
  borderGlowColor,
  frameId,
  activeFrame,
  equippedFrame,
  onClick,
}: UserAvatarProps) {
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [localFrame, setLocalFrame] = useState<string | null>(null);

  // Sincronização em tempo real de cosméticos do utilizador atual
  useEffect(() => {
    const syncCosmetics = () => {
      if (typeof window !== 'undefined') {
        const storedAvatar = localStorage.getItem('user_equipped_avatar');
        setLocalAvatar(storedAvatar ? getAvatarImage(storedAvatar) : getEquippedAvatarImage());

        const storedFrame = localStorage.getItem('user_equipped_frame');
        setLocalFrame(storedFrame || null);
      }
    };

    syncCosmetics();
    window.addEventListener('avatarChanged', syncCosmetics);
    window.addEventListener('frameChanged', syncCosmetics);
    window.addEventListener('inventory_updated', syncCosmetics);
    window.addEventListener('storage', syncCosmetics);

    return () => {
      window.removeEventListener('avatarChanged', syncCosmetics);
      window.removeEventListener('frameChanged', syncCosmetics);
      window.removeEventListener('inventory_updated', syncCosmetics);
      window.removeEventListener('storage', syncCosmetics);
    };
  }, []);

  // Resolução resiliente da imagem do avatar
  const rawCandidate =
    avatarImage ??
    src ??
    avatarUrl ??
    photoURL ??
    (isCurrentUser ? localAvatar : null) ??
    profile?.photoURL ??
    (profile as any)?.avatarUrl ??
    (profile as any)?.avatar ??
    (profile as any)?.equippedAvatar ??
    (profile as any)?.equipped?.avatar ??
    DEFAULT_AVATAR.image;

  const imageSrc = getAvatarImage(rawCandidate);
  const effectiveName = displayName ?? name ?? profile?.displayName ?? alt;

  // Resolução da moldura ativa
  const effectiveFrameId =
    frameId ||
    activeFrame ||
    equippedFrame ||
    (profile as any)?.equippedFrame ||
    (profile as any)?.equipped?.frameId ||
    (isCurrentUser ? localFrame : null);

  const frameConfig = getFrameById(effectiveFrameId);
  const effectiveAuraId = auraId ?? (profile as any)?.equipped?.auraId;
  const hasAura = effectiveAuraId === 'prestige_aura_dourada';

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // CASO 1: COM MOLDURA VIVA ATIVA
  if (frameConfig) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'relative inline-flex shrink-0 aspect-square select-none items-center justify-center group/avatar',
          sizeClass,
          onClick && 'cursor-pointer',
          className
        )}
      >
        {/* Aura dourada prestigiosa subtil */}
        {hasAura && (
          <div className="pointer-events-none absolute -inset-1 rounded-[inherit] bg-amber-400/20 blur-sm animate-pulse z-0" />
        )}

        {/* Moldura Viva Concêntrica */}
        <AnimatedFrameWrapper frameId={effectiveFrameId} className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={effectiveName}
            className="w-full h-full object-cover object-center rounded-[inherit] pointer-events-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== DEFAULT_AVATAR.image) {
                target.src = DEFAULT_AVATAR.image;
              }
            }}
          />
        </AnimatedFrameWrapper>

        {/* Crachá 'TU' independente e elegante */}
        {isCurrentUser && showBadge && size !== 'xs' && (
          <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md z-30 leading-none">
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  // CASO 2: SEM MOLDURA (Estilo padrão / Comum / Posição de Ranking)
  const rankBorderClass =
    rank === 1
      ? 'border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
      : rank === 2
      ? 'border-2 border-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.3)]'
      : rank === 3
      ? 'border-2 border-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.3)]'
      : isCurrentUser
      ? 'border-2 border-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
      : 'border border-slate-700/70 shadow-sm';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative inline-flex shrink-0 aspect-square select-none items-center justify-center group/avatar',
        sizeClass,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Aura dourada prestigiosa subtil */}
      {hasAura && (
        <div className="pointer-events-none absolute -inset-1 rounded-[inherit] bg-amber-400/20 blur-sm animate-pulse z-0" />
      )}

      {/* Invólucro de borda padrão metálico discreto */}
      <div
        className={cn(
          'w-full h-full p-[2px] overflow-hidden transition-all duration-300 bg-slate-950 flex items-center justify-center rounded-[inherit]',
          rankBorderClass
        )}
        style={borderGlowColor ? { borderColor: borderGlowColor } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={effectiveName}
          className="w-full h-full object-cover object-center rounded-[inherit] pointer-events-none"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_AVATAR.image) {
              target.src = DEFAULT_AVATAR.image;
            }
          }}
        />
      </div>

      {/* Crachá 'TU' independente e elegante */}
      {isCurrentUser && showBadge && size !== 'xs' && (
        <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md z-30 leading-none">
          {badgeText}
        </span>
      )}
    </div>
  );
}

export default UserAvatar;
