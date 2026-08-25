'use client';

import React, { useEffect, useState } from 'react';

export interface ProvocationBubbleProps {
  message: string;
  sender: 'player' | 'opponent'; // 'player' à esquerda, 'opponent' à direita
  onDismiss?: () => void;
}

export const ProvocationBubble: React.FC<ProvocationBubbleProps> = ({
  message,
  sender,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible || !message) return null;

  const isPlayer = sender === 'player';

  return (
    <div
      className={`absolute top-11 sm:top-12 z-40 animate-in fade-in zoom-in duration-200 pointer-events-none whitespace-nowrap min-w-[100px] max-w-[140px] ${
        isPlayer ? 'left-0' : 'right-0'
      }`}
    >
      <div
        className={`relative px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-xl backdrop-blur-md border text-center ${
          isPlayer
            ? 'bg-slate-900/95 border-cyan-400 shadow-cyan-950/50'
            : 'bg-slate-900/95 border-purple-400 shadow-purple-950/50'
        }`}
      >
        {/* Seta virada para o avatar acima */}
        <div
          className={`absolute -top-1 w-2.5 h-2.5 rotate-45 border-t border-l ${
            isPlayer
              ? 'left-3 bg-slate-900 border-cyan-400'
              : 'right-3 bg-slate-900 border-purple-400'
          }`}
        />

        <span className="relative z-10 block leading-tight truncate">
          {message}
        </span>
      </div>
    </div>
  );
};

export default ProvocationBubble;
