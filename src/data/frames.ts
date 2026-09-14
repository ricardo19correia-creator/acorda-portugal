export type FrameRarity = 'Raro' | 'Épico' | 'Lendário' | 'Mítico';

export interface AnimatedFrame {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceCoins: number;
  rarity: FrameRarity;
  type: string;
  categoryKey: 'elemental' | 'cosmico' | 'real' | 'lusitano' | 'especial';
  categoryTitle: string;
  accentColor: string;
  secondaryColor?: string;
  cssClass?: string;
  story?: string;
  badge?: string;
  badgeColor?: string;
}

export function getFrameRarityBadge(rarity: FrameRarity): string {
  switch (rarity) {
    case 'Mítico':
      return 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white border-pink-400/80 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse font-black';
    case 'Lendário':
      return 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black';
    case 'Épico':
      return 'bg-purple-500/25 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.35)] font-black';
    case 'Raro':
    default:
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-bold';
  }
}

/**
 * 🇵🇹 COLEÇÃO OFICIAL DE MOLDURAS VIVAS (SSOT)
 * 
 * Atualmente todas as molduras vivas antigas foram desativadas e removidas.
 * O sistema permanece 100% estruturado e preparado para receber novas molduras vivas futuramente.
 */
export const ANIMATED_FRAMES: AnimatedFrame[] = [];

/**
 * Dicionário de Mapeamento e Retrocompatibilidade
 * Mapeia IDs para os seus respetivos identificadores canónicos quando existirem molduras ativas.
 */
export const FRAME_ALIASES: Record<string, string> = {};

export function getFrameById(id?: string | null): AnimatedFrame | undefined {
  if (!id || id === 'default') return undefined;
  const canonicalId = FRAME_ALIASES[id] || id;
  return ANIMATED_FRAMES.find((f) => f.id === canonicalId);
}
