/**
 * 🇵🇹 ACORDA PORTUGAL — VIP COLLECTION 2.0 (SSOT)
 * 
 * Master Catalog — 38 Premium Exclusives
 * Single Source of Truth para todos os itens VIP compráveis com dinheiro real (€).
 * 
 * Regras Globais:
 * - Preços canónicos em cêntimos de Euro (priceCents) e moeda EUR.
 * - Zero Pay-to-Win: apenas cosméticos, títulos, prestígio e apresentações de status.
 * - Suporte a desempacotamento de bundles e tracking de edições limitadas.
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
  id: string
  sku: string
  name: string
  tier: number
  tierName: string
  storeSection: StoreSection
  category: VipCategory
  rarity: VipRarity
  priceEUR: number
  priceCents: number
  currency: 'EUR'
  visualConcept: string
  animation: string
  effect: string
  bundleDescription?: string
  bundleComponents?: string[]
  assetPath: string
  thumbnailPath: string
  previewPath: string
  purchaseRules: string
  isLimited?: boolean
  stock?: number
  isSoldOut?: boolean
  collectionNumber?: number
  providerMapping: VipProviderMapping
  taunts?: VipTauntItem[]
  badgeColor?: string
  description?: string
  rarityLabel?: string
  accentColor?: string
  secondaryColor?: string
}

export const VIP_CATALOG: VipProduct[] = [
  // =========================================================================
  // 👑 TIER I — SIGNATURE VIP (4 Itens)
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
    priceEUR: 39.99,
    priceCents: 3999,
    currency: 'EUR',
    visualConcept: 'Monarca supremo português redesenhado como a personagem definitiva do Acorda Portugal. Manto real ornamentado, detalhes em carmesim e ouro, materiais metálicos e silhueta iluminada.',
    animation: 'Respiração lenta, movimento subtil do manto, iluminação da coroa e animação majestosa de entrada na partida.',
    effect: 'Ao entrar num duelo, uma aura real dourada surge brevemente em torno do avatar.',
    bundleDescription: 'Avatar + animação exclusiva de entrada + pose de vitória + insígnia de perfil.',
    assetPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    thumbnailPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    previewPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético. Não comprável com moedas.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_001',
      stripePriceId: 'price_vip_sig_001',
    }
  },
  {
    id: 'AP-VIP-SIGNATURE-002',
    name: 'Dragão de Portugal',
    sku: 'AP-VIP-SIGNATURE-002',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Mythic',
    priceEUR: 34.99,
    priceCents: 3499,
    currency: 'EUR',
    visualConcept: 'Campeão colossal inspirado no dragão lusitano, combinando motivos visuais nacionais com armadura mítica de fantasia, escamas reluzentes e olhos ardentes.',
    animation: 'Fumo subtil, movimento de asas draconianas e respiração mística.',
    effect: 'Brasas ardentes de dragão emergem durante a entrada em jogo.',
    bundleDescription: 'Avatar + animação de entrada + animação de vitória + badge exclusivo.',
    assetPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    thumbnailPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    previewPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_002',
      stripePriceId: 'price_vip_sig_002',
    }
  },
  {
    id: 'AP-VIP-SIGNATURE-003',
    name: 'Navegador Eterno',
    sku: 'AP-VIP-SIGNATURE-003',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Legendary',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    visualConcept: 'Capitão explorador lendário que conjuga a história marítima portuguesa com armadura cerimonial futurista e astrolábio cintilante.',
    animation: 'O manto e a bússola movem-se suavemente; brilho constante na bússola astrolábica.',
    effect: 'Efeito animado de bússola oceânica surge na entrada do duelo.',
    bundleDescription: 'Avatar + entrada + pose de vitória + badge de perfil.',
    assetPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    thumbnailPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    previewPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-sky-400/80 bg-sky-950/60 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_003',
      stripePriceId: 'price_vip_sig_003',
    }
  },
  {
    id: 'AP-VIP-SIGNATURE-004',
    name: 'Guardião da Nação',
    sku: 'AP-VIP-SIGNATURE-004',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Legendary',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    visualConcept: 'Protetor de elite envergando armadura monumental com as quinas de Portugal, escudo impenetrável e padrões de luz lusa.',
    animation: 'O escudo ergue-se subtilmente em repouso; a armadura reflete luz dinâmica.',
    effect: 'Anel de energia defensiva manifesta-se na apresentação do duelo.',
    bundleDescription: 'Avatar + animação de entrada + pose de vitória.',
    assetPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    thumbnailPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    previewPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_sig_004',
      stripePriceId: 'price_vip_sig_004',
    }
  },

  // =========================================================================
  // 🏟️ TIER II — ULTIMATE ARENAS (5 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-ARENA-ULTIMATE-001',
    name: 'Trono Supremo do Campeão',
    sku: 'AP-VIP-ARENA-ULTIMATE-001',
    tier: 2,
    tierName: 'Ultimate Arenas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Mythic',
    priceEUR: 49.99,
    priceCents: 4999,
    currency: 'EUR',
    visualConcept: 'Trono real imenso sobre uma arena de duelo com arquitetura dourada, estandartes colossais e assistência de estádio vibrante.',
    animation: 'Estandartes esvoaçantes, partículas atmosféricas, iluminação dinâmica e público em festa.',
    effect: 'O lado do vencedor recebe um holofote dourado cinematográfico no encerramento.',
    bundleDescription: 'Arena + sequência exclusiva de entrada + efeito de vitória ambiental.',
    assetPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    thumbnailPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    previewPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    purchaseRules: 'O dono pode selecionar a arena em partidas elegíveis. O adversário visualiza a arena sem precisar de a deter.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_001',
      stripePriceId: 'price_vip_arn_001',
    }
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-002',
    name: 'Portugal Celestial',
    sku: 'AP-VIP-ARENA-ULTIMATE-002',
    tier: 2,
    tierName: 'Ultimate Arenas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Mythic',
    priceEUR: 44.99,
    priceCents: 4499,
    currency: 'EUR',
    visualConcept: 'Arena flutuante suspensa sobre um Portugal 3D luminoso com estrelas, nebulosas celestiais e arcos etéreos.',
    animation: 'Movimento lento de nuvens cósmicas, chuva de estrelas e rotação do mapa 3D inferior.',
    effect: 'A vitória despoleta um feixe de luz celestial a iluminar o vencedor.',
    bundleDescription: 'Arena + entrada celestial + sequência de vitória.',
    assetPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    thumbnailPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    previewPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-blue-400/80 bg-blue-950/60 text-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_002',
      stripePriceId: 'price_vip_arn_002',
    }
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-003',
    name: 'Coliseu dos Campeões',
    sku: 'AP-VIP-ARENA-ULTIMATE-003',
    tier: 2,
    tierName: 'Ultimate Arenas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Legendary',
    priceEUR: 39.99,
    priceCents: 3999,
    currency: 'EUR',
    visualConcept: 'Coliseu com arquitetura monumental repleto de luzes, faixas dos distritos e multidão em apoteose.',
    animation: 'Movimento da multidão, holofotes em varrimento e bandeiras agitadas.',
    effect: 'A vitória ativa celebração em todo o estádio com fogo de artifício.',
    bundleDescription: 'Arena + entrada épica + celebração de vitória.',
    assetPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    thumbnailPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    previewPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_003',
      stripePriceId: 'price_vip_arn_003',
    }
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-004',
    name: 'Palácio dos Reis',
    sku: 'AP-VIP-ARENA-ULTIMATE-004',
    tier: 2,
    tierName: 'Ultimate Arenas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Legendary',
    priceEUR: 34.99,
    priceCents: 3499,
    currency: 'EUR',
    visualConcept: 'Palácio real manuelino transformado em palco de duelo, com mármores nobres e fontes luminosas.',
    animation: 'Chamas de tocheiros, estandartes imperiais e fontes em cascata.',
    effect: 'Explosão de luz real no ecrã após o triunfo final.',
    bundleDescription: 'Arena + entrada régia.',
    assetPath: '/arenas/vip/ultimate/palacio-reis.webp',
    thumbnailPath: '/arenas/vip/ultimate/palacio-reis.webp',
    previewPath: '/arenas/vip/ultimate/palacio-reis.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-fuchsia-400/80 bg-fuchsia-950/60 text-fuchsia-300 shadow-[0_0_15px_rgba(232,121,249,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_004',
      stripePriceId: 'price_vip_arn_004',
    }
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-005',
    name: 'Cidadela Eterna',
    sku: 'AP-VIP-ARENA-ULTIMATE-005',
    tier: 2,
    tierName: 'Ultimate Arenas',
    storeSection: 'arenas',
    category: 'arena',
    rarity: 'Epic',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    visualConcept: 'Fortaleza medieval sobre picos montanhosos com muralhas de pedra e torres de vigia sobre nevoeiro alpino.',
    animation: 'Tochas acesas, nevoeiro em movimento e fumo atmosférico.',
    effect: 'Os portões da cidadela abrem-se na apresentação do duelo.',
    bundleDescription: 'Arena + animação de abertura de portões.',
    assetPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    thumbnailPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    previewPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_arn_005',
      stripePriceId: 'price_vip_arn_005',
    }
  },

  // =========================================================================
  // ✨ TIER III — ROYAL IDENTITIES / FRAMES (5 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-FRAME-001',
    name: 'Coroa do Império',
    sku: 'AP-VIP-FRAME-001',
    tier: 3,
    tierName: 'Royal Identities',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Mythic',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    visualConcept: 'Coroa imperial de ouro puro a rodear o avatar com filigrana preciosa e pedras de rubi lapidadas.',
    animation: 'A coroa orbita lentamente em 3D com partículas solares douradas.',
    effect: 'Pulsar dourado ilumina o avatar sempre que o perfil é aberto.',
    bundleDescription: 'Moldura Animada + efeito exclusivo de entrada no perfil.',
    assetPath: '/images/frames/vip/coroa-imperio.webp',
    thumbnailPath: '/images/frames/vip/coroa-imperio.webp',
    previewPath: '/images/frames/vip/coroa-imperio.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_001',
      stripePriceId: 'price_vip_frm_001',
    }
  },
  {
    id: 'AP-VIP-FRAME-002',
    name: 'Portugal de Ouro',
    sku: 'AP-VIP-FRAME-002',
    tier: 3,
    tierName: 'Royal Identities',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Legendary',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    visualConcept: 'Moldura escarlate e dourada integrando as cinco quinas nacionais e motivos manuelinos de navegação.',
    animation: 'Partículas de ouro circulam continuamente pelo contorno da moldura.',
    effect: 'Iluminação subtil durante as transições de ecrã.',
    assetPath: '/images/frames/vip/portugal-ouro.webp',
    thumbnailPath: '/images/frames/vip/portugal-ouro.webp',
    previewPath: '/images/frames/vip/portugal-ouro.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_002',
      stripePriceId: 'price_vip_frm_002',
    }
  },
  {
    id: 'AP-VIP-FRAME-003',
    name: 'Trono Celestial',
    sku: 'AP-VIP-FRAME-003',
    tier: 3,
    tierName: 'Royal Identities',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Legendary',
    priceEUR: 19.99,
    priceCents: 1999,
    currency: 'EUR',
    visualConcept: 'Arco etéreo celeste em torno do avatar, com constelações lusas e energia estelar.',
    animation: 'Estrelas cadentes e partículas cósmicas de baixa velocidade.',
    effect: 'Lampejo estelar etéreo quando equipado.',
    assetPath: '/images/frames/vip/trono-celestial.webp',
    thumbnailPath: '/images/frames/vip/trono-celestial.webp',
    previewPath: '/images/frames/vip/trono-celestial.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-sky-400/80 bg-sky-950/60 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_003',
      stripePriceId: 'price_vip_frm_003',
    }
  },
  {
    id: 'AP-VIP-FRAME-004',
    name: 'Diamante Lusitano',
    sku: 'AP-VIP-FRAME-004',
    tier: 3,
    tierName: 'Royal Identities',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Epic',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    visualConcept: 'Estrutura geométrica de cristal translúcido com facetas cortadas no formato do escudo português.',
    animation: 'Refrações de luz contínuas atravessam os prismas de cristal.',
    effect: 'Flash diamantado ao carregar o perfil.',
    assetPath: '/images/frames/vip/diamante-lusitano.webp',
    thumbnailPath: '/images/frames/vip/diamante-lusitano.webp',
    previewPath: '/images/frames/vip/diamante-lusitano.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-teal-400/80 bg-teal-950/60 text-teal-300 shadow-[0_0_15px_rgba(167,243,208,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_004',
      stripePriceId: 'price_vip_frm_004',
    }
  },
  {
    id: 'AP-VIP-FRAME-005',
    name: 'Fogo do Campeão',
    sku: 'AP-VIP-FRAME-005',
    tier: 3,
    tierName: 'Royal Identities',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Epic',
    priceEUR: 11.99,
    priceCents: 1199,
    currency: 'EUR',
    visualConcept: 'Chamas controladas de alta intensidade abraçam o avatar com faíscas incandescentes.',
    animation: 'Fogo fluido e faíscas vivas a ascender.',
    effect: 'A labareda intensifica-se brevemente após uma vitória.',
    assetPath: '/images/frames/vip/fogo-campeao.webp',
    thumbnailPath: '/images/frames/vip/fogo-campeao.webp',
    previewPath: '/images/frames/vip/fogo-campeao.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-rose-400/80 bg-rose-950/60 text-rose-300 shadow-[0_0_15px_rgba(248,113,113,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_frm_005',
      stripePriceId: 'price_vip_frm_005',
    }
  },

  // =========================================================================
  // 🏅 TIER IV — TITLES OF PRESTIGE (6 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-TITLE-001',
    name: 'Imperador do Desafio',
    sku: 'AP-VIP-TITLE-001',
    tier: 4,
    tierName: 'Titles of Prestige',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Mythic',
    priceEUR: 19.99,
    priceCents: 1999,
    currency: 'EUR',
    visualConcept: 'Tipografia dourada animada com insígnia imperial de topo.',
    animation: 'Brilho metálico cintilante ao longo das letras.',
    effect: 'Título animado surge destacado sob o avatar nos duelos e rankings.',
    assetPath: '/images/titles/vip/imperador-desafio.webp',
    thumbnailPath: '/images/titles/vip/imperador-desafio.webp',
    previewPath: '/images/titles/vip/imperador-desafio.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_001',
      stripePriceId: 'price_vip_ttl_001',
    }
  },
  {
    id: 'AP-VIP-TITLE-002',
    name: 'Campeão Eterno',
    sku: 'AP-VIP-TITLE-002',
    tier: 4,
    tierName: 'Titles of Prestige',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Legendary',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    visualConcept: 'Título de prestígio de campeonato com ícone de taça de platina animada.',
    animation: 'Varredura contínua de luz sobre a tipografia.',
    effect: 'Animação exclusiva de entrada ao iniciar o duelo.',
    assetPath: '/images/titles/vip/campeao-eterno.webp',
    thumbnailPath: '/images/titles/vip/campeao-eterno.webp',
    previewPath: '/images/titles/vip/campeao-eterno.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-blue-400/80 bg-blue-950/60 text-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_002',
      stripePriceId: 'price_vip_ttl_002',
    }
  },
  {
    id: 'AP-VIP-TITLE-003',
    name: 'Lenda de Portugal',
    sku: 'AP-VIP-TITLE-003',
    tier: 4,
    tierName: 'Titles of Prestige',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Legendary',
    priceEUR: 11.99,
    priceCents: 1199,
    currency: 'EUR',
    visualConcept: 'Tipografia real com ornamentos lusitanos e brasão de armas.',
    animation: 'Efeito suave de partículas douradas em torno do texto.',
    effect: 'Apresentação nobre nos duelos e no ranking do distrito.',
    assetPath: '/images/titles/vip/lenda-portugal.webp',
    thumbnailPath: '/images/titles/vip/lenda-portugal.webp',
    previewPath: '/images/titles/vip/lenda-portugal.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_003',
      stripePriceId: 'price_vip_ttl_003',
    }
  },
  {
    id: 'AP-VIP-TITLE-004',
    name: 'Senhor do Desafio',
    sku: 'AP-VIP-TITLE-004',
    tier: 4,
    tierName: 'Titles of Prestige',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Epic',
    priceEUR: 8.99,
    priceCents: 899,
    currency: 'EUR',
    visualConcept: 'Título competitivo de alto impacto com acabamento em bronze e ouro.',
    animation: 'Pulso de energia periódica.',
    effect: 'Destaque tático ao lado do nível do jogador.',
    assetPath: '/images/titles/vip/senhor-desafio.webp',
    thumbnailPath: '/images/titles/vip/senhor-desafio.webp',
    previewPath: '/images/titles/vip/senhor-desafio.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_004',
      stripePriceId: 'price_vip_ttl_004',
    }
  },
  {
    id: 'AP-VIP-TITLE-005',
    name: 'Mestre Lusitano',
    sku: 'AP-VIP-TITLE-005',
    tier: 4,
    tierName: 'Titles of Prestige',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Epic',
    priceEUR: 6.99,
    priceCents: 699,
    currency: 'EUR',
    visualConcept: 'Estética de mestre erudito de Coimbra e capitão das letras portuguesas.',
    animation: 'Reflexo luminoso prateado.',
    effect: 'Inscrição clássica no cartão de perfil.',
    assetPath: '/images/titles/vip/mestre-lusitano.webp',
    thumbnailPath: '/images/titles/vip/mestre-lusitano.webp',
    previewPath: '/images/titles/vip/mestre-lusitano.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_005',
      stripePriceId: 'price_vip_ttl_005',
    }
  },
  {
    id: 'AP-VIP-TITLE-006',
    name: 'Cérebro Nacional',
    sku: 'AP-VIP-TITLE-006',
    tier: 4,
    tierName: 'Titles of Prestige',
    storeSection: 'identities',
    category: 'title',
    rarity: 'Rare',
    priceEUR: 4.99,
    priceCents: 499,
    currency: 'EUR',
    visualConcept: 'Identidade intelectual de prestígio com motivo geométrico luminoso de mente nacional.',
    animation: 'Pequenos pulsos de sinapse estelar.',
    effect: 'Emblema científico subtil ao lado do nome.',
    assetPath: '/images/titles/vip/cerebro-nacional.webp',
    thumbnailPath: '/images/titles/vip/cerebro-nacional.webp',
    previewPath: '/images/titles/vip/cerebro-nacional.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-teal-400/80 bg-teal-950/60 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ttl_006',
      stripePriceId: 'price_vip_ttl_006',
    }
  },

  // =========================================================================
  // 💥 TIER V — CINEMATIC REACTIONS / EMOTES (6 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-EMOTE-001',
    name: 'Coroa-te 👑',
    sku: 'AP-VIP-EMOTE-001',
    tier: 5,
    tierName: 'Cinematic Reactions',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Legendary',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    visualConcept: 'O avatar invoca uma coroa dourada gigante que desce e assenta na cabeça com autoridade.',
    animation: 'A coroa desce dos céus e tranca no lugar com faíscas douradas.',
    effect: 'Explosão de partículas de ouro no ecrã de ambos os jogadores.',
    assetPath: '/images/emotes/vip/coroa-te.webp',
    thumbnailPath: '/images/emotes/vip/coroa-te.webp',
    previewPath: '/images/emotes/vip/coroa-te.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_001',
      stripePriceId: 'price_vip_emt_001',
    }
  },
  {
    id: 'AP-VIP-EMOTE-002',
    name: 'Portugal no Topo 🇵🇹',
    sku: 'AP-VIP-EMOTE-002',
    tier: 5,
    tierName: 'Cinematic Reactions',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Legendary',
    priceEUR: 6.99,
    priceCents: 699,
    currency: 'EUR',
    visualConcept: 'Sequência massiva de celebração patriótica com estandartes e confettis.',
    animation: 'Bandeiras ondulantes e partículas de fogo de artifício.',
    effect: 'Celebração temporária no ecrã de todos os participantes do duelo.',
    assetPath: '/images/emotes/vip/portugal-no-topo.webp',
    thumbnailPath: '/images/emotes/vip/portugal-no-topo.webp',
    previewPath: '/images/emotes/vip/portugal-no-topo.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_002',
      stripePriceId: 'price_vip_emt_002',
    }
  },
  {
    id: 'AP-VIP-EMOTE-003',
    name: 'Acabou.',
    sku: 'AP-VIP-EMOTE-003',
    tier: 5,
    tierName: 'Cinematic Reactions',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Epic',
    priceEUR: 5.99,
    priceCents: 599,
    currency: 'EUR',
    visualConcept: 'Reação dramática no estilo de final boss que sentencia o fim da partida.',
    animation: 'O avatar vira-se para a câmara enquanto o fundo escurece brevemente.',
    effect: 'Flash de impacto dramático no centro da arena.',
    assetPath: '/images/emotes/vip/acabou.webp',
    thumbnailPath: '/images/emotes/vip/acabou.webp',
    previewPath: '/images/emotes/vip/acabou.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-rose-400/80 bg-rose-950/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_003',
      stripePriceId: 'price_vip_emt_003',
    }
  },
  {
    id: 'AP-VIP-EMOTE-004',
    name: 'Mestre Absoluto',
    sku: 'AP-VIP-EMOTE-004',
    tier: 5,
    tierName: 'Cinematic Reactions',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Epic',
    priceEUR: 4.99,
    priceCents: 499,
    currency: 'EUR',
    visualConcept: 'Gesto confiante de vitória de quem não falhou nenhuma pergunta.',
    animation: 'Aura de energia ascende em volta do personagem.',
    effect: 'Aura de campeão breve.',
    assetPath: '/images/emotes/vip/mestre-absoluto.webp',
    thumbnailPath: '/images/emotes/vip/mestre-absoluto.webp',
    previewPath: '/images/emotes/vip/mestre-absoluto.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_004',
      stripePriceId: 'price_vip_emt_004',
    }
  },
  {
    id: 'AP-VIP-EMOTE-005',
    name: 'Nem Acredito',
    sku: 'AP-VIP-EMOTE-005',
    tier: 5,
    tierName: 'Cinematic Reactions',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Epic',
    priceEUR: 3.99,
    priceCents: 399,
    currency: 'EUR',
    visualConcept: 'Surpresa cómica e exagerada após um palpite inesperado que acertou em cheio.',
    animation: 'Reação dramática e bem-humorada do avatar.',
    effect: 'Explosão cómica de pontos de interrogação e exclamação.',
    assetPath: '/images/emotes/vip/nem-acredito.webp',
    thumbnailPath: '/images/emotes/vip/nem-acredito.webp',
    previewPath: '/images/emotes/vip/nem-acredito.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-sky-400/80 bg-sky-950/60 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_005',
      stripePriceId: 'price_vip_emt_005',
    }
  },
  {
    id: 'AP-VIP-EMOTE-006',
    name: 'Respeito. 👑',
    sku: 'AP-VIP-EMOTE-006',
    tier: 5,
    tierName: 'Cinematic Reactions',
    storeSection: 'reactions',
    category: 'emote',
    rarity: 'Rare',
    priceEUR: 3.49,
    priceCents: 349,
    currency: 'EUR',
    visualConcept: 'Saudação refinada de cavalheiro português reconhecendo o mérito do oponente.',
    animation: 'Vénia nobre com mão no coração.',
    effect: 'Rastro subtil de partículas esmeralda.',
    assetPath: '/images/emotes/vip/respeito.webp',
    thumbnailPath: '/images/emotes/vip/respeito.webp',
    previewPath: '/images/emotes/vip/respeito.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(217,119,6,0.5)]',
    providerMapping: {
      stripeProductId: 'prod_vip_emt_006',
      stripePriceId: 'price_vip_emt_006',
    }
  },

  // =========================================================================
  // 😈 TIER VI — ELITE TAUNT PACKS (4 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-TAUNTPACK-001',
    name: 'Realeza Absoluta',
    sku: 'AP-VIP-TAUNTPACK-001',
    tier: 6,
    tierName: 'Elite Taunt Packs',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Mythic',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    visualConcept: '6 provocações reais exclusivas gravadas com autoridade imperial.',
    animation: 'Apresentação visual nobre de pergaminho régio.',
    effect: 'Insígnia real animada acompanha cada frase provocatória.',
    bundleDescription: 'Pack completo com 6 falas reais.',
    assetPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    thumbnailPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    previewPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    taunts: [
      { id: 't_real_1', text: 'Curva-te perante o conhecimento do Rei!', icon: '👑' },
      { id: 't_real_2', text: 'Esta coroa não cai em solo lusitano.', icon: '⚔️' },
      { id: 't_real_3', text: 'Uma resposta digna de plebeu.', icon: '📜' },
      { id: 't_real_4', text: 'O trono de Portugal pertence aos sábios.', icon: '🏰' },
      { id: 't_real_5', text: 'A história curva-se à minha sabedoria!', icon: '⚡' },
      { id: 't_real_6', text: 'Vitória proclamada por decreto régio.', icon: '🇵🇹' }
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_001',
      stripePriceId: 'price_vip_tnt_001',
    }
  },
  {
    id: 'AP-VIP-TAUNTPACK-002',
    name: 'Guerra dos Campeões',
    sku: 'AP-VIP-TAUNTPACK-002',
    tier: 6,
    tierName: 'Elite Taunt Packs',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Legendary',
    priceEUR: 12.99,
    priceCents: 1299,
    currency: 'EUR',
    visualConcept: '6 provocações competitivas desenhadas para duelos intensos 1v1.',
    animation: 'Impacto visual metálico estilo arena.',
    effect: 'Impacto de energia à volta do avatar.',
    bundleDescription: 'Pack de 6 falas de duelo ardente.',
    assetPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    thumbnailPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    previewPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-orange-400/80 bg-orange-950/60 text-orange-300 shadow-[0_0_15px_rgba(234,88,12,0.5)]',
    taunts: [
      { id: 't_guerra_1', text: 'Na arena do Desafio, só um prevalece!', icon: '⚔️' },
      { id: 't_guerra_2', text: 'Erraste no tempo, perdeste o momento!', icon: '⏱️' },
      { id: 't_guerra_3', text: 'Precisas de mais perguntas para me apanhar.', icon: '🛡️' },
      { id: 't_guerra_4', text: 'Conhecimento é poder na ponta da espada.', icon: '🔥' },
      { id: 't_guerra_5', text: 'O meu distrito lidera este combate.', icon: '🇵🇹' },
      { id: 't_guerra_6', text: 'Podes tentar outra vez... amanhã.', icon: '🎯' }
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_002',
      stripePriceId: 'price_vip_tnt_002',
    }
  },
  {
    id: 'AP-VIP-TAUNTPACK-003',
    name: 'Lusitano Implacável',
    sku: 'AP-VIP-TAUNTPACK-003',
    tier: 6,
    tierName: 'Elite Taunt Packs',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Legendary',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    visualConcept: '6 provocações bem-humoradas e tipicamente portuguesas.',
    animation: 'Reações animadas únicas.',
    effect: 'Assinatura visual lusitana.',
    bundleDescription: 'Pack de 6 tiradas do saber popular.',
    assetPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    thumbnailPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    previewPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    taunts: [
      { id: 't_luso_1', text: 'Nem com a Padeira de Aljubarrota lá chegavas!', icon: '🥖' },
      { id: 't_luso_2', text: 'Isso até o Galo de Barcelos sabia!', icon: '🐓' },
      { id: 't_luso_3', text: 'Toma lá um pastel de nata para consolar.', icon: '🥧' },
      { id: 't_luso_4', text: 'Estás a navegar em águas nunca dantes vistas...', icon: '⛵' },
      { id: 't_luso_5', text: 'Portugal não dorme no Desafio Nacional!', icon: '🇵🇹' },
      { id: 't_luso_6', text: 'Foste ao mar perder a caneca!', icon: '🌊' }
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_003',
      stripePriceId: 'price_vip_tnt_003',
    }
  },
  {
    id: 'AP-VIP-TAUNTPACK-004',
    name: 'Final Boss',
    sku: 'AP-VIP-TAUNTPACK-004',
    tier: 6,
    tierName: 'Elite Taunt Packs',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Epic',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    visualConcept: '6 provocações intimidantes e teatrais estilo chefe final.',
    animation: 'Apresentação cinematográfica com sombras.',
    effect: 'Impacto no ecrã com trovoadas escuras.',
    bundleDescription: 'Pack de 6 frases finais.',
    assetPath: '/images/taunts/vip/final-boss/icon.webp',
    thumbnailPath: '/images/taunts/vip/final-boss/icon.webp',
    previewPath: '/images/taunts/vip/final-boss/icon.webp',
    purchaseRules: 'Propriedade permanente. Exclusivo cosmético.',
    badgeColor: 'border-purple-400/80 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    taunts: [
      { id: 't_boss_1', text: 'Chegaste ao chefe final do Acorda Portugal.', icon: '😈' },
      { id: 't_boss_2', text: 'A tua streak acaba exatamente aqui.', icon: '⚡' },
      { id: 't_boss_3', text: 'Pensavas que o topo do ranking era fácil?', icon: '💀' },
      { id: 't_boss_4', text: 'Testaste a lenda e caíste no abismo.', icon: '🔥' },
      { id: 't_boss_5', text: 'Fim de jogo. Game Over!', icon: '🛑' },
      { id: 't_boss_6', text: 'Volta quando estudares mais sobre Portugal.', icon: '📚' }
    ],
    providerMapping: {
      stripeProductId: 'prod_vip_tnt_004',
      stripePriceId: 'price_vip_tnt_004',
    }
  },

  // =========================================================================
  // 💎 TIER VII — COMPLETE PREMIUM SETS (3 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-BUNDLE-001',
    name: 'Conjunto Imperial',
    sku: 'AP-VIP-BUNDLE-001',
    tier: 7,
    tierName: 'Complete Sets',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Mythic',
    priceEUR: 69.99,
    priceCents: 6999,
    currency: 'EUR',
    visualConcept: 'O pacote real absoluto. Reúne o Imperador Lusitano, a Coroa do Império, o título supremo e a celebração régia.',
    animation: 'Ativação simultânea do manto imperial e partículas solares de ouro.',
    effect: 'Quando equipados todos os componentes, o perfil ativa a Apresentação Imperial Completa.',
    bundleDescription: 'Inclui: Avatar Imperador Lusitano + Moldura Coroa do Império + Título Imperador do Desafio + Emote Coroa-Te + Efeito de Vitória Imperial.',
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-EMOTE-001'
    ],
    assetPath: '/bundles/vip/imperial/banner.webp',
    thumbnailPath: '/bundles/vip/imperial/banner.webp',
    previewPath: '/bundles/vip/imperial/banner.webp',
    purchaseRules: 'Propriedade permanente. Os componentes individuais são automaticamente entregues ao inventário.',
    badgeColor: 'border-yellow-400/80 bg-yellow-950/60 text-yellow-300 shadow-[0_0_20px_rgba(255,215,0,0.6)]',
    providerMapping: {
      stripeProductId: 'prod_vip_bnd_001',
      stripePriceId: 'price_vip_bnd_001',
    }
  },
  {
    id: 'AP-VIP-BUNDLE-002',
    name: 'Conjunto Campeão Eterno',
    sku: 'AP-VIP-BUNDLE-002',
    tier: 7,
    tierName: 'Complete Sets',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Mythic',
    priceEUR: 79.99,
    priceCents: 7999,
    currency: 'EUR',
    visualConcept: 'Identidade visual completa de campeão indiscutível. O auge do prestígio competitivo.',
    animation: 'Refrações prismáticas e varrimento de luz com aura de triunfo.',
    effect: 'Identidade visual de campeão completa em todas as partidas.',
    bundleDescription: 'Inclui: Moldura Diamante Lusitano + Título Campeão Eterno + Emote Mestre Absoluto + Entrada e Efeito de Vitória do Campeonato.',
    bundleComponents: [
      'AP-VIP-FRAME-004',
      'AP-VIP-TITLE-002',
      'AP-VIP-EMOTE-004'
    ],
    assetPath: '/bundles/vip/campeao-eterno/banner.webp',
    thumbnailPath: '/bundles/vip/campeao-eterno/banner.webp',
    previewPath: '/bundles/vip/campeao-eterno/banner.webp',
    purchaseRules: 'Propriedade permanente. Todos os componentes entregues individualmente.',
    badgeColor: 'border-blue-400/80 bg-blue-950/60 text-blue-300 shadow-[0_0_20px_rgba(96,165,250,0.6)]',
    providerMapping: {
      stripeProductId: 'prod_vip_bnd_002',
      stripePriceId: 'price_vip_bnd_002',
    }
  },
  {
    id: 'AP-VIP-BUNDLE-003',
    name: 'Conjunto Lusitano Supremo',
    sku: 'AP-VIP-BUNDLE-003',
    tier: 7,
    tierName: 'Complete Sets',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Legendary',
    priceEUR: 59.99,
    priceCents: 5999,
    currency: 'EUR',
    visualConcept: 'Homenagem vibrante a Portugal com o Navegador Eterno, moldura de ouro e taunts lusas.',
    animation: 'Ondulação dourada e verde com efeitos marítimos.',
    effect: 'Efeito ambiental lusitano completo no perfil.',
    bundleDescription: 'Inclui: Avatar Navegador Eterno + Moldura Portugal de Ouro + Título Lenda de Portugal + Emote Portugal no Topo + Taunt Pack Lusitano Implacável.',
    bundleComponents: [
      'AP-VIP-SIGNATURE-003',
      'AP-VIP-FRAME-002',
      'AP-VIP-TITLE-003',
      'AP-VIP-EMOTE-002',
      'AP-VIP-TAUNTPACK-003'
    ],
    assetPath: '/bundles/vip/lusitano-supremo/banner.webp',
    thumbnailPath: '/bundles/vip/lusitano-supremo/banner.webp',
    previewPath: '/bundles/vip/lusitano-supremo/banner.webp',
    purchaseRules: 'Propriedade permanente. Desempacotamento automático no inventário.',
    badgeColor: 'border-emerald-400/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    providerMapping: {
      stripeProductId: 'prod_vip_bnd_003',
      stripePriceId: 'price_vip_bnd_003',
    }
  },

  // =========================================================================
  // 👑 TIER VIII — THE CROWN JEWELS / ULTIMATE (5 Itens)
  // =========================================================================
  {
    id: 'AP-VIP-ULTIMATE-001',
    name: 'Identidade do Campeão',
    sku: 'AP-VIP-ULTIMATE-001',
    tier: 8,
    tierName: 'The Crown Jewels',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    priceEUR: 89.99,
    priceCents: 8999,
    currency: 'EUR',
    visualConcept: 'A identidade definitiva de campeão do Acorda Portugal.',
    animation: 'Apresentação cinematográfica completa do jogador.',
    effect: 'Aura única de campeão no perfil, no lobby e nos resultados.',
    bundleDescription: 'Contém: Avatar Ultimate + Moldura Ultimate + Título Ultimate + Entrada cinematográfica + Vitória + Badge exclusivo + Emote exclusivo.',
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-EMOTE-001'
    ],
    assetPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    thumbnailPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    previewPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    purchaseRules: 'Propriedade permanente. Nunca concede vantagens competitivas.',
    badgeColor: 'border-amber-400/90 bg-amber-950/70 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.7)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_001',
      stripePriceId: 'price_vip_ult_001',
    }
  },
  {
    id: 'AP-VIP-ULTIMATE-002',
    name: 'Senhor de Portugal',
    sku: 'AP-VIP-ULTIMATE-002',
    tier: 8,
    tierName: 'The Crown Jewels',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    priceEUR: 99.99,
    priceCents: 9999,
    currency: 'EUR',
    visualConcept: 'A identidade de temática portuguesa mais imponente e régia de todo o jogo.',
    animation: 'Entrada cinematográfica de vários segundos com botão de skip opcional.',
    effect: 'Apresentação real total com fanfarras em duelo.',
    bundleDescription: 'Contém: Avatar exclusivo + Moldura animada + Título + Arena exclusiva + Entrada + Sequência de vitória + Emote + Badge.',
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-ARENA-ULTIMATE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-EMOTE-001'
    ],
    assetPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    thumbnailPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    previewPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    purchaseRules: 'Edição limitada. Após o encerramento da janela, deixa de ser vendido diretamente.',
    isLimited: true,
    stock: 50,
    badgeColor: 'border-pink-400/90 bg-pink-950/70 text-pink-200 shadow-[0_0_25px_rgba(236,72,153,0.7)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_002',
      stripePriceId: 'price_vip_ult_002',
    }
  },
  {
    id: 'AP-VIP-ULTIMATE-003',
    name: 'Trono do Desafio',
    sku: 'AP-VIP-ULTIMATE-003',
    tier: 8,
    tierName: 'The Crown Jewels',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    priceEUR: 99.99,
    priceCents: 9999,
    currency: 'EUR',
    visualConcept: 'Pacote de status lendário centrado no mítico Trono Supremo do Campeão.',
    animation: 'Introdução de partida real completa e celebração monumental de encerramento.',
    effect: 'O jogador vitorioso recebe apresentação régia no trono com o seu avatar em destaque.',
    bundleDescription: 'Contém: Arena Trono Supremo + Avatar do Campeão + Moldura Real + Título + Emote Real + Cinemática de Vitória.',
    bundleComponents: [
      'AP-VIP-ARENA-ULTIMATE-001',
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-EMOTE-001'
    ],
    assetPath: '/ultimate/vip/trono-desafio/showcase.webp',
    thumbnailPath: '/ultimate/vip/trono-desafio/showcase.webp',
    previewPath: '/ultimate/vip/trono-desafio/showcase.webp',
    purchaseRules: 'Propriedade permanente. Cosmético exclusivo.',
    badgeColor: 'border-purple-400/90 bg-purple-950/70 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.7)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_003',
      stripePriceId: 'price_vip_ult_003',
    }
  },
  {
    id: 'AP-VIP-ULTIMATE-004',
    name: 'Legenda Nacional',
    sku: 'AP-VIP-ULTIMATE-004',
    tier: 8,
    tierName: 'The Crown Jewels',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    priceEUR: 119.99,
    priceCents: 11999,
    currency: 'EUR',
    visualConcept: 'Identidade premium completa que representa o escalão mais elevado de prestígio no Acorda Portugal.',
    animation: 'Apresentação cinematográfica única em todo o perfil e fluxo competitivo.',
    effect: 'Pacote visual completo de prestígio com partículas celestiais contínuas.',
    bundleDescription: 'Contém: Avatar lendário + Arena exclusiva + Moldura + Título + Emote + Taunt pack + Entrada + Animação de vitória + Badge de perfil.',
    bundleComponents: [
      'AP-VIP-SIGNATURE-002',
      'AP-VIP-ARENA-ULTIMATE-002',
      'AP-VIP-FRAME-002',
      'AP-VIP-TITLE-003',
      'AP-VIP-EMOTE-002',
      'AP-VIP-TAUNTPACK-003'
    ],
    assetPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    thumbnailPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    previewPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    purchaseRules: 'Edição limitada. Quantidade máxima configurável no servidor. Sem vantagens de jogo.',
    isLimited: true,
    stock: 25,
    badgeColor: 'border-sky-400/90 bg-sky-950/70 text-sky-200 shadow-[0_0_25px_rgba(2,132,199,0.7)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_004',
      stripePriceId: 'price_vip_ult_004',
    }
  },
  {
    id: 'AP-VIP-ULTIMATE-005',
    name: 'O Último Desafio',
    sku: 'AP-VIP-ULTIMATE-005',
    tier: 8,
    tierName: 'The Crown Jewels',
    storeSection: 'ultimate',
    category: 'ultimate',
    rarity: 'Mythic',
    priceEUR: 149.99,
    priceCents: 14999,
    currency: 'EUR',
    visualConcept: 'O colecionável supremo do universo Acorda Portugal. Personagem completamente original, arena exclusiva, moldura animada inconfundível e apresentação que transcende qualquer outro item da loja.',
    animation: 'Apresentação cinematográfica épica de entrada e vitória personalizada.',
    effect: 'O sistema visual Ultimate completo ativa-se quando a coleção é equipada.',
    bundleDescription: 'Contém: Avatar exclusivo + Arena exclusiva + Moldura animada + Título + Emote + Taunt Pack + Cinemática de entrada + Cinemática de vitória + Badge de perfil + Número de coleção exclusivo.',
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-SIGNATURE-002',
      'AP-VIP-ARENA-ULTIMATE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-EMOTE-001',
      'AP-VIP-TAUNTPACK-001'
    ],
    assetPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    thumbnailPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    previewPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    purchaseRules: 'Edição Fundador Limitada. Quantidade controlada pelo servidor. Atribuição de número de coleção único após transação (#001 a #010). Quando esgota, o botão altera para ESGOTADO.',
    isLimited: true,
    stock: 10,
    collectionNumber: 1,
    badgeColor: 'border-rose-400/95 bg-rose-950/80 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.8)]',
    providerMapping: {
      stripeProductId: 'prod_vip_ult_005',
      stripePriceId: 'price_vip_ult_005',
    }
  }
]

// Mapeamento de aliases legados para suportar utilizadores antigos
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
}

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
