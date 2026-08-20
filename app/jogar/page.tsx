'use client';

import React, { useState, useEffect } from 'react';
import { QuizPage } from '@/components/quiz/page';

export default function JogarPage() {
  const [equippedTheme, setEquippedTheme] = useState<string>('default_tron');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ap_equipped_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setEquippedTheme(parsed.theme);
      }
    } catch (e) {
      console.error('Erro ao ler tema:', e);
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-transparent overflow-x-hidden text-zinc-100">
      {/* 1. ARENA LISBOA NEON 2088 (CYBERPUNK AZUL / CIANO) */}
      {equippedTheme === 'theme_arena_lisboa_cyber_free' && (
        <div className="fixed inset-0 z-0 bg-[#020617] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.35),transparent_70%)] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-900/20 to-transparent" />
        </div>
      )}

      {/* 2. ARENA TEMPLO DOURADO REAL (OURO & ÂMBAR) */}
      {equippedTheme === 'theme_arena_gold_temple' && (
        <div className="fixed inset-0 z-0 bg-[#0c0a03] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.3),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,158,11,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,158,11,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>
      )}

      {/* 3. ARENA FOGO DOS AÇORES / VULCÃO (VERMELHO LAVA) */}
      {equippedTheme === 'theme_volcano_acores' && (
        <div className="fixed inset-0 z-0 bg-[#120303] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(239,68,68,0.35),transparent_65%)] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>
      )}

      {/* 4. ARENA NOITE DE FADO EM ALFAMA (ROXO & VELUDO) */}
      {equippedTheme === 'theme_noite_fado' && (
        <div className="fixed inset-0 z-0 bg-[#0b0514] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.25),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.06)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>
      )}

      {/* 5. ARENA MATRIZ CÓSMICA PORTUGUESA (NEBULOSA VIOLETA & CIANO) */}
      {equippedTheme === 'theme_arena_cosmic_matrix' && (
        <div className="fixed inset-0 z-0 bg-[#070514] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.3),transparent_70%)] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {/* 6. TEMA PADRÃO (TRON VERDE ESMERALDA) */}
      {(!equippedTheme || equippedTheme === 'default_tron') && (
        <div className="fixed inset-0 z-0 bg-[#050706] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {/* CONTEÚDO DO QUIZ */}
      <div className="relative z-10 w-full bg-transparent">
        <QuizPage />
      </div>
    </main>
  );
}
