export interface AvatarItem {
  id: string;
  name: string;
  subtitle?: string;
  category: 'geral' | 'historia' | 'geografia' | 'desporto' | 'cultura';
  price: number | string;
  currency: 'free' | 'coins' | 'real_money' | 'points' | 'eur';
  icon?: string;
  image: string;
  description?: string;
  badge?: string;
  rarity?: 'comum' | 'raro' | 'epico' | 'lendario' | 'mitico';
  borderGlow?: string;
  glowColor?: string;
  disabled?: boolean;
}

export const AVATARS_2050: AvatarItem[] = [
  {
    id: 'camoes_2050',
    name: 'Luís de Camões',
    subtitle: 'O Poeta Cibernético com coroa de louros holográfica e olho biônico.',
    image: '/images/avatars/camoes-2050.jpg',
    category: 'cultura',
    price: '750 Acorda',
    currency: 'points',
    badge: 'Lendário',
    rarity: 'lendario',
    glowColor: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    icon: '📜',
    description: 'O Poeta Cibernético com coroa de louros holográfica e olho biônico.',
  },
  {
    id: 'guardiao_acores',
    name: 'Guardião dos Açores',
    subtitle: 'Titã mecha forjado em magma vulcânico com núcleo de energia pura.',
    image: '/images/avatars/acores-guardiao-2050.jpg',
    category: 'geografia',
    price: '600 Acorda',
    currency: 'points',
    badge: 'Épico',
    rarity: 'epico',
    glowColor: 'border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    icon: '🌋',
    description: 'Titã mecha forjado em magma vulcânico com núcleo de energia pura.',
  },
  {
    id: 'lenda_futebol',
    name: 'Lenda do Futebol',
    subtitle: 'Cyborg das Quinas com armadura techwear e troféu holográfico.',
    image: '/images/avatars/lenda-futebol-2050.jpg',
    category: 'desporto',
    price: '€2.99',
    currency: 'eur',
    badge: 'Exclusivo',
    rarity: 'lendario',
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
    category: 'cultura',
    price: '€2.99',
    currency: 'eur',
    badge: 'Raro',
    rarity: 'raro',
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
    category: 'historia',
    price: '€4.99',
    currency: 'eur',
    badge: 'Mítico',
    rarity: 'mitico',
    glowColor: 'border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    disabled: true,
    icon: '👑',
    description: 'O Rei do Quinto Império em armadura imperial com relâmpagos elétricos.',
  },
];

export const AVATAR_CATALOG: AvatarItem[] = AVATARS_2050;
