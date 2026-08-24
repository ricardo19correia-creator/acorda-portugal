'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import {
  CheckCircle2,
  Coins,
  Sparkles,
  Shield,
  ArrowRight,
  ShoppingBag,
  User,
  Gamepad2,
  AlertCircle,
  Loader2,
  Receipt,
} from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const productId = searchParams.get('product_id')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Identificador de sessão Stripe não encontrado.')
      setLoading(false)
      return
    }

    async function verify() {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId || '')}`)
        const json = await res.json()

        if (!res.ok || !json.success) {
          setError(json.message || 'Falha ao verificar pagamento com o servidor.')
        } else if (!json.paid) {
          setError('O pagamento ainda não foi confirmado pela entidade bancária.')
        } else {
          setData(json)
        }
      } catch (err: any) {
        setError(err?.message || 'Erro de comunicação com o servidor.')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [sessionId])

  return (
    <main className="flex-1 pb-20 pt-8 sm:pt-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {loading && (
          <div className="overflow-hidden rounded-4xl border border-white/10 bg-card/70 p-12 text-center backdrop-blur-2xl shadow-2xl">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-6 font-display text-2xl font-black text-foreground">
              A Confirmar Pagamento...
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos a validar o pagamento com o Stripe e a entregar os teus itens na conta.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="overflow-hidden rounded-4xl border border-flag-red/30 bg-card/70 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-2xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-flag-red/20 text-flag-red">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-black text-foreground">
              Verificação Incompleta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {error}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/loja"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/15 transition"
              >
                <ShoppingBag className="h-4 w-4" />
                Voltar à Loja
              </Link>
            </div>
          </div>
        )}

        {!loading && data && data.paid && (
          <div className="overflow-hidden rounded-4xl border border-primary/30 bg-gradient-to-b from-primary/15 via-card/80 to-card/90 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-2xl animate-scale-in">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary/20 text-primary ring-4 ring-primary/30 shadow-xl shadow-primary/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary border border-primary/40">
              <Sparkles className="h-3.5 w-3.5" />
              Pagamento Confirmado
            </span>

            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Compra Concluída com Sucesso!
            </h1>

            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Obrigado pelo teu apoio ao Acorda Portugal. O teu pacote foi processado e o conteúdo já está disponível na tua conta.
            </p>

            {/* Receipt Summary Box */}
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-left text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-primary" />
                  Produto Adquirido
                </span>
                <span className="font-display text-sm font-black text-foreground">
                  {data.product?.name}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Valor Pago:</span>
                  <span className="font-bold text-foreground">{data.product?.priceFormatted}</span>
                </div>
                {data.transactionId && (
                  <div className="flex justify-between">
                    <span>ID da Transação:</span>
                    <span className="font-mono text-[0.68rem] text-muted-foreground/80 truncate max-w-[200px]">
                      {data.transactionId}
                    </span>
                  </div>
                )}
                {data.customerEmail && (
                  <div className="flex justify-between">
                    <span>Recibo enviado para:</span>
                    <span className="font-bold text-foreground">{data.customerEmail}</span>
                  </div>
                )}
              </div>

              {/* Delivered Rewards list */}
              {data.product?.reward && (
                <div className="mt-5 rounded-2xl bg-primary/10 border border-primary/20 p-4">
                  <p className="font-bold text-primary text-[0.72rem] uppercase tracking-wider mb-2">
                    Recompensas Entregues no Perfil:
                  </p>
                  <ul className="space-y-1.5 text-xs text-foreground font-semibold">
                    {data.product.reward.euros > 0 && (
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-gold" />
                        <span>+€{data.product.reward.euros.toLocaleString('pt-PT')} Euros Acorda</span>
                      </li>
                    )}
                    {data.product.reward.xp > 0 && (
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>+{data.product.reward.xp} XP de Nível</span>
                      </li>
                    )}
                    {data.product.reward.isFounder && (
                      <li className="flex items-center gap-2 text-amber-300">
                        <Shield className="h-4 w-4 text-amber-400" />
                        <span>Estatuto Fundador (+25% XP e Moedas Vitalício)</span>
                      </li>
                    )}
                    {data.product.reward.authorLicense && (
                      <li className="flex items-center gap-2 text-purple-300">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>Licença de Autor de Perguntas Ativada</span>
                      </li>
                    )}
                    {data.product.reward.vipPass && (
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span>Passe Patriota VIP Ativado</span>
                      </li>
                    )}
                    {data.product.reward.badge && (
                      <li className="flex items-center gap-2 text-gold">
                        <Sparkles className="h-4 w-4 text-gold" />
                        <span>Distintivo Exclusivo: «{data.product.reward.badge}»</span>
                      </li>
                    )}
                    {data.product.reward.items && (
                      <li className="text-[0.72rem] text-muted-foreground pt-1 border-t border-white/10">
                        {Object.entries(data.product.reward.items).map(([itemId, qty]) => (
                          <span key={itemId} className="block text-foreground font-semibold">
                            • {String(qty)}x {itemId.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/perfil"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 transition"
              >
                <User className="h-4 w-4" />
                Ver no Meu Perfil
              </Link>
              <Link
                href="/jogar"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/10 transition"
              >
                <Gamepad2 className="h-4 w-4 text-gold" />
                Jogar Agora
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ShopSuccessPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between">
      <BackgroundFx />
      <SiteHeader />
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
      <SiteFooter />
    </div>
  )
}
