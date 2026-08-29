import fs from 'fs'
import path from 'path'
import { ARENA_SHOP_CATALOG, ARENA_CATEGORIES_LIST } from '../src/data/shopArenas'

function cleanShopArenas() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'shopArenas.ts')

  // Gerar o novo conteúdo limpo sem campos de imagens
  const cleanedCatalog = ARENA_SHOP_CATALOG.map((arena) => {
    const {
      shopImage,
      gameImage,
      gameBackground,
      duelImage,
      duelBackground,
      thumbnail,
      image,
      imagePath,
      background,
      ...rest
    } = arena as any

    return rest
  })

  const fileContent = `import type {
  ArenaDefinition,
  Arena,
  ArenaItem,
  ArenaRarity,
  ArenaEffect,
  ArenaCategory,
} from '@/src/types/arena'

export type { ArenaDefinition, Arena, ArenaItem, ArenaRarity, ArenaEffect, ArenaCategory }

export const getArenaRarityBadge = (rarity: ArenaRarity): string => {
  switch (rarity) {
    case 'Comum':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'Rara':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    case 'Épica':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Lendária':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
    case 'Mítica':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
    case 'Exclusiva':
      return 'bg-rose-600/30 text-rose-200 border-rose-400/60 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700'
  }
}

export const ARENA_CATEGORIES_LIST = ${JSON.stringify(ARENA_CATEGORIES_LIST, null, 2)} as const

export const ARENA_SHOP_CATALOG: ArenaDefinition[] = ${JSON.stringify(cleanedCatalog, null, 2)}

export const FALLBACK_ARENA: ArenaDefinition = ARENA_SHOP_CATALOG[0]

export const shopArenas: ArenaDefinition[] = ARENA_SHOP_CATALOG

export function getArenaById(id: string | null | undefined): ArenaDefinition {
  if (!id) return FALLBACK_ARENA
  const normalizedId = String(id).toLowerCase().trim()

  const directMatch = ARENA_SHOP_CATALOG.find(
    (a) => a.id.toLowerCase() === normalizedId,
  )
  if (directMatch) return directMatch

  // Mapeamento retrocompatível para IDs legados
  const legacyAliases: Record<string, string> = {
    'arena-1': 'arena_praca_liberdade',
    'arena-2': 'arena_castelo_obidos',
    'arena-3': 'arena_costa_atlantica',
    'arena-4': 'arena_ponte_d_luis',
    'arena-5': 'arena_lisboa_imperial',
    'arena-6': 'arena_torre_belem',
    'arena-7': 'arena_vulcao_erupcao',
    'arena-8': 'arena_madeira_tropical',
    'arena-9': 'arena_pico_estrelas',
    'arena-10': 'arena_madeira_noite',
    'arena-1v1': 'arena_estadio_nacional',
    'arena_1': 'arena_praca_liberdade',
    'arena_2': 'arena_castelo_obidos',
    'arena_3': 'arena_costa_atlantica',
    'arena_4': 'arena_ponte_d_luis',
    'arena_5': 'arena_lisboa_imperial',
    'arena_6': 'arena_torre_belem',
    'arena_7': 'arena_vulcao_erupcao',
    'arena_8': 'arena_madeira_tropical',
    'arena_9': 'arena_pico_estrelas',
    'arena_10': 'arena_madeira_noite',
    'estadio-nacional': 'arena_estadio_nacional',
    'batalha-medieval': 'arena_batalha_medieval',
    'castelo-obidos': 'arena_castelo_obidos',
    'praca-liberdade': 'arena_praca_liberdade',
    'ponte-d-luis': 'arena_ponte_d_luis',
    'torre-belem': 'arena_torre_belem',
    'vulcao-acores': 'arena_vulcao_erupcao',
  }

  const aliasTarget = legacyAliases[normalizedId]
  if (aliasTarget) {
    const aliasedMatch = ARENA_SHOP_CATALOG.find((a) => a.id === aliasTarget)
    if (aliasedMatch) return aliasedMatch
  }

  return FALLBACK_ARENA
}

export function getRandomArena(): ArenaDefinition {
  const randomIndex = Math.floor(Math.random() * ARENA_SHOP_CATALOG.length)
  return ARENA_SHOP_CATALOG[randomIndex] || FALLBACK_ARENA
}

export function getDefaultArena(): ArenaDefinition {
  return ARENA_SHOP_CATALOG[0] || FALLBACK_ARENA
}
`

  fs.writeFileSync(filePath, fileContent, 'utf-8')
  console.log('✅ src/data/shopArenas.ts atualizado sem campos de imagem.')
}

cleanShopArenas()
