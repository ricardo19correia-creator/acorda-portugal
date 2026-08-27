import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export interface BotPlayerRecord {
  id: string
  name: string
  username: string
  avatar: string
  district: string
  level: number
  xp: number
  rating: number
  coins: number
  wins: number
  losses: number
  streak: number
  accuracyPercentage: number
  avgResponseTimeMs: number
  personality: 'CASUAL' | 'NORMAL' | 'COMPETITIVO' | 'ESPECIALISTA' | 'ELITE'
  difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL' | 'MESTRE'
  strongCategories: string[]
  weakCategories: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'IN_MATCH' | 'SUSPENDED' | 'RETIRED'
  isBot: true
  createdAt: any
  updatedAt?: any
}

const DEFAULT_BOT_SEEDS: Omit<BotPlayerRecord, 'id' | 'createdAt'>[] = [
  {
    name: 'Vasco_Desafio',
    username: 'vasco_luso',
    avatar: '/images/avatars/avatar_camões.png',
    district: 'Lisboa',
    level: 14,
    xp: 4200,
    rating: 1250,
    coins: 450,
    wins: 38,
    losses: 24,
    streak: 3,
    accuracyPercentage: 72,
    avgResponseTimeMs: 4200,
    personality: 'NORMAL',
    difficulty: 'MEDIO',
    strongCategories: ['historia', 'portugal', 'cultura'],
    weakCategories: ['ciencia-tecnologia'],
    status: 'ACTIVE',
    isBot: true,
  },
  {
    name: 'Mariana_Norte',
    username: 'mariana_porto',
    avatar: '/images/avatars/avatar_padeira.png',
    district: 'Porto',
    level: 22,
    xp: 9800,
    rating: 1480,
    coins: 1200,
    wins: 84,
    losses: 32,
    streak: 6,
    accuracyPercentage: 84,
    avgResponseTimeMs: 3100,
    personality: 'COMPETITIVO',
    difficulty: 'DIFICIL',
    strongCategories: ['futebol-portugues', 'gastronomia', 'geografia'],
    weakCategories: ['cinema-tv'],
    status: 'ACTIVE',
    isBot: true,
  },
  {
    name: 'Tiago_Minhoto',
    username: 'tiago_braga',
    avatar: '/images/avatars/avatar_ze_povinho.png',
    district: 'Braga',
    level: 8,
    xp: 1800,
    rating: 1050,
    coins: 200,
    wins: 14,
    losses: 18,
    streak: 1,
    accuracyPercentage: 58,
    avgResponseTimeMs: 6500,
    personality: 'CASUAL',
    difficulty: 'FACIL',
    strongCategories: ['humor', 'musica'],
    weakCategories: ['portugal-politico', 'historia'],
    status: 'ACTIVE',
    isBot: true,
  },
  {
    name: 'Inês_Coimbra',
    username: 'ines_sabedoria',
    avatar: '/images/avatars/avatar_d_afonso.png',
    district: 'Coimbra',
    level: 35,
    xp: 24500,
    rating: 1820,
    coins: 3400,
    wins: 192,
    losses: 41,
    streak: 11,
    accuracyPercentage: 92,
    avgResponseTimeMs: 2400,
    personality: 'ELITE',
    difficulty: 'MESTRE',
    strongCategories: ['portugal-politico', 'historia', 'ciencia-tecnologia', 'cultura'],
    weakCategories: [],
    status: 'ACTIVE',
    isBot: true,
  },
  {
    name: 'Duarte_Algarve',
    username: 'duarte_mar',
    avatar: '/images/avatars/avatar_galo.png',
    district: 'Faro',
    level: 18,
    xp: 6700,
    rating: 1340,
    coins: 890,
    wins: 52,
    losses: 29,
    streak: 4,
    accuracyPercentage: 76,
    avgResponseTimeMs: 3800,
    personality: 'ESPECIALISTA',
    difficulty: 'MEDIO',
    strongCategories: ['gastronomia', 'geografia', 'empresas-portuguesas'],
    weakCategories: ['musica'],
    status: 'ACTIVE',
    isBot: true,
  },
]

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const db = getAdminFirestore()
    const snap = await db.collection('botPlayers').get()

    // Se ainda não existirem bots no Firestore, inicializar seeds limpos
    if (snap.empty) {
      const batch = db.batch()
      const initialBots: BotPlayerRecord[] = []

      for (let i = 0; i < DEFAULT_BOT_SEEDS.length; i++) {
        const seed = DEFAULT_BOT_SEEDS[i]
        const botId = `BOT_${String(i + 1).padStart(4, '0')}`
        const docRef = db.collection('botPlayers').doc(botId)
        const botData: BotPlayerRecord = {
          ...seed,
          id: botId,
          isBot: true,
          createdAt: FieldValue.serverTimestamp(),
        }
        batch.set(docRef, botData)
        initialBots.push(botData)
      }

      await batch.commit()
      return NextResponse.json({ success: true, bots: initialBots })
    }

    const bots = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    return NextResponse.json({
      success: true,
      bots,
      totalCount: bots.length,
    })
  } catch (error: any) {
    console.error('[API ADMIN BOTS GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao obter bots.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, botId, botData, massStatus } = body

    const db = getAdminFirestore()

    // 1. Ação em massa (Ativar Todos / Desativar Todos)
    if (action === 'mass_status') {
      const targetStatus = massStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
      const snap = await db.collection('botPlayers').get()
      const batch = db.batch()

      snap.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          status: targetStatus,
          updatedAt: FieldValue.serverTimestamp(),
        })
      })

      await batch.commit()

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_MASS_STATUS_CHANGE',
        entity: 'BOT_POOL',
        entityId: 'ALL_BOTS',
        details: `Alterou o estado de todos os bots para: ${targetStatus}`,
        newValue: { status: targetStatus, totalAffected: snap.size },
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Todos os ${snap.size} bots foram atualizados para: ${targetStatus}`,
      })
    }

    // 2. Criar novo Bot
    if (action === 'create') {
      const newBotId = `BOT_${Date.now().toString().slice(-4)}`
      const newRecord: BotPlayerRecord = {
        id: newBotId,
        name: botData?.name || 'Desafiante_Virtual',
        username: botData?.username || `bot_${newBotId.toLowerCase()}`,
        avatar: botData?.avatar || '/images/avatars/avatar_galo.png',
        district: botData?.district || 'Lisboa',
        level: Number(botData?.level || 10),
        xp: Number(botData?.xp || 2000),
        rating: Number(botData?.rating || 1200),
        coins: Number(botData?.coins || 500),
        wins: 0,
        losses: 0,
        streak: 0,
        accuracyPercentage: Number(botData?.accuracyPercentage || 70),
        avgResponseTimeMs: Number(botData?.avgResponseTimeMs || 4000),
        personality: botData?.personality || 'NORMAL',
        difficulty: botData?.difficulty || 'MEDIO',
        strongCategories: botData?.strongCategories || ['portugal'],
        weakCategories: botData?.weakCategories || [],
        status: botData?.status || 'ACTIVE',
        isBot: true,
        createdAt: FieldValue.serverTimestamp(),
      }

      await db.collection('botPlayers').doc(newBotId).set(newRecord)

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_CREATED',
        entity: 'BOT',
        entityId: newBotId,
        details: `Criou novo bot: ${newRecord.name} (isBot: true)`,
        newValue: newRecord,
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, bot: newRecord })
    }

    // 3. Atualizar Bot Existente
    if (action === 'update' && botId) {
      const docRef = db.collection('botPlayers').doc(botId)
      const snap = await docRef.get()

      if (!snap.exists) {
        return NextResponse.json({ error: 'Bot não encontrado.' }, { status: 404 })
      }

      const prev = snap.data()
      const updateData = {
        ...botData,
        isBot: true, // Forçar sempre isBot: true
        updatedAt: FieldValue.serverTimestamp(),
      }

      await docRef.update(updateData)

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_UPDATED',
        entity: 'BOT',
        entityId: botId,
        details: `Atualizou configurações do bot ${botId}`,
        previousValue: prev,
        newValue: { ...prev, ...updateData },
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, bot: { ...prev, ...updateData } })
    }

    // 4. Alterar Status individual (ACTIVE, INACTIVE, SUSPENDED, RETIRED)
    if (action === 'toggle_status' && botId) {
      const docRef = db.collection('botPlayers').doc(botId)
      const snap = await docRef.get()

      if (!snap.exists) {
        return NextResponse.json({ error: 'Bot não encontrado.' }, { status: 404 })
      }

      const prev = snap.data() as BotPlayerRecord
      const nextStatus = prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

      await docRef.update({
        status: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
      })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_STATUS_TOGGLE',
        entity: 'BOT',
        entityId: botId,
        details: `Comutou estado do bot ${prev.name} para ${nextStatus}`,
        previousValue: { status: prev.status },
        newValue: { status: nextStatus },
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, status: nextStatus })
    }

    return NextResponse.json({ error: `Ação inválida: "${action}"` }, { status: 400 })
  } catch (error: any) {
    console.error('[API ADMIN BOTS POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar bots.' }, { status: 500 })
  }
}
