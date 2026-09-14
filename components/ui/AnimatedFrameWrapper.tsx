'use client';

import React from 'react';
import {
  LivingFrameRenderer,
  type LivingFrameRendererProps,
} from '@/components/ui/LivingFrameRenderer';

export type AnimatedFrameWrapperProps = LivingFrameRendererProps;

/**
 * AnimatedFrameWrapper (Retrocompatível)
 * Delega 100% no LivingFrameRenderer AAA de 8 camadas, garantindo total
 * interoperabilidade com UserAvatar, PlayerAvatar, Loja e Perfil.
 */
export function AnimatedFrameWrapper(props: AnimatedFrameWrapperProps) {
  return <LivingFrameRenderer {...props} />;
}

export default AnimatedFrameWrapper;
