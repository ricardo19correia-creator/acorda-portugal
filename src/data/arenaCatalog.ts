/**
 * 🇵🇹 ACORDA PORTUGAL — MASTER ARENA CATALOG (SSOT)
 * Single Source of Truth para todas as 50 Arenas Oficiais do Jogo.
 * Correspondência rigorosa 1:1 com a pasta public/arenas.
 * NENHUM corte, NENHUMA barra vazia, NENHUM efeito de distorção ou camuflagem.
 * Dimensões e rácios matemáticos reais incorporados diretamente no catálogo.
 */

import { ARENA_SHOP_CATALOG, LEGACY_ARENA_ALIASES, type ArenaDefinition } from './shopArenas'

export type ArenaRarity =
  | 'Comum'
  | 'Rara'
  | 'Épica'
  | 'Lendária'
  | 'Mítica'

export type ArenaVisualType = 'jpg_raster' | 'png_raster' | 'jfif_raster'

export type ArenaCategoryType =
  | 'escalao_1'
  | 'escalao_2'
  | 'escalao_3'
  | 'escalao_4'
  | 'escalao_5'
  | 'todos'

export interface ArenaLightingProfile {
  primaryGlow: string
  secondaryGlow: string
  ambientColor: string
  spotlightBeam: string
}

export interface ArenaDimensions {
  width: number
  height: number
  aspectRatio: number
}

/**
 * Tabela exata de dimensões e proporções nativas das 50 arenas físicas
 */
export const ARENA_DIMENSIONS: Record<string, ArenaDimensions> = {
  '/arenas/Abismo Zero.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Alfama 2077.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Arena Cibernética.png': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Atlântida Lusitana.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Baixa Futurista.jpg': { width: 1792, height: 1024, aspectRatio: 1.75 },
  '/arenas/Bastião do Douro.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Baía do Funchal.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Cabo da Descoberta.jpg': { width: 2048, height: 1535, aspectRatio: 1.3342 },
  '/arenas/Caldeira de Magma.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Campos de Aljubarrota.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Canal dos Moliceiros.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Caravelas do Infante.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Cidadela de Guimarães.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Cidadela dos Céus.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Coliseu das Chamas.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Costa Esmeralda.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Cúpula do Atlântico.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Dimensão Flutuante.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Estádio do Fim dos Tempos.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Fenda do Tempo.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Floresta dos Açores.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Fornalha das Sete Cidades.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Fortaleza Glaciar.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Fúria da Nazaré.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Galeria dos Espelhos.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Glória Eterna.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Génese Lusitana.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Hemiciclo dos Fundadores.jpg': { width: 1920, height: 1079, aspectRatio: 1.7794 },
  '/arenas/lisboa Imperial.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Margem do Futuro.jpg': { width: 1920, height: 1072, aspectRatio: 1.791 },
  '/arenas/Metrópole Tejo.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Muralhas de Prata.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Nexus Neural.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/O Coração da Nação.jfif': { width: 2752, height: 1536, aspectRatio: 1.7917 },
  '/arenas/Observatório das Profundezas.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Palácio da Nação.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Panteão dos Reis.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Plataforma Astral.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/portugal 2077.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Promontório de Sagres.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Sala do Trono.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Santuário das Quedas.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Solarpunk Lisboa.jpg': { width: 1495, height: 995, aspectRatio: 1.5025 },
  '/arenas/Tasca da Saudade.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Templo dos Relâmpagos.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Terreiro Dourado.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Tribunal Barroco.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Vigia da Tormenta.jfif': { width: 2816, height: 1536, aspectRatio: 1.8333 },
  '/arenas/Vigília de Camões.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/Vértice Cósmico.jpg': { width: 1376, height: 768, aspectRatio: 1.7917 },
  '/arenas/porto-lisboa-arena.jpg': { width: 571, height: 1024, aspectRatio: 571 / 1024 },
}

export function getArenaDimensions(assetPathOrId?: string | null): ArenaDimensions {
  if (!assetPathOrId) return { width: 1376, height: 768, aspectRatio: 1.7917 }
  
  // Procura direta no mapa por caminho exato
  if (ARENA_DIMENSIONS[assetPathOrId]) {
    return ARENA_DIMENSIONS[assetPathOrId]
  }

  // Tenta resolver por ID ou nome de ficheiro
  const resolved = resolveArena(assetPathOrId)
  if (resolved && ARENA_DIMENSIONS[resolved.assetPath]) {
    return ARENA_DIMENSIONS[resolved.assetPath]
  }

  // Fallback seguro em proporção padrão 16:9
  return { width: 1376, height: 768, aspectRatio: 1.7917 }
}

export interface CanonicalArena {
  id: string
  slug: string
  name: string
  subtitle: string
  rarity: ArenaRarity
  category: ArenaCategoryType
  description: string
  quote?: string
  assetPath: string
  thumbnail: string
  background: string
  effects: string
  unlockRule: 'unlocked_by_default' | 'purchase_coins'
  priceCoins: number
  purchaseRule: string
  gameplayAvailability: boolean
  visualType: ArenaVisualType
  lightingProfile?: ArenaLightingProfile
  aliases: string[]
  width: number
  height: number
  aspectRatio: number
}

export const CANONICAL_ARENAS: CanonicalArena[] = ARENA_SHOP_CATALOG.map((a) => {
  const ext = a.image ? a.image.split('.').pop()?.toLowerCase() : 'jpg'
  const vType: ArenaVisualType = ext === 'png' ? 'png_raster' : ext === 'jfif' ? 'jfif_raster' : 'jpg_raster'
  const assetPath = a.image || `/arenas/${a.name}.jpg`
  const dims = ARENA_DIMENSIONS[assetPath] || { width: 1376, height: 768, aspectRatio: 1.7917 }
  
  return {
    id: a.id,
    slug: a.id.replace('arena_', ''),
    name: a.name,
    subtitle: a.meaning || a.description,
    rarity: a.rarity as ArenaRarity,
    category: a.category as ArenaCategoryType,
    description: a.description,
    quote: a.meaning ? `«${a.meaning}»` : undefined,
    assetPath,
    thumbnail: assetPath,
    background: assetPath,
    effects: 'none',
    unlockRule: a.unlockedByDefault ? 'unlocked_by_default' : 'purchase_coins',
    priceCoins: a.price || 0,
    purchaseRule: a.unlockedByDefault ? 'Desbloqueada de início (Grátis)' : `Disponível na Loja por ${(a.price || 0).toLocaleString('pt-PT')} moedas Acorda.`,
    gameplayAvailability: true,
    visualType: vType,
    aliases: Object.entries(LEGACY_ARENA_ALIASES).filter(([_, target]) => target === a.id).map(([alias]) => alias),
    width: dims.width,
    height: dims.height,
    aspectRatio: dims.aspectRatio,
  }
})

export const MASTER_ARENA_CATALOG: CanonicalArena[] = CANONICAL_ARENAS
export const VIP_ARENAS: CanonicalArena[] = CANONICAL_ARENAS.filter(a => a.category === 'escalao_5')
export const STANDARD_ARENAS: CanonicalArena[] = CANONICAL_ARENAS.filter(a => a.category !== 'escalao_5')

/**
 * Arena Oficial e Exclusiva do Grande Duelo Porto × Lisboa
 * Utilizada como cenário de fundo exclusivo durante as partidas do evento oficial.
 */
export const PORTO_LISBOA_OFFICIAL_ARENA: CanonicalArena = {
  id: 'arena_porto_lisboa',
  slug: 'porto-lisboa',
  name: 'Porto × Lisboa — O Grande Duelo',
  subtitle: 'Arena Suprema do Duelo das Duas Capitais',
  rarity: 'Lendária',
  category: 'escalao_5',
  description: 'Arena oficial exclusiva do grande embate entre a Invicta e a Capital.',
  quote: '«Dois territórios. Dois gigantes. Um desafio.»',
  assetPath: '/arenas/porto-lisboa-arena.jpg',
  thumbnail: '/arenas/porto-lisboa-arena.jpg',
  background: '/arenas/porto-lisboa-arena.jpg',
  effects: 'none',
  unlockRule: 'unlocked_by_default',
  priceCoins: 0,
  purchaseRule: 'Exclusiva do Evento Oficial Porto × Lisboa',
  gameplayAvailability: true,
  visualType: 'jpg_raster',
  aliases: ['porto-lisboa', 'porto_lisboa', 'porto-vs-lisboa', 'arena_porto_lisboa', 'porto-lisboa-arena'],
  width: 571,
  height: 1024,
  aspectRatio: 571 / 1024,
}

export function getAllArenas(): CanonicalArena[] {
  return CANONICAL_ARENAS
}

export function getVipArenas(): CanonicalArena[] {
  return VIP_ARENAS
}

export function getDefaultArenaForCategory(categorySlug?: string | null): CanonicalArena {
  const cat = (categorySlug || '').toLowerCase().trim()
  if (cat === 'porto-vs-lisboa' || cat === 'porto-lisboa' || cat === 'porto_lisboa') {
    return PORTO_LISBOA_OFFICIAL_ARENA
  }
  return CANONICAL_ARENAS[0]
}

export function resolveArena(arenaIdOrSlug?: string | null): CanonicalArena | undefined {
  if (!arenaIdOrSlug) return CANONICAL_ARENAS[0]
  const q = String(arenaIdOrSlug).toLowerCase().trim()
  
  if (
    q === 'arena_porto_lisboa' ||
    q === 'porto-lisboa' ||
    q === 'porto_lisboa' ||
    q === 'porto-vs-lisboa' ||
    q === 'porto-lisboa-arena' ||
    q === '/arenas/porto-lisboa-arena.jpg'
  ) {
    return PORTO_LISBOA_OFFICIAL_ARENA
  }

  const direct = CANONICAL_ARENAS.find(a => a.id.toLowerCase() === q || a.slug.toLowerCase() === q)
  if (direct) return direct
  
  const aliasTarget = LEGACY_ARENA_ALIASES[q] || LEGACY_ARENA_ALIASES[arenaIdOrSlug.trim()]
  if (aliasTarget) {
    const match = CANONICAL_ARENAS.find(a => a.id === aliasTarget)
    if (match) return match
  }
  
  return CANONICAL_ARENAS[0]
}

export function resolveArenaForGame(params: {
  arenaId?: string | null
  categorySlug?: string | null
  equippedArenaId?: string | null
}): {
  arena: CanonicalArena
  isExplicit: boolean
  isFallback: boolean
  warning?: string
  error?: string
} {
  const { arenaId, categorySlug, equippedArenaId } = params

  const cat = (categorySlug || '').toLowerCase().trim()
  const isPortoLisboaEvent =
    cat === 'porto-vs-lisboa' ||
    cat === 'porto-lisboa' ||
    cat === 'porto_lisboa' ||
    arenaId === 'arena_porto_lisboa' ||
    arenaId === 'porto-lisboa' ||
    arenaId === 'porto-lisboa-arena'

  if (isPortoLisboaEvent) {
    return { arena: PORTO_LISBOA_OFFICIAL_ARENA, isExplicit: true, isFallback: false }
  }

  if (arenaId) {
    const resolved = resolveArena(arenaId)
    if (resolved) return { arena: resolved, isExplicit: true, isFallback: false }
  }

  if (equippedArenaId) {
    const resolved = resolveArena(equippedArenaId)
    if (resolved) return { arena: resolved, isExplicit: false, isFallback: false }
  }

  return { arena: CANONICAL_ARENAS[0], isExplicit: false, isFallback: true }
}

export default CANONICAL_ARENAS
