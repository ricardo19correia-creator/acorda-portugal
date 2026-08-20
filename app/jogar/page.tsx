'use client';

import React, { useState, useEffect } from 'react';
import { QuizPage } from '@/components/quiz/page';

export default function JogarPage() {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    try {
      const equipped = JSON.parse(localStorage.getItem('ap_equipped_items') || '{}');
      if (equipped.theme) setCurrentTheme(equipped.theme);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <main
      className={`min-h-screen relative w-full overflow-x-hidden text-zinc-100 transition-colors duration-500 ${
        currentTheme === 'theme_arena_lisboa_cyber_free'
          ? 'bg-[#030712]' // Azul ultra escuro Cyberpunk
          : currentTheme === 'theme_arena_gold_temple'
          ? 'bg-[#0a0702]' // Ouro negro
          : currentTheme === 'theme_volcano_acores'
          ? 'bg-[#0f0404]' // Lava rubi
          : currentTheme === 'theme_arena_cosmic_matrix'
          ? 'bg-[#070514]' // Cósmico
          : currentTheme === 'theme_noite_fado'
          ? 'bg-[#0d0714]' // Fado Alfama
          : 'bg-[#050706]' // Padrão
      }`}
    >
      {/* EFEITO VISUAL DINÂMICO DE ACORDO COM O TEMA */}
      {currentTheme === 'theme_arena_lisboa_cyber_free' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(6,182,212,0.25),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-cyan-950/40 to-transparent" />
        </div>
      )}

      {currentTheme === 'theme_arena_gold_temple' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>
      )}

      {currentTheme === 'theme_volcano_acores' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(239,68,68,0.25),transparent_60%)] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>
      )}

      {currentTheme === 'theme_arena_cosmic_matrix' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2),transparent_70%)] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {currentTheme === 'theme_noite_fado' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>
      )}

      {/* CONTEÚDO DO QUIZ (com z-10 relativo para ficar à frente do fundo) */}
      <div className="relative z-10 w-full bg-transparent">
        <QuizPage />
      </div>
    </main>
  );
}
