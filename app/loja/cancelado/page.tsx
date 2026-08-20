'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { XCircle, ShoppingBag, Gamepad2, ArrowLeft } from 'lucide-react'

function CancelContent() {
  return (
    <main className="flex-1 pb-20 pt-8 sm:pt-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="overflow-hidden rounded-4xl border border-white/10 bg-card/70 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-2xl animate-fade">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/5 text-muted-foreground ring-1 ring-white/10">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground border border-white/10">
            Pagamento Cancelado
          </span>

          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            Operação Não Concluída
          </h1>

          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Cancelaste o processo de pagamento. Nenhuma cobrança foi efetuada e os teus saldos permanecem inalterados.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/loja"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              Voltar à Loja
            </Link>
            <Link
              href="/jogar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/10 transition"
            >
              <Gamepad2 className="h-4 w-4" />
              Ir para o Jogo
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ShopCancelPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <BackgroundFx />
      <SiteHeader />
      <Suspense fallback={null}>
        <CancelContent />
      </Suspense>
      <SiteFooter />
    </div>
  )
}
