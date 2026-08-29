import {
  ARENA_SHOP_CATALOG,
  getArenaById as getShopArenaById,
  getDefaultArena as getShopDefaultArena,
  getRandomArena as getShopRandomArena,
  getArenaRarityBadge,
  ARENA_CATEGORIES_LIST,
  FALLBACK_ARENA,
  type ArenaDefinition,
  type Arena,
  type ArenaItem,
  type ArenaRarity,
  type ArenaEffect,
  type ArenaCategory,
} from '@/src/data/shopArenas'

export type {
  ArenaDefinition,
  Arena,
  ArenaItem,
  ArenaRarity,
  ArenaEffect,
  ArenaCategory,
}

export { getArenaRarityBadge, ARENA_CATEGORIES_LIST, FALLBACK_ARENA }

export const ARENAS: ArenaDefinition[] = ARENA_SHOP_CATALOG
export const OFFICIAL_ARENAS: Arena[] = ARENA_SHOP_CATALOG

export function getArenaById(id: string): ArenaDefinition {
  return getShopArenaById(id)
}

export function getDefaultArena(): ArenaDefinition {
  return getShopDefaultArena()
}

export function getRandomArena(): ArenaDefinition {
  return getShopRandomArena()
}
