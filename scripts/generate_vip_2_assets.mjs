import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = process.cwd()

// Lista oficial dos 38 itens e seus caminhos de asset
const ASSET_SPECS = [
  // TIER I — SIGNATURE (4)
  {
    id: 'AP-VIP-SIGNATURE-001',
    name: 'Imperador Lusitano',
    category: 'avatar',
    rarity: 'Mythic',
    outPath: 'public/images/avatars/vip/signature/imperador-lusitano.webp',
    width: 512,
    height: 512,
    bg: '#1a0505',
    primary: '#FFD700',
    accent: '#DC2626',
    symbol: '👑',
    subtitle: 'IMPERADOR LUSITANO • MYTHIC'
  },
  {
    id: 'AP-VIP-SIGNATURE-002',
    name: 'Dragão de Portugal',
    category: 'avatar',
    rarity: 'Mythic',
    outPath: 'public/images/avatars/vip/signature/dragao-portugal.webp',
    width: 512,
    height: 512,
    bg: '#051410',
    primary: '#10B981',
    accent: '#F59E0B',
    symbol: '🐉',
    subtitle: 'DRAGÃO DE PORTUGAL • MYTHIC'
  },
  {
    id: 'AP-VIP-SIGNATURE-003',
    name: 'Navegador Eterno',
    category: 'avatar',
    rarity: 'Legendary',
    outPath: 'public/images/avatars/vip/signature/navegador-eterno.webp',
    width: 512,
    height: 512,
    bg: '#050c1a',
    primary: '#38BDF8',
    accent: '#F59E0B',
    symbol: '🧭',
    subtitle: 'NAVEGADOR ETERNO • LEGENDARY'
  },
  {
    id: 'AP-VIP-SIGNATURE-004',
    name: 'Guardião da Nação',
    category: 'avatar',
    rarity: 'Legendary',
    outPath: 'public/images/avatars/vip/signature/guardiao-nacao.webp',
    width: 512,
    height: 512,
    bg: '#10051a',
    primary: '#C084FC',
    accent: '#10B981',
    symbol: '🛡️',
    subtitle: 'GUARDIÃO DA NAÇÃO • LEGENDARY'
  },

  // TIER II — ULTIMATE ARENAS (5)
  {
    id: 'AP-VIP-ARENA-ULTIMATE-001',
    name: 'Trono Supremo do Campeão',
    category: 'arena',
    rarity: 'Mythic',
    outPath: 'public/arenas/vip/ultimate/trono-supremo-campeao.webp',
    width: 1280,
    height: 720,
    bg: '#180808',
    primary: '#FBBF24',
    accent: '#EF4444',
    symbol: '🏛️',
    subtitle: 'TRONO SUPREMO DO CAMPEÃO • MYTHIC ARENA'
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-002',
    name: 'Portugal Celestial',
    category: 'arena',
    rarity: 'Mythic',
    outPath: 'public/arenas/vip/ultimate/portugal-celestial.webp',
    width: 1280,
    height: 720,
    bg: '#081226',
    primary: '#60A5FA',
    accent: '#F59E0B',
    symbol: '🌌',
    subtitle: 'PORTUGAL CELESTIAL • MYTHIC ARENA'
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-003',
    name: 'Coliseu dos Campeões',
    category: 'arena',
    rarity: 'Legendary',
    outPath: 'public/arenas/vip/ultimate/coliseu-campeoes.webp',
    width: 1280,
    height: 720,
    bg: '#140c05',
    primary: '#F59E0B',
    accent: '#10B981',
    symbol: '🏟️',
    subtitle: 'COLISEU DOS CAMPEÕES • LEGENDARY ARENA'
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-004',
    name: 'Palácio dos Reis',
    category: 'arena',
    rarity: 'Legendary',
    outPath: 'public/arenas/vip/ultimate/palacio-reis.webp',
    width: 1280,
    height: 720,
    bg: '#1a0b1c',
    primary: '#E879F9',
    accent: '#FBBF24',
    symbol: '🏰',
    subtitle: 'PALÁCIO DOS REIS • LEGENDARY ARENA'
  },
  {
    id: 'AP-VIP-ARENA-ULTIMATE-005',
    name: 'Cidadela Eterna',
    category: 'arena',
    rarity: 'Epic',
    outPath: 'public/arenas/vip/ultimate/cidadela-eterna.webp',
    width: 1280,
    height: 720,
    bg: '#0d1512',
    primary: '#34D399',
    accent: '#60A5FA',
    symbol: '⚔️',
    subtitle: 'CIDADELA ETERNA • EPIC ARENA'
  },

  // TIER III — ROYAL IDENTITIES / FRAMES (5)
  {
    id: 'AP-VIP-FRAME-001',
    name: 'Coroa do Império',
    category: 'frame',
    rarity: 'Mythic',
    outPath: 'public/images/frames/vip/coroa-imperio.webp',
    width: 512,
    height: 512,
    bg: '#00000000',
    primary: '#F59E0B',
    accent: '#EF4444',
    symbol: '👑',
    subtitle: 'COROA DO IMPÉRIO'
  },
  {
    id: 'AP-VIP-FRAME-002',
    name: 'Portugal de Ouro',
    category: 'frame',
    rarity: 'Legendary',
    outPath: 'public/images/frames/vip/portugal-ouro.webp',
    width: 512,
    height: 512,
    bg: '#00000000',
    primary: '#FBBF24',
    accent: '#10B981',
    symbol: '🌟',
    subtitle: 'PORTUGAL DE OURO'
  },
  {
    id: 'AP-VIP-FRAME-003',
    name: 'Trono Celestial',
    category: 'frame',
    rarity: 'Legendary',
    outPath: 'public/images/frames/vip/trono-celestial.webp',
    width: 512,
    height: 512,
    bg: '#00000000',
    primary: '#38BDF8',
    accent: '#C084FC',
    symbol: '✨',
    subtitle: 'TRONO CELESTIAL'
  },
  {
    id: 'AP-VIP-FRAME-004',
    name: 'Diamante Lusitano',
    category: 'frame',
    rarity: 'Epic',
    outPath: 'public/images/frames/vip/diamante-lusitano.webp',
    width: 512,
    height: 512,
    bg: '#00000000',
    primary: '#A7F3D0',
    accent: '#38BDF8',
    symbol: '💎',
    subtitle: 'DIAMANTE LUSITANO'
  },
  {
    id: 'AP-VIP-FRAME-005',
    name: 'Fogo do Campeão',
    category: 'frame',
    rarity: 'Epic',
    outPath: 'public/images/frames/vip/fogo-campeao.webp',
    width: 512,
    height: 512,
    bg: '#00000000',
    primary: '#F87171',
    accent: '#FBBF24',
    symbol: '🔥',
    subtitle: 'FOGO DO CAMPEÃO'
  },

  // TIER IV — TITLES (6)
  {
    id: 'AP-VIP-TITLE-001',
    name: 'Imperador do Desafio',
    category: 'title',
    rarity: 'Mythic',
    outPath: 'public/images/titles/vip/imperador-desafio.webp',
    width: 600,
    height: 200,
    bg: '#140505',
    primary: '#F59E0B',
    accent: '#EF4444',
    symbol: '👑',
    subtitle: 'IMPERADOR DO DESAFIO'
  },
  {
    id: 'AP-VIP-TITLE-002',
    name: 'Campeão Eterno',
    category: 'title',
    rarity: 'Legendary',
    outPath: 'public/images/titles/vip/campeao-eterno.webp',
    width: 600,
    height: 200,
    bg: '#08121f',
    primary: '#60A5FA',
    accent: '#F59E0B',
    symbol: '🏆',
    subtitle: 'CAMPEÃO ETERNO'
  },
  {
    id: 'AP-VIP-TITLE-003',
    name: 'Lenda de Portugal',
    category: 'title',
    rarity: 'Legendary',
    outPath: 'public/images/titles/vip/lenda-portugal.webp',
    width: 600,
    height: 200,
    bg: '#061a12',
    primary: '#34D399',
    accent: '#F59E0B',
    symbol: '🇵🇹',
    subtitle: 'LENDA DE PORTUGAL'
  },
  {
    id: 'AP-VIP-TITLE-004',
    name: 'Senhor do Desafio',
    category: 'title',
    rarity: 'Epic',
    outPath: 'public/images/titles/vip/senhor-desafio.webp',
    width: 600,
    height: 200,
    bg: '#180e06',
    primary: '#FBBF24',
    accent: '#F97316',
    symbol: '⚡',
    subtitle: 'SENHOR DO DESAFIO'
  },
  {
    id: 'AP-VIP-TITLE-005',
    name: 'Mestre Lusitano',
    category: 'title',
    rarity: 'Epic',
    outPath: 'public/images/titles/vip/mestre-lusitano.webp',
    width: 600,
    height: 200,
    bg: '#16081e',
    primary: '#C084FC',
    accent: '#F472B6',
    symbol: '📜',
    subtitle: 'MESTRE LUSITANO'
  },
  {
    id: 'AP-VIP-TITLE-006',
    name: 'Cérebro Nacional',
    category: 'title',
    rarity: 'Rare',
    outPath: 'public/images/titles/vip/cerebro-nacional.webp',
    width: 600,
    height: 200,
    bg: '#06171a',
    primary: '#2DD4BF',
    accent: '#38BDF8',
    symbol: '🧠',
    subtitle: 'CÉREBRO NACIONAL'
  },

  // TIER V — CINEMATIC REACTIONS (6)
  {
    id: 'AP-VIP-EMOTE-001',
    name: 'Coroa-te 👑',
    category: 'emote',
    rarity: 'Legendary',
    outPath: 'public/images/emotes/vip/coroa-te.webp',
    width: 256,
    height: 256,
    bg: '#140c05',
    primary: '#F59E0B',
    accent: '#EF4444',
    symbol: '👑',
    subtitle: 'COROA-TE'
  },
  {
    id: 'AP-VIP-EMOTE-002',
    name: 'Portugal no Topo 🇵🇹',
    category: 'emote',
    rarity: 'Legendary',
    outPath: 'public/images/emotes/vip/portugal-no-topo.webp',
    width: 256,
    height: 256,
    bg: '#04170d',
    primary: '#10B981',
    accent: '#EF4444',
    symbol: '🇵🇹',
    subtitle: 'PORTUGAL NO TOPO'
  },
  {
    id: 'AP-VIP-EMOTE-003',
    name: 'Acabou.',
    category: 'emote',
    rarity: 'Epic',
    outPath: 'public/images/emotes/vip/acabou.webp',
    width: 256,
    height: 256,
    bg: '#160408',
    primary: '#F43F5E',
    accent: '#881337',
    symbol: '🛑',
    subtitle: 'ACABOU.'
  },
  {
    id: 'AP-VIP-EMOTE-004',
    name: 'Mestre Absoluto',
    category: 'emote',
    rarity: 'Epic',
    outPath: 'public/images/emotes/vip/mestre-absoluto.webp',
    width: 256,
    height: 256,
    bg: '#0f051c',
    primary: '#A855F7',
    accent: '#F59E0B',
    symbol: '🎖️',
    subtitle: 'MESTRE ABSOLUTO'
  },
  {
    id: 'AP-VIP-EMOTE-005',
    name: 'Nem Acredito',
    category: 'emote',
    rarity: 'Epic',
    outPath: 'public/images/emotes/vip/nem-acredito.webp',
    width: 256,
    height: 256,
    bg: '#06151c',
    primary: '#0EA5E9',
    accent: '#F59E0B',
    symbol: '😲',
    subtitle: 'NEM ACREDITO'
  },
  {
    id: 'AP-VIP-EMOTE-006',
    name: 'Respeito. 👑',
    category: 'emote',
    rarity: 'Rare',
    outPath: 'public/images/emotes/vip/respeito.webp',
    width: 256,
    height: 256,
    bg: '#181206',
    primary: '#D97706',
    accent: '#FCD34D',
    symbol: '🫡',
    subtitle: 'RESPEITO.'
  },

  // TIER VI — ELITE TAUNT PACKS (4)
  {
    id: 'AP-VIP-TAUNTPACK-001',
    name: 'Realeza Absoluta',
    category: 'tauntpack',
    rarity: 'Mythic',
    outPath: 'public/images/taunts/vip/realeza-absoluta/icon.webp',
    width: 512,
    height: 512,
    bg: '#1a0505',
    primary: '#F59E0B',
    accent: '#DC2626',
    symbol: '👑',
    subtitle: 'REALEZA ABSOLUTA'
  },
  {
    id: 'AP-VIP-TAUNTPACK-002',
    name: 'Guerra dos Campeões',
    category: 'tauntpack',
    rarity: 'Legendary',
    outPath: 'public/images/taunts/vip/guerra-campeoes/icon.webp',
    width: 512,
    height: 512,
    bg: '#180a06',
    primary: '#EA580C',
    accent: '#F59E0B',
    symbol: '⚔️',
    subtitle: 'GUERRA DOS CAMPEÕES'
  },
  {
    id: 'AP-VIP-TAUNTPACK-003',
    name: 'Lusitano Implacável',
    category: 'tauntpack',
    rarity: 'Legendary',
    outPath: 'public/images/taunts/vip/lusitano-implacavel/icon.webp',
    width: 512,
    height: 512,
    bg: '#05180f',
    primary: '#10B981',
    accent: '#F59E0B',
    symbol: '🛡️',
    subtitle: 'LUSITANO IMPLACÁVEL'
  },
  {
    id: 'AP-VIP-TAUNTPACK-004',
    name: 'Final Boss',
    category: 'tauntpack',
    rarity: 'Epic',
    outPath: 'public/images/taunts/vip/final-boss/icon.webp',
    width: 512,
    height: 512,
    bg: '#14051a',
    primary: '#A855F7',
    accent: '#EF4444',
    symbol: '😈',
    subtitle: 'FINAL BOSS'
  },

  // TIER VII — COMPLETE PREMIUM SETS (3)
  {
    id: 'AP-VIP-BUNDLE-001',
    name: 'Conjunto Imperial',
    category: 'bundle',
    rarity: 'Mythic',
    outPath: 'public/bundles/vip/imperial/banner.webp',
    width: 800,
    height: 500,
    bg: '#180508',
    primary: '#FFD700',
    accent: '#EF4444',
    symbol: '👑💎',
    subtitle: 'CONJUNTO IMPERIAL • MYTHIC BUNDLE'
  },
  {
    id: 'AP-VIP-BUNDLE-002',
    name: 'Conjunto Campeão Eterno',
    category: 'bundle',
    rarity: 'Mythic',
    outPath: 'public/bundles/vip/campeao-eterno/banner.webp',
    width: 800,
    height: 500,
    bg: '#061326',
    primary: '#60A5FA',
    accent: '#F59E0B',
    symbol: '🏆💎',
    subtitle: 'CONJUNTO CAMPEÃO ETERNO • MYTHIC BUNDLE'
  },
  {
    id: 'AP-VIP-BUNDLE-003',
    name: 'Conjunto Lusitano Supremo',
    category: 'bundle',
    rarity: 'Legendary',
    outPath: 'public/bundles/vip/lusitano-supremo/banner.webp',
    width: 800,
    height: 500,
    bg: '#051a12',
    primary: '#10B981',
    accent: '#F59E0B',
    symbol: '🇵🇹💎',
    subtitle: 'CONJUNTO LUSITANO SUPREMO • LEGENDARY BUNDLE'
  },

  // TIER VIII — THE CROWN JEWELS (5)
  {
    id: 'AP-VIP-ULTIMATE-001',
    name: 'Identidade do Campeão',
    category: 'ultimate',
    rarity: 'Mythic',
    outPath: 'public/ultimate/vip/identidade-campeao/showcase.webp',
    width: 800,
    height: 500,
    bg: '#1c0c04',
    primary: '#F59E0B',
    accent: '#EF4444',
    symbol: '👑🏆',
    subtitle: 'IDENTIDADE DO CAMPEÃO • MYTHIC ULTIMATE'
  },
  {
    id: 'AP-VIP-ULTIMATE-002',
    name: 'Senhor de Portugal',
    category: 'ultimate',
    rarity: 'Mythic',
    outPath: 'public/ultimate/vip/senhor-portugal/showcase.webp',
    width: 800,
    height: 500,
    bg: '#1a0410',
    primary: '#EC4899',
    accent: '#F59E0B',
    symbol: '🇵🇹👑',
    subtitle: 'SENHOR DE PORTUGAL • LIMITED RELEASE'
  },
  {
    id: 'AP-VIP-ULTIMATE-003',
    name: 'Trono do Desafio',
    category: 'ultimate',
    rarity: 'Mythic',
    outPath: 'public/ultimate/vip/trono-desafio/showcase.webp',
    width: 800,
    height: 500,
    bg: '#140824',
    primary: '#A855F7',
    accent: '#FBBF24',
    symbol: '🏛️👑',
    subtitle: 'TRONO DO DESAFIO • MYTHIC ULTIMATE'
  },
  {
    id: 'AP-VIP-ULTIMATE-004',
    name: 'Legenda Nacional',
    category: 'ultimate',
    rarity: 'Mythic',
    outPath: 'public/ultimate/vip/legenda-nacional/showcase.webp',
    width: 800,
    height: 500,
    bg: '#041724',
    primary: '#0284C7',
    accent: '#F59E0B',
    symbol: '🌟🇵🇹',
    subtitle: 'LEGENDA NACIONAL • LIMITED PRESTIGE'
  },
  {
    id: 'AP-VIP-ULTIMATE-005',
    name: 'O Último Desafio',
    category: 'ultimate',
    rarity: 'Mythic',
    outPath: 'public/ultimate/vip/ultimo-desafio/showcase.webp',
    width: 800,
    height: 500,
    bg: '#0d0726',
    primary: '#F43F5E',
    accent: '#FBBF24',
    symbol: '👑⚡💎',
    subtitle: 'O ÚLTIMO DESAFIO • FOUNDER COLLECTION #001'
  }
]

// Renderizador SVG vetorial para conversão em WebP
function generateSvgArt(item) {
  const isTransparentFrame = item.category === 'frame'
  const fillBg = isTransparentFrame
    ? 'rgba(0,0,0,0)'
    : `<defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${item.primary}" stop-opacity="0.25"/>
          <stop offset="70%" stop-color="${item.bg}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#020408" stop-opacity="1"/>
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />`

  return `<svg width="${item.width}" height="${item.height}" viewBox="0 0 ${item.width} ${item.height}" xmlns="http://www.w3.org/2000/svg">
    ${fillBg}
    
    <!-- Ornato e Moldura Geométrica -->
    <rect x="16" y="16" width="${item.width - 32}" height="${item.height - 32}" rx="24"
          fill="none" stroke="${item.primary}" stroke-width="3" stroke-dasharray="16 8" opacity="0.6"/>
    
    <rect x="24" y="24" width="${item.width - 48}" height="${item.height - 48}" rx="20"
          fill="none" stroke="${item.accent}" stroke-width="1.5" opacity="0.4"/>

    <!-- Escudo / Brasão Central -->
    <circle cx="${item.width / 2}" cy="${item.height * 0.42}" r="${Math.min(item.width, item.height) * 0.26}"
            fill="none" stroke="${item.primary}" stroke-width="4" opacity="0.75"/>
    
    <circle cx="${item.width / 2}" cy="${item.height * 0.42}" r="${Math.min(item.width, item.height) * 0.22}"
            fill="${item.primary}" fill-opacity="0.08"/>

    <!-- Símbolo / Ícone -->
    <text x="${item.width / 2}" y="${item.height * 0.48}" 
          font-size="${Math.min(item.width, item.height) * 0.22}" 
          text-anchor="middle" dominant-baseline="middle" filter="url(#glow)">
      ${item.symbol}
    </text>

    <!-- Tipografia e Título Oficial -->
    <text x="${item.width / 2}" y="${item.height * 0.78}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="${Math.max(16, Math.floor(item.width * 0.045))}" 
          fill="${item.primary}" 
          letter-spacing="4" 
          text-anchor="middle">
      ${item.name.toUpperCase()}
    </text>

    <!-- Subtítulo e Tier Oficial -->
    <text x="${item.width / 2}" y="${item.height * 0.86}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="700" 
          font-size="${Math.max(11, Math.floor(item.width * 0.024))}" 
          fill="${item.accent}" 
          letter-spacing="2" 
          text-anchor="middle" 
          opacity="0.9">
      ${item.subtitle}
    </text>
  </svg>`
}

async function buildAll() {
  console.log('Iniciando geração de 38 assets WebP da VIP Collection 2.0...')

  for (const item of ASSET_SPECS) {
    const fullOutPath = path.join(root, item.outPath)
    const dir = path.dirname(fullOutPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const svgContent = generateSvgArt(item)
    await sharp(Buffer.from(svgContent))
      .webp({ quality: 92, lossless: false })
      .toFile(fullOutPath)

    const stat = fs.statSync(fullOutPath)
    console.log(`  [OK] ${item.id} -> ${item.outPath} (${stat.size} bytes)`)
  }

  console.log('\nTodos os 38 assets WebP foram gerados com sucesso!')
}

buildAll().catch(err => {
  console.error('Erro ao gerar assets:', err)
  process.exit(1)
})
