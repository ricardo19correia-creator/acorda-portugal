'use client'

import { useEffect, useState } from 'react'
import {
  Coins,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Info,
  X,
  Calendar,
} from 'lucide-react'
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import type { WalletTransaction } from '@/lib/economy'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function WalletModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all')

  const balance = profile?.euros ?? 0

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!user?.uid || !open) return

    setLoading(true)
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: WalletTransaction[] = []
        snapshot.forEach((docSnap) => {
          const d = docSnap.data()
          list.push({
            id: docSnap.id,
            userId: d.userId,
            type: d.type || (d.amount >= 0 ? 'earn' : 'spend'),
            amount: d.amount,
            reason: d.reason || 'Transação de jogo',
            itemId: d.itemId,
            matchId: d.matchId,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
          })
        })
        setTransactions(list)
        setLoading(false)
      },
      (err) => {
        console.warn('Erro ao carregar transações da carteira:', err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid, open])

  if (!open) return null

  const filtered = transactions.filter((t) => {
    if (filter === 'earn') return t.amount > 0
    if (filter === 'spend') return t.amount < 0
    return true
  })

  const totalEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, curr) => acc + curr.amount, 0),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-4xl border border-white/10 bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col z-10 animate-rise">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with balance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gold/20 via-card/90 to-primary/15 p-6 sm:p-8 border-b border-white/10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/20 blur-3xl" />
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-gold ring-2 ring-gold/40 shadow-lg">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold">
                  Carteira Oficial
                </p>
                <h2 className="font-display text-xl font-black text-foreground">
                  Euros Acorda
                </h2>
              </div>
            </div>

            <Link
              href="/loja"
              onClick={() => onOpenChange(false)}
              className="hidden sm:flex items-center gap-2 rounded-2xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Ir para a Loja</span>
            </Link>
          </div>

          {/* Large Balance Display */}
          <div className="mt-6 text-center">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Saldo Disponível
            </p>
            <p className="mt-1 font-display text-4xl sm:text-5xl font-black text-gold-gradient tracking-tight">
              €{balance.toLocaleString('pt-PT')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">€ Acorda (Moeda Virtual)</p>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                Total Ganho
              </span>
              <p className="mt-0.5 font-display text-base font-black text-primary">
                +€{totalEarned.toLocaleString('pt-PT')}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                Total Gasto
              </span>
              <p className="mt-0.5 font-display text-base font-black text-flag-red">
                -€{totalSpent.toLocaleString('pt-PT')}
              </p>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-gold/[0.05] border-b border-gold/10 px-6 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 text-gold" />
          <span>Moeda virtual sem valor monetário real. Não pode ser convertida nem levantada.</span>
        </div>

        {/* Transaction History Section */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between pb-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Histórico de Transações
            </h3>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-bold transition cursor-pointer',
                  filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFilter('earn')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-bold transition cursor-pointer',
                  filter === 'earn' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Ganhos (+)
              </button>
              <button
                type="button"
                onClick={() => setFilter('spend')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-bold transition cursor-pointer',
                  filter === 'spend' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Gastos (-)
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[260px] pr-1 scrollbar-thin">
            {loading && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Sparkles className="mx-auto h-6 w-6 animate-spin text-primary mb-2" />
                A carregar transações...
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                <Coins className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-bold text-foreground">Sem transações registadas</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Conclui partidas ou missões para começares a ganhar € Acorda!
                </p>
              </div>
            )}

            {!loading &&
              filtered.map((t) => {
                const isEarn = t.amount > 0
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold',
                          isEarn
                            ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                            : 'bg-flag-red/20 text-flag-red ring-1 ring-flag-red/40',
                        )}
                      >
                        {isEarn ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">{t.reason}</p>
                        <p className="text-[0.62rem] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t.createdAt?.toLocaleDateString ? t.createdAt.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recentemente'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-display text-sm font-black">
                      <span className={isEarn ? 'text-primary' : 'text-flag-red'}>
                        {isEarn ? `+€${t.amount.toLocaleString('pt-PT')}` : `-€${Math.abs(t.amount).toLocaleString('pt-PT')}`}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
