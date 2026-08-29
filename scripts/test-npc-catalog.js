const { NPC_CATALOG } = require('../lib/npc-system/npc-catalog');
const { OFFICIAL_20_DISTRICTS } = require('../lib/npc-system/npc-catalog');

console.log('Total NPCs in catalog:', NPC_CATALOG.length);
console.log('Sample NPC 0:', NPC_CATALOG[0]);
console.log('Sample NPC 10:', NPC_CATALOG[10]);

// Check district distribution
const distCount = {};
OFFICIAL_20_DISTRICTS.forEach(d => distCount[d] = 0);
NPC_CATALOG.forEach(npc => {
  distCount[npc.district] = (distCount[npc.district] || 0) + 1;
});

console.log('\nDistrict NPC Counts:');
console.log(distCount);

// Check XP distribution
const zeroXpNpcs = NPC_CATALOG.filter(n => !n.xp || n.xp <= 0);
console.log('\nNPCs with 0 XP:', zeroXpNpcs.length);
console.log('Min XP:', Math.min(...NPC_CATALOG.map(n => n.xp)));
console.log('Max XP:', Math.max(...NPC_CATALOG.map(n => n.xp)));
