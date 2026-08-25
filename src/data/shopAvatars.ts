export type ShopAvatarRarity = 'COMUM' | 'RARO' | 'EPICO' | 'LENDARIO' | 'EXCLUSIVO'
export type AvatarRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Mítico' | 'Exclusivo'

export interface ShopAvatar {
  id: string
  name: string
  description: string
  image: string
  category: string
  rarity: ShopAvatarRarity
  price: number
  isAchievementOnly?: boolean
  unlockRequirement?: string
}

export interface AvatarItem {
  id: string
  name: string
  categoryKey: string
  categoryTitle: string
  rarity: AvatarRarity
  price: number | null
  unlockCondition?: string
  description: string
  image: string
  icon: string
  isExclusive: boolean
}

export interface AvatarCategoryMeta {
  key: string
  title: string
  icon: string
}

export const OFFICIAL_SHOP_AVATARS: ShopAvatar[] = [
  {
    id: 'alma-alfama-2050',
    name: 'Alma de Alfama 2050',
    description: 'A melodia do fado imortalizada na guitarra do futuro.',
    image: '/images/avatars/alma-alfama-2050.png',
    category: 'Cultura',
    rarity: 'COMUM',
    price: 25000,
  },
  {
    id: 'vulcao-acores',
    name: 'Vulcão dos Açores',
    description: 'A força telúrica e o fogo primordial das ilhas açorianas.',
    image: '/images/avatars/vulcao-acores.png',
    category: 'Cultura',
    rarity: 'COMUM',
    price: 35000,
  },
  {
    id: 'representante-distrital',
    name: 'Representante Distrital',
    description: 'A voz e a honra cívica do teu distrito em cada resposta.',
    image: '/images/avatars/REPRESENTANTE DISTRITAL.png',
    category: 'Cidadania',
    rarity: 'RARO',
    price: 75000,
  },
  {
    id: 'camoes-2050',
    name: 'Camões 2050',
    description: 'Engenho e arte cibernética a cantar feitos nunca dantes navegados.',
    image: '/images/avatars/camoes-2050.png',
    category: 'História',
    rarity: 'RARO',
    price: 120000,
  },
  {
    id: 'lenda-futebol-2050',
    name: 'Lenda Futebol 2050',
    description: 'A perícia dos relvados e a glória dos maiores troféus.',
    image: '/images/avatars/lenda-futebol-2050.png',
    category: 'Desporto',
    rarity: 'EPICO',
    price: 250000,
  },
  {
    id: 'sebastiao-2050',
    name: 'D. Sebastião 2050',
    description: 'O regresso triunfal por entre o nevoeiro digital de uma nova era.',
    image: '/images/avatars/sebastiao-2050.png',
    category: 'História',
    rarity: 'EPICO',
    price: 400000,
  },
  {
    id: 'campeao-nacional',
    name: 'Campeão Nacional',
    description: 'Destinado aos mestres que conquistam o topo de Portugal.',
    image: '/images/avatars/Campeão Nacional.png',
    category: 'Desporto',
    rarity: 'LENDARIO',
    price: 750000,
  },
  {
    id: 'tita-top-10',
    name: 'Titã do Top 10',
    description: 'Reservado exclusivamente para os 10 melhores cérebros do país.',
    image: '/images/avatars/TITÃ DO TOP 10.png',
    category: 'Exclusivos',
    rarity: 'EXCLUSIVO',
    price: 0,
    isAchievementOnly: true,
    unlockRequirement: 'Alcançar o Top 10 no Ranking Nacional',
  },
  {
    id: 'lenda-suprema-acorda',
    name: 'Lenda Suprema do Acorda',
    description: 'Forjado na glória imortal de 100 batalhas invictas no modo 1v1.',
    image: '/images/avatars/LENDA SUPREMA DO ACORDA.png',
    category: 'Exclusivos',
    rarity: 'EXCLUSIVO',
    price: 0,
    isAchievementOnly: true,
    unlockRequirement: 'Conquista de 100 Vitórias Consecutivas 1v1',
  },
]

export const AVATAR_18_CATEGORIES: AvatarCategoryMeta[] = [
  { key: 'todos', title: 'Todos os Avatares', icon: '✨' },
  { key: 'Cultura', title: '📜 Cultura', icon: '📜' },
  { key: 'Cidadania', title: '🇵🇹 Cidadania', icon: '🇵🇹' },
  { key: 'História', title: '👑 História', icon: '👑' },
  { key: 'Desporto', title: '⚽ Desporto', icon: '⚽' },
  { key: 'Exclusivos', title: '⭐ Exclusivos por Mérito', icon: '⭐' },
]

export const avatarShopList: AvatarItem[] = OFFICIAL_SHOP_AVATARS.map((av) => {
  const rarityMap: Record<ShopAvatarRarity, AvatarRarity> = {
    COMUM: 'Comum',
    RARO: 'Raro',
    EPICO: 'Épico',
    LENDARIO: 'Lendário',
    EXCLUSIVO: 'Exclusivo',
  }

  const iconMap: Record<string, string> = {
    'alma-alfama-2050': '🎸',
    'vulcao-acores': '🌋',
    'representante-distrital': '🇵🇹',
    'camoes-2050': '📜',
    'lenda-futebol-2050': '⚽',
    'sebastiao-2050': '👑',
    'campeao-nacional': '🏆',
    'tita-top-10': '🥇',
    'lenda-suprema-acorda': '🔥',
  }

  return {
    id: av.id,
    name: av.name,
    categoryKey: av.category,
    categoryTitle: av.category,
    rarity: rarityMap[av.rarity] || 'Comum',
    price: av.isAchievementOnly ? null : av.price,
    unlockCondition: av.unlockRequirement,
    description: av.description,
    image: av.image,
    icon: iconMap[av.id] || '✨',
    isExclusive: Boolean(av.isAchievementOnly),
  }
})


