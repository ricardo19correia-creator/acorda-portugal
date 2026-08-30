import { NPC_CATALOG, OFFICIAL_20_DISTRICTS } from '../lib/npc-system/npc-catalog'

console.log('======================================================================')
console.log('🇵🇹 ACORDA PORTUGAL — VERIFICAÇÃO DO NOVO CATÁLOGO CALIBRADO DE BOTS')
console.log('======================================================================\n')

const totalBots = NPC_CATALOG.length
const xpValues = NPC_CATALOG.map((b) => b.xp).sort((a, b) => b - a)
const topBotXp = xpValues[0]
const minBotXp = xpValues[xpValues.length - 1]
const totalXp = xpValues.reduce((a, b) => a + b, 0)
const avgBotXp = Math.round(totalXp / totalBots)
const medianBotXp = xpValues[Math.floor(totalBots / 2)]

console.log(`Total de Bots: ${totalBots}`)
console.log(`Maior XP Bot: ${topBotXp.toLocaleString('pt-PT')} XP (${NPC_CATALOG.find((b) => b.xp === topBotXp)?.displayName})`)
console.log(`Menor XP Bot: ${minBotXp.toLocaleString('pt-PT')} XP (${NPC_CATALOG.find((b) => b.xp === minBotXp)?.displayName})`)
console.log(`XP Médio Bot: ${avgBotXp.toLocaleString('pt-PT')} XP`)
console.log(`XP Mediano Bot: ${medianBotXp.toLocaleString('pt-PT')} XP`)

// Distribuição por nível
const levelCounts: Record<number, number> = {}
NPC_CATALOG.forEach((b) => {
  levelCounts[b.level] = (levelCounts[b.level] || 0) + 1
})

console.log('\n--- DISTRIBUIÇÃO POR NÍVEL ---')
Object.keys(levelCounts)
  .sort((a, b) => Number(a) - Number(b))
  .forEach((lvl) => {
    console.log(`  Nível ${lvl}: ${levelCounts[Number(lvl)]} bots (${((levelCounts[Number(lvl)] / totalBots) * 100).toFixed(1)}%)`)
  })

// Distribuição por distrito
const districtCounts: Record<string, number> = {}
OFFICIAL_20_DISTRICTS.forEach((d) => {
  districtCounts[d] = 0
})
NPC_CATALOG.forEach((b) => {
  districtCounts[b.district] = (districtCounts[b.district] || 0) + 1
})

console.log('\n--- DISTRIBUIÇÃO POR DISTRITO (20 DISTRITOS / ILHAS) ---')
OFFICIAL_20_DISTRICTS.forEach((d) => {
  console.log(`  ${d.padEnd(20, ' ')}: ${districtCounts[d]} bots`)
})

console.log('\n--- TOP 10 BOTS DO RANKING NACIONAL ---')
NPC_CATALOG.slice()
  .sort((a, b) => b.xp - a.xp)
  .slice(0, 10)
  .forEach((b, idx) => {
    console.log(`  #${idx + 1} ${b.displayName.padEnd(24, ' ')} | ${b.district.padEnd(16, ' ')} | Nível ${b.level} | ${b.xp.toLocaleString('pt-PT')} XP | ${b.wins} Vitórias`)
  })

console.log('\n======================================================================')
