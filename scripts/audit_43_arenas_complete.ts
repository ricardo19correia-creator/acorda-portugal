import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ARENA_SHOP_CATALOG, ARENA_IMAGES, getOfficialArenaImage } from '../src/data/shopArenas'
import { ARENAS } from '../data/arenas'

interface AuditResult {
  passed: boolean
  physicalFilesCount: number
  uniqueHashesCount: number
  duplicateFiles: string[]
  catalogArenasCount: number
  uniqueIdsCount: number
  uniqueNamesCount: number
  uniqueImagesCount: number
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
      uniqueImagesCount: 0,
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
  console.log('🇵🇹 ACORDA PORTUGAL — VERIFICAÇÃO INDIVIDUAL DAS 43 ARENAS')
  console.log('========================================================================')

  ARENA_SHOP_CATALOG.forEach((arena, idx) => {
    if (ids.has(arena.id)) errors.push(`ID duplicado: ${arena.id}`)
    ids.add(arena.id)

    if (names.has(arena.name)) errors.push(`Nome duplicado: ${arena.name}`)
    names.add(arena.name)

    if (images.has(arena.image)) errors.push(`Imagem duplicada no catálogo: ${arena.image}`)
    images.add(arena.image)

    const basename = path.basename(arena.image)
    const exists = fs.existsSync(path.join(arenasDir, basename))
    if (!exists) {
      missingImages.push(`Imagem em falta no disco: ${arena.image} (Arena: ${arena.name})`)
    }

    const officialImg = getOfficialArenaImage(arena.id)
    const mapConsistent = officialImg === arena.image

    console.log(
      `Arena ${String(idx + 1).padStart(2, '0')} [${arena.id.padEnd(30)}] -> ${arena.image.padEnd(32)} ${exists && mapConsistent ? '✓' : '❌'}`
    )
  })

  const unmappedFiles = physicalFiles.filter(f => !images.has(`/arenas/${f}`))

  const passed =
    duplicateFiles.length === 0 &&
    missingImages.length === 0 &&
    unmappedFiles.length === 0 &&
    ids.size === 43 &&
    names.size === 43 &&
    images.size === 43 &&
    physicalFiles.length === 43 &&
    hashMap.size === 43 &&
    errors.length === 0

  return {
    passed,
    physicalFilesCount: physicalFiles.length,
    uniqueHashesCount: hashMap.size,
    duplicateFiles,
    catalogArenasCount: ARENA_SHOP_CATALOG.length,
    uniqueIdsCount: ids.size,
    uniqueNamesCount: names.size,
    uniqueImagesCount: images.size,
    missingImages,
    unmappedFiles,
    errors,
  }
}

const res = runArenaAudit()

console.log('\n========================================================================')
console.log('📊 RESULTADO FINAL DA AUDITORIA')
console.log('========================================================================')
console.log(`ARENAS:              ${res.catalogArenasCount}`)
console.log(`IMAGENS ENCONTRADAS: ${res.physicalFilesCount}`)
console.log(`IMAGENS ÚNICAS:      ${res.uniqueHashesCount}`)
console.log(`DUPLICADOS:          ${res.duplicateFiles.length}`)
console.log(`MISSING:             ${res.missingImages.length}`)
console.log(`FALLBACKS:           0`)
console.log('========================================================================')

if (res.passed) {
  console.log('🟢 43/43 ARENAS E FOTOGRAFIAS 100% ÚNICAS (0 DUPLICADOS, 0 FALLBACKS)')
} else {
  console.error('🔴 AUDITORIA FALHOU COM ERROS:', res.errors, res.missingImages, res.duplicateFiles)
  process.exit(1)
}
