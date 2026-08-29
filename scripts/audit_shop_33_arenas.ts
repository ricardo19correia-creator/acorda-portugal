import fs from 'fs'
import path from 'path'
import { ARENA_SHOP_CATALOG, ARENA_CATEGORIES_LIST, shopArenas } from '../src/data/shopArenas'
import { ARENAS, OFFICIAL_ARENAS } from '../src/data/arenas'

function auditShopArenas() {
  console.log('=== AUDITORIA COMPLETA DE ARENAS DA LOJA ===\n')

  const publicArenasDir = path.join(process.cwd(), 'public', 'arenas')
  const physicalFiles = fs.readdirSync(publicArenasDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'))

  console.log(`Ficheiros físicos em public/arenas: ${physicalFiles.length}`)
  console.log(`ARENA_SHOP_CATALOG em src/data/shopArenas.ts: ${ARENA_SHOP_CATALOG.length}`)
  console.log(`shopArenas em src/data/shopArenas.ts: ${shopArenas.length}`)
  console.log(`ARENAS em src/data/arenas.ts: ${ARENAS.length}`)
  console.log(`OFFICIAL_ARENAS em src/data/arenas.ts: ${OFFICIAL_ARENAS.length}\n`)

  console.log('--- CATEGORIAS DEFINIDAS NO FILTRO DA LOJA ---')
  ARENA_CATEGORIES_LIST.forEach(cat => {
    const matching = ARENA_SHOP_CATALOG.filter(a => cat.key === 'todos' || a.category === cat.key)
    console.log(`[${cat.icon}] ${cat.key} (${cat.label}): ${matching.length} arenas`)
  })

  console.log('\n--- LISTA COMPLETA DOS 33 ITENS DO CATÁLOGO ---')
  const foundImages = new Set<string>()
  const missingFiles: string[] = []

  ARENA_SHOP_CATALOG.forEach((a, i) => {
    const filename = path.basename(a.image)
    const exists = fs.existsSync(path.join(publicArenasDir, filename))
    foundImages.add(filename)
    if (!exists) missingFiles.push(filename)
    console.log(`${String(i + 1).padStart(2, '0')}. id: ${a.id.padEnd(28)} | cat: ${a.category.padEnd(12)} | file: ${filename.padEnd(26)} | exists: ${exists ? '✅' : '❌'} | name: ${a.name}`)
  })

  const physicalNotMapped = physicalFiles.filter(f => !foundImages.has(f))

  console.log('\n--- VERIFICAÇÃO DE DISCREPÂNCIAS ---')
  console.log(`Ficheiros físicos não mapeados no catálogo: ${physicalNotMapped.length}`, physicalNotMapped)
  console.log(`Ficheiros referenciados em falta no disco: ${missingFiles.length}`, missingFiles)
  console.log(`Total de imagens únicas mapeadas: ${foundImages.size} / 33`)
}

auditShopArenas()
