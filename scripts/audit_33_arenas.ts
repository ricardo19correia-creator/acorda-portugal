import fs from 'fs'
import path from 'path'
import { ARENA_SHOP_CATALOG, getArenaById } from '../src/data/shopArenas'
import { getArenaAssets } from '../lib/arena-assets'

const PUBLIC_ARENAS_DIR = path.join(process.cwd(), 'public', 'arenas')

interface AuditRow {
  index: number
  id: string
  name: string
  category: string
  rarity: string
  price: number | null
  effect: string
  isClean: boolean
  isCatalogued: boolean
  isResolvable: boolean
  status: 'OK' | 'FAIL'
}

async function runAudit() {
  console.log('================================================================================')
  console.log('🔍 ACORDA PORTUGAL — AUDITORIA DE LIMPEZA DAS 33 ARENAS')
  console.log('================================================================================\n')

  const physicalFiles = fs.existsSync(PUBLIC_ARENAS_DIR)
    ? fs.readdirSync(PUBLIC_ARENAS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'))
    : []

  const rows: AuditRow[] = []

  ARENA_SHOP_CATALOG.forEach((arena, idx) => {
    const byId = getArenaById(arena.id)
    const assets = getArenaAssets(arena.id)

    const isClean = !(arena as any).image && !(arena as any).shopImage && !(arena as any).gameBackground
    const isCatalogued = Boolean(arena.id && arena.name && arena.category)
    const isResolvable = byId.id === arena.id && assets.id === arena.id

    const status = isClean && isCatalogued && isResolvable ? 'OK' : 'FAIL'

    rows.push({
      index: idx + 1,
      id: arena.id,
      name: arena.name,
      category: arena.category,
      rarity: arena.rarity,
      price: arena.price,
      effect: arena.effect,
      isClean,
      isCatalogued,
      isResolvable,
      status,
    })
  })

  console.log(`Arenas no Catálogo: ${ARENA_SHOP_CATALOG.length} / 33`)
  console.log(`Ficheiros Físicos Antigos Restantes em public/arenas: ${physicalFiles.length} (esperado: 0)`)
  console.log(`Arenas com Imagens Limpas: ${rows.filter(r => r.isClean).length} / 33`)
  console.log(`Arenas Resolvíveis: ${rows.filter(r => r.isResolvable).length} / 33`)

  const allPassed = rows.every(r => r.status === 'OK') && physicalFiles.length === 0
  console.log(`\nRESULTADO DA AUDITORIA: ${allPassed ? '✅ 33/33 PASS (CLEAN)' : '❌ FAIL'}`)
}

runAudit()
