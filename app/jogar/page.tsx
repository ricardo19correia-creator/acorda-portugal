'use client';

import React, { useState, useEffect } from 'react';
import { QuizPage } from '@/components/quiz/page';

export default function JogarPage() {
  // Fallback imediato para cyberpunk para garantir visual espetacular
  const [currentTheme, setCurrentTheme] = useState<string>('theme_arena_lisboa_cyber_free');

  useEffect(() => {
    try {
      const inv = localStorage.getItem('ap_user_inventory_v3') || localStorage.getItem('ap_equipped_items');
      if (inv) {
        const parsed = JSON.parse(inv);
        if (parsed.equippedTheme) setCurrentTheme(parsed.equippedTheme);
        else if (parsed.theme) setCurrentTheme(parsed.theme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#020512] overflow-x-hidden text-white">
      {/* ========================================================= */}
      {/* CENÁRIO VISUAL COMPLETO: ARENA LISBOA NEON 2088 CYBERPUNK */}
      {/* ========================================================= */}
      {currentTheme === 'theme_arena_lisboa_cyber_free' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* 1. Gradientes de Luz Neon de Fundo */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#020512_75%)]" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-cyan-500/20 blur-[130px] rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-fuchsia-600/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 left-5 w-[400px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full" />

          {/* 2. Feixes Laser Verticais Dinâmicos */}
          <div className="absolute left-[12%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute left-[30%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-fuchsia-500/40 to-transparent" />
          <div className="absolute right-[28%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent" />
          <div className="absolute right-[10%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent" />

          {/* 3. Grelha de Perspetiva 3D Futurista Néon */}
          <div className="absolute bottom-0 inset-x-0 h-80 [perspective:600px]">
            <div
              className="w-full h-[250%] origin-bottom bg-[linear-gradient(to_right,rgba(6,182,212,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.3)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"
              style={{ transform: 'rotateX(70deg) translateY(-15%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-transparent to-[#020512]" />
          </div>

          {/* 4. Silhueta Gráfica da Ponte 25 de Abril & Skyline de Lisboa */}
          <div className="absolute bottom-0 inset-x-0 h-52 flex items-end justify-center opacity-70">
            <svg viewBox="0 0 1200 300" className="w-full h-full text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]" fill="none" preserveAspectRatio="none">
              {/* Pilares da Ponte */}
              <path d="M 160,300 L 160,40 L 175,40 L 175,300" fill="#06b6d4" opacity="0.7" />
              <path d="M 440,300 L 440,40 L 455,40 L 455,300" fill="#06b6d4" opacity="0.7" />
              {/* Cabos de Suspensão */}
              <path d="M 0,180 Q 167,55 300,180 Q 447,55 600,180" stroke="#06b6d4" strokeWidth="3" opacity="0.85" />
              {/* Tabuleiro Vermelho Néon */}
              <line x1="0" y1="185" x2="600" y2="185" stroke="#f43f5e" strokeWidth="4" opacity="0.9" />
              {/* Skyline de Lisboa com Luzes */}
              <polygon points="640,300 640,150 660,130 680,150 680,300" fill="#3b82f6" opacity="0.5" />
              <polygon points="700,300 700,100 730,100 730,300" fill="#06b6d4" opacity="0.6" />
              <polygon points="750,300 750,180 770,160 790,180 790,300" fill="#a855f7" opacity="0.5" />
              <polygon points="810,300 810,80 825,50 840,80 840,300" fill="#ec4899" opacity="0.7" />
              <polygon points="860,300 860,130 900,130 900,300" fill="#06b6d4" opacity="0.5" />
              <polygon points="920,300 920,160 950,160 950,300" fill="#3b82f6" opacity="0.4" />
              <polygon points="970,300 970,110 1000,110 1000,300" fill="#8b5cf6" opacity="0.6" />
              <polygon points="1020,300 1020,190 1060,190 1060,300" fill="#06b6d4" opacity="0.4" />
            </svg>
          </div>

          {/* 5. Linha de Brilho do Rio Tejo */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-500/25 to-transparent blur-sm" />
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#06b6d4]" />
        </div>
      )}

      {/* ARENA TEMPLO DE OURO (VIP) */}
      {currentTheme === 'theme_arena_gold_temple' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#0c0802] overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#f59e0b_0%,transparent_65%)] opacity-25 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#d97706_0%,transparent_60%)] opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b18_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-amber-950/60 to-transparent border-t border-amber-500/20" />
        </div>
      )}

      {/* ARENA FOGO DOS AÇORES */}
      {currentTheme === 'theme_volcano_acores' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#120303] overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#ef4444_0%,transparent_65%)] opacity-35 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444415_1px,transparent_1px),linear-gradient(to_bottom,#ef444415_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-red-950/80 to-transparent border-t border-red-500/30" />
        </div>
      )}

      {/* ARENA NOITE DE FADO EM ALFAMA */}
      {currentTheme === 'theme_noite_fado' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#0b0514] overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#a855f7_0%,transparent_70%)] opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f710_1px,transparent_1px),linear-gradient(to_bottom,#a855f710_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-purple-950/60 to-transparent border-t border-purple-500/20" />
        </div>
      )}

      {/* ARENA MATRIZ CÓSMICA PORTUGUESA */}
      {currentTheme === 'theme_arena_cosmic_matrix' && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#070514] overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#8b5cf6_0%,transparent_70%)] opacity-30 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf612_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf612_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-indigo-950/70 to-transparent border-t border-indigo-500/30" />
        </div>
      )}

      {/* CONTEÚDO DO QUIZ COM Z-10 RELATIVO */}
      <div className="relative z-10 w-full bg-transparent">
        <QuizPage />
      </div>
    </main>
  );
}
