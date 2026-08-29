import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

interface DuplicateGroup {
  groupId: number
  hash: string
  files: Array<{ name: string; size: number }>
  canonicalFile: string
  removeFiles: string[]
  rationale: string
}

function analyzeDuplicates() {
  const dir = path.join(process.cwd(), 'public', 'arenas')
  const files = fs.readdirSync(dir)

  const hashMap = new Map<string, Array<{ name: string; size: number }>>()

  files.forEach(f => {
    const fullPath = path.join(dir, f)
    const stat = fs.statSync(fullPath)
    const buf = fs.readFileSync(fullPath)
    const hash = crypto.createHash('sha256').update(buf).digest('hex')

    if (!hashMap.has(hash)) hashMap.set(hash, [])
    hashMap.get(hash)!.push({ name: f, size: stat.size })
  })

  console.log(`Total ficheiros analisados: ${files.length}`)
  console.log(`Hashes únicos: ${hashMap.size}`)

  const duplicateGroups: DuplicateGroup[] = []
  let gId = 1

  hashMap.forEach((fileList, hash) => {
    if (fileList.length > 1) {
      // Determinar qual é o ficheiro canónico com base no nome semântico mais descritivo
      let canonical = fileList[0].name
      let removeList: string[] = []

      // Preferir nomes semânticos (ex: 'praca-liberdade.jpg' sobre 'arena-1.jpg' ou 'arena-praca-liberdade.jpg')
      const sorted = [...fileList].sort((a, b) => {
        const isGenA = a.name.startsWith('arena-') && /arena-\d+\.jpg/.test(a.name)
        const isGenB = b.name.startsWith('arena-') && /arena-\d+\.jpg/.test(b.name)
        if (isGenA && !isGenB) return 1
        if (!isGenA && isGenB) return -1

        const isPrefixA = a.name.startsWith('arena-')
        const isPrefixB = b.name.startsWith('arena-')
        if (isPrefixA && !isPrefixB) return 1
        if (!isPrefixA && isPrefixB) return -1

        return a.name.length - b.name.length
      })

      canonical = sorted[0].name
      removeList = sorted.slice(1).map(x => x.name)

      duplicateGroups.push({
        groupId: gId++,
        hash: hash.substring(0, 16),
        files: fileList,
        canonicalFile: canonical,
        removeFiles: removeList,
        rationale: `Manter '${canonical}' por ter nome semântico canónico; eliminar cópia(s) redudante(s) '${removeList.join(', ')}'.`,
      })
    }
  })

  console.log('\n--- 12 GRUPOS DE DUPLICADOS E SELEÇÃO CANÓNICA ---')
  duplicateGroups.forEach(g => {
    console.log(`\nGRUPO ${g.groupId}:`)
    console.log(`  Hash: ${g.hash}...`)
    console.log(`  Ficheiros idênticos: ${g.files.map(f => f.name).join(' ↔ ')}`)
    console.log(`  Ficheiro Canónico a Manter: ✅ ${g.canonicalFile}`)
    console.log(`  Ficheiro(s) a Eliminar:     🗑️ ${g.removeFiles.join(', ')}`)
    console.log(`  Critério: ${g.rationale}`)
  })
}

analyzeDuplicates()
