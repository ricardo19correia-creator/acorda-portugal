import fs from 'fs'
import path from 'path'
import { VIP_CATALOG, formatVipPrice } from '../src/data/vipCatalog'

const root = process.cwd()

const snapshot = {
  version: '2.0.0',
  generatedAt: new Date().toISOString(),
  environment: 'production-ready',
  totalItems: VIP_CATALOG.length,
  sectionsCount: {
    signature: VIP_CATALOG.filter(p => p.storeSection === 'signature').length,
    arenas: VIP_CATALOG.filter(p => p.storeSection === 'arenas').length,
    identities: VIP_CATALOG.filter(p => p.storeSection === 'identities').length,
    reactions: VIP_CATALOG.filter(p => p.storeSection === 'reactions').length,
    taunts: VIP_CATALOG.filter(p => p.storeSection === 'taunts').length,
    bundles: VIP_CATALOG.filter(p => p.storeSection === 'bundles').length,
    ultimate: VIP_CATALOG.filter(p => p.storeSection === 'ultimate').length,
  },
  categoriesCount: {
    avatar: VIP_CATALOG.filter(p => p.category === 'avatar').length,
    arena: VIP_CATALOG.filter(p => p.category === 'arena').length,
    frame: VIP_CATALOG.filter(p => p.category === 'frame').length,
    title: VIP_CATALOG.filter(p => p.category === 'title').length,
    emote: VIP_CATALOG.filter(p => p.category === 'emote').length,
    tauntpack: VIP_CATALOG.filter(p => p.category === 'tauntpack').length,
    bundle: VIP_CATALOG.filter(p => p.category === 'bundle').length,
    ultimate: VIP_CATALOG.filter(p => p.category === 'ultimate').length,
  },
  items: VIP_CATALOG.map(p => ({
    id: p.id,
    sku: p.sku,
    tier: p.tier,
    tierName: p.tierName,
    storeSection: p.storeSection,
    category: p.category,
    name: p.name,
    rarity: p.rarity,
    priceEUR: p.priceEUR,
    priceCents: p.priceCents,
    priceFormatted: formatVipPrice(p.priceCents),
    currency: p.currency,
    visualConcept: p.visualConcept,
    animation: p.animation,
    effect: p.effect,
    bundleDescription: p.bundleDescription || null,
    bundleComponents: p.bundleComponents || null,
    isLimited: Boolean(p.isLimited),
    stock: p.stock ?? null,
    assetPath: p.assetPath,
    thumbnailPath: p.thumbnailPath,
    previewPath: p.previewPath,
    purchaseRules: p.purchaseRules,
    providerMapping: p.providerMapping,
  }))
}

fs.writeFileSync(
  path.join(root, 'VIP_CATALOG_SNAPSHOT.json'),
  JSON.stringify(snapshot, null, 2),
  'utf-8'
)

console.log(`[OK] VIP_CATALOG_SNAPSHOT.json exportado com sucesso com ${VIP_CATALOG.length} itens VIP 2.0.`)
