export type ArenaRarity = 'Comum' | 'Rara' | 'Épica' | 'Lendária' | 'Mítica' | 'Exclusiva'
export type ArenaEffect = 'none' | 'rain' | 'fire' | 'lava' | 'particles' | 'waves' | 'snow' | 'lightning' | 'stars' | 'fog' | 'fireworks'

export interface Arena {
  id: string
  name: string
  imagePath?: string
  image: string
  unlockedByDefault?: boolean
  category: 'portugal' | 'ilhas' | 'historia' | 'cultura' | 'futebol' | 'futuristas' | 'maluco' | 'exclusivas'
  categoryLabel: string
  rarity: ArenaRarity
  price: number | null
  unlockCondition?: string
  description: string
  effect: ArenaEffect
  badgeColor?: string
}

export type ArenaItem = Arena
