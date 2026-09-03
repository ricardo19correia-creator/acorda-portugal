/**
 * 🇵🇹 ACORDA PORTUGAL — OPERAÇÃO ARENAS 2150
 * REGISTO OFICIAL DAS 11 ARENAS SUPREMAS VIP (SSOT)
 * 
 * As arenas são o ápice visual do jogo: palcos digitais vivos com arquitetura própria,
 * iluminação volumétrica, partículas atmosféricas reativas e identidade lusitana.
 */

export type SupremeArenaRarity = 'Épica' | 'Lendária' | 'Mítica' | 'Mítica — Ultra VIP'

export type SupremeArenaEffectType =
  | 'palacio_dourado'
  | 'estadio_holofotes'
  | 'portugal_3d_grid'
  | 'trono_chamas'
  | 'castelo_nevoeiro'
  | 'ceu_aurora'
  | 'trono_supremo_final'
  | 'portugal_celestial_nebula'
  | 'coliseu_campeonato'
  | 'palacio_reis_manuelino'
  | 'cidadela_montanhas'

export interface SupremeArenaDefinition {
  id: string
  canonicalKey: string
  name: string
  subtitle: string
  rarity: SupremeArenaRarity
  priceCoins?: number
  priceEur?: number
  isVipEur: boolean
  assetPath: string
  thumbnailPath: string
  effectType: SupremeArenaEffectType
  atmosphereTag: string
  quote: string
  description: string
  architecturalDetails: string[]
  lightingProfile: {
    primaryGlow: string
    secondaryGlow: string
    ambientColor: string
    spotlightBeam: string
  }
  soundProfile: {
    ambientSound: string
    fanfareOnEnter: string
    correctFeedback: string
    wrongFeedback: string
  }
  aliases: string[]
}

export const SUPREME_ARENAS: SupremeArenaDefinition[] = [
  {
    id: 'arena_palacio_nacional',
    canonicalKey: 'PALACIO_NACIONAL_2150',
    name: 'Palácio Nacional',
    subtitle: 'O Santuário Imperial da Nação',
    rarity: 'Mítica',
    priceCoins: 35000,
    isVipEur: false,
    assetPath: '/arenas/vip/palacio-nacional.svg',
    thumbnailPath: '/arenas/vip/palacio-nacional.svg',
    effectType: 'palacio_dourado',
    atmosphereTag: 'PRESTÍGIO RÉGIO // OURO E MÁRMORE',
    quote: '«Onde os reis de Portugal forjaram o destino de um império eterno.»',
    description: 'Grande palácio monumental reinterpretado para 2150 com escadarias imperiais de mármore branco, colunas douradas volumétricas, brasões reais em relevo e chão refletor de cristal negro.',
    architecturalDetails: [
      'Escadaria Imperial com passadeira de veludo rubi',
      'Colunas monolíticas com veios dourados e azulejos cibernéticos',
      'Brasão das Quinas em ouro maciço com iluminação volumétrica',
      'Chão de mármore negro com reflexos de partículas douradas',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.45)',
      secondaryGlow: 'rgba(254, 240, 138, 0.35)',
      ambientColor: '#0f172a',
      spotlightBeam: 'conic-gradient(from 180deg at 50% 0%, rgba(245,158,11,0.25) 0deg, transparent 60deg, transparent 300deg, rgba(245,158,11,0.25) 360deg)',
    },
    soundProfile: {
      ambientSound: 'sfx_palace_reverb',
      fanfareOnEnter: 'fanfare_royal_imperial',
      correctFeedback: 'sfx_crystal_bell_gold',
      wrongFeedback: 'sfx_deep_bass_resonance',
    },
    aliases: ['AP-VIP-ARENA-PALACIO-NACIONAL', 'vip_palacio_nacional', 'palacio-nacional'],
  },
  {
    id: 'arena_estadio_das_lendas',
    canonicalKey: 'ESTADIO_LENDAS_2150',
    name: 'Estádio das Lendas',
    subtitle: 'O Coliseu da Final Nacional',
    rarity: 'Mítica',
    priceCoins: 38000,
    isVipEur: false,
    assetPath: '/arenas/vip/estadio-lendas.svg',
    thumbnailPath: '/arenas/vip/estadio-lendas.svg',
    effectType: 'estadio_holofotes',
    atmosphereTag: 'FINAL MONDIAL // 80.000 VOZES LUSITANAS',
    quote: '«Entra no relvado sagrado onde apenas os imortais erguem o troféu.»',
    description: 'Estádio monumental sob o céu noturno, rodeado por milhares de pontos luminosos do público, ecrãs holográficos gigantes, pirotecnia de vitória e holofotes de alta potência apontados ao jogador.',
    architecturalDetails: [
      'Bancadas monumentais com 80.000 pontos luminosos dinâmicos',
      'Ecrãs holográficos gigantes com as bandeiras dos 20 territórios',
      'Holofotes giratórios de 360 graus e pirotecnia nas alas',
      'Relvado cibernético com o Troféu do Desafio Nacional ao centro',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(16, 185, 129, 0.45)',
      secondaryGlow: 'rgba(6, 182, 212, 0.4)',
      ambientColor: '#022c22',
      spotlightBeam: 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.3) 0%, transparent 70%)',
    },
    soundProfile: {
      ambientSound: 'sfx_crowd_stadium_roar',
      fanfareOnEnter: 'fanfare_champions_anthem',
      correctFeedback: 'sfx_goal_horn_victory',
      wrongFeedback: 'sfx_crowd_gasp_tension',
    },
    aliases: ['AP-VIP-ARENA-ESTADIO-LENDAS', 'vip_estadio_lendas', 'estadio-lendas'],
  },
  {
    id: 'arena_portugal_3d',
    canonicalKey: 'PORTUGAL_3D_TWIN',
    name: 'Portugal 3D (Digital Twin)',
    subtitle: 'A Matriz Territorial Holográfica',
    rarity: 'Mítica',
    priceCoins: 40000,
    isVipEur: false,
    assetPath: '/arenas/vip/portugal-3d.svg',
    thumbnailPath: '/arenas/vip/portugal-3d.svg',
    effectType: 'portugal_3d_grid',
    atmosphereTag: 'CYBER-TERRITÓRIO // 20 NÓS SOBERANOS',
    quote: '«Portugal inteiro mapeado em luz quântica. O mapa é o teu tabuleiro.»',
    description: 'Digital Twin gamificado de Portugal flutuando sobre uma grelha de radar tático. Relevos montanhosos, litoral atlântico iluminado por neon ciano e nós de energia conectando os 18 distritos e as ilhas.',
    architecturalDetails: [
      'Território de Portugal em relevo 3D flutuante com linhas de costa em neon',
      '20 Nós territoriais pulsantes com o brasão de cada distrito',
      'Grelha de radar tático militar com varredura holográfica',
      'Pontes de luz e cabos de dados quânticos conectando o Continente às Ilhas',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(6, 182, 212, 0.5)',
      secondaryGlow: 'rgba(56, 189, 248, 0.35)',
      ambientColor: '#082f49',
      spotlightBeam: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.2) 0%, transparent 80%)',
    },
    soundProfile: {
      ambientSound: 'sfx_matrix_grid_hum',
      fanfareOnEnter: 'fanfare_cyber_tactical_reveal',
      correctFeedback: 'sfx_telecom_data_ping',
      wrongFeedback: 'sfx_glitch_overload_alert',
    },
    aliases: ['AP-VIP-ARENA-PORTUGAL-3D', 'vip_portugal_3d', 'portugal-3d'],
  },
  {
    id: 'arena_trono_real',
    canonicalKey: 'TRONO_REAL_2150',
    name: 'Trono Real',
    subtitle: 'A Sala do Juízo e da Glória',
    rarity: 'Lendária',
    priceCoins: 25000,
    isVipEur: false,
    assetPath: '/arenas/vip/trono-real.svg',
    thumbnailPath: '/arenas/vip/trono-real.svg',
    effectType: 'trono_chamas',
    atmosphereTag: 'SOBERANIA // PEDRA, OURO E CHAMA',
    quote: '«Senta-te no trono onde apenas a verdade do conhecimento concede o poder.»',
    description: 'Sala do trono monumental forjada em pedra vulcânica e detalhes de ouro fundido. Tochas ancestrais em chamas perpétuas iluminam os estandartes históricos das Quinas.',
    architecturalDetails: [
      'Trono colossal em pedra negra lapidada e filigrana de ouro',
      'Tochas murais de fogo vivo com brasas ascendentes',
      'Estandartes reais com as Quinas e a Esfera Armilar',
      'Câmara de teto alto com claraboia lunar e luz focal volumétrica',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.45)',
      secondaryGlow: 'rgba(245, 158, 11, 0.4)',
      ambientColor: '#450a0a',
      spotlightBeam: 'radial-gradient(circle at 50% 30%, rgba(239,68,68,0.25) 0%, transparent 75%)',
    },
    soundProfile: {
      ambientSound: 'sfx_torch_flame_crackling',
      fanfareOnEnter: 'fanfare_brass_coronation',
      correctFeedback: 'sfx_sword_sheath_strike',
      wrongFeedback: 'sfx_heavy_iron_door_slam',
    },
    aliases: ['AP-VIP-ARENA-TRONO-REAL', 'vip_trono_real', 'trono-real'],
  },
  {
    id: 'arena_castelo_dos_campeoes',
    canonicalKey: 'CASTELO_CAMPEOES_2150',
    name: 'Castelo dos Campeões',
    subtitle: 'A Fortaleza Inexpugnável',
    rarity: 'Épica',
    priceCoins: 18000,
    isVipEur: false,
    assetPath: '/arenas/vip/castelo-campeoes.svg',
    thumbnailPath: '/arenas/vip/castelo-campeoes.svg',
    effectType: 'castelo_nevoeiro',
    atmosphereTag: 'HONRA E CONQUISTA // MURALHAS DE GRANITO',
    quote: '«Nenhum inimigo derrubou estas muralhas. Aqui defende-se a honra do distrito.»',
    description: 'Praça de armas fortificada com ameias de granito, tochas ardentes sobre o nevoeiro das serras e céu tempestuoso carregado de relâmpagos heroicos.',
    architecturalDetails: [
      'Muralhas de granito maciço com ameias e seteiras de observação',
      'Torre de menagem imponente sob céu crepuscular tempestuoso',
      'Bandeiras heráldicas agitadas pelo vento das montanhas',
      'Chão de calçada medieval banhado pelo reflexo de tochas de fogo',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.4)',
      secondaryGlow: 'rgba(234, 179, 8, 0.35)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'radial-gradient(circle at 50% 60%, rgba(168,85,247,0.2) 0%, transparent 70%)',
    },
    soundProfile: {
      ambientSound: 'sfx_wind_mountain_fog',
      fanfareOnEnter: 'fanfare_warrior_horn_echo',
      correctFeedback: 'sfx_shield_clash_ring',
      wrongFeedback: 'sfx_distant_thunder_rumble',
    },
    aliases: ['AP-VIP-ARENA-CASTELO-CAMPEOES', 'vip_castelo_campeoes', 'castelo-campeoes'],
  },
  {
    id: 'arena_ceu_lusitano',
    canonicalKey: 'CEU_LUSITANO_2150',
    name: 'Céu Lusitano',
    subtitle: 'A Aurora Celeste de Portugal',
    rarity: 'Épica',
    priceCoins: 16000,
    isVipEur: false,
    assetPath: '/arenas/vip/ceu-lusitano.svg',
    thumbnailPath: '/arenas/vip/ceu-lusitano.svg',
    effectType: 'ceu_aurora',
    atmosphereTag: 'PORTUGAL + COSMOS // AURORA INFINITA',
    quote: '«Guiados pelas estrelas da Cruz do Sul e a luz sagrada da aurora.»',
    description: 'Plataforma celestial suspensa acima das nuvens com vista para as constelações dos navegadores, nebulosas verde-rubi e a aurora boreal lusitana.',
    architecturalDetails: [
      'Plataforma de observação astronómica com Esfera Armilar holográfica',
      'Céu cósmico com aurora boreal ondulante em tons de esmeralda e rubi',
      'Constelações estelares traçadas por feixes de luz interconectados',
      'Nuvens cósmicas iluminadas pela lua cheia prateada',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(20, 184, 166, 0.45)',
      secondaryGlow: 'rgba(147, 51, 234, 0.35)',
      ambientColor: '#042f2e',
      spotlightBeam: 'radial-gradient(circle at 50% 40%, rgba(20,184,166,0.25) 0%, transparent 80%)',
    },
    soundProfile: {
      ambientSound: 'sfx_cosmic_shimmer_ambient',
      fanfareOnEnter: 'fanfare_ethereal_choir_swell',
      correctFeedback: 'sfx_celestial_harp_twinkle',
      wrongFeedback: 'sfx_cosmic_void_echo',
    },
    aliases: ['AP-VIP-ARENA-CEU-LUSITANO', 'vip_ceu_lusitano', 'ceu-lusitano'],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-001',
    canonicalKey: 'TRONO_SUPREMO_CAMPEAO_ULTRA',
    name: 'Trono Supremo do Campeão',
    subtitle: 'O Palco Final do Universo 2150',
    rarity: 'Mítica — Ultra VIP',
    priceEur: 19.99,
    isVipEur: true,
    assetPath: '/arenas/vip/ultimate/trono-supremo-campeao.svg',
    thumbnailPath: '/arenas/vip/ultimate/trono-supremo-campeao.svg',
    effectType: 'trono_supremo_final',
    atmosphereTag: 'ULTRA VIP // O TOPO ABSOLUTO DO JOGO',
    quote: '«O cume supremo da glória. Apenas o verdadeiro Mestre Supremo tem o direito de pisar este chão.»',
    description: 'A arena mais monumental e prestigiosa de todo o Acorda Portugal. Trono colossal de ouro e platina, pilares de fogo vivo, auréola volumétrica de campeão e troféu supremo.',
    architecturalDetails: [
      'Trono colossal em ouro reluzente, platina e rubis lapidados',
      'Pilares de fogo e lasers volumétricos cortando a abóbada imperial',
      'Estandartes de gala das Quinas com bordados a fio de ouro líquido',
      'Troféu Nacional dos Campeões irradiando pulso de luz a cada resposta',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.65)',
      secondaryGlow: 'rgba(239, 68, 68, 0.55)',
      ambientColor: '#1c1917',
      spotlightBeam: 'radial-gradient(circle at 50% 20%, rgba(245,158,11,0.4) 0%, transparent 60%)',
    },
    soundProfile: {
      ambientSound: 'sfx_grand_orchestral_drone',
      fanfareOnEnter: 'fanfare_supreme_master_coronation',
      correctFeedback: 'sfx_golden_gong_triumph',
      wrongFeedback: 'sfx_thunder_overload_strike',
    },
    aliases: ['arena_trono_supremo_campeao', 'vip_arena_004', 'trono-supremo-campeao'],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-002',
    canonicalKey: 'PORTUGAL_CELESTIAL_ULTRA',
    name: 'Portugal Celestial',
    subtitle: 'O Território Além da Terra',
    rarity: 'Mítica — Ultra VIP',
    priceEur: 19.99,
    isVipEur: true,
    assetPath: '/arenas/vip/ultimate/portugal-celestial.svg',
    thumbnailPath: '/arenas/vip/ultimate/portugal-celestial.svg',
    effectType: 'portugal_celestial_nebula',
    atmosphereTag: 'ULTRA VIP // UNIVERSO CÓSMICO LUSITANO',
    quote: '«Portugal transcendeu a Terra e tornou-se um continente estelar eterno.»',
    description: 'Portugal 3D em escala monumental flutuando no espaço sideral, cercado por nebulosas estelares, chuva de meteoros dourados e a órbita da Terra ao fundo.',
    architecturalDetails: [
      'Portugal 3D flutuante no vácuo estelar com relevo e costa hiper-detalhada',
      'Nebulosa cósmica em espiral brilhando com cores da bandeira nacional',
      'Anéis de asteroides iluminados e satélites de transmissão orbital',
      'Plataforma de cristal estelar para o duelo dos jogadores',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.6)',
      secondaryGlow: 'rgba(6, 182, 212, 0.5)',
      ambientColor: '#09090b',
      spotlightBeam: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.3) 0%, transparent 75%)',
    },
    soundProfile: {
      ambientSound: 'sfx_deep_space_cosmic_wind',
      fanfareOnEnter: 'fanfare_astral_ascension',
      correctFeedback: 'sfx_supernova_burst_ping',
      wrongFeedback: 'sfx_black_hole_implosion',
    },
    aliases: ['arena_portugal_celestial', 'vip_arena_003', 'vip_arena_006', 'portugal-celestial'],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-003',
    canonicalKey: 'COLISEU_CAMPEOES_VIP',
    name: 'Coliseu dos Campeões',
    subtitle: 'A Grande Arena da Honra',
    rarity: 'Lendária',
    priceEur: 14.99,
    isVipEur: true,
    assetPath: '/arenas/vip/ultimate/coliseu-campeoes.svg',
    thumbnailPath: '/arenas/vip/ultimate/coliseu-campeoes.svg',
    effectType: 'coliseu_campeonato',
    atmosphereTag: 'GLADIADORES DO SABER // COLISEU 2150',
    quote: '«Entra como desafiante. Sai coroado como o mais sábio da nação.»',
    description: 'Coliseu circular futurista com arquibancadas em camadas, feixes de luz vertical, estandartes dos 20 distritos e pirotecnia de combate intelectual.',
    architecturalDetails: [
      'Arena circular com chão de arena de vidro temperado e iluminação inferior',
      'Colunas romanas-manuelinas reinterpretadas com armaduras de energia',
      '20 Estandartes distritais flutuando ao redor da cúpula do coliseu',
      'Canhões de chama de celebração acionados a cada acerto',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.5)',
      secondaryGlow: 'rgba(245, 158, 11, 0.45)',
      ambientColor: '#292524',
      spotlightBeam: 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.25) 0%, transparent 70%)',
    },
    soundProfile: {
      ambientSound: 'sfx_colosseum_gladiator_chant',
      fanfareOnEnter: 'fanfare_battle_call_drums',
      correctFeedback: 'sfx_gladiator_cheer_victory',
      wrongFeedback: 'sfx_arena_gong_strike',
    },
    aliases: ['arena_coliseu_campeoes', 'vip_arena_002', 'coliseu-campeoes'],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-004',
    canonicalKey: 'PALACIO_REIS_VIP',
    name: 'Palácio dos Reis',
    subtitle: 'O Esplendor Manuelino 2150',
    rarity: 'Lendária',
    priceEur: 14.99,
    isVipEur: true,
    assetPath: '/arenas/vip/ultimate/palacio-reis.svg',
    thumbnailPath: '/arenas/vip/ultimate/palacio-reis.svg',
    effectType: 'palacio_reis_manuelino',
    atmosphereTag: 'PATRIMÓNIO & FUTURO // VITRAIS DE LUZ',
    quote: '«A arte de Quinhentos renascida na era digital mais avançada.»',
    description: 'Salão nobre com arcos manuelinos de filigrana entrelaçada, vitrais cibernéticos projetando histórias de reis e navegadores, e candelabros de plasma luminoso.',
    architecturalDetails: [
      'Arcadas manuelinas com nós marítimos esculpidos e iluminados por fibra ótica',
      'Vitrais de plasma multicolorido com ilustrações dos Reis de Portugal',
      'Candelabros de cristal flutuantes com chamas estáticas azuis e douradas',
      'Chão de azulejo geométrico digital com pulsos luminescentes',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(59, 130, 246, 0.5)',
      secondaryGlow: 'rgba(245, 158, 11, 0.45)',
      ambientColor: '#172554',
      spotlightBeam: 'radial-gradient(circle at 50% 30%, rgba(59,130,246,0.3) 0%, transparent 70%)',
    },
    soundProfile: {
      ambientSound: 'sfx_cathedral_organ_echo',
      fanfareOnEnter: 'fanfare_renaissance_trumpets',
      correctFeedback: 'sfx_stained_glass_harmonic',
      wrongFeedback: 'sfx_heavy_organ_dissonance',
    },
    aliases: ['arena_palacio_reis', 'vip_arena_001', 'palacio-reis'],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-005',
    canonicalKey: 'CIDADELA_ETERNA_VIP',
    name: 'Cidadela Eterna',
    subtitle: 'A Fortaleza das Alturas Inconquistáveis',
    rarity: 'Épica',
    priceEur: 9.99,
    isVipEur: true,
    assetPath: '/arenas/vip/ultimate/cidadela-eterna.svg',
    thumbnailPath: '/arenas/vip/ultimate/cidadela-eterna.svg',
    effectType: 'cidadela_montanhas',
    atmosphereTag: 'RESISTÊNCIA // BALUARTE DAS SERRAS',
    quote: '«No topo das serras mais altas, a fortaleza que nunca conheceu a derrota.»',
    description: 'Cidadela fortificada no pico da Serra da Estrela, rodeada por névoa gelada, tochas eternas e muralhas que desafiam a gravidade sobre os abismos montanhosos.',
    architecturalDetails: [
      'Muralhas escalonadas sobre picos rochosos e nevoeiro em movimento',
      'Torres de vigia com archotes azuis e estandartes heráldicos de montanha',
      'Ponte levadiça de titânio sobre abismo iluminado por cristais geológicos',
      'Céu alpino com estrelas brilhantes e vento suave contínuo',
    ],
    lightingProfile: {
      primaryGlow: 'rgba(99, 102, 241, 0.45)',
      secondaryGlow: 'rgba(16, 185, 129, 0.35)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'radial-gradient(circle at 50% 60%, rgba(99,102,241,0.25) 0%, transparent 70%)',
    },
    soundProfile: {
      ambientSound: 'sfx_mountain_ridge_wind',
      fanfareOnEnter: 'fanfare_fortress_horn_reverb',
      correctFeedback: 'sfx_ice_crystal_shatter_ring',
      wrongFeedback: 'sfx_avalanche_distant_rumble',
    },
    aliases: ['arena_cidadela_eterna', 'vip_arena_005', 'cidadela-eterna'],
  },
]

/**
 * Procura e resolve uma arena suprema por ID ou alias
 */
export function getSupremeArenaById(id: string): SupremeArenaDefinition | undefined {
  const norm = String(id || '').toLowerCase().trim()
  return SUPREME_ARENAS.find(
    (a) => a.id.toLowerCase() === norm || a.canonicalKey.toLowerCase() === norm || a.aliases.some((al) => al.toLowerCase() === norm)
  )
}

/**
 * Retorna todas as arenas supremas ordenadas por raridade e prestígio
 */
export function getAllSupremeArenas(): SupremeArenaDefinition[] {
  return [...SUPREME_ARENAS]
}
