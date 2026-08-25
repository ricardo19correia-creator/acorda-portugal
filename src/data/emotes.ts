export type EmoteRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Mítico'
export type EmoteCategory = 'geral' | 'competicao' | 'reacao' | 'patriotico' | 'psicologico'

export interface EmoteItem {
  id: string
  emoji: string
  label: string
  text: string
  category: EmoteCategory
  rarity: EmoteRarity
  price: number // 0 = grátis
  isDefault: boolean
  sortOrder: number
  soundEffect?: string
  animation?: 'bounce' | 'pulse' | 'shake' | 'sparkle' | 'flame'
}

export const OFFICIAL_EMOTES: EmoteItem[] = [
  // 1. GRATUITOS (BÁSICOS / COMUNS)
  {
    id: 'emote_ola',
    emoji: '👋',
    label: 'Olá!',
    text: '👋 Olá!',
    category: 'geral',
    rarity: 'Comum',
    price: 0,
    isDefault: true,
    sortOrder: 1,
    animation: 'bounce',
  },
  {
    id: 'emote_boa_sorte',
    emoji: '🍀',
    label: 'Boa sorte!',
    text: '🍀 Boa sorte!',
    category: 'geral',
    rarity: 'Comum',
    price: 0,
    isDefault: true,
    sortOrder: 2,
    animation: 'sparkle',
  },
  {
    id: 'emote_vamos',
    emoji: '🔥',
    label: 'Vamos!',
    text: '🔥 Vamos!',
    category: 'competicao',
    rarity: 'Comum',
    price: 0,
    isDefault: true,
    sortOrder: 3,
    animation: 'flame',
  },
  {
    id: 'emote_boa',
    emoji: '👏',
    label: 'Boa!',
    text: '👏 Boa!',
    category: 'geral',
    rarity: 'Comum',
    price: 0,
    isDefault: true,
    sortOrder: 4,
    animation: 'bounce',
  },
  {
    id: 'emote_quase',
    emoji: '😅',
    label: 'Quase!',
    text: '😅 Quase!',
    category: 'reacao',
    rarity: 'Comum',
    price: 0,
    isDefault: true,
    sortOrder: 5,
    animation: 'shake',
  },
  {
    id: 'emote_gg',
    emoji: '🏆',
    label: 'GG!',
    text: '🏆 GG!',
    category: 'competicao',
    rarity: 'Comum',
    price: 0,
    isDefault: true,
    sortOrder: 6,
    animation: 'sparkle',
  },

  // 2. PROVOCAÇÕES EM DESTAQUE (250 MOEDAS)
  {
    id: 'PROV_010',
    emoji: '👑',
    label: 'Quem manda aqui soy yoo',
    text: '👑 Quem manda aqui soy yoo',
    category: 'competicao',
    rarity: 'Épico',
    price: 250,
    isDefault: false,
    sortOrder: 0,
    animation: 'flame',
  },

  // 3. COMUNS (500 MOEDAS)
  {
    id: 'emote_ahahah',
    emoji: '😂',
    label: 'Ahahah!',
    text: '😂 Ahahah!',
    category: 'reacao',
    rarity: 'Comum',
    price: 500,
    isDefault: false,
    sortOrder: 7,
    animation: 'bounce',
  },
  {
    id: 'emote_uau',
    emoji: '😱',
    label: 'Uau!',
    text: '😱 Uau!',
    category: 'reacao',
    rarity: 'Comum',
    price: 500,
    isDefault: false,
    sortOrder: 8,
    animation: 'pulse',
  },

  // 3. RAROS (1.500 MOEDAS)
  {
    id: 'emote_hmm',
    emoji: '🤔',
    label: 'Hmm...',
    text: '🤔 Hmm...',
    category: 'reacao',
    rarity: 'Raro',
    price: 1500,
    isDefault: false,
    sortOrder: 9,
    animation: 'shake',
  },
  {
    id: 'emote_forca',
    emoji: '💪',
    label: 'Força!',
    text: '💪 Força!',
    category: 'competicao',
    rarity: 'Raro',
    price: 1500,
    isDefault: false,
    sortOrder: 10,
    animation: 'pulse',
  },
  {
    id: 'emote_acertei',
    emoji: '🎯',
    label: 'Acertei!',
    text: '🎯 Acertei!',
    category: 'competicao',
    rarity: 'Raro',
    price: 1500,
    isDefault: false,
    sortOrder: 11,
    animation: 'sparkle',
  },
  {
    id: 'emote_rapido',
    emoji: '⚡',
    label: 'Rápido!',
    text: '⚡ Rápido!',
    category: 'psicologico',
    rarity: 'Raro',
    price: 1500,
    isDefault: false,
    sortOrder: 12,
    animation: 'sparkle',
  },
  {
    id: 'emote_olho',
    emoji: '👀',
    label: 'Estou de olho!',
    text: '👀 Estou de olho!',
    category: 'psicologico',
    rarity: 'Raro',
    price: 1500,
    isDefault: false,
    sortOrder: 13,
    animation: 'pulse',
  },

  // 4. ÉPICOS (3.500 MOEDAS)
  {
    id: 'emote_agora_vai',
    emoji: '😈',
    label: 'Agora é que vai!',
    text: '😈 Agora é que vai!',
    category: 'psicologico',
    rarity: 'Épico',
    price: 3500,
    isDefault: false,
    sortOrder: 14,
    animation: 'flame',
  },
  {
    id: 'emote_estou_pronto',
    emoji: '🥶',
    label: 'Estou pronto!',
    text: '🥶 Estou pronto!',
    category: 'competicao',
    rarity: 'Épico',
    price: 3500,
    isDefault: false,
    sortOrder: 15,
    animation: 'pulse',
  },
  {
    id: 'emote_respeito',
    emoji: '🫡',
    label: 'Respeito!',
    text: '🫡 Respeito!',
    category: 'geral',
    rarity: 'Épico',
    price: 3500,
    isDefault: false,
    sortOrder: 16,
    animation: 'bounce',
  },
  {
    id: 'emote_renhido',
    emoji: '🔥',
    label: 'Isto está renhido!',
    text: '🔥 Isto está renhido!',
    category: 'competicao',
    rarity: 'Épico',
    price: 3500,
    isDefault: false,
    sortOrder: 17,
    animation: 'flame',
  },
  {
    id: 'emote_nao_acredito',
    emoji: '😭',
    label: 'Não acredito!',
    text: '😭 Não acredito!',
    category: 'reacao',
    rarity: 'Épico',
    price: 3500,
    isDefault: false,
    sortOrder: 18,
    animation: 'shake',
  },

  // 5. LENDÁRIOS (7.500 MOEDAS)
  {
    id: 'emote_que_sorte',
    emoji: '🤣',
    label: 'Que sorte!',
    text: '🤣 Que sorte!',
    category: 'psicologico',
    rarity: 'Lendário',
    price: 7500,
    isDefault: false,
    sortOrder: 19,
    animation: 'bounce',
  },
  {
    id: 'emote_rei_portugal',
    emoji: '👑',
    label: 'Rei de Portugal!',
    text: '👑 Rei de Portugal!',
    category: 'patriotico',
    rarity: 'Lendário',
    price: 7500,
    isDefault: false,
    sortOrder: 20,
    animation: 'sparkle',
  },
  {
    id: 'emote_acorda_portugal',
    emoji: '🇵🇹',
    label: 'Acorda Portugal!',
    text: '🇵🇹 Acorda Portugal!',
    category: 'patriotico',
    rarity: 'Lendário',
    price: 7500,
    isDefault: false,
    sortOrder: 21,
    animation: 'pulse',
  },

  // 6. MÍTICOS (15.000 MOEDAS)
  {
    id: 'emote_dominio_total',
    emoji: '🔥🔥',
    label: 'DOMÍNIO TOTAL',
    text: '🔥🔥 DOMÍNIO TOTAL 🔥🔥',
    category: 'competicao',
    rarity: 'Mítico',
    price: 15000,
    isDefault: false,
    sortOrder: 22,
    animation: 'flame',
  },
  {
    id: 'emote_lenda_nacional',
    emoji: '⚡',
    label: 'LENDA NACIONAL',
    text: '⚡ LENDA NACIONAL ⚡',
    category: 'patriotico',
    rarity: 'Mítico',
    price: 15000,
    isDefault: false,
    sortOrder: 23,
    animation: 'sparkle',
  },
  {
    id: 'emote_portugal_topo',
    emoji: '🇵🇹',
    label: 'PORTUGAL NO TOPO!',
    text: '🇵🇹 PORTUGAL NO TOPO! 🇵🇹',
    category: 'patriotico',
    rarity: 'Mítico',
    price: 15000,
    isDefault: false,
    sortOrder: 24,
    animation: 'pulse',
  },
]

export const DEFAULT_EQUIPPED_EMOTES = [
  'emote_ola',
  'emote_boa_sorte',
  'emote_vamos',
  'emote_boa',
]

export const DEFAULT_UNLOCKED_EMOTES = OFFICIAL_EMOTES.filter(e => e.price === 0).map(e => e.id)

export function getEmoteById(id: string): EmoteItem | undefined {
  return OFFICIAL_EMOTES.find(e => e.id === id)
}

export function getEmoteRarityBadge(rarity: EmoteRarity) {
  switch (rarity) {
    case 'Comum':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'Raro':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    case 'Épico':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Lendário':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
    case 'Mítico':
      return 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600'
  }
}
