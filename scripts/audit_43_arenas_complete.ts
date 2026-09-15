import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ARENA_SHOP_CATALOG, ARENA_IMAGES, getOfficialArenaImage } from '../src/data/shopArenas'
import { CANONICAL_ARENAS, STANDARD_ARENAS, VIP_ARENAS } from '../src/data/arenaCatalog'
import { SUPREME_ARENAS } from '../lib/supreme-arenas'

interface AuditResult {
  passed: boolean
  physicalFilesCount: number
  uniqueHashesCount: number
  duplicateFiles: string[]
  catalogArenasCount: number
  uniqueIdsCount: number
  uniqueNamesCount: number
  missingImages: string[]
  unmappedFiles: string[]
  errors: string[]
}

export function runArenaAudit(): AuditResult {
  const arenasDir = path.join(process.cwd(), 'public', 'arenas')
  const errors: string[] = []

  if (!fs.existsSync(arenasDir)) {
    return {
      passed: false,
      physicalFilesCount: 0,
      uniqueHashesCount: 0,
      duplicateFiles: [],
      catalogArenasCount: 0,
      uniqueIdsCount: 0,
      uniqueNamesCount: 0,
      missingImages: ['Diretório public/arenas não existe'],
      unmappedFiles: [],
      errors: ['Diretório public/arenas não encontrado'],
    }
  }

  const physicalFiles = fs.readdirSync(arenasDir)
  const hashMap = new Map<string, string[]>()

  physicalFiles.forEach(f => {
    const fullPath = path.join(arenasDir, f)
    const buf = fs.readFileSync(fullPath)
    const hash = crypto.createHash('sha256').update(buf).digest('hex')
    if (!hashMap.has(hash)) hashMap.set(hash, [])
    hashMap.get(hash)!.push(f)
  })

  const duplicateFiles: string[] = []
  hashMap.forEach((fileList, hash) => {
    if (fileList.length > 1) {
      duplicateFiles.push(`Hash ${hash.substring(0, 10)}: [${fileList.join(', ')}]`)
    }
  })

  const ids = new Set<string>()
  const names = new Set<string>()
  const images = new Set<string>()
  const missingImages: string[] = []

  console.log('========================================================================')
  console.log(`🇵🇹 ACORDA PORTUGAL — AUDITORIA DAS ARENAS (${ARENA_SHOP_CATALOG.length} ITENS / ${physicalFiles.length} FICHEIROS FÍSICOS)`)
  console.log('========================================================================')

  ARENA_SHOP_CATALOG.forEach((arena, idx) => {
    if (ids.has(arena.id)) errors.push(`ID duplicado: ${arena.id}`)
    ids.add(arena.id)

    if (names.has(arena.name)) errors.push(`Nome duplicado: ${arena.name}`)
    names.add(arena.name)

    const img = arena.image || ''
    images.add(img)

    const basename = path.basename(img)
    const exists = Boolean(basename) && fs.existsSync(path.join(arenasDir, basename))
    if (!exists) {
      missingImages.push(`Imagem em falta no disco: ${img} (Arena: ${arena.name})`)
    }

    const officialImg = getOfficialArenaImage(arena.id)
    const mapConsistent = officialImg === img

    console.log(
      `Arena ${String(idx + 1).padStart(2, '0')} [${arena.id.padEnd(30)}] -> ${img.padEnd(36)} ${exists && mapConsistent ? '✓' : '❌'}`
    )
  })

  // Verificar STANDARD_ARENAS
  STANDARD_ARENAS.forEach(arena => {
    const basename = path.basename(arena.assetPath || '')
    if (!fs.existsSync(path.join(arenasDir, basename))) {
      missingImages.push(`STANDARD_ARENA em falta: ${arena.assetPath} (${arena.name})`)
    }
  })

  // Verificar VIP_ARENAS
  VIP_ARENAS.forEach(arena => {
    const basename = path.basename(arena.assetPath || '')
    if (!fs.existsSync(path.join(arenasDir, basename))) {
      missingImages.push(`VIP_ARENA em falta: ${arena.assetPath} (${arena.name})`)
    }
  })

  // Verificar CANONICAL_ARENAS
  CANONICAL_ARENAS.forEach(arena => {
    const basename = path.basename(arena.assetPath || '')
    if (!fs.existsSync(path.join(arenasDir, basename))) {
      missingImages.push(`CANONICAL_ARENA em falta: ${arena.assetPath} (${arena.name})`)
    }
    if (arena.effects !== 'none') {
      errors.push(`Efeito visual ativo na arena ${arena.id}: ${arena.effects}`)
    }
  })

  // Verificar 5 escalões (10 arenas por escalão)
  const tierCounts: Record<string, number> = {
    escalao_1: 0,
    escalao_2: 0,
    escalao_3: 0,
    escalao_4: 0,
    escalao_5: 0,
  }

  ARENA_SHOP_CATALOG.forEach(a => {
    if (a.category in tierCounts) {
      tierCounts[a.category]++
    } else {
      errors.push(`Categoria desconhecida: ${a.category} na arena ${a.id}`)
    }
    if (a.effect !== 'none') {
      errors.push(`Efeito ativo em ARENA_SHOP_CATALOG para ${a.id}: ${a.effect}`)
    }
  })

  Object.entries(tierCounts).forEach(([tier, count]) => {
    if (count !== 10) {
      errors.push(`Escalão ${tier} deve ter exatamente 10 arenas, mas tem ${count}`)
    }
  })

  // Starter arena
  const starter = ARENA_SHOP_CATALOG.find(a => a.id === 'arena_terreiro_dourado')
  if (!starter) {
    errors.push('Arena inicial arena_terreiro_dourado não encontrada no catálogo')
  } else if (starter.price !== 0 || !starter.unlockedByDefault) {
    errors.push(`Arena inicial deve ser grátis e unlockedByDefault (price=${starter.price}, unlocked=${starter.unlockedByDefault})`)
  }

  const mappedBasenames = new Set<string>()
  for (const p of Object.values(ARENA_IMAGES)) {
    mappedBasenames.add(path.basename(p))
  }
  const unmappedFiles = physicalFiles.filter(f => !mappedBasenames.has(f))

  const passed =
    duplicateFiles.length === 0 &&
    missingImages.length === 0 &&
    unmappedFiles.length === 0 &&
    physicalFiles.length === 50 &&
    ARENA_SHOP_CATALOG.length === 50 &&
    CANONICAL_ARENAS.length === 50 &&
    errors.length === 0

  return {
    passed,
    physicalFilesCount: physicalFiles.length,
    uniqueHashesCount: hashMap.size,
    duplicateFiles,
    catalogArenasCount: ARENA_SHOP_CATALOG.length,
    uniqueIdsCount: ids.size,
    uniqueNamesCount: names.size,
    missingImages,
    unmappedFiles,
    errors,
  }
}

const res = runArenaAudit()

console.log('\n========================================================================')
console.log('📊 RESULTADO FINAL DA AUDITORIA DE ARENAS (50 ARENAS SSOT)')
console.log('========================================================================')
console.log(`ARENAS NO CATÁLOGO:  ${res.catalogArenasCount}`)
console.log(`FICHEIROS EM DISCO:  ${res.physicalFilesCount}`)
console.log(`IMAGENS ÚNICAS:      ${res.uniqueHashesCount}`)
console.log(`DUPLICADOS:          ${res.duplicateFiles.length}`)
console.log(`FICHEIROS EM FALTA:  ${res.missingImages.length}`)
console.log(`NÃO MAPEADOS:        ${res.unmappedFiles.length}`)
console.log(`ERROS:               ${res.errors.length}`)
console.log('========================================================================')

if (res.passed) {
  console.log('🟢 TODAS AS 50/50 ARENAS 100% INTEGRADAS, VÁLIDAS E SEM EFEITOS VISUAIS!')
} else {
  console.error('🔴 AUDITORIA FALHOU COM ERROS:', res.errors, res.missingImages, res.duplicateFiles, res.unmappedFiles)
  process.exit(1)
}
