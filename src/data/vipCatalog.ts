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
    name: 'Soberano de Ourique',
    tier: 1,
    tierName: 'Signature VIP',
    storeSection: 'signature',
    category: 'avatar',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'SÉRIE FUNDADOR',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    description: 'O avatar que encarna a fundação de Portugal. Uma presença que comanda respeito em cada duelo.',
    visualConcept: 'Soberano fundador do reino de Portugal, vestido com manto real carmesim e armadura manuelina de ouro, ostentando o escudo das quinas com orgulho imponente.',
    animation: 'Respiração majestosa com movimento subtil do manto, brilho pulsante nas quinas do escudo e entrada solene a cavalo no início do duelo.',
    effect: 'Aura dourada real surge brevemente ao entrar em duelo, com partículas do brasão das quinas.',
    visualEffectsList: [
      'Aura dourada de entrada',
      'Partículas das quinas portuguesas',
      'Brilho pulsante no escudo',
      'Manto animado em movimento',
    ],
    lobbyAnimation: 'Manto ondulante com halo dourado subtil',
    duelIntroSound: 'fanfarra-real',
    profileBadge: 'SOBERANO',
    bundleDescription: 'Avatar exclusivo + animação de entrada + pose de vitória + badge de perfil "SOBERANO".',
    assetPath: '/images/avatars/vip/signature/soberano-ourique.webp',
    thumbnailPath: '/images/avatars/vip/signature/soberano-ourique.webp',
    previewPath: '/images/avatars/vip/signature/soberano-ourique.webp',
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
    name: 'Dragão de Viriato',
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
    description: 'O espírito indomável do guerreiro lusitano que nunca curvou a espada. Uma identidade que intimida.',
    visualConcept: 'Guerreiro lusitano inspirado na figura mítica de Viriato, com armadura de ferro e motivos draconianos, escamas reluzentes e olhos de fogo ancestral.',
    animation: 'Fumo subtil a emergir dos ombros, rugido silencioso de dragão e movimento das escamas na entrada do duelo.',
    effect: 'Chamas draconianas surgem no chão ao entrar em duelo, evaporando lentamente.',
    visualEffectsList: [
      'Chamas draconianas de entrada',
      'Fumo subtil nos ombros',
      'Escamas animadas em movimento',
      'Olhos incandescentes no perfil',
    ],
    lobbyAnimation: 'Fumo discreto com brilho de brasa',
    profileBadge: 'DRAGÃO',
    bundleDescription: 'Avatar exclusivo + animação de entrada + animação de vitória + badge "DRAGÃO".',
    assetPath: '/images/avatars/vip/signature/dragao-viriato.webp',
    thumbnailPath: '/images/avatars/vip/signature/dragao-viriato.webp',
    previewPath: '/images/avatars/vip/signature/dragao-viriato.webp',
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
    name: 'Navegador dos Descobrimentos',
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
    description: 'O explorador dos mares que levou Portugal ao limite do mundo conhecido. Uma identidade de pioneiro.',
    visualConcept: 'Capitão explorador da era dos Descobrimentos com vestes cerimoniais e astrolábio cintilante, manto atlântico e bússola animada.',
    animation: 'O astrolábio roda lentamente; o manto e a bússola movem-se ao ritmo do vento atlântico.',
    effect: 'Efeito de bússola oceânica surge em torno do avatar na apresentação do duelo.',
    visualEffectsList: [
      'Bússola animada em rotação',
      'Manto atlântico flutuante',
      'Astrolábio cintilante',
      'Estrelas de navegação subtis',
    ],
    lobbyAnimation: 'Astrolábio em rotação subtil com brilho de estrela',
    profileBadge: 'NAVEGADOR',
    bundleDescription: 'Avatar exclusivo + entrada animada + badge "NAVEGADOR".',
    assetPath: '/images/avatars/vip/signature/navegador-descobrimentos.webp',
    thumbnailPath: '/images/avatars/vip/signature/navegador-descobrimentos.webp',
    previewPath: '/images/avatars/vip/signature/navegador-descobrimentos.webp',
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
    name: 'Guardião das Quinas',
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
    visualConcept: 'Paladino de elite com armadura monumental, escudo com as quinas de Portugal em relevo e padrões de luz lusitana a irradiar da armadura.',
    animation: 'O escudo ergue-se subtilmente em repouso; a armadura reflete luz dinâmica ao entrar no duelo.',
    effect: 'Anel de energia defensiva manifesta-se durante a apresentação do duelo.',
    visualEffectsList: [
      'Anel de energia defensiva',
      'Escudo animado com quinas',
      'Reflexos de luz na armadura',
    ],
    lobbyAnimation: 'Escudo com pulso de energia subtil',
    profileBadge: 'GUARDIÃO',
    bundleDescription: 'Avatar exclusivo + animação de entrada + badge "GUARDIÃO".',
    assetPath: '/images/avatars/vip/signature/guardiao-quinas.webp',
    thumbnailPath: '/images/avatars/vip/signature/guardiao-quinas.webp',
    previewPath: '/images/avatars/vip/signature/guardiao-quinas.webp',
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
    name: 'Trono do Primeiro Reino',
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
    description: 'A arena suprema: o trono onde o primeiro rei de Portugal proclamou o reino. Uma edição limitada a 50 unidades numeradas.',
    visualConcept: 'Trono real imenso sobre uma arena de duelo com arquitetura dourada manuelina, estandartes do Primeiro Reino e assistência de estádio em apoteose patriótica.',
    animation: 'Estandartes reais esvoaçando, partículas atmosféricas douradas, iluminação dinâmica do trono e entrada cinematográfica com fanfarra.',
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
    profileBadge: 'PRIMEIRO REINO',
    bundleDescription: 'Arena exclusiva + sequência cinematográfica de entrada + efeito de vitória real + badge numerado #XX/50.',
    assetPath: '/arenas/vip/ultimate/trono-primeiro-reino.webp',
    thumbnailPath: '/arenas/vip/ultimate/trono-primeiro-reino.webp',
    previewPath: '/arenas/vip/ultimate/trono-primeiro-reino.webp',
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
    name: 'Palácio dos Descobrimentos',
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
    description: 'O paço real de onde partiam os navegadores para os confins do mundo. Uma arena de glória histórica.',
    visualConcept: 'Palácio manuelino luxuoso transformado em arena de duelo, com mármores nobres, azulejos históricos e frescos das grandes viagens marítimas.',
    animation: 'Chamas de tocheiros, mapas-múndi animados nas paredes e entrada com fanfarra suave dos Descobrimentos.',
    effect: 'Explosão de luz real no ecrã após o triunfo final, acompanhada de partículas náuticas.',
    visualEffectsList: [
      'Explosão de luz dourada na vitória',
      'Tocheiros animados nas paredes',
      'Partículas de mapas históricos',
      'Azulejos com brilho suave',
    ],
    bundleDescription: 'Arena + entrada real + efeito de vitória náutico.',
    assetPath: '/arenas/vip/ultimate/palacio-descobrimentos.webp',
    thumbnailPath: '/arenas/vip/ultimate/palacio-descobrimentos.webp',
    previewPath: '/arenas/vip/ultimate/palacio-descobrimentos.webp',
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
    name: 'Campo de Aljubarrota',
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
    description: 'O campo onde Portugal ganhou a sua independência para sempre. Uma arena de honra eterna.',
    visualConcept: 'Campo de batalha de Aljubarrota transformado em arena de duelo, com estandartes medievais e muralhas de pedra sob um céu épico.',
    animation: 'Movimento de bandeiras medievais, poeira sutil da batalha e holofotes em varrimento.',
    effect: 'Vitória ativa celebração histórica com fogo de artifício e estandartes das quinas.',
    visualEffectsList: [
      'Fogo de artifício de vitória',
      'Bandeiras medievais animadas',
      'Poeira atmosférica',
      'Estandartes das quinas',
    ],
    bundleDescription: 'Arena + efeito de vitória épico.',
    assetPath: '/arenas/vip/ultimate/campo-aljubarrota.webp',
    thumbnailPath: '/arenas/vip/ultimate/campo-aljubarrota.webp',
    previewPath: '/arenas/vip/ultimate/campo-aljubarrota.webp',
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
    name: 'Castelo de Guimarães',
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
    description: 'O berço de Portugal. Uma arena nascida no coração histórico da nação.',
    visualConcept: 'Castelo de Guimarães com pedra medieval iluminada por tochas e a paisagem mítica do berço da nação ao fundo.',
    animation: 'Tochas acesas e cintilantes, nevoeiro de manhã a dissipar-se e sinos ao longe.',
    effect: 'Os portões do castelo abrem-se com dramatismo na apresentação do duelo.',
    visualEffectsList: [
      'Portões animados a abrir',
      'Tochas com chamas reais',
      'Nevoeiro matinal',
    ],
    bundleDescription: 'Arena + animação de abertura de portões.',
    assetPath: '/arenas/vip/ultimate/castelo-guimaraes.webp',
    thumbnailPath: '/arenas/vip/ultimate/castelo-guimaraes.webp',
    previewPath: '/arenas/vip/ultimate/castelo-guimaraes.webp',
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
    name: 'Muralhas do Além-Tejo',
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
    description: 'Fortaleza medieval do Alentejo, erguida em pedra calcária sobre planícies douradas ao pôr do sol.',
    visualConcept: 'Muralhas medievais do Alentejo sobre planícies douradas, com torres de vigia e pôr do sol laranja e vermelho ao fundo.',
    animation: 'Tochas acesas nas muralhas, andorinhas a voar ao entardecer e vento suave na vegetação.',
    effect: 'Entrada dramática com portão medieval a abrir lentamente.',
    visualEffectsList: [
      'Portão animado',
      'Tochas nas muralhas',
      'Pôr do sol atmosférico',
      'Andorinhas em voo',
    ],
    bundleDescription: 'Arena + animação de portão medieval.',
    assetPath: '/arenas/vip/ultimate/muralhas-alem-tejo.webp',
    thumbnailPath: '/arenas/vip/ultimate/muralhas-alem-tejo.webp',
    previewPath: '/arenas/vip/ultimate/muralhas-alem-tejo.webp',
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
    name: 'Ordem de Cristo',
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
    description: 'A moldura mais icónica da coleção: a cruz templária da Ordem de Cristo que guiou os navegadores.',
    visualConcept: 'Cruz da Ordem de Cristo em ouro maciço a rodear o avatar, com filigrana preciosa, rubis lapidados e brilho celestial.',
    animation: 'A cruz orbita lentamente em 3D com partículas solares douradas e brilho pulsante.',
    effect: 'Pulsar dourado da cruz ilumina o avatar sempre que o perfil é aberto.',
    visualEffectsList: [
      'Cruz a orbitar em 3D',
      'Partículas solares douradas',
      'Pulso dourado no perfil',
      'Brilho pulsante permanente',
      'Aura celestial na entrada',
    ],
    lobbyAnimation: 'Cruz com halo dourado e partículas',
    profileBadge: 'ORDEM DE CRISTO',
    bundleDescription: 'Moldura animada exclusiva + efeito de perfil + badge numerado #XX/200.',
    assetPath: '/images/frames/vip/ordem-de-cristo.webp',
    thumbnailPath: '/images/frames/vip/ordem-de-cristo.webp',
    previewPath: '/images/frames/vip/ordem-de-cristo.webp',
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
    name: 'Quinas Reais de Portugal',
    tier: 3,
    tierName: 'Molduras Reais',
    storeSection: 'identities',
    category: 'frame',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    description: 'As cinco quinas do escudo de Portugal, animadas em ouro e carmesim, circundando o avatar com história.',
    visualConcept: 'Moldura escarlate e dourada integrando as cinco quinas nacionais e motivos manuelinos de navegação, com filigrana portuguesa.',
    animation: 'Partículas de ouro circulam continuamente pelo contorno da moldura com ritmo natural.',
    effect: 'Iluminação subtil em dourado e vermelho durante as transições de ecrã.',
    visualEffectsList: [
      'Partículas de ouro em circuito',
      'Iluminação de transição',
      'Quinas animadas com brilho',
    ],
    lobbyAnimation: 'Partículas douradas subtis no contorno',
    profileBadge: 'QUINAS REAIS',
    assetPath: '/images/frames/vip/quinas-reais-portugal.webp',
    thumbnailPath: '/images/frames/vip/quinas-reais-portugal.webp',
    previewPath: '/images/frames/vip/quinas-reais-portugal.webp',
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
    name: 'Constelação dos Navegadores',
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
    description: 'O mapa estelar que guiou os navegadores portugueses pelos oceanos. Uma moldura de sabedoria cósmica lusitana.',
    visualConcept: 'Arco etéreo celeste em torno do avatar, com constelações lusas e linhas de energia estelar que evocam as rotas marítimas dos Descobrimentos.',
    animation: 'Estrelas cadentes e partículas cósmicas de baixa velocidade, com constelações a aparecer gradualmente.',
    effect: 'Lampejo estelar suave quando o perfil é carregado.',
    visualEffectsList: [
      'Estrelas cadentes',
      'Constelações animadas',
      'Partículas cósmicas',
      'Lampejo estelar no perfil',
    ],
    profileBadge: 'NAVEGADOR ESTELAR',
    assetPath: '/images/frames/vip/constelacao-navegadores.webp',
    thumbnailPath: '/images/frames/vip/constelacao-navegadores.webp',
    previewPath: '/images/frames/vip/constelacao-navegadores.webp',
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
    name: 'Azulejo Dourado',
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
    assetPath: '/images/frames/vip/azulejo-dourado.webp',
    thumbnailPath: '/images/frames/vip/azulejo-dourado.webp',
    previewPath: '/images/frames/vip/azulejo-dourado.webp',
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
    name: 'Calçada da Glória',
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
    description: 'A calçada portuguesa animada — símbolo de Lisboa e da identidade nacional — a contornar o teu avatar.',
    visualConcept: 'Padrões geométricos da calçada portuguesa em pedra negra e branca, animados com brilho subtil como luz ao entardecer.',
    animation: 'Padrões de calçada a animar-se subtilmente com luz a reflectir.',
    effect: 'Brilho de calçada ao sol visível nas bordas do avatar.',
    visualEffectsList: [
      'Padrões de calçada animados',
      'Reflexo de luz ao entardecer',
    ],
    assetPath: '/images/frames/vip/calcada-gloria.webp',
    thumbnailPath: '/images/frames/vip/calcada-gloria.webp',
    previewPath: '/images/frames/vip/calcada-gloria.webp',
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
    name: 'Imperador de Portugal',
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
    assetPath: '/images/titles/vip/imperador-portugal.webp',
    thumbnailPath: '/images/titles/vip/imperador-portugal.webp',
    previewPath: '/images/titles/vip/imperador-portugal.webp',
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
    name: 'Lenda da Nação',
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
    assetPath: '/images/titles/vip/lenda-nacao.webp',
    thumbnailPath: '/images/titles/vip/lenda-nacao.webp',
    previewPath: '/images/titles/vip/lenda-nacao.webp',
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
    name: 'Cavaleiro de Aljubarrota',
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
    assetPath: '/images/titles/vip/cavaleiro-aljubarrota.webp',
    thumbnailPath: '/images/titles/vip/cavaleiro-aljubarrota.webp',
    previewPath: '/images/titles/vip/cavaleiro-aljubarrota.webp',
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
    name: 'Mestre dos Saberes',
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
    assetPath: '/images/titles/vip/mestre-saberes.webp',
    thumbnailPath: '/images/titles/vip/mestre-saberes.webp',
    previewPath: '/images/titles/vip/mestre-saberes.webp',
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
    name: 'Filho da Lusitânia',
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
    assetPath: '/images/titles/vip/filho-lusitania.webp',
    thumbnailPath: '/images/titles/vip/filho-lusitania.webp',
    previewPath: '/images/titles/vip/filho-lusitania.webp',
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
    name: 'Cidadão de Honra',
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
    assetPath: '/images/titles/vip/cidadao-honra.webp',
    thumbnailPath: '/images/titles/vip/cidadao-honra.webp',
    previewPath: '/images/titles/vip/cidadao-honra.webp',
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
    name: 'A Coroa Desce 👑',
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
    assetPath: '/images/emotes/vip/coroa-desce.webp',
    thumbnailPath: '/images/emotes/vip/coroa-desce.webp',
    previewPath: '/images/emotes/vip/coroa-desce.webp',
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
    name: 'Orgulho Português 🇵🇹',
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
    assetPath: '/images/emotes/vip/orgulho-portugues.webp',
    thumbnailPath: '/images/emotes/vip/orgulho-portugues.webp',
    previewPath: '/images/emotes/vip/orgulho-portugues.webp',
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
    name: 'A Sentença.',
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
    assetPath: '/images/emotes/vip/a-sentenca.webp',
    thumbnailPath: '/images/emotes/vip/a-sentenca.webp',
    previewPath: '/images/emotes/vip/a-sentenca.webp',
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
    name: 'Salva do Vencedor',
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
    assetPath: '/images/emotes/vip/salva-vencedor.webp',
    thumbnailPath: '/images/emotes/vip/salva-vencedor.webp',
    previewPath: '/images/emotes/vip/salva-vencedor.webp',
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
    name: 'Vénia do Cavaleiro 🤝',
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
    assetPath: '/images/emotes/vip/venia-cavaleiro.webp',
    thumbnailPath: '/images/emotes/vip/venia-cavaleiro.webp',
    previewPath: '/images/emotes/vip/venia-cavaleiro.webp',
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
    tierName: 'Packs de Provocação de Elite',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 14.99,
    priceCents: 1499,
    currency: 'EUR',
    description: '6 provocações reais exclusivas gravadas com autoridade imperial. Para os que reinam nos duelos.',
    visualConcept: '6 falas reais com apresentação visual nobre de pergaminho régio animado.',
    animation: 'Insígnia real animada acompanha cada frase provocatória.',
    effect: 'Badge real animado ao usar qualquer frase do pack.',
    visualEffectsList: [
      'Insígnia real animada',
      'Pergaminho régio',
      'Badge dourado de confirmação',
    ],
    bundleDescription: 'Pack completo com 6 provocações reais exclusivas.',
    assetPath: '/images/tauntpacks/vip/realeza-absoluta.webp',
    thumbnailPath: '/images/tauntpacks/vip/realeza-absoluta.webp',
    previewPath: '/images/tauntpacks/vip/realeza-absoluta.webp',
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
    name: 'Duelos de Campeões',
    tier: 6,
    tierName: 'Packs de Provocação de Elite',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 12.99,
    priceCents: 1299,
    currency: 'EUR',
    description: '6 provocações competitivas forjadas nos duelos mais intensos do Desafio Nacional.',
    visualConcept: '6 falas de arena com impacto visual metálico estilo arena de combate.',
    animation: 'Impacto de energia à volta do avatar ao usar cada fala.',
    effect: 'Onda de energia ao usar qualquer provocação do pack.',
    visualEffectsList: [
      'Impacto de energia',
      'Onda de choque ao usar fala',
    ],
    bundleDescription: 'Pack de 6 falas de duelo ardente.',
    assetPath: '/images/tauntpacks/vip/duelos-campeoes.webp',
    thumbnailPath: '/images/tauntpacks/vip/duelos-campeoes.webp',
    previewPath: '/images/tauntpacks/vip/duelos-campeoes.webp',
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
    tierName: 'Packs de Provocação de Elite',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 9.99,
    priceCents: 999,
    currency: 'EUR',
    description: '6 provocações bem-humoradas e tipicamente portuguesas. Para os que sabem ganhar com um sorriso.',
    visualConcept: '6 tiradas do saber popular português com reações animadas únicas.',
    animation: 'Assinatura visual lusitana com toque bem-humorado.',
    effect: 'Reações animadas únicas para cada fala.',
    visualEffectsList: [
      'Reações únicas por fala',
      'Assinatura lusitana',
    ],
    bundleDescription: 'Pack de 6 tiradas do saber popular.',
    assetPath: '/images/tauntpacks/vip/lusitano-implacavel.webp',
    thumbnailPath: '/images/tauntpacks/vip/lusitano-implacavel.webp',
    previewPath: '/images/tauntpacks/vip/lusitano-implacavel.webp',
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
    tierName: 'Packs de Provocação de Elite',
    storeSection: 'taunts',
    category: 'tauntpack',
    rarity: 'Epic',
    rarityBadge: 'COLEÇÃO EXCLUSIVA',
    prestigeTier: 'ÉPICO',
    profileBannerTag: 'VIP EXCLUSIVO',
    priceEUR: 7.99,
    priceCents: 799,
    currency: 'EUR',
    description: '6 provocações intimidantes e teatrais. Para os que aparecem no final de todos os duelos.',
    visualConcept: '6 frases de final boss com apresentação cinematográfica de sombras.',
    animation: 'Sombras dramáticas acompanham cada fala com trovoada subtil.',
    effect: 'Impacto no ecrã com trovoadas escuras ao usar qualquer fala.',
    visualEffectsList: [
      'Trovoadas escuras',
      'Sombras dramáticas',
    ],
    bundleDescription: 'Pack de 6 frases finais de chefe.',
    assetPath: '/images/tauntpacks/vip/o-chefe-final.webp',
    thumbnailPath: '/images/tauntpacks/vip/o-chefe-final.webp',
    previewPath: '/images/tauntpacks/vip/o-chefe-final.webp',
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
    name: 'A Coroa de Portugal',
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
    assetPath: '/bundles/vip/coroa-portugal/banner.webp',
    thumbnailPath: '/bundles/vip/coroa-portugal/banner.webp',
    previewPath: '/bundles/vip/coroa-portugal/banner.webp',
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
    name: 'Legado dos Descobrimentos',
    tier: 7,
    tierName: 'Coleções Completas',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 29.99,
    priceCents: 2999,
    currency: 'EUR',
    description: 'Homenagem completa à era que colocou Portugal no mapa do mundo. Uma identidade de pioneiro.',
    visualConcept: 'Identidade visual completa inspirada na era dos Descobrimentos, com avatar navegador, moldura estelar e arena histórica.',
    animation: 'Ondulação azul-oceano com efeitos marítimos e constelações de navegação.',
    effect: 'Efeito ambiental marítimo completo no perfil quando tudo é equipado.',
    visualEffectsList: [
      'Efeito marítimo no perfil',
      'Constelações de navegação',
      'Ondas atlânticas subtis',
    ],
    bundleDescription: `Inclui:
✓ Avatar "Navegador dos Descobrimentos"
✓ Moldura "Constelação dos Navegadores"
✓ Título "Lenda da Nação"
✓ Emote "Orgulho Português"
✓ Pack de Provocação "Lusitano Implacável"`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-003',
      'AP-VIP-FRAME-003',
      'AP-VIP-TITLE-002',
      'AP-VIP-EMOTE-002',
      'AP-VIP-TAUNTPACK-003',
    ],
    assetPath: '/bundles/vip/legado-descobrimentos/banner.webp',
    thumbnailPath: '/bundles/vip/legado-descobrimentos/banner.webp',
    previewPath: '/bundles/vip/legado-descobrimentos/banner.webp',
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
    name: 'Honra Lusitana',
    tier: 7,
    tierName: 'Coleções Completas',
    storeSection: 'bundles',
    category: 'bundle',
    rarity: 'Legendary',
    rarityBadge: 'EDIÇÃO LENDÁRIA',
    prestigeTier: 'LENDÁRIO',
    profileBannerTag: 'COLEÇÃO EXCLUSIVA',
    priceEUR: 24.99,
    priceCents: 2499,
    currency: 'EUR',
    description: 'O bundle de acesso ao universo VIP. Qualidade premium a um preço pensado para todos.',
    visualConcept: 'Conjunto equilibrado com avatar guerreiro, moldura das quinas e provocações de campeão.',
    animation: 'Aura verde lusitana com brilho patriótico.',
    effect: 'Efeito patriótico verde e vermelho quando o bundle completo é equipado.',
    visualEffectsList: [
      'Aura verde lusitana',
      'Brilho patriótico',
    ],
    bundleDescription: `Inclui:
✓ Avatar "Guardião das Quinas"
✓ Moldura "Azulejo Dourado"
✓ Título "Cavaleiro de Aljubarrota"
✓ Pack de Provocação "Duelos de Campeões"`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-004',
      'AP-VIP-FRAME-004',
      'AP-VIP-TITLE-003',
      'AP-VIP-TAUNTPACK-002',
    ],
    assetPath: '/bundles/vip/honra-lusitana/banner.webp',
    thumbnailPath: '/bundles/vip/honra-lusitana/banner.webp',
    previewPath: '/bundles/vip/honra-lusitana/banner.webp',
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
    name: 'Portugal Imortal',
    tier: 8,
    tierName: 'Coroas de Colecionador',
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
    description: 'O colecionável supremo do universo Acorda Portugal. Apenas 25 unidades numeradas no mundo. Uma peça única.',
    visualConcept: 'A identidade definitiva do Acorda Portugal — personagem original único, arena exclusiva, moldura inconfundível. Uma obra de arte interativa.',
    animation: 'Apresentação cinematográfica épica com entrada e vitória personalizada exclusiva.',
    effect: 'O sistema visual Ultimate completo ativa-se quando a coleção é equipada, com aura única nunca vista noutros itens.',
    visualEffectsList: [
      'Cinemática de entrada exclusiva',
      'Aura única de colecionador',
      'Partículas celestiais permanentes',
      'Efeito de vitória épico exclusivo',
      'Badge numerado no perfil #XX/25',
      'Presença especial no lobby',
      'Fanfarra exclusiva de identidade',
    ],
    lobbyAnimation: 'Partículas celestiais com halo mítico dourado',
    duelIntroSound: 'portugal-imortal-fanfarra',
    profileBadge: 'PORTUGAL IMORTAL',
    bundleDescription: `Inclui:
✓ Avatar exclusivo "Portugal Imortal" (único nesta coleção)
✓ Arena exclusiva "Trono do Primeiro Reino" (Ed. Limitada)
✓ Moldura "Ordem de Cristo" (Ed. Limitada)
✓ Título "Imperador de Portugal"
✓ Pack "Realeza Absoluta"
✓ Emote "A Coroa Desce"
✓ Entrada cinematográfica exclusiva
✓ Cinemática de vitória exclusiva
✓ Badge de perfil numerado #XX/25`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-ARENA-ULTIMATE-001',
      'AP-VIP-FRAME-001',
      'AP-VIP-TITLE-001',
      'AP-VIP-TAUNTPACK-001',
      'AP-VIP-EMOTE-001',
    ],
    assetPath: '/ultimate/vip/portugal-imortal/showcase.webp',
    thumbnailPath: '/ultimate/vip/portugal-imortal/showcase.webp',
    previewPath: '/ultimate/vip/portugal-imortal/showcase.webp',
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
    name: 'Senhor das Quinas',
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
    assetPath: '/ultimate/vip/senhor-quinas/showcase.webp',
    thumbnailPath: '/ultimate/vip/senhor-quinas/showcase.webp',
    previewPath: '/ultimate/vip/senhor-quinas/showcase.webp',
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
    name: 'Relíquia da Fundação',
    tier: 8,
    tierName: 'Coroas de Colecionador',
    storeSection: 'ultimate',
    category: 'ultimate',
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
    description: 'Uma relíquia histórica. A coleção que honra a fundação de Portugal em 1143.',
    visualConcept: 'Pacote de status lendário centrado no Castelo de Guimarães e na identidade fundadora do reino.',
    animation: 'Apresentação real com portões a abrir e fanfarra de fundação.',
    effect: 'O jogador vencedor recebe apresentação com o seu avatar no trono do Castelo de Guimarães.',
    visualEffectsList: [
      'Portões animados de fundação',
      'Fanfarra histórica',
      'Badge numerado #XX/200',
      'Efeito de trono na vitória',
    ],
    lobbyAnimation: 'Partículas de pedra histórica com halo real',
    duelIntroSound: 'fundacao-1143',
    profileBadge: 'FUNDAÇÃO 1143',
    bundleDescription: `Inclui:
✓ Avatar "Soberano de Ourique"
✓ Arena "Castelo de Guimarães"
✓ Moldura "Constelação dos Navegadores"
✓ Título "Cavaleiro de Aljubarrota"
✓ Emote "A Sentença"
✓ Badge numerado #XX/200`,
    bundleComponents: [
      'AP-VIP-SIGNATURE-001',
      'AP-VIP-ARENA-ULTIMATE-004',
      'AP-VIP-FRAME-003',
      'AP-VIP-TITLE-003',
      'AP-VIP-EMOTE-003',
    ],
    assetPath: '/ultimate/vip/reliquia-fundacao/showcase.webp',
    thumbnailPath: '/ultimate/vip/reliquia-fundacao/showcase.webp',
    previewPath: '/ultimate/vip/reliquia-fundacao/showcase.webp',
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
    name: 'Alma de Sagres',
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
    assetPath: '/ultimate/vip/alma-sagres/showcase.webp',
    thumbnailPath: '/ultimate/vip/alma-sagres/showcase.webp',
    previewPath: '/ultimate/vip/alma-sagres/showcase.webp',
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
    name: 'Série Fundador — Acorda Portugal',
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
    assetPath: '/ultimate/vip/serie-fundador/showcase.webp',
    thumbnailPath: '/ultimate/vip/serie-fundador/showcase.webp',
    previewPath: '/ultimate/vip/serie-fundador/showcase.webp',
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
