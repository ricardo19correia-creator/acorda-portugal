'use client';
import React from 'react';
import { getFrameById } from '@/data/frames';

interface FrameWrapperProps {
  frameId?: string | null;
  children: React.ReactNode;
  className?: string;
  showOrnaments?: boolean;
}

export function AnimatedFrameWrapper({
  frameId,
  children,
  className = '',
  showOrnaments = true,
}: FrameWrapperProps) {
  const frame = getFrameById(frameId);

  // Sem moldura ou moldura padrão: estilo limpo padronizado
  if (!frame || !frameId || frameId === 'default') {
    return (
      <div className={`relative w-full h-full p-0.5 rounded-2xl border border-slate-700/60 bg-slate-900 ${className}`}>
        <div className="relative z-10 w-full h-full rounded-[14px] overflow-hidden bg-slate-950">
          {children}
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. ELEMENTAL & FORÇAS DA NATUREZA
  // ==========================================

  // 1.1 INFERNO SOLAR & CHAMAS (Épico)
  if (frame.id === 'frame_fogo_eterno' || frame.id === 'frame_solar_flame') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl frame-effect-flame group/frame ${className}`}>
        {/* Brasas incandescentes a subir */}
        {showOrnaments && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
            <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-[ember-rise_2.4s_infinite_ease-out]" />
            <span className="absolute bottom-2 right-3 w-1 h-1 rounded-full bg-orange-400 shadow-[0_0_6px_#ea580c] animate-[ember-rise_1.8s_infinite_ease-out_0.6s]" />
            <span className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_10px_#fde047] animate-[ember-rise_2.8s_infinite_ease-out_1.2s]" />
          </div>
        )}
        {/* Adornos de pontas de fogo nos cantos superiores */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-1.5 -left-1 text-[10px] filter drop-shadow-[0_0_4px_#ef4444] z-20">🔥</span>
            <span className="pointer-events-none absolute -top-1.5 -right-1 text-[10px] filter drop-shadow-[0_0_4px_#f59e0b] z-20">🔥</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 1.2 ONDAS DO ATLÂNTICO (Raro)
  if (frame.id === 'frame_ondas_atlantico' || frame.id === 'frame_abismo_atlantico') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-cyan-400 via-blue-600 to-indigo-950 shadow-[0_0_18px_rgba(6,182,212,0.6)] animate-[ocean-wave-pulse_3s_infinite_ease-in-out] ${className}`}>
        {/* Gotículas e bolhas oceânicas */}
        {showOrnaments && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
            <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#22d3ee] animate-[bubble-drift_2.6s_infinite_ease-out]" />
            <span className="absolute bottom-3 right-2.5 w-2 h-2 rounded-full bg-blue-200 shadow-[0_0_8px_#38bdf8] animate-[bubble-drift_3.2s_infinite_ease-out_1s]" />
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] filter drop-shadow-[0_0_6px_#06b6d4]">🌊</span>
          </div>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 1.3 FÚRIA DO TROVÃO & RAIOS (Épico)
  if (frame.id === 'frame_tempestade_eletrica') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-slate-950 border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.7)] ${className}`}>
        {/* Arcos elétricos e nós nos 4 cantos */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-1 -left-1 w-2.5 h-2.5 rounded-sm bg-sky-300 border border-white shadow-[0_0_10px_#38bdf8] z-20 animate-pulse" />
            <span className="pointer-events-none absolute -top-1 -right-1 w-2.5 h-2.5 rounded-sm bg-sky-300 border border-white shadow-[0_0_10px_#38bdf8] z-20 animate-pulse" />
            <span className="pointer-events-none absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-sm bg-indigo-400 border border-white shadow-[0_0_10px_#818cf8] z-20 animate-pulse" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-sm bg-indigo-400 border border-white shadow-[0_0_10px_#818cf8] z-20 animate-pulse" />
            {/* Relâmpago lateral animado */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/80 animate-[lightning-arc_3.5s_infinite] z-20" />
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#38bdf8] z-20">⚡</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 1.4 ZERO ABSOLUTO & GELO ANCESTRAL (Raro)
  if (frame.id === 'frame_gelo_ancestral' || frame.id === 'frame_geada_glacial') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-tr from-cyan-900 via-sky-300 to-white shadow-[0_0_15px_rgba(165,243,252,0.6)] ${className}`}>
        {/* Brilho de geada e cristais nos cantos */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-1.5 -left-1 text-[10px] filter drop-shadow-[0_0_5px_#a5f3fc] z-20">❄️</span>
            <span className="pointer-events-none absolute -bottom-1.5 -right-1 text-[10px] filter drop-shadow-[0_0_5px_#a5f3fc] z-20">❄️</span>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] animate-[frost-shimmer_3s_infinite_linear] z-20" />
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 1.5 ESPÍRITO DA NATUREZA VIVA (Raro)
  if (frame.id === 'frame_natureza_viva' || frame.id === 'frame_esmeralda_natureza') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-emerald-600 via-lime-500 to-green-950 shadow-[0_0_14px_rgba(34,197,94,0.5)] ${className}`}>
        {/* Vaga-lumes luminosos orbitais */}
        {showOrnaments && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
            <span className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_8px_#fde047] animate-[firefly-orbit_4s_infinite_ease-in-out]" />
            <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-lime-300 shadow-[0_0_8px_#bef264] animate-[firefly-orbit_3.5s_infinite_ease-in-out_1.5s]" />
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] filter drop-shadow-[0_0_4px_#22c55e]">🌿</span>
          </div>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 1.6 FÚRIA DO DRAGÃO FUMEGANTE (Mítico)
  if (frame.id === 'frame_dragao_fumegante' || frame.id === 'frame_dragao_antigo') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-red-700 via-orange-600 to-stone-900 shadow-[0_0_22px_rgba(220,38,38,0.85)] animate-[dragon-pulse_3s_infinite] ${className}`}>
        {/* Olho de rubi e garras dracónicas nos 4 cantos */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#ef4444] z-20">🐲</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-[9px] filter drop-shadow-[0_0_4px_#ea580c] z-20">⚡</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[9px] filter drop-shadow-[0_0_4px_#ea580c] z-20">⚡</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. CÓSMICO, ESPACIAL & CIBERNÉTICA
  // ==========================================

  // 2.1 SUPERNOVA CÓSMICA & GALÁXIA (Épico)
  if (frame.id === 'frame_galaxia_profunda' || frame.id === 'frame_nebulosa_estelar') {
    return (
      <div className={`relative w-full h-full p-[4px] rounded-2xl bg-gradient-to-tr from-purple-700 via-pink-500 to-indigo-600 shadow-[0_0_25px_rgba(236,72,153,0.8)] animate-[void-pulse_2.8s_infinite] ${className}`}>
        {/* Estrelas cintilantes & cometa orbital */}
        {showOrnaments && (
          <>
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-conic-gradient from-pink-500 via-purple-600 to-indigo-400 opacity-40 blur-sm animate-[nebula-swirl_8s_linear_infinite]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
              <span className="absolute top-1.5 left-2 text-[8px] text-pink-200 animate-ping">✨</span>
              <span className="absolute bottom-2 right-2 text-[9px] text-yellow-200 animate-pulse">🌟</span>
              <div className="absolute w-8 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-[comet-flight_4s_infinite_ease-in-out]" />
            </div>
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#f43f5e] z-20">🌌</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[12px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 2.2 CYBER LASER HUD 360° (Raro)
  if (frame.id === 'frame_cyber_laser' || frame.id === 'frame_cyber_neon') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl frame-container-laser ${className}`}>
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 2.3 BURACO NEGRO & HORIZONTE DE EVENTOS (Mítico)
  if (frame.id === 'frame_horizonte_eventos' || frame.id === 'frame_void_abyss') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl frame-effect-void shadow-[0_0_22px_rgba(168,85,247,0.7)] ${className}`}>
        {/* Anel de Acreção de Matéria Escura */}
        {showOrnaments && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-purple-400/60 animate-pulse z-20">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] filter drop-shadow-[0_0_8px_#c084fc]">🌀</span>
          </div>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 2.4 CORONA SOLAR DE PLASMA (Lendário)
  if (frame.id === 'frame_plasma_solar' || frame.id === 'frame_quantum_matrix') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl frame-container-matrix bg-slate-950 ${className}`}>
        {/* Laser Scanner Vertical */}
        <div className="frame-matrix-laser" />
        {/* Cantoneiras HUD de Mira Tática */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-orange-400 z-20" />
            <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-orange-400 z-20" />
            <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-orange-400 z-20" />
            <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-orange-400 z-20" />
            <span className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 px-1 rounded bg-orange-950/90 text-[7px] font-mono text-orange-400 border border-orange-500/50 z-20 leading-none py-0.5">
              PLASMA:HUD
            </span>
          </>
        )}
        <div className="relative z-1 w-full h-full rounded-[13px] overflow-hidden bg-slate-950">
          {children}
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. REALEZA, DEUSES & PRESTÍGIO SUPREMO
  // ==========================================

  // 3.1 MAJESTADE IMPERIAL DOURADA (Lendário)
  if (frame.id === 'frame_ouro_real' || frame.id === 'frame_coroa_imperial' || frame.id === 'frame_fundador_ouro') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-[crown-gleam_3s_infinite] ${className}`}>
        {/* Coroa Imperial Esculpida no Topo */}
        {showOrnaments && (
          <>
            <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
              <span className="text-sm filter drop-shadow-[0_0_8px_#fbbf24]">👑</span>
            </div>
            {/* Rubis nos cantos inferiores */}
            <span className="pointer-events-none absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full bg-red-600 border border-amber-300 shadow-[0_0_6px_#dc2626] z-20" />
            <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 border border-amber-300 shadow-[0_0_6px_#dc2626] z-20" />
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 3.2 PRISMA DIAMANTE SAGRADO (Mítico)
  if (frame.id === 'frame_diamante_sagrado' || frame.id === 'frame_diamante_eterno') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-white via-sky-200 to-pink-300 shadow-[0_0_22px_rgba(224,242,254,0.85)] animate-[diamond-refraction_6s_infinite_linear] ${className}`}>
        {/* Facetas de Diamante & Flashes de Luz */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#ffffff] z-20">💎</span>
            <div className="pointer-events-none absolute top-1 left-1 w-3 h-3 bg-white rounded-full blur-[1px] animate-[diamond-flare_3s_infinite] z-20" />
            <div className="pointer-events-none absolute bottom-1 right-1 w-3 h-3 bg-white rounded-full blur-[1px] animate-[diamond-flare_3s_infinite_1.5s] z-20" />
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 3.3 GRAAL DOS DEUSES & LUZ CELESTIAL (Lendário)
  if (frame.id === 'frame_luz_divina' || frame.id === 'frame_ouro_dos_deuses') {
    return (
      <div className={`relative w-full h-full p-[4px] rounded-2xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-100 shadow-[0_0_30px_rgba(253,224,71,0.9)] animate-[divine-sunburst_3.2s_infinite] ${className}`}>
        {/* 4 Losangos Celestiais nos 4 eixos */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white border border-yellow-400 shadow-[0_0_10px_#ffffff] z-20" />
            <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white border border-yellow-400 shadow-[0_0_10px_#ffffff] z-20" />
            <span className="pointer-events-none absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-white border border-yellow-400 shadow-[0_0_10px_#ffffff] z-20" />
            <span className="pointer-events-none absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-white border border-yellow-400 shadow-[0_0_10px_#ffffff] z-20" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
              <span className="absolute top-2 left-2 text-[8px] animate-ping">✨</span>
              <span className="absolute bottom-2 right-2 text-[8px] animate-ping">✨</span>
            </div>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[12px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 3.4 ESMERALDA IMPERIAL (Épico)
  if (frame.id === 'frame_esmeralda_imperial') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-700 to-amber-500 border border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)] ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] filter drop-shadow-[0_0_6px_#10b981] z-20">👑</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-[8px] text-amber-300 z-20">✨</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[8px] text-amber-300 z-20">✨</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. IDENTIDADE LUSITANA & ACORDA PORTUGAL
  // ==========================================

  // 4.1 GLÓRIA DAS QUINAS LUSITANAS (Lendário)
  if (frame.id === 'frame_quinas_portugal' || frame.id === 'frame_portugal_glory') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl frame-effect-quinas ${className}`}>
        {/* Brasão das 5 Quinas no Topo */}
        {showOrnaments && (
          <>
            <div className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-yellow-400/80 shadow-[0_0_8px_rgba(234,179,8,0.6)] z-20">
              <span className="text-[9px]">🛡️</span>
              <span className="text-[8px] font-black text-yellow-300">PT</span>
            </div>
            <span className="pointer-events-none absolute -bottom-1 left-2 text-[8px]">🇵🇹</span>
            <span className="pointer-events-none absolute -bottom-1 right-2 text-[8px]">🇵🇹</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 4.2 ASTROLÁBIO DOS NAVEGADORES (Lendário)
  if (frame.id === 'frame_rosa_dos_ventos' || frame.id === 'frame_filigrana_coracao') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-950 border border-amber-400 shadow-[0_0_16px_rgba(217,119,6,0.6)] ${className}`}>
        {/* Rosa dos Ventos & Pontos Cardeais */}
        {showOrnaments && (
          <>
            <div className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[12px] filter drop-shadow-[0_0_6px_#fbbf24] animate-[compass-needle_4s_infinite_ease-in-out] z-20">
              🧭
            </div>
            <span className="pointer-events-none absolute top-0.5 left-1 text-[7px] font-mono font-bold text-amber-300 z-20">NW</span>
            <span className="pointer-events-none absolute top-0.5 right-1 text-[7px] font-mono font-bold text-amber-300 z-20">NE</span>
            <span className="pointer-events-none absolute bottom-0.5 left-1 text-[7px] font-mono font-bold text-amber-300 z-20">SW</span>
            <span className="pointer-events-none absolute bottom-0.5 right-1 text-[7px] font-mono font-bold text-amber-300 z-20">SE</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 4.3 AZULEJO POMBALINO (Raro)
  if (frame.id === 'frame_azulejo_portugues' || frame.id === 'frame_azulejo_manuelino' || frame.id === 'frame_azulejo_nobre') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-blue-700 via-white to-blue-800 border-2 border-yellow-400 shadow-[0_0_12px_rgba(29,78,216,0.5)] overflow-hidden ${className}`}>
        {/* Brilho de Esmalte Cerâmico Deslizante */}
        {showOrnaments && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full animate-[azulejo-glaze-sweep_4s_infinite_ease-in-out] z-20" />
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 4.4 MURALHA DE GUIMARÃES & CASTELOS (Raro)
  if (frame.id === 'frame_muralha_castelo' || frame.id === 'frame_castelo_muralha' || frame.id === 'frame_padrao_descobrimentos') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-stone-600 via-stone-700 to-stone-900 border border-stone-500 shadow-[0_0_12px_rgba(120,113,108,0.5)] ${className}`}>
        {/* Tochas nos Cantos */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2 -left-1.5 text-[10px] animate-[torch-flicker-anim_1.2s_infinite] z-20">🔥</span>
            <span className="pointer-events-none absolute -top-2 -right-1.5 text-[10px] animate-[torch-flicker-anim_1.4s_infinite_0.4s] z-20">🔥</span>
            <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] z-20">🏰</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 4.5 FAROL DE SAGRES & FIM DO MUNDO (Épico)
  if (frame.id === 'frame_farol_sagres' || frame.id === 'frame_luz_de_sagres') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-amber-500 via-sky-800 to-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.6)] ${className}`}>
        {/* Facho de Luz Giratório do Farol */}
        {showOrnaments && (
          <>
            <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-sm z-20 filter drop-shadow-[0_0_8px_#fde047]">
              🗼
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-amber-300/40 animate-[sagres-beam-rotate_4s_infinite_linear] z-20" />
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 4.6 ALMA DE ALFAMA & GUITARRA PORTUGUESA (Raro)
  if (frame.id === 'frame_fado_guitarra' || frame.id === 'frame_fadista_noite') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-amber-800 via-amber-950 to-stone-950 border border-amber-600/80 shadow-[0_0_12px_rgba(180,83,9,0.5)] ${className}`}>
        {/* Voluta de guitarra & notas musicais */}
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] z-20 filter drop-shadow-[0_0_6px_#fbbf24]">🎸</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-[8px] text-amber-300 animate-pulse z-20">♪</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[8px] text-amber-300 animate-pulse z-20">♫</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. ARCADE, TREVAS & FANTASIA
  // ==========================================

  // 5.1 RETRO 8-BIT ARCADE (Raro)
  if (frame.id === 'frame_arcade_8bit' || frame.id === 'frame_arcade_pixel') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-rose-500 via-sky-500 to-purple-600 border-2 border-dashed border-white shadow-[0_0_14px_rgba(244,63,94,0.5)] ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2 left-1.5 text-[9px] animate-[arcade-coin-jump_1.8s_infinite] z-20">🪙</span>
            <span className="pointer-events-none absolute -top-2 right-1.5 text-[9px] animate-pulse z-20">❤️</span>
            <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-black text-white bg-slate-900 px-1 rounded z-20">8-BIT</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 5.2 BIOHAZARD NEON RADIOATIVO (Raro)
  if (frame.id === 'frame_biohazard_toxic' || frame.id === 'frame_veneno_toxico') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-lime-500 via-emerald-600 to-slate-950 border border-lime-400 shadow-[0_0_16px_rgba(132,204,22,0.6)] ${className}`}>
        {showOrnaments && (
          <>
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
              <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-lime-300 shadow-[0_0_8px_#84cc16] animate-[biohazard-bubble-float_2s_infinite]" />
              <span className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-lime-200 shadow-[0_0_6px_#bef264] animate-[biohazard-bubble-float_2.5s_infinite_1s]" />
            </div>
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] filter drop-shadow-[0_0_6px_#84cc16] z-20">☣️</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 5.3 ARENA DE FERRO & AÇO LUSITANO (Raro)
  if (frame.id === 'frame_gladiador_ferro' || frame.id === 'frame_sangue_gladiador') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-red-800 via-stone-800 to-stone-950 border border-red-600 shadow-[0_0_16px_rgba(185,28,28,0.6)] ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_6px_#b91c1c] z-20">⚔️</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-[8px] text-red-400 z-20">🩸</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[8px] text-red-400 z-20">🩸</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 5.4 BRISA DAS CEREJEIRAS SAKURA (Raro)
  if (frame.id === 'frame_sakura_zen') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-100 border border-pink-300 shadow-[0_0_14px_rgba(244,114,182,0.6)] ${className}`}>
        {showOrnaments && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
            <span className="absolute top-1 left-2 text-[9px] animate-[sakura-petal-fall_3.5s_infinite_linear]">🌸</span>
            <span className="absolute top-2 right-2 text-[8px] animate-[sakura-petal-fall_4s_infinite_linear_1.5s]">🌸</span>
          </div>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. VIP COLLECTION 2.0 — ROYAL IDENTITIES (MOLDURAS ANIMADAS)
  // =========================================================================

  // 6.1 COROA DO IMPÉRIO (Mítico)
  if (frame.id === 'AP-VIP-FRAME-001' || frame.id === 'vip_frame_001') {
    return (
      <div className={`relative w-full h-full p-[4px] rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-300 to-rose-600 border-2 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.85)] animate-pulse ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 text-[14px] filter drop-shadow-[0_0_10px_#f59e0b] z-20">👑</span>
            <span className="pointer-events-none absolute -bottom-1.5 -left-1 text-[9px] text-amber-300 filter drop-shadow-[0_0_5px_#f59e0b] z-20">⚜️</span>
            <span className="pointer-events-none absolute -bottom-1.5 -right-1 text-[9px] text-amber-300 filter drop-shadow-[0_0_5px_#f59e0b] z-20">⚜️</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[12px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 6.2 PORTUGAL DE OURO (Lendário)
  if (frame.id === 'AP-VIP-FRAME-002' || frame.id === 'vip_frame_002') {
    return (
      <div className={`relative w-full h-full p-[3.5px] rounded-2xl bg-gradient-to-b from-yellow-400 via-emerald-500 to-amber-500 border border-yellow-300 shadow-[0_0_24px_rgba(234,179,8,0.75)] ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#eab308] z-20">🇵🇹</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-[9px] text-yellow-300 z-20">✨</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[9px] text-yellow-300 z-20">✨</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[12px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 6.3 TRONO CELESTIAL (Lendário)
  if (frame.id === 'AP-VIP-FRAME-003' || frame.id === 'vip_frame_003') {
    return (
      <div className={`relative w-full h-full p-[3.5px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-400 to-sky-400 border border-indigo-300 shadow-[0_0_22px_rgba(129,140,248,0.7)] ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#818cf8] z-20">🌌</span>
            <span className="pointer-events-none absolute top-1 -right-1 text-[8px] text-purple-300 animate-spin z-20">✦</span>
            <span className="pointer-events-none absolute -bottom-1 left-1 text-[8px] text-sky-300 z-20">✦</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[12px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 6.4 DIAMANTE LUSITANO (Épico)
  if (frame.id === 'AP-VIP-FRAME-004' || frame.id === 'vip_frame_004' || frame.id === 'vip_frame_005') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-tr from-cyan-100 via-sky-300 to-indigo-200 border-2 border-white shadow-[0_0_20px_rgba(224,242,254,0.8)] ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#ffffff] z-20">💎</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[9px] text-white z-20">💠</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 6.5 FOGO DO CAMPEÃO (Épico)
  if (frame.id === 'AP-VIP-FRAME-005' || frame.id === 'vip_frame_006') {
    return (
      <div className={`relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-b from-red-600 via-amber-500 to-yellow-400 border border-orange-400 shadow-[0_0_18px_rgba(239,68,68,0.7)] animate-pulse ${className}`}>
        {showOrnaments && (
          <>
            <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] filter drop-shadow-[0_0_8px_#ef4444] z-20">🔥</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-[8px] text-amber-300 z-20">💥</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-[8px] text-amber-300 z-20">💥</span>
          </>
        )}
        <div className="relative z-10 w-full h-full bg-slate-950 rounded-[13px] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Fallback seguro caso seja um ID desconhecido
  return (
    <div className={`relative w-full h-full p-[3px] rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] ${className}`}>
      <div className="relative z-10 w-full h-full rounded-[13px] overflow-hidden bg-slate-950">
        {children}
      </div>
    </div>
  );
}

export default AnimatedFrameWrapper;

