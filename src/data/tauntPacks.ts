export interface TauntItem {
  id: string
  text: string
  icon?: string
}

export interface TauntPack {
  id: string
  name: string
  description: string
  price: number // 0 = grátis
  isFree?: boolean
  badgeColor: string
  icon: string
  taunts: TauntItem[]
}

export const TAUNT_PACKS: TauntPack[] = [
  {
    id: 'pack_basico',
    name: 'Pack Básico',
    description: 'Reações rápidas e desportivismo para qualquer momento de jogo.',
    price: 0,
    isFree: true,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: '💬',
    taunts: [
      { id: 't_boa_sorte', text: 'Boa sorte! 🤝' },
      { id: 't_rapida', text: 'Essa foi rápida! ⚡' },
      { id: 't_pensava', text: 'Pensava que sabias esta... 🤔' },
      { id: 't_tempo', text: 'Ainda vais a tempo! ⏱️' },
      { id: 't_suar', text: 'Vais suar! 🔥' },
      { id: 't_bora', text: 'Bora lá! 🚀' }
    ]
  },
  {
    id: 'pack_pressao',
    name: 'Guerra Psicológica & Pressão',
    description: 'Aumenta a tensão na contagem decrescente com provocações afiadas.',
    price: 1500,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: '⏳',
    taunts: [
      { id: 'PROV_010', text: 'Quem manda aqui soy yoo 👑' },
      { id: 't_tempo_voar', text: 'O tempo está a voar! ⏳' },
      { id: 't_sorte', text: 'Respondeste à sorte? 🎲' },
      { id: 't_chuto', text: 'Chutaste para o ar! 🚀' },
      { id: 't_rir', text: 'Essa era para rir? 😂' },
      { id: 't_cp', text: 'Mais devagar do que a CP... 🚂' },
      { id: 't_pressao', text: 'Sentiste a pressão? 💥' }
    ]
  },
  {
    id: 'pack_bairrismo',
    name: 'Bairrismo & Orgulho Distrital',
    description: 'Leva as rivalidades regionais e os costumes locais para a arena de quiz.',
    price: 2000,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '🏰',
    taunts: [
      { id: 't_distrito', text: 'O meu distrito não perdoa! 🏰' },
      { id: 't_francesinha', text: 'Vai mas é comer uma francesinha! 🥪' },
      { id: 't_lisboa_porto', text: 'Norte a Sul ninguém me pára! 🇵🇹' },
      { id: 't_mapa', text: 'Nem com mapa lá chegavas! 🗺️' },
      { id: 't_orgulho', text: 'Orgulho Lusitano! 🛡️' },
      { id: 't_tradicao', text: 'Aqui manda a tradição! 👑' }
    ]
  },
  {
    id: 'pack_memes',
    name: 'Memes & Cultura Portuguesa',
    description: 'Frases lendárias e momentos icónicos da televisão e cultura pop nacional.',
    price: 3500,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🎭',
    taunts: [
      { id: 't_jame', text: 'Jamé! Jamé! 🙅' },
      { id: 't_despedida', text: 'É para a despedida? 👋' },
      { id: 't_lume', text: 'Bota lume! 🔥' },
      { id: 't_scolari', text: 'E o burro sou eu?! 🤨' },
      { id: 't_brites', text: 'Chama a Brites de Almeida! 🥖' },
      { id: 't_pato', text: 'Sabe a pato! 🦆' }
    ]
  }
]
