import path from 'path'
process.loadEnvFile(path.resolve('.env.local'))
import { getAdminFirestore, syncClockSkewIfAny } from '../lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
} from '../lib/events-service'

async function resetPortoLisboaEvent() {
  console.log('========================================================')
  console.log('🔥 RESET TOTAL DO EVENTO: PORTO ⚔️ LISBOA — O GRANDE DUELO')
  console.log('========================================================\n')

  await syncClockSkewIfAny()
  const db = getAdminFirestore()
  const eventRef = db.collection('events').doc(OFFICIAL_PORTO_LISBOA_ID)

  // 1. Apagar todas as partidas jogadas no evento
  console.log('1. A remover partidas da subcoleção "matches"...')
  const matchesSnap = await eventRef.collection('matches').get()
  let deletedMatches = 0
  const matchBatch = db.batch()
  matchesSnap.forEach((doc) => {
    matchBatch.delete(doc.ref)
    deletedMatches++
  })
  if (deletedMatches > 0) {
    await matchBatch.commit()
  }
  console.log(`   -> ${deletedMatches} partidas removidas.`)

  // 2. Apagar todos os participantes do evento
  console.log('2. A remover participantes da subcoleção "participants"...')
  const participantsSnap = await eventRef.collection('participants').get()
  let deletedParticipants = 0
  const participantBatch = db.batch()
  const participantUserIds: string[] = []

  participantsSnap.forEach((doc) => {
    participantBatch.delete(doc.ref)
    participantUserIds.push(doc.id)
    deletedParticipants++
  })
  if (deletedParticipants > 0) {
    await participantBatch.commit()
  }
  console.log(`   -> ${deletedParticipants} participantes removidos.`)

  // 3. Apagar eventuais registos de recompensas
  console.log('3. A remover eventuais subcoleções "rewards_claimed" / "rewards_awarded"...')
  const rewardsClaimedSnap = await eventRef.collection('rewards_claimed').get().catch(() => null)
  if (rewardsClaimedSnap && !rewardsClaimedSnap.empty) {
    const rewBatch = db.batch()
    rewardsClaimedSnap.forEach((doc) => rewBatch.delete(doc.ref))
    await rewBatch.commit()
    console.log(`   -> ${rewardsClaimedSnap.size} recompensas removidas.`)
  }

  // 4. Limpar dados do evento nos utilizadores participantes (sem apagar as contas nem dados globais)
  console.log('4. A limpar registos específicos do evento nos utilizadores...')
  let usersCleaned = 0
  for (const uid of participantUserIds) {
    try {
      const userRef = db.collection('users').doc(uid)
      await userRef.update({
        [`events.${OFFICIAL_PORTO_LISBOA_ID}`]: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      usersCleaned++
    } catch (e: any) {
      console.warn(`   Aviso ao limpar user ${uid}:`, e?.message || e)
    }
  }
  console.log(`   -> ${usersCleaned} contas de utilizador limpas do evento.`)

  // 5. Resetar documento principal do evento com mapa aninhado 'teams' e contadores a ZERO
  console.log('5. A inicializar o documento oficial do evento limpo a zeros...')
  const initialTeams = {
    porto: {
      id: 'porto',
      name: 'Equipa Porto',
      shortName: 'Porto',
      city: 'Porto',
      club: 'FC Porto',
      color: 'blue',
      points: 0,
      playerCount: 0,
      matchesPlayed: 0,
      description: 'Porto + FC Porto • A força, o pulsar cívico e a glória europeia da Invicta.',
      motto: 'Representa o Norte. Entra no duelo.',
    },
    lisboa: {
      id: 'lisboa',
      name: 'Equipa Lisboa',
      shortName: 'Lisboa',
      city: 'Lisboa',
      club: 'SL Benfica',
      color: 'red',
      points: 0,
      playerCount: 0,
      matchesPlayed: 0,
      description: 'Lisboa + SL Benfica • O património milenar, a história pombalina e a tradição da Capital.',
      motto: 'Representa a Capital. Entra no duelo.',
    },
  }

  const cleanEventDoc = {
    id: OFFICIAL_PORTO_LISBOA_ID,
    name: 'PORTO ⚔️ LISBOA — O GRANDE DUELO',
    title: 'PORTO ⚔️ LISBOA',
    subtitle: 'O GRANDE DUELO',
    tag: 'Grande Duelo',
    type: 'Grande Duelo',
    theme: 'Porto, Lisboa, FC Porto, SL Benfica e Confrontos Diretos',
    description:
      'Dois territórios. Dois gigantes. Um desafio. O confronto supremo de conhecimento exclusivo entre a Invicta e a Capital, FC Porto e SL Benfica. Perguntas de alta dificuldade para verdadeiros especialistas.',
    startDate: '2026-09-20T00:00:00+01:00',
    endDate: '2026-10-31T23:59:59+01:00',
    startAt: '2026-09-20T00:00:00+01:00',
    endAt: '2026-10-31T23:59:59+01:00',
    timezone: 'Europe/Lisbon',
    published: true,
    active: true,
    enabled: true,
    dailyMatchLimit: 10,
    rules: {
      maxDailyMatches: 10,
      pointDivisor: 1,
      maxEventPointsPerMatch: 3000,
    },
    scoring: {
      pointDivisor: 1,
      maxEventPointsPerMatch: 3000,
    },
    teams: initialTeams,
    totalParticipants: 0,
    totalMatches: 0,
    totalPoints: 0,
    rewards: OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.rewards,
    rewardsDistributed: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  // set sem merge para eliminar completamente propriedades achatadas antigas ("teams.porto.points", etc.)
  await eventRef.set(cleanEventDoc)

  console.log('✅ RESET TOTAL CONCLUÍDO COM SUCESSO!')
  console.log('   - Participantes: 0')
  console.log('   - Partidas: 0')
  console.log('   - Pontos Porto: 0')
  console.log('   - Pontos Lisboa: 0')
  console.log('   - Jogadores Porto: 0')
  console.log('   - Jogadores Lisboa: 0')
}

resetPortoLisboaEvent().catch((err) => {
  console.error('❌ Erro no reset do evento:', err)
  process.exit(1)
})
