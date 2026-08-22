export interface AvatarItem {
  id: string
  name: string
  category: 'historia' | 'geografia' | 'desporto' | 'cultura' | 'simbolos'
  categoryLabel: string
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Exclusivo'
  description: string
  price: number // em € Acorda
  image: string
  badgeColor: string
}

export const avatarShopList: AvatarItem[] = [
  // --- HISTÓRIA & CONQUISTADORES ---
  {
    id: 'camoes-2050',
    name: 'Luís de Camões 2050',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Lendário',
    description: 'O poeta épico renascido com visor cibernético e louros digitais.',
    price: 2500,
    image: '/images/avatars/camoes-2050.jpg',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  },
  {
    id: 'afonso-mecha-rei',
    name: 'D. Afonso Henriques Mecha',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Exclusivo',
    description: 'Armadura exoesqueleto forjada no Castelo de Guimarães com espada de plasma.',
    price: 6000,
    image: '/images/avatars/afonso-mecha.jpg',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
  },
  {
    id: 'infante-navegador-neon',
    name: 'Infante D. Henrique Estelar',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Épico',
    description: 'Mestre da navegação espacial equipado com astrolábio holográfico.',
    price: 3500,
    image: '/images/avatars/infante-estelar.jpg',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
  },
  {
    id: 'padeiro-aljubarrota-cyber',
    name: 'Brites de Almeida Cyber-Pá',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Raro',
    description: 'A heroína de Aljubarrota armada com pá de titânio energizada.',
    price: 1800,
    image: '/images/avatars/brites-cyber.jpg',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  },

  // --- GEOGRAFIA & ELEMENTOS DA NATUREZA ---
  {
    id: 'guardiao-vulcanico',
    name: 'Guardião Vulcânico Açores',
    category: 'geografia',
    categoryLabel: 'Geografia',
    rarity: 'Épico',
    description: 'Armadura forjada nas profundezas geotérmicas da Lagoa das Furnas.',
    price: 3500,
    image: '/images/avatars/guardiao-vulcanico.jpg',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
  },
  {
    id: 'espectro-serra-estrela',
    name: 'Sentinela da Serra da Estrela',
    category: 'geografia',
    categoryLabel: 'Geografia',
    rarity: 'Raro',
    description: 'Guerreiro coberto por mantos glaciais e névoa da Torre.',
    price: 1500,
    image: '/images/avatars/sentinela-estrela.jpg',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  },
  {
    id: 'tita-cabo-roca',
    name: 'Titã das Ondas de Nazaré',
    category: 'geografia',
    categoryLabel: 'Geografia',
    rarity: 'Lendário',
    description: 'Colosso aquático impulsionado pela força do canhão da Nazaré.',
    price: 4500,
    image: '/images/avatars/tita-nazare.jpg',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  },

  // --- DESPORTO & COMPETIÇÃO ---
  {
    id: 'cyborg-quinas',
    name: 'Cyborg Camisola das Quinas',
    category: 'desporto',
    categoryLabel: 'Desporto',
    rarity: 'Exclusivo',
    description: 'O derradeiro goleador cibernético com chuteiras de propulsão iónica.',
    price: 5000,
    image: '/images/shop/cyborg-quinas.jpg',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
  },
  {
    id: 'piloto-estoril-neon',
    name: 'Piloto Speed Estoril 2088',
    category: 'desporto',
    categoryLabel: 'Desporto',
    rarity: 'Raro',
    description: 'Corredor urbano com fato ignífugo reforçado a fibra de carbono.',
    price: 1800,
    image: '/images/avatars/piloto-estoril.jpg',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  },

  // --- CULTURA, FADO & TRADIÇÕES ---
  {
    id: 'fadista-cyber-alfama',
    name: 'Fadista Cyber-Alfama',
    category: 'cultura',
    categoryLabel: 'Cultura & Fado',
    rarity: 'Raro',
    description: 'Manto de néon roxo com guitarra portuguesa sintonizada a frequências sónicas.',
    price: 1500,
    image: '/images/shop/fadista-cyber.jpg',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  },
  {
    id: 'careto-cibernetico',
    name: 'Careto Podence Cibernético',
    category: 'cultura',
    categoryLabel: 'Tradições',
    rarity: 'Lendário',
    description: 'Franjas de fibra ótica multicores e chocalhos emissores de impulsos PEM.',
    price: 4000,
    image: '/images/avatars/careto-cyber.jpg',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  },

  // --- SÍMBOLOS NACIONAIS ---
  {
    id: 'galo-barcelos-mecha',
    name: 'Galo de Barcelos Synthwave',
    category: 'simbolos',
    categoryLabel: 'Símbolos',
    rarity: 'Comum',
    description: 'O clássico símbolo da lealdade e justiça em formato autómato iluminado.',
    price: 800,
    image: '/images/avatars/galo-barcelos.jpg',
    badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600'
  }
]
