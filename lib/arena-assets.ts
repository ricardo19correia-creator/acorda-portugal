import { ARENA_SHOP_CATALOG, ARENA_IMAGES, getArenaById, getOfficialArenaImage } from '@/src/data/shopArenas'
import { getSupremeArenaById, SUPREME_ARENAS, type SupremeArenaDefinition } from '@/lib/supreme-arenas'
import type { ArenaDefinition } from '@/src/types/arena'

export { ARENA_IMAGES, getOfficialArenaImage, SUPREME_ARENAS }

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
  isSupreme?: boolean
  supremeData?: SupremeArenaDefinition
}

/**
 * Obtém os metadados e imagem oficial 1:1 de uma arena (com prioridade para as 11 Arenas Supremas 2150)
 */
export function getArenaAssets(arenaIdOrDef: string | ArenaDefinition | null | undefined): ArenaAssetProfile {
  if (typeof arenaIdOrDef === 'string' && arenaIdOrDef) {
    const supreme = getSupremeArenaById(arenaIdOrDef)
    if (supreme) {
      return {
        id: supreme.id,
        name: supreme.name,
        image: supreme.assetPath,
        shopImage: supreme.assetPath,
        gameBackground: supreme.assetPath,
        gameImage: supreme.assetPath,
        duelBackground: supreme.assetPath,
        duelImage: supreme.assetPath,
        thumbnail: supreme.thumbnailPath,
        effect: supreme.effectType,
        meaning: supreme.description,
        isSupreme: true,
        supremeData: supreme,
      }
    }
  }

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
    isSupreme: false,
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
