import fs from 'fs'
import path from 'path'
import { VIP_CATALOG } from '../src/data/vipCatalog'

const root = process.cwd()
const storeDir = path.join(root, 'public', 'store')
const storeVipDir = path.join(storeDir, 'vip')

if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true })
if (!fs.existsSync(storeVipDir)) fs.mkdirSync(storeVipDir, { recursive: true })

const brainDir = 'C:\\Users\\Riky Moreira\\.gemini\\antigravity\\brain\\1a12ea78-235a-4376-a9af-ce42311e6e97'

const generatedMap = {
  'imperador-lusitano.webp': path.join(brainDir, 'imperador_lusitano_1788542284586.jpg'),
  'dragao-portugal.webp': path.join(brainDir, 'dragao_portugal_1788542305690.jpg'),
  'navegador-eterno.webp': path.join(brainDir, 'navegador_eterno_1788542328512.jpg'),
  'guardiao-nacao.webp': path.join(brainDir, 'guardiao_nacao_1788542348645.jpg'),
  'trono-campeao.webp': path.join(brainDir, 'trono_campeao_1788542371026.jpg'),
  'portugal-celestial.webp': path.join(brainDir, 'portugal_celeste_1788542394106.jpg'),
  'coliseu-campeoes.webp': path.join(brainDir, 'coliseu_campeoes_1788542413992.jpg'),
}

// 1. Copy generated images to /public/store/
for (const [filename, sourcePath] of Object.entries(generatedMap)) {
  if (fs.existsSync(sourcePath)) {
    const dest = path.join(storeDir, filename)
    fs.copyFileSync(sourcePath, dest)
    console.log(`Copied to store: ${dest}`)
  } else {
    console.warn(`Source missing: ${sourcePath}`)
  }
}

// 2. Also copy to original avatar / arena paths so they have HD quality
const originalTargets = {
  'public/images/avatars/vip/signature/imperador-lusitano.webp': generatedMap['imperador-lusitano.webp'],
  'public/images/avatars/vip/signature/dragao-portugal.webp': generatedMap['dragao-portugal.webp'],
  'public/images/avatars/vip/signature/navegador-eterno.webp': generatedMap['navegador-eterno.webp'],
  'public/images/avatars/vip/signature/guardiao-nacao.webp': generatedMap['guardiao-nacao.webp'],
  'public/arenas/vip/ultimate/trono-supremo-campeao.webp': generatedMap['trono-campeao.webp'],
  'public/arenas/vip/ultimate/portugal-celestial.webp': generatedMap['portugal-celestial.webp'],
  'public/arenas/vip/ultimate/coliseu-campeoes.webp': generatedMap['coliseu-campeoes.webp'],
}

for (const [relDest, sourcePath] of Object.entries(originalTargets)) {
  if (fs.existsSync(sourcePath)) {
    const dest = path.join(root, relDest)
    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.copyFileSync(sourcePath, dest)
    console.log(`Updated HD in original path: ${relDest}`)
  }
}

// 3. For every VIP product in VIP_CATALOG, populate public/store/vip/[id].webp
for (const p of VIP_CATALOG) {
  const vipDest = path.join(storeVipDir, `${p.id}.webp`)
  // Determine best source
  let source = null
  if (p.id === 'AP-VIP-SIGNATURE-001') source = generatedMap['imperador-lusitano.webp']
  else if (p.id === 'AP-VIP-SIGNATURE-002') source = generatedMap['dragao-portugal.webp']
  else if (p.id === 'AP-VIP-SIGNATURE-003') source = generatedMap['navegador-eterno.webp']
  else if (p.id === 'AP-VIP-SIGNATURE-004') source = generatedMap['guardiao-nacao.webp']
  else if (p.id === 'AP-VIP-ARENA-ULTIMATE-001') source = generatedMap['trono-campeao.webp']
  else if (p.id === 'AP-VIP-ARENA-ULTIMATE-002') source = generatedMap['portugal-celestial.webp']
  else if (p.id === 'AP-VIP-ARENA-ULTIMATE-003') source = generatedMap['coliseu-campeoes.webp']
  else {
    const orig = path.join(root, 'public', p.assetPath.replace(/^\//, ''))
    if (fs.existsSync(orig)) source = orig
  }

  if (source && fs.existsSync(source)) {
    fs.copyFileSync(source, vipDest)
    console.log(`Populated /store/vip/${p.id}.webp`)
  }
}

console.log('Done setting up store assets!')
