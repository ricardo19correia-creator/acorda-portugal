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
    price: 3500,
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
    price: 3500,
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
    price: 4000,
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
  },
  // =========================================================================
  // VIP COLLECTION 2.0 — ELITE TAUNT PACKS (4 PACKS)
  // =========================================================================
  {
    id: 'AP-VIP-TAUNTPACK-001',
    name: 'Realeza Absoluta',
    description: '6 provocações reais exclusivas gravadas com autoridade imperial.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    icon: '👑',
    taunts: [
      { id: 'vtp1_01', text: 'Curva-te perante o conhecimento do Rei!', icon: '👑' },
      { id: 'vtp1_02', text: 'Esta coroa não cai em solo lusitano.', icon: '⚔️' },
      { id: 'vtp1_03', text: 'Uma resposta digna de plebeu.', icon: '📜' },
      { id: 'vtp1_04', text: 'O trono de Portugal pertence aos sábios.', icon: '🏰' },
      { id: 'vtp1_05', text: 'A história curva-se à minha sabedoria!', icon: '⚡' },
      { id: 'vtp1_06', text: 'Vitória proclamada por decreto régio.', icon: '🇵🇹' },
    ]
  },
  {
    id: 'AP-VIP-TAUNTPACK-002',
    name: 'Guerra dos Campeões',
    description: '6 provocações competitivas desenhadas para duelos intensos.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0.4)]',
    icon: '⚔️',
    taunts: [
      { id: 'vtp2_01', text: 'Na arena do Desafio, só um prevalece!', icon: '⚔️' },
      { id: 'vtp2_02', text: 'Erraste no tempo, perdeste o momento!', icon: '⏱️' },
      { id: 'vtp2_03', text: 'Precisas de mais perguntas para me apanhar.', icon: '🛡️' },
      { id: 'vtp2_04', text: 'Conhecimento é poder na ponta da espada.', icon: '🔥' },
      { id: 'vtp2_05', text: 'O meu distrito lidera este combate.', icon: '🇵🇹' },
      { id: 'vtp2_06', text: 'Podes tentar outra vez... amanhã.', icon: '🎯' },
    ]
  },
  {
    id: 'AP-VIP-TAUNTPACK-003',
    name: 'Lusitano Implacável',
    description: '6 provocações bem-humoradas e tipicamente portuguesas.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    icon: '🇵🇹',
    taunts: [
      { id: 'vtp3_01', text: 'Nem com a Padeira de Aljubarrota lá chegavas!', icon: '🥖' },
      { id: 'vtp3_02', text: 'Isso até o Galo de Barcelos sabia!', icon: '🐓' },
      { id: 'vtp3_03', text: 'Toma lá um pastel de nata para consolar.', icon: '🥧' },
      { id: 'vtp3_04', text: 'Estás a navegar em águas nunca dantes vistas...', icon: '⛵' },
      { id: 'vtp3_05', text: 'Portugal não dorme no Desafio Nacional!', icon: '🇵🇹' },
      { id: 'vtp3_06', text: 'Foste ao mar perder a caneca!', icon: '🌊' },
    ]
  },
  {
    id: 'AP-VIP-TAUNTPACK-004',
    name: 'Final Boss',
    description: '6 provocações intimidantes e teatrais estilo chefe final.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.35)]',
    icon: '😈',
    taunts: [
      { id: 'vtp4_01', text: 'Chegaste ao chefe final do Acorda Portugal.', icon: '😈' },
      { id: 'vtp4_02', text: 'A tua streak acaba exatamente aqui.', icon: '⚡' },
      { id: 'vtp4_03', text: 'Pensavas que o topo do ranking era fácil?', icon: '💀' },
      { id: 'vtp4_04', text: 'Testaste a lenda e caíste no abismo.', icon: '🔥' },
      { id: 'vtp4_05', text: 'Fim de jogo. Game Over!', icon: '🛑' },
      { id: 'vtp4_06', text: 'Volta quando estudares mais sobre Portugal.', icon: '📚' },
    ]
  },
  // Aliases Legados
  {
    id: 'vip_tauntpack_001',
    name: 'Realeza Absoluta (Legado)',
    description: 'Coleção premium de provocações de corte imperial.',
    price: 14.99,
    isFree: false,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '👑',
    taunts: [
      { id: 'vtp1_01', text: 'Curva-te perante o conhecimento do Rei!', icon: '👑' },
      { id: 'vtp1_02', text: 'Esta coroa não cai em solo lusitano.', icon: '⚔️' },
      { id: 'vtp1_03', text: 'Uma resposta digna de plebeu.', icon: '📜' },
      { id: 'vtp1_04', text: 'O trono de Portugal pertence aos sábios.', icon: '🏰' },
      { id: 'vtp1_05', text: 'A história curva-se à minha sabedoria!', icon: '⚡' },
      { id: 'vtp1_06', text: 'Vitória proclamada por decreto régio.', icon: '🇵🇹' },
    ]
  }
]
