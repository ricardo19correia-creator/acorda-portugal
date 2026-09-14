'use client';

import React from 'react';
import { getFrameById, type AnimatedFrame } from '@/data/frames';
import { cn } from '@/lib/utils';

export interface LivingFrameRendererProps {
  frameId?: string | null;
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOrnaments?: boolean;
}

interface FrameStyleDefinition {
  auraClass: string;
  bodyClass: string;
  outerBevelClass: string;
  innerBevelClass: string;
  outerEffects: React.ReactNode;
  energyOverlay?: React.ReactNode;
  sheenOverlay?: React.ReactNode;
}

const THICKNESS_PADDING = {
  xs: 'p-[3.5px]',
  sm: 'p-[5px]',
  md: 'p-[7px] sm:p-[8.5px]',
  lg: 'p-[11px] sm:p-[13px]',
  xl: 'p-[15px] sm:p-[17px]',
};

/**
 * Renderiza os efeitos vivos exteriores e transbordantes dedicados das 9 Molduras Vivas AAA.
 * Estes efeitos ultrapassam a borda exterior física sem sofrer corte (overflow-visible).
 */
function renderLivingOverspillEffects(frameId: string, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): React.ReactNode {
  const isCompact = size === 'xs' || size === 'sm';

  switch (frameId) {
    // -------------------------------------------------------------------------
    // 1. INFERNO SOLAR & FOGO ETERNO
    // -------------------------------------------------------------------------
    case 'frame_inferno_solar':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Labaredas vivas a subir pelas laterais e topo */}
          <div className="absolute -top-3.5 sm:-top-5 inset-x-1 sm:inset-x-2 flex justify-between items-end animate-[frame-flame-lick_1.8s_ease-in-out_infinite]">
            <span className="w-2.5 sm:w-3.5 h-4 sm:h-6 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] opacity-90 -rotate-12 shadow-[0_0_10px_#f97316]" />
            <span className="w-4 sm:w-5.5 h-6.5 sm:h-9 bg-gradient-to-t from-red-600 via-amber-400 to-white rounded-full blur-[0.5px] opacity-95 animate-[frame-flame-lick-fast_1.4s_ease-in-out_infinite] shadow-[0_0_15px_#ea580c]" />
            <span className="w-2.5 sm:w-3.5 h-4 sm:h-6 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] opacity-90 rotate-12 shadow-[0_0_10px_#f97316]" />
          </div>
          {/* Chamas laterais incandescentes */}
          <div className="absolute top-1/3 -left-2.5 sm:-left-3.5 w-2 sm:w-3 h-5 sm:h-7 bg-gradient-to-l from-orange-500 to-amber-300 rounded-full blur-[0.5px] opacity-85 animate-[frame-flame-lick_2s_infinite]" />
          <div className="absolute top-1/3 -right-2.5 sm:-right-3.5 w-2 sm:w-3 h-5 sm:h-7 bg-gradient-to-r from-orange-500 to-amber-300 rounded-full blur-[0.5px] opacity-85 animate-[frame-flame-lick_2.2s_infinite]" />
          {/* Brasas e faíscas incandescentes em ascensão */}
          {!isCompact && (
            <>
              <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_8px_#facc15] animate-[frame-ember-float_2.4s_infinite]" />
              <div className="absolute bottom-2 right-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-[frame-ember-float-alt_2.8s_infinite]" style={{ animationDelay: '0.9s' }} />
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-red-400 shadow-[0_0_6px_#f87171] animate-[frame-ember-float_3.2s_infinite]" style={{ animationDelay: '1.5s' }} />
            </>
          )}
        </div>
      );

    // -------------------------------------------------------------------------
    // 2. ONDAS DO ATLÂNTICO
    // -------------------------------------------------------------------------
    case 'frame_ondas_atlantico':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Cristas oceânicas e ondas curvadas nos cantos */}
          <div className="absolute -top-2.5 -left-2.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-t-2 sm:border-t-3 border-l-2 sm:border-l-3 border-cyan-300 shadow-[0_0_12px_#06b6d4] -rotate-12 animate-[frame-water-splash_2.6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-2.5 -right-2.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-b-2 sm:border-b-3 border-r-2 sm:border-r-3 border-sky-300 shadow-[0_0_12px_#38bdf8] -rotate-12 animate-[frame-water-splash_2.6s_ease-in-out_infinite]" style={{ animationDelay: '1.3s' }} />
          {/* Espuma dinâmica e gotículas bioluminescentes */}
          <div className="absolute -top-3.5 right-1/4 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gradient-to-t from-cyan-400 to-white shadow-[0_0_10px_#38bdf8] animate-[frame-droplet-float_2.2s_infinite]" />
          <div className="absolute top-1/2 -right-3 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#06b6d4] animate-[frame-droplet-float_2.7s_infinite]" style={{ animationDelay: '0.8s' }} />
          <div className="absolute -bottom-2.5 left-1/4 w-2 h-2 rounded-full bg-sky-200 shadow-[0_0_8px_#0284c7] animate-[frame-droplet-float_3s_infinite]" style={{ animationDelay: '1.5s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 3. FÚRIA DO TROVÃO & RAIOS
    // -------------------------------------------------------------------------
    case 'frame_furia_trovao':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Arcos voltaicos elétricos erráticos que ultrapassam a borda */}
          <svg className="absolute -inset-2.5 sm:-inset-4 w-[calc(100%+20px)] sm:w-[calc(100%+32px)] h-[calc(100%+20px)] sm:h-[calc(100%+32px)] overflow-visible" viewBox="0 0 100 100">
            <path
              d="M 12 12 L 2 -2 L 10 -6 L -2 -14"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="animate-[frame-lightning-zap_2s_infinite]"
            />
            <path
              d="M 88 12 L 102 -2 L 96 -6 L 110 -12"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="animate-[frame-lightning-branch_2.4s_infinite]"
              style={{ animationDelay: '0.6s' }}
            />
            <path
              d="M 88 88 L 102 102 L 94 106 L 108 116"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="animate-[frame-lightning-zap_1.8s_infinite]"
              style={{ animationDelay: '1.1s' }}
            />
            <path
              d="M 12 88 L -2 98 L 4 104 L -10 112"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="animate-[frame-lightning-branch_2.2s_infinite]"
              style={{ animationDelay: '1.5s' }}
            />
          </svg>
          {/* 4 Nós de plasma e capacitores nos cantos com flashes intensos */}
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_14px_#38bdf8] animate-[frame-lightning-zap_1.7s_infinite]" />
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_14px_#ffffff] animate-[frame-lightning-zap_2.1s_infinite]" style={{ animationDelay: '0.4s' }} />
          <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_14px_#38bdf8] animate-[frame-lightning-zap_1.9s_infinite]" style={{ animationDelay: '1.2s' }} />
          <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-sky-200 shadow-[0_0_14px_#a855f7] animate-[frame-lightning-zap_1.8s_infinite]" style={{ animationDelay: '0.8s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 4. ZERO ABSOLUTO
    // -------------------------------------------------------------------------
    case 'frame_zero_absoluto':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Estalagmites afiadas de gelo glacial 3D nos 4 cantos */}
          <div className="absolute -top-4 -left-2.5 w-4 sm:w-5.5 h-6 sm:h-7.5 bg-gradient-to-b from-white via-cyan-100 to-transparent [clip-path:polygon(50%_0%,100%_100%,0%_100%)] rotate-[-25deg] shadow-[0_0_12px_rgba(165,243,252,0.9)] animate-[frame-frost-glint_3s_infinite]" />
          <div className="absolute -top-3.5 -right-2.5 w-4 sm:w-5 h-5.5 sm:h-7 bg-gradient-to-b from-white via-sky-200 to-transparent [clip-path:polygon(50%_0%,100%_100%,0%_100%)] rotate-[25deg] shadow-[0_0_12px_rgba(165,243,252,0.9)] animate-[frame-frost-glint_3s_infinite]" style={{ animationDelay: '1.2s' }} />
          <div className="absolute -bottom-3.5 -left-2 w-4 sm:w-5 h-5.5 sm:h-7 bg-gradient-to-t from-white via-cyan-200 to-transparent [clip-path:polygon(50%_100%,100%_0%,0%_0%)] rotate-[20deg] shadow-[0_0_12px_rgba(165,243,252,0.9)] animate-[frame-frost-glint_3.5s_infinite]" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-4 -right-2.5 w-4.5 sm:w-6 h-6 sm:h-7.5 bg-gradient-to-t from-white via-sky-100 to-transparent [clip-path:polygon(50%_100%,100%_0%,0%_0%)] rotate-[-20deg] shadow-[0_0_12px_rgba(165,243,252,0.9)] animate-[frame-frost-glint_3.2s_infinite]" style={{ animationDelay: '1.8s' }} />
          {/* Cristais hexagonais flutuantes com reflexos prismáticos */}
          <div className="absolute top-1/2 -left-3 w-2.5 h-2.5 rotate-45 bg-white shadow-[0_0_10px_#a5f3fc] animate-[frame-frost-glint_2.5s_infinite]" />
          <div className="absolute top-1/2 -right-3 w-2.5 h-2.5 rotate-45 bg-white shadow-[0_0_10px_#a5f3fc] animate-[frame-frost-glint_2.5s_infinite]" style={{ animationDelay: '1.2s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 5. FORNALHA DE MAGMA
    // -------------------------------------------------------------------------
    case 'frame_fornalha_magma':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Placas de basalto com lava viva a escorrer e projetar-se para fora */}
          <div className="absolute -top-3 left-1/3 w-3 h-5 bg-gradient-to-t from-orange-600 to-yellow-300 rounded-full blur-[0.5px] shadow-[0_0_12px_#ea580c] animate-[frame-flame-lick_1.9s_infinite]" />
          <div className="absolute -bottom-3 right-1/3 w-3 h-5 bg-gradient-to-b from-red-600 to-yellow-400 rounded-full blur-[0.5px] shadow-[0_0_12px_#ea580c] animate-[frame-flame-lick_2.1s_infinite]" style={{ animationDelay: '0.7s' }} />
          {/* Fumo quente e brasas basálticas em suspensão */}
          <div className="absolute -top-4 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f97316] animate-[frame-ember-float_2.2s_infinite]" />
          <div className="absolute bottom-2 -left-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-[frame-ember-float-alt_2.6s_infinite]" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 -right-3 w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_#f97316] animate-[frame-ember-float_2.9s_infinite]" style={{ animationDelay: '1.4s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 6. NEBULOSA & POEIRA ESTELAR
    // -------------------------------------------------------------------------
    case 'frame_nebulosa_estelar':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Anéis orbitais dourados e cósmicos elípticos a cruzar a silhueta */}
          <div className="absolute -inset-2.5 sm:-inset-3.5 rounded-[38%] border border-amber-300/70 shadow-[0_0_15px_rgba(245,158,11,0.5)] rotate-12 animate-[frame-cosmic-orbit_14s_linear_infinite]" />
          <div className="absolute -inset-3 sm:-inset-4.5 rounded-[42%] border border-purple-400/60 shadow-[0_0_15px_rgba(192,132,252,0.5)] -rotate-12 animate-[frame-cosmic-orbit_18s_linear_infinite_reverse]" />
          {/* Nós de constelações estelares que cintilam */}
          <div className="absolute -top-2 left-1/4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff] animate-pulse" />
          <div className="absolute -bottom-2 right-1/4 w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_10px_#fde047] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 -right-2.5 w-1.5 h-1.5 rounded-full bg-sky-200 shadow-[0_0_8px_#38bdf8] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 7. RAÍZES DA FLORESTA VIVA
    // -------------------------------------------------------------------------
    case 'frame_floresta_viva':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Flores e pétalas douradas nos cantos cardeais */}
          <div className="absolute -top-3.5 -right-2 w-5 sm:w-6.5 h-5 sm:h-6.5 flex items-center justify-center animate-[frame-nature-pulse_3.2s_infinite]">
            <span className="text-sm sm:text-base filter drop-shadow-[0_0_8px_#eab308]">🌸</span>
          </div>
          <div className="absolute -bottom-3.5 -left-2 w-5 sm:w-6.5 h-5 sm:h-6.5 flex items-center justify-center animate-[frame-nature-pulse_3.5s_infinite]" style={{ animationDelay: '1s' }}>
            <span className="text-sm sm:text-base filter drop-shadow-[0_0_8px_#eab308]">🌸</span>
          </div>
          {/* Pirilampos dourados e esporos mágicos flutuantes */}
          <div className="absolute top-2 -left-2.5 w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_10px_#a3e635] animate-[frame-spore-orbit_6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-2 right-4 w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_10px_#facc15] animate-[frame-spore-orbit-rev_7s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 8. VAZIO ABISSAL
    // -------------------------------------------------------------------------
    case 'frame_vazio_abissal':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Tentáculos de matéria escura e vórtice gravitacional de distorção */}
          <div className="absolute -inset-1.5 sm:-inset-2.5 rounded-[inherit] border-2 border-purple-500/50 shadow-[0_0_25px_#9333ea] animate-[frame-void-singularity_5s_ease-in-out_infinite]" />
          {/* Fissuras dimensionais e poeira quântica */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 sm:w-6 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_12px_#c084fc] animate-pulse" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 sm:w-6 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent shadow-[0_0_12px_#818cf8] animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-1/4 -left-2 w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc] animate-ping" />
          <div className="absolute bottom-1/4 -right-2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7] animate-ping" style={{ animationDelay: '0.9s' }} />
        </div>
      );

    // -------------------------------------------------------------------------
    // 9. OURO REAL DOS NAVEGADORES
    // -------------------------------------------------------------------------
    case 'frame_ouro_navegadores':
      return (
        <div className="living-frame-overspill pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Brasão/Coroa imperial de filigrana no topo com pedras preciosas */}
          <div className="absolute -top-3.5 sm:-top-5 inset-x-0 flex items-center justify-center">
            <div className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border border-yellow-200 shadow-[0_0_14px_rgba(251,191,36,0.9)] flex items-center gap-1.5 animate-[frame-gold-gleam_2.8s_infinite]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#ef4444]" />
              <span className="text-[10px] font-black text-amber-950">⚜</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_6px_#10b981]" />
            </div>
          </div>
          {/* Arcos de esfera armilar nos cantos inferiores */}
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border border-yellow-300 shadow-[0_0_8px_#facc15] animate-[frame-astrolabe-spin_12s_linear_infinite]" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full border border-yellow-300 shadow-[0_0_8px_#facc15] animate-[frame-astrolabe-spin_12s_linear_infinite_reverse]" />
        </div>
      );

    default:
      return null;
  }
}

/**
 * Retorna a definição de estilo de 8 camadas para a moldura canónica.
 */
function getLivingFrameStyle(frame: AnimatedFrame | undefined, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): FrameStyleDefinition {
  if (!frame) {
    return {
      auraClass: 'bg-slate-700/20',
      bodyClass: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
      outerBevelClass: 'ring-1 sm:ring-[1.5px] ring-slate-400/40 shadow-[0_0_10px_rgba(100,116,139,0.3)]',
      innerBevelClass: 'ring-1 ring-inset ring-white/15',
      outerEffects: null,
    };
  }

  const baseOverspill = renderLivingOverspillEffects(frame.id, size);

  switch (frame.id) {
    // -------------------------------------------------------------------------
    // 1. INFERNO SOLAR & FOGO ETERNO
    // -------------------------------------------------------------------------
    case 'frame_inferno_solar':
      return {
        auraClass: 'bg-gradient-to-t from-red-600/60 via-orange-500/50 to-amber-400/40 animate-pulse',
        bodyClass: 'bg-gradient-to-tr from-stone-950 via-amber-600 via-stone-900 to-red-600 shadow-[inset_0_0_18px_rgba(249,115,22,0.9),0_8px_20px_rgba(0,0,0,0.8)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-amber-400/90 shadow-[0_0_24px_rgba(249,115,22,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        energyOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/35 via-orange-600/25 to-transparent mix-blend-screen animate-pulse" />
          </div>
        ),
        sheenOverlay: (
          <div className="living-frame-sheen pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-amber-200/35 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_3s_infinite]" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 2. ONDAS DO ATLÂNTICO
    // -------------------------------------------------------------------------
    case 'frame_ondas_atlantico':
      return {
        auraClass: 'bg-gradient-to-b from-cyan-400/55 via-blue-600/45 to-teal-900/45 animate-[frame-tide-pulse_3s_infinite]',
        bodyClass: 'bg-gradient-to-b from-cyan-300 via-blue-700 via-teal-500 to-slate-950 shadow-[inset_0_0_18px_rgba(6,182,212,0.85),0_8px_20px_rgba(0,0,0,0.8)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-cyan-200 shadow-[0_0_22px_rgba(6,182,212,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        energyOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-blue-400/30 mix-blend-screen animate-pulse" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 3. FÚRIA DO TROVÃO & RAIOS
    // -------------------------------------------------------------------------
    case 'frame_furia_trovao':
      return {
        auraClass: 'bg-sky-400/50 animate-[frame-electric-flicker_1.8s_infinite]',
        bodyClass: 'bg-gradient-to-br from-slate-200 via-slate-800 via-sky-500 to-indigo-950 shadow-[inset_0_0_18px_rgba(56,189,248,0.95),0_8px_20px_rgba(0,0,0,0.85)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-white shadow-[0_0_25px_rgba(56,189,248,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-indigo-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="living-frame-sheen pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_2.4s_infinite]" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 4. ZERO ABSOLUTO
    // -------------------------------------------------------------------------
    case 'frame_zero_absoluto':
      return {
        auraClass: 'bg-cyan-200/50 animate-[frame-frost-glimmer_3.2s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-white via-cyan-200 via-sky-400 to-slate-950 shadow-[inset_0_0_18px_rgba(165,243,252,0.95),0_8px_20px_rgba(0,0,0,0.8)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-white shadow-[0_0_24px_rgba(165,243,252,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-sky-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        energyOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-cyan-400/25 mix-blend-screen" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 5. FORNALHA DE MAGMA
    // -------------------------------------------------------------------------
    case 'frame_fornalha_magma':
      return {
        auraClass: 'bg-gradient-to-b from-orange-600/60 via-red-600/50 to-amber-500/40 animate-pulse',
        bodyClass: 'bg-gradient-to-b from-stone-900 via-orange-600 via-stone-950 to-red-800 shadow-[inset_0_0_20px_rgba(234,88,12,0.95),0_10px_25px_rgba(0,0,0,0.9)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-orange-500 shadow-[0_0_25px_rgba(234,88,12,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        energyOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-amber-500/30 to-transparent mix-blend-screen animate-pulse" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 6. NEBULOSA & POEIRA ESTELAR
    // -------------------------------------------------------------------------
    case 'frame_nebulosa_estelar':
      return {
        auraClass: 'bg-gradient-to-r from-purple-500/55 via-indigo-600/45 to-amber-400/40 animate-[frame-nebula-flow_3.5s_infinite]',
        bodyClass: 'bg-gradient-to-r from-indigo-950 via-purple-600 via-slate-950 to-amber-400 shadow-[inset_0_0_18px_rgba(192,132,252,0.9),0_8px_20px_rgba(0,0,0,0.85)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-purple-300 shadow-[0_0_24px_rgba(192,132,252,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-purple-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="living-frame-sheen pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-amber-200/40 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_3.5s_infinite]" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 7. RAÍZES DA FLORESTA VIVA
    // -------------------------------------------------------------------------
    case 'frame_floresta_viva':
      return {
        auraClass: 'bg-emerald-500/45 animate-[frame-nature-pulse_3.2s_infinite]',
        bodyClass: 'bg-gradient-to-b from-amber-950 via-emerald-600 via-stone-900 to-lime-500 shadow-[inset_0_0_18px_rgba(34,197,94,0.9),0_8px_20px_rgba(0,0,0,0.85)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-lime-400 shadow-[0_0_22px_rgba(34,197,94,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        energyOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/35 via-transparent to-amber-300/30 mix-blend-screen animate-pulse" />
          </div>
        ),
      };

    // -------------------------------------------------------------------------
    // 8. VAZIO ABISSAL
    // -------------------------------------------------------------------------
    case 'frame_vazio_abissal':
      return {
        auraClass: 'bg-purple-700/55 animate-[frame-void-singularity_4s_infinite]',
        bodyClass: 'bg-gradient-to-br from-black via-purple-950 via-zinc-950 to-fuchsia-900 shadow-[inset_0_0_22px_rgba(147,51,234,0.95),0_12px_28px_rgba(0,0,0,0.95)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-purple-400 shadow-[0_0_28px_rgba(147,51,234,0.85)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-black shadow-[inset_0_3px_10px_rgba(0,0,0,1)]',
        outerEffects: baseOverspill,
      };

    // -------------------------------------------------------------------------
    // 9. OURO REAL DOS NAVEGADORES
    // -------------------------------------------------------------------------
    case 'frame_ouro_navegadores':
      return {
        auraClass: 'bg-gradient-to-tr from-amber-400/60 via-yellow-300/50 to-amber-600/55 animate-[frame-gold-gleam_2.8s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-yellow-200 via-amber-500 via-yellow-300 to-amber-700 shadow-[inset_0_0_20px_rgba(245,158,11,0.95),0_10px_25px_rgba(0,0,0,0.85)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-yellow-100 shadow-[0_0_28px_rgba(245,158,11,0.85)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-amber-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="living-frame-sheen pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_3.2s_infinite]" />
          </div>
        ),
      };

    default:
      return {
        auraClass: 'bg-cyan-500/30',
        bodyClass: 'bg-gradient-to-b from-cyan-400 via-slate-800 to-cyan-600',
        outerBevelClass: 'ring-1.5 ring-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]',
        innerBevelClass: 'ring-1 ring-inset ring-slate-950',
        outerEffects: baseOverspill,
      };
  }
}

/**
 * 👑 LivingFrameRenderer AAA 2026
 * 
 * Componente mestre de renderização das Molduras Vivas.
 * Envolve a foto de perfil com um objeto 3D volumétrico de 8 camadas:
 * 1. Aura exterior difusa
 * 2. Efeitos transbordantes que ultrapassam a silhueta
 * 3. Corpo principal da moldura com chanfro e relevo 3D
 * 4. Energia interna e fissuras ativas
 * 5. Reflexos especulares dinâmicos
 * 6. Bisel interno de profundidade
 * 7. Recipiente concêntrico do avatar (abertura nítida e desobstruída)
 * 8. Micro-partículas em suspensão livre
 */
export function LivingFrameRenderer({
  frameId,
  children,
  className = '',
  size = 'md',
}: LivingFrameRendererProps) {
  const frame = getFrameById(frameId);
  if (!frame) {
    return <div className={cn('relative w-full h-full rounded-[inherit] overflow-hidden', className)}>{children}</div>;
  }

  const style = getLivingFrameStyle(frame, size);
  const thicknessClass = THICKNESS_PADDING[size] || THICKNESS_PADDING.md;

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-[inherit] transition-all duration-300 flex items-center justify-center shrink-0 aspect-square overflow-visible select-none',
        thicknessClass,
        style.bodyClass,
        style.outerBevelClass,
        className
      )}
    >
      {/* Camada 1: Aura e Halo Luminoso Exterior */}
      <div
        className={cn(
          'living-frame-aura pointer-events-none absolute -inset-2.5 sm:-inset-4 rounded-[inherit] -z-10 blur-md opacity-85 transition-opacity duration-300',
          style.auraClass
        )}
      />

      {/* Camada 2: Efeitos Transbordantes Que Ultrapassam a Borda */}
      {style.outerEffects}

      {/* Camada 4: Energia Interna & Fissuras Ativas */}
      {style.energyOverlay}

      {/* Camada 5: Reflexo Especular / Sheen Dinâmico */}
      {style.sheenOverlay}

      {/* Camada 6: Bisel Interno Concêntrico de Transição */}
      <div className={cn('pointer-events-none absolute inset-0 rounded-[inherit] z-20', style.innerBevelClass)} />

      {/* Camada 7: Recipiente Central do Avatar (Abertura 1:1 Nítida) */}
      <div className="relative z-10 w-full h-full rounded-[inherit] overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
        {children}
      </div>
    </div>
  );
}

export default LivingFrameRenderer;
