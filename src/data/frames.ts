export interface AnimatedFrame {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'Raro' | 'Épico' | 'Lendário' | 'Mítico';
  type: 'flame' | 'laser_spin' | 'matrix_scan' | 'void_rift' | 'quinas_pulse';
  priceCoins: number;
  cssClass?: string;
  accentColor?: string;
}

export const ANIMATED_FRAMES: AnimatedFrame[] = [
  {
    id: 'frame_cyber_laser',
    name: 'Feixe Cibernético 360°',
    description: 'Laser de alta rotação contínua que percorre a moldura sem parar.',
    price: 2500,
    priceCoins: 2500,
    rarity: 'Raro',
    type: 'laser_spin',
    cssClass: 'frame-container-laser',
    accentColor: '#06b6d4',
  },
  {
    id: 'frame_solar_flame',
    name: 'Inferno Solar',
    description: 'Chamas vivas douradas e rubras em combustão ascendente contínua.',
    price: 7500,
    priceCoins: 7500,
    rarity: 'Épico',
    type: 'flame',
    cssClass: 'frame-effect-flame',
    accentColor: '#f59e0b',
  },
  {
    id: 'frame_portugal_glory',
    name: 'Glória Lusitana Viva',
    description: 'Aura radiante verde-rubro em ondulação de bandeira com faíscas douradas.',
    price: 7500,
    priceCoins: 7500,
    rarity: 'Épico',
    type: 'quinas_pulse',
    cssClass: 'frame-effect-quinas',
    accentColor: '#22c55e',
  },
  {
    id: 'frame_void_abyss',
    name: 'Fissura do Vazio',
    description: 'Vórtice púrpura com pulsação hipnótica e distorção gravitacional.',
    price: 15000,
    priceCoins: 15000,
    rarity: 'Lendário',
    type: 'void_rift',
    cssClass: 'frame-effect-void',
    accentColor: '#a855f7',
  },
  {
    id: 'frame_quantum_matrix',
    name: 'Matriz Quântica Ativa',
    description: 'Linhas de código esmeralda e scanner laser vertical em varredura perpétua.',
    price: 30000,
    priceCoins: 30000,
    rarity: 'Mítico',
    type: 'matrix_scan',
    cssClass: 'frame-container-matrix',
    accentColor: '#10b981',
  },
];

export function getFrameById(id?: string | null): AnimatedFrame | undefined {
  if (!id) return undefined;
  if (id === 'frame_cyber_neon') return ANIMATED_FRAMES.find((f) => f.id === 'frame_cyber_laser');
  return ANIMATED_FRAMES.find((f) => f.id === id);
}


