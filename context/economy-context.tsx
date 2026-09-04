'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import {
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  addDoc,
  collection,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

import { extractUserCoins, safeSyncLog } from '@/lib/economy-helpers'

export interface EconomyContextType {
  coins: number
  formattedCoins: string
  isBalancePulsing: boolean
  addCoins: (amount: number, reason?: string) => Promise<number>
  deductCoins: (amount: number, reason?: string) => Promise<boolean>
  refreshBalance: () => Promise<number>
}

const EconomyContext = createContext<EconomyContextType | null>(null)

export function EconomyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [coins, setCoins] = useState<number>(0)
  const [isBalancePulsing, setIsBalancePulsing] = useState(false)

  // Leitura segura de localStorage exclusivamente dentro de useEffect (elimina Hydration Mismatch #418)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
        if (saved && !isNaN(Number(saved))) {
          setCoins(Number(saved))
        }
      }
    } catch (err) {
      console.warn('[EconomyProvider] Erro ao carregar moedas locais:', err)
    }
  }, [])

  const triggerPulse = useCallback(() => {
    setIsBalancePulsing(true)
    const timer = setTimeout(() => setIsBalancePulsing(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  // 1. Subscrição em Tempo Real ao Firestore (users/{uid})
  useEffect(() => {
    if (!user?.uid) {
      return
    }

    let unsubscribe: (() => void) | undefined
    try {
      const userRef = doc(db, 'users', user.uid)
      unsubscribe = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            const firestoreBalance = extractUserCoins(data)

            safeSyncLog('ECONOMY_SNAPSHOT', {
              uid: user.uid,
              coins: firestoreBalance,
              fromCache: snapshot.metadata.fromCache,
            })

            setCoins((prev) => {
              if (prev !== firestoreBalance) {
                triggerPulse()
              }
              return firestoreBalance
            })

            if (typeof window !== 'undefined') {
              localStorage.setItem('user_coins', String(firestoreBalance))
              localStorage.setItem('user_euros', String(firestoreBalance))
              window.dispatchEvent(
                new CustomEvent('balance_updated', {
                  detail: { coins: firestoreBalance, source: 'firestore_snapshot' },
                }),
              )
            }
          }
        },
        (err) => {
          console.warn('[ECONOMY] Aviso transitório no listener de saldo:', err)
        },
      )
    } catch (err) {
      console.warn('[ECONOMY] Erro ao subscrever listener de saldo:', err)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid, triggerPulse])

  // 2. Ouvir eventos de sincronização local entre abas
  useEffect(() => {
    const handleLocalBalanceUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ coins?: number }>
      if (typeof customEvt.detail?.coins === 'number') {
        setCoins(customEvt.detail.coins)
        triggerPulse()
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
        if (saved && !isNaN(Number(saved))) {
          setCoins(Number(saved))
        }
      }
    }

    window.addEventListener('balance_updated', handleLocalBalanceUpdate)
    window.addEventListener('storage', handleLocalBalanceUpdate)

    return () => {
      window.removeEventListener('balance_updated', handleLocalBalanceUpdate)
      window.removeEventListener('storage', handleLocalBalanceUpdate)
    }
  }, [triggerPulse])

  // Função para adicionar moedas (€ Acorda)
  const addCoins = useCallback(
    async (amount: number, reason = 'Recompensa de Jogo'): Promise<number> => {
      if (amount <= 0) return coins

      let nextVal = coins + amount
      setCoins((prev) => {
        nextVal = prev + amount
        return nextVal
      })
      triggerPulse()

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_coins', String(nextVal))
        localStorage.setItem('user_euros', String(nextVal))
        window.dispatchEvent(
          new CustomEvent('balance_updated', {
            detail: { coins: nextVal, amount, reason, type: 'earn' },
          }),
        )
      }

      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid)
          await updateDoc(userRef, {
            coins: increment(amount),
            acordas: increment(amount),
            euros: increment(amount),
            moedas: increment(amount),
            updatedAt: serverTimestamp(),
          })

          try {
            await addDoc(collection(db, 'users', user.uid, 'walletTransactions'), {
              userId: user.uid,
              type: 'earn',
              amount,
              reason,
              createdAt: serverTimestamp(),
            })
          } catch (txErr) {
            console.warn('[ECONOMY] Aviso ao gravar walletTransactions:', txErr)
          }
        } catch (err) {
          console.error('[ECONOMY] Erro ao somar moedas no Firestore:', err)
        }
      }

      return nextVal
    },
    [coins, triggerPulse, user],
  )

  // Função para subtrair moedas (€ Acorda) após compras
  const deductCoins = useCallback(
    async (amount: number, reason = 'Compra na Loja'): Promise<boolean> => {
      if (amount <= 0) return true
      if (coins < amount) {
        return false
      }

      let nextVal = coins - amount
      setCoins((prev) => {
        nextVal = Math.max(0, prev - amount)
        return nextVal
      })
      triggerPulse()

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_coins', String(nextVal))
        localStorage.setItem('user_euros', String(nextVal))
        window.dispatchEvent(
          new CustomEvent('balance_updated', {
            detail: { coins: nextVal, amount, reason, type: 'spend' },
          }),
        )
      }

      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid)
          await updateDoc(userRef, {
            coins: increment(-amount),
            acordas: increment(-amount),
            euros: increment(-amount),
            moedas: increment(-amount),
            updatedAt: serverTimestamp(),
          })

          try {
            await addDoc(collection(db, 'users', user.uid, 'walletTransactions'), {
              userId: user.uid,
              type: 'spend',
              amount,
              reason,
              createdAt: serverTimestamp(),
            })
          } catch (txErr) {
            console.warn('[ECONOMY] Aviso ao gravar walletTransactions spend:', txErr)
          }
        } catch (err) {
          console.error('[ECONOMY] Erro ao debitar moedas no Firestore:', err)
        }
      }

      return true
    },
    [coins, triggerPulse, user],
  )

  const refreshBalance = useCallback(async (): Promise<number> => {
    if (user?.uid) {
      try {
        const { getDoc, getDocFromServer } = await import('firebase/firestore')
        let snap
        try {
          snap = await getDocFromServer(doc(db, 'users', user.uid))
        } catch {
          snap = await getDoc(doc(db, 'users', user.uid))
        }
        if (snap.exists()) {
          const data = snap.data()
          const b = extractUserCoins(data)
          setCoins(b)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_coins', String(b))
            localStorage.setItem('user_euros', String(b))
          }
          return b
        }
      } catch (e) {
        console.error('[ECONOMY] Erro ao atualizar saldo:', e)
      }
    }
    return coins
  }, [coins, user])

  const formattedCoins = useMemo(() => {
    return new Intl.NumberFormat('pt-PT').format(coins)
  }, [coins])

  return (
    <EconomyContext.Provider
      value={{
        coins,
        formattedCoins,
        isBalancePulsing,
        addCoins,
        deductCoins,
        refreshBalance,
      }}
    >
      {children}
    </EconomyContext.Provider>
  )
}

const fallbackEconomy: EconomyContextType = {
  coins: 0,
  formattedCoins: '0',
  isBalancePulsing: false,
  addCoins: async () => 0,
  deductCoins: async () => false,
  refreshBalance: async () => 0,
}

export function useEconomy(): EconomyContextType {
  const context = useContext(EconomyContext)
  return context || fallbackEconomy
}
