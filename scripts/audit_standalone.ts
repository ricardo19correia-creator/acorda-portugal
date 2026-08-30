import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE",
  authDomain: "desafio-nacional-5fe71.firebaseapp.com",
  projectId: "desafio-nacional-5fe71",
  storageBucket: "desafio-nacional-5fe71.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "130539395859",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:130539395859:web:e3b8153477ae41d6fe98e6",
}

const app = initializeApp(firebaseConfig, 'audit-app-anon')
const auth = getAuth(app)
const db = getFirestore(app)

async function runAudit() {
  console.log('======================================================================')
  console.log('🇵🇹 ACORDA PORTUGAL — AUDITORIA COMPLETA DE POPULAÇÃO, XP E APK')
  console.log('======================================================================\n')

  // 1. AUDITORIA DA APK
  const apkPath = path.join(process.cwd(), 'public', 'downloads', 'acorda-portugal-release.apk')
  const androidApkPath = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')

  console.log('📦 --- AUDITORIA DA APK ---')
  if (fs.existsSync(apkPath)) {
    const stat = fs.statSync(apkPath)
    const buffer = fs.readFileSync(apkPath)
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    console.log(`[APK PUBLIC] Caminho: ${apkPath}`)
    console.log(`[APK PUBLIC] Tamanho: ${stat.size} bytes (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`)
    console.log(`[APK PUBLIC] SHA-256: ${sha256}`)
    console.log(`[APK PUBLIC] Válido > 0 bytes: ${stat.size > 0 ? 'SIM' : 'NÃO'}`)
  } else {
    console.error(`[APK PUBLIC] Ficheiro NÃO encontrado em ${apkPath}`)
  }

  if (fs.existsSync(androidApkPath)) {
    const stat = fs.statSync(androidApkPath)
    const buffer = fs.readFileSync(androidApkPath)
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    console.log(`[APK ANDROID] Caminho: ${androidApkPath}`)
    console.log(`[APK ANDROID] Tamanho: ${stat.size} bytes (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`)
    console.log(`[APK ANDROID] SHA-256: ${sha256}`)
  }

  // 2. AUDITORIA DE POPULAÇÃO FIRESTORE
  console.log('\n👥 --- AUDITORIA DE JOGADORES NO FIRESTORE ---')
  try {
    const userCred = await signInAnonymously(auth)
    console.log(`[AUTH] Sessão autenticada anónima para auditoria: ${userCred.user.uid}`)

    const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)))
    const publicProfilesSnap = await getDocs(query(collection(db, 'publicProfiles'), limit(500)))
    const botPlayersSnap = await getDocs(query(collection(db, 'botPlayers'), limit(500)))

    console.log(`[FIRESTORE] Total documentos em 'users': ${usersSnap.size}`)
    console.log(`[FIRESTORE] Total documentos em 'publicProfiles': ${publicProfilesSnap.size}`)
    console.log(`[FIRESTORE] Total documentos em 'botPlayers': ${botPlayersSnap.size}`)

    const humanXpList: { id: string; name: string; xp: number; level: number; district: string }[] = []
    publicProfilesSnap.docs.forEach((doc) => {
      const data = doc.data()
      const xp = typeof data.xp === 'number' ? data.xp : 0
      const level = typeof data.level === 'number' ? data.level : 1
      const name = data.displayName || data.name || doc.id
      const district = data.district || data.representedDistrict || 'Portugal'
      humanXpList.push({ id: doc.id, name, xp, level, district })
    })

    humanXpList.sort((a, b) => b.xp - a.xp)

    const humanCount = humanXpList.length
    const humanTopXp = humanCount > 0 ? humanXpList[0].xp : 0
    const humanTotalXp = humanXpList.reduce((acc, h) => acc + h.xp, 0)
    const humanAvgXp = humanCount > 0 ? Math.round(humanTotalXp / humanCount) : 0
    const humanMedianXp = humanCount > 0 ? humanXpList[Math.floor(humanCount / 2)].xp : 0

    console.log('\n--- ESTATÍSTICAS DOS JOGADORES HUMANOS ---')
    console.log(`Contagem de Humanos com Perfil: ${humanCount}`)
    console.log(`Maior XP Humano: ${humanTopXp} (${humanCount > 0 ? humanXpList[0].name : 'Nenhum'})`)
    console.log(`XP Médio Humano: ${humanAvgXp}`)
    console.log(`XP Mediano Humano: ${humanMedianXp}`)
    if (humanCount > 0) {
      console.log('Top 5 Humanos:')
      humanXpList.slice(0, 5).forEach((h, idx) => {
        console.log(`  ${idx + 1}. ${h.name} (${h.district}) — Nível ${h.level} | ${h.xp} XP`)
      })
    }

    // Bots em botPlayers
    const botXpList: { id: string; name: string; xp: number; level: number; district: string }[] = []
    botPlayersSnap.docs.forEach((doc) => {
      const data = doc.data()
      const xp = typeof data.xp === 'number' ? data.xp : 0
      const level = typeof data.level === 'number' ? data.level : 1
      const name = data.displayName || data.name || doc.id
      const district = data.district || 'Portugal'
      botXpList.push({ id: doc.id, name, xp, level, district })
    })

    botXpList.sort((a, b) => b.xp - a.xp)

    const botCount = botXpList.length
    const botTopXp = botCount > 0 ? botXpList[0].xp : 0
    const botTotalXp = botXpList.reduce((acc, b) => acc + b.xp, 0)
    const botAvgXp = botCount > 0 ? Math.round(botTotalXp / botCount) : 0
    const botMedianXp = botCount > 0 ? botXpList[Math.floor(botCount / 2)].xp : 0

    console.log('\n--- ESTATÍSTICAS DOS BOTS (ATUAL) ---')
    console.log(`Contagem de Bots no Firestore: ${botCount}`)
    console.log(`Maior XP Bot: ${botTopXp} (${botCount > 0 ? botXpList[0].name : 'Nenhum'})`)
    console.log(`XP Médio Bot: ${botAvgXp}`)
    console.log(`XP Mediano Bot: ${botMedianXp}`)
    if (botCount > 0) {
      console.log('Top 5 Bots Atuais:')
      botXpList.slice(0, 5).forEach((b, idx) => {
        console.log(`  ${idx + 1}. ${b.name} (${b.district}) — Nível ${b.level} | ${b.xp} XP`)
      })
    }

    console.log('\n--- TOTAIS CONSOLIDADOS ---')
    console.log(`População Total no Sistema: ${humanCount + botCount} (${humanCount} Humanos + ${botCount} Bots)`)

  } catch (error: any) {
    console.error('Erro na auditoria do Firestore:', error.message)
  }

  console.log('\n======================================================================')
  process.exit(0)
}

runAudit()
