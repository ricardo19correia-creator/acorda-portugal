import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  Gamepad2,
  Trophy,
  Swords,
  MapPin,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LayoutGrid,
  Users,
  Compass,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Desafio Nacional — O Jogo Oficial de Portugal | Acorda Portugal',
  description:
    'Apresentação do Desafio Nacional: o jogo de perguntas, cultura, história e território de Portugal. Joga solo, compete em duelos 1v1 e conquista o teu distrito.',
  alternates: {
    canonical: 'https://acordaportugal.pt/desafio-nacional',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/desafio-nacional',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Desafio Nacional — O Jogo Oficial de Portugal | Acorda Portugal',
    description:
      'Apresentação do Desafio Nacional: o jogo de perguntas, cultura, história e território de Portugal. Joga solo, compete em duelos 1v1 e conquista o teu distrito.',
  },
}

export default function DesafioNacionalPage() {
  const MODES = [
    {
      title: 'Modo Clássico Nacional',
      tag: 'Conhecimento Solo',
      desc: 'Mais de 10.000 perguntas verificadas sobre a história, geografia, literatura, ciência e património de Portugal.',
      icon: Gamepad2,
      link: '/jogar',
      btnText: 'Jogar Solo',
      accent: 'emerald',
    },
    {
      title: 'Duelos 1v1 em Direto',
      tag: 'Competição em Tempo Real',
      desc: 'Enfrenta outros cidadãos em tempo real numa partida rápida de reflexos e conhecimento. Mostra quem sabe mais.',
      icon: Swords,
      link: '/jogar/duelo',
      btnText: 'Entrar em Duelo',
      accent: 'amber',
    },
    {
      title: 'Conquista do Distrito',
      tag: 'Guerra Territorial',
      desc: 'Defende o teu distrito de residência ou nascimento. Cada resposta certa soma pontos à tabela do teu território.',
      icon: MapPin,
      link: '/meu-distrito',
      btnText: 'O Meu Distrito',
      accent: 'emerald',
    },
    {
      title: 'Cofre Diário & Avatares',
      tag: 'Progressão & Recompensas',
      desc: 'Abre o cofre diário secreto, acumula moedas € Acorda e desbloqueia avatares de figuras históricas e ilustres portugueses.',
      icon: Lock,
      link: '/cofre',
      btnText: 'Abrir Cofre',
      accent: 'amber',
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#070d19] text-white flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Luzes de fundo elegantes */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-600/15 via-[#0b2545]/20 to-transparent blur-3xl -z-10" />

      {/* Cabeçalho */}
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        
        {/* Hero do Desafio Nacional */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/15 border border-amber-500/40 text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>INICIATIVA CULTURAL DE LITERACIA NACIONAL</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            Acorda Portugal:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Desafio Nacional
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            O jogo de perguntas e cultura que junta todo o país. Uma plataforma interativa de promoção da língua, da história, da geografia e das tradições de Portugal.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/jogar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-emerald-950/50 hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Jogar Agora no Desafio Nacional</span>
            </Link>

            <Link
              href="/rankings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 hover:bg-slate-800 text-white px-6 py-4 text-sm font-bold transition-all cursor-pointer backdrop-blur-md"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ver Tabela de Rankings</span>
            </Link>
          </div>
        </div>

        {/* Pilares dos Modos de Jogo */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Modos de Jogo & Experiência
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Conheça as várias formas de participar e testar o seu conhecimento sobre Portugal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODES.map((mode, i) => {
              const Icon = mode.icon
              const isEmerald = mode.accent === 'emerald'
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          isEmerald
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {mode.tag}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-black uppercase text-white tracking-tight">
                      {mode.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {mode.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href={mode.link}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>{mode.btnText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Informação sobre Perguntas e Rigor */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#091e33] to-slate-950 p-6 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Base de Dados Auditada</span>
            </div>
            <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
              Milhares de perguntas verificadas
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Todas as perguntas do Desafio Nacional são elaboradas e revistas com base em fontes históricas credíveis, manuais de referência, documentos autárquicos e registos patrimoniais. Não existem perguntas aleatórias ou sem valor cultural.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/categorias"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-5 py-3 text-xs font-bold transition-all"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Ver Categorias</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-xs font-bold transition-all"
            >
              <span>Voltar à Página Institucional</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Rodapé */}
      <SiteFooter />
    </div>
  )
}
