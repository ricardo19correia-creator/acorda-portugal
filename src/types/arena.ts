export type ArenaRarity = 'Comum' | 'Rara' | 'Épica' | 'Lendária' | 'Mítica' | 'Exclusiva'
export type CanonicalRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'

export type ArenaEffect =
  | 'none'
  | 'rain'
  | 'fire'
  | 'lava'
  | 'particles'
  | 'waves'
  | 'snow'
  | 'lightning'
  | 'stars'
  | 'fog'
  | 'fireworks'

export type ArenaCategory =
  | 'portugal'
  | 'ilhas'
  | 'historia'
  | 'cultura'
  | 'futebol'
  | 'futuristas'
  | 'maluco'
  | 'exclusivas'

export type ArenaDifficulty = 'Fácil' | 'Médio' | 'Difícil' | 'Extremo' | 'Lendário'

export type ArenaEnvironment =
  | 'outdoor'
  | 'monument'
  | 'ocean'
  | 'nature'
  | 'stadium'
  | 'sci-fi'
  | 'fantasy'

export interface ArenaItem {
  id: string
  name: string
  description: string
  image?: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'
  unlockedByDefault?: boolean
  category?: string
  effect?: string
  meaning?: string
}

export interface ArenaDefinition {
  id: string
  name: string
  description: string
  meaning: string
  theme: string
  shopImage?: string
  gameImage?: string
  gameBackground?: string
  duelImage?: string
  duelBackground?: string
  thumbnail?: string
  image?: string
  imagePath?: string
  background?: string
  accent: string
  icon: string
  category: ArenaCategory
  categoryLabel: string
  rarity: ArenaRarity
  price: number | null
  isExclusive?: boolean
  unlockCondition?: string
  unlockedByDefault?: boolean
  unlocked?: boolean
  difficulty: ArenaDifficulty
  environment: ArenaEnvironment
  effect: ArenaEffect
  badgeColor?: string
  available: boolean
  order: number
}

export type Arena = ArenaDefinition
