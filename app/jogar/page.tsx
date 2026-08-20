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
        <div className="fixed inset-0 -z-20 bg-[#020512] overflow-hidden pointer-events-none">
          {/* Feixes laser e néon ciano no horizonte */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#06b6d4_0%,transparent_60%)] opacity-40 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#3b82f6_0%,transparent_50%)] opacity-20" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-cyan-950/70 via-cyan-900/20 to-transparent border-t border-cyan-500/30" />
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
