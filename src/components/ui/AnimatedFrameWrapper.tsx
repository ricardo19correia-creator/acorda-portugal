'use client';
import React from 'react';

interface FrameWrapperProps {
  frameId?: string | null;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedFrameWrapper({ frameId, children, className = '' }: FrameWrapperProps) {
  if (frameId === 'frame_cyber_laser' || frameId === 'frame_cyber_neon') {
    return (
      <div className={`frame-container-laser p-[3px] rounded-2xl ${className}`}>
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[14px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  if (frameId === 'frame_quantum_matrix') {
    return (
      <div className={`frame-container-matrix rounded-2xl p-[3px] bg-slate-950 ${className}`}>
        <div className="frame-matrix-laser" />
        <div className="relative z-1 w-full h-full rounded-[14px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  if (frameId === 'frame_solar_flame') {
    return (
      <div className={`frame-effect-flame p-[3px] rounded-2xl ${className}`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  if (frameId === 'frame_portugal_glory') {
    return (
      <div className={`frame-effect-quinas p-[3px] rounded-2xl ${className}`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  if (frameId === 'frame_void_abyss') {
    return (
      <div className={`frame-effect-void p-[3px] rounded-2xl ${className}`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Padrão sem moldura ativa
  return (
    <div className={`rounded-2xl p-0.5 border border-slate-700/50 bg-slate-900 ${className}`}>
      <div className="w-full h-full rounded-[14px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default AnimatedFrameWrapper;

