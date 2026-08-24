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
    return 0
  })
  const [isBalancePulsing, setIsBalancePulsing] = useState(false)

  const triggerPulse = useCallback(() => {
    setIsBalancePulsing(true)
    const timer = setTimeout(() => setIsBalancePulsing(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  // 1. Sincronizar com o perfil carregado em tempo real
  useEffect(() => {
    if (profile) {
      const profileBalance =
        typeof profile.coins === 'number'
          ? profile.coins
          : typeof profile.euros === 'number'
            ? profile.euros
            : 0

      if (profileBalance !== coins) {
        setCoins(profileBalance)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_coins', String(profileBalance))
          localStorage.setItem('user_euros', String(profileBalance))
        }
      }
    } else if (!user) {
      setCoins(0)
    }
  }, [profile, user])

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
                : 0

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

      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid)
          await updateDoc(userRef, {
            coins: increment(amount),
            euros: increment(amount),
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

      return newBalance
    },
    [coins, triggerPulse, user?.uid],
  )

  // Função para subtrair moedas (€ Acorda) após compras
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

      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid)
          await updateDoc(userRef, {
            coins: increment(-amount),
            euros: increment(-amount),
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
    [coins, triggerPulse, user?.uid],
  )

  const refreshBalance = useCallback(async (): Promise<number> => {
    if (user?.uid) {
      try {
        const { getDoc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const data = snap.data()
          const b = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : 0
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
  }, [coins, user?.uid])

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

export function useEconomy(): EconomyContextType {
  const context = useContext(EconomyContext)
  if (!context) {
    throw new Error('useEconomy deve ser utilizado dentro de um EconomyProvider.')
  }
  return context
}
