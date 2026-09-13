'use client'

import React from 'react'
import { Music, Disc3, Radio, Sparkles } from 'lucide-react'

const SONGS = [
  {
    title: 'ACORDA PORTUGAL — Terra que Fala',
    number: '01',
    theme: 'A voz da terra e o sentimento profundo das raízes',
    tag: 'Identidade & Origem',
    accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  {
    title: 'ACORDA PORTUGAL — Antes das Sete',
    number: '02',
    theme: 'O despertar matinal, o labor e a coragem do quotidiano',
    tag: 'Alma & Quotidiano',
    accent: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  {
    title: 'ACORDA PORTUGAL — Café por Fazer',
    number: '03',
    theme: 'A reflexão, a partilha e o início de uma nova conversa nacional',
    tag: 'União & Proximidade',
    accent: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  },
]

export function MusicalIdentitySection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Secção */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">
            <Radio className="h-3.5 w-3.5" />
            <span>05 ABRIL 2026 · REGISTO HISTÓRICO</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            A MARCA COMEÇA A GANHAR VOZ.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            A identidade do projeto começou também a ser construída através da música, da emoção e de uma linguagem própria.
          </p>

          <div className="mt-6 inline-block rounded-2xl border border-white/10 bg-zinc-950/70 px-6 py-3 backdrop-blur-xl shadow-lg">
            <p className="font-display text-base sm:text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-emerald-300">
              “Antes de existir o jogo, já existia uma identidade.”
            </p>
          </div>
        </div>

        {/* Apresentação Visual Elegante dos 3 Títulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SONGS.map((song) => (
            <div
              key={song.number}
              className="relative rounded-3xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-900/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${song.accent}`}>
                    <Music className="h-3 w-3" />
                    <span>{song.tag}</span>
                  </span>
                  <Disc3 className="h-6 w-6 text-zinc-500 group-hover:text-purple-400 group-hover:rotate-90 transition-all duration-500" />
                </div>

                <span className="font-mono text-xs font-black text-zinc-500">
                  FAIXA {song.number}
                </span>

                <h3 className="mt-2 font-display text-lg font-bold text-white leading-snug group-hover:text-purple-200 transition-colors">
                  {song.title}
                </h3>

                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  {song.theme}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>05.04.2026</span>
                <span className="inline-flex items-center gap-1 text-zinc-400">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Obra Canónica</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
