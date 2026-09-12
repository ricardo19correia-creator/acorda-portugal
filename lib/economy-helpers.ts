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
  utilities: { fiftyFifty: number; freezeTime: number; publicVote: number; hints: number }
  rawMap: Record<string, number>
} {
  const inv = (data?.inventory && typeof data.inventory === 'object') ? data.inventory : {}
  const cons = (data?.consumables && typeof data.consumables === 'object') ? data.consumables : {}
  const powerUps = (data?.powerUps && typeof data.powerUps === 'object') ? data.powerUps : {}
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

  // Helper canónico de resolução estrita de saldo de ajudas (SSOT):
  // Prioriza o campo canónico mais recente (powerUps -> consumables -> utilities -> ID canónico -> aliases legados)
  // NUNCA faz Math.max entre campos canónicos e aliases obsoletos para evitar ressuscitação de ajudas já consumidas.
  const resolveAidCount = (
    primaryVal: unknown,
    secondaryVal: unknown,
    tertiaryVal: unknown,
    fallbackAliases: unknown[]
  ): number => {
    const p = parseSafeNumber(primaryVal)
    if (p !== null) return p
    const s = parseSafeNumber(secondaryVal)
    if (s !== null) return s
    const t = parseSafeNumber(tertiaryVal)
    if (t !== null) return t
    for (const val of fallbackAliases) {
      const parsed = parseSafeNumber(val)
      if (parsed !== null) return parsed
    }
    return 0
  }

  // 6. Consumíveis e Utilitários Canónicos (powerUps -> consumables -> utilities -> AID_xxx -> legados)
  const fiftyFifty = resolveAidCount(
    powerUps.fiftyFifty ?? powerUps.help5050 ?? powerUps['5050'],
    cons.help5050 ?? cons.fiftyFifty,
    inv?.utilities?.fiftyFifty,
    [inv?.AID_002, inv?.aid_50_50, inv?.consumable_50_50, inv?.help5050, inv?.ajuda_5050]
  )

  const freezeTime = resolveAidCount(
    powerUps.freezeTime ?? powerUps.freeze ?? powerUps.congelar,
    cons.freezeTime,
    inv?.utilities?.freezeTime,
    [inv?.AID_004, inv?.aid_freeze_time, inv?.consumable_congelar_tempo, inv?.freezeTime, inv?.ajuda_congelar]
  )

  const publicVote = resolveAidCount(
    powerUps.publicVote ?? powerUps.publico,
    cons.publicVote ?? cons.publico,
    inv?.utilities?.publicVote,
    [inv?.AID_003, inv?.aid_public_vote, inv?.consumable_public_vote, inv?.HELP_005, inv?.publicVote, inv?.ajuda_publico]
  )

  const hints = resolveAidCount(
    powerUps.hints ?? powerUps.hint ?? powerUps.dica ?? powerUps.pista,
    cons.hints ?? cons.hint ?? cons.dica,
    inv?.utilities?.hints,
    [inv?.AID_001, inv?.aid_hint, inv?.consumable_pista, inv?.pista_historica, inv?.ajuda_pista, inv?.hint]
  )

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

  // Garantir que os IDs canónicos e aliases de ajudas estão sincronizados em rawMap
  rawMap['AID_001'] = hints
  rawMap['aid_hint'] = hints
  rawMap['consumable_pista'] = hints
  rawMap['pista_historica'] = hints
  rawMap['ajuda_pista'] = hints
  rawMap['hint'] = hints
  rawMap['hints'] = hints

  rawMap['AID_002'] = fiftyFifty
  rawMap['aid_50_50'] = fiftyFifty
  rawMap['consumable_50_50'] = fiftyFifty
  rawMap['help5050'] = fiftyFifty
  rawMap['ajuda_5050'] = fiftyFifty

  rawMap['AID_003'] = publicVote
  rawMap['aid_public_vote'] = publicVote
  rawMap['consumable_public_vote'] = publicVote
  rawMap['HELP_005'] = publicVote
  rawMap['publicVote'] = publicVote
  rawMap['ajuda_publico'] = publicVote

  rawMap['AID_004'] = freezeTime
  rawMap['aid_freeze_time'] = freezeTime
  rawMap['consumable_congelar_tempo'] = freezeTime
  rawMap['freezeTime'] = freezeTime
  rawMap['ajuda_congelar'] = freezeTime

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
      hints,
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
