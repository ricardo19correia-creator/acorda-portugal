import fs from 'fs'
import path from 'path'

const filePath = path.resolve(process.cwd(), 'src/data/vipCatalog.ts')
let content = fs.readFileSync(filePath, 'utf-8')

// Map each product ID to its exact asset path, name, description, etc.
const idUpdates: Record<string, {
  name?: string
  assetPath: string
  thumbnailPath: string
  previewPath: string
}> = {
  // Signatures
  'AP-VIP-SIGNATURE-001': {
    name: 'Imperador Lusitano',
    assetPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    thumbnailPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
    previewPath: '/images/avatars/vip/signature/imperador-lusitano.webp',
  },
  'AP-VIP-SIGNATURE-002': {
    name: 'Dragão de Portugal',
    assetPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    thumbnailPath: '/images/avatars/vip/signature/dragao-portugal.webp',
    previewPath: '/images/avatars/vip/signature/dragao-portugal.webp',
  },
  'AP-VIP-SIGNATURE-003': {
    name: 'Navegador Eterno',
    assetPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    thumbnailPath: '/images/avatars/vip/signature/navegador-eterno.webp',
    previewPath: '/images/avatars/vip/signature/navegador-eterno.webp',
  },
  'AP-VIP-SIGNATURE-004': {
    name: 'Guardião da Nação',
    assetPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    thumbnailPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
    previewPath: '/images/avatars/vip/signature/guardiao-nacao.webp',
  },

  // Arenas
  'AP-VIP-ARENA-ULTIMATE-001': {
    name: 'Trono Supremo do Campeão',
    assetPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    thumbnailPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
    previewPath: '/arenas/vip/ultimate/trono-supremo-campeao.webp',
  },
  'AP-VIP-ARENA-ULTIMATE-002': {
    name: 'Portugal Celestial',
    assetPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    thumbnailPath: '/arenas/vip/ultimate/portugal-celestial.webp',
    previewPath: '/arenas/vip/ultimate/portugal-celestial.webp',
  },
  'AP-VIP-ARENA-ULTIMATE-003': {
    name: 'Coliseu dos Campeões',
    assetPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    thumbnailPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
    previewPath: '/arenas/vip/ultimate/coliseu-campeoes.webp',
  },
  'AP-VIP-ARENA-ULTIMATE-004': {
    name: 'Palácio dos Reis',
    assetPath: '/arenas/vip/ultimate/palacio-reis.webp',
    thumbnailPath: '/arenas/vip/ultimate/palacio-reis.webp',
    previewPath: '/arenas/vip/ultimate/palacio-reis.webp',
  },
  'AP-VIP-ARENA-ULTIMATE-005': {
    name: 'Cidadela Eterna',
    assetPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    thumbnailPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
    previewPath: '/arenas/vip/ultimate/cidadela-eterna.webp',
  },

  // Frames
  'AP-VIP-FRAME-001': {
    name: 'Coroa do Império',
    assetPath: '/images/frames/vip/coroa-imperio.webp',
    thumbnailPath: '/images/frames/vip/coroa-imperio.webp',
    previewPath: '/images/frames/vip/coroa-imperio.webp',
  },
  'AP-VIP-FRAME-002': {
    name: 'Diamante Lusitano',
    assetPath: '/images/frames/vip/diamante-lusitano.webp',
    thumbnailPath: '/images/frames/vip/diamante-lusitano.webp',
    previewPath: '/images/frames/vip/diamante-lusitano.webp',
  },
  'AP-VIP-FRAME-003': {
    name: 'Fogo do Campeão',
    assetPath: '/images/frames/vip/fogo-campeao.webp',
    thumbnailPath: '/images/frames/vip/fogo-campeao.webp',
    previewPath: '/images/frames/vip/fogo-campeao.webp',
  },
  'AP-VIP-FRAME-004': {
    name: 'Portugal Ouro',
    assetPath: '/images/frames/vip/portugal-ouro.webp',
    thumbnailPath: '/images/frames/vip/portugal-ouro.webp',
    previewPath: '/images/frames/vip/portugal-ouro.webp',
  },
  'AP-VIP-FRAME-005': {
    name: 'Trono Celestial',
    assetPath: '/images/frames/vip/trono-celestial.webp',
    thumbnailPath: '/images/frames/vip/trono-celestial.webp',
    previewPath: '/images/frames/vip/trono-celestial.webp',
  },

  // Titles
  'AP-VIP-TITLE-001': {
    name: '«Imperador do Desafio»',
    assetPath: '/images/titles/vip/imperador-desafio.webp',
    thumbnailPath: '/images/titles/vip/imperador-desafio.webp',
    previewPath: '/images/titles/vip/imperador-desafio.webp',
  },
  'AP-VIP-TITLE-002': {
    name: '«Lenda de Portugal»',
    assetPath: '/images/titles/vip/lenda-portugal.webp',
    thumbnailPath: '/images/titles/vip/lenda-portugal.webp',
    previewPath: '/images/titles/vip/lenda-portugal.webp',
  },
  'AP-VIP-TITLE-003': {
    name: '«Campeão Eterno»',
    assetPath: '/images/titles/vip/campeao-eterno.webp',
    thumbnailPath: '/images/titles/vip/campeao-eterno.webp',
    previewPath: '/images/titles/vip/campeao-eterno.webp',
  },
  'AP-VIP-TITLE-004': {
    name: '«Cérebro Nacional»',
    assetPath: '/images/titles/vip/cerebro-nacional.webp',
    thumbnailPath: '/images/titles/vip/cerebro-nacional.webp',
    previewPath: '/images/titles/vip/cerebro-nacional.webp',
  },
  'AP-VIP-TITLE-005': {
    name: '«Mestre Lusitano»',
    assetPath: '/images/titles/vip/mestre-lusitano.webp',
    thumbnailPath: '/images/titles/vip/mestre-lusitano.webp',
    previewPath: '/images/titles/vip/mestre-lusitano.webp',
  },
  'AP-VIP-TITLE-006': {
    name: '«Senhor do Desafio»',
    assetPath: '/images/titles/vip/senhor-desafio.webp',
    thumbnailPath: '/images/titles/vip/senhor-desafio.webp',
    previewPath: '/images/titles/vip/senhor-desafio.webp',
  },

  // Emotes
  'AP-VIP-EMOTE-001': {
    name: 'Coroa-te 👑',
    assetPath: '/images/emotes/vip/coroa-te.webp',
    thumbnailPath: '/images/emotes/vip/coroa-te.webp',
    previewPath: '/images/emotes/vip/coroa-te.webp',
  },
  'AP-VIP-EMOTE-002': {
    name: 'Portugal no Topo 🇵🇹',
    assetPath: '/images/emotes/vip/portugal-no-topo.webp',
    thumbnailPath: '/images/emotes/vip/portugal-no-topo.webp',
    previewPath: '/images/emotes/vip/portugal-no-topo.webp',
  },
  'AP-VIP-EMOTE-003': {
    name: 'Acabou!',
    assetPath: '/images/emotes/vip/acabou.webp',
    thumbnailPath: '/images/emotes/vip/acabou.webp',
    previewPath: '/images/emotes/vip/acabou.webp',
  },
  'AP-VIP-EMOTE-004': {
    name: 'Mestre Absoluto',
    assetPath: '/images/emotes/vip/mestre-absoluto.webp',
    thumbnailPath: '/images/emotes/vip/mestre-absoluto.webp',
    previewPath: '/images/emotes/vip/mestre-absoluto.webp',
  },
  'AP-VIP-EMOTE-005': {
    name: 'Nem Acredito!',
    assetPath: '/images/emotes/vip/nem-acredito.webp',
    thumbnailPath: '/images/emotes/vip/nem-acredito.webp',
    previewPath: '/images/emotes/vip/nem-acredito.webp',
  },
  'AP-VIP-EMOTE-006': {
    name: 'Respeito 🤝',
    assetPath: '/images/emotes/vip/respeito.webp',
    thumbnailPath: '/images/emotes/vip/respeito.webp',
    previewPath: '/images/emotes/vip/respeito.webp',
  },

  // Tauntpacks
  'AP-VIP-TAUNTPACK-001': {
    name: 'Realeza Absoluta',
    assetPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    thumbnailPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
    previewPath: '/images/taunts/vip/realeza-absoluta/icon.webp',
  },
  'AP-VIP-TAUNTPACK-002': {
    name: 'Guerra dos Campeões',
    assetPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    thumbnailPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
    previewPath: '/images/taunts/vip/guerra-campeoes/icon.webp',
  },
  'AP-VIP-TAUNTPACK-003': {
    name: 'Lusitano Implacável',
    assetPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    thumbnailPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
    previewPath: '/images/taunts/vip/lusitano-implacavel/icon.webp',
  },
  'AP-VIP-TAUNTPACK-004': {
    name: 'O Chefe Final',
    assetPath: '/images/taunts/vip/final-boss/icon.webp',
    thumbnailPath: '/images/taunts/vip/final-boss/icon.webp',
    previewPath: '/images/taunts/vip/final-boss/icon.webp',
  },

  // Bundles
  'AP-VIP-BUNDLE-001': {
    name: 'Campeão Eterno — Conjunto Completo',
    assetPath: '/bundles/vip/campeao-eterno/banner.webp',
    thumbnailPath: '/bundles/vip/campeao-eterno/banner.webp',
    previewPath: '/bundles/vip/campeao-eterno/banner.webp',
  },
  'AP-VIP-BUNDLE-002': {
    name: 'Coleção Imperial',
    assetPath: '/bundles/vip/imperial/banner.webp',
    thumbnailPath: '/bundles/vip/imperial/banner.webp',
    previewPath: '/bundles/vip/imperial/banner.webp',
  },
  'AP-VIP-BUNDLE-003': {
    name: 'Lusitano Supremo',
    assetPath: '/bundles/vip/lusitano-supremo/banner.webp',
    thumbnailPath: '/bundles/vip/lusitano-supremo/banner.webp',
    previewPath: '/bundles/vip/lusitano-supremo/banner.webp',
  },

  // Ultimate Sets
  'AP-VIP-ULTIMATE-001': {
    name: 'Identidade de Campeão',
    assetPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    thumbnailPath: '/ultimate/vip/identidade-campeao/showcase.webp',
    previewPath: '/ultimate/vip/identidade-campeao/showcase.webp',
  },
  'AP-VIP-ULTIMATE-002': {
    name: 'Legenda Nacional',
    assetPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    thumbnailPath: '/ultimate/vip/legenda-nacional/showcase.webp',
    previewPath: '/ultimate/vip/legenda-nacional/showcase.webp',
  },
  'AP-VIP-ULTIMATE-003': {
    name: 'Senhor de Portugal',
    assetPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    thumbnailPath: '/ultimate/vip/senhor-portugal/showcase.webp',
    previewPath: '/ultimate/vip/senhor-portugal/showcase.webp',
  },
  'AP-VIP-ULTIMATE-004': {
    name: 'Trono do Desafio',
    assetPath: '/ultimate/vip/trono-desafio/showcase.webp',
    thumbnailPath: '/ultimate/vip/trono-desafio/showcase.webp',
    previewPath: '/ultimate/vip/trono-desafio/showcase.webp',
  },
  'AP-VIP-ULTIMATE-005': {
    name: 'O Último Desafio',
    assetPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    thumbnailPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
    previewPath: '/ultimate/vip/ultimo-desafio/showcase.webp',
  },
}

let updated = 0
for (const [id, data] of Object.entries(idUpdates)) {
  // Regex to find the block for this product id
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?)(assetPath:\\s*'[^']*')([\\s\\S]*?)(thumbnailPath:\\s*'[^']*')([\\s\\S]*?)(previewPath:\\s*'[^']*')`, 'm')
  const match = content.match(regex)
  if (match) {
    content = content.replace(regex, (m, p1, p2, p3, p4, p5, p6) => {
      let head = p1
      if (data.name) {
        head = head.replace(/name:\s*('[^']*'|"[^"]*")/, `name: '${data.name}'`)
      }
      return `${head}assetPath: '${data.assetPath}'${p3}thumbnailPath: '${data.thumbnailPath}'${p5}previewPath: '${data.previewPath}'`
    })
    updated++
  } else {
    console.warn(`[WARN] Could not find block for ${id}`)
  }
}

fs.writeFileSync(filePath, content, 'utf-8')
console.log(`Successfully updated ${updated} / ${Object.keys(idUpdates).length} products by ID in vipCatalog.ts!`)
