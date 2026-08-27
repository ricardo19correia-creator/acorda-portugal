import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { generateBotsPool } from '@/lib/bot-network/bot-generator'
import { syncBotPopulationState } from '@/lib/bot-network/bot-population-manager'
import type { BotPlayerRecord } from '@/lib/bot-network/types'

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
    const limit = Math.min(500, Math.max(10, Number(searchParams.get('limit') || 200)))

    const db = getAdminFirestore()
    let snap = await db.collection('botPlayers').get()

    // Se estiver com menos de 157 bots, inicializar a rede completa de 457 bots
    if (snap.size < 157) {
      await syncBotPopulationState()
      snap = await db.collection('botPlayers').get()
    }

    let bots = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as BotPlayerRecord[]

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

    // 1. Gerar / Regenerar 457 Bots (157 Ativos Imediatamente + 300 em 15h)
    if (action === 'generate_125' || action === 'generate_457' || action === 'generate_pool') {
      const newBots = generateBotsPool(457, 157)

      // Gravação em chunks seguros para Firestore
      for (let i = 0; i < newBots.length; i += 300) {
        const batch = db.batch()
        const slice = newBots.slice(i, i + 300)
        slice.forEach((b) => {
          const ref = db.collection('botPlayers').doc(b.id)
          batch.set(ref, b)
        })
        await batch.commit()
      }

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_NETWORK_GENERATED_457',
        entity: 'BOT_NETWORK',
        entityId: '457_BOTS_POOL',
        details: 'Gerou e inicializou a rede oficial de 457 desafiantes virtuais (157 ativos imediatamente + 300 em 15h).',
        status: 'SUCCESS',
      })

      const population = await syncBotPopulationState()
      return NextResponse.json({
        success: true,
        message: 'Rede de 457 bots gerada com sucesso (157 ativos agora + 300 ao longo de 15 horas)!',
        population,
      })
    }

    // 2. Ação em massa (Ativar Todos / Desativar Todos)
    if (action === 'mass_status') {
      const targetStatus = massStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
      const snap = await db.collection('botPlayers').get()

      for (let i = 0; i < snap.docs.length; i += 300) {
        const batch = db.batch()
        const slice = snap.docs.slice(i, i + 300)
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
        isBot: true,
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

    // 4. Alterar Status individual
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
        details: `Comutou estado do bot ${prev.displayName} para ${nextStatus}`,
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
