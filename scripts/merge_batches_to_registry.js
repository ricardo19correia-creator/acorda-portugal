/**
 * 🇵🇹 ACORDA PORTUGAL — COMPILADOR E INTEGRADOR DE LOTES 472K NO RUNTIME
 * 
 * Inspeciona data/batches_472k/ e incorpora as novas perguntas aprovadas
 * nos respetivos ficheiros físicos canónicos do jogo, com backup de segurança (.bak).
 * 
 * Execução:
 *   node scripts/merge_batches_to_registry.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const batchesDir = path.join(rootDir, 'data/batches_472k');

if (!fs.existsSync(batchesDir)) {
  console.log('Nenhum lote para sincronizar.');
  process.exit(0);
}

console.log('🔄 A iniciar compilação e integração segura de lotes no Runtime...\n');

let totalMerged = 0;
const catDirs = fs.readdirSync(batchesDir);

for (const catDir of catDirs) {
  const fullCatPath = path.join(batchesDir, catDir);
  if (!fs.statSync(fullCatPath).isDirectory()) continue;

  // Localizar ficheiro destino
  let targetFile = null;
  let targetCategorySlug = catDir;

  if (catDir === 'desafio-nacional') {
    targetFile = path.join(rootDir, 'src/data/questions_desafio_nacional.json');
  } else if (catDir === 'desafio-cidade') {
    targetFile = path.join(rootDir, 'data/perguntas_vila_real_500.json');
  } else {
    targetFile = path.join(rootDir, 'lib/data/categories', `${catDir}.json`);
  }

  if (!fs.existsSync(targetFile)) {
    console.warn(`⚠️ Ficheiro destino não encontrado: ${targetFile}`);
    continue;
  }

  // Carregar dados atuais do ficheiro
  let existingList = [];
  try {
    existingList = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  } catch (e) {
    console.error(`Erro ao ler ${targetFile}: ${e.message}`);
    continue;
  }

  const existingIds = new Set(existingList.map(q => String(q.id)));
  const existingPrompts = new Set(existingList.map(q => {
    return String(q.question || q.pergunta || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, '')
      .trim();
  }));

  const batchFiles = fs.readdirSync(fullCatPath).filter(f => f.endsWith('.json'));
  let newlyAddedToTarget = 0;

  for (const bf of batchFiles) {
    const bPath = path.join(fullCatPath, bf);
    try {
      const bList = JSON.parse(fs.readFileSync(bPath, 'utf8'));
      if (Array.isArray(bList)) {
        for (const q of bList) {
          const promptKey = String(q.question || q.pergunta || '')
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]/gu, '')
            .trim();

          if (!existingIds.has(String(q.id)) && (!promptKey || !existingPrompts.has(promptKey))) {
            existingList.push(q);
            existingIds.add(String(q.id));
            if (promptKey) existingPrompts.add(promptKey);
            newlyAddedToTarget++;
          }
        }
      }
    } catch (e) {
      console.error(`Erro ao processar lote ${bPath}: ${e.message}`);
    }
  }

  if (newlyAddedToTarget > 0) {
    // Backup seguro
    const backupPath = `${targetFile}.bak`;
    fs.writeFileSync(backupPath, fs.readFileSync(targetFile));

    // Gravação segura
    fs.writeFileSync(targetFile, JSON.stringify(existingList, null, 2));

    // Para Vila Real, espelhar também em src/data se existir
    if (catDir === 'desafio-cidade') {
      const srcVilaReal = path.join(rootDir, 'src/data/perguntas_vila_real_500.json');
      if (fs.existsSync(srcVilaReal)) {
        fs.writeFileSync(srcVilaReal, JSON.stringify(existingList, null, 2));
      }
    }

    console.log(`✓ [${catDir}]: +${newlyAddedToTarget} novas perguntas integradas com sucesso! (Total no ficheiro: ${existingList.length})`);
    totalMerged += newlyAddedToTarget;
  }
}

console.log('\n======================================================================');
console.log(`🎉 COMPILAÇÃO CONCLUÍDA: +${totalMerged} novas perguntas adicionadas ao Runtime de Produção.`);
console.log('======================================================================\n');
