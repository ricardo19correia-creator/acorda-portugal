import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getShopCatalogItem, getConsumableAidRule } from '@/lib/shop-catalog'
import { calculate5050Eliminated, simulatePublicVote, generateQuestionClue } from '@/lib/powerup-helpers'

export const dynamic = 'force-dynamic'

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
    } = body

    if (!userId && uid && typeof uid === 'string') {
      userId = uid
    }

    if (!userId || !aidId) {
      return NextResponse.json(
        { success: false, error: 'Identificador do utilizador ou da ajuda ausente.' },
        { status: 400 }
      )
    }

    // 2. Regra Anti-Pay-to-Win Absoluta: Ajudas terminantemente desativadas em Duelos 1v1
    if (gameMode === 'duel' || gameMode === '1v1' || gameMode === 'competitive') {
      console.warn('[AID_BLOCKED_DUEL] Tentativa de usar ajuda em duelo 1v1:', { userId, aidId, gameMode })
      return NextResponse.json(
        {
          success: false,
          error: 'As Ajudas & Utilidades estão rigorosamente desativadas no modo Duelo 1v1 (competitivo com igualdade estrita).',
        },
        { status: 403 }
      )
    }

    // 3. Localização da Regra da Ajuda
    const aidRule = getConsumableAidRule(aidId)
    if (!aidRule) {
      return NextResponse.json(
        { success: false, error: `Ajuda «${aidId}» não reconhecida no catálogo oficial.` },
        { status: 404 }
      )
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const aidDocRef = userRef.collection('aid_inventory').doc(aidRule.id)

    // 4. Execução Transacional Atómica de Consumo (Verificação de Stock + Débito)
    const consumptionResult = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        throw new Error('Utilizador não registado no sistema.')
      }

      const aidSnap = await transaction.get(aidDocRef)
      let currentStock = 0

      if (aidSnap.exists) {
        currentStock = Number(aidSnap.data()?.quantity || 0)
      } else {
        // Fallback para campos legados se ainda não transferidos
        const inv = userSnap.data()?.inventory || {}
        if (aidRule.aliases) {
          for (const alias of aidRule.aliases) {
            if (typeof inv[alias] === 'number') {
              currentStock = Math.max(currentStock, inv[alias])
            }
          }
        }
        if (aidRule.id === 'aid_50_50') {
          currentStock = Math.max(currentStock, Number(userSnap.data()?.consumables?.help5050 || 0))
        } else if (aidRule.id === 'aid_public_vote') {
          currentStock = Math.max(currentStock, Number(userSnap.data()?.consumables?.publicVote || 0))
        } else if (aidRule.id === 'aid_freeze_time') {
          currentStock = Math.max(currentStock, Number(userSnap.data()?.consumables?.freezeTime || 0))
        }
      }

      if (currentStock <= 0) {
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

      // Atualizar campos legados para retrocompatibilidade
      const updatePayload: Record<string, any> = {
        [`inventory.${aidRule.id}`]: newStock,
        updatedAt: FieldValue.serverTimestamp(),
      }
      if (aidRule.id === 'AID_002' || aidRule.id === 'aid_50_50' || aidRule.aliases?.includes('consumable_50_50')) {
        updatePayload['consumables.help5050'] = newStock
        updatePayload['inventory.utilities.fiftyFifty'] = newStock
      } else if (aidRule.id === 'AID_003' || aidRule.id === 'aid_public_vote' || aidRule.aliases?.includes('consumable_public_vote')) {
        updatePayload['consumables.publicVote'] = newStock
        updatePayload['inventory.utilities.publicVote'] = newStock
      } else if (aidRule.id === 'AID_004' || aidRule.id === 'aid_freeze_time' || aidRule.aliases?.includes('consumable_congelar_tempo')) {
        updatePayload['consumables.freezeTime'] = newStock
        updatePayload['inventory.utilities.freezeTime'] = newStock
      } else if (aidRule.id === 'AID_001' || aidRule.id === 'aid_hint' || aidRule.aliases?.includes('consumable_pista')) {
        updatePayload['consumables.hints'] = newStock
      } else if (aidRule.id === 'AID_008' || aidRule.id === 'aid_streak_protection' || aidRule.aliases?.includes('consumable_protecao_streak')) {
        updatePayload['consumables.streakProtection'] = newStock
      }
      transaction.update(userRef, updatePayload)

      return {
        aidId: aidRule.id,
        name: aidRule.name,
        remainingStock: newStock,
      }
    })

    // 5. Cálculo Determinado pelo Servidor do Efeito de Gameplay
    let effectData: Record<string, any> = {}

    if (aidRule.id === 'AID_002' || aidRule.id === 'aid_50_50' || aidRule.aliases?.includes('consumable_50_50')) {
      // 50/50: elimina exatamente 2 erradas
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
      // Pergunta ao Público: soma exatamente 100% com viés plausível
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
      // Congelar tempo: +15 segundos autorizados
      const now = Date.now()
      const bonusSeconds = 15
      effectData = {
        bonusSeconds,
        freezeGrantedAt: now,
        expiresAt: now + bonusSeconds * 1000,
      }
    } else if (aidRule.id === 'AID_001' || aidRule.id === 'aid_hint' || aidRule.aliases?.includes('consumable_pista')) {
      // Pista inteligente
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
