import fs from 'fs'
import path from 'path'
import { VIP_CATALOG } from '../src/data/vipCatalog'

console.log(`Checking ${VIP_CATALOG.length} VIP products in catalog...`)
let failed = 0
for (const p of VIP_CATALOG) {
  const assetOnDisk = path.resolve(process.cwd(), p.assetPath.replace(/^\//, 'public/'))
  if (!fs.existsSync(assetOnDisk)) {
    console.error(`[FAIL] Product ${p.id} (${p.name}): missing asset at ${p.assetPath}`)
    failed++
  } else {
    console.log(`[PASS] ${p.id} -> ${p.name} | ${p.assetPath} (${fs.statSync(assetOnDisk).size} bytes)`)
  }
}

if (failed === 0) {
  console.log(`\n>>> SUCCESS: ALL ${VIP_CATALOG.length} VIP PRODUCTS HAVE VERIFIED ASSETS ON DISK!`)
} else {
  console.error(`\n>>> ERROR: ${failed} products have broken asset paths!`)
  process.exit(1)
}
