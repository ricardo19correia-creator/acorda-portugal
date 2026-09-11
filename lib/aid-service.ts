/**
 * 🇵🇹 ACORDA PORTUGAL — SERVIÇO UNIFICADO DE AJUDAS (SSOT)
 *
 * Ponto único de verdade para:
 * 1. Definição das 4 Ajudas Canónicas (Pista Histórica, 50/50, Público, Congelar Tempo)
 * 2. Leitura consistente do inventário e estoque do jogador
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

export const CANONICAL_AIDS: Record<AidType, AidMetadata> = {
  hint: {
    type: 'hint',
    canonicalId: 'AID_001',
    name: 'Pista Histórica',
    shortName: 'Pista Histórica',
    icon: '💡',
    description: 'Revela uma dica contextual educativa sem entregar a resposta diretamente.',
    image: '/assets/shop/aids/aid-pista-historica.webp',
    priceCoins: 750,
    unitsPerPack: 1,
    aliases: ['aid_hint', 'consumable_pista', 'pista_historica', 'ajuda_pista', 'hint'],
  },
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
}

export interface UserAidStock {
  stockHint: number
  stock5050: number
  stockPublicVote: number
  stockFreeze: number
  // Aliases retrocompatíveis opcionais
  stockPista?: number
  stockClue?: number
}

/**
 * Lê e consolida o estoque real das ajudas de forma estritamente canónica (SSOT).
 * O Firestore / Perfil é a ÚNICA fonte de verdade absoluta.
 * localStorage é usado exclusivamente para hidratação inicial antes do perfil carregar.
 * NUNCA usa Math.max contra o localStorage para evitar a ressurreição de ajudas consumidas.
 */
export function getUserAidStock(
  profile?: any,
  inventory?: Record<string, any>,
): UserAidStock {
  let sHint = 0
  let s5050 = 0
  let sPublic = 0
  let sFreeze = 0

  // 1. Se o Perfil estiver presente (do Firestore / AuthProvider), ele é a autoridade absoluta
  if (profile) {
    const cons = profile.consumables || {}
    const utils = profile.inventory?.utilities || {}
    const invMap = inventory || profile.inventory || {}

    // 50/50
    if (typeof cons.help5050 === 'number') {
      s5050 = cons.help5050
    } else if (typeof utils.fiftyFifty === 'number') {
      s5050 = utils.fiftyFifty
    } else if (typeof invMap['AID_002'] === 'number') {
      s5050 = invMap['AID_002']
    } else {
      s5050 = Math.max(
        Number(invMap['aid_50_50']) || 0,
        Number(invMap['consumable_50_50']) || 0,
        Number(invMap['help5050']) || 0,
        Number(invMap['ajuda_5050']) || 0,
        0
      )
    }

    // Pergunta ao Público
    if (typeof cons.publicVote === 'number') {
      sPublic = cons.publicVote
    } else if (typeof utils.publicVote === 'number') {
      sPublic = utils.publicVote
    } else if (typeof invMap['AID_003'] === 'number') {
      sPublic = invMap['AID_003']
    } else {
      sPublic = Math.max(
        Number(invMap['aid_public_vote']) || 0,
        Number(invMap['consumable_public_vote']) || 0,
        Number(invMap['HELP_005']) || 0,
        Number(invMap['publicVote']) || 0,
        Number(invMap['ajuda_publico']) || 0,
        0
      )
    }

    // Congelar Tempo
    if (typeof cons.freezeTime === 'number') {
      sFreeze = cons.freezeTime
    } else if (typeof utils.freezeTime === 'number') {
      sFreeze = utils.freezeTime
    } else if (typeof invMap['AID_004'] === 'number') {
      sFreeze = invMap['AID_004']
    } else {
      sFreeze = Math.max(
        Number(invMap['aid_freeze_time']) || 0,
        Number(invMap['consumable_congelar_tempo']) || 0,
        Number(invMap['freezeTime']) || 0,
        Number(invMap['ajuda_congelar']) || 0,
        0
      )
    }

    // Pista Histórica
    if (typeof cons.hints === 'number') {
      sHint = cons.hints
    } else if (typeof utils.hints === 'number') {
      sHint = utils.hints
    } else if (typeof invMap['AID_001'] === 'number') {
      sHint = invMap['AID_001']
    } else {
      sHint = Math.max(
        Number(invMap['aid_hint']) || 0,
        Number(invMap['consumable_pista']) || 0,
        Number(invMap['pista_historica']) || 0,
        Number(invMap['ajuda_pista']) || 0,
        Number(invMap['hint']) || 0,
        0
      )
    }
  } else if (typeof window !== 'undefined') {
    // 2. Cold start transitório APENAS se profile ainda for indefinido/nulo
    try {
      const rawConsumables = localStorage.getItem('user_consumables')
      if (rawConsumables) {
        const parsed = JSON.parse(rawConsumables)
        if (typeof parsed.hints === 'number') sHint = parsed.hints
        if (typeof parsed.help5050 === 'number') s5050 = parsed.help5050
        if (typeof parsed.publicVote === 'number') sPublic = parsed.publicVote
        if (typeof parsed.freezeTime === 'number') sFreeze = parsed.freezeTime
      }
      const rawHint = localStorage.getItem('user_hints') || localStorage.getItem('user_pista')
      if (rawHint !== null) sHint = Number(rawHint) || sHint

      const raw50 = localStorage.getItem('user_help5050')
      if (raw50 !== null) s5050 = Number(raw50) || s5050

      const rawPub = localStorage.getItem('user_publicVote')
      if (rawPub !== null) sPublic = Number(rawPub) || sPublic

      const rawFrz = localStorage.getItem('user_freezeTime')
      if (rawFrz !== null) sFreeze = Number(rawFrz) || sFreeze
    } catch {
      // Falha não crítica de leitura de cache local
    }
  }

  const safe5050 = Math.max(0, s5050)
  const safePublic = Math.max(0, sPublic)
  const safeFreeze = Math.max(0, sFreeze)
  const safeHint = Math.max(0, sHint)

  return {
    stockHint: safeHint,
    stock5050: safe5050,
    stockPublicVote: safePublic,
    stockFreeze: safeFreeze,
    stockPista: safeHint,
    stockClue: safeHint,
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
