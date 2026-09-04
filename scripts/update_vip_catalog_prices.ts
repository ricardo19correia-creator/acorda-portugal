import fs from 'fs'
import path from 'path'

const filePath = path.resolve(process.cwd(), 'src/data/vipCatalog.ts')
let content = fs.readFileSync(filePath, 'utf-8')

// 1. Update interface to include image?: string
if (!content.includes('image?: string')) {
  content = content.replace(
    '  assetPath: string\n',
    '  image?: string\n  assetPath: string\n'
  )
}

// 2. Update comments
content = content.replace(
  'Preço máximo absoluto: €39,99. Nunca usar €44,99 ou €49,99.',
  'Preço máximo absoluto: €9,99. Microtransações realistas para o mercado português (€0,99 a €9,99).'
)

const NEW_PRICES: Record<string, { eur: number; cents: number }> = {
  // Tier 1: Avatares Signature (€2,99 a €4,99)
  'AP-VIP-SIGNATURE-001': { eur: 4.99, cents: 499 },
  'AP-VIP-SIGNATURE-002': { eur: 3.99, cents: 399 },
  'AP-VIP-SIGNATURE-003': { eur: 3.49, cents: 349 },
  'AP-VIP-SIGNATURE-004': { eur: 2.99, cents: 299 },

  // Tier 2: Arenas Históricas 3D (€2,99 a €4,99)
  'AP-VIP-ARENA-ULTIMATE-001': { eur: 4.99, cents: 499 },
  'AP-VIP-ARENA-ULTIMATE-002': { eur: 4.49, cents: 449 },
  'AP-VIP-ARENA-ULTIMATE-003': { eur: 3.99, cents: 399 },
  'AP-VIP-ARENA-ULTIMATE-004': { eur: 3.49, cents: 349 },
  'AP-VIP-ARENA-ULTIMATE-005': { eur: 2.99, cents: 299 },

  // Tier 3: Molduras Reais (€1,99 a €2,49)
  'AP-VIP-FRAME-001': { eur: 2.49, cents: 249 },
  'AP-VIP-FRAME-002': { eur: 2.29, cents: 229 },
  'AP-VIP-FRAME-003': { eur: 2.19, cents: 219 },
  'AP-VIP-FRAME-004': { eur: 1.99, cents: 199 },
  'AP-VIP-FRAME-005': { eur: 1.99, cents: 199 },

  // Tier 4: Títulos de Prestígio (€0,99 a €1,99)
  'AP-VIP-TITLE-001': { eur: 1.99, cents: 199 },
  'AP-VIP-TITLE-002': { eur: 1.79, cents: 179 },
  'AP-VIP-TITLE-003': { eur: 1.49, cents: 149 },
  'AP-VIP-TITLE-004': { eur: 1.29, cents: 129 },
  'AP-VIP-TITLE-005': { eur: 0.99, cents: 99 },
  'AP-VIP-TITLE-006': { eur: 0.99, cents: 99 },

  // Tier 5: Reações Cinematográficas (€0,99 a €1,49)
  'AP-VIP-EMOTE-001': { eur: 1.49, cents: 149 },
  'AP-VIP-EMOTE-002': { eur: 1.49, cents: 149 },
  'AP-VIP-EMOTE-003': { eur: 1.29, cents: 129 },
  'AP-VIP-EMOTE-004': { eur: 0.99, cents: 99 },
  'AP-VIP-EMOTE-005': { eur: 0.99, cents: 99 },
  'AP-VIP-EMOTE-006': { eur: 0.99, cents: 99 },

  // Tier 6: Provocações 1v1 / Elite Taunt Packs (€1,29 a €1,99)
  'AP-VIP-TAUNTPACK-001': { eur: 1.99, cents: 199 },
  'AP-VIP-TAUNTPACK-002': { eur: 1.49, cents: 149 },
  'AP-VIP-TAUNTPACK-003': { eur: 1.49, cents: 149 },
  'AP-VIP-TAUNTPACK-004': { eur: 1.29, cents: 129 },

  // Tier 7: Conjuntos Completos / Bundles (€7,99 a €9,99)
  'AP-VIP-BUNDLE-001': { eur: 9.99, cents: 999 },
  'AP-VIP-BUNDLE-002': { eur: 8.99, cents: 899 },
  'AP-VIP-BUNDLE-003': { eur: 7.99, cents: 799 },

  // Tier 8: Coleções Míticas / Ultimate (€7,99 a €9,99)
  'AP-VIP-ULTIMATE-001': { eur: 9.99, cents: 999 },
  'AP-VIP-ULTIMATE-002': { eur: 9.99, cents: 999 },
  'AP-VIP-ULTIMATE-003': { eur: 8.99, cents: 899 },
  'AP-VIP-ULTIMATE-004': { eur: 8.49, cents: 849 },
  'AP-VIP-ULTIMATE-005': { eur: 7.99, cents: 799 },
}

for (const [id, price] of Object.entries(NEW_PRICES)) {
  // Find product block by id
  const idRegex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?)(priceEUR:\\s*)[0-9.]+(,[\\s\\S]*?priceCents:\\s*)[0-9]+`, 'm')
  const match = content.match(idRegex)
  if (match) {
    content = content.replace(idRegex, `$1$2${price.eur.toFixed(2)}$3${price.cents}`)
    console.log(`Updated price for ${id}: €${price.eur} (${price.cents} cêntimos)`)
  } else {
    console.warn(`Could not match price for ${id}`)
  }

  // Ensure image field is present in the object
  const assetRegex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?)(assetPath:\\s*')`, 'm')
  if (!content.match(new RegExp(`id:\\s*'${id}'[\\s\\S]*?image:\\s*'/store/vip/`, 'm'))) {
    content = content.replace(assetRegex, `$1image: '/store/vip/${id}.webp',\n    $2`)
    console.log(`Added image field for ${id}: /store/vip/${id}.webp`)
  }
}

fs.writeFileSync(filePath, content, 'utf-8')
console.log('Successfully updated src/data/vipCatalog.ts!')
