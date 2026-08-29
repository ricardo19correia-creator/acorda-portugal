const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const shopArenasFile = path.join(process.cwd(), 'src', 'data', 'shopArenas.ts');
const content = fs.readFileSync(shopArenasFile, 'utf8');

// Parse arenas accurately
const lines = content.split('\n');
const arenas = [];
let current = null;

lines.forEach((line) => {
  const idMatch = line.match(/id:\s*'([^']+)'/);
  if (idMatch) {
    if (current && current.id && current.id !== 'arena_fallback') {
      arenas.push(current);
    }
    current = { id: idMatch[1] };
    return;
  }
  if (!current) return;
  const nameMatch = line.match(/name:\s*'([^']+)'/);
  if (nameMatch) current.name = nameMatch[1];
  const catMatch = line.match(/category:\s*'([^']+)'/);
  if (catMatch) current.category = catMatch[1];
  const shopMatch = line.match(/shopImage:\s*'([^']+)'/);
  if (shopMatch) current.shopImage = shopMatch[1];
  const gameMatch = line.match(/gameBackground:\s*'([^']+)'/);
  if (gameMatch) current.gameBackground = gameMatch[1];
  const duelMatch = line.match(/duelBackground:\s*'([^']+)'/);
  if (duelMatch) current.duelBackground = duelMatch[1];
});

if (current && current.id && current.id !== 'arena_fallback') {
  arenas.push(current);
}

console.log(`Total Arenas no Catálogo: ${arenas.length}`);
arenas.forEach((a, idx) => {
  console.log(`${idx + 1}. [${a.id}] ${a.name}`);
  console.log(`   - shopImage: ${a.shopImage}`);
  console.log(`   - gameBackground: ${a.gameBackground}`);
  console.log(`   - duelBackground: ${a.duelBackground}`);
});

const shopHashes = new Map();
const allHashes = new Map();
const duplicates = [];
const collisions = [];

arenas.forEach((a) => {
  const shopPath = path.join(process.cwd(), 'public', (a.shopImage || '').replace(/^\//, ''));
  const gamePath = path.join(process.cwd(), 'public', (a.gameBackground || '').replace(/^\//, ''));
  const duelPath = path.join(process.cwd(), 'public', (a.duelBackground || '').replace(/^\//, ''));

  const sHash = getFileHash(shopPath);
  const gHash = getFileHash(gamePath);
  const dHash = getFileHash(duelPath);

  if (!sHash) {
    console.error(`❌ MISSING shopImage file for ${a.id}: ${a.shopImage}`);
  } else {
    if (shopHashes.has(sHash)) {
      duplicates.push({
        arenaA: shopHashes.get(sHash),
        arenaB: a.id,
        shopImage: a.shopImage,
      });
    } else {
      shopHashes.set(sHash, a.id);
    }
  }

  if (sHash && gHash && sHash === gHash) {
    collisions.push({
      id: a.id,
      shopImage: a.shopImage,
      gameBackground: a.gameBackground,
      type: 'SHOP_GAME_SAME_FILE',
    });
  }

  if (sHash && dHash && sHash === dHash) {
    collisions.push({
      id: a.id,
      shopImage: a.shopImage,
      duelBackground: a.duelBackground,
      type: 'SHOP_DUEL_SAME_FILE',
    });
  }
});

console.log('\n--- AUDITORIA DE HASHES ---');
console.log(`Duplicate shop images: ${duplicates.length}`, duplicates);
console.log(`Collisions (Shop vs Gameplay): ${collisions.length}`, collisions);
