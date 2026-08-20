export interface AvatarItem {
  id: string;
  name: string;
  category: 'geral' | 'historia' | 'geografia' | 'desporto' | 'cultura';
  price: number;
  currency: 'free' | 'coins' | 'real_money';
  icon: string;
  description?: string;
  rarity?: 'comum' | 'raro' | 'epico' | 'lendario' | 'mitico';
  borderGlow?: string;
}

export const AVATAR_CATALOG: AvatarItem[] = [
  // 1. Entrada / Grátis
  {
    id: 'av_default',
    name: 'Explorador Iniciante',
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
    category: 'cultura',
    price: 0,
    currency: 'free',
    icon: '🐓',
    description: 'O símbolo clássico de justiça, honra e orgulho nacional.',
    rarity: 'comum',
  },

  // 2. Progressão (Moedas)
  {
    id: 'av_hist_afonso',
    name: 'D. Afonso Henriques',
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
    category: 'geografia',
    price: 1000,
    currency: 'coins',
    icon: '🌍',
    description: 'Dominador dos cabos, ilhas e oceanos dos quatro cantos do mundo.',
    rarity: 'epico',
  },
  {
    id: 'av_hist_camoes',
    name: 'Luís de Camões',
    category: 'cultura',
    price: 750,
    currency: 'coins',
    icon: '📜',
    description: 'O poeta maior dos Lusíadas com o olho de águia e a pena de ouro.',
    rarity: 'raro',
  },
  {
    id: 'av_geo_vulcao',
    name: 'Guardião dos Açores',
    category: 'geografia',
    price: 600,
    currency: 'coins',
    icon: '🌋',
    description: 'Força telúrica das ilhas vulcânicas e lagoas mágicas.',
    rarity: 'raro',
  },

  // 3. Lendários & Míticos (Dinheiro Real)
  {
    id: 'av_sport_campeao',
    name: 'Lenda do Futebol',
    category: 'desporto',
    price: 2.99,
    currency: 'real_money',
    icon: '⚽',
    description: 'Visual dourado animado com a mística da camisola das Quinas e troféu europeu.',
    rarity: 'lendario',
    borderGlow: 'shadow-[0_0_15px_rgba(234,179,8,0.6)] border-amber-400',
  },
  {
    id: 'av_cult_fado',
    name: 'Alma de Alfama',
    category: 'cultura',
    price: 2.99,
    currency: 'real_money',
    icon: '🎸',
    description: 'Visual aveludado com guitarra portuguesa e aura violeta das noites de fado.',
    rarity: 'lendario',
    borderGlow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)] border-purple-400',
  },
  {
    id: 'av_hist_imperador',
    name: 'D. Sebastião no Nevoeiro',
    category: 'historia',
    price: 4.99,
    currency: 'real_money',
    icon: '👑',
    description: 'O Mito do Quinto Império com relâmpagos néon e aura imperial.',
    rarity: 'mitico',
    borderGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.8)] border-cyan-400',
  },
];
