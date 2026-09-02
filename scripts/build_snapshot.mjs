import fs from 'fs'
import path from 'path'

const root = process.cwd()

const catalogFile = fs.readFileSync(path.join(root, 'src', 'data', 'vipCatalog.ts'), 'utf-8')

// Extrair os blocos de produtos pelo sku
const itemBlocks = catalogFile.split(/\{\s*id:\s*'/).slice(1)
const items = []

for (const block of itemBlocks) {
  const skuMatch = block.match(/sku:\s*'([^']+)'/)
  if (!skuMatch) continue // Pular sub-itens como taunts individuais

  const id = block.split("'")[0].trim()
  const sku = skuMatch[1].trim()
  const categoryMatch = block.match(/category:\s*'([^']+)'/)
  const nameMatch = block.match(/name:\s*'([^']+)'/)
  const descMatch = block.match(/description:\s*'([^']+)'/)
  const rarityMatch = block.match(/rarity:\s*'([^']+)'/)
  const rarityLabelMatch = block.match(/rarityLabel:\s*'([^']+)'/)
  const priceMatch = block.match(/priceCents:\s*(\d+)/)
  const currencyMatch = block.match(/currency:\s*'([^']+)'/)
  const assetPathMatch = block.match(/assetPath:\s*'([^']+)'/)
  const thumbPathMatch = block.match(/thumbnailPath:\s*'([^']+)'/)
  const previewPathMatch = block.match(/previewPath:\s*'([^']+)'/)

  const priceCents = priceMatch ? parseInt(priceMatch[1], 10) : 0

  items.push({
    id,
    sku,
    category: categoryMatch ? categoryMatch[1] : '',
    name: nameMatch ? nameMatch[1] : '',
    description: descMatch ? descMatch[1] : '',
    rarity: rarityMatch ? rarityMatch[1] : '',
    rarityLabel: rarityLabelMatch ? rarityLabelMatch[1] : '',
    priceCents,
    priceFormatted: `€${(priceCents / 100).toFixed(2).replace('.', ',')}`,
    currency: currencyMatch ? currencyMatch[1] : 'EUR',
    purchasable: true,
    acquisitionType: 'vip_real_money',
    entitlementType: 'permanent',
    assetPath: assetPathMatch ? assetPathMatch[1] : '',
    thumbnailPath: thumbPathMatch ? thumbPathMatch[1] : '',
    previewPath: previewPathMatch ? previewPathMatch[1] : '',
    providerMapping: {
      stripeProductId: `prod_${id}`,
      stripePriceId: `price_${id}`,
    },
  })
}

const snapshot = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  environment: 'production-ready',
  totalItems: items.length,
  categoriesCount: {
    avatar: items.filter(p => p.category === 'avatar').length,
    frame: items.filter(p => p.category === 'frame').length,
    title: items.filter(p => p.category === 'title').length,
    arena: items.filter(p => p.category === 'arena').length,
    emote: items.filter(p => p.category === 'emote').length,
    tauntpack: items.filter(p => p.category === 'tauntpack').length,
  },
  items,
}

const outputPath = path.join(root, 'VIP_CATALOG_SNAPSHOT.json')
fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8')
console.log(`✅ VIP_CATALOG_SNAPSHOT.json gerado com sucesso: ${items.length} produtos VIP.`)
console.log('Distribuição por categoria:', snapshot.categoriesCount)
