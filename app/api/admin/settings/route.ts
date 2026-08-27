import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const db = getAdminFirestore()
    const docRef = db.collection('adminSettings').doc('global')
    const snap = await docRef.get()

    const defaultSettings = {
      multiplayerEnabled: true,
      botsEnabled: true,
      duelsEnabled: true,
      matchmakingEnabled: true,
      maintenanceMode: false,
      maintenanceMessage: 'O Acorda Portugal encontra-se em manutenção programada para melhorias na infraestrutura.',
      matchmakingInitialWindowSeconds: 5,
      matchmakingExpandedWindowSeconds: 10,
      botFallbackSeconds: 15,
      maxSimultaneousBots: 50,
      xpMultiplier: 1.0,
      coinRewardMultiplier: 1.0,
    }

    if (!snap.exists) {
      await docRef.set({ ...defaultSettings, createdAt: FieldValue.serverTimestamp() })
      return NextResponse.json({ success: true, settings: defaultSettings })
    }

    return NextResponse.json({ success: true, settings: { ...defaultSettings, ...snap.data() } })
  } catch (error: any) {
    console.error('[API ADMIN SETTINGS GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao carregar configurações.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { settings, emergencyAction } = body

    const db = getAdminFirestore()
    const docRef = db.collection('adminSettings').doc('global')
    const snap = await docRef.get()
    const prev = snap.exists ? snap.data() : {}

    if (emergencyAction) {
      // Modos de emergência
      let updateData: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() }
      let desc = ''

      switch (emergencyAction) {
        case 'KILL_MULTIPLAYER':
          updateData.multiplayerEnabled = false
          updateData.duelsEnabled = false
          desc = 'EMERGÊNCIA: Desligou todo o Multiplayer e Duelos em tempo real.'
          break
        case 'KILL_BOTS':
          updateData.botsEnabled = false
          desc = 'EMERGÊNCIA: Desativou todos os Bots do Matchmaking.'
          break
        case 'ENABLE_MAINTENANCE':
          updateData.maintenanceMode = true
          desc = 'EMERGÊNCIA: Ativou Modo de Manutenção Global.'
          break
        case 'DISABLE_MAINTENANCE':
          updateData.maintenanceMode = false
          desc = 'Desativou Modo de Manutenção (Normalidade restaurada).'
          break
        case 'RESTORE_ALL':
          updateData.multiplayerEnabled = true
          updateData.duelsEnabled = true
          updateData.botsEnabled = true
          updateData.maintenanceMode = false
          desc = 'Restaurou todos os serviços globais com sucesso.'
          break
        default:
          return NextResponse.json({ error: `Ação de emergência desconhecida: "${emergencyAction}"` }, { status: 400 })
      }

      await docRef.set(updateData, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: `EMERGENCY_${emergencyAction}`,
        entity: 'GLOBAL_SETTINGS',
        entityId: 'global',
        details: desc,
        previousValue: prev,
        newValue: updateData,
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, message: desc, settings: { ...prev, ...updateData } })
    }

    if (settings && typeof settings === 'object') {
      const updateData = {
        ...settings,
        updatedAt: FieldValue.serverTimestamp(),
      }

      await docRef.set(updateData, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'GLOBAL_SETTINGS_UPDATED',
        entity: 'GLOBAL_SETTINGS',
        entityId: 'global',
        details: 'Atualizou as configurações globais do jogo.',
        previousValue: prev,
        newValue: updateData,
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, settings: { ...prev, ...updateData } })
    }

    return NextResponse.json({ error: 'Dados de configuração inválidos.' }, { status: 400 })
  } catch (error: any) {
    console.error('[API ADMIN SETTINGS POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao gravar configurações.' }, { status: 500 })
  }
}
