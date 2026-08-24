import type { Arena, ArenaItem, ArenaRarity, ArenaEffect } from '@/src/types/arena'

export type { Arena, ArenaItem, ArenaRarity, ArenaEffect }

export const getArenaRarityBadge = (rarity: ArenaRarity): string => {
  switch (rarity) {
    case 'Comum':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'Rara':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    case 'Épica':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Lendária':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
    case 'Mítica':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
    case 'Exclusiva':
      return 'bg-rose-600/30 text-rose-200 border-rose-400/60 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700'
  }
}

export const ARENA_CATEGORIES_LIST = [
  { key: 'todos', label: 'Todas as Arenas', icon: '🌐' },
  { key: 'portugal', label: 'Portugal & Cidades', icon: '🇵🇹' },
  { key: 'ilhas', label: 'Ilhas & Natureza', icon: '🌋' },
  { key: 'historia', label: 'História & Épocas', icon: '⚔️' },
  { key: 'cultura', label: 'Cultura & Artes', icon: '🎭' },
  { key: 'futebol', label: 'Futebol & Estádios', icon: '⚽' },
  { key: 'futuristas', label: 'Futuristas & Cyberpunk', icon: '🚀' },
  { key: 'maluco', label: 'Modo Maluco', icon: '🤪' },
  { key: 'exclusivas', label: '👑 Ultra-Exclusivas', icon: '👑' },
] as const

export const ARENA_SHOP_CATALOG: ArenaItem[] = [
  // ============================================================================
  // 1. PORTUGAL & CIDADES
  // ============================================================================
  {
    id: 'arena_praca_liberdade',
    name: 'Praça da Liberdade',
    category: 'portugal',
    categoryLabel: 'Portugal',
    rarity: 'Rara',
    price: 3000,
    description: 'Cenário clássico da emblemática praça portuense com partículas solares douradas.',
    image: '/arenas/arena-praca-liberdade.jpg',
    imagePath: '/arenas/arena-praca-liberdade.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Rara'),
  },
  {
    id: 'arena_castelo_obidos',
    name: 'Castelo de Óbidos',
    category: 'portugal',
    categoryLabel: 'Portugal',
    rarity: 'Épica',
    price: 7500,
    description: 'Muralhas medievais iluminadas por tochas ardentes ao cair da noite.',
    image: '/arenas/arena-castelo-obidos.jpg',
    imagePath: '/arenas/arena-castelo-obidos.jpg',
    effect: 'fire',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_costa_atlantica',
    name: 'Costa Atlântica',
    category: 'portugal',
    categoryLabel: 'Portugal',
    rarity: 'Épica',
    price: 5000,
    description: 'Falésias majestosas batidas pelas ondas vivas do Atlântico e névoa marinha.',
    image: '/arenas/arena-costa-atlantica.jpg',
    imagePath: '/arenas/arena-costa-atlantica.jpg',
    effect: 'waves',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_ponte_d_luis',
    name: 'Ponte D. Luís',
    category: 'portugal',
    categoryLabel: 'Portugal',
    rarity: 'Épica',
    price: 8000,
    description: 'A icónica travessia do Douro envolta no brilho dourado do pôr-do-sol ribeirinho.',
    image: '/arenas/arena-ponte-d-luis.jpg',
    imagePath: '/arenas/arena-ponte-d-luis.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_lisboa_imperial',
    name: 'Lisboa Imperial',
    category: 'portugal',
    categoryLabel: 'Portugal',
    rarity: 'Lendária',
    price: 10000,
    description: 'Praça do Comércio e Terreiro do Paço banhados por partículas solares reluzentes.',
    image: '/arenas/arena-lisboa-imperial.jpg',
    imagePath: '/arenas/arena-lisboa-imperial.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Lendária'),
  },

  // ============================================================================
  // 2. ILHAS & NATUREZA
  // ============================================================================
  {
    id: 'arena_vulcao_erupcao',
    name: 'Vulcão em Erupção',
    category: 'ilhas',
    categoryLabel: 'Ilhas',
    rarity: 'Lendária',
    price: 12500,
    description: 'Cratera açoriana em plena atividade com lava incandescente e fagulhas em ascensão.',
    image: '/arenas/arena-vulcao-erupcao.jpg',
    imagePath: '/arenas/arena-vulcao-erupcao.jpg',
    effect: 'lava',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_madeira_tropical',
    name: 'Madeira Tropical',
    category: 'ilhas',
    categoryLabel: 'Ilhas',
    rarity: 'Épica',
    price: 8000,
    description: 'Floresta Laurissilva envolta numa suave névoa oceânica e vegetação luxuriante.',
    image: '/arenas/arena-madeira-tropical.jpg',
    imagePath: '/arenas/arena-madeira-tropical.jpg',
    effect: 'fog',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_pico_estrelas',
    name: 'Pico das Estrelas',
    category: 'ilhas',
    categoryLabel: 'Ilhas',
    rarity: 'Lendária',
    price: 15000,
    description: 'O ponto mais alto de Portugal sob um manto cósmico e constelações cintilantes.',
    image: '/arenas/arena-pico-estrelas.jpg',
    imagePath: '/arenas/arena-pico-estrelas.jpg',
    effect: 'stars',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_madeira_noite',
    name: 'Madeira — Noite Atlântica',
    category: 'ilhas',
    categoryLabel: 'Ilhas',
    rarity: 'Lendária',
    price: 10000,
    description: 'Luzes cintilantes do anfiteatro do Funchal refletidas no oceano escuro.',
    image: '/arenas/arena-madeira-noite.jpg',
    imagePath: '/arenas/arena-madeira-noite.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Lendária'),
  },

  // ============================================================================
  // 3. HISTÓRIA & ÉPOCAS
  // ============================================================================
  {
    id: 'arena_portugal_medieval',
    name: 'Portugal Medieval',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Épica',
    price: 9000,
    description: 'Povoado fortificado do século XII com tochas crepitantes e bandeiras históricas.',
    image: '/arenas/arena-portugal-medieval.jpg',
    imagePath: '/arenas/arena-portugal-medieval.jpg',
    effect: 'fire',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_era_descobrimentos',
    name: 'Era dos Descobrimentos',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Lendária',
    price: 15000,
    description: 'Naus a cruzar mares desconhecidos orientadas pelo astrolábio e estrelas guia.',
    image: '/arenas/arena-era-descobrimentos.jpg',
    imagePath: '/arenas/arena-era-descobrimentos.jpg',
    effect: 'stars',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_batalha_medieval',
    name: 'Campo de Batalha Medieval',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Lendária',
    price: 18000,
    description: 'Cenário épico de Aljubarrota com névoa densa e estandartes ao vento.',
    image: '/arenas/arena-batalha-medieval.jpg',
    imagePath: '/arenas/arena-batalha-medieval.jpg',
    effect: 'fog',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_corte_portuguesa',
    name: 'Corte Portuguesa',
    category: 'historia',
    categoryLabel: 'História',
    rarity: 'Mítica',
    price: 20000,
    description: 'Salão nobre do Palácio Nacional com lustres de cristal e faíscas de ouro real.',
    image: '/arenas/arena-corte-portuguesa.jpg',
    imagePath: '/arenas/arena-corte-portuguesa.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Mítica'),
  },

  // ============================================================================
  // 4. CULTURA & ARTES
  // ============================================================================
  {
    id: 'arena_festival_portugues',
    name: 'Festival Português',
    category: 'cultura',
    categoryLabel: 'Cultura',
    rarity: 'Épica',
    price: 7500,
    description: 'Arraial festivo de São João e Santo António com fogos de artifício e cor.',
    image: '/arenas/arena-6.jpg',
    imagePath: '/arenas/arena-6.jpg',
    effect: 'fireworks',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_teatro_nacional',
    name: 'Teatro Nacional',
    category: 'cultura',
    categoryLabel: 'Cultura',
    rarity: 'Épica',
    price: 8000,
    description: 'Cenário dramático do D. Maria II com foco de luz cénica e partículas suaves.',
    image: '/arenas/arena-4.jpg',
    imagePath: '/arenas/arena-4.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_galeria_portuguesa',
    name: 'Galeria Portuguesa',
    category: 'cultura',
    categoryLabel: 'Cultura',
    rarity: 'Rara',
    price: 6000,
    description: 'Ambiente minimalista e elegante em azulejos azuis e brancos com foco clean.',
    image: '/arenas/arena-1.jpg',
    imagePath: '/arenas/arena-1.jpg',
    effect: 'none',
    badgeColor: getArenaRarityBadge('Rara'),
  },

  // ============================================================================
  // 5. FUTEBOL & ESTÁDIOS
  // ============================================================================
  {
    id: 'arena_estadio_nacional',
    name: 'Estádio Nacional',
    category: 'futebol',
    categoryLabel: 'Futebol',
    rarity: 'Lendária',
    price: 10000,
    description: 'O relvado mítico do Jamor com flashes de câmaras e holofotes de gala.',
    image: '/arenas/arena-9.jpg',
    imagePath: '/arenas/arena-9.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_noite_jogo',
    name: 'Noite de Jogo',
    category: 'futebol',
    categoryLabel: 'Futebol',
    rarity: 'Lendária',
    price: 15000,
    description: 'Clássico sob chuva torrencial e atmosfera eletrizante de bancadas a ferver.',
    image: '/arenas/arena-9.jpg',
    imagePath: '/arenas/arena-9.jpg',
    effect: 'rain',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_final_nacional',
    name: 'Final Nacional',
    category: 'futebol',
    categoryLabel: 'Futebol',
    rarity: 'Mítica',
    price: 20000,
    description: 'O momento da consagração máxima com chuva de confetes e pirotecnia de campeão.',
    image: '/arenas/arena-5.jpg',
    imagePath: '/arenas/arena-5.jpg',
    effect: 'fireworks',
    badgeColor: getArenaRarityBadge('Mítica'),
  },
  {
    id: 'arena_noite_selecao',
    name: 'Noite da Seleção',
    category: 'futebol',
    categoryLabel: 'Futebol',
    rarity: 'Mítica',
    price: 25000,
    description: 'A nação unida em campo sob trovões de entusiasmo e feixes de laser verde e rubro.',
    image: '/arenas/arena-9.jpg',
    imagePath: '/arenas/arena-9.jpg',
    effect: 'lightning',
    badgeColor: getArenaRarityBadge('Mítica'),
  },

  // ============================================================================
  // 6. FUTURISTAS & CYBERPUNK
  // ============================================================================
  {
    id: 'arena_ponte_2077',
    name: 'Ponte do Infinito 2077',
    category: 'futuristas',
    categoryLabel: 'Futuristas',
    rarity: 'Comum',
    price: 0,
    description: 'Cenário cyberpunk sobre o Tejo com lasers e arranha-céus flutuantes.',
    image: '/arenas/arena-10.gif',
    imagePath: '/arenas/arena-10.gif',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Comum'),
  },
  {
    id: 'arena_lisboa_cybercore',
    name: 'Lisboa Cybercore',
    category: 'futuristas',
    categoryLabel: 'Futuristas',
    rarity: 'Lendária',
    price: 12000,
    description: 'A baixa lisboeta no ano 2088 com néon magenta, chuva digital e hologramas das Quinas.',
    image: '/arenas/arena-10.gif',
    imagePath: '/arenas/arena-10.gif',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_estacao_orbital',
    name: 'Estação Orbital Portugal',
    category: 'futuristas',
    categoryLabel: 'Futuristas',
    rarity: 'Mítica',
    price: 25000,
    description: 'Base espacial em órbita geoestacionária com vista panorâmica sobre o território nacional.',
    image: '/arenas/arena-8.jpg',
    imagePath: '/arenas/arena-8.jpg',
    effect: 'stars',
    badgeColor: getArenaRarityBadge('Mítica'),
  },
  {
    id: 'arena_portal_galactico',
    name: 'Portal Galáctico',
    category: 'futuristas',
    categoryLabel: 'Futuristas',
    rarity: 'Mítica',
    price: 30000,
    description: 'Vórtice dimensional quântico com pulsação hipnótica e distorção de espaço-tempo.',
    image: '/arenas/arena-8.jpg',
    imagePath: '/arenas/arena-8.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Mítica'),
  },

  // ============================================================================
  // 7. MODO MALUCO
  // ============================================================================
  {
    id: 'arena_portugal_ao_contrario',
    name: 'Portugal ao Contrário',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    rarity: 'Épica',
    price: 8000,
    description: 'Gravidade invertida: o mar está no teto e as montanhas apontam para o abismo!',
    image: '/arenas/arena-3.jpg',
    imagePath: '/arenas/arena-3.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Épica'),
  },
  {
    id: 'arena_caos_patos',
    name: 'Caos dos Patos',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    rarity: 'Lendária',
    price: 10000,
    description: 'Invasão cósmica de patos amarelos gigantes a flutuar pelo ecrã de duelo!',
    image: '/arenas/arena-5.jpg',
    imagePath: '/arenas/arena-5.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
  {
    id: 'arena_vulcao_pasteis',
    name: 'Vulcão de Pastéis de Nata',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    rarity: 'Mítica',
    price: 15000,
    description: 'Chuva torrencial e doce de pastéis de nata estaladiços saídos do forno cósmico!',
    image: '/arenas/arena-vulcao-erupcao.jpg',
    imagePath: '/arenas/arena-vulcao-erupcao.jpg',
    effect: 'lava',
    badgeColor: getArenaRarityBadge('Mítica'),
  },
  {
    id: 'arena_dentro_cerebro',
    name: 'Dentro do Cérebro',
    category: 'maluco',
    categoryLabel: 'Modo Maluco',
    rarity: 'Mítica',
    price: 20000,
    description: 'Viagem elétrica ao centro dos neurónios do quiz com tempestades de sinapses.',
    image: '/arenas/arena-8.jpg',
    imagePath: '/arenas/arena-8.jpg',
    effect: 'lightning',
    badgeColor: getArenaRarityBadge('Mítica'),
  },

  // ============================================================================
  // 8. ARENAS ULTRA-EXCLUSIVAS (PRESTÍGIO / CONQUISTAS — price: null)
  // ============================================================================
  {
    id: 'arena_excl_campeao',
    name: 'Arena do Campeão',
    category: 'exclusivas',
    categoryLabel: 'Ultra-Exclusivas',
    rarity: 'Mítica',
    price: null,
    unlockCondition: 'Exclusiva para o atual Campeão Nacional do Acorda Portugal',
    description: 'Trono sagrado de ouro e rubi concedido apenas ao líder absoluto de Portugal.',
    image: '/arenas/arena-corte-portuguesa.jpg',
    imagePath: '/arenas/arena-corte-portuguesa.jpg',
    effect: 'fireworks',
    badgeColor: getArenaRarityBadge('Exclusiva'),
  },
  {
    id: 'arena_excl_rank1',
    name: 'Arena #1',
    category: 'exclusivas',
    categoryLabel: 'Ultra-Exclusivas',
    rarity: 'Mítica',
    price: null,
    unlockCondition: 'Alcançar e manter o 1º lugar do Ranking Nacional',
    description: 'A arena dourada do número um com coroa celestial e feixes de prestígio.',
    image: '/arenas/arena-5.jpg',
    imagePath: '/arenas/arena-5.jpg',
    effect: 'lightning',
    badgeColor: getArenaRarityBadge('Exclusiva'),
  },
  {
    id: 'arena_excl_fundadores',
    name: 'Arena dos Fundadores',
    category: 'exclusivas',
    categoryLabel: 'Ultra-Exclusivas',
    rarity: 'Mítica',
    price: null,
    unlockCondition: 'Exclusiva de Lançamento / Passe Fundador',
    description: 'Monumento imortal com as Quinas em néon perpétuo e aura mística dos pioneiros.',
    image: '/arenas/arena-lisboa-imperial.jpg',
    imagePath: '/arenas/arena-lisboa-imperial.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Exclusiva'),
  },
  {
    id: 'arena_excl_lenda_100',
    name: 'Arena Lenda',
    category: 'exclusivas',
    categoryLabel: 'Ultra-Exclusivas',
    rarity: 'Mítica',
    price: null,
    unlockCondition: 'Conquista de 100 Vitórias em Duelos 1v1',
    description: 'Arena dos guerreiros imortais forjada no fogo de 100 batalhas vitoriosas.',
    image: '/arenas/arena-batalha-medieval.jpg',
    imagePath: '/arenas/arena-batalha-medieval.jpg',
    effect: 'fire',
    badgeColor: getArenaRarityBadge('Exclusiva'),
  },
  {
    id: 'arena_excl_torneio',
    name: 'Arena do Torneio',
    category: 'exclusivas',
    categoryLabel: 'Ultra-Exclusivas',
    rarity: 'Lendária',
    price: null,
    unlockCondition: 'Recompensa de vitória em Torneio ou Evento Especial',
    description: 'Coliseu vibrante de duelo final onde os campeões de torneio são coroados.',
    image: '/arenas/arena-5.jpg',
    imagePath: '/arenas/arena-5.jpg',
    effect: 'particles',
    badgeColor: getArenaRarityBadge('Lendária'),
  },
]

export function getArenaById(id: string): ArenaItem | undefined {
  if (!id) return undefined
  const cleanId = id.toLowerCase().replace(/-/g, '_')
  return (
    ARENA_SHOP_CATALOG.find((a) => a.id === id || a.id.toLowerCase() === cleanId) ||
    ARENA_SHOP_CATALOG.find((a) => a.image?.includes(id) || a.imagePath?.includes(id)) ||
    (id === 'arena_1' ? ARENA_SHOP_CATALOG[0] : undefined) ||
    (id === 'arena_2' ? ARENA_SHOP_CATALOG[1] : undefined) ||
    (id === 'arena_ponte_2077' || id === 'arena_neon_2088' || id === 'arena_10' ? ARENA_SHOP_CATALOG[20] : undefined)
  )
}

export function getDefaultArena(): ArenaItem {
  return ARENA_SHOP_CATALOG[0]
}

export function getRandomArena(): ArenaItem {
  const idx = Math.floor(Math.random() * ARENA_SHOP_CATALOG.length)
  return ARENA_SHOP_CATALOG[idx]
}
