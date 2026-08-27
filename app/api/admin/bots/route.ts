import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { generateBotsPoolV2 } from '@/lib/bot-network/bot-generator'
import { syncBotPopulationState } from '@/lib/bot-network/bot-population-manager'
import type { BotPlayerRecord, BotPlayerPrivateRecord } from '@/lib/bot-network/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()
    const districtFilter = searchParams.get('district') || 'all'
    const personalityFilter = searchParams.get('personality') || 'all'
    const statusFilter = searchParams.get('status') || 'all'
    const limit = Math.min(300, Math.max(10, Number(searchParams.get('limit') || 150)))

    const db = getAdminFirestore()
    let snap = await db.collection('botPlayers').get()

    // Se estiver com menos de 50 bots, inicializar a rede de 125 bots
    if (snap.size < 50) {
      await syncBotPopulationState()
      snap = await db.collection('botPlayers').get()
    }

    // Carregar configurações privadas (apenas para Admin)
    const privSnap = await db.collection('botPlayersPrivate').get().catch(() => ({ docs: [] } as any))
    const privateMap = new Map<string, BotPlayerPrivateRecord>()
    privSnap.docs.forEach((d: any) => {
      privateMap.set(d.id, d.data() as BotPlayerPrivateRecord)
    })

    let bots = snap.docs.map((d) => {
      const publicData = d.data() as BotPlayerRecord
      const priv = privateMap.get(d.id)
      return {
        id: d.id,
        ...publicData,
        intelligencePercent: priv?.intelligencePercent || (publicData.accuracyPercentage ? Math.round(publicData.accuracyPercentage * 0.9 + 5) : 60),
        personality: priv?.personality || 'NORMAL',
        difficulty: priv?.difficulty || 'MEDIO',
      }
    })

    // Filtragem
    if (searchQuery) {
      bots = bots.filter((b) => {
        const name = (b.displayName || '').toLowerCase()
        const username = (b.username || '').toLowerCase()
        const id = (b.id || '').toLowerCase()
        return name.includes(searchQuery) || username.includes(searchQuery) || id.includes(searchQuery)
      })
    }

    if (districtFilter !== 'all') {
      bots = bots.filter((b) => (b.district || '').toLowerCase() === districtFilter.toLowerCase())
    }

    if (personalityFilter !== 'all') {
      bots = bots.filter((b) => b.personality === personalityFilter)
    }

    if (statusFilter !== 'all') {
      bots = bots.filter((b) => b.status === statusFilter)
    }

    // Ordenar por ID numérico (BOT_0001 ...)
    bots.sort((a, b) => a.id.localeCompare(b.id))

    // Obter telemetria resumida da população
    const populationStatus = await syncBotPopulationState()

    return NextResponse.json({
      success: true,
      bots: bots.slice(0, limit),
      totalCount: bots.length,
      population: populationStatus,
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

    // 1. Gerar / Regenerar 125 Bots V2 (com dados Públicos e Privados)
    if (action === 'generate_125' || action === 'generate_pool') {
      const { publicRecords, privateRecords } = generateBotsPoolV2(125)

      // Gravar botPlayers
      for (let i = 0; i < publicRecords.length; i += 250) {
        const batch = db.batch()
        const slice = publicRecords.slice(i, i + 250)
        slice.forEach((b) => {
          const ref = db.collection('botPlayers').doc(b.id)
          batch.set(ref, b)
        })
        await batch.commit()
      }

      // Gravar botPlayersPrivate
      for (let i = 0; i < privateRecords.length; i += 250) {
        const batch = db.batch()
        const slice = privateRecords.slice(i, i + 250)
        slice.forEach((priv) => {
          const ref = db.collection('botPlayersPrivate').doc(priv.id)
          batch.set(ref, priv)
        })
        await batch.commit()
      }

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_NETWORK_GENERATED_V2',
        entity: 'BOT_NETWORK',
        entityId: '125_BOTS_V2',
        details: 'Gerou e inicializou a rede oficial V2 de 125 desafiantes virtuais (identidades autênticas, avatares expandidos e curva de 24h).',
        status: 'SUCCESS',
      })

      const population = await syncBotPopulationState()
      return NextResponse.json({
        success: true,
        message: 'Rede de 125 bots V2 gerada com sucesso!',
        population,
      })
    }

    // 2. Ação em massa (Ativar Todos / Desativar Todos)
    if (action === 'mass_status') {
      const targetStatus = massStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
      const snap = await db.collection('botPlayers').get()

      for (let i = 0; i < snap.docs.length; i += 250) {
        const batch = db.batch()
        const slice = snap.docs.slice(i, i + 250)
        slice.forEach((docSnap) => {
          batch.update(docSnap.ref, {
            status: targetStatus,
            updatedAt: FieldValue.serverTimestamp(),
          })
        })
        await batch.commit()
      }

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

      const population = await syncBotPopulationState()
      return NextResponse.json({
        success: true,
        message: `Todos os ${snap.size} bots foram atualizados para: ${targetStatus}`,
        population,
      })
    }

    // 3. Atualizar Bot Existente (Publico + Privado)
    if (action === 'update' && botId) {
      const docRef = db.collection('botPlayers').doc(botId)
      const privDocRef = db.collection('botPlayersPrivate').doc(botId)

      const [snap, privSnap] = await Promise.all([docRef.get(), privDocRef.get()])

      if (!snap.exists) {
        return NextResponse.json({ error: 'Bot não encontrado.' }, { status: 404 })
      }

      const prev = snap.data() || {}
      const prevPriv = privSnap.exists ? privSnap.data() || {} : {}

      // Atualizar público
      const publicUpdate: any = {
        displayName: botData.displayName || prev.displayName,
        district: botData.district || prev.district,
        level: Number(botData.level) || prev.level,
        rating: Number(botData.rating) || prev.rating,
        status: botData.status || prev.status,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (botData.accuracyPercentage) {
        publicUpdate.accuracyPercentage = Number(botData.accuracyPercentage)
      }

      await docRef.update(publicUpdate)

      // Atualizar privado
      const privateUpdate: any = {
        intelligencePercent: Number(botData.intelligencePercent) || prevPriv.intelligencePercent || 60,
        personality: botData.personality || prevPriv.personality || 'NORMAL',
        difficulty: botData.difficulty || prevPriv.difficulty || 'MEDIO',
        adminMetadata: {
          notes: botData.notes || prevPriv.adminMetadata?.notes || '',
          lastEditedBy: authResult.adminUser.email,
          updatedAt: Date.now(),
        },
      }

      await privDocRef.set({ ...prevPriv, ...privateUpdate }, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_UPDATED',
        entity: 'BOT',
        entityId: botId,
        details: `Atualizou bot ${botId} (${publicUpdate.displayName}). Inteligência: ${privateUpdate.intelligencePercent}%.`,
        previousValue: { ...prev, ...prevPriv },
        newValue: { ...publicUpdate, ...privateUpdate },
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        bot: { ...prev, ...publicUpdate, ...privateUpdate },
      })
    }

    // 4. Alterar Status individual (Ativar / Desativar / Reformar)
    if ((action === 'toggle_status' || action === 'set_status') && botId) {
      const docRef = db.collection('botPlayers').doc(botId)
      const snap = await docRef.get()

      if (!snap.exists) {
        return NextResponse.json({ error: 'Bot não encontrado.' }, { status: 404 })
      }

      const prev = snap.data() as BotPlayerRecord
      let nextStatus = botData?.status

      if (!nextStatus) {
        nextStatus = prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      }

      await docRef.update({
        status: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
      })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: nextStatus === 'RETIRED' ? 'BOT_RETIRED' : 'BOT_STATUS_CHANGED',
        entity: 'BOT',
        entityId: botId,
        details: `Alterou estado do bot ${prev.displayName} (${botId}) para ${nextStatus}`,
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
