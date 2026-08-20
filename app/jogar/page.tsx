'use client';

import React, { useState, useEffect } from 'react';
import { QuizPage } from '@/components/quiz/page';

export default function JogarPage() {
  // Fallback imediato para cyberpunk para garantir visual espetacular
  const [theme, setTheme] = useState<string>('theme_arena_lisboa_cyber_free');

  useEffect(() => {
    try {
      const inv = localStorage.getItem('ap_user_inventory_v3') || localStorage.getItem('ap_equipped_items');
      if (inv) {
        const parsed = JSON.parse(inv);
        if (parsed.equippedTheme) setTheme(parsed.equippedTheme);
        else if (parsed.theme) setTheme(parsed.theme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#020512] overflow-x-hidden text-white">
      {/* ========================================================= */}
      {/* CENÁRIO CINEMATOGRÁFICO VIVO E REALISTA */}
      {/* ========================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* 1. ARENA LISBOA CYBERPUNK / PONTE 25 DE ABRIL & TEJO */}
        {theme === 'theme_arena_lisboa_cyber_free' && (
          <div className="relative w-full h-full">
            {/* Imagem Cinematográfica com Movimento Lento 3D */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 animate-[pulse_8s_ease-in-out_infinite]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80')`,
                filter: 'brightness(0.38) contrast(1.2) saturate(1.4)',
              }}
            />
            {/* Atmosfera Cyberpunk Néon e Profundidade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-[#020512]/60 to-[#0b132b]/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18)_0%,transparent_75%)]" />
          </div>
        )}

        {/* 2. ARENA TEMPLO DOURADO / MOSTEIRO DOS JERÓNIMOS / PALÁCIO REAL */}
        {theme === 'theme_arena_gold_temple' && (
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 animate-[pulse_10s_ease-in-out_infinite]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=2000&q=80')`,
                filter: 'brightness(0.35) contrast(1.25) sepia(0.3)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0902] via-[#0d0902]/65 to-[#1c1204]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)]" />
          </div>
        )}

        {/* 3. ARENA VULCÃO / LAGOA DAS SETE CIDADES (AÇORES) */}
        {theme === 'theme_volcano_acores' && (
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
                filter: 'brightness(0.32) contrast(1.3)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140404] via-[#140404]/70 to-transparent" />
          </div>
        )}

        {/* 4. ARENA NOITE DE FADO EM ALFAMA */}
        {theme === 'theme_noite_fado' && (
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=2000&q=80')`,
                filter: 'brightness(0.32) contrast(1.2) hue-rotate(270deg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0514] via-[#0b0514]/70 to-transparent" />
          </div>
        )}

        {/* 5. ARENA MATRIZ CÓSMICA PORTUGUESA */}
        {theme === 'theme_arena_cosmic_matrix' && (
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 animate-[pulse_12s_ease-in-out_infinite]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=80')`,
                filter: 'brightness(0.35) contrast(1.25) saturate(1.3)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070514] via-[#070514]/70 to-transparent" />
          </div>
        )}

        {/* 6. PADRÃO / PORTO & RIBEIRA DO DOURO NOTURNA */}
        {(!theme || theme === 'default_tron') && (
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=2000&q=80')`,
                filter: 'brightness(0.30) contrast(1.15)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040807] via-[#040807]/75 to-transparent" />
          </div>
        )}

        {/* Vinheta de Foco Cinematográfico Suave */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
      </div>

      {/* CONTEÚDO DO QUIZ COM Z-10 RELATIVO */}
      <div className="relative z-10 w-full bg-transparent">
        <QuizPage />
      </div>
    </main>
  );
}
