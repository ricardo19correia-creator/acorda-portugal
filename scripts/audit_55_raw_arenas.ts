import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

function auditRaw55() {
  const dir = path.join(process.cwd(), 'public', 'arenas')
  const files = fs.readdirSync(dir)

  console.log(`=== AUDITORIA FÍSICA DAS 55 FOTOGRAFIAS EM ${dir} ===\n`)
  console.log(`Total de ficheiros encontrados: ${files.length}`)

  const hashMap = new Map<string, string[]>()
  const rows: any[] = []

  files.forEach((file, index) => {
    const fullPath = path.join(dir, file)
    const stats = fs.statSync(fullPath)
    const buffer = fs.readFileSync(fullPath)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    if (!hashMap.has(hash)) {
      hashMap.set(hash, [])
    }
    hashMap.get(hash)!.push(file)

    rows.push({
      index: index + 1,
      file,
      sizeKb: (stats.size / 1024).toFixed(1),
      hash: hash.substring(0, 12),
      ext: path.extname(file),
    })
  })

  rows.forEach((r) => {
    console.log(`${String(r.index).padStart(2, '0')}. ${r.file.padEnd(32)} | ${r.sizeKb.padStart(6)} KB | ${r.ext.padEnd(5)} | hash: ${r.hash}`)
  })

  console.log('\n--- VERIFICAÇÃO DE HASHES DUPLICADOS ---')
  let duplicates = 0
  hashMap.forEach((fileList, hash) => {
    if (fileList.length > 1) {
      duplicates++
      console.log(`⚠️ Hash duplicado [${hash.substring(0, 12)}]:`, fileList)
    }
  })

  if (duplicates === 0) {
    console.log('✅ ZERO DUPLICADOS DE HASH! Todas as 55 fotografias têm conteúdo binário único.')
  } else {
    console.log(`⚠️ Encontrados ${duplicates} grupos de duplicados.`)
  }
}

auditRaw55()
