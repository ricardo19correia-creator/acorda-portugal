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
  borderClass: string;
  glowClass: string;
  innerBorderClass?: string;
  accentOverlay?: React.ReactNode;
}

/**
 * Retorna as propriedades visuais de material, bisel e luz de cada moldura.
 * Arquitetura limpa:
 * - 0 emojis colados
 * - 0 círculos/pontos nos cantos
 * - 0 caixas desproporcionadas
 * - Borda rente com espessura rigorosa de 2.5px a 3.5px
 * - Mesma geometria e raio concêntrico do avatar
 */
function getFrameStyle(frame: AnimatedFrame | undefined): FrameStyleDefinition {
  if (!frame) {
    // COMUM / PADRÃO: Metal discreto (titânio / grafite acetinado)
    return {
      borderClass: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
      glowClass: 'shadow-[0_0_6px_rgba(100,116,139,0.25)]',
      innerBorderClass: 'ring-1 ring-inset ring-white/10',
    };
  }

  switch (frame.id) {
    // ==========================================
    // 1. ELEMENTAL & FORÇAS DA NATUREZA
    // ==========================================
    case 'frame_fogo_eterno':
      // Épico: Magma vulcânico e fogo contido
      return {
        borderClass: 'bg-gradient-to-tr from-red-700 via-amber-500 to-orange-600 animate-[frame-pulse-warm_3s_ease-in-out_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-300/30',
        accentOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/15 via-transparent to-amber-400/10 mix-blend-screen" />
          </div>
        ),
      };

    case 'frame_ondas_atlantico':
      // Raro: Azul oceânico bioluminescente
      return {
        borderClass: 'bg-gradient-to-b from-cyan-400 via-blue-600 to-indigo-900 animate-[frame-tide-pulse_3.5s_ease-in-out_infinite]',
        glowClass: 'shadow-[0_0_8px_rgba(6,182,212,0.3)]',
        innerBorderClass: 'ring-1 ring-inset ring-cyan-200/30',
        accentOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-300/10 to-transparent" />
          </div>
        ),
      };

    case 'frame_tempestade_eletrica':
      // Épico: Titânio escuro com descarga de plasma elétrico
      return {
        borderClass: 'bg-gradient-to-br from-sky-300 via-indigo-600 to-cyan-500 animate-[frame-electric-flicker_2.8s_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(56,189,248,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-sky-200/40',
      };

    case 'frame_gelo_ancestral':
      // Raro: Cristal facetado ártico e geada prismática
      return {
        borderClass: 'bg-gradient-to-tr from-cyan-200 via-sky-400 to-white animate-[frame-frost-glimmer_4s_infinite]',
        glowClass: 'shadow-[0_0_8px_rgba(165,243,252,0.3)]',
        innerBorderClass: 'ring-1 ring-inset ring-white/50',
      };

    case 'frame_natureza_viva':
      // Raro: Jade e esmeralda nobre do Gerês
      return {
        borderClass: 'bg-gradient-to-b from-emerald-400 via-green-600 to-teal-900',
        glowClass: 'shadow-[0_0_8px_rgba(34,197,94,0.3)]',
        innerBorderClass: 'ring-1 ring-inset ring-emerald-300/30',
      };

    case 'frame_dragao_fumegante':
      // Mítico: Escamas de dragão carmesim e ouro fundido
      return {
        borderClass: 'bg-gradient-to-br from-rose-600 via-red-800 to-amber-600 animate-[frame-pulse-mythic_3s_ease-in-out_infinite]',
        glowClass: 'shadow-[0_0_12px_rgba(220,38,38,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-rose-400/40',
      };

    // ==========================================
    // 2. CÓSMICO, ESPACIAL & CIBERNÉTICA
    // ==========================================
    case 'frame_galaxia_profunda':
      // Épico: Nebulosa cósmica púrpura-magenta
      return {
        borderClass: 'bg-gradient-to-tr from-fuchsia-600 via-purple-700 to-indigo-500 animate-[frame-nebula-flow_4s_linear_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(168,85,247,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-pink-300/30',
      };

    case 'frame_cyber_laser':
      // Raro: Moldura HUD tática chanfrada com precisão militar
      return {
        borderClass: 'bg-gradient-to-b from-cyan-400 via-slate-900 to-cyan-500',
        glowClass: 'shadow-[0_0_8px_rgba(6,182,212,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-cyan-300/50',
        accentOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-cyan-200 shadow-[0_0_6px_#22d3ee] animate-[frame-laser-scan_2.5s_ease-in-out_infinite]" />
          </div>
        ),
      };

    case 'frame_horizonte_eventos':
      // Mítico: Horizonte de eventos e vácuo quântico
      return {
        borderClass: 'bg-gradient-to-tr from-purple-900 via-black to-fuchsia-700 animate-[frame-void-swirl_3s_ease-in-out_infinite]',
        glowClass: 'shadow-[0_0_12px_rgba(147,51,234,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-purple-400/30',
      };

    case 'frame_plasma_solar':
      // Lendário: Confinamento magnético de plasma solar
      return {
        borderClass: 'bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-300 animate-[frame-pulse-warm_2.5s_ease-in-out_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-yellow-200/50',
      };

    // ==========================================
    // 3. REALEZA, DEUSES & PRESTÍGIO SUPREMO
    // ==========================================
    case 'frame_ouro_real':
      // Lendário: Ouro imperial 24k com chanfro de joalharia
      return {
        borderClass: 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-700 animate-[frame-gold-shimmer_3.5s_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-100/60',
        accentOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_4s_infinite]" />
          </div>
        ),
      };

    case 'frame_diamante_sagrado':
      // Mítico: Diamante puro com refração prismática
      return {
        borderClass: 'bg-gradient-to-tr from-white via-sky-200 to-pink-200 animate-[frame-prism-shift_4s_infinite]',
        glowClass: 'shadow-[0_0_12px_rgba(224,242,254,0.45)]',
        innerBorderClass: 'ring-1 ring-inset ring-white/80',
      };

    case 'frame_luz_divina':
      // Lendário: Graal celestial e ouro sagrado
      return {
        borderClass: 'bg-gradient-to-t from-amber-600 via-yellow-300 to-yellow-100',
        glowClass: 'shadow-[0_0_10px_rgba(253,224,71,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-yellow-100/70',
      };

    case 'frame_esmeralda_imperial':
      // Épico: Esmeralda profunda lapidada em moldura de ouro nobre
      return {
        borderClass: 'bg-gradient-to-br from-emerald-400 via-teal-700 to-amber-500',
        glowClass: 'shadow-[0_0_9px_rgba(16,185,129,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-emerald-200/30',
      };

    // ==========================================
    // 4. IDENTIDADE LUSITANA & ACORDA PORTUGAL
    // ==========================================
    case 'frame_quinas_portugal':
      // Lendário: Brasão manuelino das Quinas Lusitanas em esmalte verde-rubro e ouro
      return {
        borderClass: 'bg-gradient-to-br from-emerald-600 via-amber-400 to-red-600 animate-[frame-gold-shimmer_4s_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(234,179,8,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-200/50',
      };

    case 'frame_rosa_dos_ventos':
      // Lendário: Latão marítimo dos navegadores com pátina de época
      return {
        borderClass: 'bg-gradient-to-b from-amber-300 via-yellow-600 to-amber-900',
        glowClass: 'shadow-[0_0_9px_rgba(217,119,6,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-200/40',
      };

    case 'frame_azulejo_portugues':
      // Raro: Azulejo Pombalino em azul cobalto e esmalte branco
      return {
        borderClass: 'bg-gradient-to-br from-blue-700 via-sky-100 to-indigo-900',
        glowClass: 'shadow-[0_0_8px_rgba(29,78,216,0.3)]',
        innerBorderClass: 'ring-1 ring-inset ring-white/60',
        accentOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[frame-azulejo-glaze_5s_infinite_ease-in-out]" />
          </div>
        ),
      };

    case 'frame_muralha_castelo':
      // Raro: Granito cinzelado com reforço de ferro medieval
      return {
        borderClass: 'bg-gradient-to-b from-stone-400 via-stone-700 to-stone-900',
        glowClass: 'shadow-[0_0_7px_rgba(120,113,108,0.25)]',
        innerBorderClass: 'ring-1 ring-inset ring-stone-300/30',
      };

    case 'frame_farol_sagres':
      // Épico: Farol marítimo e feixe nobre no promontório de Sagres
      return {
        borderClass: 'bg-gradient-to-b from-amber-400 via-sky-800 to-slate-900',
        glowClass: 'shadow-[0_0_9px_rgba(245,158,11,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-300/30',
      };

    case 'fado_guitarra':
    case 'frame_fado_guitarra':
      // Raro: Pau-santo de guitarra portuguesa com madrepérola
      return {
        borderClass: 'bg-gradient-to-b from-amber-700 via-amber-900 to-stone-950',
        glowClass: 'shadow-[0_0_7px_rgba(180,83,9,0.3)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-300/30',
      };

    // ==========================================
    // 5. ARCADE, TREVAS & FANTASIA
    // ==========================================
    case 'frame_arcade_8bit':
      // Raro: Borda sintética retro 8-bit com acentos néon
      return {
        borderClass: 'bg-gradient-to-br from-rose-500 via-purple-600 to-cyan-400',
        glowClass: 'shadow-[0_0_8px_rgba(244,63,94,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-white/40',
      };

    case 'frame_biohazard_toxic':
      // Raro: Aço industrial com fluido verde fluorescente
      return {
        borderClass: 'bg-gradient-to-b from-lime-400 via-emerald-600 to-slate-950',
        glowClass: 'shadow-[0_0_8px_rgba(132,204,22,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-lime-300/40',
      };

    case 'frame_gladiador_ferro':
      // Raro: Aço de Damasco forjado e runas escuras
      return {
        borderClass: 'bg-gradient-to-b from-slate-400 via-red-900 to-stone-950',
        glowClass: 'shadow-[0_0_8px_rgba(185,28,28,0.35)]',
        innerBorderClass: 'ring-1 ring-inset ring-slate-300/30',
      };

    case 'frame_sakura_zen':
      // Raro: Ouro rosa e porcelana oriental
      return {
        borderClass: 'bg-gradient-to-tr from-pink-300 via-rose-400 to-rose-100',
        glowClass: 'shadow-[0_0_8px_rgba(244,114,182,0.3)]',
        innerBorderClass: 'ring-1 ring-inset ring-white/60',
      };

    // ==========================================
    // 6. VIP COLLECTION 2.0 — ROYAL IDENTITIES
    // ==========================================
    case 'AP-VIP-FRAME-001':
      // Mítico VIP: Coroa do Império em ouro com rubis polidos
      return {
        borderClass: 'bg-gradient-to-tr from-amber-300 via-yellow-500 to-rose-600 animate-[frame-gold-shimmer_3s_infinite]',
        glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.45)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-200/70',
        accentOverlay: (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-[frame-sheen-sweep_3.5s_infinite]" />
          </div>
        ),
      };

    case 'AP-VIP-FRAME-002':
      // Lendário VIP: Portugal de Ouro com esferas armilares
      return {
        borderClass: 'bg-gradient-to-b from-yellow-300 via-emerald-600 to-amber-500 animate-[frame-gold-shimmer_3.8s_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(234,179,8,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-yellow-200/50',
      };

    case 'AP-VIP-FRAME-003':
      // Lendário VIP: Trono Celestial em ametista e safira estelar
      return {
        borderClass: 'bg-gradient-to-r from-indigo-400 via-purple-500 to-sky-300 animate-[frame-nebula-flow_3.5s_linear_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(129,140,248,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-indigo-200/50',
      };

    case 'AP-VIP-FRAME-004':
      // Épico VIP: Diamante Lusitano multifacetado
      return {
        borderClass: 'bg-gradient-to-tr from-white via-cyan-200 to-sky-400 animate-[frame-prism-shift_3.5s_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(224,242,254,0.45)]',
        innerBorderClass: 'ring-1 ring-inset ring-white/80',
      };

    case 'AP-VIP-FRAME-005':
      // Épico VIP: Fogo do Campeão em ouro rubro vivo
      return {
        borderClass: 'bg-gradient-to-b from-red-500 via-amber-400 to-yellow-500 animate-[frame-pulse-warm_2.6s_ease-in-out_infinite]',
        glowClass: 'shadow-[0_0_10px_rgba(239,68,68,0.4)]',
        innerBorderClass: 'ring-1 ring-inset ring-amber-200/50',
      };

    // Fallback gracioso para moldura desconhecida: acabamento metálico ciano discreto
    default:
      return {
        borderClass: 'bg-gradient-to-b from-cyan-600 via-slate-800 to-cyan-900',
        glowClass: 'shadow-[0_0_7px_rgba(6,182,212,0.25)]',
        innerBorderClass: 'ring-1 ring-inset ring-cyan-400/20',
      };
  }
}

/**
 * AnimatedFrameWrapper Definitivo
 * 
 * Envolve a imagem do avatar com a mesma geometria, cantos concêntricos perfeitos
 * e espessura rigorosa de 2.5px a 3.5px. Não projeta caixas gigantes nem usa artefactos gráficos.
 */
export function AnimatedFrameWrapper({
  frameId,
  children,
  className = '',
}: AnimatedFrameWrapperProps) {
  const frame = getFrameById(frameId);
  const style = getFrameStyle(frame);

  // Espessura do bisel controlada de forma estrita: p-[2.5px] no mobile e p-[3px] no desktop
  return (
    <div
      className={cn(
        'relative w-full h-full p-[2.5px] sm:p-[3px] rounded-[inherit] transition-all duration-300 flex items-center justify-center shrink-0 aspect-square',
        style.borderClass,
        style.glowClass,
        className
      )}
    >
      {/* Reflexo chanfrado interno de alta fidelidade */}
      {style.innerBorderClass && (
        <div className={cn('pointer-events-none absolute inset-0 rounded-[inherit] z-20', style.innerBorderClass)} />
      )}

      {/* Acentos de luz dinâmicos (estritamente confinados à borda, sem emojis ou handles) */}
      {style.accentOverlay}

      {/* Recipiente interno do avatar: corta o conteúdo no raio concêntrico sem deformações */}
      <div className="relative z-10 w-full h-full rounded-[inherit] overflow-hidden bg-slate-950 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default AnimatedFrameWrapper;
