// Teste de validação dos 20 distritos no Ranking

const { ALL_DISTRICTS_LIST } = require('../lib/rankings.ts');
const { NPC_CATALOG } = require('../lib/npc-system/npc-catalog.ts');

console.log('=== TESTE DE VALIDAÇÃO DOS 20 DISTRITOS NO RANKING ===\n');

// 1. Validar que todos os 20 distritos têm NPCs no catálogo
const districtMap = {};
ALL_DISTRICTS_LIST.forEach(d => {
  districtMap[d] = {
    name: d,
    players: [],
    totalXp: 0
  };
});

NPC_CATALOG.forEach(npc => {
  const match = ALL_DISTRICTS_LIST.find(d => d.toLowerCase() === npc.district.toLowerCase());
  if (match) {
    districtMap[match].players.push(npc);
    districtMap[match].totalXp += npc.xp;
  }
});

let allPopulated = true;
ALL_DISTRICTS_LIST.forEach(d => {
  const dist = districtMap[d];
  const count = dist.players.length;
  const xp = dist.totalXp;
  const ok = count >= 5 && xp > 0;
  if (!ok) allPopulated = false;
  console.log(` - Distrito: ${d.padEnd(18, ' ')} | Jogadores: ${count.toString().padStart(2, ' ')} | XP Total: ${xp.toLocaleString('pt-PT').padStart(11, ' ')} XP ${ok ? '✅' : '❌'}`);
});

console.log('\nResultado da População dos 20 Distritos:', allPopulated ? '✅ 100% DOS 20 DISTRITOS COBERTOS' : '❌ ERRO: Distritos vazios');
