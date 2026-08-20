'use client'

import React, { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Trophy,
  Coins,
  Swords,
  Laugh,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  categoryTone?: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'O que é o Acorda Portugal?',
    answer:
      'É o maior videojogo de trivia nacional em tempo real, onde testas a tua cultura geral, representas o teu distrito natal ou de residência e competes contra jogadores de todo o país para levar a tua região ao topo da tabela.',
    icon: Sparkles,
    badge: 'Conceito',
    categoryTone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'faq-2',
    question: 'Como funciona a pontuação distrital e o Ranking?',
    answer:
      'Cada pergunta acertada nos modos a solo ou duelos concede pontos de experiência (XP). Os pontos acumulados por todos os jogadores de um mesmo distrito somam para a classificação distrital coletiva, determinando qual é o distrito líder no mapa de Portugal.',
    icon: Trophy,
    badge: 'Rankings',
    categoryTone: 'text-gold bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'faq-3',
    question: 'O que são e para que servem as moedas "€ Acorda"?',
    answer:
      'O Saldo € Acorda é a moeda virtual ganha através de vitórias em Duelos 1v1, desafios diários e conquistas. Pode ser usada na Loja para desbloquear títulos exclusivos, avatares personalizados e vantagens cosméticas de perfil.',
    icon: Coins,
    badge: 'Economia',
    categoryTone: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'faq-4',
    question: 'Como funcionam os Duelos 1v1 em Direto?',
    answer:
      'No modo 1v1 enfrentas um jogador real num confronto de 10 perguntas simultâneas com tempo limite de 60 segundos por ronda. Quem acertar mais rápido e com maior precisão leva o bónus máximo de XP e moedas.',
    icon: Swords,
    badge: 'Multiplayer',
    categoryTone: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'faq-5',
    question: 'O que é o "Modo Maluco"?',
    answer:
      'É o nosso modo especial focado no humor e rasteiras tipicamente portuguesas: raciocínio absurdo, piadas da cultura popular e perguntas sem filtros para testar a tua rapidez mental fora da caixa.',
    icon: Laugh,
    badge: 'Humor',
    categoryTone: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'faq-6',
    question: 'Preciso de pagar para jogar?',
    answer:
      'Não. O jogo é 100% gratuito. Basta criares a tua conta (ou entrar via Google) e começar a jogar imediatamente no PC ou no telemóvel.',
    icon: ShieldCheck,
    badge: 'Gratuito',
    categoryTone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
]

export function FAQSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true, // Primeiro item aberto por defeito
  })

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <section id="faq" className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Glow Ambient Layer */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-full max-w-4xl rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12)_0%,_rgba(147,51,234,0.1)_50%,_transparent_75%)] blur-3xl" />

      {/* Header Badge & Title */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-xl">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>Central de Ajuda</span>
        </div>

        <h2 className="mt-4 font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          Dúvidas Frequentes —{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
            Como Funciona o Desafio?
          </span>
        </h2>

        <p className="mt-3 max-w-2xl text-pretty text-sm sm:text-base text-muted-foreground font-medium">
          Tudo o que precisas de saber sobre o funcionamento do jogo, rankings territoriais, duelos e recompensas.
        </p>
      </div>

      {/* Accordion List */}
      <div className="mt-8 sm:mt-12 space-y-3.5">
        {FAQ_ITEMS.map((item) => {
          const isOpen = !!openIds[item.id]
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className={cn(
                'group overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-md',
                isOpen
                  ? 'border-emerald-500/40 bg-gradient-to-b from-white/[0.08] to-black/60 shadow-[0_4px_25px_rgba(16,185,129,0.15)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60',
              )}
            >
              {/* Question Trigger Button */}
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer select-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors duration-300',
                      item.categoryTone || 'border-white/10 bg-white/5 text-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <span className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-300 transition-colors">
                      {item.question}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                  <div
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-transform duration-300',
                      isOpen && 'rotate-180 bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Collapsible Answer Body */}
              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs sm:text-sm leading-relaxed text-muted-foreground/90 font-medium">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
