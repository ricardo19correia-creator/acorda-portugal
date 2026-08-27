import { collection, getDocs, doc, writeBatch, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateBotsPoolV2 } from './bot-generator'

let hasSyncedClientSide = false

/**
 * Garante que a rede de 125 bots (5 ativos imediatamente + restantes na curva de 24h)
 * está devidamente inicializada no Firestore.
 */
export async function ensureBotsInitializedClientSide(): Promise<void> {
  if (hasSyncedClientSide || typeof window === 'undefined') return
  hasSyncedClientSide = true

  try {
    const botsRef = collection(db, 'botPlayers')
    const snap = await getDocs(query(botsRef, limit(10)))

    if (snap.size < 5) {
      console.log('[BOT NETWORK V2] A inicializar 125 bots com identidades autênticas no Firestore...')
      const { publicRecords, privateRecords } = generateBotsPoolV2(125)

      // Gravação em lotes (batch) de 250 para botPlayers
      for (let i = 0; i < publicRecords.length; i += 250) {
        const batch = writeBatch(db)
        const slice = publicRecords.slice(i, i + 250)

        slice.forEach((b) => {
          const bRef = doc(db, 'botPlayers', b.id)
          batch.set(bRef, b)
        })

        await batch.commit()
      }

      // Gravação de botPlayersPrivate
      try {
        for (let i = 0; i < privateRecords.length; i += 250) {
          const batch = writeBatch(db)
          const slice = privateRecords.slice(i, i + 250)

          slice.forEach((priv) => {
            const privRef = doc(db, 'botPlayersPrivate', priv.id)
            batch.set(privRef, priv)
          })

          await batch.commit()
        }
      } catch (privErr) {
        console.warn('[BOT NETWORK V2] Gravação privada restrita por regras:', privErr)
      }

      console.log('[BOT NETWORK V2] 125 bots inicializados com sucesso!')
    }
  } catch (err) {
    console.warn('[BOT NETWORK V2] Erro ao sincronizar bots no cliente:', err)
  }
}
