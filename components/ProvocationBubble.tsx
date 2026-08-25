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
      className={`absolute z-50 animate-in fade-in zoom-in duration-200 pointer-events-none top-14 ${
        isPlayer ? 'left-2' : 'right-2'
      }`}
    >
      <div
        className={`relative px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xl backdrop-blur-md max-w-[150px] sm:max-w-[180px] break-words text-center border ${
          isPlayer
            ? 'bg-cyan-950/95 border-cyan-400/80 shadow-cyan-950/50'
            : 'bg-purple-950/95 border-purple-400/80 shadow-purple-950/50'
        }`}
      >
        {/* Seta/Pointer virada para o avatar acima */}
        <div
          className={`absolute -top-1.5 w-3 h-3 rotate-45 border-t border-l ${
            isPlayer
              ? 'left-4 bg-cyan-950/95 border-cyan-400/80'
              : 'right-4 bg-purple-950/95 border-purple-400/80'
          }`}
        />

        <span className="relative z-10 block leading-tight drop-shadow-sm">
          {message}
        </span>
      </div>
    </div>
  );
};

export default ProvocationBubble;
