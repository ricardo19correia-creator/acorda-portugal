'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Smartphone,
  Download,
  ShieldCheck,
  CheckCircle2,
  Gamepad2,
  Trophy,
  Sparkles,
  Swords,
  Flame,
  Star,
  ShoppingBag,
  BarChart3,
  Award,
  Layers,
  ArrowRight,
  Laptop,
  Apple,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AppBackground } from '@/components/AppBackground'

const APK_DOWNLOAD_URL = '/downloads/acorda-portugal-release.apk'
const APK_FILE_NAME = 'acorda-portugal-release.apk'

const FEATURE_CARDS = [
  {
    icon: '🏆',
    title: 'Compete',
    description: 'Testa os teus conhecimentos e prova que és o melhor no Desafio Nacional.',
    accent: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
  },
  {
    icon: '⚡',
    title: 'Ganha XP',
    description: 'Joga perguntas autênticas, ganha experiência e sobe de nível.',
    accent: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
  },
  {
    icon: '🪙',
    title: 'Conquista moedas',
    description: 'Acumula moedas € Acorda em jogo para personalizar o teu perfil.',
    accent: 'border-yellow-500/40 bg-yellow-950/20 text-yellow-400',
  },
  {
    icon: '🎯',
    title: 'Completa missões',
    description: 'Cumpre objetivos diários e desafios temáticos para receber bónus.',
    accent: 'border-rose-500/40 bg-rose-950/20 text-rose-400',
  },
  {
    icon: '🏅',
    title: 'Desbloqueia conquistas',
    description: 'Conquista medalhas e títulos honoríficos exclusivos de Portugal.',
    accent: 'border-purple-500/40 bg-purple-950/20 text-purple-400',
  },
  {
    icon: '⚔️',
    title: 'Entra em duelos',
    description: 'Desafia outros jogadores em confrontos 1v1 em tempo real.',
    accent: 'border-orange-500/40 bg-orange-950/20 text-orange-400',
  },
  {
    icon: '📊',
    title: 'Sobe no ranking',
    description: 'Alcança o topo dos rankings distritais e nacionais.',
    accent: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
  },
  {
    icon: '🇵🇹',
    title: 'Explora 43 arenas',
    description: 'Descobre todas as 43 arenas temáticas com efeitos visuais autênticos.',
    accent: 'border-teal-500/40 bg-teal-950/20 text-teal-400',
  },
]

const SHOWCASE_ARENAS = [
  {
    name: 'Praça da Liberdade',
    location: 'Porto',
    image: '/arenas/praca-liberdade.jpg',
    tag: 'Arena Oficial',
  },
  {
    name: 'Torre de Belém',
    location: 'Lisboa',
    image: '/arenas/torre-belem.jpg',
    tag: 'Monumento Nacional',
  },
  {
    name: 'Castelo de Óbidos',
    location: 'Leiria',
    image: '/arenas/castelo-obidos.jpg',
    tag: 'História Medieval',
  },
  {
    name: 'Lisboa Cybercore 2077',
    location: 'Futuro Luso',
    image: '/arenas/lisboa-cybercore.jpg',
    tag: 'Cyberpunk',
  },
  {
    name: 'Conquista da Seleção',
    location: 'Glória Lusitana',
    image: '/arenas/conquista-selecao.jpg',
    tag: 'Futebol & Emoção',
  },
  {
    name: 'Taberna de Fado Vadio',
    location: 'Alfama',
    image: '/arenas/fado-alfama.jpg',
    tag: 'Cultura & Alma',
  },
]

const INSTALL_STEPS = [
  {
    num: '01',
    title: 'Descarrega o APK',
    desc: 'Carrega no botão principal de download para transferir o ficheiro.',
  },
  {
    num: '02',
    title: 'Abre o ficheiro no teu Android',
    desc: 'Acede às notificações de transferência ou à pasta de Downloads do teu telemóvel.',
  },
  {
    num: '03',
    title: 'Segue as instruções apresentadas',
    desc: 'Autoriza a instalação da aplicação caso o Android solicite permissão para esta fonte.',
  },
  {
    num: '04',
    title: 'Instala a aplicação',
    desc: 'Confirma em "Instalar" e aguarda a conclusão da instalação no sistema.',
  },
  {
    num: '05',
    title: 'Abre o Acorda Portugal',
    desc: 'Acede ao ícone do Acorda Portugal no teu ecrã inicial.',
  },
  {
    num: '06',
    title: 'Começa a jogar',
    desc: 'Inicia sessão na tua conta e entra imediatamente no Desafio Nacional!',
  },
]

export default function DownloadPage() {
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop'>('android')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || ''
      if (/android/i.test(ua)) {
        setDeviceType('android')
      } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
        setDeviceType('ios')
      } else {
        setDeviceType('desktop')
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* 1. FUNDO GLOBAL OFICIAL */}
      <AppBackground />
      <SiteHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 z-10">
        
        {/* ========================================================================= */}
        {/* HERO SECTION — LANÇAMENTO OFICIAL                                         */}
        {/* ========================================================================= */}
        <section className="text-center flex flex-col items-center justify-center space-y-6 pt-2 sm:pt-8">
          
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-950/60 backdrop-blur-md">
            <span className="text-base">🇵🇹</span>
            <span>ACORDA PORTUGAL — DESAFIO NACIONAL</span>
          </div>

          {/* Títulos Principais */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-[1.15]">
              O DESAFIO NACIONAL
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                ESTÁ NO TEU ANDROID
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 font-medium max-w-xl mx-auto leading-relaxed pt-1">
              A aplicação oficial do Acorda Portugal está pronta para levar o desafio contigo.
              Joga, compete, sobe no ranking e conquista o teu lugar.
            </p>
          </div>

          {/* MENSAGEM DINÂMICA DE DISPOSITIVO */}
          {deviceType === 'ios' && (
            <div className="w-full max-w-lg p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-left flex items-start gap-3 backdrop-blur-md">
              <Apple className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-black text-amber-300">📱 DISPONÍVEL PARA ANDROID</p>
                <p className="text-slate-300 leading-relaxed">
                  A aplicação Android está disponível para download. A versão iOS será disponibilizada futuramente. Entretanto, podes continuar a jogar na Web.
                </p>
              </div>
            </div>
          )}

          {deviceType === 'desktop' && (
            <div className="w-full max-w-lg p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-300 backdrop-blur-md">
              <span className="font-bold text-emerald-400">📱 Queres jogar no telemóvel?</span> Descarrega o APK Android abaixo ou joga diretamente no teu navegador.
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOTÃO PRINCIPAL DE DOWNLOAD (ELEMENTO MAIS IMPORTANTE DA PÁGINA)           */}
          {/* ========================================================================= */}
          <div className="w-full max-w-md flex flex-col items-center gap-3 pt-2">
            <a
              href={APK_DOWNLOAD_URL}
              download={APK_FILE_NAME}
              className="group relative w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_55px_rgba(16,185,129,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-emerald-400/50"
            >
              <Smartphone className="w-7 h-7 sm:w-8 h-8 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>📱 DESCARREGAR APK</span>
              <Download className="w-6 h-6 flex-shrink-0 ml-1 group-hover:translate-y-0.5 transition-transform" />
            </a>

            {/* Informações Oficiais e Badges de Confiança */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-300 font-bold">
              <span>Android</span>
              <span>•</span>
              <span className="text-emerald-400 font-black">v1.0.0</span>
              <span>•</span>
              <span>124,41 MB</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium pt-1">
              <span className="flex items-center gap-1 text-emerald-400/90 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Versão oficial Android
              </span>
              <span className="flex items-center gap-1 text-emerald-400/90 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Acorda Portugal — Desafio Nacional
              </span>
            </div>

            {/* CTA Secundário para Jogar na Web */}
            <div className="pt-3 w-full">
              <Link
                href="/jogar"
                className="w-full py-3 px-6 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-slate-700/80 transition shadow-md"
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>🌐 JOGAR NA WEB</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* GALERIA VISUAL DO JOGO & ARENAS OFICIAIS                                    */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-24 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Explora as 43 Arenas Oficiais
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Palcos fotográficos autênticos que representam a alma, a história e o futuro de Portugal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SHOWCASE_ARENAS.map((arena, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg hover:border-emerald-500/50 hover:shadow-emerald-950/50 transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={arena.image}
                    alt={arena.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-black/70 border border-white/10 text-[10px] font-black uppercase tracking-wider text-emerald-400 backdrop-blur-md">
                    {arena.tag}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base group-hover:text-emerald-300 transition-colors">
                      {arena.name}
                    </h3>
                    <p className="text-xs text-slate-400">{arena.location}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">🇵🇹</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECÇÃO "O DESAFIO NACIONAL" — O QUE TE ESPERA                              */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-24 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              O DESAFIO NACIONAL
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Funcionalidades completas concebidas para competição e conhecimento de Portugal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 flex flex-col space-y-2.5 transition-all duration-300 hover:-translate-y-1 shadow-md"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-slate-950 border border-slate-800">
                  {feat.icon}
                </div>
                <h3 className="font-black text-white text-base tracking-wide">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECÇÃO "COMO INSTALAR" (6 PASSOS CLAROS E SIMPLES)                         */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-24 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              COMO INSTALAR
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Passos simples para começar a jogar no teu Android
            </p>
          </div>

          <div className="space-y-3">
            {INSTALL_STEPS.map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800/90"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                  {step.num}
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-sm sm:text-base">{step.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEGUNDA ZONA DE DOWNLOAD DESTACADA & CALL TO ACTION FINAL                   */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-emerald-400">
              PRONTO PARA JOGAR?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              🇵🇹 ESTÁS PRONTO?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              O Desafio Nacional começa agora. Descarrega o Acorda Portugal e entra no desafio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <a
              href={APK_DOWNLOAD_URL}
              download={APK_FILE_NAME}
              className="w-full sm:w-auto py-4 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Smartphone className="w-5 h-5" />
              <span>📱 DESCARREGAR APK</span>
            </a>

            <Link
              href="/jogar"
              className="w-full sm:w-auto py-4 px-8 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-base flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Gamepad2 className="w-5 h-5 text-amber-400" />
              <span>🌐 JOGAR NA WEB</span>
            </Link>
          </div>

          <div className="text-xs text-slate-400 pt-2 relative z-10">
            Acorda Portugal — Desafio Nacional • Android • Versão 1.0.0 • 124,41 MB
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
