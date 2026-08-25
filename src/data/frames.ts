export interface AnimatedFrame {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'Raro' | 'Épico' | 'Lendário' | 'Mítico';
  cssClass: string;
  accentColor: string;
  gradient?: string;
}

export const ANIMATED_FRAMES: AnimatedFrame[] = [
  { id: 'frame_cyber_neon', name: 'Circuito Cibernético', description: 'Pulsos de energia neon azul e verde em rotação contínua.', price: 250, rarity: 'Raro', cssClass: 'frame-cyber-neon', accentColor: '#06b6d4' },
  { id: 'frame_solar_flame', name: 'Chama Solar', description: 'Aura flamejante dourada e rubra com efeito pulsante de fogo.', price: 500, rarity: 'Épico', cssClass: 'frame-solar-flame', accentColor: '#f59e0b' },
  { id: 'frame_portugal_glory', name: 'Glória das Quinas', description: 'Gradiente animado verde-rubro com brilho dourado dinâmico.', price: 750, rarity: 'Épico', cssClass: 'frame-portugal-glory', accentColor: '#22c55e' },
  { id: 'frame_void_abyss', name: 'Vazio Cósmico', description: 'Fissuras púrpuras e escuras com distorção gravitacional pulsante.', price: 1200, rarity: 'Lendário', cssClass: 'frame-void-abyss', accentColor: '#a855f7' },
  { id: 'frame_quantum_matrix', name: 'Matriz Quântica', description: 'Feixes de luz laser esmeralda e partículas digitais reativas.', price: 2000, rarity: 'Mítico', cssClass: 'frame-quantum-matrix', accentColor: '#10b981' },
];

export function getFrameById(id?: string | null): AnimatedFrame | undefined {
  if (!id) return undefined;
  return ANIMATED_FRAMES.find((f) => f.id === id);
}

