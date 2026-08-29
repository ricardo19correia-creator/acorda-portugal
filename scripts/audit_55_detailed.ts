import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

interface FileAudit {
  name: string
  sizeBytes: number
  sizeKb: string
  hash: string
  ext: string
}

function runDetailedAudit() {
  const arenasDir = path.join(process.cwd(), 'public', 'arenas')
  if (!fs.existsSync(arenasDir)) {
    console.error(`Diretório ${arenasDir} não existe!`)
    return
  }

  const files = fs.readdirSync(arenasDir)
  const auditList: FileAudit[] = []
  const hashGroups = new Map<string, string[]>()

  for (const file of files) {
    const fullPath = path.join(arenasDir, file)
    const stat = fs.statSync(fullPath)
    const buffer = fs.readFileSync(fullPath)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    auditList.push({
      name: file,
      sizeBytes: stat.size,
      sizeKb: (stat.size / 1024).toFixed(1),
      hash,
      ext: path.extname(file).toLowerCase(),
    })

    if (!hashGroups.has(hash)) {
      hashGroups.set(hash, [])
    }
    hashGroups.get(hash)!.push(file)
  }

  console.log('================================================================================')
  console.log('📋 AUDITORIA FÍSICA DETALHADA DAS 55 FOTOGRAFIAS EM public/arenas')
  console.log('================================================================================\n')

  console.log(`• Ficheiros Totais Encontrados: ${auditList.length}`)
  console.log(`• Imagens com Hash Único (Distintas): ${hashGroups.size}`)
  console.log(`• Ficheiros com Conteúdo Duplicado: ${auditList.length - hashGroups.size}\n`)

  console.log('--- TABELA DE TODOS OS 55 FICHEIROS ENCONTRADOS ---')
  auditList.forEach((f, idx) => {
    const isDup = hashGroups.get(f.hash)!.length > 1
    console.log(
      `${String(idx + 1).padStart(2, '0')}. ${f.name.padEnd(32)} | ${f.sizeKb.padStart(8)} KB | ${f.ext.padEnd(5)} | Hash: ${f.hash.substring(0, 12)} ${isDup ? '⚠️ (DUPLICADO)' : '✅ (ÚNICO)'}`
    )
  })

  console.log('\n--- AGRUPAMENTO DE DUPLICADOS ENCONTRADOS ---')
  let dupGroupIdx = 1
  hashGroups.forEach((fileList, hash) => {
    if (fileList.length > 1) {
      console.log(`[Grupo ${dupGroupIdx}] Hash SHA-256: ${hash.substring(0, 16)}... (${fileList.length} ficheiros idênticos):`)
      fileList.forEach(fn => console.log(`   - ${fn}`))
      dupGroupIdx++
    }
  })

  console.log('\n--- RESUMO DE IDENTIDADES ÚNICAS DISPONÍVEIS ---')
  console.log(`Imagens Reais Únicas: ${hashGroups.size}`)
}

runDetailedAudit()
