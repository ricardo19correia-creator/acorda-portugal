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
    price: 16000,
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
    price: 22000,
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
    price: 35000,
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
  // 4 TAUNT PACKS VIP OFICIAIS (€ REAL)
  // =========================================================================
  {
    id: 'vip_tauntpack_001',
    name: 'Provocação Real',
    description: 'Coleção premium de provocações elegantes e de corte imperial.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    icon: '👑',
    taunts: [
      { id: 'vtp1_01', text: 'A coroa não se herda, conquista-se! 👑' },
      { id: 'vtp1_02', text: 'Curva-te perante a sabedoria régia! ⚜️' },
      { id: 'vtp1_03', text: 'Nem com decreto real lá chegavas! 📜' },
      { id: 'vtp1_04', text: 'Um duelo digno da corte portuguesa! 🏰' },
      { id: 'vtp1_05', text: 'A realeza nunca hesita na resposta! ✨' },
      { id: 'vtp1_06', text: 'Xeque-mate à moda imperial! ⚔️' },
    ]
  },
  {
    id: 'vip_tauntpack_002',
    name: 'Guerra dos Campeões',
    description: 'Pack premium criado para os confrontos mais intensos.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    icon: '⚔️',
    taunts: [
      { id: 'vtp2_01', text: 'Esta arena é território de campeões! 🔥' },
      { id: 'vtp2_02', text: 'O cronómetro é o teu pior pesadelo! ⏳' },
      { id: 'vtp2_03', text: 'Foste atingido pelo impacto total! 💥' },
      { id: 'vtp2_04', text: 'Pressão máxima, resposta perfeita! ⚡' },
      { id: 'vtp2_05', text: 'Não há misericórdia no topo nacional! 🛡️' },
      { id: 'vtp2_06', text: 'Vitória incontestável e absoluta! 🏆' },
    ]
  },
  {
    id: 'vip_tauntpack_003',
    name: 'Lusitano Implacável',
    description: 'Pack de provocações épicas com alma e história lusitana.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    icon: '🇵🇹',
    taunts: [
      { id: 'vtp3_01', text: 'Com a força de Camões e Afonso Henriques! 🇵🇹' },
      { id: 'vtp3_02', text: 'Nem o Cabo das Tormentas me travava! 🧭' },
      { id: 'vtp3_03', text: 'Alma até à ponta dos pés, cabeça no topo! 🧠' },
      { id: 'vtp3_04', text: 'Portugal acorda sempre no momento certo! 🔔' },
      { id: 'vtp3_05', text: 'Fadista do saber, conquistador de pontos! 🎸' },
      { id: 'vtp3_06', text: 'Aqui canta-se a vitória lusitana! 🇵🇹🔥' },
    ]
  },
  {
    id: 'vip_tauntpack_004',
    name: 'Mestre da Trollagem',
    description: 'Pack divertido para destabilizar com inteligência e humor.',
    price: 0,
    isFree: false,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.35)]',
    icon: '😜',
    taunts: [
      { id: 'vtp4_01', text: 'Precisas de uma bússola para a resposta? 🧭' },
      { id: 'vtp4_02', text: 'Foi quase... mas quase não dá pontos! 😜' },
      { id: 'vtp4_03', text: 'O teu cérebro pediu reinicialização? 🤖' },
      { id: 'vtp4_04', text: 'Essa resposta foi patrocinada pelo azar! 🎲' },
      { id: 'vtp4_05', text: 'Ainda estás a ler a pergunta? 📖' },
      { id: 'vtp4_06', text: 'Mais devagar e entravas em hibernação! 🐌' },
    ]
  }
]
