import { collection, getDocs, doc, writeBatch, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateBotsPool } from './bot-generator'

let hasSyncedClientSide = false

/**
 * Garante que a pool de 457 bots (157 ativos imediatamente + 300 nas próximas 15h)
 * está devidamente inicializada no Firestore do cliente.
 */
export async function ensureBotsInitializedClientSide(): Promise<void> {
  if (hasSyncedClientSide || typeof window === 'undefined') return
  hasSyncedClientSide = true

  try {
    const botsRef = collection(db, 'botPlayers')
    const snap = await getDocs(query(botsRef, limit(10)))

    if (snap.size < 5) {
      console.log('[BOT NETWORK] A inicializar 457 bots no Firestore do cliente...')
      const allBots = generateBotsPool(457, 157)

      // Gravação em lotes (batch) de 250
      for (let i = 0; i < allBots.length; i += 250) {
        const batch = writeBatch(db)
        const slice = allBots.slice(i, i + 250)

        slice.forEach((b) => {
          const bRef = doc(db, 'botPlayers', b.id)
          batch.set(bRef, b)
        })

        await batch.commit()
      }

      console.log('[BOT NETWORK] 457 bots inicializados com sucesso (157 ativos agora)!')
    }
  } catch (err) {
    console.warn('[BOT NETWORK] Erro ao sincronizar bots no cliente:', err)
  }
}
