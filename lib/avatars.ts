export interface AvatarItem {
  id: string;
  name: string;
  subtitle?: string;
  category: 'geral' | 'historia' | 'geografia' | 'desporto' | 'cultura';
  price: number | string;
  currency: 'free' | 'coins' | 'real_money' | 'points' | 'eur';
  icon?: string;
  image?: string;
  description?: string;
  badge?: string;
  rarity?: 'comum' | 'raro' | 'epico' | 'lendario' | 'mitico';
  borderGlow?: string;
  glowColor?: string;
  disabled?: boolean;
}

export const AVATARS_2050 = [
  {
    id: 'camoes_2050',
    name: 'Luís de Camões',
    subtitle: 'O Poeta Cibernético com coroa de louros holográfica e olho biônico.',
    image: '/images/avatars/camoes-2050.jpg',
    category: 'cultura' as const,
    price: 750,
    priceDisplay: '750 Acorda',
    currency: 'points' as const,
    badge: 'Lendário',
    rarity: 'lendario' as const,
    glowColor: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    icon: '📜',
    description: 'O Poeta Cibernético com coroa de louros holográfica e olho biônico.',
  },
  {
    id: 'guardiao_acores',
    name: 'Guardião dos Açores',
    subtitle: 'Titã mecha forjado em magma vulcânico com núcleo de energia pura.',
    image: '/images/avatars/acores-guardiao-2050.jpg',
    category: 'geografia' as const,
    price: 600,
    priceDisplay: '600 Acorda',
    currency: 'points' as const,
    badge: 'Épico',
    rarity: 'epico' as const,
    glowColor: 'border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    icon: '🌋',
    description: 'Titã mecha forjado em magma vulcânico com núcleo de energia pura.',
  },
  {
    id: 'lenda_futebol',
    name: 'Lenda do Futebol',
    subtitle: 'Cyborg das Quinas com armadura techwear e troféu holográfico.',
    image: '/images/avatars/lenda-futebol-2050.jpg',
    category: 'desporto' as const,
    price: 2.99,
    priceDisplay: '€2.99',
    currency: 'eur' as const,
    badge: 'Exclusivo',
    rarity: 'lendario' as const,
    glowColor: 'border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
    disabled: true,
    icon: '⚽',
    description: 'Cyborg das Quinas com armadura techwear e troféu holográfico.',
  },
  {
    id: 'alma_alfama',
    name: 'Alma de Alfama',
    subtitle: 'Cyber-fadista com xaile de fibra ótica e guitarra holográfica.',
    image: '/images/avatars/alma-alfama-2050.jpg',
    category: 'cultura' as const,
    price: 2.99,
    priceDisplay: '€2.99',
    currency: 'eur' as const,
    badge: 'Raro',
    rarity: 'raro' as const,
    glowColor: 'border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.35)]',
    disabled: true,
    icon: '🎸',
    description: 'Cyber-fadista com xaile de fibra ótica e guitarra holográfica.',
  },
  {
    id: 'sebastiao_nevoeiro',
    name: 'D. Sebastião no Nevoeiro',
    subtitle: 'O Rei do Quinto Império em armadura imperial com relâmpagos elétricos.',
    image: '/images/avatars/sebastiao-2050.jpg',
    category: 'historia' as const,
    price: 4.99,
    priceDisplay: '€4.99',
    currency: 'eur' as const,
    badge: 'Mítico',
    rarity: 'mitico' as const,
    glowColor: 'border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    disabled: true,
    icon: '👑',
    description: 'O Rei do Quinto Império em armadura imperial com relâmpagos elétricos.',
  },
];

export const AVATAR_CATALOG: AvatarItem[] = [
  // 1. Entrada / Grátis
  {
    id: 'av_default',
    name: 'Explorador Iniciante',
    subtitle: 'Avatar base para todos os novos conquistadores de Portugal.',
    category: 'geral',
    price: 0,
    currency: 'free',
    icon: '👤',
    description: 'Avatar base para todos os novos conquistadores de Portugal.',
    rarity: 'comum',
  },
  {
    id: 'av_galo_barcelos',
    name: 'Galo de Barcelos',
    subtitle: 'O símbolo clássico de justiça, honra e orgulho nacional.',
    category: 'cultura',
    price: 0,
    currency: 'free',
    icon: '🐓',
    description: 'O símbolo clássico de justiça, honra e orgulho nacional.',
    rarity: 'comum',
  },

  // 2. Coleção Cyberpunk 2050 Oficial
  ...AVATARS_2050,

  // 3. Outros Avatares Históricos
  {
    id: 'av_hist_afonso',
    name: 'D. Afonso Henriques',
    subtitle: 'O Conquistador e primeiro Rei de Portugal.',
    category: 'historia',
    price: 500,
    currency: 'coins',
    icon: '⚔️',
    description: 'O Conquistador e primeiro Rei de Portugal. Para mestres de História.',
    rarity: 'raro',
  },
  {
    id: 'av_geo_navegador',
    name: 'Navegador Sideral',
    subtitle: 'Dominador dos cabos, ilhas e oceanos dos quatro cantos do mundo.',
    category: 'geografia',
    price: 1000,
    currency: 'coins',
    icon: '🌍',
    description: 'Dominador dos cabos, ilhas e oceanos dos quatro cantos do mundo.',
    rarity: 'epico',
  },
];
