import { SHOP_CATALOG, type ShopItem } from '@/lib/economy'
import type { UserProfile, EquippedCosmetics } from '@/lib/game-data'
import { resolvePlayerEquippedTitle, resolveTitle, getTitleRarityBadge, sanitizeTitleName, type TitleItem } from '@/lib/titles'

export type { EquippedCosmetics, ShopItem }
export type { TitleItem }

export type GameThemeId =
  | 'theme_fado_cyberpunk'
  | 'theme_ondas_nazare'
  | 'theme_vulcao_acores'
  | 'theme_matriz_tron'
  | 'theme_templo_dinis'
  | 'theme_matriz_cosmica'
  | 'default'

export type SoundpackId =
  | 'soundpack_comentador_futebol'
  | 'soundpack_taberna_antiga'
  | 'soundpack_scifi_80s'
  | 'default'

export type StreakEffectId =
  | 'streak_chama_tripla'
  | 'streak_moedas_ouro'
  | 'sfx_cravos_abril'
  | 'sfx_raio_lusitano'
  | 'default'

export type GameThemeMeta = {
  id: GameThemeId
  name: string
  subtitle: string
  glowColor: string
  accentColor: string
  bgGradient: string
  borderClass: string
  badgeClass: string
  ambientClass: string
}

export const GAME_THEMES: Record<string, GameThemeMeta> = {
  theme_fado_cyberpunk: {
    id: 'theme_fado_cyberpunk',
    name: 'Noite do Fado Cyberpunk',
    subtitle: 'Alfama Néon & Névoa Ambarina',
    glowColor: '#a855f7',
    accentColor: '#f59e0b',
    bgGradient: 'from-purple-950/95 via-amber-950/60 to-black',
    borderClass: 'border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.35)]',
    badgeClass: 'bg-purple-950/80 border-purple-400 text-purple-300',
    ambientClass: 'theme-fado-cyberpunk',
  },
  theme_ondas_nazare: {
    id: 'theme_ondas_nazare',
    name: 'Ondas Gigantes da Nazaré',
    subtitle: 'Vórtice Marinho Bioluminescente',
    glowColor: '#06b6d4',
    accentColor: '#3b82f6',
    bgGradient: 'from-cyan-950/95 via-blue-950/70 to-black',
    borderClass: 'border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)]',
    badgeClass: 'bg-cyan-950/80 border-cyan-400 text-cyan-300',
    ambientClass: 'theme-ondas-nazare',
  },
  theme_vulcao_acores: {
    id: 'theme_vulcao_acores',
    name: 'Vulcão dos Açores — Fogo Puro',
    subtitle: 'Basalto Ardente & Brasas Incandescentes',
    glowColor: '#ef4444',
    accentColor: '#f97316',
    bgGradient: 'from-red-950/95 via-amber-950/70 to-black',
    borderClass: 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.4)]',
    badgeClass: 'bg-red-950/80 border-red-500 text-red-300',
    ambientClass: 'theme-vulcao-acores',
  },
  theme_matriz_tron: {
    id: 'theme_matriz_tron',
    name: 'Matriz Lusitana 3D — Tron Nacional',
    subtitle: 'Grelha Digital Esmeralda & Circuitos',
    glowColor: '#10b981',
    accentColor: '#06b6d4',
    bgGradient: 'from-emerald-950/95 via-teal-950/60 to-black',
    borderClass: 'border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.35)]',
    badgeClass: 'bg-emerald-950/80 border-emerald-400 text-emerald-300',
    ambientClass: 'theme-matriz-tron',
  },
  theme_templo_dinis: {
    id: 'theme_templo_dinis',
    name: 'Templo Dourado de D. Dinis',
    subtitle: 'Ouro Real Escovado & Luz Volumétrica',
    glowColor: '#eab308',
    accentColor: '#f59e0b',
    bgGradient: 'from-yellow-950/95 via-amber-950/80 to-black',
    borderClass: 'border-yellow-500/50 shadow-[0_0_45px_rgba(234,179,8,0.45)]',
    badgeClass: 'bg-yellow-950/80 border-yellow-400 text-yellow-300',
    ambientClass: 'theme-templo-dinis',
  },
  theme_matriz_cosmica: {
    id: 'theme_matriz_cosmica',
    name: 'Matriz Cósmica dos Descobrimentos',
    subtitle: 'Constelações Holográficas & Ondas de Choque Néon',
    glowColor: '#8b5cf6',
    accentColor: '#06b6d4',
    bgGradient: 'from-indigo-950/95 via-purple-950/80 to-black',
    borderClass: 'border-indigo-500/50 shadow-[0_0_45px_rgba(139,92,246,0.45)]',
    badgeClass: 'bg-indigo-950/80 border-indigo-400 text-indigo-300',
    ambientClass: 'theme-matriz-cosmica',
  },
  default: {
    id: 'default',
    name: 'Arena Clássica Nacional',
    subtitle: 'Estilo Oficial Acorda Portugal',
    glowColor: '#10b981',
    accentColor: '#00ffa2',
    bgGradient: 'from-emerald-950/40 via-zinc-950/90 to-black',
    borderClass: 'border-emerald-500/30',
    badgeClass: 'bg-zinc-900 border-white/10 text-muted-foreground',
    ambientClass: 'theme-default',
  },
}

export function normalizeThemeId(themeId?: string | null): GameThemeId {
  if (!themeId) return 'default'
  if (
    themeId === 'templo_dourado' ||
    themeId === 'arena_templo_dourado' ||
    themeId === 'vip_theme_templo_dinis' ||
    themeId === 'theme_templo_dinis'
  ) {
    return 'theme_templo_dinis'
  }
  if (
    themeId === 'matriz_cosmica' ||
    themeId === 'arena_matriz_cosmica' ||
    themeId === 'vip_theme_matriz_cosmica' ||
    themeId === 'theme_matriz_cosmica'
  ) {
    return 'theme_matriz_cosmica'
  }
  if (
    themeId === 'fogo_acores' ||
    themeId === 'arena_fogo_acores' ||
    themeId === 'vip_arena_fogo_acores' ||
    themeId === 'theme_vulcao_acores'
  ) {
    return 'theme_vulcao_acores'
  }
  if (
    themeId === 'vortice_nazare' ||
    themeId === 'arena_vortice_nazare' ||
    themeId === 'vip_arena_vortice_nazare' ||
    themeId === 'theme_ondas_nazare'
  ) {
    return 'theme_ondas_nazare'
  }
  if (
    themeId === 'default_tron' ||
    themeId === 'theme_matriz_tron' ||
    themeId === 'tron'
  ) {
    return 'theme_matriz_tron'
  }
  if (themeId === 'theme_fado_cyberpunk' || themeId === 'fado') {
    return 'theme_fado_cyberpunk'
  }
  return (GAME_THEMES[themeId]?.id as GameThemeId) || 'default'
}

export function getThemeMeta(themeId?: string | null): GameThemeMeta {
  const normalized = normalizeThemeId(themeId)
  return GAME_THEMES[normalized] || GAME_THEMES.default
}

export function getEquippedCosmetics(profile: Partial<UserProfile> | null | undefined) {
  const equipped: EquippedCosmetics = (profile as any)?.equipped || {}
  const frameId = equipped.frame || null
  const resolvedTitle = resolvePlayerEquippedTitle(profile, profile?.xp || 0)
  const titleId = resolvedTitle.id
  const themeId = equipped.theme || null
  const auraId = equipped.aura || null
  const sfxId = equipped.sfx || null
  const soundpackId = equipped.soundpack || null
  const streakEffectId = equipped.streak_effect || null

  const frameItem: ShopItem | null = frameId ? SHOP_CATALOG.find((i) => i.id === frameId) || null : null
  const titleItem: TitleItem | null = resolvedTitle.item
  const themeItem: ShopItem | null = themeId ? SHOP_CATALOG.find((i) => i.id === themeId) || null : null
  const auraItem: ShopItem | null = auraId ? SHOP_CATALOG.find((i) => i.id === auraId) || null : null
  const sfxItem: ShopItem | null = sfxId ? SHOP_CATALOG.find((i) => i.id === sfxId) || null : null
  const soundpackItem: ShopItem | null = soundpackId ? SHOP_CATALOG.find((i) => i.id === soundpackId) || null : null
  const streakEffectItem: ShopItem | null = streakEffectId ? SHOP_CATALOG.find((i) => i.id === streakEffectId) || null : null

  return {
    frameId,
    titleId,
    themeId,
    auraId,
    sfxId,
    soundpackId,
    streakEffectId,
    frameItem,
    titleItem,
    resolvedTitle,
    themeItem,
    auraItem,
    sfxItem,
    soundpackItem,
    streakEffectItem,
  }
}

import { getFrameById } from '@/data/frames'

/**
 * Retorna as classes CSS de borda e efeito luminoso correspondentes à moldura equipada
 */
export function getFrameStyle(frameId?: string | null): string {
  if (!frameId || frameId === 'default') {
    return 'ring-2 ring-primary/40'
  }
  const frame = getFrameById(frameId)
  if (frame) {
    if (frame.rarity === 'Mítico') {
      return 'ring-4 ring-pink-500 border-2 border-red-500 shadow-[0_0_35px_rgba(236,72,153,0.95)] animate-pulse'
    }
    if (frame.rarity === 'Lendário') {
      return 'ring-4 ring-amber-400 border-2 border-yellow-300 shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pulse'
    }
    if (frame.rarity === 'Épico') {
      return 'ring-4 ring-purple-400 border-2 border-indigo-400 shadow-[0_0_25px_rgba(168,85,247,0.85)]'
    }
    return 'ring-4 ring-cyan-400 border border-sky-300 shadow-[0_0_20px_rgba(6,182,212,0.8)]'
  }
  return 'ring-2 ring-primary/40'
}

/**
 * Retorna o estilo do badge do título cosmético equipado
 */
export function getTitleBadgeStyle(titleIdOrName?: string | null): string {
  if (!titleIdOrName) {
    return 'bg-white/10 border border-white/15 text-muted-foreground font-semibold'
  }

  const resolved = resolveTitle(titleIdOrName)
  if (resolved) {
    return `${resolved.badgeColor} font-bold`
  }

  switch (titleIdOrName) {
    case 'title_conquistador_supremo':
      return 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-black font-black shadow-[0_0_25px_rgba(234,179,8,0.9)] border border-yellow-200 animate-pulse'
    case 'title_rei_18_distritos':
      return 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
    case 'title_tuga_cibernetico':
      return 'bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-black shadow-[0_0_14px_rgba(16,185,129,0.6)]'
    case 'title_terror_do_quiz':
      return 'bg-red-950/90 border border-red-500 text-red-300 font-black shadow-[0_0_14px_rgba(239,68,68,0.6)]'
    case 'title_guardiao_lusitano':
      return 'bg-purple-950/90 border border-purple-400 text-purple-300 font-black shadow-[0_0_12px_rgba(192,132,252,0.5)]'
    case 'title_voz_do_povo':
      return 'bg-zinc-800/90 border border-zinc-400 text-zinc-200 font-bold shadow-sm'
    case 'title_patriota':
      return 'bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 font-bold'
    case 'title_lenda_viva':
      return 'bg-gradient-to-r from-purple-600 via-pink-500 to-gold text-white font-black shadow-[0_0_20px_rgba(234,179,8,0.8)]'
    default:
      return 'bg-white/10 border border-white/15 text-muted-foreground font-semibold'
  }
}

/**
 * Retorna o título a ser exibido: o título cosmético equipado se existir, caso contrário o título do nível
 */
export function getPlayerDisplayTitle(
  profile: Partial<UserProfile> | null | undefined,
  fallbackTitle: string = 'Navegador',
): string {
  const resolved = resolvePlayerEquippedTitle(profile, profile?.xp || 0)
  if (resolved && resolved.cleanName) {
    return resolved.cleanName
  }
  return fallbackTitle
}
