'use client';

import React, { useState, useEffect } from 'react';
import { QuizPage } from '@/components/quiz/page';
import { getInventory } from '@/lib/inventory';

export default function JogarPage() {
  const [theme, setTheme] = useState('default_tron');

  useEffect(() => {
    const sync = () => {
      setTheme(getInventory().equippedTheme || 'default_tron');
    };
    sync();
    window.addEventListener('inventory_updated', sync);
    return () => window.removeEventListener('inventory_updated', sync);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-transparent overflow-x-hidden text-zinc-100">
      {/* 1. ARENA LISBOA NEON 2088 (CYBERPUNK) */}
      {theme === 'theme_arena_lisboa_cyber_free' && (
        <div className="fixed inset-0 -z-10 bg-[#030712] overflow-hidden pointer-events-none select-none">
          {/* 1. Céu Néon Gradiente & Nebulosa */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#030712_70%)]" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute top-1/4 right-10 w-[400px] h-[300px] bg-fuchsia-600/15 blur-[100px] rounded-full pointer-events-none" />

          {/* 2. Feixes de Luz Laser Verticais Cibernéticos */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse" />
            <div className="absolute left-[35%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent opacity-60" />
            <div className="absolute right-[25%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent animate-pulse" />
            <div className="absolute right-[10%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-50" />
          </div>

          {/* 3. Grelha de Perspetiva 3D Futurista no Chão */}
          <div className="absolute bottom-0 inset-x-0 h-64 [perspective:500px] overflow-hidden">
            <div
              className="w-full h-[200%] origin-bottom bg-[linear-gradient(to_right,rgba(6,182,212,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.25)_1px,transparent_1px)] bg-[size:3rem_3rem]"
              style={{ transform: 'rotateX(65deg) translateY(-20%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]" />
          </div>

          {/* 4. Silhueta Gráfica SVG da Ponte 25 de Abril & Skyline de Lisboa em Néon */}
          <div className="absolute bottom-0 inset-x-0 h-48 opacity-45 flex items-end justify-center">
            <svg viewBox="0 0 1200 300" className="w-full h-full text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" fill="none" preserveAspectRatio="none">
              {/* Pilares e Cabos da Ponte */}
              <path d="M 150,300 L 150,50 L 160,50 L 160,300" fill="currentColor" opacity="0.6" />
              <path d="M 450,300 L 450,50 L 460,50 L 460,300" fill="currentColor" opacity="0.6" />
              <path d="M 0,180 Q 155,70 300,180 Q 455,70 600,180" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
              <line x1="0" y1="185" x2="600" y2="185" stroke="#f43f5e" strokeWidth="3" opacity="0.9" />

              {/* Skyline Futurista de Prédios e Monumentos */}
              <polygon points="650,300 650,160 670,140 690,160 690,300" fill="#3b82f6" opacity="0.4" />
              <polygon points="710,300 710,110 740,110 740,300" fill="#06b6d4" opacity="0.5" />
              <polygon points="760,300 760,190 780,170 800,190 800,300" fill="#a855f7" opacity="0.4" />
              <polygon points="820,300 820,90 835,60 850,90 850,300" fill="#ec4899" opacity="0.5" />
              <polygon points="870,300 870,140 910,140 910,300" fill="#06b6d4" opacity="0.4" />
              <polygon points="930,300 930,170 960,170 960,300" fill="#3b82f6" opacity="0.3" />
              <polygon points="980,300 980,120 1010,120 1010,300" fill="#8b5cf6" opacity="0.5" />
              <polygon points="1030,300 1030,200 1070,200 1070,300" fill="#06b6d4" opacity="0.3" />
            </svg>
          </div>

          {/* 5. Reflexos Néon da Água do Rio Tejo na Base */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-500/20 via-fuchsia-500/10 to-transparent blur-sm" />
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4]" />
        </div>
      )}

      {/* 2. ARENA TEMPLO DE OURO (IMPERIAL) */}
      {theme === 'theme_arena_gold_temple' && (
        <div className="fixed inset-0 -z-20 bg-[#0c0802] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#f59e0b_0%,transparent_65%)] opacity-25 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#d97706_0%,transparent_60%)] opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b18_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-amber-950/60 to-transparent border-t border-amber-500/20" />
        </div>
      )}

      {/* 3. ARENA FOGO DOS AÇORES / VULCÃO */}
      {theme === 'theme_volcano_acores' && (
        <div className="fixed inset-0 -z-20 bg-[#120303] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#ef4444_0%,transparent_65%)] opacity-35 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444415_1px,transparent_1px),linear-gradient(to_bottom,#ef444415_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-red-950/80 to-transparent border-t border-red-500/30" />
        </div>
      )}

      {/* 4. ARENA NOITE DE FADO EM ALFAMA */}
      {theme === 'theme_noite_fado' && (
        <div className="fixed inset-0 -z-20 bg-[#0b0514] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#a855f7_0%,transparent_70%)] opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f710_1px,transparent_1px),linear-gradient(to_bottom,#a855f710_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-purple-950/60 to-transparent border-t border-purple-500/20" />
        </div>
      )}

      {/* 5. ARENA MATRIZ CÓSMICA PORTUGUESA */}
      {theme === 'theme_arena_cosmic_matrix' && (
        <div className="fixed inset-0 -z-20 bg-[#070514] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#8b5cf6_0%,transparent_70%)] opacity-30 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf612_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf612_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-indigo-950/70 to-transparent border-t border-indigo-500/30" />
        </div>
      )}

      {/* 6. ARENA PADRÃO (TRON ESMERALDA) */}
      {(!theme || theme === 'default_tron') && (
        <div className="fixed inset-0 -z-20 bg-[#040906] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b981_0%,transparent_70%)] opacity-20" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {/* CONTEÚDO DO QUIZ */}
      <div className="relative z-10 w-full bg-transparent">
        <QuizPage />
      </div>
    </main>
  );
}
