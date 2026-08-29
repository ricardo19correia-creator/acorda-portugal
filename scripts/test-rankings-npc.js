const fs = require('fs');
const path = require('path');

// Ler e parsear NPC_CATALOG diretamente
const catalogPath = path.join(__dirname, '..', 'lib', 'npc-system', 'npc-catalog.ts');
const catalogContent = fs.readFileSync(catalogPath, 'utf8');

// Obter NPCs gerados
const { NPC_CATALOG, OFFICIAL_20_DISTRICTS } = require('../lib/npc-system/npc-catalog.ts');

console.log('=== TESTE DE INTEGRAÇÃO DE NPCS E RANKINGS ===');
console.log('Total de NPCs no Catálogo:', NPC_CATALOG.length);

// 1. Validar que nenhum NPC tem 0 XP
const zeroXpNpcs = NPC_CATALOG.filter(n => typeof n.xp !== 'number' || isNaN(n.xp) || n.xp <= 0);
console.log('NPCs com 0 XP ou inválidos:', zeroXpNpcs.length);

if (zeroXpNpcs.length > 0) {
  console.error('❌ ERRO: Existem NPCs com 0 XP!');
  process.exit(1);
} else {
  console.log('✅ 100% dos NPCs têm XP positivo e calibrado!');
}

// 2. Validar distribuição pelos 20 distritos
const distMap = {};
OFFICIAL_20_DISTRICTS.forEach(d => distMap[d] = { count: 0, totalXp: 0 });

NPC_CATALOG.forEach(npc => {
  if (distMap[npc.district]) {
    distMap[npc.district].count++;
    distMap[npc.district].totalXp += npc.xp;
  }
});

console.log('\nDistribuição Distrital dos NPCs:');
let allDistrictsValid = true;
OFFICIAL_20_DISTRICTS.forEach(d => {
  const stat = distMap[d];
  const isValid = stat && stat.count >= 5 && stat.totalXp > 50000;
  if (!isValid) allDistrictsValid = false;
  console.log(` - [${d.padEnd(18, ' ')}] Jogadores: ${stat.count} | XP Total: ${stat.totalXp.toLocaleString('pt-PT')} XP ${isValid ? '✅' : '❌'}`);
});

if (allDistrictsValid) {
  console.log('\n✅ Todos os 20 distritos de Portugal possuem população e XP ativo!');
} else {
  console.error('\n❌ ERRO: Existem distritos sem jogadores suficientes ou sem XP!');
  process.exit(1);
}

console.log('\n=== TOP 10 NACIONAL DE NPCS ===');
const sortedNational = [...NPC_CATALOG].sort((a, b) => b.xp - a.xp).slice(0, 10);
sortedNational.forEach((p, idx) => {
  console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${p.displayName.padEnd(25, ' ')} | Nível: ${p.level.toString().padStart(2, ' ')} | Distrito: ${p.district.padEnd(16, ' ')} | XP: ${p.xp.toLocaleString('pt-PT').padStart(10, ' ')} XP | Vitórias: ${p.wins}`);
});
