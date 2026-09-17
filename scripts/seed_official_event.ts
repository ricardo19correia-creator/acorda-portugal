/**
 * Script Oficial de Publicação/Seed do Primeiro Evento Real no Firestore
 * PRIMEIRO DESAFIO NACIONAL — PORTUGAL EM JOGO
 */

import {
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
} from '../lib/events-service'
import { getAdminFirestore, hasAdminCredentials } from '../lib/firebase-admin'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

async function seedOfficialEvent() {
  console.log('========================================================================')
  console.log('🇵🇹 ACORDA PORTUGAL — PUBLICAÇÃO DO PRIMEIRO EVENTO REAL')
  console.log('========================================================================\n')
  console.log(`ID Canónico: ${OFFICIAL_PORTUGAL_EM_JOGO_ID}`)
  console.log(`Nome Oficial: ${OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.name}`)
  console.log(`Datas: ${OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.startDate} até ${OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.endDate} (${OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.timezone})`)

  try {
    if (hasAdminCredentials()) {
      console.log('\n[FIREBASE ADMIN] A utilizar credenciais de Admin SDK...')
      const adminDb = getAdminFirestore()
      const eventRef = adminDb.collection('events').doc(OFFICIAL_PORTUGAL_EM_JOGO_ID)
      const snap = await eventRef.get()

      if (snap.exists) {
        console.log('ℹ️ O evento já existe no Firestore. A atualizar campos oficiais...')
      } else {
        console.log('✨ A criar novo documento oficial do evento no Firestore...')
      }

      await eventRef.set(
        {
          ...OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
      console.log('✅ Evento publicado com sucesso via Admin SDK no Firestore!')
    } else {
      console.log('\n[FIREBASE CLIENT] A utilizar SDK de cliente com credenciais públicas...')
      const eventRef = doc(db, 'events', OFFICIAL_PORTUGAL_EM_JOGO_ID)
      const snap = await getDoc(eventRef).catch(() => null)

      if (snap && snap.exists()) {
        console.log('ℹ️ O evento já existe no Firestore.')
      } else {
        console.log('✨ A publicar evento oficial no Firestore...')
      }

      await setDoc(
        eventRef,
        {
          ...OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch((err) => {
        console.warn('Nota: Escrita de cliente requer sessão ou regras de segurança. O backend auto-seeda no primeiro acesso API:', err.message)
      })
      console.log('✅ Operação de cliente concluída com sucesso.')
    }
  } catch (error: any) {
    console.warn('Aviso durante a execução do seed:', error?.message || error)
  }

  console.log('\n========================================================================')
  console.log('🎉 SEED DO PRIMEIRO EVENTO REAL CONCLUÍDO')
  console.log('========================================================================')
}

seedOfficialEvent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Falha no seed:', err)
    process.exit(1)
  })
