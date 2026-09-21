'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AppBackground } from '@/components/AppBackground'
import { DailyVaultView } from '@/components/vault/DailyVaultView'
import { GlobalBackButton } from '@/components/navigation/GlobalBackButton'
import { useAuth } from '@/components/auth-provider'
import { ShieldCheck, Flame, Gift, Clock, Sparkles } from 'lucide-react'

export default function CofrePage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user && profile?.lastVaultOpenedAt) {
      const elapsed = Date.now() - profile.lastVaultOpenedAt
      if (elapsed < 24 * 60 * 60 * 1000) {
        router.replace('/')
      }
    }
  }, [user, profile, router])

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-transparent text-foreground flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <AppBackground />

      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        {/* Barra Superior Global */}
        <SiteHeader />

        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col items-center w-full px-4 py-6 sm:py-8 max-w-4xl mx-auto">
          {/* Botão Voltar */}
          <div className="w-full flex items-center justify-start mb-4">
            <GlobalBackButton showAlways={true} fallbackUrl="/" variant="standalone" />
          </div>

          {/* Experiência Principal do Cofre Diário */}
          <DailyVaultView />

          {/* Secção Explicativa / Regras Canónicas de Segurança */}
          <section className="w-full mt-10 p-6 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-xl backdrop-blur-xl">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Como Funciona o Cofre Diário</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                  <Clock className="w-4 h-4" />
                  <span>1 Cofre a cada 24 Horas</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  O tempo é validado exclusivamente pelo servidor em formato rolling. O cofre desbloqueia exatamente 24 horas após a tua última abertura.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-orange-400 font-bold mb-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Sequência de Dias (Streak)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Volta entre 24h e 48h para manter a sequência ativa. O teu recorde histórico nunca diminui.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
                  <Gift className="w-4 h-4" />
                  <span>Recompensas Oficiais</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Recebe Acordas diretamente na tua carteira ou unidades das 3 ajudas oficiais (50/50, Congelar Tempo 15s ou Pergunta ao Público).
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Rodapé de Navegação */}
        <SiteFooter />
      </div>
    </div>
  )
}
