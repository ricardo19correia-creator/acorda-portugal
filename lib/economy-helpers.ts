/**
 * 🇵🇹 ACORDA PORTUGAL — HELPERS CANÓNICOS DE SINCRONIZAÇÃO E ECONOMIA (SSOT)
 * 
 * Garante que:
 * 1. Qualquer campo de saldo (coins, euros, acordaCoins, acordas, acorda, saldo, balance, moedas, etc.)
 *    alterado diretamente no Firebase Console / Firestore seja lido e normalizado com precisão.
 * 2. Suporta tanto valores numéricos (ex.: 2500) como strings numéricas (ex.: "2500").
 * 3. Nunca devolve NaN, números negativos ou fallbacks antigos quando existe um valor real no Firestore.
 * 4. Normaliza XP, Nível, Inventário e Cosméticos Equipados de forma segura e não destrutiva.
 */

import { calculateLevelProgress } from '@/lib/progression'
import {
  STARTER_AVATAR_ID,
  DEFAULT_AVATAR,
  normalizeAvatarId,
  getAvatarImage,
} from '@/lib/avatars'
import {
  DEFAULT_STARTER_TITLE_ID,
  DEFAULT_STARTER_TITLE_NAME,
  resolvePlayerEquippedTitle,
} from '@/lib/titles'

/**
 * Converte qualquer valor candidato para número inteiro seguro (>= 0).
 * Retorna null se o valor for indefinido, nulo ou não numérico.
 */
export function parseSafeNumber(val: unknown): number | null {
  if (val === undefined || val === null) return null
  if (typeof val === 'number') {
    return isNaN(val) ? null : Math.max(0, Math.floor(val))
  }
  if (typeof val === 'string') {
    let trimmed = val.trim().replace(/\s+/g, '').replace(/€/g, '')
    if (trimmed === '') return null
    if (/^\d{1,3}([.,]\d{3})+$/.test(trimmed)) {
      trimmed = trimmed.replace(/[.,]/g, '')
    }
    const num = Number(trimmed)
    return isNaN(num) ? null : Math.max(0, Math.floor(num))
  }
  return null
}

/**
 * Extrai o saldo oficial de Moedas / Acordas Virtuais (€ Acorda) a partir de um documento do Firestore.
 * Suporta todas as variações de nomes de campos e coerção de tipo estrita.
 */
export function extractUserCoins(data: any, fallback = 0): number {
  if (!data || typeof data !== 'object') return fallback

  const candidateKeys = [
    'acordas',
    'acorda',
    'acordasVirtuais',
    'virtualAcordas',
    'coins',
    'euros',
    'moedas',
    'moeda',
    'saldo',
    'balance',
    'virtualMoney',
    'walletBalance',
  ]

  for (const key of candidateKeys) {
    const parsed = parseSafeNumber(data[key])
    if (parsed !== null) {
      return parsed
    }
  }

  // Verificar sub-objeto wallet se existir
  if (data.wallet && typeof data.wallet === 'object') {
    for (const key of candidateKeys) {
      const parsed = parseSafeNumber(data.wallet[key])
      if (parsed !== null) return parsed
    }
  }

  return fallback
}

/**
 * Retorna o payload canónico para sincronizar o saldo do utilizador em todos os campos no Firestore.
 */
export function getCanonicalBalancePayload(balance: number, serverTimestampFn?: any): Record<string, any> {
  const safe = Math.max(0, Math.floor(balance))
  const payload: Record<string, any> = {
    coins: safe,
    acordas: safe,
    euros: safe,
    moedas: safe,
    balance: safe,
  }
  if (serverTimestampFn) {
    payload.updatedAt = serverTimestampFn()
  }
  return payload
}

/**
 * Extrai o XP total oficial do jogador a partir de um documento do Firestore.
 */
export function extractUserXp(data: any, fallback = 0): number {
  if (!data || typeof data !== 'object') return fallback

  const candidateKeys = ['xp', 'experience', 'pontos', 'points', 'totalXp', 'scoreTotal']

  for (const key of candidateKeys) {
    const parsed = parseSafeNumber(data[key])
    if (parsed !== null) {
      return parsed
    }
  }

  // Verificar em stats
  if (data.stats && typeof data.stats === 'object') {
    for (const key of candidateKeys) {
      const parsed = parseSafeNumber(data.stats[key])
      if (parsed !== null) return parsed
    }
  }

  return fallback
}

/**
 * Calcula o Nível de forma determinística e canónica com base no XP total.
 */
export function extractUserLevel(data: any, xp?: number): number {
  const resolvedXp = typeof xp === 'number' ? xp : extractUserXp(data, 0)
  const calcLevel = calculateLevelProgress(resolvedXp).currentLevel.level
  
  // Se existir nível explícito no documento, validar que seja >= calcLevel
  const explicitLevel = parseSafeNumber(data?.level || data?.nivel)
  if (explicitLevel !== null && explicitLevel > calcLevel) {
    return explicitLevel
  }

  return calcLevel
}

/**
 * Normaliza o inventário do utilizador garantindo que NENHUM item legítimo seja descartado.
 */
export function extractUserInventory(data: any): {
  avatars: string[]
  frames: string[]
  arenas: string[]
  titles: string[]
  taunts: string[]
  emotes: string[]
  utilities: { fiftyFifty: number; freezeTime: number; publicVote: number }
  rawMap: Record<string, number>
} {
  const inv = (data?.inventory && typeof data.inventory === 'object') ? data.inventory : {}
  const rawMap: Record<string, number> = {}

  // 1. Avatares (garantir STARTER_AVATAR_ID + todos os avatares de inventory.avatars e unlockedAvatars)
  const avatarsSet = new Set<string>([STARTER_AVATAR_ID])
  if (Array.isArray(inv.avatars)) {
    inv.avatars.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) avatarsSet.add(normalizeAvatarId(id.trim()))
    })
  }
  if (Array.isArray(data?.unlockedAvatars)) {
    data.unlockedAvatars.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) avatarsSet.add(normalizeAvatarId(id.trim()))
    })
  }

  // 2. Molduras (garantir 'default' + frames possuídos)
  const framesSet = new Set<string>(['default'])
  if (Array.isArray(inv.frames)) {
    inv.frames.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) framesSet.add(id.trim())
    })
  }
  if (Array.isArray(data?.unlockedFrames)) {
    data.unlockedFrames.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) framesSet.add(id.trim())
    })
  }

  // 3. Arenas (garantir 'arena_1' / 'theme_matriz_tron' + arenas possuídas)
  const arenasSet = new Set<string>(['arena_1', 'theme_matriz_tron'])
  if (Array.isArray(inv.arenas)) {
    inv.arenas.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) arenasSet.add(id.trim())
    })
  }
  if (Array.isArray(data?.unlockedArenas)) {
    data.unlockedArenas.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) arenasSet.add(id.trim())
    })
  }

  // 4. Títulos (garantir DEFAULT_STARTER_TITLE_ID + títulos possuídos)
  const titlesSet = new Set<string>([DEFAULT_STARTER_TITLE_ID])
  if (Array.isArray(inv.titles)) {
    inv.titles.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) titlesSet.add(id.trim())
    })
  }
  if (Array.isArray(data?.ownedTitleIds)) {
    data.ownedTitleIds.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) titlesSet.add(id.trim())
    })
  }

  // 5. Taunts e Emotes
  const tauntsSet = new Set<string>(['pack_basico', 'PROV_010'])
  if (Array.isArray(inv.taunts)) {
    inv.taunts.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) tauntsSet.add(id.trim())
    })
  }
  if (Array.isArray(inv.emotes)) {
    inv.emotes.forEach((id: unknown) => {
      if (typeof id === 'string' && id.trim()) tauntsSet.add(id.trim())
    })
  }

  // 6. Consumíveis e Utilitários
  const fiftyFifty = parseSafeNumber(inv?.utilities?.fiftyFifty) ?? parseSafeNumber(data?.consumables?.help5050) ?? parseSafeNumber(inv?.consumable_50_50) ?? 0
  const freezeTime = parseSafeNumber(inv?.utilities?.freezeTime) ?? parseSafeNumber(data?.consumables?.freezeTime) ?? parseSafeNumber(inv?.consumable_congelar_tempo) ?? 0
  const publicVote = parseSafeNumber(inv?.utilities?.publicVote) ?? parseSafeNumber(data?.consumables?.publicVote) ?? parseSafeNumber(inv?.HELP_005) ?? parseSafeNumber(inv?.consumable_public_vote) ?? 0

  // Preenchimento de rawMap para consultas rápidas por ID de item
  for (const [k, v] of Object.entries(inv)) {
    if (typeof v === 'number') rawMap[k] = v
    else if (typeof v === 'string' && !isNaN(Number(v))) rawMap[k] = Number(v)
  }
  avatarsSet.forEach((a) => { rawMap[a] = 1 })
  framesSet.forEach((f) => { rawMap[f] = 1 })
  arenasSet.forEach((ar) => { rawMap[ar] = 1 })
  titlesSet.forEach((t) => { rawMap[t] = 1 })
  tauntsSet.forEach((ta) => { rawMap[ta] = 1 })

  return {
    avatars: Array.from(avatarsSet),
    frames: Array.from(framesSet),
    arenas: Array.from(arenasSet),
    titles: Array.from(titlesSet),
    taunts: Array.from(tauntsSet),
    emotes: Array.from(tauntsSet),
    utilities: {
      fiftyFifty,
      freezeTime,
      publicVote,
    },
    rawMap,
  }
}

/**
 * Extrai os itens equipados a partir do documento do utilizador.
 */
export function extractUserEquipped(data: any, xp?: number): {
  avatarId: string
  avatarImage: string
  frameId: string
  titleId: string
  titleName: string
  arenaId: string
} {
  const eq = data?.equipped || {}
  const rawAvatarCandidate = data?.avatarId || data?.equippedAvatar || eq.avatarId || eq.avatar || data?.avatar || data?.photoURL
  const resolvedAvatar = normalizeAvatarId(rawAvatarCandidate)
  const avatarImage = getAvatarImage(data?.photoURL || eq.avatar || data?.avatar || resolvedAvatar)

  const frameId = data?.equippedFrame || data?.frame || data?.frameId || eq.frameId || eq.frame || 'default'

  const resolvedXp = typeof xp === 'number' ? xp : extractUserXp(data, 0)
  const resolvedTitle = resolvePlayerEquippedTitle(data, resolvedXp)
  const titleId = data?.equippedTitleId || eq.titleId || eq.title || resolvedTitle.id || DEFAULT_STARTER_TITLE_ID
  const titleName = resolvedTitle.cleanName || data?.equippedTitle || data?.title || DEFAULT_STARTER_TITLE_NAME

  const arenaId = data?.equippedArena || data?.equipped_arena || eq.arena || eq.arenaId || data?.arena || 'arena_1'

  return {
    avatarId: resolvedAvatar || STARTER_AVATAR_ID,
    avatarImage: avatarImage || DEFAULT_AVATAR.image,
    frameId: frameId || 'default',
    titleId: titleId || DEFAULT_STARTER_TITLE_ID,
    titleName: titleName || DEFAULT_STARTER_TITLE_NAME,
    arenaId: arenaId || 'arena_1',
  }
}

/**
 * Registo de diagnóstico seguro para desenvolvimento (sem secrets).
 */
export function safeSyncLog(context: string, details: Record<string, any>) {
  if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    console.log(`[SYNC][${context}]`, JSON.stringify({
      ...details,
      timestamp: new Date().toISOString(),
    }))
  }
}
