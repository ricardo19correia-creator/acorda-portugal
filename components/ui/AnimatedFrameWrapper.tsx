'use client';

import React from 'react';
import { getFrameById, type AnimatedFrame } from '@/data/frames';
import { cn } from '@/lib/utils';

export interface AnimatedFrameWrapperProps {
  frameId?: string | null;
  children: React.ReactNode;
  className?: string;
  showOrnaments?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface FrameStyleDefinition {
  auraClass: string;
  bodyClass: string;
  outerBevelClass: string;
  innerBevelClass: string;
  outerEffects: React.ReactNode;
  sheenOverlay?: React.ReactNode;
}

const THICKNESS_PADDING = {
  xs: 'p-[3.5px]',
  sm: 'p-[5px]',
  md: 'p-[7px] sm:p-[8px]',
  lg: 'p-[10px] sm:p-[12px]',
  xl: 'p-[14px] sm:p-[16px]',
};

/**
 * Renderiza os efeitos exteriores e transbordantes dedicados de cada uma das 29 Molduras Vivas.
 * Todos os efeitos são colocados em absolute com overflow-visible e pointer-events-none.
 */
function renderFrameOverspillEffects(frameId: string, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): React.ReactNode {
  const isCompact = size === 'xs' || size === 'sm';

  switch (frameId) {
    // ==========================================
    // 1. ELEMENTAL & FORÇAS DA NATUREZA (6 MOLDURAS)
    // ==========================================
    case 'frame_fogo_eterno':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Labaredas de fogo vivo que sobem acima do topo da moldura */}
          <div className="absolute -top-3.5 sm:-top-5 inset-x-1 sm:inset-x-2 flex justify-between items-end animate-[frame-flame-lick_1.8s_ease-in-out_infinite]">
            <span className="w-2.5 sm:w-3.5 h-4 sm:h-6 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] opacity-90 -rotate-12" />
            <span className="w-3.5 sm:w-5 h-6 sm:h-8 bg-gradient-to-t from-red-600 via-amber-400 to-white rounded-full blur-[0.5px] opacity-95 animate-[frame-flame-lick-fast_1.4s_ease-in-out_infinite]" />
            <span className="w-2.5 sm:w-3.5 h-4 sm:h-6 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] opacity-90 rotate-12" />
          </div>
          {/* Chamas laterais */}
          <div className="absolute top-1/3 -left-2 sm:-left-3 w-2 sm:w-3 h-4 sm:h-5 bg-gradient-to-l from-orange-500 to-amber-300 rounded-full blur-[0.5px] opacity-80 animate-[frame-flame-lick_2s_infinite]" />
          <div className="absolute top-1/3 -right-2 sm:-right-3 w-2 sm:w-3 h-4 sm:h-5 bg-gradient-to-r from-orange-500 to-amber-300 rounded-full blur-[0.5px] opacity-80 animate-[frame-flame-lick_2.2s_infinite]" />
          {/* Brasas incandescentes a flutuar para cima */}
          {!isCompact && (
            <>
              <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_8px_#facc15] animate-[frame-ember-float_2.4s_infinite]" />
              <div className="absolute bottom-2 right-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-[frame-ember-float-alt_2.8s_infinite]" style={{ animationDelay: '0.9s' }} />
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-red-400 shadow-[0_0_6px_#f87171] animate-[frame-ember-float_3.2s_infinite]" style={{ animationDelay: '1.5s' }} />
            </>
          )}
        </div>
      );

    case 'frame_ondas_atlantico':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Cristas de onda oceânicas a projetar-se fora dos cantos */}
          <div className="absolute -top-2 -left-2 w-5 sm:w-7 h-5 sm:h-7 rounded-full border-t-2 border-l-2 border-cyan-300/80 shadow-[0_0_10px_#06b6d4] -rotate-12 animate-[frame-water-splash_2.6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-2 -right-2 w-5 sm:w-7 h-5 sm:h-7 rounded-full border-b-2 border-r-2 border-sky-300/80 shadow-[0_0_10px_#38bdf8] -rotate-12 animate-[frame-water-splash_2.6s_ease-in-out_infinite]" style={{ animationDelay: '1.3s' }} />
          {/* Salpicos e gotas de água azul/ciano a sair da moldura */}
          <div className="absolute -top-3 right-1/4 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gradient-to-t from-cyan-400 to-white shadow-[0_0_8px_#38bdf8] animate-[frame-droplet-float_2.2s_infinite]" />
          <div className="absolute top-1/2 -right-2.5 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#06b6d4] animate-[frame-droplet-float_2.7s_infinite]" style={{ animationDelay: '0.8s' }} />
          <div className="absolute -bottom-2 left-1/4 w-2 h-2 rounded-full bg-sky-200 shadow-[0_0_6px_#0284c7] animate-[frame-droplet-float_3s_infinite]" style={{ animationDelay: '1.5s' }} />
        </div>
      );

    case 'frame_tempestade_eletrica':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Arcos voltaicos elétricos a projetarem-se fora da moldura */}
          <svg className="absolute -inset-2.5 sm:-inset-4 w-[calc(100%+20px)] sm:w-[calc(100%+32px)] h-[calc(100%+20px)] sm:h-[calc(100%+32px)] overflow-visible" viewBox="0 0 100 100">
            {/* Raio superior esquerdo */}
            <path
              d="M 12 12 L 2 -2 L 10 -6 L 0 -12"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[frame-lightning-zap_2.2s_infinite]"
            />
            {/* Raio superior direito */}
            <path
              d="M 88 12 L 102 -2 L 96 -6 L 108 -10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="animate-[frame-lightning-branch_2.6s_infinite]"
              style={{ animationDelay: '0.7s' }}
            />
            {/* Raio inferior direito */}
            <path
              d="M 88 88 L 100 102 L 92 106 L 104 114"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[frame-lightning-zap_2s_infinite]"
              style={{ animationDelay: '1.2s' }}
            />
            {/* Raio inferior esquerdo */}
            <path
              d="M 12 88 L -2 98 L 4 104 L -8 110"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="animate-[frame-lightning-branch_2.4s_infinite]"
              style={{ animationDelay: '1.6s' }}
            />
          </svg>
          {/* Nós de plasma incandescente nos cantos */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#38bdf8] animate-[frame-lightning-zap_1.8s_infinite]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-sky-200 shadow-[0_0_12px_#818cf8] animate-[frame-lightning-zap_2s_infinite]" style={{ animationDelay: '0.9s' }} />
        </div>
      );

    case 'frame_gelo_ancestral':
      return (
        <div className="pointer-events-none absolute -inset-2.5 sm:-inset-4 z-20 overflow-visible">
          {/* Espigões pontiagudos de gelo eterno a projetar-se fora dos cantos */}
          <div className="absolute -top-3.5 -left-2 w-4 sm:w-5 h-5 sm:h-6 bg-gradient-to-b from-white via-cyan-100 to-transparent [clip-path:polygon(50%_0%,100%_100%,0%_100%)] rotate-[-25deg] shadow-[0_0_10px_rgba(165,243,252,0.8)] animate-[frame-frost-glint_3s_infinite]" />
          <div className="absolute -top-3 -right-2 w-3.5 sm:w-4.5 h-4.5 sm:h-5.5 bg-gradient-to-b from-white via-sky-200 to-transparent [clip-path:polygon(50%_0%,100%_100%,0%_100%)] rotate-[25deg] shadow-[0_0_10px_rgba(165,243,252,0.8)] animate-[frame-frost-glint_3s_infinite]" style={{ animationDelay: '1.2s' }} />
          <div className="absolute -bottom-3 -left-1.5 w-3.5 sm:w-4 h-4.5 sm:h-5 bg-gradient-to-t from-white via-cyan-200 to-transparent [clip-path:polygon(50%_100%,100%_0%,0%_0%)] rotate-[20deg] shadow-[0_0_10px_rgba(165,243,252,0.8)] animate-[frame-frost-glint_3.5s_infinite]" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-3.5 -right-2 w-4 sm:w-5 h-5 sm:h-6 bg-gradient-to-t from-white via-sky-100 to-transparent [clip-path:polygon(50%_100%,100%_0%,0%_0%)] rotate-[-20deg] shadow-[0_0_10px_rgba(165,243,252,0.8)] animate-[frame-frost-glint_3.2s_infinite]" style={{ animationDelay: '1.8s' }} />
          {/* Partículas de cristal cintilantes */}
          <div className="absolute top-1/2 -left-2.5 w-2 h-2 rotate-45 bg-white shadow-[0_0_8px_#a5f3fc] animate-[frame-frost-glint_2.5s_infinite]" />
          <div className="absolute top-1/2 -right-2.5 w-2 h-2 rotate-45 bg-white shadow-[0_0_8px_#a5f3fc] animate-[frame-frost-glint_2.5s_infinite]" style={{ animationDelay: '1.2s' }} />
        </div>
      );

    case 'frame_natureza_viva':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Folhas e rebentos vivos de louro/gerês a romper para fora da moldura */}
          <div className="absolute -top-2.5 left-2 w-3.5 sm:w-4.5 h-4 sm:h-5 bg-gradient-to-tr from-emerald-600 to-lime-400 rounded-[80%_0_80%_0] rotate-[-35deg] shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-[frame-nature-pulse_3.5s_infinite]" />
          <div className="absolute -top-2 right-3 w-3 sm:w-4 h-3.5 sm:h-4.5 bg-gradient-to-tl from-emerald-600 to-green-300 rounded-[0_80%_0_80%] rotate-[40deg] shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-[frame-nature-pulse_3.2s_infinite]" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-2.5 -left-1.5 w-3.5 sm:w-4.5 h-4 sm:h-5 bg-gradient-to-br from-lime-400 to-emerald-700 rounded-[0_80%_0_80%] rotate-[-45deg] shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-[frame-nature-pulse_4s_infinite]" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-2 right-1.5 w-3 sm:w-4 h-3.5 sm:h-4.5 bg-gradient-to-bl from-green-300 to-emerald-800 rounded-[80%_0_80%_0] rotate-[35deg] shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-[frame-nature-pulse_3.8s_infinite]" style={{ animationDelay: '1.8s' }} />
          {/* Vaga-lumes vivos a orbitar fora da moldura */}
          {!isCompact && (
            <>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-lime-300 shadow-[0_0_10px_#84cc16] animate-[frame-spore-orbit_4.5s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-0.5 -mt-0.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047] animate-[frame-spore-orbit-rev_5.2s_linear_infinite]" />
            </>
          )}
        </div>
      );

    case 'frame_dragao_fumegante':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Garras dracónicas nos cantos a ultrapassar a borda */}
          <div className="absolute -top-2.5 -left-2.5 w-5 sm:w-6 h-5 sm:h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-xl shadow-[0_0_12px_#ea580c] -rotate-12" />
          <div className="absolute -top-2.5 -right-2.5 w-5 sm:w-6 h-5 sm:h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-xl shadow-[0_0_12px_#ea580c] rotate-12" />
          <div className="absolute -bottom-2.5 -left-2.5 w-5 sm:w-6 h-5 sm:h-6 border-b-4 border-l-4 border-red-600 rounded-bl-xl shadow-[0_0_12px_#dc2626] rotate-12" />
          <div className="absolute -bottom-2.5 -right-2.5 w-5 sm:w-6 h-5 sm:h-6 border-b-4 border-r-4 border-red-600 rounded-br-xl shadow-[0_0_12px_#dc2626] -rotate-12" />
          {/* Fumo e labaredas dracónicas a subir pelas laterais */}
          <div className="absolute bottom-1/4 -left-2 w-2.5 sm:w-3.5 h-4 sm:h-6 bg-gradient-to-t from-red-600 via-orange-500 to-transparent rounded-full blur-[0.5px] opacity-80 animate-[frame-dragon-smoke_2.8s_infinite]" />
          <div className="absolute bottom-1/4 -right-2 w-2.5 sm:w-3.5 h-4 sm:h-6 bg-gradient-to-t from-amber-600 via-red-600 to-transparent rounded-full blur-[0.5px] opacity-80 animate-[frame-dragon-smoke_2.8s_infinite]" style={{ animationDelay: '1.4s' }} />
        </div>
      );

    // ==========================================
    // 2. CÓSMICO, ESPACIAL & CIBERNÉTICA (4 MOLDURAS)
    // ==========================================
    case 'frame_galaxia_profunda':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Cometas e estrelas a orbitar bem além do perímetro */}
          <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -ml-1 -mt-1 rounded-full bg-fuchsia-300 shadow-[0_0_14px_#ec4899] animate-[frame-cosmic-orbit_5s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] animate-[frame-cosmic-orbit-wide_6.5s_linear_infinite]" />
          {/* Brilhos estelares fixos nos vértices */}
          <div className="absolute -top-1 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute -bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_8px_#f472b6] animate-ping" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
        </div>
      );

    case 'frame_cyber_laser':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Cantoneiras HUD militares de mira tática a projetar-se para fora */}
          <div className="absolute -top-2.5 -left-2.5 w-4 sm:w-5 h-4 sm:h-5 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <div className="absolute -top-2.5 -right-2.5 w-4 sm:w-5 h-4 sm:h-5 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <div className="absolute -bottom-2.5 -left-2.5 w-4 sm:w-5 h-4 sm:h-5 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <div className="absolute -bottom-2.5 -right-2.5 w-4 sm:w-5 h-4 sm:h-5 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          {/* Anel de mira exterior pontilhado a rodar lentamente */}
          <div className="absolute -inset-1 sm:-inset-2 rounded-[inherit] border border-dashed border-cyan-400/40 animate-[frame-laser-hud-spin_12s_linear_infinite]" />
          {/* Linha laser de varredura ativa */}
          <div className="absolute inset-x-0 h-[2px] bg-cyan-200 shadow-[0_0_10px_#22d3ee] animate-[frame-laser-scan_2.5s_ease-in-out_infinite]" />
        </div>
      );

    case 'frame_horizonte_eventos':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Vórtice dimensional púrpura profundo a distorcer a geometria exterior */}
          <div className="absolute -inset-2 sm:-inset-3 rounded-full border-2 border-fuchsia-500/50 shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-[frame-void-singularity_4s_ease-in-out_infinite]" />
          {/* Ejeção polar de partículas escuras e violetas */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-4 bg-gradient-to-t from-purple-500 to-transparent rounded-full blur-[0.5px] shadow-[0_0_12px_#c084fc] animate-pulse" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-4 bg-gradient-to-b from-purple-500 to-transparent rounded-full blur-[0.5px] shadow-[0_0_12px_#c084fc] animate-pulse" />
        </div>
      );

    case 'frame_plasma_solar':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-5 z-20 overflow-visible">
          {/* Ejeções de plasma coronal em arcos externos */}
          <div className="absolute -top-3 sm:-top-4 left-1/4 right-1/4 h-3 sm:h-4 border-t-3 border-amber-400 rounded-full shadow-[0_0_16px_#f97316] animate-[frame-solar-prominence_3s_infinite]" />
          <div className="absolute -bottom-3 sm:-bottom-4 left-1/4 right-1/4 h-3 sm:h-4 border-b-3 border-orange-500 rounded-full shadow-[0_0_16px_#ea580c] animate-[frame-solar-prominence_3s_infinite]" style={{ animationDelay: '1.5s' }} />
          {/* Proeminências solares laterais */}
          <div className="absolute top-1/4 -left-3 w-3 h-5 border-l-2 border-yellow-300 rounded-full shadow-[0_0_10px_#facc15] animate-pulse" />
          <div className="absolute bottom-1/4 -right-3 w-3 h-5 border-r-2 border-yellow-300 rounded-full shadow-[0_0_10px_#facc15] animate-pulse" />
        </div>
      );

    // ==========================================
    // 3. REALEZA, DEUSES & PRESTÍGIO SUPREMO (4 MOLDURAS)
    // ==========================================
    case 'frame_ouro_real':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Coroa Real de ouro 24k cinzelada no topo a ultrapassar a moldura */}
          <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 flex items-end justify-center gap-1 animate-[frame-gold-gleam_3s_infinite]">
            <span className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gradient-to-t from-amber-600 to-yellow-300 rounded-t-sm shadow-[0_0_8px_#fbbf24]" />
            <span className="w-2 sm:w-3 h-4.5 sm:h-6 bg-gradient-to-t from-amber-500 via-yellow-200 to-white rounded-t-md shadow-[0_0_12px_#fbbf24] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-red-600 shadow-[0_0_4px_#ef4444]" />
            </span>
            <span className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gradient-to-t from-amber-600 to-yellow-300 rounded-t-sm shadow-[0_0_8px_#fbbf24]" />
          </div>
          {/* Feixes régios dourados nos cantos */}
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-300 shadow-[0_0_8px_#f59e0b]" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-300 shadow-[0_0_8px_#f59e0b]" />
        </div>
      );

    case 'frame_diamante_sagrado':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* 4 Pontas de diamante a sobressair nos eixos cardeais com flashes de luz prismática */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 sm:w-4 h-3 sm:h-4 rotate-45 bg-gradient-to-br from-white via-sky-200 to-pink-200 shadow-[0_0_14px_#ffffff] animate-[frame-diamond-flare_3s_infinite]" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 sm:w-4 h-3 sm:h-4 rotate-45 bg-gradient-to-br from-white via-sky-200 to-pink-200 shadow-[0_0_14px_#ffffff] animate-[frame-diamond-flare_3s_infinite]" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 rotate-45 bg-gradient-to-br from-white via-cyan-100 to-purple-200 shadow-[0_0_14px_#ffffff] animate-[frame-diamond-flare_3.5s_infinite]" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 rotate-45 bg-gradient-to-br from-white via-cyan-100 to-purple-200 shadow-[0_0_14px_#ffffff] animate-[frame-diamond-flare_3.5s_infinite]" style={{ animationDelay: '2.2s' }} />
        </div>
      );

    case 'frame_luz_divina':
      return (
        <div className="pointer-events-none absolute -inset-4 sm:-inset-6 z-20 overflow-visible">
          {/* Raios volumétricos divinos que disparam para o exterior em 360° */}
          <div className="absolute inset-0 flex items-center justify-center animate-[frame-divine-rays_8s_linear_infinite]">
            <div className="w-[120%] h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent shadow-[0_0_15px_#fde047] opacity-80" />
            <div className="absolute w-[120%] h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent shadow-[0_0_15px_#fde047] opacity-80 rotate-45" />
            <div className="absolute w-[120%] h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent shadow-[0_0_15px_#fde047] opacity-80 rotate-90" />
            <div className="absolute w-[120%] h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent shadow-[0_0_15px_#fde047] opacity-80 rotate-135" />
          </div>
          {/* Poeira dourada sagrada a flutuar */}
          <div className="absolute top-1 left-3 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_6px_#fde047] animate-pulse" />
          <div className="absolute bottom-2 right-4 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_6px_#fde047] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      );

    case 'frame_esmeralda_imperial':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Grandes gemas de esmeralda lapidadas nos 4 pontos cardeais com garras de ouro */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-3 sm:h-4 bg-gradient-to-b from-emerald-300 to-emerald-800 rounded-sm border border-amber-400 shadow-[0_0_12px_#10b981]" />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-3 sm:h-4 bg-gradient-to-t from-emerald-300 to-emerald-800 rounded-sm border border-amber-400 shadow-[0_0_12px_#10b981]" />
          <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-3 sm:w-4 h-4 sm:h-5 bg-gradient-to-r from-emerald-300 to-emerald-800 rounded-sm border border-amber-400 shadow-[0_0_12px_#10b981]" />
          <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-3 sm:w-4 h-4 sm:h-5 bg-gradient-to-l from-emerald-300 to-emerald-800 rounded-sm border border-amber-400 shadow-[0_0_12px_#10b981]" />
        </div>
      );

    // ==========================================
    // 4. IDENTIDADE LUSITANA (6 MOLDURAS)
    // ==========================================
    case 'frame_quinas_portugal':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-5 z-20 overflow-visible">
          {/* Aura das Quinas e faixas vivas verde e rubra ondulantes */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 border border-amber-400/80 shadow-[0_0_14px_rgba(234,179,8,0.7)] flex items-center gap-1 animate-[frame-quinas-glory_3.5s_infinite]">
            <span className="w-1.5 h-2 bg-emerald-500 rounded-xs" />
            <span className="text-[9px] font-black text-amber-300 leading-none">🛡️ QUINAS</span>
            <span className="w-1.5 h-2 bg-red-600 rounded-xs" />
          </div>
          {/* Estandartes de energia nas laterais */}
          <div className="absolute top-1/4 -left-2 w-2 h-8 bg-gradient-to-b from-emerald-500 to-transparent rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
          <div className="absolute top-1/4 -right-2 w-2 h-8 bg-gradient-to-b from-red-600 to-transparent rounded-full shadow-[0_0_10px_#ef4444] animate-pulse" style={{ animationDelay: '0.8s' }} />
        </div>
      );

    case 'frame_rosa_dos_ventos':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Pontas cardeais de latão quinhentista que sobressaem em N, S, E, O */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-amber-300 filter drop-shadow-[0_0_8px_#f59e0b]" />
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[12px] border-t-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[12px] border-r-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
          <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[12px] border-l-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
          {/* Anel de bússola com graduação exterior */}
          <div className="absolute -inset-1 sm:-inset-2 rounded-full border border-dashed border-amber-400/50 animate-[frame-astrolabe-spin_24s_linear_infinite]" />
        </div>
      );

    case 'frame_azulejo_portugues':
      return (
        <div className="pointer-events-none absolute -inset-2.5 sm:-inset-4 z-20 overflow-visible">
          {/* Florões barrocos nos 4 cantos em relevo azul e dourado */}
          <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-amber-400 bg-blue-800 shadow-[0_0_8px_#1d4ed8] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-amber-400 bg-blue-800 shadow-[0_0_8px_#1d4ed8] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-amber-400 bg-blue-800 shadow-[0_0_8px_#1d4ed8] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full border-2 border-amber-400 bg-blue-800 shadow-[0_0_8px_#1d4ed8] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          </div>
        </div>
      );

    case 'frame_muralha_castelo':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Duas tochas medievais acesas nos cantos superiores com chamas vivas a subir */}
          <div className="absolute -top-3.5 -left-1 flex flex-col items-center">
            <span className="w-2.5 sm:w-3 h-3.5 sm:h-5 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] shadow-[0_0_10px_#ea580c] animate-[frame-flame-lick_1.6s_infinite]" />
            <span className="w-2 h-2.5 bg-stone-700 border border-stone-500 rounded-b-sm" />
          </div>
          <div className="absolute -top-3.5 -right-1 flex flex-col items-center">
            <span className="w-2.5 sm:w-3 h-3.5 sm:h-5 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] shadow-[0_0_10px_#ea580c] animate-[frame-flame-lick_1.9s_infinite]" style={{ animationDelay: '0.6s' }} />
            <span className="w-2 h-2.5 bg-stone-700 border border-stone-500 rounded-b-sm" />
          </div>
          {/* Ameias medievais de granito no topo */}
          <div className="absolute -top-1.5 inset-x-8 flex justify-between">
            <span className="w-2.5 h-2 bg-stone-600 border border-stone-400 shadow-sm" />
            <span className="w-2.5 h-2 bg-stone-600 border border-stone-400 shadow-sm" />
          </div>
        </div>
      );

    case 'frame_farol_sagres':
      return (
        <div className="pointer-events-none absolute -inset-4 sm:-inset-6 z-20 overflow-visible">
          {/* Lanterna de Fresnel com feixe volumétrico de longo alcance a varrer 360° */}
          <div className="absolute inset-0 flex items-center justify-center animate-[frame-sagres-beam-sweep_6s_linear_infinite]">
            <div className="w-[140%] h-4 bg-gradient-to-r from-transparent via-amber-200/40 to-yellow-300 shadow-[0_0_25px_#f59e0b] origin-center -rotate-12 [clip-path:polygon(0%_40%,100%_0%,100%_100%,0%_60%)]" />
          </div>
          {/* Lâmpada de Fresnel reluzente no topo */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-yellow-200 shadow-[0_0_16px_#fde047] border border-white" />
        </div>
      );

    case 'fado_guitarra':
    case 'frame_fado_guitarra':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Leque e cravelhas de madrepérola de guitarra portuguesa no topo */}
          <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-stone-900/90 border border-amber-600/70 shadow-[0_0_10px_#b45309]">
            <span className="w-1 h-2.5 bg-amber-300 rounded-full" />
            <span className="w-1.5 h-3.5 bg-amber-200 rounded-full shadow-[0_0_6px_#fde047]" />
            <span className="w-1 h-2.5 bg-amber-300 rounded-full" />
          </div>
          {/* Notas musicais prateadas e douradas a flutuar no ar */}
          <span className="absolute -top-2 left-1 font-serif text-sm font-black text-amber-300 filter drop-shadow-[0_0_6px_#f59e0b] animate-[frame-music-note-rise_3.2s_infinite]">
            ♪
          </span>
          <span className="absolute -top-2 right-1 font-serif text-base font-black text-amber-200 filter drop-shadow-[0_0_6px_#fde047] animate-[frame-music-note-rise-left_3.6s_infinite]" style={{ animationDelay: '1.4s' }}>
            ♫
          </span>
        </div>
      );

    // ==========================================
    // 5. ARCADE, TREVAS & FANTASIA (4 MOLDURAS)
    // ==========================================
    case 'frame_arcade_8bit':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Moeda 8-bit dourada e coração 1UP pixel art a saltitar para fora */}
          <div className="absolute -top-3.5 left-2 px-1.5 py-0.5 rounded bg-amber-400 border border-black shadow-[2px_2px_0_#000] text-[9px] font-mono font-black text-slate-950 animate-[frame-pixel-jump_1.8s_infinite]">
            🪙 1UP
          </div>
          <div className="absolute -top-3.5 right-2 px-1 py-0.5 rounded bg-rose-500 border border-black shadow-[2px_2px_0_#000] text-[9px] font-mono font-black text-white animate-[frame-pixel-jump_1.8s_infinite]" style={{ animationDelay: '0.9s' }}>
            ❤️
          </div>
          {/* Cantos chanfrados em bloco pixel art */}
          <div className="absolute -bottom-2 -left-1.5 w-3 h-3 bg-cyan-400 border border-black shadow-[2px_2px_0_#000]" />
          <div className="absolute -bottom-2 -right-1.5 w-3 h-3 bg-fuchsia-500 border border-black shadow-[2px_2px_0_#000]" />
        </div>
      );

    case 'frame_biohazard_toxic':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Bolhas ácidas radioativas e vapores mutagénicos verdes a subir */}
          <div className="absolute -top-3 left-1/4 w-2.5 h-2.5 rounded-full bg-lime-300 border border-emerald-400 shadow-[0_0_10px_#84cc16] animate-[frame-bio-bubble_2.5s_infinite]" />
          <div className="absolute -top-3.5 right-1/3 w-3 h-3 rounded-full bg-lime-400 border border-emerald-400 shadow-[0_0_12px_#a3e635] animate-[frame-bio-bubble_2.2s_infinite]" style={{ animationDelay: '1.1s' }} />
          <div className="absolute top-1/3 -left-2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#10b981] animate-[frame-bio-bubble_3s_infinite]" style={{ animationDelay: '0.6s' }} />
          {/* Símbolo de Perigo Biohazard no topo */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-black/90 border border-lime-400 shadow-[0_0_10px_#84cc16] text-[8px] font-black text-lime-400">
            ☣ TOXIC
          </div>
        </div>
      );

    case 'frame_gladiador_ferro':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Pontas de espadas e lanças de aço forjado cruzadas nos cantos */}
          <div className="absolute -top-3 -left-3 w-4 h-4 border-t-3 border-l-3 border-red-500 shadow-[0_0_8px_#b91c1c] rotate-12" />
          <div className="absolute -top-3 -right-3 w-4 h-4 border-t-3 border-r-3 border-red-500 shadow-[0_0_8px_#b91c1c] -rotate-12" />
          <div className="absolute -bottom-3 -left-3 w-4 h-4 border-b-3 border-l-3 border-slate-300 shadow-[0_0_8px_#94a3b8] -rotate-12" />
          <div className="absolute -bottom-3 -right-3 w-4 h-4 border-b-3 border-r-3 border-slate-300 shadow-[0_0_8px_#94a3b8] rotate-12" />
          {/* Faíscas de aço forjado em choque de combate */}
          <div className="absolute top-1/4 -right-1.5 w-1.5 h-1.5 bg-yellow-200 shadow-[0_0_6px_#facc15] animate-[frame-steel-spark_2.5s_infinite]" />
          <div className="absolute bottom-1/4 -left-1.5 w-1.5 h-1.5 bg-red-400 shadow-[0_0_6px_#f87171] animate-[frame-steel-spark_2.8s_infinite]" style={{ animationDelay: '1.2s' }} />
        </div>
      );

    case 'frame_sakura_zen':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4 z-20 overflow-visible">
          {/* Flores de cerejeira em relevo nos cantos */}
          <div className="absolute -top-2.5 -left-2 text-base filter drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]">
            🌸
          </div>
          <div className="absolute -bottom-2.5 -right-2 text-base filter drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]">
            🌸
          </div>
          {/* Pétalas de sakura soltas a flutuar na brisa suave ao redor */}
          <div className="absolute -top-2 right-1/4 w-2 sm:w-2.5 h-3 sm:h-3.5 bg-gradient-to-br from-pink-200 to-rose-400 rounded-[50%_0_50%_0] shadow-[0_0_6px_#f472b6] animate-[frame-sakura-breeze_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/3 -left-2 w-2 sm:w-2.5 h-3 sm:h-3.5 bg-gradient-to-br from-pink-200 to-rose-400 rounded-[0_50%_0_50%] shadow-[0_0_6px_#f472b6] animate-[frame-sakura-breeze_4.5s_ease-in-out_infinite]" style={{ animationDelay: '1.8s' }} />
        </div>
      );

    // ==========================================
    // 6. VIP COLLECTION 2.0 — ROYAL IDENTITIES (5 MOLDURAS)
    // ==========================================
    case 'AP-VIP-FRAME-001':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Coroa Imperial do Império com rubis cintilantes e raios de ouro vivo */}
          <div className="absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 flex items-end justify-center gap-1.5 animate-[frame-gold-gleam_2.8s_infinite]">
            <span className="w-2 sm:w-2.5 h-4 sm:h-5 bg-gradient-to-t from-amber-600 via-yellow-400 to-white rounded-t-sm shadow-[0_0_10px_#f59e0b] border-t border-amber-200" />
            <span className="w-3 sm:w-4 h-6 sm:h-8 bg-gradient-to-t from-amber-600 via-yellow-300 to-white rounded-t-md shadow-[0_0_18px_#f59e0b] flex flex-col items-center justify-start pt-1 border-t border-white">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-rose-600 shadow-[0_0_8px_#ef4444]" />
            </span>
            <span className="w-2 sm:w-2.5 h-4 sm:h-5 bg-gradient-to-t from-amber-600 via-yellow-400 to-white rounded-t-sm shadow-[0_0_10px_#f59e0b] border-t border-amber-200" />
          </div>
          {/* Aura de rubis inferiores */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/90 border border-amber-400 shadow-[0_0_14px_#f59e0b] text-[9px] font-black text-amber-300 uppercase tracking-widest">
            👑 VIP IMPÉRIO
          </div>
        </div>
      );

    case 'AP-VIP-FRAME-002':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Esferas armilares e motivos manuelinos nos 4 cantos */}
          <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full border-2 border-yellow-300 bg-gradient-to-br from-emerald-600 to-amber-500 shadow-[0_0_10px_#fbbf24] flex items-center justify-center">
            <span className="text-[9px]">🧭</span>
          </div>
          <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full border-2 border-yellow-300 bg-gradient-to-br from-red-600 to-amber-500 shadow-[0_0_10px_#fbbf24] flex items-center justify-center">
            <span className="text-[9px]">🧭</span>
          </div>
          {/* Faixa dourada imperial */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/95 border border-yellow-400 shadow-[0_0_12px_#fbbf24] text-[8px] font-black text-yellow-300">
            PORTUGAL DE OURO
          </div>
        </div>
      );

    case 'AP-VIP-FRAME-003':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5.5 z-20 overflow-visible">
          {/* Anéis etéreos celestiais em rotação 3D com estrelas cadentes */}
          <div className="absolute -inset-2 sm:-inset-3 rounded-full border-2 border-indigo-400/60 shadow-[0_0_20px_#818cf8] animate-[frame-cosmic-orbit_7s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -ml-1 -mt-1 rounded-full bg-sky-200 shadow-[0_0_12px_#38bdf8] animate-[frame-cosmic-orbit-wide_5.5s_linear_infinite]" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-purple-400 text-[8px] font-black text-purple-300 shadow-[0_0_12px_#c084fc]">
            ✦ CELESTIAL
          </div>
        </div>
      );

    case 'AP-VIP-FRAME-004':
      return (
        <div className="pointer-events-none absolute -inset-3 sm:-inset-4.5 z-20 overflow-visible">
          {/* Facetas de cristal lusitano puro em 3D com refração arco-íris */}
          <div className="absolute -top-2.5 -left-2.5 w-4 h-4 rotate-45 bg-white border border-cyan-200 shadow-[0_0_12px_#ffffff] animate-[frame-diamond-flare_3s_infinite]" />
          <div className="absolute -top-2.5 -right-2.5 w-4 h-4 rotate-45 bg-white border border-cyan-200 shadow-[0_0_12px_#ffffff] animate-[frame-diamond-flare_3s_infinite]" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-2.5 -left-2.5 w-4 h-4 rotate-45 bg-white border border-cyan-200 shadow-[0_0_12px_#ffffff] animate-[frame-diamond-flare_3s_infinite]" style={{ animationDelay: '1.5s' }} />
          <div className="absolute -bottom-2.5 -right-2.5 w-4 h-4 rotate-45 bg-white border border-cyan-200 shadow-[0_0_12px_#ffffff] animate-[frame-diamond-flare_3s_infinite]" style={{ animationDelay: '2.2s' }} />
        </div>
      );

    case 'AP-VIP-FRAME-005':
      return (
        <div className="pointer-events-none absolute -inset-3.5 sm:-inset-5 z-20 overflow-visible">
          {/* Gigantescas chamas douradas e rubras do Campeão a envolver o avatar */}
          <div className="absolute -top-4 sm:-top-6 inset-x-1 flex justify-around items-end animate-[frame-vip-champion-fire_2s_infinite]">
            <span className="w-3 sm:w-4 h-6 sm:h-8 bg-gradient-to-t from-red-600 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] -rotate-12" />
            <span className="w-4 sm:w-6 h-8 sm:h-11 bg-gradient-to-t from-red-700 via-amber-300 to-white rounded-full blur-[0.5px] shadow-[0_0_18px_#f59e0b]" />
            <span className="w-3 sm:w-4 h-6 sm:h-8 bg-gradient-to-t from-red-600 via-amber-400 to-yellow-200 rounded-full blur-[0.5px] rotate-12" />
          </div>
          {/* Fogo nas laterais */}
          <div className="absolute top-1/3 -left-3 w-3 h-7 bg-gradient-to-l from-orange-500 to-yellow-300 rounded-full blur-[0.5px] animate-pulse" />
          <div className="absolute top-1/3 -right-3 w-3 h-7 bg-gradient-to-r from-orange-500 to-yellow-300 rounded-full blur-[0.5px] animate-pulse" />
          {/* Brasas campeãs em profusão */}
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_10px_#facc15] animate-[frame-ember-float_2s_infinite]" />
          <div className="absolute bottom-3 right-2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#fbbf24] animate-[frame-ember-float-alt_2.4s_infinite]" style={{ animationDelay: '0.8s' }} />
        </div>
      );

    default:
      return null;
  }
}

/**
 * Retorna as propriedades visuais de corpo espesso, relevo e luz de cada moldura.
 */
function getFrameStyle(frame: AnimatedFrame | undefined, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): FrameStyleDefinition {
  if (!frame) {
    return {
      auraClass: 'bg-slate-700/20',
      bodyClass: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
      outerBevelClass: 'ring-1 sm:ring-[1.5px] ring-slate-400/40 shadow-[0_0_10px_rgba(100,116,139,0.3)]',
      innerBevelClass: 'ring-1 ring-inset ring-white/15',
      outerEffects: null,
    };
  }

  const baseOverspill = renderFrameOverspillEffects(frame.id, size);

  switch (frame.id) {
    // ==========================================
    // 1. ELEMENTAL & FORÇAS DA NATUREZA
    // ==========================================
    case 'frame_fogo_eterno':
      return {
        auraClass: 'bg-gradient-to-t from-red-600/50 via-amber-500/40 to-yellow-400/30 animate-pulse',
        bodyClass: 'bg-gradient-to-tr from-red-800 via-amber-500 via-orange-600 to-yellow-300 shadow-[inset_0_0_12px_rgba(239,68,68,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-300/80 shadow-[0_0_18px_rgba(245,158,11,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-red-950/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-transparent to-amber-300/25 mix-blend-screen animate-pulse" />
          </div>
        ),
      };

    case 'frame_ondas_atlantico':
      return {
        auraClass: 'bg-gradient-to-b from-cyan-400/50 via-blue-600/40 to-indigo-900/40 animate-[frame-tide-pulse_3s_infinite]',
        bodyClass: 'bg-gradient-to-b from-cyan-300 via-blue-600 via-cyan-500 to-blue-950 shadow-[inset_0_0_14px_rgba(6,182,212,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-cyan-200/90 shadow-[0_0_18px_rgba(6,182,212,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-blue-950/90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_tempestade_eletrica':
      return {
        auraClass: 'bg-sky-400/45 animate-[frame-electric-flicker_2s_infinite]',
        bodyClass: 'bg-gradient-to-br from-white via-sky-400 via-indigo-600 to-cyan-400 shadow-[inset_0_0_14px_rgba(56,189,248,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-white shadow-[0_0_20px_rgba(56,189,248,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-indigo-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_gelo_ancestral':
      return {
        auraClass: 'bg-cyan-200/45 animate-[frame-frost-glimmer_3.5s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-cyan-100 via-sky-300 via-white to-cyan-500 shadow-[inset_0_0_14px_rgba(165,243,252,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-white shadow-[0_0_18px_rgba(165,243,252,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-sky-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_natureza_viva':
      return {
        auraClass: 'bg-emerald-500/40 animate-[frame-nature-pulse_3s_infinite]',
        bodyClass: 'bg-gradient-to-b from-lime-300 via-emerald-600 via-green-500 to-emerald-950 shadow-[inset_0_0_12px_rgba(34,197,94,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-lime-200/80 shadow-[0_0_16px_rgba(34,197,94,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-emerald-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_dragao_fumegante':
      return {
        auraClass: 'bg-gradient-to-t from-red-600/50 via-amber-600/40 to-black/60 animate-[frame-pulse-mythic_2.8s_infinite]',
        bodyClass: 'bg-gradient-to-br from-red-600 via-rose-950 via-amber-600 to-black shadow-[inset_0_0_15px_rgba(220,38,38,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-400/90 shadow-[0_0_20px_rgba(220,38,38,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-black shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
      };

    // ==========================================
    // 2. CÓSMICO, ESPACIAL & CIBERNÉTICA
    // ==========================================
    case 'frame_galaxia_profunda':
      return {
        auraClass: 'bg-gradient-to-r from-fuchsia-600/50 via-purple-600/40 to-indigo-600/50 animate-[frame-nebula-flow_3.5s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-fuchsia-500 via-purple-700 via-indigo-600 to-pink-400 shadow-[inset_0_0_14px_rgba(168,85,247,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-pink-300/80 shadow-[0_0_18px_rgba(236,72,153,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-purple-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_cyber_laser':
      return {
        auraClass: 'bg-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
        bodyClass: 'bg-gradient-to-b from-cyan-300 via-slate-900 via-cyan-500 to-emerald-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_horizonte_eventos':
      return {
        auraClass: 'bg-purple-600/50 animate-[frame-void-swirl_3s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-purple-600 via-black via-fuchsia-700 to-purple-950 shadow-[inset_0_0_16px_rgba(147,51,234,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-purple-300/80 shadow-[0_0_22px_rgba(168,85,247,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
      };

    case 'frame_plasma_solar':
      return {
        auraClass: 'bg-amber-500/50 animate-[frame-pulse-warm_2.5s_infinite]',
        bodyClass: 'bg-gradient-to-br from-yellow-200 via-amber-500 via-orange-600 to-yellow-400 shadow-[inset_0_0_14px_rgba(245,158,11,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-amber-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    // ==========================================
    // 3. REALEZA, DEUSES & PRESTÍGIO SUPREMO
    // ==========================================
    case 'frame_ouro_real':
      return {
        auraClass: 'bg-amber-400/45 animate-[frame-gold-shimmer_3s_infinite]',
        bodyClass: 'bg-gradient-to-b from-yellow-100 via-amber-400 via-yellow-500 to-amber-700 shadow-[inset_0_0_14px_rgba(245,158,11,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-amber-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_3.5s_infinite]" />
          </div>
        ),
      };

    case 'frame_diamante_sagrado':
      return {
        auraClass: 'bg-gradient-to-r from-sky-200/50 via-pink-200/40 to-white/50 animate-[frame-prism-shift_3.5s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-white via-sky-200 via-pink-200 to-white shadow-[inset_0_0_16px_rgba(224,242,254,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-white shadow-[0_0_22px_rgba(224,242,254,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_luz_divina':
      return {
        auraClass: 'bg-yellow-300/50 animate-[frame-gold-shimmer_2.8s_infinite]',
        bodyClass: 'bg-gradient-to-t from-amber-600 via-yellow-300 via-white to-yellow-200 shadow-[inset_0_0_16px_rgba(253,224,71,0.9)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-yellow-100 shadow-[0_0_22px_rgba(253,224,71,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-yellow-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_esmeralda_imperial':
      return {
        auraClass: 'bg-emerald-500/45 animate-[frame-nature-pulse_3.5s_infinite]',
        bodyClass: 'bg-gradient-to-br from-emerald-300 via-teal-700 via-emerald-600 to-amber-500 shadow-[inset_0_0_14px_rgba(16,185,129,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-300 shadow-[0_0_18px_rgba(16,185,129,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-emerald-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    // ==========================================
    // 4. IDENTIDADE LUSITANA & ACORDA PORTUGAL
    // ==========================================
    case 'frame_quinas_portugal':
      return {
        auraClass: 'bg-gradient-to-r from-emerald-600/50 via-amber-400/40 to-red-600/50 animate-[frame-gold-shimmer_3.5s_infinite]',
        bodyClass: 'bg-gradient-to-br from-emerald-500 via-yellow-400 via-red-600 to-slate-200 shadow-[inset_0_0_14px_rgba(234,179,8,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-200 shadow-[0_0_20px_rgba(234,179,8,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_rosa_dos_ventos':
      return {
        auraClass: 'bg-amber-500/40 animate-pulse',
        bodyClass: 'bg-gradient-to-b from-yellow-200 via-amber-500 via-yellow-600 to-amber-900 shadow-[inset_0_0_12px_rgba(217,119,6,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-200 shadow-[0_0_16px_rgba(217,119,6,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-amber-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_azulejo_portugues':
      return {
        auraClass: 'bg-blue-600/40 shadow-[0_0_18px_rgba(29,78,216,0.45)]',
        bodyClass: 'bg-gradient-to-br from-blue-700 via-white via-sky-200 to-indigo-950 shadow-[inset_0_0_12px_rgba(29,78,216,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-300 shadow-[0_0_16px_rgba(29,78,216,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-blue-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[frame-azulejo-glaze_4.5s_infinite_ease-in-out]" />
          </div>
        ),
      };

    case 'frame_muralha_castelo':
      return {
        auraClass: 'bg-stone-500/40 shadow-[0_0_16px_rgba(120,113,108,0.4)]',
        bodyClass: 'bg-gradient-to-b from-stone-300 via-stone-600 via-orange-600 to-stone-900 shadow-[inset_0_0_12px_rgba(120,113,108,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-stone-300 shadow-[0_0_14px_rgba(120,113,108,0.5)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_farol_sagres':
      return {
        auraClass: 'bg-amber-400/45 animate-pulse',
        bodyClass: 'bg-gradient-to-b from-yellow-200 via-amber-500 via-sky-800 to-slate-950 shadow-[inset_0_0_14px_rgba(245,158,11,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'fado_guitarra':
    case 'frame_fado_guitarra':
      return {
        auraClass: 'bg-amber-700/45 shadow-[0_0_16px_rgba(180,83,9,0.4)]',
        bodyClass: 'bg-gradient-to-b from-amber-600 via-amber-800 via-yellow-500 to-stone-950 shadow-[inset_0_0_12px_rgba(180,83,9,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-amber-300 shadow-[0_0_16px_rgba(180,83,9,0.5)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    // ==========================================
    // 5. ARCADE, TREVAS & FANTASIA
    // ==========================================
    case 'frame_arcade_8bit':
      return {
        auraClass: 'bg-gradient-to-r from-rose-500/50 via-purple-600/40 to-cyan-400/50 animate-pulse',
        bodyClass: 'bg-gradient-to-br from-rose-400 via-purple-600 via-cyan-400 to-yellow-300 shadow-[inset_0_0_12px_rgba(244,63,94,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-white shadow-[0_0_18px_rgba(244,63,94,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_biohazard_toxic':
      return {
        auraClass: 'bg-lime-400/45 shadow-[0_0_20px_rgba(132,204,22,0.6)] animate-pulse',
        bodyClass: 'bg-gradient-to-b from-lime-300 via-emerald-600 via-lime-500 to-slate-950 shadow-[inset_0_0_14px_rgba(132,204,22,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-lime-200 shadow-[0_0_18px_rgba(132,204,22,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_gladiador_ferro':
      return {
        auraClass: 'bg-red-700/40 shadow-[0_0_18px_rgba(185,28,28,0.5)]',
        bodyClass: 'bg-gradient-to-b from-slate-200 via-red-900 via-slate-600 to-stone-950 shadow-[inset_0_0_12px_rgba(185,28,28,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-red-400 shadow-[0_0_16px_rgba(185,28,28,0.6)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    case 'frame_sakura_zen':
      return {
        auraClass: 'bg-pink-300/45 shadow-[0_0_16px_rgba(244,114,182,0.5)] animate-pulse',
        bodyClass: 'bg-gradient-to-tr from-pink-200 via-rose-400 via-white to-rose-300 shadow-[inset_0_0_12px_rgba(244,114,182,0.8)]',
        outerBevelClass: 'ring-1.5 sm:ring-2 ring-white shadow-[0_0_16px_rgba(244,114,182,0.5)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-rose-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]',
        outerEffects: baseOverspill,
      };

    // ==========================================
    // 6. VIP COLLECTION 2.0 — ROYAL IDENTITIES
    // ==========================================
    case 'AP-VIP-FRAME-001':
      return {
        auraClass: 'bg-gradient-to-tr from-amber-400/55 via-yellow-300/45 to-rose-600/50 animate-[frame-gold-shimmer_2.8s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-yellow-100 via-amber-400 via-yellow-300 to-rose-600 shadow-[inset_0_0_16px_rgba(245,158,11,0.9)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-yellow-100 shadow-[0_0_24px_rgba(245,158,11,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-amber-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
        sheenOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_3.2s_infinite]" />
          </div>
        ),
      };

    case 'AP-VIP-FRAME-002':
      return {
        auraClass: 'bg-gradient-to-b from-yellow-300/50 via-emerald-500/40 to-amber-500/50 animate-[frame-gold-shimmer_3.2s_infinite]',
        bodyClass: 'bg-gradient-to-b from-yellow-200 via-emerald-600 via-yellow-400 to-amber-600 shadow-[inset_0_0_14px_rgba(234,179,8,0.8)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-yellow-200 shadow-[0_0_22px_rgba(234,179,8,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
      };

    case 'AP-VIP-FRAME-003':
      return {
        auraClass: 'bg-gradient-to-r from-indigo-400/55 via-purple-500/45 to-sky-300/55 animate-[frame-nebula-flow_3.2s_infinite]',
        bodyClass: 'bg-gradient-to-r from-sky-200 via-indigo-600 via-purple-500 to-pink-300 shadow-[inset_0_0_14px_rgba(129,140,248,0.8)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-sky-200 shadow-[0_0_22px_rgba(129,140,248,0.7)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-purple-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
      };

    case 'AP-VIP-FRAME-004':
      return {
        auraClass: 'bg-gradient-to-tr from-white/55 via-cyan-200/45 to-sky-400/55 animate-[frame-prism-shift_3.2s_infinite]',
        bodyClass: 'bg-gradient-to-tr from-white via-cyan-200 via-sky-300 to-white shadow-[inset_0_0_16px_rgba(224,242,254,0.9)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-white shadow-[0_0_24px_rgba(224,242,254,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
      };

    case 'AP-VIP-FRAME-005':
      return {
        auraClass: 'bg-gradient-to-b from-red-500/60 via-amber-400/50 to-yellow-500/60 animate-[frame-pulse-warm_2.4s_infinite]',
        bodyClass: 'bg-gradient-to-b from-yellow-200 via-red-600 via-amber-400 to-yellow-500 shadow-[inset_0_0_16px_rgba(239,68,68,0.9)]',
        outerBevelClass: 'ring-2 sm:ring-[2.5px] ring-yellow-200 shadow-[0_0_25px_rgba(239,68,68,0.8)]',
        innerBevelClass: 'ring-1.5 ring-inset ring-red-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]',
        outerEffects: baseOverspill,
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
 * AnimatedFrameWrapper AAA 2026
 * 
 * Envolve a imagem do avatar com uma estrutura viva espessa e volumosa,
 * aura e iluminação externa, e efeitos dedicados que saem para fora da moldura sem serem cortados.
 */
export function AnimatedFrameWrapper({
  frameId,
  children,
  className = '',
  size = 'md',
}: AnimatedFrameWrapperProps) {
  const frame = getFrameById(frameId);
  const style = getFrameStyle(frame, size);
  const thicknessClass = THICKNESS_PADDING[size] || THICKNESS_PADDING.md;

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-[inherit] transition-all duration-300 flex items-center justify-center shrink-0 aspect-square overflow-visible',
        thicknessClass,
        style.bodyClass,
        style.outerBevelClass,
        className
      )}
    >
      {/* Camada 1: Aura e Halo luminoso exterior difuso */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-2.5 sm:-inset-4 rounded-[inherit] -z-10 blur-md opacity-85 transition-opacity duration-300',
          style.auraClass
        )}
      />

      {/* Camada 2: Efeitos dedicados que saem e extravasam da moldura (chamas, raios, ondas, órbitas, etc.) */}
      {style.outerEffects}

      {/* Camada 3: Reflexo de superfície dinâmico sobre o corpo da moldura */}
      {style.sheenOverlay}

      {/* Bisel interno de transição para o avatar */}
      <div className={cn('pointer-events-none absolute inset-0 rounded-[inherit] z-20', style.innerBevelClass)} />

      {/* Camada 4: Recipiente interno do avatar (corta a foto estritamente no raio concêntrico com sombra de profundidade) */}
      <div className="relative z-10 w-full h-full rounded-[inherit] overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
        {children}
      </div>
    </div>
  );
}

export default AnimatedFrameWrapper;
