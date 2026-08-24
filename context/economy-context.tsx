'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { doc, increment, onSnapshot, serverTimestamp, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

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
  const { user, profile } = useAuth()
  const [coins, setCoins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
      if (saved !== null && !isNaN(Number(saved))) {
        return Number(saved)
      }
    }
    return 100
  })
  const [isBalancePulsing, setIsBalancePulsing] = useState(false)

  const triggerPulse = useCallback(() => {
    setIsBalancePulsing(true)
    const timer = setTimeout(() => setIsBalancePulsing(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  // 1. Sincronizar com o perfil carregado
  useEffect(() => {
    if (profile) {
      const profileBalance =
        typeof profile.coins === 'number'
          ? profile.coins
          : typeof profile.euros === 'number'
            ? profile.euros
            : null

      if (profileBalance !== null && profileBalance !== coins) {
        setCoins(profileBalance)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_coins', String(profileBalance))
          localStorage.setItem('user_euros', String(profileBalance))
        }
      }
    }
  }, [profile])

  // 2. Subscrição em Tempo Real ao Firestore (users/{uid})
  useEffect(() => {
    if (!user?.uid) return

    let unsubscribe: (() => void) | undefined
    try {
      const userRef = doc(db, 'users', user.uid)
      unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          const firestoreBalance =
            typeof data.coins === 'number'
              ? data.coins
              : typeof data.euros === 'number'
                ? data.euros
                : null

          if (firestoreBalance !== null) {
            setCoins((current) => {
              if (current !== firestoreBalance) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('user_coins', String(firestoreBalance))
                  localStorage.setItem('user_euros', String(firestoreBalance))
                }
                return firestoreBalance
              }
              return current
            })
          }
        }
      })
    } catch (err) {
      console.warn('[ECONOMY] Erro na subscrição em tempo real:', err)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid])

  // 3. Ouvir eventos locais de atualização de saldo entre tabs / componentes
  useEffect(() => {
    const handleLocalBalanceUpdate = (e: Event) => {
      try {
        const customEvent = e as CustomEvent<{ coins?: number }>
        if (customEvent.detail && typeof customEvent.detail.coins === 'number') {
          setCoins(customEvent.detail.coins)
          triggerPulse()
        } else if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
          if (saved !== null && !isNaN(Number(saved))) {
            setCoins(Number(saved))
            triggerPulse()
          }
        }
      } catch (err) {
        console.warn('[ECONOMY] Erro ao sincronizar evento local:', err)
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

      const newBalance = coins + amount
      setCoins(newBalance)
      triggerPulse()

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_coins', String(newBalance))
        localStorage.setItem('user_euros', String(newBalance))
        window.dispatchEvent(
          new CustomEvent('balance_updated', {
            detail: { coins: newBalance, amount, reason, type: 'earn' },
          }),
        )
      }

      if (auth.currentUser) {
        const uid = auth.currentUser.uid
        try {
          const userRef = doc(db, 'users', uid)
          await updateDoc(userRef, {
            coins: increment(amount),
            euros: increment(amount),
            lastBalanceUpdate: serverTimestamp(),
          })

          // Registo de transação na carteira
          try {
            await addDoc(collection(db, 'users', uid, 'walletTransactions'), {
              userId: uid,
              type: 'earn',
              amount,
              reason,
              createdAt: serverTimestamp(),
            })
          } catch (tErr) {
            console.warn('[ECONOMY] Aviso ao registar transação:', tErr)
          }
        } catch (err) {
          console.error('[ECONOMY] Erro ao atualizar saldo no Firestore:', err)
        }
      }

      return newBalance
    },
    [coins, triggerPulse],
  )

  // Função para debitar moedas (€ Acorda)
  const deductCoins = useCallback(
    async (amount: number, reason = 'Compra na Loja'): Promise<boolean> => {
      if (amount <= 0) return true
      if (coins < amount) {
        return false
      }

      const newBalance = coins - amount
      setCoins(newBalance)
      triggerPulse()

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_coins', String(newBalance))
        localStorage.setItem('user_euros', String(newBalance))
        window.dispatchEvent(
          new CustomEvent('balance_updated', {
            detail: { coins: newBalance, amount, reason, type: 'spend' },
          }),
        )
      }

      if (auth.currentUser) {
        const uid = auth.currentUser.uid
        try {
          const userRef = doc(db, 'users', uid)
          await updateDoc(userRef, {
            coins: increment(-amount),
            euros: increment(-amount),
            lastBalanceUpdate: serverTimestamp(),
          })

          // Registo de transação na carteira
          try {
            await addDoc(collection(db, 'users', uid, 'walletTransactions'), {
              userId: uid,
              type: 'spend',
              amount,
              reason,
              createdAt: serverTimestamp(),
            })
          } catch (tErr) {
            console.warn('[ECONOMY] Aviso ao registar transação:', tErr)
          }
        } catch (err) {
          console.error('[ECONOMY] Erro ao debitar saldo no Firestore:', err)
        }
      }

      return true
    },
    [coins, triggerPulse],
  )

  // Recarregar saldo
  const refreshBalance = useCallback(async (): Promise<number> => {
    if (auth.currentUser) {
      try {
        const { getDoc } = await import('firebase/firestore')
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          const data = snap.data()
          const b =
            typeof data.coins === 'number'
              ? data.coins
              : typeof data.euros === 'number'
                ? data.euros
                : coins
          setCoins(b)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_coins', String(b))
            localStorage.setItem('user_euros', String(b))
          }
          return b
        }
      } catch (e) {
        console.warn('[ECONOMY] Erro ao recarregar saldo:', e)
      }
    }
    return coins
  }, [coins])

  const formattedCoins = useMemo(() => {
    return new Intl.NumberFormat('pt-PT').format(coins)
  }, [coins])

  const value = useMemo(
    () => ({
      coins,
      formattedCoins,
      isBalancePulsing,
      addCoins,
      deductCoins,
      refreshBalance,
    }),
    [coins, formattedCoins, isBalancePulsing, addCoins, deductCoins, refreshBalance],
  )

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>
}

export function useEconomy(): EconomyContextType {
  const context = useContext(EconomyContext)
  if (!context) {
    throw new Error('useEconomy deve ser utilizado dentro de um EconomyProvider')
  }
  return context
}
