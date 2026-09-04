/**
 * 🇵🇹 ACORDA PORTUGAL — VIP COLLECTION 3.0 (SSOT)
 *
 * Master Catalog — 38 Premium Exclusives
 * Single Source of Truth para todos os itens VIP compráveis com dinheiro real (€).
 *
 * Regras Globais:
 * - Preços canónicos em cêntimos de Euro (priceCents) e moeda EUR.
 * - Preço máximo absoluto: €39,99. Nunca usar €44,99 ou €49,99.
 * - Zero Pay-to-Win: apenas cosméticos, títulos, prestígio e apresentações de status.
 * - payToWin: false em TODOS os produtos, sem exceção.
 * - IDs técnicos nunca expostos ao jogador — usar rarityBadge / prestigeTier.
 * - Suporte a desempacotamento de bundles e tracking de edições limitadas.
 *
 * Distribuição de raridade:
 *   Mythic    (6)  — €29,99–€39,99
 *   Legendary (14) — €12,99–€29,99
 *   Epic      (12) — €7,99–€16,99
 *   Rare      (6)  — €5,99–€9,99
 *   Total     (38)
 */

export type VipCategory =
  | 'avatar'
  | 'arena'
  | 'frame'
  | 'title'
  | 'emote'
  | 'tauntpack'
  | 'bundle'
  | 'ultimate'

export type StoreSection =
  | 'signature'
  | 'arenas'
  | 'identities'
  | 'reactions'
  | 'taunts'
  | 'bundles'
  | 'ultimate'

export type VipRarity = 'Rare' | 'Epic' | 'Legendary' | 'Mythic'

export interface VipProviderMapping {
  stripeProductId?: string
  stripePriceId?: string
}

export interface VipTauntItem {
  id: string
  text: string
  icon?: string
}

export interface VipProduct {
  // ─── Identificação interna (NUNCA expor ao utilizador) ───────────────────
  id: string
  sku: string

  // ─── Apresentação ao utilizador ──────────────────────────────────────────
  name: string
  description: string
  visualConcept: string

  // ─── Categorização ───────────────────────────────────────────────────────
  tier: number
  tierName: string
  storeSection: StoreSection
  category: VipCategory
  rarity: VipRarity

  // ─── Badges de status (visíveis ao utilizador) ───────────────────────────
  rarityBadge: string        // ex: "COLECIONADOR MÍTICO" — nunca mostrar o ID
  prestigeTier: string       // ex: "MÍTICO", "LENDÁRIO", "ÉPICO", "RARO VIP"
  profileBannerTag: string   // ex: "ED. LIMITADA", "SÉRIE FUNDADOR", "COLEÇÃO EXCLUSIVA"
  profileBadge?: string      // badge específico para o perfil (opcional)

  // ─── Preço ───────────────────────────────────────────────────────────────
  priceEUR: number
  priceCents: number
  currency: 'EUR'

  // ─── Efeitos visuais ─────────────────────────────────────────────────────
  animation: string
  effect: string
  visualEffectsList: string[]
  lobbyAnimation?: string
  duelIntroSound?: string

  // ─── Bundle / Conteúdo ───────────────────────────────────────────────────
  bundleDescription?: string
  bundleComponents?: string[]

  // ─── Assets ──────────────────────────────────────────────────────────────
  assetPath: string
  thumbnailPath: string
  previewPath: string

  // ─── Edição limitada ─────────────────────────────────────────────────────
  isLimited?: boolean
  limitedUnits?: number     // total de unidades disponíveis
  stock?: number            // stock restante (controlado pelo server)
  isSoldOut?: boolean
  serialised?: boolean      // se true, cada unidade tem número único #001/100
  collectionNumber?: number // número desta unidade (atribuído após compra)

  // ─── Regras de compra ────────────────────────────────────────────────────
  purchaseRules: string

  // ─── Zero Pay-to-Win (obrigatório: sempre false) ─────────────────────────
  payToWin: false

  // ─── Integração de pagamento ─────────────────────────────────────────────
  providerMapping: VipProviderMapping

  // ─── Taunt Packs ─────────────────────────────────────────────────────────
  taunts?: VipTauntItem[]

  // ─── Metadados visuais de UI ─────────────────────────────────────────────
  badgeColor?: string
  accentColor?: string
  secondaryColor?: string
  rarityLabel?: string
}

export const VIP_CATALOG: VipProduct[] = [
  // =========================================================================
  // 🏅 TIER I — SIGNATURE AVATARS (4 itens · storeSection: 'signature')
  // Preços: €19,99–€29,99 | Raridades: Legendary
  // =========================================================================
  {
    id: 'AP-VIP-SIGNATURE-001',
    sku: 'AP-VIP-SIGNATURE-001',
    name: 'Imperador Lusitano',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Mythic',
    rarityBadge: 'COLECIONADOR MÍTICO',
    prestigeTier: 'MÍTICO',
    profileBannerTag: 'ED. LIMITADA',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    isLimited: true,
    limitedUnits: 100,
    stock: 100,
    serialised: true,
    description: 'A identidade suprema: a linhagem dos reis que ergueram a pátria independente em 1143.',
    visualConcept: 'Monarca imperial envolto em manto carmesim com quinas bordadas a ouro, coroa das cortes e aura luminescente.',
    animation: 'Manto ondulante, aura dourada de entrada e partículas cintilantes.',
    effect: 'Aura imperial e brasão das quinas iluminam o duelo.',
    visualEffectsList: [
      'Aura dourada de entrada',
      'Partículas das quinas portuguesas',
      'Brilho pulsante no escudo',
      'Manto animado em movimento',
    ],
    lobbyAnimation: 'Manto ondulante com halo dourado subtil',
    duelIntroSound: 'fanfarra-real',
    profileBadge: 'IMPERADOR',
    bundleDescription: 'Avatar exclusivo + animação de entrada + pose de vitória + badge de perfil.',
    assetPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    thumbnailPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    previewPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo. Não comprável com moedas virtuais.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_001',
      stripePriceId: 'price_vip_sig_001',
    },
  },
  {
    id: 'AP-VIP-SIGNATURE-002',
    sku: 'AP-VIP-SIGNATURE-002',
    name: 'Dragão de Portugal',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    description: 'O espírito indomável do dragão heráldico português com armadura de ferro e escamas reluzentes.',
    visualConcept: 'Guerreiro lusitano com armadura de ferro e motivos draconianos, escamas reluzentes e olhos de fogo ancestral.',
    animation: 'Fumo subtil a emergir dos ombros e movimento das escamas na entrada do duelo.',
    effect: 'Chamas draconianas surgem no chão ao entrar em duelo, evaporando lentamente.',
    visualEffectsList: [
      'Chamas draconianas de entrada',
      'Fumo subtil nos ombros',
      'Escamas animadas em movimento',
      'Olhos incandescentes no perfil',
    ],
    lobbyAnimation: 'Fumo discreto com brilho de brasa',
    profileBadge: 'DRAGÃO',
    bundleDescription: 'Avatar exclusivo + animação de entrada + animação de vitória + badge.',
    assetPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    thumbnailPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    previewPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    accentColor: '#10b981',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_002',
      stripePriceId: 'price_vip_sig_002',
    },
  },
  {
    id: 'AP-VIP-SIGNATURE-003',
    sku: 'AP-VIP-SIGNATURE-003',
    name: 'Navegador Eterno',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    description: 'O explorador dos mares que levou Portugal ao limite do mundo conhecido.',
    visualConcept: 'Capitão explorador da era dos Descobrimentos com vestes cerimoniais e astrolábio cintilante.',
    animation: 'O astrolábio roda lentamente; o manto move-se ao ritmo do vento atlântico.',
    effect: 'Efeito de bússola oceânica surge em torno do avatar na apresentação do duelo.',
    visualEffectsList: [
      'Bússola animada em rotação',
      'Manto atlântico flutuante',
      'Astrolábio cintilante',
      'Estrelas de navegação subtis',
    ],
    lobbyAnimation: 'Astrolábio em rotação subtil com brilho de estrela',
    profileBadge: 'NAVEGADOR',
    bundleDescription: 'Avatar exclusivo + entrada animada + badge.',
    assetPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    thumbnailPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    previewPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-sky-400/80 bg-sky-950/60 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    accentColor: '#38bdf8',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_003',
      stripePriceId: 'price_vip_sig_003',
    },
  },
  {
    id: 'AP-VIP-SIGNATURE-004',
    sku: 'AP-VIP-SIGNATURE-004',
    name: 'Guardião da Nação',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    description: 'O protetor da nação, armado com o escudo das cinco quinas e o juramento de defender Portugal.',
    visualConcept: 'Paladino de elite com armadura monumental, escudo com as quinas de Portugal em relevo.',
    animation: 'O escudo ergue-se subtilmente em repouso; a armadura reflete luz dinâmica.',
    effect: 'Anel de energia defensiva manifesta-se durante a apresentação do duelo.',
    visualEffectsList: [
      'Anel de energia defensiva',
      'Escudo animado com quinas',
      'Reflexos de luz na armadura',
    ],
    lobbyAnimation: 'Escudo com pulso de energia subtil',
    profileBadge: 'GUARDIÃO',
    bundleDescription: 'Avatar exclusivo + animação de entrada + badge.',
    assetPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    thumbnailPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    previewPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.5)]',
    accentColor: '#c084fc',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_004',
      stripePriceId: 'price_vip_sig_004',
    },
  },

  // =========================================================================
  // 🏟️ TIER II — ARENAS HISTÓRICAS (5 itens · storeSection: 'arenas')
  // Preços: €12,99–€39,99 | Raridades: Mythic → Epic
  // =========================================================================
  {
    id: 'AP-VIP-ARENA-ULTIMATE-001',
    sku: 'AP-VIP-ARENA-ULTIMATE-001',
    name: 'Trono Supremo do Campeão',
    tier: 2,
    tierName: 'Arenas Históricas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Mythic',
    rarityBadge: 'COLECIONADOR MÍTICO',
    prestigeTier: 'MÍTICO',
    profileBannerTag: 'ED. LIMITADA',
    priceEUR: 39.99,
    priceCents: 3999,
    currency: 'EUR',
    isLimited: true,
    limitedUnits: 50,
    stock: 50,
    serialised: true,
    description: 'A arena suprema do Acorda Portugal: o trono onde o campeão nacional reina sobre o universo 2150.',
    visualConcept: 'Trono colossal de ouro e platina, pilares de fogo e auréola volumétrica de campeão nacional.',
    animation: 'Estandartes reais esvoaçando, partículas atmosféricas douradas e entrada cinematográfica.',
    effect: 'O lado vencedor recebe um holofote dourado real no encerramento do duelo.',
    visualEffectsList: [
      'Holofote dourado de vitória',
      'Estandartes animados esvoaçando',
      'Partículas douradas atmosféricas',
      'Fanfarra real na entrada',
      'Iluminação dinâmica do trono',
    ],
    lobbyAnimation: 'Partículas douradas com halo real',
    duelIntroSound: 'trompete-real-primeiro-reino',
    profileBadge: 'TRONO SUPREMO',
    bundleDescription: 'Arena exclusiva + sequência cinematográfica + efeito de vitória + badge numerado.',
    assetPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    thumbnailPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    previewPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    purchaseRules: 'Edição limitada a 50 unidades numeradas. Número de coleção atribuído pelo servidor após a transação. O adversário vê a arena sem precisar de a possuir.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.7)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_001',
      stripePriceId: 'price_vip_arn_001',
    },
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-002',
    sku: 'AP-VIP-ARENA-ULTIMATE-002',
    name: 'Portugal Celestial',
    tier: 2,
    tierName: 'Arenas Históricas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    description: 'Portugal 3D em escala monumental flutuando no espaço sideral com nebulosas cósmicas.',
    visualConcept: 'O território nacional transcende a Terra e brilha no cosmos cercado de constelações.',
    animation: 'Nebulosa em espiral, chuva de meteoros dourados e órbita estelar.',
    effect: 'Explosão de supernova cósmica com partículas estelares.',
    visualEffectsList: [
      'Explosão de luz estelar na vitória',
      'Nebulosa cósmica animada',
      'Relevo 3D de Portugal flutuante',
      'Satélites orbitais em transmissão',
    ],
    bundleDescription: 'Arena + entrada estelar + efeito cósmico.',
    assetPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    thumbnailPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    previewPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-blue-400/80 bg-blue-950/60 text-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)]',
    accentColor: '#60a5fa',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_002',
      stripePriceId: 'price_vip_arn_002',
    },
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-003',
    sku: 'AP-VIP-ARENA-ULTIMATE-003',
    name: 'Coliseu dos Campeões',
    tier: 2,
    tierName: 'Arenas Históricas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 19.99,
    priceCents: 1999,
    currency: 'EUR',
    description: 'Coliseu circular futurista com bancadas em camadas, feixes de luz vertical e estandartes dos 20 distritos.',
    visualConcept: 'Arena de gladiadores intelectuais com chão de vidro temperado e iluminação inferior dramática.',
    animation: 'Feixes de luz vertical, pirotecnia de combate e canhões de chama.',
    effect: 'Vitória ativa pirotecnia de campeão e ovação monumental.',
    visualEffectsList: [
      'Canhões de chama a cada acerto',
      'Bancadas monumentais iluminadas',
      '20 Estandartes distritais flutuantes',
      'Pirotecnia de vitória',
    ],
    bundleDescription: 'Arena + efeito de vitória épico.',
    assetPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    thumbnailPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    previewPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_003',
      stripePriceId: 'price_vip_arn_003',
    },
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-004',
    sku: 'AP-VIP-ARENA-ULTIMATE-004',
    name: 'Palácio dos Reis',
    tier: 2,
    tierName: 'Arenas Históricas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 16.99,
    priceCents: 1699,
    currency: 'EUR',
    description: 'Salão nobre com arcadas manuelinas de filigrana entrelaçada e vitrais cibernéticos luminosos.',
    visualConcept: 'A arte de Quinhentos renascida na era digital mais avançada com candelabros de cristal flutuantes.',
    animation: 'Vitrais de plasma multicolorido com pulsos luminescentes.',
    effect: 'Iluminação de vitrais manuelinos projeta cores históricas na partida.',
    visualEffectsList: [
      'Vitrais com pulsos de luz',
      'Arcadas manuelinas iluminadas',
      'Candelabros flutuantes',
    ],
    bundleDescription: 'Arena + animação de vitrais manuelinos.',
    assetPath: '/arenas/vip/ultimate/palacio-reis.webp',
    thumbnailPath: '/arenas/vip/ultimate/palacio-reis.webp',
    previewPath: '/arenas/vip/ultimate/palacio-reis.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-fuchsia-400/80 bg-fuchsia-950/60 text-fuchsia-300 shadow-[0_0_15px_rgba(232,121,249,0.5)]',
    accentColor: '#e879f9',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_004',
      stripePriceId: 'price_vip_arn_004',
    },
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-005',
    sku: 'AP-VIP-ARENA-ULTIMATE-005',
    name: 'Cidadela Eterna',
    tier: 2,
    tierName: 'Arenas Históricas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 12.99,
    priceCents: 1299,
    currency: 'EUR',
    description: 'Cidadela fortificada no pico da Serra da Estrela, rodeada por névoa gelada e muralhas eternas.',
    visualConcept: 'No topo das serras mais altas, a fortaleza inexpugnável que nunca conheceu a derrota.',
    animation: 'Tochas azuis nas muralhas e vento suave de montanha.',
    effect: 'Névoa alpina dissipa-se ao iniciar o combate.',
    visualEffectsList: [
      'Névoa alpina animada',
      'Tochas azuis nas muralhas',
      'Céu alpino estrelado',
    ],
    bundleDescription: 'Arena + efeito de fortaleza de montanha.',
    assetPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    thumbnailPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    previewPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]',
    accentColor: '#34d399',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_005',
      stripePriceId: 'price_vip_arn_005',
    },
  },

  // =========================================================================
  // ✨ TIER III — MOLDURAS REAIS / FRAMES (5 itens · storeSection: 'identities')
  // Preços: €9,99–€29,99 | Raridades: Mythic → Epic
  // =========================================================================
  {
    id: 'AP-VIP-FRAME-001',
    sku: 'AP-VIP-FRAME-001',
    name: 'Coroa do Império',
    tier: 3,
    tierName: 'Molduras Reais',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Mythic',
    rarityBadge: 'COLECIONADOR MÍTICO',
    prestigeTier: 'MÍTICO',
    profileBannerTag: 'ED. LIMITADA',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    isLimited: true,
    limitedUnits: 200,
    stock: 200,
    serialised: true,
    description: 'A coroa monumental do império forjada a ouro puro com rubis e esmeraldas.',
    visualConcept: 'Coroa real em ouro maciço com pedras preciosas e brilho imperial.',
    animation: 'A coroa orbita com partículas solares douradas.',
    effect: 'Pulsar dourado da coroa ilumina o avatar.',
    visualEffectsList: [
      'Partículas solares douradas',
      'Brilho no centro da coroa',
      'Halo tridimensional',
    ],
    bundleDescription: 'Moldura animada + brilho de perfil + badge.',
    assetPath: '/images/frames/vip/coroa-imperio.webp',
    thumbnailPath: '/images/frames/vip/coroa-imperio.webp',
    previewPath: '/images/frames/vip/coroa-imperio.webp',
    purchaseRules: 'Edição limitada a 200 unidades numeradas. Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_001',
      stripePriceId: 'price_vip_frm_001',
    },
  },
  {
    id: 'AP-VIP-FRAME-002',
    sku: 'AP-VIP-FRAME-002',
    name: 'Diamante Lusitano',
    tier: 3,
    tierName: 'Molduras Reais',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 19.99,
    priceCents: 1999,
    currency: 'EUR',
    description: 'Moldura geométrica lapidada em diamante puro com reflexos prismáticos de luz.',
    visualConcept: 'Faceta de diamante puro com reflexos das quinas e luz brilhante.',
    animation: 'Reflexos de luz prismática percorrem a moldura.',
    effect: 'Brilho de cristal a cada vitória.',
    visualEffectsList: [
      'Reflexos de luz prismática',
      'Brilho cristalino pulsante',
    ],
    bundleDescription: 'Moldura + efeito prismático.',
    assetPath: '/images/frames/vip/diamante-lusitano.webp',
    thumbnailPath: '/images/frames/vip/diamante-lusitano.webp',
    previewPath: '/images/frames/vip/diamante-lusitano.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    accentColor: '#fbbf24',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_002',
      stripePriceId: 'price_vip_frm_002',
    },
  },
  {
    id: 'AP-VIP-FRAME-003',
    sku: 'AP-VIP-FRAME-003',
    name: 'Fogo do Campeão',
    tier: 3,
    tierName: 'Molduras Reais',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 16.99,
    priceCents: 1699,
    currency: 'EUR',
    description: 'Chamas vivas de glória que ardem sem cessar ao redor da fotografia do campeão.',
    visualConcept: 'Labaredas ardentes e brasas em ascensão.',
    animation: 'Chamas dinâmicas a arder com brasas ascendentes.',
    effect: 'Labaredas de vitória.',
    visualEffectsList: [
      'Chamas vivas animadas',
      'Brasas ascendentes',
    ],
    bundleDescription: 'Moldura ardente de campeão.',
    assetPath: '/images/frames/vip/fogo-campeao.webp',
    thumbnailPath: '/images/frames/vip/fogo-campeao.webp',
    previewPath: '/images/frames/vip/fogo-campeao.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-sky-400/80 bg-sky-950/60 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    accentColor: '#38bdf8',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_003',
      stripePriceId: 'price_vip_frm_003',
    },
  },
  {
    id: 'AP-VIP-FRAME-004',
    sku: 'AP-VIP-FRAME-004',
    name: 'Portugal Ouro',
    tier: 3,
    tierName: 'Molduras Reais',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    description: 'A arte do azulejo português, tradição secular, redefinida em ouro e azul profundo.',
    visualConcept: 'Estrutura geométrica de azulejo português em azul e branco com banhado a ouro, com facetas cortadas no formato do escudo nacional.',
    animation: 'Refrações de luz contínuas atravessam as bordas de azulejo com brilho suave.',
    effect: 'Flash dourado ao carregar o perfil, como luz sobre azulejo antigo.',
    visualEffectsList: [
      'Refrações de luz em azulejo',
      'Flash dourado no perfil',
      'Bordas animadas com brilho',
    ],
    assetPath: '/images/frames/vip/portugal-ouro.webp',
    thumbnailPath: '/images/frames/vip/portugal-ouro.webp',
    previewPath: '/images/frames/vip/portugal-ouro.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-teal-400/80 bg-teal-950/60 text-teal-300 shadow-[0_0_15px_rgba(167,243,208,0.5)]',
    accentColor: '#2dd4bf',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_004',
      stripePriceId: 'price_vip_frm_004',
    },
  },
  {
    id: 'AP-VIP-FRAME-005',
    sku: 'AP-VIP-FRAME-005',
    name: 'Trono Celestial',
    tier: 3,
    tierName: 'Molduras Reais',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    description: 'Moldura celestial translúcida com partículas astrais de alta resolução.',
    visualConcept: 'Cristal etéreo translúcido com energia cósmica.',
    animation: 'Partículas astrais em rotação.',
    effect: 'Aura celeste suave.',
    visualEffectsList: [
      'Cristal translúcido',
      'Partículas celestes',
    ],
    bundleDescription: 'Moldura celestial etérea.',
    assetPath: '/images/frames/vip/trono-celestial.webp',
    thumbnailPath: '/images/frames/vip/trono-celestial.webp',
    previewPath: '/images/frames/vip/trono-celestial.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-rose-400/80 bg-rose-950/60 text-rose-300 shadow-[0_0_15px_rgba(248,113,113,0.5)]',
    accentColor: '#fb7185',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_005',
      stripePriceId: 'price_vip_frm_005',
    },
  },

  // =========================================================================
  // 🏅 TIER IV — TÍTULOS DE PRESTÍGIO (6 itens · storeSection: 'identities')
  // Preços: €5,99–€14,99 | Raridades: Legendary → Rare
  // =========================================================================
  {
    id: 'AP-VIP-TITLE-001',
    sku: 'AP-VIP-TITLE-001',
    name: '«Imperador do Desafio»',
    tier: 4,
    tierName: 'Títulos de Prestígio',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    description: 'O título máximo da coleção. Reservado a quem se coloca acima de todos no Desafio Nacional.',
    visualConcept: 'Tipografia dourada animada com insígnia imperial e coroa real animada no topo.',
    animation: 'Brilho metálico cintilante ao longo das letras com partículas de ouro subtis.',
    effect: 'Título animado surge em destaque sob o avatar nos duelos e no ranking.',
    visualEffectsList: [
      'Brilho metálico nas letras',
      'Partículas de ouro',
      'Coroa animada no topo',
    ],
    assetPath: '/images/titles/vip/imperador-desafio.webp',
    thumbnailPath: '/images/titles/vip/imperador-desafio.webp',
    previewPath: '/images/titles/vip/imperador-desafio.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_001',
      stripePriceId: 'price_vip_ttl_001',
    },
  },
  {
    id: 'AP-VIP-TITLE-002',
    sku: 'AP-VIP-TITLE-002',
    name: '«Lenda de Portugal»',
    tier: 4,
    tierName: 'Títulos de Prestígio',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 12.99,
    priceCents: 1299,
    currency: 'EUR',
    description: 'Um título para quem entrou para a história do Desafio Nacional. Uma lenda não se explica — mostra-se.',
    visualConcept: 'Tipografia real com ornamentos lusitanos, brasão de armas e partículas douradas em redor do texto.',
    animation: 'Efeito suave de partículas douradas em torno do texto com varredura de luz nobre.',
    effect: 'Apresentação distinta nos duelos e no ranking do distrito.',
    visualEffectsList: [
      'Partículas douradas em circuito',
      'Varredura de luz nobre',
      'Brasão animado',
    ],
    assetPath: '/images/titles/vip/lenda-portugal.webp',
    thumbnailPath: '/images/titles/vip/lenda-portugal.webp',
    previewPath: '/images/titles/vip/lenda-portugal.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]',
    accentColor: '#34d399',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_002',
      stripePriceId: 'price_vip_ttl_002',
    },
  },
  {
    id: 'AP-VIP-TITLE-003',
    sku: 'AP-VIP-TITLE-003',
    name: '«Campeão Eterno»',
    tier: 4,
    tierName: 'Títulos de Prestígio',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    description: 'Os que lutaram em Aljubarrota tornaram-se imortais. Este título faz de ti um deles.',
    visualConcept: 'Título competitivo com acabamento em ferro forjado e realce a ouro, evocando a batalha mais importante de Portugal.',
    animation: 'Pulso de energia periódica com brilho de aço forjado.',
    effect: 'Destaque tático ao lado do nível do jogador nos duelos.',
    visualEffectsList: [
      'Brilho de aço forjado',
      'Pulso de energia periódico',
    ],
    assetPath: '/images/titles/vip/campeao-eterno.webp',
    thumbnailPath: '/images/titles/vip/campeao-eterno.webp',
    previewPath: '/images/titles/vip/campeao-eterno.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_003',
      stripePriceId: 'price_vip_ttl_003',
    },
  },
  {
    id: 'AP-VIP-TITLE-004',
    sku: 'AP-VIP-TITLE-004',
    name: '«Cérebro Nacional»',
    tier: 4,
    tierName: 'Títulos de Prestígio',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: 'Erudição carismática ao estilo da Universidade de Coimbra. O título de quem domina o conhecimento luso.',
    visualConcept: 'Estética de mestre erudito medieval com acabamento prata e reflexo luminoso.',
    animation: 'Reflexo luminoso prateado com brilho de tinta sobre pergaminho.',
    effect: 'Inscrição clássica no cartão de perfil.',
    visualEffectsList: [
      'Reflexo prateado',
      'Brilho de pergaminho antigo',
    ],
    assetPath: '/images/titles/vip/cerebro-nacional.webp',
    thumbnailPath: '/images/titles/vip/cerebro-nacional.webp',
    previewPath: '/images/titles/vip/cerebro-nacional.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.5)]',
    accentColor: '#c084fc',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_004',
      stripePriceId: 'price_vip_ttl_004',
    },
  },
  {
    id: 'AP-VIP-TITLE-005',
    sku: 'AP-VIP-TITLE-005',
    name: '«Mestre Lusitano»',
    tier: 4,
    tierName: 'Títulos de Prestígio',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Rare',
    rarityBadge: 'VIP EXCLUSIVO',
    prestigeTier: 'RARO VIP',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: 'A porta de entrada dos Títulos de Prestígio. Um orgulho simples e genuíno de ser português.',
    visualConcept: 'Título com identidade portuguesa directa e clara, com motivo floral verde e vermelho.',
    animation: 'Pulso suave com cor nacional.',
    effect: 'Emblema português subtil ao lado do nome.',
    visualEffectsList: [
      'Pulso suave verde-vermelho',
      'Emblema nacional',
    ],
    assetPath: '/images/titles/vip/mestre-lusitano.webp',
    thumbnailPath: '/images/titles/vip/mestre-lusitano.webp',
    previewPath: '/images/titles/vip/mestre-lusitano.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-teal-400/80 bg-teal-950/60 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.5)]',
    accentColor: '#2dd4bf',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_005',
      stripePriceId: 'price_vip_ttl_005',
    },
  },
  {
    id: 'AP-VIP-TITLE-006',
    sku: 'AP-VIP-TITLE-006',
    name: '«Senhor do Desafio»',
    tier: 4,
    tierName: 'Títulos de Prestígio',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Rare',
    rarityBadge: 'VIP EXCLUSIVO',
    prestigeTier: 'RARO VIP',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 5.99,
    priceCents: 599,
    currency: 'EUR',
    description: 'O título mais acessível da coleção. Uma forma de entrar no universo VIP com elegância.',
    visualConcept: 'Identidade cívica com motivo geométrico discreto e brilho subtil.',
    animation: 'Pequenos pulsos de luz nobre.',
    effect: 'Emblema de honra cívica ao lado do nome.',
    visualEffectsList: [
      'Pulsos de luz discreta',
    ],
    assetPath: '/images/titles/vip/senhor-desafio.webp',
    thumbnailPath: '/images/titles/vip/senhor-desafio.webp',
    previewPath: '/images/titles/vip/senhor-desafio.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-teal-400/80 bg-teal-950/60 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.5)]',
    accentColor: '#2dd4bf',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_006',
      stripePriceId: 'price_vip_ttl_006',
    },
  },

  // =========================================================================
  // 💥 TIER V — REAÇÕES CINEMATOGRÁFICAS / EMOTES (6 itens · storeSection: 'reactions')
  // Preços: €5,99–€9,99 | Raridades: Epic → Rare
  // =========================================================================
  {
    id: 'AP-VIP-EMOTE-001',
    sku: 'AP-VIP-EMOTE-001',
    name: 'Coroa-te 👑',
    tier: 5,
    tierName: 'Reações Cinematográficas',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    description: 'O avatar invoca uma coroa dourada que desce dos céus com autoridade real.',
    visualConcept: 'Coroa dourada gigante desce do topo do ecrã e assenta na cabeça do avatar com gravidade real.',
    animation: 'A coroa desce dos céus e trava no lugar com faíscas douradas e som de metal nobre.',
    effect: 'Explosão de partículas de ouro visível para ambos os jogadores.',
    visualEffectsList: [
      'Coroa animada a descer',
      'Faíscas douradas de impacto',
      'Explosão de partículas de ouro',
    ],
    assetPath: '/images/emotes/vip/coroa-te.webp',
    thumbnailPath: '/images/emotes/vip/coroa-te.webp',
    previewPath: '/images/emotes/vip/coroa-te.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_001',
      stripePriceId: 'price_vip_emt_001',
    },
  },
  {
    id: 'AP-VIP-EMOTE-002',
    sku: 'AP-VIP-EMOTE-002',
    name: 'Portugal no Topo 🇵🇹',
    tier: 5,
    tierName: 'Reações Cinematográficas',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: 'Celebração patriótica com estandartes e confettis nas cores de Portugal.',
    visualConcept: 'Sequência de celebração patriótica massiva com bandeiras ondulantes e confettis verdes e vermelhos.',
    animation: 'Bandeiras de Portugal ondulando e partículas de confettis patrióticos.',
    effect: 'Celebração temporária no ecrã de ambos os jogadores.',
    visualEffectsList: [
      'Bandeiras ondulantes',
      'Confettis verde e vermelho',
      'Fogo de artifício patriótico',
    ],
    assetPath: '/images/emotes/vip/portugal-no-topo.webp',
    thumbnailPath: '/images/emotes/vip/portugal-no-topo.webp',
    previewPath: '/images/emotes/vip/portugal-no-topo.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    accentColor: '#10b981',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_002',
      stripePriceId: 'price_vip_emt_002',
    },
  },
  {
    id: 'AP-VIP-EMOTE-003',
    sku: 'AP-VIP-EMOTE-003',
    name: 'Acabou!',
    tier: 5,
    tierName: 'Reações Cinematográficas',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: 'Reação dramática estilo final boss. Sentencia o fim do duelo com autoridade.',
    visualConcept: 'O avatar vira-se para a câmara com um olhar determinado enquanto o fundo escurece brevemente.',
    animation: 'O avatar vira-se para a câmara enquanto o fundo escurece com drama cinematográfico.',
    effect: 'Flash de impacto dramático no centro da arena.',
    visualEffectsList: [
      'Escurecimento dramático do fundo',
      'Flash de impacto central',
      'Silhueta destacada do avatar',
    ],
    assetPath: '/images/emotes/vip/acabou.webp',
    thumbnailPath: '/images/emotes/vip/acabou.webp',
    previewPath: '/images/emotes/vip/acabou.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-rose-400/80 bg-rose-950/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    accentColor: '#f43f5e',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_003',
      stripePriceId: 'price_vip_emt_003',
    },
  },
  {
    id: 'AP-VIP-EMOTE-004',
    sku: 'AP-VIP-EMOTE-004',
    name: 'Mestre Absoluto',
    tier: 5,
    tierName: 'Reações Cinematográficas',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Rare',
    rarityBadge: 'VIP EXCLUSIVO',
    prestigeTier: 'RARO VIP',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 5.99,
    priceCents: 599,
    currency: 'EUR',
    description: 'Gesto confiante de quem venceu sem esforço aparente. Classe pura lusitana.',
    visualConcept: 'Gesto confiante e elegante de vitória, com aura de energia suave a ascender.',
    animation: 'Aura de energia ascende em volta do personagem com partículas suaves.',
    effect: 'Aura de vencedor breve e elegante.',
    visualEffectsList: [
      'Aura suave de energia',
      'Partículas ascendentes',
    ],
    assetPath: '/images/emotes/vip/mestre-absoluto.webp',
    thumbnailPath: '/images/emotes/vip/mestre-absoluto.webp',
    previewPath: '/images/emotes/vip/mestre-absoluto.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    accentColor: '#a855f7',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_004',
      stripePriceId: 'price_vip_emt_004',
    },
  },
  {
    id: 'AP-VIP-EMOTE-005',
    sku: 'AP-VIP-EMOTE-005',
    name: 'Nem Acredito!',
    tier: 5,
    tierName: 'Reações Cinematográficas',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Rare',
    rarityBadge: 'VIP EXCLUSIVO',
    prestigeTier: 'RARO VIP',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 5.99,
    priceCents: 599,
    currency: 'EUR',
    description: 'Surpresa cómica e genuinamente portuguesa após um acerto improvável.',
    visualConcept: 'Reação dramática e bem-humorada do avatar com expressão de genuína surpresa.',
    animation: 'Reação exagerada e bem-humorada do avatar.',
    effect: 'Explosão cómica de pontos de interrogação e exclamação.',
    visualEffectsList: [
      'Pontos de interrogação animados',
      'Reação dramática do avatar',
    ],
    assetPath: '/images/emotes/vip/nem-acredito.webp',
    thumbnailPath: '/images/emotes/vip/nem-acredito.webp',
    previewPath: '/images/emotes/vip/nem-acredito.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-sky-400/80 bg-sky-950/60 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.5)]',
    accentColor: '#0ea5e9',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_005',
      stripePriceId: 'price_vip_emt_005',
    },
  },
  {
    id: 'AP-VIP-EMOTE-006',
    sku: 'AP-VIP-EMOTE-006',
    name: 'Respeito 🤝',
    tier: 5,
    tierName: 'Reações Cinematográficas',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Rare',
    rarityBadge: 'VIP EXCLUSIVO',
    prestigeTier: 'RARO VIP',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 5.99,
    priceCents: 599,
    currency: 'EUR',
    description: 'Saudação refinada de cavaleiro português reconhecendo o mérito do adversário.',
    visualConcept: 'Vénia nobre com mão no coração, reconhecendo o oponente com respeito medieval.',
    animation: 'Vénia elegante com partículas esmeralda subtis.',
    effect: 'Rastro subtil de partículas esmeralda.',
    visualEffectsList: [
      'Partículas esmeralda subtis',
      'Vénia animada',
    ],
    assetPath: '/images/emotes/vip/respeito.webp',
    thumbnailPath: '/images/emotes/vip/respeito.webp',
    previewPath: '/images/emotes/vip/respeito.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(217,119,6,0.5)]',
    accentColor: '#d97706',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_006',
      stripePriceId: 'price_vip_emt_006',
    },
  },

  // =========================================================================
  // 😈 TIER VI — PACKS DE PROVOCAÇÃO DE ELITE (4 itens · storeSection: 'taunts')
  // Preços: €7,99–€14,99 | Raridades: Legendary → Epic
  // =========================================================================
  {
    id: 'AP-VIP-TAUNTPACK-001',
    sku: 'AP-VIP-TAUNTPACK-001',
    name: 'Realeza Absoluta',
    tier: 6,
    tierName: 'Elite Taunts',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    description: '6 provocações de alta nobreza pronunciadas com a pose altiva de um soberano.',
    visualConcept: 'Coroa e cetro com estandarte imperial.',
    animation: 'Texto animado com halo dourado.',
    effect: 'Balão de fala estilizado.',
    visualEffectsList: ['Texto dourado', 'Voz de monarca'],
    bundleDescription: 'Pack de 6 provocações reais.',
    assetPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    thumbnailPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    previewPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    accentColor: '#f59e0b',
    taunts: [
      { id: 't_real_1', text: 'Curva-te perante o conhecimento do Rei!', icon: '👑' },
      { id: 't_real_2', text: 'Esta coroa não cai em solo lusitano.', icon: '⚔️' },
      { id: 't_real_3', text: 'Uma resposta digna de plebeu.', icon: '📜' },
      { id: 't_real_4', text: 'O trono de Portugal pertence aos sábios.', icon: '🏰' },
      { id: 't_real_5', text: 'A história curva-se à minha sabedoria!', icon: '⚡' },
      { id: 't_real_6', text: 'Vitória proclamada por decreto régio.', icon: '🇵🇹' },
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_001',
      stripePriceId: 'price_vip_tnt_001',
    },
  },
  {
    id: 'AP-VIP-TAUNTPACK-002',
    sku: 'AP-VIP-TAUNTPACK-002',
    name: 'Guerra dos Campeões',
    tier: 6,
    tierName: 'Elite Taunts',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: '6 frases incisivas para abalar a confiança de qualquer rival em duelo direto.',
    visualConcept: 'Espadas cruzadas com chamas de combate.',
    animation: 'Faíscas e som cortante.',
    effect: 'Balão de fala agressivo.',
    visualEffectsList: ['Faíscas de aço', 'Impacto sonoro'],
    bundleDescription: 'Pack de 6 provocações de guerra.',
    assetPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    thumbnailPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    previewPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-orange-400/80 bg-orange-950/60 text-orange-300 shadow-[0_0_15px_rgba(234,88,12,0.5)]',
    accentColor: '#ea580c',
    taunts: [
      { id: 't_camp_1', text: 'Na arena do Desafio, só um prevalece!', icon: '⚔️' },
      { id: 't_camp_2', text: 'Erraste no tempo, perdeste o momento!', icon: '⏱️' },
      { id: 't_camp_3', text: 'Precisas de mais perguntas para me apanhar.', icon: '🛡️' },
      { id: 't_camp_4', text: 'Conhecimento é poder na ponta da espada.', icon: '🔥' },
      { id: 't_camp_5', text: 'O meu distrito lidera este combate.', icon: '🇵🇹' },
      { id: 't_camp_6', text: 'Podes tentar outra vez... amanhã.', icon: '🎯' },
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_002',
      stripePriceId: 'price_vip_tnt_002',
    },
  },
  {
    id: 'AP-VIP-TAUNTPACK-003',
    sku: 'AP-VIP-TAUNTPACK-003',
    name: 'Lusitano Implacável',
    tier: 6,
    tierName: 'Elite Taunts',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: '6 expressões autênticas da raça lusitana que desarmam o oponente.',
    visualConcept: 'Escudo antigo com relâmpagos.',
    animation: 'Vibração de combate.',
    effect: 'Balão de fala estilizado.',
    visualEffectsList: ['Relâmpagos verdes', 'Som épico'],
    bundleDescription: 'Pack de 6 provocações lusitanas.',
    assetPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    thumbnailPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    previewPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    accentColor: '#10b981',
    taunts: [
      { id: 't_luso_1', text: 'Nem com a Padeira de Aljubarrota lá chegavas!', icon: '🥖' },
      { id: 't_luso_2', text: 'Isso até o Galo de Barcelos sabia!', icon: '🐓' },
      { id: 't_luso_3', text: 'Toma lá um pastel de nata para consolar.', icon: '🥧' },
      { id: 't_luso_4', text: 'Estás a navegar em águas nunca dantes vistas...', icon: '⛵' },
      { id: 't_luso_5', text: 'Portugal não dorme no Desafio Nacional!', icon: '🇵🇹' },
      { id: 't_luso_6', text: 'Foste ao mar perder a caneca!', icon: '🌊' },
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_003',
      stripePriceId: 'price_vip_tnt_003',
    },
  },
  {
    id: 'AP-VIP-TAUNTPACK-004',
    sku: 'AP-VIP-TAUNTPACK-004',
    name: 'O Chefe Final',
    tier: 6,
    tierName: 'Elite Taunts',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Rare',
    rarityBadge: 'RARO VIP',
    prestigeTier: 'RARO VIP',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 5.99,
    priceCents: 599,
    currency: 'EUR',
    description: 'As frases intimidantes de quem já venceu mil duelos e continua invicto.',
    visualConcept: 'Caveira com coroa de campeão.',
    animation: 'Aura negra com olhos vermelhos.',
    effect: 'Som estrondoso.',
    visualEffectsList: ['Aura escura', 'Gongo final'],
    bundleDescription: 'Pack de 6 provocações de chefe final.',
    assetPath: '/images/taunts/vip/final-boss/icon.webp',
    thumbnailPath: '/images/taunts/vip/final-boss/icon.webp',
    previewPath: '/images/taunts/vip/final-boss/icon.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    accentColor: '#a855f7',
    taunts: [
      { id: 't_boss_1', text: 'Chegaste ao chefe final do Acorda Portugal.', icon: '😈' },
      { id: 't_boss_2', text: 'A tua sequência acaba exatamente aqui.', icon: '⚡' },
      { id: 't_boss_3', text: 'Pensavas que o topo do ranking era fácil?', icon: '💀' },
      { id: 't_boss_4', text: 'Testaste a lenda e caíste no abismo.', icon: '🔥' },
      { id: 't_boss_5', text: 'Fim de jogo. Game Over!', icon: '🛑' },
      { id: 't_boss_6', text: 'Volta quando estudares mais sobre Portugal.', icon: '📚' },
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_004',
      stripePriceId: 'price_vip_tnt_004',
    },
  },

  // =========================================================================
  // 💎 TIER VII — COLEÇÕES COMPLETAS / BUNDLES (3 itens · storeSection: 'bundles')
  // Preços: €24,99–€34,99 | Raridades: Mythic → Legendary
  // =========================================================================
  {
    id: 'AP-VIP-BUNDLE-001',
    sku: 'AP-VIP-BUNDLE-001',
    name: 'Campeão Eterno — Conjunto Completo',
    tier: 7,
    tierName: 'Coleções Completas',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Mythic',
    rarityBadge: 'COLECIONADOR MÍTICO',
    prestigeTier: 'MÍTICO',
    profileBannerTag: 'SÉRIE FUNDADOR',
    priceEUR: 34.99,
    priceCents: 3499,
    currency: 'EUR',
    description: 'O pacote real completo. Avatar do Soberano de Ourique com moldura da Ordem de Cristo e o título máximo.',
    visualConcept: 'O pacote de prestígio absoluto que reúne o avatar fundador, a moldura templária e o título supremo numa apresentação real unificada.',
    animation: 'Ativação simultânea do manto imperial e partículas da cruz templária dourada.',
    effect: 'Quando equipados todos os componentes, o perfil ativa a Apresentação Real Completa.',
    visualEffectsList: [
      'Apresentação real completa ao equipar tudo',
      'Manto imperial animado',
      'Partículas da cruz templária',
      'Efeito de vitória especial de bundle',
    ],
    bundleDescription: `Inclui:
✓ Avatar "Soberano de Ourique"
✓ Moldura "Ordem de Cristo" (Ed. Limitada)
✓ Título "Imperador de Portugal"
✓ Emote "A Coroa Desce"
✓ Efeito de Vitória Real exclusivo`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-EMOTE-001',
    ],
    assetPath: '/bundles/vip/campeao-eterno/banner.webp',
    thumbnailPath: '/bundles/vip/campeao-eterno/banner.webp',
    previewPath: '/bundles/vip/campeao-eterno/banner.webp',
    purchaseRules: 'Propriedade permanente. Os componentes individuais são entregues automaticamente ao inventário. Inclui a Moldura "Ordem de Cristo" em edição limitada.',
    payToWin: false,
    badgeColor: 'border-yellow-400/80 bg-yellow-950/60 text-yellow-300 shadow-[0_0_20px_rgba(255,215,0,0.6)]',
    accentColor: '#eab308',
    providerMapping: {
      stripeProductId: 'prod_vip_bnd_001',
      stripePriceId: 'price_vip_bnd_001',
    },
  },
  {
    id: 'AP-VIP-BUNDLE-002',
    sku: 'AP-VIP-BUNDLE-002',
    name: 'Coleção Imperial',
    tier: 7,
    tierName: 'Conjuntos Completos',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    description: 'Conjunto completo de prestígio imperial com itens temáticos exclusivos.',
    visualConcept: 'Showcase imperial com cores régias e estandartes.',
    animation: 'Aura imperial e fanfarra.',
    effect: 'Desbloqueio do conjunto imperial.',
    visualEffectsList: ['Efeitos imperiais incluídos'],
    bundleDescription: 'Avatar + Moldura + Título.',
    assetPath: '/bundles/vip/imperial/banner.webp',
    thumbnailPath: '/bundles/vip/imperial/banner.webp',
    previewPath: '/bundles/vip/imperial/banner.webp',
    purchaseRules: 'Propriedade permanente. Todos os componentes entregues individualmente.',
    payToWin: false,
    badgeColor: 'border-blue-400/80 bg-blue-950/60 text-blue-300 shadow-[0_0_20px_rgba(96,165,250,0.6)]',
    accentColor: '#60a5fa',
    providerMapping: {
      stripeProductId: 'prod_vip_bnd_002',
      stripePriceId: 'price_vip_bnd_002',
    },
  },
  {
    id: 'AP-VIP-BUNDLE-003',
    sku: 'AP-VIP-BUNDLE-003',
    name: 'Lusitano Supremo',
    tier: 7,
    tierName: 'Conjuntos Completos',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    description: 'Conjunto de guerreiro lusitano com itens patrióticos de topo.',
    visualConcept: 'Armaduras e espadas com relâmpagos verdes.',
    animation: 'Vibração heróica.',
    effect: 'Desbloqueio de guerreiro supremo.',
    visualEffectsList: ['Efeitos lusitanos incluídos'],
    bundleDescription: 'Avatar + Arena + Emote.',
    assetPath: '/bundles/vip/lusitano-supremo/banner.webp',
    thumbnailPath: '/bundles/vip/lusitano-supremo/banner.webp',
    previewPath: '/bundles/vip/lusitano-supremo/banner.webp',
    purchaseRules: 'Propriedade permanente. Desempacotamento automático no inventário.',
    payToWin: false,
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    accentColor: '#10b981',
    providerMapping: {
      stripeProductId: 'prod_vip_bnd_003',
      stripePriceId: 'price_vip_bnd_003',
    },
  },

  // =========================================================================
  // 👑 TIER VIII — COROAS DE COLECIONADOR / ULTIMATE (5 itens · storeSection: 'ultimate')
  // Preços: €24,99–€39,99 | Raridades: Mythic → Legendary
  // =========================================================================
  {
    id: 'AP-VIP-ULTIMATE-001',
    sku: 'AP-VIP-ULTIMATE-001',
    name: 'Identidade de Campeão',
    tier: 8,
    tierName: 'Ultimate Exclusives',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    rarityBadge: 'COLECIONADOR MÍTICO',
    prestigeTier: 'MÍTICO',
    profileBannerTag: 'ED. LIMITADA',
    priceEUR: 39.99,
    priceCents: 3999,
    currency: 'EUR',
    isLimited: true,
    limitedUnits: 25,
    stock: 25,
    serialised: true,
    description: 'A peça artística definitiva: uma escultura digital de campeão nacional com holograma em tempo real.',
    visualConcept: 'Monólito de cristal negro e ouro puro com o brasão de Portugal gravado.',
    animation: 'Holograma 3D perpétuo com partículas quânticas.',
    effect: 'Transformação visual completa do perfil do utilizador.',
    visualEffectsList: ['Holograma quântico 3D', 'Perfil personalizado ultra-luxo'],
    bundleDescription: 'Obra de arte digital suprema #XX/25.',
    assetPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    thumbnailPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    previewPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    purchaseRules: 'Edição Fundador Limitada a 25 unidades numeradas. Número de coleção único atribuído pelo servidor após transação (#001 a #025). Quando esgotado, o item deixa de estar disponível para sempre.',
    payToWin: false,
    badgeColor: 'border-rose-400/95 bg-rose-950/80 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.8)]',
    accentColor: '#f43f5e',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_001',
      stripePriceId: 'price_vip_ult_001',
    },
  },
  {
    id: 'AP-VIP-ULTIMATE-002',
    sku: 'AP-VIP-ULTIMATE-002',
    name: 'Legenda Nacional',
    tier: 8,
    tierName: 'Coroas de Colecionador',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    rarityBadge: 'COLECIONADOR MÍTICO',
    prestigeTier: 'MÍTICO',
    profileBannerTag: 'ED. LIMITADA',
    priceEUR: 34.99,
    priceCents: 3499,
    currency: 'EUR',
    isLimited: true,
    limitedUnits: 100,
    stock: 100,
    serialised: true,
    description: 'A identidade de temática portuguesa mais imponente após o "Portugal Imortal". Uma edição limitada a 100 numerada.',
    visualConcept: 'A identidade régia mais imponente do jogo, centrada no avatar "Dragão de Viriato" e na arena do Palácio dos Descobrimentos.',
    animation: 'Entrada cinematográfica de vários segundos com apresentação real completa.',
    effect: 'Aura dupla de dragão e coroa real no perfil e no lobby.',
    visualEffectsList: [
      'Cinemática de entrada real',
      'Aura dupla de dragão e coroa',
      'Badge numerado #XX/100',
      'Fanfarra real no duelo',
      'Partículas draconianas no lobby',
    ],
    lobbyAnimation: 'Aura de dragão com brilho real',
    duelIntroSound: 'senhor-quinas-fanfarra',
    profileBadge: 'SENHOR DAS QUINAS',
    bundleDescription: `Inclui:
✓ Avatar "Dragão de Viriato"
✓ Arena "Palácio dos Descobrimentos"
✓ Moldura "Quinas Reais de Portugal"
✓ Título "Lenda da Nação"
✓ Emote "Orgulho Português"
✓ Pack "Duelos de Campeões"
✓ Badge de perfil numerado #XX/100`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-002',
      'AP-VIP-ARENA-ULTIMATE-002',
      'AP-VIP-FRAME-002',
      'AP-VIP-TITLE-002',
      'AP-VIP-EMOTE-002',
      'AP-VIP-TAUNTPACK-002',
    ],
    assetPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    thumbnailPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    previewPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    purchaseRules: 'Edição limitada a 100 unidades numeradas. Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-pink-400/90 bg-pink-950/70 text-pink-200 shadow-[0_0_25px_rgba(236,72,153,0.7)]',
    accentColor: '#ec4899',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_002',
      stripePriceId: 'price_vip_ult_002',
    },
  },
  {
    id: 'AP-VIP-ULTIMATE-003',
    sku: 'AP-VIP-ULTIMATE-003',
    name: 'Senhor de Portugal',
    tier: 8,
    tierName: 'Ultimate Exclusives',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    description: 'A espada e o escudo da fundação de 1143 em versão holográfica de luxo.',
    visualConcept: 'Espada de ferro sagrado com cabo em filigrana e chamas azuis.',
    animation: 'Chamas azuis perpétuas na lâmina.',
    effect: 'Apresentação única em cada partida.',
    visualEffectsList: ['Lâmina com chamas azuis', 'Símbolo da fundação'],
    bundleDescription: 'Relíquia exclusiva de colecionador.',
    assetPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    thumbnailPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    previewPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    purchaseRules: 'Edição limitada a 200 unidades numeradas. Propriedade permanente. Cosmético exclusivo.',
    payToWin: false,
    badgeColor: 'border-purple-400/90 bg-purple-950/70 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.7)]',
    accentColor: '#a855f7',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_003',
      stripePriceId: 'price_vip_ult_003',
    },
  },
  {
    id: 'AP-VIP-ULTIMATE-004',
    sku: 'AP-VIP-ULTIMATE-004',
    name: 'Trono do Desafio',
    tier: 8,
    tierName: 'Coroas de Colecionador',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'SÉRIE FUNDADOR',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    description: 'A alma do promontório de onde o futuro foi planeado. Uma identidade de visionário lusitano.',
    visualConcept: 'Identidade premium inspirada na Escola de Sagres, berço intelectual dos Descobrimentos, com avatar navegador e arena do Atlântico.',
    animation: 'Ondas atlânticas e estrelas de navegação na entrada.',
    effect: 'Pacote visual completo de prestígio marítimo.',
    visualEffectsList: [
      'Ondas atlânticas na entrada',
      'Estrelas de navegação',
      'Aura de visionário',
    ],
    lobbyAnimation: 'Ondas subtis com estrelas náuticas',
    bundleDescription: `Inclui:
✓ Avatar "Navegador dos Descobrimentos"
✓ Arena "Muralhas do Além-Tejo"
✓ Moldura "Azulejo Dourado"
✓ Título "Mestre dos Saberes"
✓ Emote "Vénia do Cavaleiro"`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-003',
      'AP-VIP-ARENA-ULTIMATE-005',
      'AP-VIP-FRAME-004',
      'AP-VIP-TITLE-004',
      'AP-VIP-EMOTE-006',
    ],
    assetPath: '/ultimate/vip/trono-desafio/showcase.webp',
    thumbnailPath: '/ultimate/vip/trono-desafio/showcase.webp',
    previewPath: '/ultimate/vip/trono-desafio/showcase.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo. Sem vantagens de jogo.',
    payToWin: false,
    badgeColor: 'border-sky-400/90 bg-sky-950/70 text-sky-200 shadow-[0_0_25px_rgba(2,132,199,0.7)]',
    accentColor: '#0284c7',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_004',
      stripePriceId: 'price_vip_ult_004',
    },
  },
  {
    id: 'AP-VIP-ULTIMATE-005',
    sku: 'AP-VIP-ULTIMATE-005',
    name: 'O Último Desafio',
    tier: 8,
    tierName: 'Coroas de Colecionador',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Legendary',
    rarityBadge: 'SÉRIE FUNDADOR',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'SÉRIE FUNDADOR',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    description: 'O produto especial ligado diretamente à identidade do Acorda Portugal. Para os que acreditaram desde o início.',
    visualConcept: 'Identidade de fundador com avatar guardião, moldura da calçada portuguesa e o título de honra do Desafio Nacional.',
    animation: 'Aura de fundador verde e dourado com partículas de calçada.',
    effect: 'Badge especial "FUNDADOR" visível no perfil e nos duelos.',
    visualEffectsList: [
      'Aura de fundador verde-dourado',
      'Partículas de calçada portuguesa',
      'Badge FUNDADOR no perfil',
    ],
    lobbyAnimation: 'Aura suave verde-dourada de fundador',
    profileBadge: 'FUNDADOR',
    bundleDescription: `Inclui:
✓ Avatar "Guardião das Quinas"
✓ Moldura "Calçada da Glória"
✓ Título "Filho da Lusitânia"
✓ Emote "Salva do Vencedor"
✓ Pack "Lusitano Implacável"
✓ Badge exclusivo "FUNDADOR"`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-004',
      'AP-VIP-FRAME-005',
      'AP-VIP-TITLE-005',
      'AP-VIP-EMOTE-004',
      'AP-VIP-TAUNTPACK-003',
    ],
    assetPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    thumbnailPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    previewPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo. Badge "FUNDADOR" permanente no perfil.',
    payToWin: false,
    badgeColor: 'border-amber-400/90 bg-amber-950/70 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.7)]',
    accentColor: '#f59e0b',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_005',
      stripePriceId: 'price_vip_ult_005',
    },
  },
]

// ============================================================================
// MAPEAMENTO DE ALIASES LEGADOS (compatibilidade com inventários antigos)
// ============================================================================
export const VIP_LEGACY_ALIASES: Record<string, string> = {
  'vip_avatar_001': 'AP-VIP-SIGNATURE-001',
  'vip_avatar_002': 'AP-VIP-SIGNATURE-002',
  'vip_avatar_003': 'AP-VIP-SIGNATURE-003',
  'vip_avatar_004': 'AP-VIP-SIGNATURE-004',
  'vip_arena_001': 'AP-VIP-ARENA-ULTIMATE-001',
  'vip_arena_002': 'AP-VIP-ARENA-ULTIMATE-002',
  'vip_arena_003': 'AP-VIP-ARENA-ULTIMATE-003',
  'vip_arena_004': 'AP-VIP-ARENA-ULTIMATE-004',
  'vip_arena_005': 'AP-VIP-ARENA-ULTIMATE-005',
  'vip_frame_001': 'AP-VIP-FRAME-001',
  'vip_frame_002': 'AP-VIP-FRAME-002',
  'vip_frame_003': 'AP-VIP-FRAME-003',
  'vip_frame_004': 'AP-VIP-FRAME-004',
  'vip_frame_005': 'AP-VIP-FRAME-005',
  'vip_title_001': 'AP-VIP-TITLE-001',
  'vip_title_002': 'AP-VIP-TITLE-002',
  'vip_title_003': 'AP-VIP-TITLE-003',
  'vip_title_004': 'AP-VIP-TITLE-004',
  'vip_title_005': 'AP-VIP-TITLE-005',
  'vip_title_006': 'AP-VIP-TITLE-006',
  'vip_emote_001': 'AP-VIP-EMOTE-001',
  'vip_emote_002': 'AP-VIP-EMOTE-002',
  'vip_emote_003': 'AP-VIP-EMOTE-003',
  'vip_emote_004': 'AP-VIP-EMOTE-004',
  'vip_emote_005': 'AP-VIP-EMOTE-005',
  'vip_emote_006': 'AP-VIP-EMOTE-006',
  'vip_tauntpack_001': 'AP-VIP-TAUNTPACK-001',
  'vip_tauntpack_002': 'AP-VIP-TAUNTPACK-002',
  'vip_tauntpack_003': 'AP-VIP-TAUNTPACK-003',
  'vip_tauntpack_004': 'AP-VIP-TAUNTPACK-004',
  // Aliases de nomes antigos → IDs novos (para compatibilidade)
  'imperador-lusitano': 'AP-VIP-SIGNATURE-001',
  'dragao-portugal': 'AP-VIP-SIGNATURE-002',
  'navegador-eterno': 'AP-VIP-SIGNATURE-003',
  'guardiao-nacao': 'AP-VIP-SIGNATURE-004',
  'trono-supremo-campeao': 'AP-VIP-ARENA-ULTIMATE-001',
  'portugal-celestial': 'AP-VIP-ARENA-ULTIMATE-002',
  'coliseu-campeoes': 'AP-VIP-ARENA-ULTIMATE-003',
  'palacio-reis': 'AP-VIP-ARENA-ULTIMATE-004',
  'cidadela-eterna': 'AP-VIP-ARENA-ULTIMATE-005',
  'coroa-imperio': 'AP-VIP-FRAME-001',
  'portugal-ouro': 'AP-VIP-FRAME-002',
  'trono-celestial': 'AP-VIP-FRAME-003',
  'diamante-lusitano': 'AP-VIP-FRAME-004',
  'fogo-campeao': 'AP-VIP-FRAME-005',
  'conjunto-imperial': 'AP-VIP-BUNDLE-001',
  'conjunto-campeao-eterno': 'AP-VIP-BUNDLE-002',
  'conjunto-lusitano-supremo': 'AP-VIP-BUNDLE-003',
  'identidade-campeao': 'AP-VIP-ULTIMATE-001',
  'senhor-portugal': 'AP-VIP-ULTIMATE-002',
  'trono-desafio': 'AP-VIP-ULTIMATE-003',
  'legenda-nacional': 'AP-VIP-ULTIMATE-004',
  'o-ultimo-desafio': 'AP-VIP-ULTIMATE-005',
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

export function getVipProductById(idOrSku: string): VipProduct | undefined {
  if (!idOrSku) return undefined
  const direct = VIP_CATALOG.find(p => p.id === idOrSku || p.sku === idOrSku)
  if (direct) return direct
  const canonicalId = VIP_LEGACY_ALIASES[idOrSku]
  if (canonicalId) {
    return VIP_CATALOG.find(p => p.id === canonicalId || p.sku === canonicalId)
  }
  return undefined
}

export function getAllVipProducts(): VipProduct[] {
  return [...VIP_CATALOG]
}

export function getVipProductsBySection(section: StoreSection): VipProduct[] {
  return VIP_CATALOG.filter(p => p.storeSection === section)
}

export function formatVipPrice(priceCents: number): string {
  const euros = (priceCents / 100).toFixed(2).replace('.', ',')
  return `€${euros}`
}

/**
 * Retorna o label de prestige para mostrar na UI (nunca o ID técnico).
 * Usar esta função em vez de expor product.id ou product.sku ao utilizador.
 */
export function getVipPrestigeLabel(product: VipProduct): string {
  return product.rarityBadge
}

/**
 * Retorna o tag de banner para mostrar na UI.
 */
export function getVipBannerTag(product: VipProduct): string {
  if (product.isLimited && product.limitedUnits) {
    return `ED. LIMITADA · ${product.limitedUnits} UN.`
  }
  return product.profileBannerTag
}
