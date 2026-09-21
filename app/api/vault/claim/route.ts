import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, verifyFirebaseIdToken } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  VAULT_COOLDOWN_MS,
  OFFICIAL_VAULT_REWARDS,
  selectVaultReward,
  calculateVaultStreak,
  type VaultRewardConfig,
} from '@/lib/vault-config'
import { extractUserCoins, getCanonicalBalancePayload } from '@/lib/economy-helpers'

export const dynamic = 'force-dynamic'

function generateClaimId(userId: string): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).substring(2, 10)
  return `dvc_${userId}_${ts}_${rand}`
}

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação Server-Authoritative via Firebase Bearer ID Token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, success: false, error: 'Token de autenticação ausente.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]?.trim()
    const verified = await verifyFirebaseIdToken(token)

    if (!verified || !verified.uid) {
      return NextResponse.json(
        { ok: false, success: false, error: 'Sessão inválida ou expirada.', code: 'AUTH_INVALID' },
        { status: 401 }
      )
    }

    const userId = verified.uid
    const db = getAdminFirestore()
    const nowMs = Date.now()

    // 2. Extração e sanitização do claimId para idempotência estrita
    const body = await req.json().catch(() => ({}))
    let claimId: string = ''
    if (typeof body.claimId === 'string' && body.claimId.trim().length > 0) {
      claimId = body.claimId.trim().slice(0, 128)
    } else {
      claimId = generateClaimId(userId)
    }

    // 3. Verificação de Idempotência Preliminar (fora da transação para performance)
    const claimDocRef = db.collection('daily_vault_claims').doc(claimId)
    const existingClaimSnap = await claimDocRef.get().catch(() => null)
    if (existingClaimSnap && existingClaimSnap.exists) {
      const existingData = existingClaimSnap.data()
      if (existingData?.status === 'completed' && existingData.userId === userId) {
        return NextResponse.json({
          ok: true,
          success: true,
          idempotent: true,
          claimId,
          reward: {
            id: existingData.rewardKey,
            type: existingData.rewardType,
            amount: existingData.rewardAmount,
            label: existingData.rewardLabel,
            shortLabel: existingData.rewardShortLabel || existingData.rewardLabel,
            icon: existingData.rewardIcon || '🎁',
            aidId: existingData.aidId || null,
          },
          streak: existingData.streak,
          bestStreak: existingData.bestStreak,
          openedAt: existingData.openedAt,
          cooldownRemainingMs: Math.max(0, VAULT_COOLDOWN_MS - (nowMs - existingData.openedAt)),
          nextAvailableAt: existingData.openedAt + VAULT_COOLDOWN_MS,
          message: 'Operação já concluída anteriormente (idempotente).',
        })
      }
    }

    // 4. Carregar configurações personalizadas de pool do Admin, se existirem
    let rewardPool: VaultRewardConfig[] = OFFICIAL_VAULT_REWARDS
    try {
      const adminDoc = await db.collection('adminSettings').doc('daily_vault').get()
      if (adminDoc.exists) {
        const data = adminDoc.data()
        if (data?.enabled === false) {
          return NextResponse.json(
            { ok: false, success: false, error: 'O Cofre Diário encontra-se temporariamente desativado pela administração.', code: 'VAULT_DISABLED' },
            { status: 503 }
          )
        }
        if (Array.isArray(data?.customRewards) && data.customRewards.length > 0) {
          rewardPool = data.customRewards
        }
      }
    } catch {}

    const userRef = db.collection('users').doc(userId)
    const publicProfileRef = db.collection('publicProfiles').doc(userId)

    // 5. Transação Atómica Firestore — Previne rigorosamente Race Conditions e Cliques Múltiplos
    const transactionResult = await db.runTransaction(async (transaction: any) => {
      // A. Re-verificar claimId dentro da transação para proteção contra concorrência pura
      const snapClaimInside = await transaction.get(claimDocRef)
      if (snapClaimInside.exists && snapClaimInside.data()?.status === 'completed') {
        const cData = snapClaimInside.data()
        return {
          idempotent: true,
          claimId,
          reward: {
            id: cData.rewardKey,
            type: cData.rewardType,
            amount: cData.rewardAmount,
            label: cData.rewardLabel,
            shortLabel: cData.rewardShortLabel || cData.rewardLabel,
            icon: cData.rewardIcon || '🎁',
            aidId: cData.aidId || null,
          },
          streak: cData.streak,
          bestStreak: cData.bestStreak,
          openedAt: cData.openedAt,
          cooldownRemainingMs: Math.max(0, VAULT_COOLDOWN_MS - (nowMs - cData.openedAt)),
          nextAvailableAt: cData.openedAt + VAULT_COOLDOWN_MS,
        }
      }

      // B. Leitura do perfil do utilizador
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        const err: any = new Error('Conta de utilizador não registada no Firestore.')
        err.code = 'USER_NOT_FOUND'
        throw err
      }

      const userData = userSnap.data() || {}
      const vaultData = userData.dailyVault || {}

      const lastOpenedAt =
        typeof vaultData.lastOpenedAt === 'number'
          ? vaultData.lastOpenedAt
          : (typeof userData.lastVaultOpenedAt === 'number' ? userData.lastVaultOpenedAt : null)
      const currentStreak = typeof vaultData.currentStreak === 'number' ? vaultData.currentStreak : 0
      const bestStreak = typeof vaultData.bestStreak === 'number' ? vaultData.bestStreak : currentStreak

      // C. Verificação Estrita das 24 Horas Rolling no Servidor
      if (lastOpenedAt) {
        const elapsed = nowMs - lastOpenedAt
        if (elapsed < VAULT_COOLDOWN_MS) {
          const remainingMs = VAULT_COOLDOWN_MS - elapsed
          const err: any = new Error(`Cofre em cooldown. Volta daqui a ${Math.ceil(remainingMs / 1000)} segundos.`)
          err.code = 'COOLDOWN_ACTIVE'
          err.cooldownRemainingMs = remainingMs
          err.nextAvailableAt = lastOpenedAt + VAULT_COOLDOWN_MS
          throw err
        }
      }

      // D. Cálculo do novo Streak de Continuidade
      const streakCalc = calculateVaultStreak(lastOpenedAt, nowMs, currentStreak, bestStreak)
      const newStreak = streakCalc.newStreak
      const newBestStreak = streakCalc.newBestStreak

      // E. Sorteio Seguro e Autoritativo da Recompensa
      const chosenReward = selectVaultReward(newStreak, rewardPool)

      // F. Preparação das atualizações no utilizador
      const userUpdatePayload: Record<string, any> = {
        'dailyVault.lastOpenedAt': nowMs,
        lastVaultOpenedAt: nowMs,
        'dailyVault.currentStreak': newStreak,
        'dailyVault.bestStreak': newBestStreak,
        'dailyVault.totalOpened': FieldValue.increment(1),
        'dailyVault.updatedAt': FieldValue.serverTimestamp(),
        'dailyVault.lastReward': {
          claimId,
          type: chosenReward.type,
          rewardKey: chosenReward.id,
          amount: chosenReward.amount,
          label: chosenReward.label,
          shortLabel: chosenReward.shortLabel,
          icon: chosenReward.icon,
          openedAt: nowMs,
        },
        streak: newStreak,
        bestStreak: newBestStreak,
      }

      let newCoinsTotal: number | null = null

      // G1. Se a recompensa for Acordas (Moeda Virtual Oficial)
      if (chosenReward.type === 'acordas') {
        const currentCoins = extractUserCoins(userData)
        newCoinsTotal = currentCoins + chosenReward.amount

        const balancePayload = getCanonicalBalancePayload(newCoinsTotal, () => FieldValue.serverTimestamp())
        Object.assign(userUpdatePayload, balancePayload)
        userUpdatePayload['dailyVault.totalAcordasWon'] = FieldValue.increment(chosenReward.amount)

        // Registar transação imutável na coleção coin_transactions
        const txRef = db.collection('coin_transactions').doc()
        transaction.set(txRef, {
          transactionId: txRef.id,
          userId,
          amount: chosenReward.amount,
          balanceBefore: currentCoins,
          balanceAfter: newCoinsTotal,
          reason: `Cofre Diário: ${chosenReward.label} (Streak: ${newStreak} dias)`,
          itemType: 'daily_vault',
          claimId,
          timestamp: FieldValue.serverTimestamp(),
          idempotencyKey: claimId,
        })

        // Registar subcoleção do utilizador
        const userTxRef = userRef.collection('transactions').doc(txRef.id)
        transaction.set(userTxRef, {
          id: txRef.id,
          userId,
          type: 'vault_reward',
          amount: chosenReward.amount,
          reason: `Cofre Diário: ${chosenReward.label}`,
          claimId,
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      // G2. Se a recompensa for Ajuda Oficial (50/50, Congelar Tempo, Público)
      if (chosenReward.type === 'aid' && chosenReward.aidId) {
        const canonicalAidId = chosenReward.aidId
        const quantityToAdd = chosenReward.amount || 1

        userUpdatePayload['dailyVault.totalAidsWon'] = FieldValue.increment(quantityToAdd)

        // Subcoleção oficial aid_inventory
        const aidDocRef = userRef.collection('aid_inventory').doc(canonicalAidId)
        transaction.set(
          aidDocRef,
          {
            userId,
            aidId: canonicalAidId,
            quantity: FieldValue.increment(quantityToAdd),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        // Atualizar mapas canónicos e aliases para retrocompatibilidade em toda a app
        userUpdatePayload[`inventory.${canonicalAidId}`] = FieldValue.increment(quantityToAdd)

        if (canonicalAidId === 'AID_002') {
          // 50/50
          userUpdatePayload['consumables.help5050'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['consumables.fiftyFifty'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.help5050'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.fiftyFifty'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.fiftyFifty'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.aid_50_50'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.consumable_50_50'] = FieldValue.increment(quantityToAdd)
        } else if (canonicalAidId === 'AID_004') {
          // Congelar Tempo 15s
          userUpdatePayload['consumables.freezeTime'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.freezeTime'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.congelar'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.freeze'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.freezeTime'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.aid_freeze_time'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.consumable_congelar_tempo'] = FieldValue.increment(quantityToAdd)
        } else if (canonicalAidId === 'AID_003') {
          // Ajuda do Público
          userUpdatePayload['consumables.publicVote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['consumables.publico'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.publicVote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['powerUps.publico'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.publicVote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.aid_public_vote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.consumable_public_vote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.HELP_005'] = FieldValue.increment(quantityToAdd)
        }
      }

      // H. Executar escrita transacional no utilizador
      transaction.update(userRef, userUpdatePayload)

      // I. Sincronizar perfil público para Rankings Nacionais
      transaction.set(
        publicProfileRef,
        {
          uid: userId,
          streak: newStreak,
          bestStreak: newBestStreak,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // J. Registar na coleção imutável daily_vault_claims
      transaction.set(claimDocRef, {
        claimId,
        userId,
        openedAt: nowMs,
        rewardType: chosenReward.type,
        rewardKey: chosenReward.id,
        rewardAmount: chosenReward.amount,
        rewardLabel: chosenReward.label,
        rewardShortLabel: chosenReward.shortLabel,
        rewardIcon: chosenReward.icon,
        aidId: chosenReward.aidId || null,
        streak: newStreak,
        bestStreak: newBestStreak,
        isDay7Special: streakCalc.isDay7Special,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
        completedAt: FieldValue.serverTimestamp(),
      })

      return {
        idempotent: false,
        claimId,
        reward: {
          id: chosenReward.id,
          type: chosenReward.type,
          amount: chosenReward.amount,
          label: chosenReward.label,
          shortLabel: chosenReward.shortLabel,
          icon: chosenReward.icon,
          aidId: chosenReward.aidId || null,
          description: chosenReward.description,
        },
        streak: newStreak,
        bestStreak: newBestStreak,
        isDay7Special: streakCalc.isDay7Special,
        openedAt: nowMs,
        newCoinsTotal,
        cooldownRemainingMs: VAULT_COOLDOWN_MS,
        nextAvailableAt: nowMs + VAULT_COOLDOWN_MS,
      }
    })

    return NextResponse.json({
      ok: true,
      success: true,
      ...transactionResult,
    })
  } catch (err: any) {
    if (err?.code === 'COOLDOWN_ACTIVE') {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          code: 'COOLDOWN_ACTIVE',
          error: err.message,
          cooldownRemainingMs: err.cooldownRemainingMs,
          nextAvailableAt: err.nextAvailableAt,
        },
        { status: 403 }
      )
    }

    if (err?.code === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, success: false, code: 'USER_NOT_FOUND', error: 'Utilizador não encontrado.' },
        { status: 404 }
      )
    }

    console.error('[API_VAULT_CLAIM_ERROR]', err)
    return NextResponse.json(
      { ok: false, success: false, code: 'INTERNAL_ERROR', error: err?.message || 'Erro ao abrir o Cofre Diário.' },
      { status: 500 }
    )
  }
}
