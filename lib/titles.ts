// Acorda Portugal — Sistema Canónico Central de Títulos
// Fonte única de verdade para Catálogo, Identificadores Estáveis e Resolução

import { TITLE_SHOP_CATALOG, type TitleItem, type TitleRarity, type TitleGroup, getTitleRarityBadge } from '@/src/data/shopTitles'
import { PROGRESSION_LEVELS, calculateLevelProgress } from '@/lib/progression'
import type { UserProfile } from '@/lib/game-data'

export type { TitleItem, TitleRarity, TitleGroup }
export { getTitleRarityBadge }

export const DEFAULT_STARTER_TITLE_ID = 'tit_novico'
export const DEFAULT_STARTER_TITLE_NAME = 'Noviço da Nação'

export interface ResolvedTitle {
  id: string
  name: string
  cleanName: string
  rarity: TitleRarity
  badgeColor: string
  isStarter: boolean
  isLevelTitle: boolean
  item: TitleItem | null
}

/**
 * Título inicial fornecido gratuitamente a todos os jogadores
 */
export const STARTER_TITLE: TitleItem = {
  id: DEFAULT_STARTER_TITLE_ID,
  name: 'Noviço da Nação',
  categoryKey: 'geral',
  categoryTitle: 'Iniciação',
  group: 'tematico',
  price: 0,
  requirement: 'Título inicial oficial de boas-vindas.',
  rarity: 'Comum',
  badgeColor: getTitleRarityBadge('Comum'),
}

/**
 * Títulos de economia / prestígio (compatibilidade retroativa com IDs title_...)
 */
export const PRESTIGE_TITLES: TitleItem[] = [
  {
    id: 'title_rei_18_distritos',
    name: 'Rei dos 18 Distritos',
    categoryKey: 'distrito',
    categoryTitle: 'Distrito',
    group: 'distrito',
    price: 2500,
    requirement: 'Adquirido na Loja 🪙 Moedas Acorda',
    rarity: 'Lendário',
    badgeColor: getTitleRarityBadge('Lendário'),
  },
  {
    id: 'title_tuga_cibernetico',
    name: 'Tuga Cibernético',
    categoryKey: 'ciencia-tecnologia',
    categoryTitle: 'Ciência e Tecnologia',
    group: 'tematico',
    price: 1500,
    requirement: 'Adquirido na Loja 🪙 Moedas Acorda',
    rarity: 'Épico',
    badgeColor: getTitleRarityBadge('Épico'),
  },
  {
    id: 'title_terror_do_quiz',
    name: 'Terror do Quiz',
    categoryKey: 'competicao',
    categoryTitle: 'Duelos 1v1',
    group: 'competicao',
    price: 800,
    requirement: 'Adquirido na Loja 🪙 Moedas Acorda',
    rarity: 'Raro',
    badgeColor: getTitleRarityBadge('Raro'),
  },
  {
    id: 'title_guardiao_lusitano',
    name: 'Guardião Lusitano',
    categoryKey: 'portugal',
    categoryTitle: 'Portugal',
    group: 'tematico',
    price: 1500,
    requirement: 'Adquirido na Loja 🪙 Moedas Acorda',
    rarity: 'Épico',
    badgeColor: getTitleRarityBadge('Épico'),
  },
  {
    id: 'title_voz_do_povo',
    name: 'Voz do Povo',
    categoryKey: 'cultura',
    categoryTitle: 'Cultura',
    group: 'tematico',
    price: 250,
    requirement: 'Adquirido na Loja 🪙 Moedas Acorda',
    rarity: 'Comum',
    badgeColor: getTitleRarityBadge('Comum'),
  },
  {
    id: 'title_patriota',
    name: 'O Patriota',
    categoryKey: 'portugal',
    categoryTitle: 'Portugal',
    group: 'tematico',
    price: 250,
    requirement: 'Adquirido na Loja 🪙 Moedas Acorda',
    rarity: 'Comum',
    badgeColor: getTitleRarityBadge('Comum'),
  },
  {
    id: 'title_conquistador_supremo',
    name: 'O Conquistador Supremo',
    categoryKey: 'exclusivo',
    categoryTitle: 'Conquistas',
    group: 'exclusivo',
    price: 2500,
    requirement: 'Título régio 3D banhado a ouro em honra ao primeiro Rei de Portugal',
    rarity: 'Lendário',
    badgeColor: getTitleRarityBadge('Lendário'),
  },
  {
    id: 'title_lenda_viva',
    name: 'Lenda Viva',
    categoryKey: 'exclusivo',
    categoryTitle: 'Prestígio',
    group: 'exclusivo',
    price: 4000,
    requirement: 'O título de maior prestígio para quem domina todos os desafios de Portugal',
    rarity: 'Mítico',
    badgeColor: getTitleRarityBadge('Mítico'),
  },
]

/**
 * Títulos associados a níveis de progressão
 */
export const PROGRESSION_TITLES: TitleItem[] = PROGRESSION_LEVELS.map((lvl) => {
  const rarity: TitleRarity =
    lvl.level >= 20 ? 'Mítico' :
    lvl.level >= 16 ? 'Lendário' :
    lvl.level >= 11 ? 'Épico' :
    lvl.level >= 6 ? 'Raro' : 'Comum'

  return {
    id: `title_lvl_${lvl.level}`,
    name: lvl.cleanTitle,
    categoryKey: 'progressao',
    categoryTitle: 'Progressão',
    group: 'progressao',
    price: null,
    requirement: `Alcançar Nível ${lvl.level} (${lvl.xpRequired.toLocaleString('pt-PT')} XP)`,
    rarity,
    badgeColor: getTitleRarityBadge(rarity),
  }
})

/**
 * Catálogo Mestre Completo (Une todos os títulos do ecossistema sem duplicados)
 */
const MASTER_CATALOG_MAP: Map<string, TitleItem> = new Map()

// Inserir starter title
MASTER_CATALOG_MAP.set(STARTER_TITLE.id, STARTER_TITLE)

// Inserir títulos oficiais da loja
for (const item of TITLE_SHOP_CATALOG) {
  MASTER_CATALOG_MAP.set(item.id, item)
}

// Inserir títulos de prestígio
for (const item of PRESTIGE_TITLES) {
  if (!MASTER_CATALOG_MAP.has(item.id)) {
    MASTER_CATALOG_MAP.set(item.id, item)
  }
}

// Inserir títulos de progressão por nível
for (const item of PROGRESSION_TITLES) {
  if (!MASTER_CATALOG_MAP.has(item.id)) {
    MASTER_CATALOG_MAP.set(item.id, item)
  }
}

export const MASTER_TITLE_CATALOG: TitleItem[] = Array.from(MASTER_CATALOG_MAP.values())

/**
 * Normaliza uma string de título (remove prefixos e aspas/brackets)
 */
export function sanitizeTitleName(name: string | null | undefined): string {
  if (!name) return ''
  return name
    .replace(/^Título:\s*/i, '')
    .replace(/^«\s*/, '')
    .replace(/\s*»$/, '')
    .replace(/^"\s*/, '')
    .replace(/\s*"$/, '')
    .trim()
}

/**
 * Tabela de aliases para migração e compatibilidade com dados legados
 */
const TITLE_ALIASES: Record<string, string> = {
  'title_novico_nacao': 'tit_novico',
  'title_novico': 'tit_novico',
  'novico_da_nacao': 'tit_novico',
  'novico': 'tit_novico',
  'tit_excl_fundador': 'tit_excl_fundador',
  'fundador': 'tit_excl_fundador',
  'fundador da nação': 'tit_excl_fundador',
  'membro fundador': 'tit_excl_fundador',
  'rei dos 18 distritos': 'title_rei_18_distritos',
  'tuga cibernético': 'title_tuga_cibernetico',
  'terror do quiz': 'title_terror_do_quiz',
  'guardião lusitano': 'title_guardiao_lusitano',
  'voz do povo': 'title_voz_do_povo',
  'o patriota': 'title_patriota',
  'patriota': 'title_patriota',
  'o conquistador supremo': 'title_conquistador_supremo',
  'conquistador supremo': 'title_conquistador_supremo',
  'lenda viva': 'title_lenda_viva',
  'filho de portugal': 'tit_pt_1',
}

/**
 * Procura um título pelo ID oficial no Catálogo Mestre
 */
export function getTitleById(id: string | null | undefined): TitleItem | null {
  if (!id) return null
  const cleanId = id.trim()
  if (MASTER_CATALOG_MAP.has(cleanId)) {
    return MASTER_CATALOG_MAP.get(cleanId)!
  }

  const aliasId = TITLE_ALIASES[cleanId.toLowerCase()]
  if (aliasId && MASTER_CATALOG_MAP.has(aliasId)) {
    return MASTER_CATALOG_MAP.get(aliasId)!
  }

  return null
}

/**
 * Procura um título pelo Nome no Catálogo Mestre
 */
export function getTitleByName(name: string | null | undefined): TitleItem | null {
  if (!name) return null
  const clean = sanitizeTitleName(name).toLowerCase()
  if (!clean) return null

  // 1. Procura direta em aliases
  const aliasId = TITLE_ALIASES[clean]
  if (aliasId && MASTER_CATALOG_MAP.has(aliasId)) {
    return MASTER_CATALOG_MAP.get(aliasId)!
  }

  // 2. Procura no catálogo mestre por comparação sanitizada
  for (const item of MASTER_CATALOG_MAP.values()) {
    const itemClean = sanitizeTitleName(item.name).toLowerCase()
    if (itemClean === clean) {
      return item
    }
  }

  return null
}

/**
 * Resolve qualquer entrada (seja ID ou Nome legado) para o TitleItem correspondente
 */
export function resolveTitle(idOrName: string | null | undefined): TitleItem | null {
  if (!idOrName) return null
  const byId = getTitleById(idOrName)
  if (byId) return byId
  return getTitleByName(idOrName)
}

/**
 * Verifica se um jogador possui um determinado título
 */
export function isTitleOwned(
  inventoryTitles: (string | unknown)[] | null | undefined,
  titleIdOrName: string,
): boolean {
  if (!titleIdOrName) return false
  const target = resolveTitle(titleIdOrName)
  if (!target) return false

  // O título starter 'tit_novico' é gratuito e SEMPRE possuído por todos os jogadores
  if (target.id === DEFAULT_STARTER_TITLE_ID) return true

  if (!inventoryTitles || !Array.isArray(inventoryTitles)) return false

  const targetClean = sanitizeTitleName(target.name).toLowerCase()

  return inventoryTitles.some((inv) => {
    if (typeof inv !== 'string') return false
    if (inv === target.id) return true
    if (inv.toLowerCase() === target.id.toLowerCase()) return true
    const invResolved = resolveTitle(inv)
    if (invResolved && invResolved.id === target.id) return true
    if (sanitizeTitleName(inv).toLowerCase() === targetClean) return true
    return false
  })
}

/**
 * Resolve o título equipado de um jogador aplicando com rigor a REGRA DE PRECEDÊNCIA:
 * 1. `equippedTitleId` (identificador canónico persistido)
 * 2. `equipped.title` (se presente no objeto de cosméticos equipados)
 * 3. `equippedTitle` (campo de exibição persistido)
 * 4. Título do Nível de Progressão atual (calculado a partir do XP)
 * 5. Título Starter padrão ('Noviço da Nação')
 */
export function resolvePlayerEquippedTitle(
  profile: Partial<UserProfile> | null | undefined,
  xp: number = 0,
): ResolvedTitle {
  const currentXp = typeof profile?.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : Math.max(0, xp)
  const levelProgress = calculateLevelProgress(currentXp)
  const levelTitleName = levelProgress.currentLevel.cleanTitle || 'Curioso'

  // 1. Tentar por `equippedTitleId`
  const rawTitleId = (profile as any)?.equippedTitleId || (profile?.equipped as any)?.titleId
  if (rawTitleId && typeof rawTitleId === 'string' && rawTitleId.trim()) {
    const item = resolveTitle(rawTitleId)
    if (item) {
      const clean = sanitizeTitleName(item.name)
      return {
        id: item.id,
        name: item.name,
        cleanName: clean,
        rarity: item.rarity,
        badgeColor: item.badgeColor,
        isStarter: item.id === DEFAULT_STARTER_TITLE_ID,
        isLevelTitle: false,
        item,
      }
    }
  }

  // 2. Tentar por `equipped.title`
  const rawEquippedTitle = profile?.equipped?.title
  if (rawEquippedTitle && typeof rawEquippedTitle === 'string' && rawEquippedTitle.trim()) {
    const item = resolveTitle(rawEquippedTitle)
    if (item) {
      const clean = sanitizeTitleName(item.name)
      return {
        id: item.id,
        name: item.name,
        cleanName: clean,
        rarity: item.rarity,
        badgeColor: item.badgeColor,
        isStarter: item.id === DEFAULT_STARTER_TITLE_ID,
        isLevelTitle: false,
        item,
      }
    }
  }

  // 3. Tentar por `equippedTitle`
  const rawEquippedFieldName = profile?.equippedTitle
  if (rawEquippedFieldName && typeof rawEquippedFieldName === 'string' && rawEquippedFieldName.trim()) {
    const item = resolveTitle(rawEquippedFieldName)
    if (item) {
      const clean = sanitizeTitleName(item.name)
      return {
        id: item.id,
        name: item.name,
        cleanName: clean,
        rarity: item.rarity,
        badgeColor: item.badgeColor,
        isStarter: item.id === DEFAULT_STARTER_TITLE_ID,
        isLevelTitle: false,
        item,
      }
    }
  }

  // 3.5 Tentar por `title` (campo legado de utilizador antigo)
  const rawTitleFieldName = (profile as any)?.title
  if (rawTitleFieldName && typeof rawTitleFieldName === 'string' && rawTitleFieldName.trim()) {
    const item = resolveTitle(rawTitleFieldName)
    if (item && item.id !== DEFAULT_STARTER_TITLE_ID) {
      const clean = sanitizeTitleName(item.name)
      return {
        id: item.id,
        name: item.name,
        cleanName: clean,
        rarity: item.rarity,
        badgeColor: item.badgeColor,
        isStarter: false,
        isLevelTitle: false,
        item,
      }
    }
  }

  // 4. Fallback inteligente: Título do Nível de Progressão (se nível > 1)
  if (levelProgress.currentLevel.level > 1 && levelTitleName) {
    const lvlItem = resolveTitle(levelTitleName)
    const rarity: TitleRarity = lvlItem ? lvlItem.rarity : 'Comum'
    return {
      id: lvlItem ? lvlItem.id : `title_lvl_${levelProgress.currentLevel.level}`,
      name: levelTitleName,
      cleanName: levelTitleName,
      rarity,
      badgeColor: lvlItem ? lvlItem.badgeColor : getTitleRarityBadge(rarity),
      isStarter: false,
      isLevelTitle: true,
      item: lvlItem,
    }
  }

  // 5. Fallback Final Canónico: Starter Title ('Noviço da Nação' / 'tit_novico')
  return {
    id: STARTER_TITLE.id,
    name: STARTER_TITLE.name,
    cleanName: STARTER_TITLE.name,
    rarity: STARTER_TITLE.rarity,
    badgeColor: STARTER_TITLE.badgeColor,
    isStarter: true,
    isLevelTitle: false,
    item: STARTER_TITLE,
  }
}

/**
 * Migra de forma não destrutiva dados legados de utilizador
 */
export function migrateLegacyTitleData(userData: any): {
  equippedTitleId: string
  equippedTitle: string
  title: string
  equipped: {
    title: string
    titleId: string
    titleName: string
    [key: string]: any
  }
} {
  if (!userData) {
    return {
      equippedTitleId: DEFAULT_STARTER_TITLE_ID,
      equippedTitle: DEFAULT_STARTER_TITLE_NAME,
      title: DEFAULT_STARTER_TITLE_NAME,
      equipped: {
        title: DEFAULT_STARTER_TITLE_ID,
        titleId: DEFAULT_STARTER_TITLE_ID,
        titleName: DEFAULT_STARTER_TITLE_NAME,
      },
    }
  }

  const resolved = resolvePlayerEquippedTitle(userData, userData.xp || 0)
  return {
    equippedTitleId: resolved.id,
    equippedTitle: resolved.cleanName,
    title: resolved.cleanName,
    equipped: {
      ...(userData.equipped || {}),
      title: resolved.id,
      titleId: resolved.id,
      titleName: resolved.cleanName,
    },
  }
}
