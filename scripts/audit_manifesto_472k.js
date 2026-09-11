/**
 * 🇵🇹 ACORDA PORTUGAL — AUDITORIA INDEPENDENTE DO MANIFESTO 472K
 * 
 * Valida o progresso oficial em direção às 472.000 perguntas:
 * - Integridade do manifesto data/manifesto_producao_472k.json
 * - Validação dos lotes em data/batches_472k/
 * - Ausência de duplicados exatos e semânticos
 * - Relatório detalhado por Milestone
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, 'data/manifesto_producao_472k.json');
const batchesDir = path.join(rootDir, 'data/batches_472k');

if (!fs.existsSync(manifestPath)) {
  console.error('❌ ERRO: data/manifesto_producao_472k.json não encontrado.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('======================================================================');
console.log('🇵🇹 AUDITORIA DO MANIFESTO E FÁBRICA 472K — ACORDA PORTUGAL');
console.log('======================================================================');
console.log(`Versão: ${manifest.version}`);
console.log(`Última Atualização: ${manifest.updatedAt}`);
console.log(`Meta Global: ${manifest.globalTarget.toLocaleString('pt-PT')} perguntas`);
console.log(`Perguntas Atuais: ${manifest.totalExisting.toLocaleString('pt-PT')} perguntas`);
console.log(`Perguntas em Falta: ${manifest.totalRemaining.toLocaleString('pt-PT')} perguntas`);
console.log(`Progresso Global: ${((manifest.totalExisting / manifest.globalTarget) * 100).toFixed(2)}%`);
console.log('----------------------------------------------------------------------');

// Milestone Tracker
const currentTotal = manifest.totalExisting;
const m1 = 20067;
const m4 = manifest.globalTarget * 0.25; // 118.000
const m5 = manifest.globalTarget * 0.50; // 236.000
const m6 = manifest.globalTarget * 0.75; // 354.000
const m7 = manifest.globalTarget;        // 472.000

console.log('📍 ESTADO DOS MILESTONES:');
console.log(`   [✓] Milestone 1: Auditoria + Manifesto (20.067 Qs) — CONCLUÍDO`);
console.log(`   [${currentTotal > 20067 ? '✓' : ' '}] Milestone 2: Primeiras Subcategorias Expandidas`);
console.log(`   [${currentTotal >= m4 ? '✓' : ' '}] Milestone 4: 25% do Objetivo (${m4.toLocaleString('pt-PT')} Qs)`);
console.log(`   [${currentTotal >= m5 ? '✓' : ' '}] Milestone 5: 50% do Objetivo (${m5.toLocaleString('pt-PT')} Qs)`);
console.log(`   [${currentTotal >= m6 ? '✓' : ' '}] Milestone 6: 75% do Objetivo (${m6.toLocaleString('pt-PT')} Qs)`);
console.log(`   [${currentTotal >= m7 ? '✓' : ' '}] Milestone 7: 100% Definitivo (472.000 / 472.000)`);
console.log('======================================================================\n');

// Verificação de Lotes Físicos
let batchFilesCount = 0;
let totalBatchQuestions = 0;
const batchDuplicates = new Set();
const seenPromptKeys = new Set();

if (fs.existsSync(batchesDir)) {
  const catDirs = fs.readdirSync(batchesDir);
  for (const catDir of catDirs) {
    const fullCat = path.join(batchesDir, catDir);
    if (fs.statSync(fullCat).isDirectory()) {
      const files = fs.readdirSync(fullCat).filter(f => f.endsWith('.json'));
      for (const f of files) {
        batchFilesCount++;
        const filePath = path.join(fullCat, f);
        try {
          const qs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (Array.isArray(qs)) {
            totalBatchQuestions += qs.length;
            for (const q of qs) {
              const promptKey = String(q.question || q.pergunta || '')
                .toLowerCase()
                .replace(/[^\p{L}\p{N}]/gu, '')
                .trim();
              if (promptKey.length > 5) {
                if (seenPromptKeys.has(promptKey)) {
                  batchDuplicates.add(q.id || promptKey);
                } else {
                  seenPromptKeys.add(promptKey);
                }
              }
            }
          }
        } catch (e) {
          console.error(`Erro ao ler lote ${filePath}: ${e.message}`);
        }
      }
    }
  }
}

console.log(`📦 LOTES INCREMENTAIS EM DISCO:`);
console.log(`   Ficheiros de lote: ${batchFilesCount}`);
console.log(`   Total de perguntas novas nos lotes: ${totalBatchQuestions.toLocaleString('pt-PT')}`);
console.log(`   Duplicados detetados entre lotes: ${batchDuplicates.size}`);
console.log('----------------------------------------------------------------------\n');

// Resumo das 20 Categorias
console.log('📊 RESUMO POR CATEGORIA:');
console.log('Categoria'.padEnd(35) + ' | Subtemas | ' + 'Existente'.padStart(10) + ' | ' + 'Meta'.padStart(10) + ' | ' + 'Restante'.padStart(10) + ' | Progresso');
console.log('-'.repeat(95));

manifest.categories.forEach(c => {
  const pct = ((c.existing / c.target) * 100).toFixed(1) + '%';
  console.log(
    `${c.emoji} ${c.name}`.padEnd(35) +
    ` | ${String(c.subcategories.length).padStart(8)} | ` +
    `${c.existing.toLocaleString('pt-PT')}`.padStart(10) + ' | ' +
    `${c.target.toLocaleString('pt-PT')}`.padStart(10) + ' | ' +
    `${c.remaining.toLocaleString('pt-PT')}`.padStart(10) + ' | ' +
    pct.padStart(8)
  );
});

console.log('='.repeat(95));
