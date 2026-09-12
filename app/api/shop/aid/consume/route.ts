import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getShopCatalogItem, getConsumableAidRule } from '@/lib/shop-catalog'
import { calculate5050Eliminated, simulatePublicVote, generateQuestionClue } from '@/lib/powerup-helpers'

export const dynamic = 'force-dynamic'

function computeServerEffect(aidRule: any, questionData: any) {
  let effectData: Record<string, any> = {}
  const now = Date.now()

  if (aidRule.id === 'AID_002' || aidRule.id === 'aid_50_50' || aidRule.aliases?.includes('consumable_50_50')) {
    const options = questionData?.options || [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ]
    const correct = String(questionData?.correct || 'A').toUpperCase()
    const eliminated = calculate5050Eliminated(options, correct)
    effectData = {
      eliminatedOptions: eliminated,
      keptOptions: options.filter((o: any) => !eliminated.includes(o.key)).map((o: any) => o.key),
    }
  } else if (aidRule.id === 'AID_003' || aidRule.id === 'aid_public_vote' || aidRule.aliases?.includes('consumable_public_vote')) {
    const options = questionData?.options || []
    const correct = String(questionData?.correct || 'A').toUpperCase()
    const correctIndex = options.findIndex((o: any) => o.key === correct)
    const percentages = simulatePublicVote(correctIndex >= 0 ? correctIndex : 0)
    const sum = percentages.reduce((a, b) => a + b, 0)
    effectData = {
      percentages,
      sumCheck: sum,
      voteDistribution: percentages.map((pct, idx) => ({
        optionKey: options[idx]?.key || ['A', 'B', 'C', 'D'][idx],
        percentage: pct,
      })),
    }
  } else if (aidRule.id === 'AID_004' || aidRule.id === 'aid_freeze_time' || aidRule.aliases?.includes('consumable_congelar_tempo')) {
    const bonusSeconds = 15
    effectData = {
      bonusSeconds,
      freezeGrantedAt: now,
      expiresAt: now + bonusSeconds * 1000,
    }
  } else if (aidRule.id === 'AID_001' || aidRule.id === 'aid_hint' || aidRule.aliases?.includes('consumable_pista')) {
    const clue = generateQuestionClue({
      question: questionData?.prompt || '',
      explanation: questionData?.explanation || '',
      category: questionData?.category || '',
      district: questionData?.district || '',
      city: questionData?.city || '',
    })
    effectData = {
      clue,
    }
  } else if (aidRule.id === 'AID_005' || aidRule.id === 'aid_second_chance') {
    effectData = {
      secondChanceGranted: true,
      maxRetries: 1,
    }
  } else if (aidRule.id === 'AID_006' || aidRule.id === 'aid_triple_elimination') {
    const options = questionData?.options || []
    const correct = String(questionData?.correct || 'A').toUpperCase()
    const wrongKeys = options.filter((o: any) => o.key !== correct).map((o: any) => o.key)
    const eliminated = wrongKeys.slice(0, 3)
    effectData = {
      eliminatedOptions: eliminated,
    }
  } else if (aidRule.id === 'AID_007' || aidRule.id === 'aid_fast_answer') {
    effectData = {
      bonusSeconds: 5,
      noPenalty: true,
    }
  }

  return effectData
}

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação Segura via Firebase Admin Bearer Token
    let userId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1]
      try {
        const adminAuth = getAdminAuth()
        const decoded = await adminAuth.verifyIdToken(idToken)
        if (decoded?.uid) {
          userId = decoded.uid
        }
      } catch (authErr) {
        console.warn('[AID_CONSUME_AUTH_FAIL] Token inválido:', authErr)
      }
    }

    const body = await req.json().catch(() => ({}))
    const {
      uid,
      aidId,
      gameMode = 'solo',
      questionData,
      duelId,
    } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado. Inicia sessão para utilizar ajudas.' },
        { status: 401 }
      )
    }

    if (!aidId) {
      return NextResponse.json(
        { success: false, error: 'Identificador da ajuda ausente.' },
        { status: 400 }
      )
    }

    // Validação de modo de jogo (1v1 multiplayer e solo são totalmente suportados com inventário real)
    const isMultiplayerDuel = gameMode === 'duel' || gameMode === '1v1' || gameMode === 'competitive'

    // 3. Localização da Regra da Ajuda
    const aidRule = getConsumableAidRule(aidId)
    if (!aidRule) {
      return NextResponse.json(
        { success: false, error: `Ajuda «${aidId}» não reconhecida no catálogo oficial.` },
        { status: 404 }
      )
    }

    const isGuest = userId.startsWith('guest_') || userId.startsWith('anon_') || userId === 'guest'
    if (isGuest && gameMode === 'solo') {
      const effectData = computeServerEffect(aidRule, questionData)
      return NextResponse.json({
        success: true,
        message: `«${aidRule.name}» consumida com sucesso!`,
        aidId: aidRule.id,
        remainingStock: 0,
        effect: effectData,
      })
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const aidDocRef = userRef.collection('aid_inventory').doc(aidRule.id)

    // 4. Execução Transacional Atómica de Consumo (Verificação de Stock + Débito)
    const consumptionResult = await db.runTransaction(async (transaction: any) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        if (gameMode === 'solo') {
          return { aidId: aidRule.id, name: aidRule.name, remainingStock: 0 }
        }
        throw new Error('Utilizador não registado no sistema.')
      }

      const aidSnap = await transaction.get(aidDocRef)
      const subcollStock = aidSnap.exists ? Number(aidSnap.data()?.quantity || 0) : 0

      // Fallback abrangente para campos legados e canónicos no documento do utilizador
      const inv = userSnap.data()?.inventory || {}
      const cons = userSnap.data()?.consumables || {}
      const powerUps = userSnap.data()?.powerUps || {}
      let legacyStock = 0

      // Resolução estrita priorizando fontes canónicas (SSOT)
      if (aidRule.id === 'AID_002' || aidRule.id === 'aid_50_50' || aidRule.aliases?.includes('consumable_50_50')) {
        if (typeof powerUps.fiftyFifty === 'number') legacyStock = powerUps.fiftyFifty
        else if (typeof powerUps.help5050 === 'number') legacyStock = powerUps.help5050
        else if (typeof cons.help5050 === 'number') legacyStock = cons.help5050
        else if (typeof cons.fiftyFifty === 'number') legacyStock = cons.fiftyFifty
        else if (typeof inv['utilities']?.fiftyFifty === 'number') legacyStock = inv['utilities'].fiftyFifty
        else if (typeof inv['AID_002'] === 'number') legacyStock = inv['AID_002']
        else {
          legacyStock = Math.max(
            Number(inv['aid_50_50']) || 0,
            Number(inv['consumable_50_50']) || 0,
            Number(inv['help5050']) || 0,
            Number(inv['ajuda_5050']) || 0,
            0
          )
        }
      } else if (aidRule.id === 'AID_003' || aidRule.id === 'aid_public_vote' || aidRule.aliases?.includes('consumable_public_vote')) {
        if (typeof powerUps.publicVote === 'number') legacyStock = powerUps.publicVote
        else if (typeof powerUps.publico === 'number') legacyStock = powerUps.publico
        else if (typeof cons.publicVote === 'number') legacyStock = cons.publicVote
        else if (typeof inv['utilities']?.publicVote === 'number') legacyStock = inv['utilities'].publicVote
        else if (typeof inv['AID_003'] === 'number') legacyStock = inv['AID_003']
        else {
          legacyStock = Math.max(
            Number(inv['aid_public_vote']) || 0,
            Number(inv['consumable_public_vote']) || 0,
            Number(inv['HELP_005']) || 0,
            Number(inv['publicVote']) || 0,
            Number(inv['ajuda_publico']) || 0,
            0
          )
        }
      } else if (aidRule.id === 'AID_004' || aidRule.id === 'aid_freeze_time' || aidRule.aliases?.includes('consumable_congelar_tempo')) {
        if (typeof powerUps.freezeTime === 'number') legacyStock = powerUps.freezeTime
        else if (typeof powerUps.freeze === 'number') legacyStock = powerUps.freeze
        else if (typeof powerUps.congelar === 'number') legacyStock = powerUps.congelar
        else if (typeof cons.freezeTime === 'number') legacyStock = cons.freezeTime
        else if (typeof inv['utilities']?.freezeTime === 'number') legacyStock = inv['utilities'].freezeTime
        else if (typeof inv['AID_004'] === 'number') legacyStock = inv['AID_004']
        else {
          legacyStock = Math.max(
            Number(inv['aid_freeze_time']) || 0,
            Number(inv['consumable_congelar_tempo']) || 0,
            Number(inv['freezeTime']) || 0,
            Number(inv['ajuda_congelar']) || 0,
            0
          )
        }
      } else if (aidRule.id === 'AID_001' || aidRule.id === 'aid_hint' || aidRule.aliases?.includes('consumable_pista')) {
        if (typeof powerUps.hints === 'number') legacyStock = powerUps.hints
        else if (typeof powerUps.hint === 'number') legacyStock = powerUps.hint
        else if (typeof powerUps.dica === 'number') legacyStock = powerUps.dica
        else if (typeof powerUps.pista === 'number') legacyStock = powerUps.pista
        else if (typeof cons.hints === 'number') legacyStock = cons.hints
        else if (typeof inv['utilities']?.hints === 'number') legacyStock = inv['utilities'].hints
        else if (typeof inv['AID_001'] === 'number') legacyStock = inv['AID_001']
        else {
          legacyStock = Math.max(
            Number(inv['aid_hint']) || 0,
            Number(inv['consumable_pista']) || 0,
            Number(inv['pista_historica']) || 0,
            Number(inv['ajuda_pista']) || 0,
            Number(inv['hint']) || 0,
            0
          )
        }
      } else if (aidRule.id === 'AID_008' || aidRule.id === 'aid_streak_protection' || aidRule.aliases?.includes('consumable_protecao_streak')) {
        if (typeof cons.streakProtection === 'number') legacyStock = cons.streakProtection
        else if (typeof inv['utilities']?.streakProtection === 'number') legacyStock = inv['utilities'].streakProtection
        else {
          legacyStock = Math.max(
            Number(inv['AID_008']) || 0,
            Number(inv['aid_streak_protection']) || 0,
            Number(inv['consumable_protecao_streak']) || 0,
            0
          )
        }
      } else {
        legacyStock = Number(inv[aidRule.id]) || 0
      }

      const currentStock = Math.max(subcollStock, legacyStock)

      if (currentStock <= 0) {
        if (gameMode === 'solo') {
          return {
            aidId: aidRule.id,
            name: aidRule.name,
            remainingStock: 0,
          }
        }
        throw new Error(`Sem stock disponível de «${aidRule.name}». Adquire unidades na Loja para utilizares.`)
      }

      const newStock = Math.max(0, currentStock - 1)

      // Atualizar subcoleção aid_inventory
      transaction.set(
        aidDocRef,
        {
          userId,
          aidId: aidRule.id,
          quantity: newStock,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Atualizar todos os campos canónicos e legados para retrocompatibilidade
      const updatePayload: Record<string, any> = {
        [`inventory.${aidRule.id}`]: newStock,
        updatedAt: FieldValue.serverTimestamp(),
      }
      if (aidRule.aliases) {
        for (const alias of aidRule.aliases) {
          updatePayload[`inventory.${alias}`] = newStock
        }
      }

      if (aidRule.id === 'AID_002' || aidRule.id === 'aid_50_50' || aidRule.aliases?.includes('consumable_50_50')) {
        updatePayload['powerUps.fiftyFifty'] = newStock
        updatePayload['powerUps.help5050'] = newStock
        updatePayload['consumables.help5050'] = newStock
        updatePayload['consumables.fiftyFifty'] = newStock
        updatePayload['inventory.AID_002'] = newStock
        updatePayload['inventory.aid_50_50'] = newStock
        updatePayload['inventory.consumable_50_50'] = newStock
        updatePayload['inventory.help5050'] = newStock
        updatePayload['inventory.ajuda_5050'] = newStock
        updatePayload['inventory.utilities.fiftyFifty'] = newStock
      } else if (aidRule.id === 'AID_003' || aidRule.id === 'aid_public_vote' || aidRule.aliases?.includes('consumable_public_vote')) {
        updatePayload['powerUps.publicVote'] = newStock
        updatePayload['powerUps.publico'] = newStock
        updatePayload['consumables.publicVote'] = newStock
        updatePayload['consumables.publico'] = newStock
        updatePayload['inventory.AID_003'] = newStock
        updatePayload['inventory.aid_public_vote'] = newStock
        updatePayload['inventory.consumable_public_vote'] = newStock
        updatePayload['inventory.HELP_005'] = newStock
        updatePayload['inventory.publicVote'] = newStock
        updatePayload['inventory.ajuda_publico'] = newStock
        updatePayload['inventory.utilities.publicVote'] = newStock
      } else if (aidRule.id === 'AID_004' || aidRule.id === 'aid_freeze_time' || aidRule.aliases?.includes('consumable_congelar_tempo')) {
        updatePayload['powerUps.freezeTime'] = newStock
        updatePayload['powerUps.freeze'] = newStock
        updatePayload['powerUps.congelar'] = newStock
        updatePayload['consumables.freezeTime'] = newStock
        updatePayload['inventory.AID_004'] = newStock
        updatePayload['inventory.aid_freeze_time'] = newStock
        updatePayload['inventory.consumable_congelar_tempo'] = newStock
        updatePayload['inventory.freezeTime'] = newStock
        updatePayload['inventory.ajuda_congelar'] = newStock
        updatePayload['inventory.utilities.freezeTime'] = newStock
      } else if (aidRule.id === 'AID_001' || aidRule.id === 'aid_hint' || aidRule.aliases?.includes('consumable_pista')) {
        updatePayload['powerUps.hints'] = newStock
        updatePayload['powerUps.hint'] = newStock
        updatePayload['powerUps.dica'] = newStock
        updatePayload['powerUps.pista'] = newStock
        updatePayload['consumables.hints'] = newStock
        updatePayload['consumables.hint'] = newStock
        updatePayload['inventory.AID_001'] = newStock
        updatePayload['inventory.aid_hint'] = newStock
        updatePayload['inventory.consumable_pista'] = newStock
        updatePayload['inventory.pista_historica'] = newStock
        updatePayload['inventory.ajuda_pista'] = newStock
        updatePayload['inventory.hint'] = newStock
        updatePayload['inventory.utilities.hints'] = newStock
      } else if (aidRule.id === 'AID_008' || aidRule.id === 'aid_streak_protection' || aidRule.aliases?.includes('consumable_protecao_streak')) {
        updatePayload['consumables.streakProtection'] = newStock
        updatePayload['inventory.AID_008'] = newStock
        updatePayload['inventory.aid_streak_protection'] = newStock
        updatePayload['inventory.consumable_protecao_streak'] = newStock
        updatePayload['inventory.utilities.streakProtection'] = newStock
      }

      transaction.update(userRef, updatePayload)

      return {
        aidId: aidRule.id,
        name: aidRule.name,
        remainingStock: newStock,
      }
    })

    // 5. Cálculo Determinado pelo Servidor do Efeito de Gameplay
    const effectData = computeServerEffect(aidRule, questionData)

    // Se for um duelo 1v1 e a ajuda for congelar tempo, estender o deadline de resposta no servidor
    if ((aidRule.id === 'AID_004' || aidRule.id === 'aid_freeze_time' || aidRule.aliases?.includes('consumable_congelar_tempo')) && duelId && typeof duelId === 'string') {
      try {
        const bonusSeconds = 15
        const now = Date.now()
        const duelRef = db.collection('duels').doc(duelId)
        await db.runTransaction(async (t: any) => {
          const dSnap = await t.get(duelRef)
          if (dSnap.exists) {
            const dData = dSnap.data()
            const isPlayerA = dData?.playerA?.uid === userId
            const isPlayerB = dData?.playerB?.uid === userId
            const targetKey = isPlayerA ? 'playerA' : isPlayerB ? 'playerB' : null
            if (targetKey) {
              const currentDeadline = Number(dData?.[targetKey]?.questionDeadline || (now + 60000))
              const newDeadline = currentDeadline + (bonusSeconds * 1000)
              t.update(duelRef, {
                [`${targetKey}.questionDeadline`]: newDeadline,
                [`${targetKey}.isFrozen`]: true,
                [`${targetKey}.frozenAt`]: now,
                updatedAt: FieldValue.serverTimestamp(),
              })
            }
          }
        })
      } catch (syncErr) {
        console.warn('[AID_CONSUME_DUEL_FREEZE_SYNC_WARN]', syncErr)
      }
    }

    console.log('[AID_CONSUMED]', {
      userId,
      aidId: aidRule.id,
      remainingStock: consumptionResult.remainingStock,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `«${aidRule.name}» consumida com sucesso!`,
      aidId: aidRule.id,
      remainingStock: consumptionResult.remainingStock,
      effect: effectData,
    })
  } catch (error: any) {
    console.error('[AID_CONSUME_ERROR]', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao utilizar ajuda.' },
      { status: 400 }
    )
  }
}
