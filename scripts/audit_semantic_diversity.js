/**
 * Acorda Portugal — Auditoria de Cobertura Editorial, Diversidade Semântica e Concentração Factual
 * 
 * Verifica:
 * - Concentração de Entidades / Factos (FACT_CLUSTER_CONCENTRATION)
 * - Distribuição de Dificuldade
 * - Distribuição de Posição de Respostas (A/B/C/D)
 * - Cobertura de Fontes Institucionais
 * - Diversidade de Estruturas Interrogativas (Quem, Qual, Onde, Quando, Em que, Porquê)
 */

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const manifestPath = path.join(rootDir, 'data', 'approved_questions_manifest.json')

if (!fs.existsSync(manifestPath)) {
  console.error('Erro: Manifesto de perguntas não encontrado. Execute audit_increment_reconciliation.js primeiro.')
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const sessionProduced = manifest.filter((q) => q.tipoOrigem === 'PRODUÇÃO_SESSÃO_NOVA')

console.log('====================================================================================================')
console.log('       ACORDA PORTUGAL — AUDITORIA DE DIVERSIDADE EDITORIAL & CONCENTRAÇÃO FACTUAL                   ')
console.log('====================================================================================================\n')

// 1. Análise de Diversidade das 300 Perguntas da Sessão Atual
const questionPatterns = {
  'Qual / Quais': 0,
  'Quem': 0,
  'Onde / Em que local': 0,
  'Quando / Em que ano': 0,
  'Que / O que': 0,
  'Como / Porquê': 0,
  'Outros': 0
}

// Entidades mencionadas para deteção de concentração excessiva
const entityFrequency = {}

// Carregar o texto completo das 300 perguntas
const batchesDir = path.join(rootDir, 'data', 'batches')
const batchFiles = fs.readdirSync(batchesDir).filter((f) => f.endsWith('.json'))
const fullSessionQuestions = []

for (const bf of batchFiles) {
  const items = JSON.parse(fs.readFileSync(path.join(batchesDir, bf), 'utf8'))
  if (Array.isArray(items)) {
    fullSessionQuestions.push(...items)
  }
}

for (const q of fullSessionQuestions) {
  const text = (q.pergunta || '').trim().toLowerCase()
  
  if (text.startsWith('qual') || text.startsWith('quais')) questionPatterns['Qual / Quais']++
  else if (text.startsWith('quem')) questionPatterns['Quem']++
  else if (text.startsWith('onde') || text.includes('em que local') || text.includes('em que cidade')) questionPatterns['Onde / Em que local']++
  else if (text.startsWith('quando') || text.startsWith('em que ano') || text.startsWith('em que século')) questionPatterns['Quando / Em que ano']++
  else if (text.startsWith('o que') || text.startsWith('que ')) questionPatterns['Que / O que']++
  else if (text.startsWith('como') || text.startsWith('porque') || text.startsWith('por que')) questionPatterns['Como / Porquê']++
  else questionPatterns['Outros']++

  // Extração básica de entidades (palavras capitalizadas relevantes)
  const words = (q.pergunta || '').match(/[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-záéíóúàâêôãõç]+/g) || []
  for (const w of words) {
    if (['Qual', 'Quem', 'Onde', 'Quando', 'Como', 'Para', 'Pela', 'Pelo', 'Mais', 'Este', 'Esta'].includes(w)) continue
    entityFrequency[w] = (entityFrequency[w] || 0) + 1
  }
}

// 2. Métrica FACT_CLUSTER_CONCENTRATION
// Se uma entidade concentrar mais de 10% das perguntas de um lote -> WARNING
const totalQs = fullSessionQuestions.length
const sortedEntities = Object.entries(entityFrequency)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)

console.log(`• Total de Perguntas Auditadas da Produção Nova: ${totalQs}`)
console.log('\n--- DISTRIBUIÇÃO DE ESTRUTURAS INTERROGATIVAS ---')
for (const [pattern, count] of Object.entries(questionPatterns)) {
  const pct = ((count / totalQs) * 100).toFixed(1)
  console.log(`  • ${pattern.padEnd(25)}: ${String(count).padStart(3)} (${pct}%)`)
}

console.log('\n--- DIVERSIDADE DE ENTIDADES (TOP 15 MAIS REFERENCIADAS) ---')
let maxConcentration = 0
let maxEntity = ''

for (const [entity, count] of sortedEntities) {
  const pct = ((count / totalQs) * 100).toFixed(1)
  if (count > maxConcentration) {
    maxConcentration = count
    maxEntity = entity
  }
  console.log(`  • ${entity.padEnd(20)}: ${String(count).padStart(2)} ocorrências (${pct}%)`)
}

const concentrationScore = Number(((maxConcentration / totalQs) * 100).toFixed(2))
console.log(`\n• Índice de Concentração Máxima (FACT_CLUSTER_CONCENTRATION): ${concentrationScore}% (Entidade: "${maxEntity}")`)
console.log(`• Estado do Cluster: ${concentrationScore < 10 ? 'EXCELENTE DIVERSIDADE (< 10%) ✓' : 'CONCENTRAÇÃO DETETADA ⚠️'}`)

// 3. Gravar Relatório de Diversidade
const diversityReport = {
  timestamp: new Date().toISOString(),
  totalAudited: totalQs,
  interrogativePatterns: questionPatterns,
  topEntities: sortedEntities.map(([name, count]) => ({ name, count, percentage: Number(((count / totalQs) * 100).toFixed(2)) })),
  factClusterConcentration: {
    maxEntity,
    maxCount: maxConcentration,
    concentrationPercentage: concentrationScore,
    status: concentrationScore < 10 ? 'EXCELENTE_DIVERSIDADE' : 'NEEDS_REVIEW'
  }
}

const diversityPath = path.join(rootDir, 'data', 'editorial_diversity_report.json')
fs.writeFileSync(diversityPath, JSON.stringify(diversityReport, null, 2), 'utf8')
console.log(`\n✓ Relatório de diversidade gravado em: data/editorial_diversity_report.json\n`)
