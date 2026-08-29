import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

function cleanDuplicates() {
  const dir = path.join(process.cwd(), 'public', 'arenas')
  const filesToDelete = [
    'arena-1.jpg',
    'arena-2.jpg',
    'arena-6.jpg',
    'arena-batalha-medieval.jpg',
    'arena-castelo-obidos.jpg',
    'arena-corte-portuguesa.jpg',
    'arena-costa-atlantica.jpg',
    'arena-era-descobrimentos.jpg',
    'arena-madeira-noite.jpg',
    'arena-madeira-tropical.jpg',
    'arena-portugal-medieval.jpg',
    'arena-praca-liberdade.jpg',
  ]

  console.log('--- ELIMINANDO AS 12 CÓPIAS BINÁRIAS REDUNDANTES ---')
  filesToDelete.forEach(f => {
    const p = path.join(dir, f)
    if (fs.existsSync(p)) {
      fs.unlinkSync(p)
      console.log(`🗑️ Eliminado duplicado: ${f}`)
    } else {
      console.log(`ℹ️ Ficheiro já não existia: ${f}`)
    }
  })

  const remainingFiles = fs.readdirSync(dir)
  const hashMap = new Map<string, string>()
  const duplicates: string[] = []

  remainingFiles.forEach(f => {
    const p = path.join(dir, f)
    const buf = fs.readFileSync(p)
    const hash = crypto.createHash('sha256').update(buf).digest('hex')
    if (hashMap.has(hash)) {
      duplicates.push(`${f} (mesmo hash que ${hashMap.get(hash)})`)
    } else {
      hashMap.set(hash, f)
    }
  })

  console.log('\n--- ESTADO APÓS LIMPEZA ---')
  console.log(`• Ficheiros físicos restantes: ${remainingFiles.length}`)
  console.log(`• Hashes únicos: ${hashMap.size}`)
  console.log(`• Duplicados restantes: ${duplicates.length}`)
}

cleanDuplicates()
