import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, verifyFirebaseIdToken } from '@/lib/firebase-admin'
import { calculateVaultStreak } from '@/lib/vault-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: 'Token de autenticação ausente.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]?.trim()
    const verified = await verifyFirebaseIdToken(token)

    if (!verified || !verified.uid) {
      return NextResponse.json(
        { ok: false, error: 'Sessão inválida ou expirada.', code: 'AUTH_INVALID' },
        { status: 401 }
      )
    }

    const userId = verified.uid
    const db = getAdminFirestore()
    const nowMs = Date.now()

    // 1. Verificar se o sistema de cofre está ativo nas configurações de administração
    let vaultEnabled = true
    try {
      const adminDoc = await db.collection('adminSettings').doc('daily_vault').get()
      if (adminDoc.exists && adminDoc.data()?.enabled === false) {
        vaultEnabled = false
      }
    } catch {}

    if (!vaultEnabled) {
      return NextResponse.json({
        ok: true,
        success: true,
        vaultEnabled: false,
        canClaim: false,
        message: 'O Cofre Diário encontra-se temporariamente em manutenção.',
      })
    }

    // 2. Consultar documento do utilizador
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json(
        { ok: false, error: 'Utilizador não encontrado.', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    const userData = userSnap.data() || {}
    const vaultData = userData.dailyVault || {}

    const lastOpenedAt = typeof vaultData.lastOpenedAt === 'number' ? vaultData.lastOpenedAt : null
    const currentStreak = typeof vaultData.currentStreak === 'number' ? vaultData.currentStreak : 0
    const bestStreak = typeof vaultData.bestStreak === 'number' ? vaultData.bestStreak : currentStreak
    const totalOpened = typeof vaultData.totalOpened === 'number' ? vaultData.totalOpened : 0
    const totalAcordasWon = typeof vaultData.totalAcordasWon === 'number' ? vaultData.totalAcordasWon : 0
    const totalAidsWon = typeof vaultData.totalAidsWon === 'number' ? vaultData.totalAidsWon : 0
    const lastReward = vaultData.lastReward || null

    const calc = calculateVaultStreak(lastOpenedAt, nowMs, currentStreak, bestStreak)

    return NextResponse.json({
      ok: true,
      success: true,
      vaultEnabled: true,
      userId,
      canClaim: calc.canClaim,
      cooldownRemainingMs: calc.cooldownRemainingMs,
      nextAvailableAt: calc.nextAvailableAt,
      currentStreak: calc.canClaim ? calc.newStreak : currentStreak,
      displayedStreak: currentStreak,
      bestStreak: calc.newBestStreak,
      totalOpened,
      totalAcordasWon,
      totalAidsWon,
      lastReward,
      lastOpenedAt,
      isDay7Special: calc.isDay7Special,
      serverTime: nowMs,
    })
  } catch (err: any) {
    console.error('[API_VAULT_STATUS_ERROR]', err)
    return NextResponse.json(
      { ok: false, error: err?.message || 'Erro ao consultar estado do Cofre Diário.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
