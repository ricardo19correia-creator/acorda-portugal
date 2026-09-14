/**
 * 🇵🇹 ACORDA PORTUGAL — MASTER ARENA CATALOG (SSOT)
 * Single Source of Truth para todas as 43 Arenas de Jogo (11 VIP Supremas + 32 Oficiais e Regionais).
 * 
 * Regra Crítica:
 * NENHUM componente deve inventar dados de arenas localmente.
 * NUNCA usar Palácio Nacional como fallback universal silencioso.
 * Se uma arena não puder ser resolvida, emitir erro e exibir 'ARENA NÃO DEFINIDA'.
 */

export type ArenaRarity =
  | 'Comum'
  | 'Rara'
  | 'Épica'
  | 'Lendária'
  | 'Mítica'
  | 'Mítica — Ultra VIP'

export type ArenaVisualType = 'svg_vector' | 'webp_raster' | 'jpg_raster'

export type ArenaCategoryType =
  | 'vip_supreme'
  | 'vip_ultimate'
  | 'distrital'
  | 'historica'
  | 'especial'
  | 'futurista'
  | 'tematica'

export interface ArenaLightingProfile {
  primaryGlow: string
  secondaryGlow: string
  ambientColor: string
  spotlightBeam: string
}

export interface CanonicalArena {
  id: string
  slug: string
  name: string
  subtitle: string
  rarity: ArenaRarity
  category: ArenaCategoryType
  description: string
  quote?: string
  assetPath: string
  thumbnail: string
  background: string
  effects: string
  unlockRule: 'unlocked_by_default' | 'purchase_coins' | 'purchase_eur' | 'merit'
  priceCoins?: number
  priceEur?: number
  purchaseRule: string
  gameplayAvailability: boolean
  visualType: ArenaVisualType
  lightingProfile: ArenaLightingProfile
  aliases: string[]
  architecturalDetails?: string[]
}

// ============================================================================
// AS 11 ARENAS SUPREMAS VIP (COINS & EUR REAL)
// ============================================================================

export const VIP_ARENAS: CanonicalArena[] = [
  {
    id: 'arena_palacio_nacional',
    slug: 'palacio-nacional',
    name: 'Palácio Nacional',
    subtitle: 'O Santuário Imperial da Nação',
    rarity: 'Mítica',
    category: 'vip_supreme',
    description: 'Grande palácio monumental reinterpretado para 2150 com escadarias imperiais de mármore branco, colunas douradas volumétricas, brasões reais em relevo e chão refletor de cristal negro.',
    quote: '«Onde os reis de Portugal forjaram o destino de um império eterno.»',
    assetPath: '/arenas/Palácio da Nação.jfif',
    thumbnail: '/arenas/Palácio da Nação.jfif',
    background: '/arenas/Palácio da Nação.jfif',
    effects: 'palacio_dourado',
    unlockRule: 'purchase_coins',
    priceCoins: 35000,
    purchaseRule: 'Disponível na Loja por 35.000 moedas Acorda ou por Mérito de Grande Mestre.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.45)',
      secondaryGlow: 'rgba(254, 240, 138, 0.35)',
      ambientColor: '#0f172a',
      spotlightBeam: 'conic-gradient(from 180deg at 50% 0%, rgba(245,158,11,0.25) 0deg, transparent 60deg, transparent 300deg, rgba(245,158,11,0.25) 360deg)',
    },
    aliases: ['AP-VIP-ARENA-PALACIO-NACIONAL', 'vip_palacio_nacional', 'palacio-nacional', 'palacio'],
    architecturalDetails: [
      'Escadaria Imperial com passadeira de veludo rubi',
      'Colunas monolíticas com veios dourados e azulejos cibernéticos',
      'Brasão das Quinas em ouro maciço com iluminação volumétrica',
      'Chão de mármore negro com reflexos de partículas douradas',
    ],
  },
  {
    id: 'arena_estadio_das_lendas',
    slug: 'estadio-lendas',
    name: 'Estádio das Lendas',
    subtitle: 'O Coliseu da Final Nacional',
    rarity: 'Mítica',
    category: 'vip_supreme',
    description: 'Estádio monumental sob o céu noturno, rodeado por 80.000 vozes lusitanas, ecrãs holográficos gigantes, pirotecnia de vitória e holofotes de alta potência apontados ao centro do campo.',
    quote: '«Entra no relvado sagrado onde apenas os imortais erguem o troféu.»',
    assetPath: '/arenas/Estádio do Fim dos Tempos.jfif',
    thumbnail: '/arenas/Estádio do Fim dos Tempos.jfif',
    background: '/arenas/Estádio do Fim dos Tempos.jfif',
    effects: 'estadio_holofotes',
    unlockRule: 'purchase_coins',
    priceCoins: 38000,
    purchaseRule: 'Disponível na Loja por 38.000 moedas Acorda.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(16, 185, 129, 0.45)',
      secondaryGlow: 'rgba(6, 182, 212, 0.4)',
      ambientColor: '#022c22',
      spotlightBeam: 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.3) 0%, transparent 70%)',
    },
    aliases: ['AP-VIP-ARENA-ESTADIO-LENDAS', 'vip_estadio_lendas', 'estadio-lendas', 'estadio_lendas'],
    architecturalDetails: [
      'Bancadas monumentais com 80.000 pontos luminosos dinâmicos',
      'Ecrãs holográficos gigantes com as bandeiras dos 20 territórios',
      'Holofotes giratórios de 360 graus e pirotecnia nas alas',
      'Relvado cibernético com o Troféu do Desafio Nacional ao centro',
    ],
  },
  {
    id: 'arena_portugal_3d',
    slug: 'portugal-3d',
    name: 'Portugal 3D',
    subtitle: 'A Matriz Territorial Holográfica',
    rarity: 'Mítica',
    category: 'vip_supreme',
    description: 'Digital Twin gamificado de Portugal flutuando sobre uma grelha de radar tático. Relevos montanhosos, litoral atlântico iluminado por neon ciano e 20 nós territoriais de energia interconectados.',
    quote: '«Portugal inteiro em luz quântica. O território é o teu tabuleiro.»',
    assetPath: '/arenas/Génese Lusitana.jfif',
    thumbnail: '/arenas/Génese Lusitana.jfif',
    background: '/arenas/Génese Lusitana.jfif',
    effects: 'portugal_3d_grid',
    unlockRule: 'purchase_coins',
    priceCoins: 40000,
    purchaseRule: 'Disponível na Loja por 40.000 moedas Acorda.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(6, 182, 212, 0.5)',
      secondaryGlow: 'rgba(56, 189, 248, 0.35)',
      ambientColor: '#082f49',
      spotlightBeam: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.2) 0%, transparent 80%)',
    },
    aliases: ['AP-VIP-ARENA-PORTUGAL-3D', 'vip_portugal_3d', 'portugal-3d', 'portugal_3d'],
    architecturalDetails: [
      'Território de Portugal em relevo 3D flutuante com linhas de costa em neon',
      '20 Nós territoriais pulsantes com o brasão de cada distrito',
      'Grelha de radar tático militar com varredura holográfica',
      'Pontes de luz quântica ligando Continente às Ilhas',
    ],
  },
  {
    id: 'arena_trono_real',
    slug: 'trono-real',
    name: 'Trono Real',
    subtitle: 'A Sala do Juízo e da Glória',
    rarity: 'Lendária',
    category: 'vip_supreme',
    description: 'Sala do trono monumental forjada em pedra vulcânica e detalhes de ouro fundido. Tochas ancestrais em chamas perpétuas iluminam os estandartes históricos das Quinas.',
    quote: '«Senta-te no trono onde apenas a verdade do conhecimento concede o poder.»',
    assetPath: '/arenas/Sala do Trono.jpg',
    thumbnail: '/arenas/Sala do Trono.jpg',
    background: '/arenas/Sala do Trono.jpg',
    effects: 'trono_chamas',
    unlockRule: 'purchase_coins',
    priceCoins: 25000,
    purchaseRule: 'Disponível na Loja por 25.000 moedas Acorda.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.45)',
      secondaryGlow: 'rgba(245, 158, 11, 0.4)',
      ambientColor: '#450a0a',
      spotlightBeam: 'radial-gradient(circle at 50% 30%, rgba(239,68,68,0.25) 0%, transparent 75%)',
    },
    aliases: ['AP-VIP-ARENA-TRONO-REAL', 'vip_trono_real', 'trono-real', 'trono_real'],
    architecturalDetails: [
      'Trono colossal em pedra negra lapidada e filigrana de ouro',
      'Tochas murais de fogo vivo com brasas ascendentes',
      'Estandartes reais com as Quinas e a Esfera Armilar',
      'Claraboia lunar com luz focal volumétrica',
    ],
  },
  {
    id: 'arena_castelo_dos_campeoes',
    slug: 'castelo-campeoes',
    name: 'Castelo dos Campeões',
    subtitle: 'A Fortaleza Inexpugnável',
    rarity: 'Épica',
    category: 'vip_supreme',
    description: 'Praça de armas fortificada com ameias de granito, tochas ardentes sobre o nevoeiro das serras e céu tempestuoso carregado de relâmpagos heroicos.',
    quote: '«Nenhum inimigo derrubou estas muralhas. Aqui defende-se a honra do distrito.»',
    assetPath: '/arenas/Fortaleza Glaciar.jfif',
    thumbnail: '/arenas/Fortaleza Glaciar.jfif',
    background: '/arenas/Fortaleza Glaciar.jfif',
    effects: 'castelo_nevoeiro',
    unlockRule: 'purchase_coins',
    priceCoins: 18000,
    purchaseRule: 'Disponível na Loja por 18.000 moedas Acorda.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.4)',
      secondaryGlow: 'rgba(234, 179, 8, 0.35)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'radial-gradient(circle at 50% 60%, rgba(168,85,247,0.2) 0%, transparent 70%)',
    },
    aliases: ['AP-VIP-ARENA-CASTELO-CAMPEOES', 'vip_castelo_campeoes', 'castelo-campeoes', 'castelo_campeoes'],
    architecturalDetails: [
      'Muralhas de granito maciço com ameias e seteiras de observação',
      'Torre de menagem imponente sob céu crepuscular tempestuoso',
      'Bandeiras heráldicas agitadas pelo vento das montanhas',
      'Calçada medieval banhada pelo reflexo de tochas',
    ],
  },
  {
    id: 'arena_ceu_lusitano',
    slug: 'ceu-lusitano',
    name: 'Céu Lusitano',
    subtitle: 'A Aurora Celeste de Portugal',
    rarity: 'Épica',
    category: 'vip_supreme',
    description: 'Plataforma celestial suspensa acima das nuvens com vista para as constelações dos navegadores, nebulosas verde-rubi e a aurora boreal lusitana.',
    quote: '«Guiados pelas estrelas da Cruz do Sul e a luz sagrada da aurora.»',
    assetPath: '/arenas/Cúpula do Atlântico.jfif',
    thumbnail: '/arenas/Cúpula do Atlântico.jfif',
    background: '/arenas/Cúpula do Atlântico.jfif',
    effects: 'ceu_aurora',
    unlockRule: 'purchase_coins',
    priceCoins: 16000,
    purchaseRule: 'Disponível na Loja por 16.000 moedas Acorda.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(20, 184, 166, 0.45)',
      secondaryGlow: 'rgba(147, 51, 234, 0.35)',
      ambientColor: '#042f2e',
      spotlightBeam: 'radial-gradient(circle at 50% 40%, rgba(20,184,166,0.25) 0%, transparent 80%)',
    },
    aliases: ['AP-VIP-ARENA-CEU-LUSITANO', 'vip_ceu_lusitano', 'ceu-lusitano', 'ceu_lusitano'],
    architecturalDetails: [
      'Plataforma de observação astronómica com Esfera Armilar holográfica',
      'Aurora boreal ondulante em tons de esmeralda e rubi',
      'Constelações estelares traçadas por feixes de luz',
      'Nuvens cósmicas iluminadas pela lua cheia prateada',
    ],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-001',
    slug: 'trono-supremo-campeao',
    name: 'Trono Supremo do Campeão',
    subtitle: 'O Palco Final do Universo 2150',
    rarity: 'Mítica — Ultra VIP',
    category: 'vip_ultimate',
    description: 'A arena mais monumental e prestigiosa de todo o Acorda Portugal. Trono colossal de ouro e platina, pilares de fogo vivo, auréola volumétrica de campeão e troféu supremo.',
    quote: '«O cume supremo da glória. Apenas o verdadeiro Mestre Supremo tem o direito de pisar este chão.»',
    assetPath: '/arenas/Sala do Trono.jpg',
    thumbnail: '/arenas/Sala do Trono.jpg',
    background: '/arenas/Sala do Trono.jpg',
    effects: 'trono_supremo_final',
    unlockRule: 'purchase_eur',
    priceEur: 19.99,
    purchaseRule: 'Exclusivo VIP €19,99. Dá acesso permanente ao Trono Supremo em todos os modos.',
    gameplayAvailability: true,
    visualType: 'webp_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.65)',
      secondaryGlow: 'rgba(239, 68, 68, 0.55)',
      ambientColor: '#1c1917',
      spotlightBeam: 'radial-gradient(circle at 50% 20%, rgba(245,158,11,0.4) 0%, transparent 60%)',
    },
    aliases: ['arena_trono_supremo_campeao', 'vip_arena_004', 'trono-supremo-campeao', 'trono-supremo'],
    architecturalDetails: [
      'Trono colossal em ouro reluzente, platina e rubis lapidados',
      'Pilares de fogo e lasers volumétricos cortando a abóbada imperial',
      'Estandartes de gala das Quinas com bordados a ouro líquido',
      'Troféu Nacional dos Campeões irradiando pulso de luz',
    ],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-002',
    slug: 'portugal-celestial',
    name: 'Portugal Celestial',
    subtitle: 'O Território Além da Terra',
    rarity: 'Mítica — Ultra VIP',
    category: 'vip_ultimate',
    description: 'Portugal 3D em escala monumental flutuando no espaço sideral, cercado por nebulosas estelares, chuva de meteoros dourados e a órbita da Terra ao fundo.',
    quote: '«Portugal transcendeu a Terra e tornou-se um continente estelar eterno.»',
    assetPath: '/arenas/Plataforma Astral.jfif',
    thumbnail: '/arenas/Plataforma Astral.jfif',
    background: '/arenas/Plataforma Astral.jfif',
    effects: 'portugal_celestial_nebula',
    unlockRule: 'purchase_eur',
    priceEur: 19.99,
    purchaseRule: 'Exclusivo VIP €19,99. Visual cósmico ultra-detalhado.',
    gameplayAvailability: true,
    visualType: 'webp_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.6)',
      secondaryGlow: 'rgba(6, 182, 212, 0.5)',
      ambientColor: '#09090b',
      spotlightBeam: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.3) 0%, transparent 75%)',
    },
    aliases: ['arena_portugal_celestial', 'vip_arena_003', 'vip_arena_006', 'portugal-celestial', 'portugal_celestial'],
    architecturalDetails: [
      'Portugal 3D flutuante no vácuo estelar com relevo e costa hiper-detalhada',
      'Nebulosa cósmica em espiral brilhando com cores da bandeira nacional',
      'Anéis de asteroides iluminados e satélites de transmissão orbital',
      'Plataforma de cristal estelar para o duelo dos jogadores',
    ],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-003',
    slug: 'coliseu-campeoes',
    name: 'Coliseu dos Campeões',
    subtitle: 'A Grande Arena da Honra',
    rarity: 'Lendária',
    category: 'vip_ultimate',
    description: 'Coliseu circular futurista com arquibancadas em camadas, feixes de luz vertical, estandartes dos 20 distritos e pirotecnia de combate intelectual.',
    quote: '«Entra como desafiante. Sai coroado como o mais sábio da nação.»',
    assetPath: '/arenas/Templo dos Relâmpagos.jfif',
    thumbnail: '/arenas/Templo dos Relâmpagos.jfif',
    background: '/arenas/Templo dos Relâmpagos.jfif',
    effects: 'coliseu_campeonato',
    unlockRule: 'purchase_eur',
    priceEur: 14.99,
    purchaseRule: 'Exclusivo VIP €14,99.',
    gameplayAvailability: true,
    visualType: 'webp_raster',
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.5)',
      secondaryGlow: 'rgba(245, 158, 11, 0.45)',
      ambientColor: '#292524',
      spotlightBeam: 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.25) 0%, transparent 70%)',
    },
    aliases: ['arena_coliseu_campeoes', 'vip_arena_002', 'coliseu-campeoes', 'coliseu_campeoes'],
    architecturalDetails: [
      'Arena circular com chão de arena de vidro temperado e iluminação inferior',
      'Colunas romanas-manuelinas reinterpretadas com armaduras de energia',
      '20 Estandartes distritais flutuando ao redor da cúpula do coliseu',
      'Canhões de chama de celebração acionados a cada acerto',
    ],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-004',
    slug: 'palacio-reis',
    name: 'Palácio dos Reis',
    subtitle: 'O Esplendor Manuelino 2150',
    rarity: 'Lendária',
    category: 'vip_ultimate',
    description: 'Salão nobre com arcos manuelinos de filigrana entrelaçada, vitrais cibernéticos projetando histórias de reis e navegadores, e candelabros de plasma luminoso.',
    quote: '«A arte de Quinhentos renascida na era digital mais avançada.»',
    assetPath: '/arenas/Panteão dos Reis.jpg',
    thumbnail: '/arenas/Panteão dos Reis.jpg',
    background: '/arenas/Panteão dos Reis.jpg',
    effects: 'palacio_reis_manuelino',
    unlockRule: 'purchase_eur',
    priceEur: 14.99,
    purchaseRule: 'Exclusivo VIP €14,99.',
    gameplayAvailability: true,
    visualType: 'webp_raster',
    lightingProfile: {
      primaryGlow: 'rgba(59, 130, 246, 0.5)',
      secondaryGlow: 'rgba(245, 158, 11, 0.45)',
      ambientColor: '#172554',
      spotlightBeam: 'radial-gradient(circle at 50% 30%, rgba(59,130,246,0.3) 0%, transparent 70%)',
    },
    aliases: ['arena_palacio_reis', 'vip_arena_001', 'palacio-reis', 'palacio_reis'],
    architecturalDetails: [
      'Arcadas manuelinas com nós marítimos esculpidos e iluminados por fibra ótica',
      'Vitrais de plasma multicolorido com ilustrações dos Reis de Portugal',
      'Candelabros de cristal flutuantes com chamas estáticas azuis e douradas',
      'Chão de azulejo geométrico digital com pulsos luminescentes',
    ],
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-005',
    slug: 'cidadela-eterna',
    name: 'Cidadela Eterna',
    subtitle: 'A Fortaleza das Alturas Inconquistáveis',
    rarity: 'Épica',
    category: 'vip_ultimate',
    description: 'Cidadela fortificada no pico da Serra da Estrela, rodeada por névoa gelada, tochas eternas e muralhas que desafiam a gravidade sobre os abismos montanhosos.',
    quote: '«No topo das serras mais altas, a fortaleza que nunca conheceu a derrota.»',
    assetPath: '/arenas/Cidadela dos Céus.jfif',
    thumbnail: '/arenas/Cidadela dos Céus.jfif',
    background: '/arenas/Cidadela dos Céus.jfif',
    effects: 'cidadela_montanhas',
    unlockRule: 'purchase_eur',
    priceEur: 9.99,
    purchaseRule: 'Exclusivo VIP €9,99.',
    gameplayAvailability: true,
    visualType: 'webp_raster',
    lightingProfile: {
      primaryGlow: 'rgba(99, 102, 241, 0.45)',
      secondaryGlow: 'rgba(16, 185, 129, 0.35)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'radial-gradient(circle at 50% 60%, rgba(99,102,241,0.25) 0%, transparent 70%)',
    },
    aliases: ['arena_cidadela_eterna', 'vip_arena_005', 'cidadela-eterna', 'cidadela_eterna'],
    architecturalDetails: [
      'Muralhas escalonadas sobre picos rochosos e nevoeiro em movimento',
      'Torres de vigia com archotes azuis e estandartes heráldicos de montanha',
      'Ponte levadiça de titânio sobre abismo iluminado por cristais geológicos',
      'Céu alpino com estrelas brilhantes e vento suave contínuo',
    ],
  },
]

// ============================================================================
// AS 32 ARENAS CANÓNICAS NACIONAIS E DISTRITAIS
// ============================================================================

export const STANDARD_ARENAS: CanonicalArena[] = [
  {
    id: 'arena_praca_liberdade',
    slug: 'praca-liberdade',
    name: 'Praça da Liberdade',
    subtitle: 'Coração do Porto & Avenida dos Aliados',
    rarity: 'Comum',
    category: 'distrital',
    description: 'A praça cívica mais emblemática da Invicta, cercada pelos edifícios imponentes de granito e estátua de D. Pedro IV.',
    assetPath: '/arenas/Terreiro Dourado.jpg',
    thumbnail: '/arenas/Terreiro Dourado.jpg',
    background: '/arenas/Terreiro Dourado.jpg',
    effects: 'particles',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Disponível gratuitamente para todos os cidadãos de Portugal.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(59, 130, 246, 0.3)',
      secondaryGlow: 'rgba(245, 158, 11, 0.2)',
      ambientColor: '#0f172a',
      spotlightBeam: 'none',
    },
    aliases: ['arena_1', 'arena1', 'praca-liberdade', 'porto', 'aliados'],
  },
  {
    id: 'arena_torre_belem',
    slug: 'torre-belem',
    name: 'Torre de Belém',
    subtitle: 'Sentinela do Tejo & Joia Manuelina',
    rarity: 'Rara',
    category: 'historica',
    description: 'Monumento Património Mundial da UNESCO na foz do Rio Tejo, símbolo das partidas dos grandes navegadores portugueses.',
    assetPath: '/arenas/lisboa Imperial.jpg',
    thumbnail: '/arenas/lisboa Imperial.jpg',
    background: '/arenas/lisboa Imperial.jpg',
    effects: 'water',
    unlockRule: 'purchase_coins',
    priceCoins: 5000,
    purchaseRule: 'Disponível na Loja por 5.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(6, 182, 212, 0.4)',
      secondaryGlow: 'rgba(234, 179, 8, 0.3)',
      ambientColor: '#082f49',
      spotlightBeam: 'none',
    },
    aliases: ['torre-belem', 'belem', 'lisboa-torre'],
  },
  {
    id: 'arena_ponte_d_luis',
    slug: 'ponte-d-luis',
    name: 'Ponte D. Luís I',
    subtitle: 'O Arco de Ferro sobre o Douro',
    rarity: 'Rara',
    category: 'distrital',
    description: 'A lendária estrutura metálica de Gustave Eiffel e Théophile Seyrig unindo as margens do Porto e Vila Nova de Gaia.',
    assetPath: '/arenas/Bastião do Douro.jpg',
    thumbnail: '/arenas/Bastião do Douro.jpg',
    background: '/arenas/Bastião do Douro.jpg',
    effects: 'sparks',
    unlockRule: 'purchase_coins',
    priceCoins: 6000,
    purchaseRule: 'Disponível na Loja por 6.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.4)',
      secondaryGlow: 'rgba(59, 130, 246, 0.3)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['ponte-d-luis', 'ponte-luis', 'douro'],
  },
  {
    id: 'arena_castelo_obidos',
    slug: 'castelo-obidos',
    name: 'Castelo de Óbidos',
    subtitle: 'A Cidadela Medieval das Rainhas',
    rarity: 'Comum',
    category: 'historica',
    description: 'Vila muralhada intacta, presente tradicional dos Reis de Portugal às suas Rainhas.',
    assetPath: '/arenas/Muralhas de Prata.jpg',
    thumbnail: '/arenas/Muralhas de Prata.jpg',
    background: '/arenas/Muralhas de Prata.jpg',
    effects: 'particles',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Desbloqueada por defeito.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.3)',
      secondaryGlow: 'rgba(234, 179, 8, 0.25)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'none',
    },
    aliases: ['castelo-obidos', 'obidos'],
  },
  {
    id: 'arena_costa_atlantica',
    slug: 'costa-atlantica',
    name: 'Costa Atlântica',
    subtitle: 'A Onda Gigante da Nazaré',
    rarity: 'Comum',
    category: 'distrital',
    description: 'O canhão da Nazaré e a força brutal do Oceano Atlântico desafiando os maiores surfistas do planeta.',
    assetPath: '/arenas/Fúria da Nazaré.jpg',
    thumbnail: '/arenas/Fúria da Nazaré.jpg',
    background: '/arenas/Fúria da Nazaré.jpg',
    effects: 'water',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Desbloqueada por defeito.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(6, 182, 212, 0.45)',
      secondaryGlow: 'rgba(59, 130, 246, 0.35)',
      ambientColor: '#082f49',
      spotlightBeam: 'none',
    },
    aliases: ['costa-atlantica', 'nazare', 'ondas'],
  },
  {
    id: 'arena_lisboa_imperial',
    slug: 'lisboa-imperial',
    name: 'Lisboa Imperial',
    subtitle: 'Praça do Comércio & Terreiro do Paço',
    rarity: 'Rara',
    category: 'historica',
    description: 'A monumental entrada nobre de Lisboa voltada para o Tejo com o imponente Arco da Rua Augusta.',
    assetPath: '/arenas/Terreiro Dourado.jpg',
    thumbnail: '/arenas/Terreiro Dourado.jpg',
    background: '/arenas/Terreiro Dourado.jpg',
    effects: 'gold',
    unlockRule: 'purchase_coins',
    priceCoins: 7500,
    purchaseRule: 'Disponível na Loja por 7.500 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.4)',
      secondaryGlow: 'rgba(234, 179, 8, 0.3)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['lisboa-imperial', 'terreiro-paco', 'praca-comercio'],
  },
  {
    id: 'arena_vulcao_acores',
    slug: 'vulcao-acores',
    name: 'Vulcão das Furnas',
    subtitle: 'As Caldeiras Vivas de São Miguel',
    rarity: 'Épica',
    category: 'distrital',
    description: 'O calor geotérmico dos Açores com fumarolas ativas, caldeiras vulcânicas e natureza atlântica vibrante.',
    assetPath: '/arenas/Fornalha das Sete Cidades.jpg',
    thumbnail: '/arenas/Fornalha das Sete Cidades.jpg',
    background: '/arenas/Fornalha das Sete Cidades.jpg',
    effects: 'fire',
    unlockRule: 'purchase_coins',
    priceCoins: 12000,
    purchaseRule: 'Disponível na Loja por 12.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.5)',
      secondaryGlow: 'rgba(245, 158, 11, 0.4)',
      ambientColor: '#450a0a',
      spotlightBeam: 'none',
    },
    aliases: ['vulcao-acores', 'furnas', 'acores', 'sao-miguel'],
  },
  {
    id: 'arena_madeira_tropical',
    slug: 'madeira-tropical',
    name: 'Madeira Tropical',
    subtitle: 'O Jardim Flutuante do Atlântico',
    rarity: 'Rara',
    category: 'distrital',
    description: 'Montanhas verdejantes, falésias vertiginosas sobre o mar e a floresta Laurissilva património mundial.',
    assetPath: '/arenas/Floresta dos Açores.jpg',
    thumbnail: '/arenas/Floresta dos Açores.jpg',
    background: '/arenas/Floresta dos Açores.jpg',
    effects: 'leaves',
    unlockRule: 'purchase_coins',
    priceCoins: 8000,
    purchaseRule: 'Disponível na Loja por 8.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(16, 185, 129, 0.4)',
      secondaryGlow: 'rgba(234, 179, 8, 0.3)',
      ambientColor: '#022c22',
      spotlightBeam: 'none',
    },
    aliases: ['madeira-tropical', 'madeira', 'funchal'],
  },
  {
    id: 'arena_pico_estrelas',
    slug: 'pico-estrelas',
    name: 'Pico das Estrelas',
    subtitle: 'Torre da Serra da Estrela a 1993m',
    rarity: 'Épica',
    category: 'distrital',
    description: 'O ponto mais alto de Portugal continental com o céu mais limpo da Península Ibérica.',
    assetPath: '/arenas/Vértice Cósmico.jpg',
    thumbnail: '/arenas/Vértice Cósmico.jpg',
    background: '/arenas/Vértice Cósmico.jpg',
    effects: 'stars',
    unlockRule: 'purchase_coins',
    priceCoins: 14000,
    purchaseRule: 'Disponível na Loja por 14.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(99, 102, 241, 0.45)',
      secondaryGlow: 'rgba(168, 85, 247, 0.35)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'none',
    },
    aliases: ['pico-estrelas', 'serra-estrela', 'torre'],
  },
  {
    id: 'arena_portugal_medieval',
    slug: 'portugal-medieval',
    name: 'Portugal Medieval',
    subtitle: 'O Berço da Nação em Guimarães',
    rarity: 'Comum',
    category: 'historica',
    description: 'Aqui nasceu Portugal! A atmosfera heróica de D. Afonso Henriques e a fundação do reino.',
    assetPath: '/arenas/Cidadela de Guimarães.jpg',
    thumbnail: '/arenas/Cidadela de Guimarães.jpg',
    background: '/arenas/Cidadela de Guimarães.jpg',
    effects: 'particles',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Desbloqueada por defeito.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(234, 179, 8, 0.35)',
      secondaryGlow: 'rgba(168, 85, 247, 0.25)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['portugal-medieval', 'guimaraes', 'berco'],
  },
  {
    id: 'arena_era_descobrimentos',
    slug: 'era-descobrimentos',
    name: 'Era dos Descobrimentos',
    subtitle: 'Ao Leme das Naus Rumo ao Desconhecido',
    rarity: 'Rara',
    category: 'historica',
    description: 'Caravelas, cartas náuticas e a coragem dos navegadores que deram novos mundos ao mundo.',
    assetPath: '/arenas/Caravelas do Infante.jpg',
    thumbnail: '/arenas/Caravelas do Infante.jpg',
    background: '/arenas/Caravelas do Infante.jpg',
    effects: 'gold',
    unlockRule: 'purchase_coins',
    priceCoins: 7000,
    purchaseRule: 'Disponível na Loja por 7.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.4)',
      secondaryGlow: 'rgba(59, 130, 246, 0.3)',
      ambientColor: '#172554',
      spotlightBeam: 'none',
    },
    aliases: ['era-descobrimentos', 'descobrimentos', 'caravelas'],
  },
  {
    id: 'arena_batalha_medieval',
    slug: 'batalha-medieval',
    name: 'Campo de Aljubarrota',
    subtitle: 'A Batalha Decisiva de 1385',
    rarity: 'Épica',
    category: 'historica',
    description: 'D. Nuno Álvares Pereira e o quadrado tático que garantiu a independência eterna de Portugal.',
    assetPath: '/arenas/Campos de Aljubarrota.jpg',
    thumbnail: '/arenas/Campos de Aljubarrota.jpg',
    background: '/arenas/Campos de Aljubarrota.jpg',
    effects: 'fire',
    unlockRule: 'purchase_coins',
    priceCoins: 11000,
    purchaseRule: 'Disponível na Loja por 11.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.45)',
      secondaryGlow: 'rgba(245, 158, 11, 0.35)',
      ambientColor: '#450a0a',
      spotlightBeam: 'none',
    },
    aliases: ['batalha-medieval', 'aljubarrota', 'nuno-alvares'],
  },
  {
    id: 'arena_corte_portuguesa',
    slug: 'corte-portuguesa',
    name: 'Corte Portuguesa',
    subtitle: 'Salão Real Barroco Joanino',
    rarity: 'Lendária',
    category: 'historica',
    description: 'O luxo do ouro do Brasil na corte de D. João V com lustres de cristal e azulejos seculares.',
    assetPath: '/arenas/Galeria dos Espelhos.jpg',
    thumbnail: '/arenas/Galeria dos Espelhos.jpg',
    background: '/arenas/Galeria dos Espelhos.jpg',
    effects: 'gold',
    unlockRule: 'purchase_coins',
    priceCoins: 22000,
    purchaseRule: 'Disponível na Loja por 22.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.5)',
      secondaryGlow: 'rgba(254, 240, 138, 0.4)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['corte-portuguesa', 'corte-real', 'joanino'],
  },
  {
    id: 'arena_festival_portugues',
    slug: 'festival-santos',
    name: 'Festival dos Santos Populares',
    subtitle: 'Sardinha Assada, Manjericos e Festa',
    rarity: 'Comum',
    category: 'tematica',
    description: 'A alegria contagiante de Santo António em Alfama e São João no Porto com balões e música popular.',
    assetPath: '/arenas/Solarpunk Lisboa.jpg',
    thumbnail: '/arenas/Solarpunk Lisboa.jpg',
    background: '/arenas/Solarpunk Lisboa.jpg',
    effects: 'fireworks',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Desbloqueada por defeito.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(234, 179, 8, 0.4)',
      secondaryGlow: 'rgba(239, 68, 68, 0.35)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['festival-santos', 'santos-populares', 'santo-antonio', 'sao-joao'],
  },
  {
    id: 'arena_fado_alfama',
    slug: 'fado-alfama',
    name: 'Fado de Alfama',
    subtitle: 'A Alma e a Saudade na Noite Antiga',
    rarity: 'Rara',
    category: 'tematica',
    description: 'Ruelas de calçada antiga, candeeiros de ferro fundido e o eco inconfundível da guitarra portuguesa.',
    assetPath: '/arenas/Tasca da Saudade.jpg',
    thumbnail: '/arenas/Tasca da Saudade.jpg',
    background: '/arenas/Tasca da Saudade.jpg',
    effects: 'particles',
    unlockRule: 'purchase_coins',
    priceCoins: 6500,
    purchaseRule: 'Disponível na Loja por 6.500 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.35)',
      secondaryGlow: 'rgba(234, 179, 8, 0.3)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'none',
    },
    aliases: ['fado-alfama', 'alfama', 'fado'],
  },
  {
    id: 'arena_teatro_nacional',
    slug: 'teatro-nacional',
    name: 'Teatro Nacional D. Maria II',
    subtitle: 'O Palco Nobre das Artes no Rossio',
    rarity: 'Rara',
    category: 'tematica',
    description: 'Arquitetura neoclássica no centro do Rossio onde a literatura e a dramaturgia portuguesa ganham vida.',
    assetPath: '/arenas/Tribunal Barroco.jpg',
    thumbnail: '/arenas/Tribunal Barroco.jpg',
    background: '/arenas/Tribunal Barroco.jpg',
    effects: 'gold',
    unlockRule: 'purchase_coins',
    priceCoins: 7200,
    purchaseRule: 'Disponível na Loja por 7.200 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.4)',
      secondaryGlow: 'rgba(239, 68, 68, 0.3)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['teatro-nacional', 'd-maria', 'rossio'],
  },
  {
    id: 'arena_estadio_nacional',
    slug: 'estadio-jamor',
    name: 'Estádio Nacional do Jamor',
    subtitle: 'O Templo Mítico da Taça de Portugal',
    rarity: 'Rara',
    category: 'tematica',
    description: 'O estádio histórico rodeado pelo pinhal do Jamor onde se celebra a mística máxima do futebol português.',
    assetPath: '/arenas/Estádio do Fim dos Tempos.jfif',
    thumbnail: '/arenas/Estádio do Fim dos Tempos.jfif',
    background: '/arenas/Estádio do Fim dos Tempos.jfif',
    effects: 'particles',
    unlockRule: 'purchase_coins',
    priceCoins: 8500,
    purchaseRule: 'Disponível na Loja por 8.500 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(16, 185, 129, 0.4)',
      secondaryGlow: 'rgba(59, 130, 246, 0.3)',
      ambientColor: '#022c22',
      spotlightBeam: 'none',
    },
    aliases: ['estadio-jamor', 'jamor', 'taca-portugal'],
  },
  {
    id: 'arena_noite_jogo',
    slug: 'derbi-noite',
    name: 'Noite de Dérbi',
    subtitle: 'A Emoção dos Grandes Clássicos',
    rarity: 'Rara',
    category: 'tematica',
    description: 'A adrenalina pura dos confrontos entre os gigantes do futebol português sob as luzes da cidade.',
    assetPath: '/arenas/Coliseu das Chamas.jfif',
    thumbnail: '/arenas/Coliseu das Chamas.jfif',
    background: '/arenas/Coliseu das Chamas.jfif',
    effects: 'sparks',
    unlockRule: 'purchase_coins',
    priceCoins: 9000,
    purchaseRule: 'Disponível na Loja por 9.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(59, 130, 246, 0.45)',
      secondaryGlow: 'rgba(239, 68, 68, 0.4)',
      ambientColor: '#0f172a',
      spotlightBeam: 'none',
    },
    aliases: ['derbi-noite', 'derbi', 'classico'],
  },
  {
    id: 'arena_final_nacional',
    slug: 'final-campeoes',
    name: 'Grande Final Nacional',
    subtitle: 'O Pódio Supremo dos Campeões',
    rarity: 'Lendária',
    category: 'tematica',
    description: 'Chuva de confetis dourados, taça monumental e a apoteose da vitória máxima em competição.',
    assetPath: '/arenas/Glória Eterna.jpg',
    thumbnail: '/arenas/Glória Eterna.jpg',
    background: '/arenas/Glória Eterna.jpg',
    effects: 'fireworks',
    unlockRule: 'purchase_coins',
    priceCoins: 24000,
    purchaseRule: 'Disponível na Loja por 24.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.55)',
      secondaryGlow: 'rgba(16, 185, 129, 0.45)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['final-campeoes', 'final-nacional', 'campeoes'],
  },
  {
    id: 'arena_noite_selecao',
    slug: 'conquista-selecao',
    name: 'Conquista de Paris 2016',
    subtitle: 'O Minuto 109 de Éder e a Glória Eterna',
    rarity: 'Lendária',
    category: 'historica',
    description: 'O momento mais épico da história desportiva da nação: campeões da Europa com lágrimas de orgulho.',
    assetPath: '/arenas/Santuário das Quedas.jfif',
    thumbnail: '/arenas/Santuário das Quedas.jfif',
    background: '/arenas/Santuário das Quedas.jfif',
    effects: 'gold',
    unlockRule: 'purchase_coins',
    priceCoins: 28000,
    purchaseRule: 'Disponível na Loja por 28.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.5)',
      secondaryGlow: 'rgba(16, 185, 129, 0.5)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['conquista-selecao', 'euro-2016', 'eder', 'selecao'],
  },
  {
    id: 'arena_duelo_1v1_oficial',
    slug: 'duelo-1v1',
    name: 'Arena Multiplayer Oficial',
    subtitle: 'O Octógono Intelectual do Jogo em Direto',
    rarity: 'Épica',
    category: 'especial',
    description: 'Dois lados, duas mentes brilhantes, 10 perguntas e contagem decrescente em tempo real.',
    assetPath: '/arenas/Arena Cibernética.png',
    thumbnail: '/arenas/Arena Cibernética.png',
    background: '/arenas/Arena Cibernética.png',
    effects: 'sparks',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Arena oficial padrão do modo Multiplayer.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.5)',
      secondaryGlow: 'rgba(6, 182, 212, 0.45)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'none',
    },
    aliases: ['duelo-1v1', 'arena-1v1', 'duelo'],
  },
  {
    id: 'arena_ponte_2077',
    slug: 'ponte-2077',
    name: 'Ponte 25 de Abril 2077',
    subtitle: 'A Megaponte Cibernética sobre o Tejo',
    rarity: 'Épica',
    category: 'futurista',
    description: 'A silhueta vermelha da ponte reinterpretada com vias de levitação magnética e néon cibernético.',
    assetPath: '/arenas/portugal 2077.jpg',
    thumbnail: '/arenas/portugal 2077.jpg',
    background: '/arenas/portugal 2077.jpg',
    effects: 'cyber',
    unlockRule: 'purchase_coins',
    priceCoins: 15000,
    purchaseRule: 'Disponível na Loja por 15.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(6, 182, 212, 0.5)',
      secondaryGlow: 'rgba(239, 68, 68, 0.4)',
      ambientColor: '#082f49',
      spotlightBeam: 'none',
    },
    aliases: ['ponte-2077', 'cyber-ponte'],
  },
  {
    id: 'arena_lisboa_cybercore',
    slug: 'lisboa-cybercore',
    name: 'Lisboa Cybercore',
    subtitle: 'A Metrópole Quântica do Futuro',
    rarity: 'Lendária',
    category: 'futurista',
    description: 'Arranha-céus de azulejos holográficos, elétricos flutuantes e circuitos de luz integrados na calçada.',
    assetPath: '/arenas/Alfama 2077.jpg',
    thumbnail: '/arenas/Alfama 2077.jpg',
    background: '/arenas/Alfama 2077.jpg',
    effects: 'matrix',
    unlockRule: 'purchase_coins',
    priceCoins: 21000,
    purchaseRule: 'Disponível na Loja por 21.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(16, 185, 129, 0.55)',
      secondaryGlow: 'rgba(6, 182, 212, 0.45)',
      ambientColor: '#022c22',
      spotlightBeam: 'none',
    },
    aliases: ['lisboa-cybercore', 'cybercore', 'cyber-lisboa'],
  },
  {
    id: 'arena_estacao_orbital',
    slug: 'estacao-orbital',
    name: 'Estação Orbital Lusitânia',
    subtitle: 'O Satélite de Comunicações em Órbita Terrestre',
    rarity: 'Lendária',
    category: 'futurista',
    description: 'Estação espacial com vista panorâmica para a Península Ibérica iluminada à noite.',
    assetPath: '/arenas/Vigília de Camões.jpg',
    thumbnail: '/arenas/Vigília de Camões.jpg',
    background: '/arenas/Vigília de Camões.jpg',
    effects: 'stars',
    unlockRule: 'purchase_coins',
    priceCoins: 23000,
    purchaseRule: 'Disponível na Loja por 23.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(59, 130, 246, 0.5)',
      secondaryGlow: 'rgba(168, 85, 247, 0.4)',
      ambientColor: '#09090b',
      spotlightBeam: 'none',
    },
    aliases: ['estacao-orbital', 'orbital', 'satelite-lusitania'],
  },
  {
    id: 'arena_portal_galactico',
    slug: 'portal-galactico',
    name: 'Portal Galáctico',
    subtitle: 'O Vórtice Dimensional dos Navegadores',
    rarity: 'Mítica',
    category: 'futurista',
    description: 'Um anel dimensional quântico conectando Portugal aos confins mais remotos do cosmos.',
    assetPath: '/arenas/Fenda do Tempo.jpg',
    thumbnail: '/arenas/Fenda do Tempo.jpg',
    background: '/arenas/Fenda do Tempo.jpg',
    effects: 'portal',
    unlockRule: 'purchase_coins',
    priceCoins: 32000,
    purchaseRule: 'Disponível na Loja por 32.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.6)',
      secondaryGlow: 'rgba(6, 182, 212, 0.5)',
      ambientColor: '#09090b',
      spotlightBeam: 'none',
    },
    aliases: ['portal-galactico', 'portal', 'vortice'],
  },
  {
    id: 'arena_portugal_ao_contrario',
    slug: 'portugal-invertido',
    name: 'Portugal ao Contrário',
    subtitle: 'A Dimensão Bizarra do Modo Maluco',
    rarity: 'Comum',
    category: 'especial',
    description: 'Gravidade invertida, o Algarve no topo, Gerês no sul e pastéis de Belém a flutuar no ar.',
    assetPath: '/arenas/Dimensão Flutuante.jpg',
    thumbnail: '/arenas/Dimensão Flutuante.jpg',
    background: '/arenas/Dimensão Flutuante.jpg',
    effects: 'sparks',
    unlockRule: 'unlocked_by_default',
    purchaseRule: 'Arena oficial padrão do Modo Maluco.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(239, 68, 68, 0.45)',
      secondaryGlow: 'rgba(234, 179, 8, 0.4)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['portugal-invertido', 'modo-maluco', 'invertido'],
  },
  {
    id: 'arena_caos_patos',
    slug: 'patos-aveiro',
    name: 'Invasão de Patos em Aveiro',
    subtitle: 'Os Moliceiros Tomados por Patos Amarelos',
    rarity: 'Rara',
    category: 'especial',
    description: 'Milhares de patos de borracha gigantes navegaram pela Ria de Aveiro numa tarde surrealista.',
    assetPath: '/arenas/Canal dos Moliceiros.jpg',
    thumbnail: '/arenas/Canal dos Moliceiros.jpg',
    background: '/arenas/Canal dos Moliceiros.jpg',
    effects: 'particles',
    unlockRule: 'purchase_coins',
    priceCoins: 6000,
    purchaseRule: 'Disponível na Loja por 6.000 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(234, 179, 8, 0.45)',
      secondaryGlow: 'rgba(6, 182, 212, 0.35)',
      ambientColor: '#082f49',
      spotlightBeam: 'none',
    },
    aliases: ['patos-aveiro', 'aveiro', 'patos'],
  },
  {
    id: 'arena_dentro_cerebro',
    slug: 'dentro-cerebro',
    name: 'Dentro do Cérebro',
    subtitle: 'A Tempestade Sináptica do Intelecto',
    rarity: 'Rara',
    category: 'especial',
    description: 'Sinapses elétricas disparando em tempo real através dos neurónios do saber nacional.',
    assetPath: '/arenas/Nexus Neural.jpg',
    thumbnail: '/arenas/Nexus Neural.jpg',
    background: '/arenas/Nexus Neural.jpg',
    effects: 'matrix',
    unlockRule: 'purchase_coins',
    priceCoins: 7500,
    purchaseRule: 'Disponível na Loja por 7.500 moedas.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.5)',
      secondaryGlow: 'rgba(236, 72, 153, 0.4)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'none',
    },
    aliases: ['dentro-cerebro', 'cerebro', 'sinapses'],
  },
  {
    id: 'arena_excl_campeao',
    slug: 'trono-campeao',
    name: 'Trono do Campeão da Semana',
    subtitle: 'Reservado ao Líder do Ranking Nacional',
    rarity: 'Mítica',
    category: 'especial',
    description: 'O trono físico reservado no salão de honra para o jogador que fechar o domingo em 1º lugar.',
    assetPath: '/arenas/Sala do Trono.jpg',
    thumbnail: '/arenas/Sala do Trono.jpg',
    background: '/arenas/Sala do Trono.jpg',
    effects: 'gold',
    unlockRule: 'merit',
    purchaseRule: 'Desbloqueado por mérito ao alcançar o Top 1 Nacional.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(245, 158, 11, 0.6)',
      secondaryGlow: 'rgba(234, 179, 8, 0.5)',
      ambientColor: '#1c1917',
      spotlightBeam: 'none',
    },
    aliases: ['trono-campeao', 'campeao-semana', 'top-1'],
  },
  {
    id: 'arena_excl_fundadores',
    slug: 'monumento-fundadores',
    name: 'Monumento aos Fundadores',
    subtitle: 'A Homenagem aos Primeiros Cidadãos',
    rarity: 'Mítica',
    category: 'especial',
    description: 'Edifício comemorativo com os nomes dos jogadores pioneiros da versão Alfa de Acorda Portugal.',
    assetPath: '/arenas/Hemiciclo dos Fundadores.jpg',
    thumbnail: '/arenas/Hemiciclo dos Fundadores.jpg',
    background: '/arenas/Hemiciclo dos Fundadores.jpg',
    effects: 'gold',
    unlockRule: 'merit',
    purchaseRule: 'Concedido a pioneiros e fundadores da plataforma.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(59, 130, 246, 0.5)',
      secondaryGlow: 'rgba(245, 158, 11, 0.45)',
      ambientColor: '#0f172a',
      spotlightBeam: 'none',
    },
    aliases: ['monumento-fundadores', 'fundadores', 'pioneiros'],
  },
  {
    id: 'arena_excl_lenda_100',
    slug: 'coliseu-100',
    name: 'Coliseu dos Nível 100',
    subtitle: 'O Santuário dos Mestres Absolutos',
    rarity: 'Mítica',
    category: 'especial',
    description: 'Apenas jogadores que atingiram o Nível 100 com mais de 1.000.000 XP podem entrar neste recinto.',
    assetPath: '/arenas/Vigia da Tormenta.jfif',
    thumbnail: '/arenas/Vigia da Tormenta.jfif',
    background: '/arenas/Vigia da Tormenta.jfif',
    effects: 'fireworks',
    unlockRule: 'merit',
    purchaseRule: 'Desbloqueio automático ao atingir o Nível 100.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(168, 85, 247, 0.6)',
      secondaryGlow: 'rgba(245, 158, 11, 0.5)',
      ambientColor: '#1e1b4b',
      spotlightBeam: 'none',
    },
    aliases: ['coliseu-100', 'nivel-100', 'lenda-100'],
  },
  {
    id: 'arena_cidade_norte',
    slug: 'cidade-norte',
    name: 'Coração de Pedra do Norte',
    subtitle: 'Arquitetura de Granito e Alma Nobre',
    rarity: 'Comum',
    category: 'distrital',
    description: 'Arquitetura clássica de granito cinzento e praças históricas das cidades do Norte de Portugal.',
    assetPath: '/arenas/O Coração da Nação.jfif',
    thumbnail: '/arenas/O Coração da Nação.jfif',
    background: '/arenas/O Coração da Nação.jfif',
    effects: 'particles',
    unlockRule: 'purchase_coins',
    priceCoins: 2000,
    purchaseRule: 'Adquira com Moedas Acorda Portugal.',
    gameplayAvailability: true,
    visualType: 'jpg_raster',
    lightingProfile: {
      primaryGlow: 'rgba(100, 116, 139, 0.4)',
      secondaryGlow: 'rgba(245, 158, 11, 0.2)',
      ambientColor: '#0f172a',
      spotlightBeam: 'none',
    },
    aliases: ['cidade-norte', 'norte-pedra', 'granito-norte'],
  },
]

// ============================================================================
// CATÁLOGO COMPLETO DAS 43 ARENAS (SSOT)
// ============================================================================

export const MASTER_ARENA_CATALOG: CanonicalArena[] = [
  ...VIP_ARENAS,
  ...STANDARD_ARENAS,
]

// Mapa de pesquisa rápida O(1)
const ARENA_BY_KEY = new Map<string, CanonicalArena>()

for (const arena of MASTER_ARENA_CATALOG) {
  ARENA_BY_KEY.set(arena.id.toLowerCase(), arena)
  ARENA_BY_KEY.set(arena.slug.toLowerCase(), arena)
  for (const alias of arena.aliases) {
    ARENA_BY_KEY.set(alias.toLowerCase(), arena)
  }
}

// ============================================================================
// RESOLVEDOR CANÓNICO OFICIAL
// ============================================================================

/**
 * Resolve uma arena por ID, slug ou alias.
 * RETORNA NULL se não encontrada.
 * NUNCA recorre silenciosamente a Palácio Nacional.
 */
export function resolveArena(query: string | null | undefined): CanonicalArena | null {
  if (!query) return null
  const cleaned = String(query).toLowerCase().trim()
  if (!cleaned) return null

  const match = ARENA_BY_KEY.get(cleaned)
  return match || null
}

/**
 * Retorna a arena temática padrão canónica para uma categoria ou modo.
 * Cada categoria tem uma arena específica e distinta.
 */
export function getDefaultArenaForCategory(categorySlug?: string | null): CanonicalArena {
  const norm = String(categorySlug || '').toLowerCase().trim()

  switch (norm) {
    case 'desafio-nacional':
    case 'nacional':
    case 'quick':
    case 'todos':
    case 'jogar-tudo':
      return resolveArena('arena_estadio_das_lendas') || MASTER_ARENA_CATALOG[1]

    case 'o-meu-distrito':
    case 'distrito':
      return resolveArena('arena_castelo_dos_campeoes') || MASTER_ARENA_CATALOG[4]

    case 'desafio-cidade':
    case 'cidade':
      return resolveArena('arena_praca_liberdade') || MASTER_ARENA_CATALOG[11]

    case 'modo-maluco':
    case 'perguntas-idiotas':
    case 'maluco':
      return resolveArena('arena_portugal_ao_contrario') || MASTER_ARENA_CATALOG[35]

    case 'historia':
    case 'historia-portugal':
    case 'dinastias':
    case 'patrimonio':
      return resolveArena('arena_palacio_nacional') || MASTER_ARENA_CATALOG[0]

    case 'geografia':
    case 'geografia-portugal':
    case 'territorio':
      return resolveArena('arena_portugal_3d') || MASTER_ARENA_CATALOG[2]

    case 'cultura':
    case 'cultura-portuguesa':
    case 'literatura':
    case 'cinema':
    case 'cinema-tv':
    case 'artes':
      return resolveArena('arena_teatro_nacional') || MASTER_ARENA_CATALOG[25]

    case 'desporto':
    case 'futebol':
    case 'futebol-portugues':
    case 'campeoes':
      return resolveArena('arena_estadio_nacional') || MASTER_ARENA_CATALOG[26]

    case 'entretenimento':
    case 'musica':
    case 'humor':
    case 'comedia':
    case 'espetaculo':
      return resolveArena('arena_fado_alfama') || resolveArena('arena_teatro_nacional') || MASTER_ARENA_CATALOG[25]

    case 'gastronomia':
    case 'vinhos':
    case 'tradicoes':
      return resolveArena('arena_festival_portugues') || MASTER_ARENA_CATALOG[23]

    case 'ciencia':
    case 'tecnologia':
    case 'ciencia-tecnologia':
    case 'inovacao':
      return resolveArena('arena_lisboa_cybercore') || MASTER_ARENA_CATALOG[32]

    case 'atualidade':
    case 'portugal-politico':
    case 'politica':
    case 'governo':
    case 'empresas-portuguesas':
    case 'economia':
      return resolveArena('arena_lisboa_imperial') || resolveArena('arena_palacio_nacional') || MASTER_ARENA_CATALOG[0]

    case 'desafio-visual':
    case 'monumentos':
      return resolveArena('arena_torre_belem') || MASTER_ARENA_CATALOG[12]

    case 'duelo':
    case '1v1':
      return resolveArena('arena_duelo_1v1_oficial') || MASTER_ARENA_CATALOG[30]

    default:
      // Arena padrão do jogo: Praça da Liberdade (NÃO Palácio Nacional)
      return resolveArena('arena_praca_liberdade') || MASTER_ARENA_CATALOG[11]
  }
}

export interface ResolveGameArenaResult {
  arena: CanonicalArena
  isExplicit: boolean
  isFallback: boolean
  warning?: string
  error?: string
}

/**
 * Pipeline determinístico de resolução de Arena para uma partida:
 * 1. Se foi passado arenaId explicitamente na URL (?arena=...), tenta resolver.
 *    Se falhar, emite aviso controlado e recorre à arena temática da categoria (NUNCA devolve null).
 * 2. Se não foi passado arenaId, verifica se o jogador tem arena equipada no perfil/localStorage.
 * 3. Se não houver arena equipada, usa a arena temática padrão DA CATEGORIA.
 * REGRA ABSOLUTA: arena NUNCA é null nem undefined.
 */
export function resolveArenaForGame(params: {
  arenaId?: string | null
  categorySlug?: string | null
  equippedArenaId?: string | null
}): ResolveGameArenaResult {
  const { arenaId, categorySlug, equippedArenaId } = params

  // 1. Parâmetro explícito na URL tem prioridade
  if (arenaId && arenaId.trim() !== '') {
    const explicit = resolveArena(arenaId)
    if (explicit) {
      return {
        arena: explicit,
        isExplicit: true,
        isFallback: false,
      }
    }
    // Arena explícita não encontrada: fallback gracioso sem bloquear a partida
    console.warn(`[resolveArenaForGame] Arena explícita "${arenaId}" não encontrada no catálogo. A ativar arena temática segura.`)
    const categoryDefault = getDefaultArenaForCategory(categorySlug)
    return {
      arena: categoryDefault,
      isExplicit: false,
      isFallback: true,
      warning: `Arena solicitada "${arenaId}" não encontrada. Foi atribuída a arena "${categoryDefault.name}".`,
    }
  }

  // 2. Arena equipada do utilizador (se existir e for válida)
  if (equippedArenaId && equippedArenaId.trim() !== '') {
    const equipped = resolveArena(equippedArenaId)
    if (equipped) {
      return {
        arena: equipped,
        isExplicit: false,
        isFallback: false,
      }
    }
  }

  // 3. Resolução determinística por categoria / modo de jogo
  const categoryDefault = getDefaultArenaForCategory(categorySlug)
  return {
    arena: categoryDefault,
    isExplicit: false,
    isFallback: true,
  }
}

export function getAllArenas(): CanonicalArena[] {
  return [...MASTER_ARENA_CATALOG]
}

export function getVipArenas(): CanonicalArena[] {
  return [...VIP_ARENAS]
}

export function isVipArena(arenaId: string): boolean {
  const resolved = resolveArena(arenaId)
  if (!resolved) return false
  return resolved.category === 'vip_supreme' || resolved.category === 'vip_ultimate'
}

export default MASTER_ARENA_CATALOG

