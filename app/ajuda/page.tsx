'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FAQSection } from '@/components/faq-section'
import { BackgroundFx } from '@/components/background-fx'

export default function AjudaPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-foreground flex flex-col justify-between overflow-x-hidden">
      <BackgroundFx variant="default" />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Top navigation / Back button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Início</span>
            </Link>
          </div>

          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <HelpCircle className="h-4 w-4" />
              <span>Suporte &amp; Respostas</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
              Central de Ajuda
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium">
              Tudo o que precisas de saber sobre as regras, duelos 1v1, distritos, moedas e funcionamento do Acorda Portugal.
            </p>
          </div>

          {/* FAQ Accordion Section */}
          <FAQSection />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
