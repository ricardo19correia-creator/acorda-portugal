import fs from 'fs'
import path from 'path'

const VIP_ASSETS = [
  'public/arenas/vip/palacio-nacional.svg',
  'public/arenas/vip/estadio-lendas.svg',
  'public/arenas/vip/portugal-3d.svg',
  'public/arenas/vip/trono-real.svg',
  'public/arenas/vip/castelo-campeoes.svg',
  'public/arenas/vip/ceu-lusitano.svg',
  'public/arenas/vip/ultimate/trono-supremo-campeao.webp',
  'public/arenas/vip/ultimate/portugal-celestial.webp',
  'public/arenas/vip/ultimate/coliseu-campeoes.webp',
  'public/arenas/vip/ultimate/palacio-reis.webp',
  'public/arenas/vip/ultimate/cidadela-eterna.webp',
  'public/arenas/vip/ultimate/trono-supremo-campeao.svg',
  'public/arenas/vip/ultimate/portugal-celestial.svg',
  'public/arenas/vip/ultimate/coliseu-campeoes.svg',
  'public/arenas/vip/ultimate/palacio-reis.svg',
  'public/arenas/vip/ultimate/cidadela-eterna.svg',
]

const STORE_VIP_ASSETS = [
  'public/images/avatars/vip/signature/dragao-portugal.webp',
  'public/images/avatars/vip/signature/guardiao-nacao.webp',
  'public/images/avatars/vip/signature/imperador-lusitano.webp',
  'public/images/avatars/vip/signature/navegador-eterno.webp',
  'public/images/frames/vip/coroa-imperio.webp',
  'public/images/frames/vip/diamante-lusitano.webp',
  'public/images/frames/vip/fogo-campeao.webp',
  'public/images/frames/vip/portugal-ouro.webp',
  'public/images/frames/vip/trono-celestial.webp',
  'public/images/titles/vip/campeao-eterno.webp',
  'public/images/titles/vip/cerebro-nacional.webp',
  'public/images/titles/vip/imperador-desafio.webp',
  'public/images/titles/vip/lenda-portugal.webp',
  'public/images/titles/vip/mestre-lusitano.webp',
  'public/images/titles/vip/senhor-desafio.webp',
  'public/images/emotes/vip/acabou.webp',
  'public/images/emotes/vip/coroa-te.webp',
  'public/images/emotes/vip/mestre-absoluto.webp',
  'public/images/emotes/vip/nem-acredito.webp',
  'public/images/emotes/vip/portugal-no-topo.webp',
  'public/images/emotes/vip/respeito.webp',
  'public/images/taunts/vip/final-boss/icon.webp',
  'public/images/taunts/vip/guerra-campeoes/icon.webp',
  'public/images/taunts/vip/lusitano-implacavel/icon.webp',
  'public/images/taunts/vip/realeza-absoluta/icon.webp',
  'public/bundles/vip/campeao-eterno/banner.webp',
  'public/bundles/vip/imperial/banner.webp',
  'public/bundles/vip/lusitano-supremo/banner.webp',
  'public/ultimate/vip/identidade-campeao/showcase.webp',
  'public/ultimate/vip/legenda-nacional/showcase.webp',
  'public/ultimate/vip/senhor-portugal/showcase.webp',
  'public/ultimate/vip/trono-desafio/showcase.webp',
  'public/ultimate/vip/ultimo-desafio/showcase.webp',
]

console.log('=== VERIFYING VIP ARENAS ===')
let missing = 0
for (const f of VIP_ASSETS) {
  const p = path.resolve(process.cwd(), f)
  if (fs.existsSync(p)) {
    console.log(`[OK] ${f} (${fs.statSync(p).size} bytes)`)
  } else {
    console.error(`[MISSING] ${f}`)
    missing++
  }
}

console.log('\n=== VERIFYING STORE VIP ASSETS ===')
for (const f of STORE_VIP_ASSETS) {
  const p = path.resolve(process.cwd(), f)
  if (fs.existsSync(p)) {
    console.log(`[OK] ${f} (${fs.statSync(p).size} bytes)`)
  } else {
    console.error(`[MISSING] ${f}`)
    missing++
  }
}

if (missing === 0) {
  console.log('\n>>> ALL 49 VIP ASSET FILES EXIST 100% ON DISK!')
} else {
  console.error(`\n>>> FAILED: ${missing} files missing!`)
  process.exit(1)
}
