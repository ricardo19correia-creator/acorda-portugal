import { ARENA_SHOP_CATALOG, ARENA_CATEGORIES_LIST, getArenaById } from '@/src/data/shopArenas'
import type { ArenaDefinition, ArenaItem, ArenaRarity, ArenaCategory, ArenaEffect } from '@/src/types/arena'

export type { ArenaDefinition, ArenaItem, ArenaRarity, ArenaCategory, ArenaEffect }
export { ARENA_CATEGORIES_LIST, getArenaById }

/**
 * Lista Canónica Oficial de Arenas de Portugal
 */
export const ARENAS: ArenaItem[] = ARENA_SHOP_CATALOG.map((arena) => ({
  id: arena.id,
  name: arena.name,
  description: arena.description,
  image: arena.image,
  price: arena.price ?? 0,
  rarity: (arena.rarity === 'Comum'
    ? 'common'
    : arena.rarity === 'Rara'
    ? 'rare'
    : arena.rarity === 'Épica'
    ? 'epic'
    : arena.rarity === 'Exclusiva' || arena.rarity === 'Mítica'
    ? 'exclusive'
    : 'legendary') as ArenaItem['rarity'],
  unlockedByDefault: arena.unlockedByDefault,
  category: arena.category,
  effect: arena.effect,
  meaning: arena.meaning,
}))

export default ARENAS
