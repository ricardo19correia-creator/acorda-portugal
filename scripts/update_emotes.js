const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'src', 'data', 'emotes.ts')
let content = fs.readFileSync(filePath, 'utf8')

// PROV_010: 2500
content = content.replace(/(id:\s*['"]PROV_010['"][\s\S]*?price:\s*)\d+/, '$12500')

// Comuns: 1000 -> 350
content = content.replace(/(rarity:\s*['"]Comum['"][\s\S]*?price:\s*)1000/g, '$1350')

// Raros: 5000 -> 750
content = content.replace(/(rarity:\s*['"]Raro['"][\s\S]*?price:\s*)5000/g, '$1750')

// Épicos: 16000 -> 1500
content = content.replace(/(rarity:\s*['"]Épico['"][\s\S]*?price:\s*)16000/g, '$11500')

// Lendários: 45000 -> 2500
content = content.replace(/(rarity:\s*['"]Lendário['"][\s\S]*?price:\s*)45000/g, '$12500')

// Míticos: 85000 -> 3500
content = content.replace(/(rarity:\s*['"]Mítico['"][\s\S]*?price:\s*)85000/g, '$13500')

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully rebalanced src/data/emotes.ts prices!')
