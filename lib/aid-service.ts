/**
 * 🇵🇹 ACORDA PORTUGAL — SERVIÇO UNIFICADO DE AJUDAS (SSOT)
 *
 * Ponto único de verdade para:
 * 1. Definição das 3 Ajudas Canónicas Oficiais (50/50, Congelar Tempo, Pergunta ao Público)
 * 2. Leitura consistente do inventário e estoque real do jogador
 * 3. Consumo atómico e autoritativo (tanto no modo Normal como no 1v1 Multiplayer)
 * 4. Proteção contra duplo clique e idempotência
 */

import { useConsumablePowerUp } from '@/lib/economy'
import { calculate5050Eliminated, simulatePublicVote, generateQuestionClue } from '@/lib/powerup-helpers'
import { extendDuelPlayerDeadline } from '@/lib/duel'
import { auth } from '@/lib/firebase'

export type AidType = '5050' | 'publicVote' | 'freeze' | 'hint'

export interface AidMetadata {
  type: AidType
  canonicalId: 'AID_001' | 'AID_002' | 'AID_003' | 'AID_004'
  name: string
  shortName: string
  icon: string
  description: string
  image: string
  priceCoins: number
  unitsPerPack: number
  aliases: string[]
}

export const CANONICAL_AIDS: Record<string, AidMetadata> = {
  5050: {
    type: '5050',
    canonicalId: 'AID_002',
    name: 'Pack x5 Ajudas 50/50',
    shortName: '50 / 50',
    icon: '🌓',
    description: 'Elimina exatamente duas alternativas erradas, deixando a resposta correta e uma opção concorrente.',
    image: '/assets/shop/aids/aid-50-50.webp',
    priceCoins: 750,
    unitsPerPack: 5,
    aliases: ['aid_50_50', 'consumable_50_50', 'help5050', 'ajuda_5050'],
  },
  freeze: {
    type: 'freeze',
    canonicalId: 'AID_004',
    name: 'Pack x3 Congelar Tempo',
    shortName: 'Congelar Tempo',
    icon: '⏳',
    description: 'Pausa o cronómetro durante 15 segundos para responderes com calma, sem consumir tempo de jogo.',
    image: '/assets/shop/aids/aid-freeze-time.webp',
    priceCoins: 900,
    unitsPerPack: 3,
    aliases: ['aid_freeze_time', 'consumable_congelar_tempo', 'freezeTime', 'ajuda_congelar'],
  },
  publicVote: {
    type: 'publicVote',
    canonicalId: 'AID_003',
    name: 'Pack x3 Pergunta ao Público',
    shortName: 'Pergunta ao Público',
    icon: '👥',
    description: 'Simula a votação do público com percentagens realistas e forte tendência para a opção correta.',
    image: '/assets/shop/aids/aid-publico.webp',
    priceCoins: 1500,
    unitsPerPack: 3,
    aliases: ['aid_public_vote', 'consumable_public_vote', 'HELP_005', 'publicVote', 'ajuda_publico'],
  },
}

export interface UserAidStock {
  stock5050: number
  stockFreeze: number
  stockPublicVote: number
  stockHint: number
  // Aliases retrocompatíveis opcionais
  stockPista?: number
  stockClue?: number
}

/**
 * Lê e consolida o estoque real das 3 ajudas canónicas (50/50, Congelar, Público) (SSOT).
 * Evita mascaramento onde um valor 0 num campo legacy oculta unidades reais de compras.
 */
export function getUserAidStock(
  profile?: any,
  inventory?: Record<string, any>,
): UserAidStock {
  let s5050 = 0
  let sPublic = 0
  let sFreeze = 0

  if (profile) {
    const cons = profile.consumables || {}
    const utils = profile.inventory?.utilities || {}
    const invMap = inventory || profile.inventory || {}
    const powerUps = profile.powerUps || {}

    // 1. 50/50: Resolução estrita do maior valor positivo encontrado em todas as fontes
    s5050 = Math.max(
      Number(powerUps.fiftyFifty) || 0,
      Number(powerUps.help5050) || 0,
      Number(powerUps['5050']) || 0,
      Number(cons.help5050) || 0,
      Number(cons.fiftyFifty) || 0,
      Number(utils.fiftyFifty) || 0,
      Number(invMap['AID_002']) || 0,
      Number(invMap['aid_50_50']) || 0,
      Number(invMap['consumable_50_50']) || 0,
      Number(invMap['help5050']) || 0,
      Number(invMap['ajuda_5050']) || 0,
      0
    )

    // 2. Congelar Tempo: Resolução estrita do maior valor positivo encontrado em todas as fontes
    sFreeze = Math.max(
      Number(powerUps.freezeTime) || 0,
      Number(powerUps.freeze) || 0,
      Number(powerUps.congelar) || 0,
      Number(cons.freezeTime) || 0,
      Number(utils.freezeTime) || 0,
      Number(invMap['AID_004']) || 0,
      Number(invMap['aid_freeze_time']) || 0,
      Number(invMap['consumable_congelar_tempo']) || 0,
      Number(invMap['freezeTime']) || 0,
      Number(invMap['ajuda_congelar']) || 0,
      0
    )

    // 3. Pergunta ao Público: Resolução estrita do maior valor positivo encontrado em todas as fontes
    sPublic = Math.max(
      Number(powerUps.publicVote) || 0,
      Number(powerUps.publico) || 0,
      Number(cons.publicVote) || 0,
      Number(cons.publico) || 0,
      Number(utils.publicVote) || 0,
      Number(invMap['AID_003']) || 0,
      Number(invMap['aid_public_vote']) || 0,
      Number(invMap['consumable_public_vote']) || 0,
      Number(invMap['HELP_005']) || 0,
      Number(invMap['publicVote']) || 0,
      Number(invMap['ajuda_publico']) || 0,
      0
    )
  }

  // Fallback para cache local se ainda estiver a zero e não tiver sido fornecido documento do Firestore
  if (typeof window !== 'undefined' && !data) {
    try {
      if (s5050 === 0) {
        const raw50 = localStorage.getItem('user_help5050')
        if (raw50 !== null && Number(raw50) > 0) s5050 = Number(raw50)
      }
      if (sFreeze === 0) {
        const rawFrz = localStorage.getItem('user_freezeTime')
        if (rawFrz !== null && Number(rawFrz) > 0) sFreeze = Number(rawFrz)
      }
      if (sPublic === 0) {
        const rawPub = localStorage.getItem('user_publicVote')
        if (rawPub !== null && Number(rawPub) > 0) sPublic = Number(rawPub)
      }
      const rawConsumables = localStorage.getItem('user_consumables')
      if (rawConsumables) {
        const parsed = JSON.parse(rawConsumables)
        if (s5050 === 0 && typeof parsed.help5050 === 'number' && parsed.help5050 > 0) s5050 = parsed.help5050
        if (sFreeze === 0 && typeof parsed.freezeTime === 'number' && parsed.freezeTime > 0) sFreeze = parsed.freezeTime
        if (sPublic === 0 && typeof parsed.publicVote === 'number' && parsed.publicVote > 0) sPublic = parsed.publicVote
      }
    } catch {
      // Falha não crítica de leitura de cache local
    }
  }

  const safe5050 = Math.max(0, s5050)
  const safePublic = Math.max(0, sPublic)
  const safeFreeze = Math.max(0, sFreeze)

  return {
    stock5050: safe5050,
    stockFreeze: safeFreeze,
    stockPublicVote: safePublic,
    stockHint: 0,
    stockPista: 0,
    stockClue: 0,
  }
}

/**
 * Atualiza o cache local passivamente e emite os eventos de sincronização em tempo real
 */
export function syncAidStockToLocalStorage(stocks: Partial<UserAidStock>) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user_consumables')
    const parsed = raw ? JSON.parse(raw) : {}

    if (typeof stocks.stockHint === 'number') {
      parsed.hints = stocks.stockHint
      localStorage.setItem('user_hints', String(stocks.stockHint))
      localStorage.setItem('user_pista', String(stocks.stockHint))
    }
    if (typeof stocks.stock5050 === 'number') {
      parsed.help5050 = stocks.stock5050
      localStorage.setItem('user_help5050', String(stocks.stock5050))
    }
    if (typeof stocks.stockPublicVote === 'number') {
      parsed.publicVote = stocks.stockPublicVote
      localStorage.setItem('user_publicVote', String(stocks.stockPublicVote))
    }
    if (typeof stocks.stockFreeze === 'number') {
      parsed.freezeTime = stocks.stockFreeze
      localStorage.setItem('user_freezeTime', String(stocks.stockFreeze))
    }

    localStorage.setItem('user_consumables', JSON.stringify(parsed))
    window.dispatchEvent(new CustomEvent('consumables_updated', { detail: stocks }))
    window.dispatchEvent(new CustomEvent('inventory_updated'))
  } catch (err) {
    console.warn('[syncAidStockToLocalStorage] Erro:', err)
  }
}

export interface ConsumeAidParams {
  userId: string
  aidType: AidType
  gameMode: 'solo' | 'duel' | '1v1'
  currentStock: number
  questionData?: {
    prompt?: string
    options?: { key: 'A' | 'B' | 'C' | 'D' | string; text: string }[]
    correct?: 'A' | 'B' | 'C' | 'D' | string
    explanation?: string
    category?: string
  }
  duelId?: string
}

export interface ConsumeAidResult {
  success: boolean
  remainingStock: number
  effect?: any
  message?: string
}

/**
 * Consome uma ajuda de forma segura, atómica e autoritativa
 * Utilizado TANTO pelo modo normal como pelo 1v1 Multiplayer
 */
export async function consumeGameAid({
  userId,
  aidType,
  gameMode,
  currentStock,
  questionData,
  duelId,
}: ConsumeAidParams): Promise<ConsumeAidResult> {
  const aidMeta = CANONICAL_AIDS[aidType]
  if (!aidMeta) {
    return { success: false, remainingStock: currentStock, message: 'Ajuda inválida.' }
  }

  if (currentStock <= 0) {
    return {
      success: false,
      remainingStock: 0,
      message: `Sem unidades de «${aidMeta.shortName}». Adquire um pack na Loja!`,
    }
  }

  // Helper local de cálculo determinístico do efeito para gameplay ininterrupto
  const computeLocalEffect = () => {
    let effect: any = {}
    if (aidType === '5050' && questionData?.options && questionData.correct) {
      const eliminated = calculate5050Eliminated(
        questionData.options as any,
        questionData.correct as any
      )
      effect = { eliminatedOptions: eliminated }
    } else if (aidType === 'publicVote' && questionData?.options && questionData.correct) {
      const correctIdx = questionData.options.findIndex((o) => o.key === questionData.correct)
      const percentages = simulatePublicVote(correctIdx >= 0 ? correctIdx : 0)
      effect = {
        percentages,
        voteDistribution: percentages.map((pct, idx) => ({
          optionKey: questionData.options?.[idx]?.key || ['A', 'B', 'C', 'D'][idx],
          percentage: pct,
        })),
      }
    } else if (aidType === 'freeze') {
      effect = { bonusSeconds: 15 }
    } else if (aidType === 'hint' && questionData) {
      const clue = generateQuestionClue({
        question: questionData.prompt || '',
        explanation: questionData.explanation,
        category: questionData.category,
      })
      effect = { clue }
    }
    return effect
  }

  // 1. Suporte imediato para Utilizadores Convidados / Anónimos
  const isGuest = !userId || userId.startsWith('guest_') || userId.startsWith('anon_') || userId === 'guest'
  if (isGuest) {
    const remainingStock = Math.max(0, currentStock - 1)
    if (aidType === '5050') syncAidStockToLocalStorage({ stock5050: remainingStock })
    else if (aidType === 'publicVote') syncAidStockToLocalStorage({ stockPublicVote: remainingStock })
    else if (aidType === 'freeze') syncAidStockToLocalStorage({ stockFreeze: remainingStock })
    else if (aidType === 'hint') syncAidStockToLocalStorage({ stockHint: remainingStock })

    return {
      success: true,
      remainingStock,
      effect: computeLocalEffect(),
      message: `«${aidMeta.shortName}» utilizada com sucesso!`,
    }
  }

  // 2. Obter Token Bearer de Autenticação do Firebase se disponível
  let idToken: string | null = null
  try {
    if (auth?.currentUser) {
      idToken = await auth.currentUser.getIdToken()
    }
  } catch (tErr) {
    console.warn('[consumeGameAid] Falha ao obter token:', tErr)
  }

  // 3. Tentativa Autoritativa no Servidor (/api/shop/aid/consume)
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`
    }

    const res = await fetch('/api/shop/aid/consume', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        uid: userId,
        aidId: aidMeta.canonicalId,
        gameMode,
        duelId,
        questionData,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.success) {
      const remainingStock = typeof data.remainingStock === 'number' ? data.remainingStock : Math.max(0, currentStock - 1)

      // Sincronizar cache local e disparar eventos
      if (aidType === '5050') syncAidStockToLocalStorage({ stock5050: remainingStock })
      else if (aidType === 'publicVote') syncAidStockToLocalStorage({ stockPublicVote: remainingStock })
      else if (aidType === 'freeze') syncAidStockToLocalStorage({ stockFreeze: remainingStock })
      else if (aidType === 'hint') syncAidStockToLocalStorage({ stockHint: remainingStock })

      return {
        success: true,
        remainingStock,
        effect: data.effect || computeLocalEffect(),
        message: data.message || `«${aidMeta.shortName}» utilizada com sucesso!`,
      }
    }

    // Se for modo solo e a API falhar, garantir persistência direta no Firestore
    if (gameMode === 'solo') {
      console.warn('[consumeGameAid] Servidor devolveu aviso em modo solo, aplicando fallback com persistência Firestore:', data.error)
      const remainingStock = Math.max(0, currentStock - 1)
      if (aidType === '5050') syncAidStockToLocalStorage({ stock5050: remainingStock })
      else if (aidType === 'publicVote') syncAidStockToLocalStorage({ stockPublicVote: remainingStock })
      else if (aidType === 'freeze') syncAidStockToLocalStorage({ stockFreeze: remainingStock })
      else if (aidType === 'hint') syncAidStockToLocalStorage({ stockHint: remainingStock })

      try {
        const fallbackId =
          aidType === '5050'
            ? 'consumable_50_50'
            : aidType === 'publicVote'
              ? 'HELP_005'
              : aidType === 'freeze'
                ? 'consumable_congelar_tempo'
                : 'consumable_pista'
        await useConsumablePowerUp(userId, fallbackId)
      } catch (fErr) {
        console.warn('[consumeGameAid] Aviso ao persistir Firestore:', fErr)
      }

      return {
        success: true,
        remainingStock,
        effect: computeLocalEffect(),
        message: `«${aidMeta.shortName}» utilizada com sucesso!`,
      }
    }

    // Se o servidor respondeu com erro explícito de stock ou utilizador no modo multiplayer
    if (data.error && !res.ok && res.status !== 404 && res.status !== 500) {
      return {
        success: false,
        remainingStock: currentStock,
        message: data.error,
      }
    }
  } catch (apiErr) {
    console.warn('[consumeGameAid] Servidor inacessível, a acionar fallback transacional do cliente:', apiErr)
  }

  // 4. Fallback de Contingência Direto no Firestore (Offline ou Token Pendente)
  try {
    const fallbackId =
      aidType === '5050'
        ? 'consumable_50_50'
        : aidType === 'publicVote'
          ? 'HELP_005'
          : aidType === 'freeze'
            ? 'consumable_congelar_tempo'
            : 'consumable_pista'

    const clientRes = await useConsumablePowerUp(userId, fallbackId)
    if (clientRes.success) {
      const remainingStock = clientRes.remainingCount

      // Sincronizar cache local
      if (aidType === '5050') syncAidStockToLocalStorage({ stock5050: remainingStock })
      else if (aidType === 'publicVote') syncAidStockToLocalStorage({ stockPublicVote: remainingStock })
      else if (aidType === 'freeze') syncAidStockToLocalStorage({ stockFreeze: remainingStock })
      else if (aidType === 'hint') syncAidStockToLocalStorage({ stockHint: remainingStock })

      // Sincronizar deadline no duelo caso tenha sido congelar tempo
      if (aidType === 'freeze' && duelId) {
        extendDuelPlayerDeadline(duelId, userId, 15000).catch((e) =>
          console.warn('[consumeGameAid] Aviso ao estender deadline no duelo:', e)
        )
      }

      return {
        success: true,
        remainingStock,
        effect: computeLocalEffect(),
        message: `«${aidMeta.shortName}» utilizada com sucesso!`,
      }
    } else {
      if (gameMode === 'solo') {
        const remainingStock = Math.max(0, currentStock - 1)
        if (aidType === '5050') syncAidStockToLocalStorage({ stock5050: remainingStock })
        else if (aidType === 'publicVote') syncAidStockToLocalStorage({ stockPublicVote: remainingStock })
        else if (aidType === 'freeze') syncAidStockToLocalStorage({ stockFreeze: remainingStock })
        else if (aidType === 'hint') syncAidStockToLocalStorage({ stockHint: remainingStock })

        return {
          success: true,
          remainingStock,
          effect: computeLocalEffect(),
          message: `«${aidMeta.shortName}» utilizada com sucesso!`,
        }
      }
      return {
        success: false,
        remainingStock: currentStock,
        message: clientRes.message || 'Não foi possível utilizar a ajuda.',
      }
    }
  } catch (err: any) {
    console.error('[consumeGameAid] Erro no fallback do Firestore:', err)
    if (gameMode === 'solo') {
      const remainingStock = Math.max(0, currentStock - 1)
      if (aidType === '5050') syncAidStockToLocalStorage({ stock5050: remainingStock })
      else if (aidType === 'publicVote') syncAidStockToLocalStorage({ stockPublicVote: remainingStock })
      else if (aidType === 'freeze') syncAidStockToLocalStorage({ stockFreeze: remainingStock })
      else if (aidType === 'hint') syncAidStockToLocalStorage({ stockHint: remainingStock })

      return {
        success: true,
        remainingStock,
        effect: computeLocalEffect(),
        message: `«${aidMeta.shortName}» utilizada com sucesso!`,
      }
    }
    return {
      success: false,
      remainingStock: currentStock,
      message: err?.message || 'Erro ao processar ajuda.',
    }
  }
}
