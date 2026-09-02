import fs from 'fs'
import path from 'path'
import { VIP_CATALOG } from '../src/data/vipCatalog.js'

const root = process.cwd()

const snapshot = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  environment: 'production-ready',
  totalItems: VIP_CATALOG.length,
  categoriesCount: {
    avatar: VIP_CATALOG.filter(p => p.category === 'avatar').length,
    frame: VIP_CATALOG.filter(p => p.category === 'frame').length,
    title: VIP_CATALOG.filter(p => p.category === 'title').length,
    arena: VIP_CATALOG.filter(p => p.category === 'arena').length,
    emote: VIP_CATALOG.filter(p => p.category === 'emote').length,
    tauntpack: VIP_CATALOG.filter(p => p.category === 'tauntpack').length,
  },
  items: VIP_CATALOG.map(item => ({
    id: item.id,
    sku: item.sku,
    category: item.category,
    name: item.name,
    description: item.description,
    rarity: item.rarity,
    rarityLabel: item.rarityLabel,
    priceCents: item.priceCents,
    priceFormatted: `€${(item.priceCents / 100).toFixed(2).replace('.', ',')}`,
    currency: item.currency,
    purchasable: item.purchasable,
    acquisitionType: item.acquisitionType,
    entitlementType: item.entitlementType,
    assetPath: item.assetPath,
    thumbnailPath: item.thumbnailPath,
    previewPath: item.previewPath,
    providerMapping: item.providerMapping,
  }))
}

const outputPath = path.join(root, 'VIP_CATALOG_SNAPSHOT.json')
fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8')
console.log(`Snapshot gerado com sucesso em ${outputPath}: ${snapshot.totalItems} itens VIP.`)
