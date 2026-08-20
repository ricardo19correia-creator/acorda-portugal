'use client';

import React, { useState, useEffect } from 'react';
import { QuizPage } from '@/components/quiz/page';

export default function JogarPage() {
  const [activeTheme, setActiveTheme] = useState<string>('default_tron');

  useEffect(() => {
    try {
      const savedEquipped = localStorage.getItem('ap_equipped_items');
      if (savedEquipped) {
        const parsed = JSON.parse(savedEquipped);
        if (parsed.theme) setActiveTheme(parsed.theme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <main className="relative min-h-screen bg-transparent">
      {/* CAMADA DE FUNDO DINÂMICO DA ARENA */}
      {activeTheme === 'theme_arena_lisboa_cyber_free' && (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[#050811] overflow-hidden">
          {/* Silhueta Néon Ciano/Púrpura & Brilho Tejo */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#06b6d4_0%,transparent_60%)] opacity-30 animate-pulse" />
          <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-cyan-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {activeTheme === 'theme_arena_gold_temple' && (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[#0a0702] overflow-hidden">
          {/* Brilho Ouro Dourado 3D */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f59e0b_0%,transparent_65%)] opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b0d_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b0d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>
      )}

      {activeTheme === 'theme_volcano_acores' && (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[#0c0404] overflow-hidden">
          {/* Fogo & Lava */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#ef4444_0%,transparent_60%)] opacity-30 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef44440d_1px,transparent_1px),linear-gradient(to_bottom,#ef44440d_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>
      )}

      {activeTheme === 'theme_arena_cosmic_matrix' && (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[#070514] overflow-hidden">
          {/* Nebulosa Cósmica & Constelações */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#8b5cf6_0%,transparent_70%)] opacity-25 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf60d_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf60d_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {activeTheme === 'theme_noite_fado' && (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[#0d0714] overflow-hidden">
          {/* Noite de Fado em Alfama */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#a855f7_0%,transparent_60%)] opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f70d_1px,transparent_1px),linear-gradient(to_bottom,#a855f70d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>
      )}

      <QuizPage />
    </main>
  );
}
