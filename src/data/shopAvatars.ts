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
  // 1-4: Iniciais / Grátis
  {
    id: 'avatar_01',
    name: 'O Estratega',
    description: 'Mente tática, calculista e frio sob pressão.',
    image: '/images/avatars/avatar_01.png',
    category: 'Cidadania',
    rarity: 'COMUM',
    price: 0,
  },
  {
    id: 'avatar_02',
    name: 'A Líder',
    description: 'Presença imponente, determinação e espírito de liderança.',
    image: '/images/avatars/avatar_02.png',
    category: 'Cidadania',
    rarity: 'COMUM',
    price: 0,
  },
  {
    id: 'avatar_03',
    name: 'O Explorador',
    description: 'Curiosidade insaciável e audácia nas grandes rotas.',
    image: '/images/avatars/avatar_03.png',
    category: 'Cultura',
    rarity: 'COMUM',
    price: 0,
  },
  {
    id: 'avatar_04',
    name: 'A Competidora',
    description: 'Foco absoluto, garra atlética e sede incansável de vitória.',
    image: '/images/avatars/avatar_04.png',
    category: 'Desporto',
    rarity: 'COMUM',
    price: 0,
  },
  // 5-10 & 19: Raros (Tier 3: 6.000 – 9.000 Moedas)
  {
    id: 'avatar_05',
    name: 'O Mestre',
    description: 'Sabedoria profunda e serenidade nos momentos decisivos.',
    image: '/images/avatars/avatar_05.png',
    category: 'História',
    rarity: 'RARO',
    price: 6000,
  },
  {
    id: 'avatar_06',
    name: 'A Gamer',
    description: 'Reflexos ultrarrápidos e mestria no ecossistema digital.',
    image: '/images/avatars/avatar_06.png',
    category: 'Cultura',
    rarity: 'RARO',
    price: 6500,
  },
  {
    id: 'avatar_07',
    name: 'O Descontraído',
    description: 'Carisma natural que transforma a pressão do jogo em diversão.',
    image: '/images/avatars/avatar_07.png',
    category: 'Cidadania',
    rarity: 'RARO',
    price: 7000,
  },
  {
    id: 'avatar_08',
    name: 'A Visionária',
    description: 'Sempre três passos à frente, desenhando o Portugal de amanhã.',
    image: '/images/avatars/avatar_08.png',
    category: 'Cultura',
    rarity: 'RARO',
    price: 7500,
  },
  {
    id: 'avatar_09',
    name: 'O Rebelde',
    description: 'Desafia o óbvio e arrisca tudo pela glória no duelo.',
    image: '/images/avatars/avatar_09.png',
    category: 'Cidadania',
    rarity: 'RARO',
    price: 8000,
  },
  {
    id: 'avatar_10',
    name: 'A Investigadora',
    description: 'Olhar cirúrgico que desvenda qualquer mistério ou detalhe histórico.',
    image: '/images/avatars/avatar_10.png',
    category: 'História',
    rarity: 'RARO',
    price: 8500,
  },
  // 11-17, 20, 22-27, 32: Épicos (Tier 4: 15.000 – 25.000 Moedas)
  {
    id: 'avatar_11',
    name: 'O Desportista',
    description: 'Velocidade, resistência atlética e espírito de superação.',
    image: '/images/avatars/avatar_11.png',
    category: 'Desporto',
    rarity: 'EPICO',
    price: 15000,
  },
  {
    id: 'avatar_12',
    name: 'A Artista',
    description: 'A voz profunda, emoção pura e poesia da alma portuguesa.',
    image: '/images/avatars/avatar_12.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 15000,
  },
  {
    id: 'avatar_13',
    name: 'O Professor',
    description: 'A erudição carismática de quem inspira gerações de mentes brilhantes.',
    image: '/images/avatars/avatar_13.png',
    category: 'História',
    rarity: 'EPICO',
    price: 16000,
  },
  {
    id: 'avatar_14',
    name: 'A Aventureira',
    description: 'Coragem destemida para conquistar serras, mares e arquipélagos.',
    image: '/images/avatars/avatar_14.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 16500,
  },
  {
    id: 'avatar_15',
    name: 'O Técnico',
    description: 'Precisão algorítmica e raciocínio lógico infalível.',
    image: '/images/avatars/avatar_15.png',
    category: 'Cidadania',
    rarity: 'EPICO',
    price: 17500,
  },
  {
    id: 'avatar_16',
    name: 'A Estratega',
    description: 'Paciência cirúrgica que antecipa o adversário xeque por xeque.',
    image: '/images/avatars/avatar_16.png',
    category: 'Cidadania',
    rarity: 'EPICO',
    price: 18000,
  },
  {
    id: 'avatar_17',
    name: 'O Visionário',
    description: 'Audácia e pensamento inovador que quebram velhos paradigmas.',
    image: '/images/avatars/avatar_17.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 18500,
  },
  // 18-21: Lendários & Raros Intermédios
  {
    id: 'avatar_18',
    name: 'A Campeã',
    description: 'A dignidade triunfante de quem ergue a taça nacional.',
    image: '/images/avatars/avatar_18.png',
    category: 'Desporto',
    rarity: 'LENDARIO',
    price: 40000,
  },
  {
    id: 'avatar_19',
    name: 'O Curioso',
    description: 'A fome insaciável de descobrir novas curiosidades do país.',
    image: '/images/avatars/avatar_19.png',
    category: 'Cultura',
    rarity: 'RARO',
    price: 9000,
  },
  {
    id: 'avatar_20',
    name: 'A Investigadora Urbana',
    description: 'Conhecedora das cidades, do património e da evolução contemporânea.',
    image: '/images/avatars/avatar_20.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 19000,
  },
  {
    id: 'avatar_21',
    name: 'O Capitão',
    description: 'O líder firme e respeitado que conduz a tripulação à glória.',
    image: '/images/avatars/avatar_21.png',
    category: 'Cidadania',
    rarity: 'LENDARIO',
    price: 45000,
  },
  // 22-27: Criatividade e Ciência (Tier 4: Épicos)
  {
    id: 'avatar_22',
    name: 'A Criativa',
    description: 'Visual vibrante e capacidade singular de encontrar respostas inovadoras.',
    image: '/images/avatars/avatar_22.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 20000,
  },
  {
    id: 'avatar_23',
    name: 'O Minimalista',
    description: 'Elegância discreta, sobriedade e eficiência sem distrações.',
    image: '/images/avatars/avatar_23.png',
    category: 'Cidadania',
    rarity: 'EPICO',
    price: 21000,
  },
  {
    id: 'avatar_24',
    name: 'A Challenger',
    description: 'Espírito irreverente que não teme nenhum titã das tabelas.',
    image: '/images/avatars/avatar_24.png',
    category: 'Desporto',
    rarity: 'EPICO',
    price: 22500,
  },
  {
    id: 'avatar_25',
    name: 'O Geek',
    description: 'Enciclopédia viva com um vasto arsenal de cultura lusa e geral.',
    image: '/images/avatars/avatar_25.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 23000,
  },
  {
    id: 'avatar_26',
    name: 'A Analista',
    description: 'Raciocínio lógico estruturado e foco absoluto no resultado.',
    image: '/images/avatars/avatar_26.png',
    category: 'Cidadania',
    rarity: 'EPICO',
    price: 24000,
  },
  {
    id: 'avatar_27',
    name: 'O Comunicador',
    description: 'Carisma eloquente que move multidões e contagia o jogo.',
    image: '/images/avatars/avatar_27.png',
    category: 'Cultura',
    rarity: 'EPICO',
    price: 24500,
  },
  // 28-32: Elite Digital e Histórica (Lendários Tier 5 e Épicos)
  {
    id: 'avatar_28',
    name: 'A Exploradora Digital',
    description: 'Navegadora das novas fronteiras da tecnologia e do saber.',
    image: '/images/avatars/avatar_28.png',
    category: 'Cultura',
    rarity: 'LENDARIO',
    price: 48000,
  },
  {
    id: 'avatar_29',
    name: 'O Mestre do Quiz',
    description: 'O decifrador supremo de charadas, factos e enigmas da história.',
    image: '/images/avatars/avatar_29.png',
    category: 'História',
    rarity: 'LENDARIO',
    price: 52000,
  },
  {
    id: 'avatar_30',
    name: 'A Rainha do Ranking',
    description: 'A soberana indiscutível das pontuações máximas nacionais.',
    image: '/images/avatars/avatar_30.png',
    category: 'Exclusivos',
    rarity: 'EXCLUSIVO',
    price: 0,
    isAchievementOnly: true,
    unlockRequirement: 'Alcançar o Top 10 no Ranking Nacional',
  },
  {
    id: 'avatar_31',
    name: 'O Veterano',
    description: 'Anos de sabedoria e prestígio respeitados por toda a comunidade.',
    image: '/images/avatars/avatar_31.png',
    category: 'História',
    rarity: 'LENDARIO',
    price: 55000,
  },
  {
    id: 'avatar_32',
    name: 'A Nova Geração',
    description: 'A força jovem e vibrante que está a redefinir o futuro da nação.',
    image: '/images/avatars/avatar_32.png',
    category: 'Cidadania',
    rarity: 'EPICO',
    price: 25000,
  },
  // 33-36: Mestres e Lendas Máximas (Tier 5 e Exclusivos por Mérito)
  {
    id: 'avatar_33',
    name: 'O Campeão',
    description: 'Consagrado no panteão dos maiores vencedores do Acorda Portugal.',
    image: '/images/avatars/avatar_33.png',
    category: 'Desporto',
    rarity: 'LENDARIO',
    price: 60000,
  },
  {
    id: 'avatar_34',
    name: 'A Lenda',
    description: 'Uma presença marcante e memorável que inspira o país inteiro.',
    image: '/images/avatars/avatar_34.png',
    category: 'História',
    rarity: 'LENDARIO',
    price: 65000,
  },
  {
    id: 'avatar_35',
    name: 'O Desafiante',
    description: 'Audácia competitiva inclemente perante qualquer desafio.',
    image: '/images/avatars/avatar_35.png',
    category: 'Exclusivos',
    rarity: 'EXCLUSIVO',
    price: 0,
    isAchievementOnly: true,
    unlockRequirement: 'Conquista de 100 Vitórias Consecutivas 1v1',
  },
  {
    id: 'avatar_36',
    name: 'A Lenda Portuguesa',
    description: 'O símbolo supremo das Quinas e da alma imortal de Portugal.',
    image: '/images/avatars/avatar_36.png',
    category: 'Exclusivos',
    rarity: 'EXCLUSIVO',
    price: 0,
    isAchievementOnly: true,
    unlockRequirement: 'Conquistar o Título Máximo de Lenda de Portugal',
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
    avatar_01: '🧠',
    avatar_02: '👑',
    avatar_03: '🧭',
    avatar_04: '⚡',
    avatar_05: '📜',
    avatar_06: '🎮',
    avatar_07: '😎',
    avatar_08: '🔮',
    avatar_09: '🔥',
    avatar_10: '🔍',
    avatar_11: '⚽',
    avatar_12: '🎨',
    avatar_13: '📚',
    avatar_14: '🏔️',
    avatar_15: '💻',
    avatar_16: '♟️',
    avatar_17: '✨',
    avatar_18: '🥇',
    avatar_19: '💡',
    avatar_20: '🏙️',
    avatar_21: '⚓',
    avatar_22: '🎭',
    avatar_23: '🎯',
    avatar_24: '💥',
    avatar_25: '🕹️',
    avatar_26: '📊',
    avatar_27: '🎙️',
    avatar_28: '🌐',
    avatar_29: '🎩',
    avatar_30: '👑',
    avatar_31: '🛡️',
    avatar_32: '🌟',
    avatar_33: '🏆',
    avatar_34: '🔥',
    avatar_35: '⚔️',
    avatar_36: '🇵🇹',
  };

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
  };
})


