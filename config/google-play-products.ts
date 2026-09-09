/**
 * 🇵🇹 ACORDA PORTUGAL — GOOGLE PLAY BILLING CANONICAL PRODUCTS (SSOT)
 *
 * Configuração central e imutável dos produtos oficiais na Google Play Store.
 * O backend utiliza esta configuração como Fonte Única de Verdade (SSOT) para:
 * 1. Mapeamento de Product ID para quantidade de Acordas (moeda virtual).
 * 2. Determinação do ciclo de vida: CONSUMABLE vs NON_CONSUMABLE vs SUBSCRIPTION.
 * 3. Validação estrita: NUNCA confiar em quantidades ou preços enviados pelo cliente.
 */

export type GooglePlayProductType = 'CONSUMABLE' | 'NON_CONSUMABLE' | 'SUBSCRIPTION'

export interface GooglePlayProduct {
  productId: string
  name: string
  subtitle?: string
  description: string
  type: GooglePlayProductType
  acordas: number // Moedas virtuais concedidas no jogo
  referencePriceEur: number // Preço em Euros (ex: 4.99)
  referencePriceString: string // Preço de referência para fallback web/offline
  icon: string
  popular?: boolean
  bestValue?: boolean
  badgeText?: string
}

/**
 * Catálogo Oficial de Produtos In-App do Google Play
 */
export const GOOGLE_PLAY_PRODUCTS: GooglePlayProduct[] = [
  {
    productId: 'acordas_500',
    name: '500 Acordas',
    subtitle: 'Pack Inicial',
    description: '500 Acordas virtuais para desbloquear ajudas, utilidades e itens na Loja Oficial.',
    type: 'CONSUMABLE',
    acordas: 500,
    referencePriceEur: 0.99,
    referencePriceString: '€0,99',
    icon: '🟡',
  },
  {
    productId: 'acordas_1200',
    name: '1.200 Acordas',
    subtitle: 'Mais Popular',
    description: '1.200 Acordas virtuais (+20% de bónus comparado com o pack inicial).',
    type: 'CONSUMABLE',
    acordas: 1200,
    referencePriceEur: 1.99,
    referencePriceString: '€1,99',
    icon: '🟡',
    popular: true,
    badgeText: 'Popular',
  },
  {
    productId: 'acordas_3000',
    name: '3.000 Acordas',
    subtitle: 'Excelente Valor',
    description: '3.000 Acordas virtuais (+25% de bónus) para enriqueceres a tua coleção de avatares e arenas.',
    type: 'CONSUMABLE',
    acordas: 3000,
    referencePriceEur: 4.99,
    referencePriceString: '€4,99',
    icon: '🟡',
    bestValue: true,
    badgeText: 'Mais Vendido',
  },
  {
    productId: 'acordas_7000',
    name: '7.000 Acordas',
    subtitle: 'Reserva Nacional',
    description: '7.000 Acordas virtuais (+40% de bónus) para jogadores assíduos e entusiastas nacionais.',
    type: 'CONSUMABLE',
    acordas: 7000,
    referencePriceEur: 9.99,
    referencePriceString: '€9,99',
    icon: '🟡',
    badgeText: 'Melhor Valor',
  },
  {
    productId: 'acordas_15000',
    name: '15.000 Acordas',
    subtitle: 'Tesouro de Portugal',
    description: '15.000 Acordas virtuais (+50% de bónus máximo) para desbloqueio ilimitado na loja.',
    type: 'CONSUMABLE',
    acordas: 15000,
    referencePriceEur: 19.99,
    referencePriceString: '€19,99',
    icon: '🟡',
    badgeText: 'Supremo',
  },
  // ─── Produtos Não Consumíveis (Arquitetura Pronta para Lançamento Futuro) ───
  {
    productId: 'remove_ads',
    name: 'Remover Anúncios',
    subtitle: 'Experiência Fluida Vitalícia',
    description: 'Remove todos os anúncios promocionais e intersticiais para sempre.',
    type: 'NON_CONSUMABLE',
    acordas: 0,
    referencePriceEur: 2.99,
    referencePriceString: '€2,99',
    icon: '🛡️',
  },
  {
    productId: 'premium_pass',
    name: 'Passe de Época',
    subtitle: 'Temporada Nacional',
    description: 'Acesso VIP à trilha de recompensas exclusivas da temporada.',
    type: 'NON_CONSUMABLE',
    acordas: 1000,
    referencePriceEur: 4.99,
    referencePriceString: '€4,99',
    icon: '👑',
  },
  {
    productId: 'avatar_premium_01',
    name: 'Avatar D. Afonso Henriques Lendário',
    subtitle: 'Cosmético Exclusivo',
    description: 'Avatar animado exclusivo com efeitos de ouro e espada do Conquistador.',
    type: 'NON_CONSUMABLE',
    acordas: 0,
    referencePriceEur: 1.99,
    referencePriceString: '€1,99',
    icon: '⚔️',
  },
  {
    productId: 'avatar_premium_02',
    name: 'Avatar Navegador Celestial Lendário',
    subtitle: 'Cosmético Exclusivo',
    description: 'Avatar animado exclusivo com bússola atlântica e efeitos cósmicos.',
    type: 'NON_CONSUMABLE',
    acordas: 0,
    referencePriceEur: 1.99,
    referencePriceString: '€1,99',
    icon: '🧭',
  },
]

/**
 * Lista de todos os Product IDs de Acordas consumíveis
 */
export const GOOGLE_PLAY_COIN_PRODUCT_IDS: string[] = GOOGLE_PLAY_PRODUCTS
  .filter((p) => p.type === 'CONSUMABLE' && p.acordas > 0)
  .map((p) => p.productId)

/**
 * Consulta um produto pelo seu ID canónico
 */
export function getGooglePlayProductById(productId: string): GooglePlayProduct | undefined {
  if (!productId || typeof productId !== 'string') return undefined
  const cleanId = productId.trim()
  return GOOGLE_PLAY_PRODUCTS.find((p) => p.productId === cleanId)
}

/**
 * Valida se um Product ID existe no catálogo oficial
 */
export function isValidGooglePlayProduct(productId: string): boolean {
  return Boolean(getGooglePlayProductById(productId))
}

/**
 * Determina a quantidade oficial de Acordas para um Product ID.
 * NUNCA aceita valores do cliente — o backend consulta esta função.
 */
export function getAcordasForGooglePlayProduct(productId: string): number {
  const prod = getGooglePlayProductById(productId)
  return prod ? prod.acordas : 0
}

/**
 * Identificador do pacote Android oficial da aplicação
 */
export const GOOGLE_PLAY_PACKAGE_NAME =
  process.env.GOOGLE_PLAY_PACKAGE_NAME || 'pt.acordaportugal.app'
