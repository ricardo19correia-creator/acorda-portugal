'use client';

import React from 'react';
import { UserAvatar, type UserAvatarProps } from '@/components/ui/UserAvatar';

export type PlayerAvatarProps = UserAvatarProps;

/**
 * PlayerAvatar (Retrocompatível)
 * Delega 100% no componente unificado UserAvatar, assegurando que todo o jogo
 * utiliza uma única implementação visual para avatares e molduras vivas.
 */
export function PlayerAvatar(props: PlayerAvatarProps) {
  return <UserAvatar {...props} />;
}

export default PlayerAvatar;
