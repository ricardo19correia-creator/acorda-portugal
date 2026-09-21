import path from 'path'
process.loadEnvFile(path.resolve('.env.local'))
import { getAdminFirestore, syncClockSkewIfAny } from '../lib/firebase-admin'

async function main() {
  await syncClockSkewIfAny()
  const db = getAdminFirestore()
  const eventRef = db.collection('events').doc('porto-lisboa-duelo')
  const snap = await eventRef.get()
  console.log('Event exists:', snap.exists)
  if (snap.exists) {
    console.log('Event data:', JSON.stringify(snap.data(), null, 2))
  }

  const parts = await eventRef.collection('participants').get()
  console.log('Participants count:', parts.size)
  parts.forEach((p) => console.log('Participant:', p.id, JSON.stringify(p.data())))

  const matches = await eventRef.collection('matches').get()
  console.log('Matches count:', matches.size)
  matches.forEach((m) => console.log('Match:', m.id, JSON.stringify(m.data())))
}

main().catch(console.error)
