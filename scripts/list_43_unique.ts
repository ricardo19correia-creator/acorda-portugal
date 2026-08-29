import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

function listRemaining43() {
  const dir = path.join(process.cwd(), 'public', 'arenas')
  const files = fs.readdirSync(dir).sort()

  console.log(`=== AS 43 FOTOGRAFIAS OFICIAIS ÚNICAS EM public/arenas/ ===\n`)
  files.forEach((f, idx) => {
    const p = path.join(dir, f)
    const stat = fs.statSync(p)
    const buf = fs.readFileSync(p)
    const hash = crypto.createHash('sha256').update(buf).digest('hex')
    console.log(`${String(idx + 1).padStart(2, '0')}. ${f.padEnd(28)} | ${(stat.size / 1024).toFixed(1).padStart(7)} KB | hash: ${hash.substring(0, 12)}`)
  })
}

listRemaining43()
