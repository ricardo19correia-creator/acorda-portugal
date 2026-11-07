'use client'

import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Trophy,
  Swords,
  MapPin,
  Sparkles,
  ArrowRight,
  Gamepad2,
  CheckCircle2,
} from 'lucide-react'

export function InstitutionalDesafioSecundario() {
  return (
    <section id="desafio-nacional" className="relative w-full py-16 sm:py-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cartão de Apresentação Secundária */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-[#071527]/90 to-slate-950 p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Luz de destaque dourada e verde muito discreta */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-10" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Esquerda: Conteúdo Editorial */}
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <BookOpen className="w-3.5 h-3.5" />
                <span>INICIATIVA CULTURAL & LITERACIA CÍVICA</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight leading-tight">
                O Desafio Nacional:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-300">
                  Conhecer para valorizar Portugal
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Como componente cultural da nossa missão cívica, desenvolvemos o <strong>Desafio Nacional</strong>: uma plataforma pedagógica de perguntas e respostas documentadas sobre a história, a geografia, a língua, as artes e o património do nosso país.
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Acreditamos que a defesa da soberania e da democracia começa no conhecimento das nossas raízes. Milhares de perguntas verificadas convidam os cidadãos a competir de forma saudável pelo seu distrito e a aprender diariamente sobre Portugal.
              </p>

              {/* Três Pilares da Iniciativa Cultural */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Territorial</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">Conquista cultural de cada um dos 18 distritos e ilhas.</p>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Literacia</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">Perguntas rigorosas de história, cultura e ciência.</p>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase">
                    <Swords className="w-3.5 h-3.5" />
                    <span>Duelos Cívicos</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">Desafios amigáveis de conhecimento em tempo real.</p>
                </div>
              </div>

              {/* Botões Discretos de Acesso */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/desafio-nacional"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Apresentação do Desafio Nacional</span>
                </Link>

                <Link
                  href="/jogar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-5 py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  <span>Aceder à Plataforma de Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Direita: Cartão Representativo Nobre */}
            <div className="w-full lg:w-80 rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  PORTUGAL EM JOGO
                </span>
                <h3 className="font-display text-lg font-black uppercase text-white">
                  Desafio Nacional
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A plataforma de literacia que une o país em torno do conhecimento da nossa história e território.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Acesso Gratuito e Aberto a Todos</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
