import { ARENA_SHOP_CATALOG, ARENA_IMAGES, getArenaById, getOfficialArenaImage } from '@/src/data/shopArenas'
import type { ArenaDefinition } from '@/src/types/arena'

export { ARENA_IMAGES, getOfficialArenaImage }

export interface ArenaAssetProfile {
  id: string
  name: string
  image: string
  shopImage: string
  gameBackground: string
  gameImage: string
  duelBackground: string
  duelImage: string
  thumbnail: string
  effect: string
  meaning: string
}

/**
 * Obtém os metadados e imagem oficial 1:1 de uma arena
 */
export function getArenaAssets(arenaIdOrDef: string | ArenaDefinition | null | undefined): ArenaAssetProfile {
  const arena: ArenaDefinition =
    typeof arenaIdOrDef === 'string'
      ? getArenaById(arenaIdOrDef)
      : arenaIdOrDef || ARENA_SHOP_CATALOG[0]

  const img = arena.image || getOfficialArenaImage(arena.id)

  return {
    id: arena.id,
    name: arena.name,
    image: img,
    shopImage: img,
    gameBackground: img,
    gameImage: img,
    duelBackground: img,
    duelImage: img,
    thumbnail: img,
    effect: arena.effect || 'none',
    meaning: arena.meaning || '',
  }
}

export function getArenaShopImage(id: string): string {
  return getArenaAssets(id).shopImage
}

export function getArenaGameBackground(id: string): string {
  return getArenaAssets(id).gameBackground
}

export function getArenaDuelBackground(id: string): string {
  return getArenaAssets(id).duelBackground
}
