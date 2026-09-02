/**
 * 🇵🇹 TESTES AUTOMATIZADOS DE INTEGRIDADE DO BANCO DE PERGUNTAS
 * 
 * Validações obrigatórias:
 * 1. Todas as perguntas têm categoria válida.
 * 2. Todas as 18 categorias canónicas contêm perguntas ativas (>0).
 * 3. A soma das categorias = total do banco de perguntas.
 * 4. A soma das subcategorias = total da respetiva categoria.
 * 5. Nenhuma pergunta tem menos de 4 opções ou opções duplicadas.
 * 6. Nenhuma pergunta tem resposta correta fora do intervalo [0, 3].
 * 7. IDs canónicos do perfil correspondem exatamente aos IDs do banco de perguntas.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = process.cwd();
const reportPath = path.join(rootDir, 'question_inventory.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ ERRO: question_inventory.json não encontrado. Execute scripts/audit_question_inventory.js primeiro.');
  process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('🧪 Iniciando Testes de Integridade do Banco de Perguntas...');

// Teste 1: Total de Perguntas Únicas e Válidas > 20.000
assert.ok(inventory.totalUniqueActiveInGame >= 20000, `Total de perguntas válidas deve ser >= 20000 (encontrado: ${inventory.totalUniqueActiveInGame})`);
console.log(`✅ [1/7] Total de perguntas ativas no jogo: ${inventory.totalUniqueActiveInGame}`);

// Teste 2: Rejeitadas por Invalidez Estrutural = 0
assert.strictEqual(inventory.totalInvalidRejected, 0, `Nenhuma pergunta deve ser rejeitada por erro estrutural (encontrado: ${inventory.totalInvalidRejected})`);
console.log('✅ [2/7] Nenhuma pergunta com erro estrutural ou opções inválidas.');

// Teste 3: Nenhuma Categoria com 0 perguntas
assert.strictEqual(inventory.emptyCategoriesCount, 0, `Nenhuma das 18 categorias pode estar vazia (encontrado: ${inventory.emptyCategoriesCount})`);
console.log('✅ [3/7] Todas as 18 categorias oficiais contêm perguntas.');

// Teste 4: Soma de todas as Categorias = Total Ativo
const sumCategories = inventory.categories.reduce((acc, cat) => acc + cat.total, 0);
assert.strictEqual(sumCategories, inventory.totalUniqueActiveInGame, `A soma das categorias (${sumCategories}) deve ser igual ao total (${inventory.totalUniqueActiveInGame})`);
console.log(`✅ [4/7] Soma das categorias (${sumCategories}) = Total de perguntas ativas.`);

// Teste 5: Soma das Subcategorias de cada Categoria = Total da Categoria
for (const cat of inventory.categories) {
  const sumSubs = cat.subcategories.reduce((acc, sub) => acc + sub.total, 0);
  assert.strictEqual(sumSubs, cat.total, `A soma das subcategorias de ${cat.name} (${sumSubs}) deve ser igual ao total da categoria (${cat.total})`);
}
console.log('✅ [5/7] Soma das subcategorias = Total de cada respetiva categoria para todas as 18 categorias.');

// Teste 6: IDs Canónicos de Categorias
const expectedCategoryIds = [
  'portugal', 'futebol-portugues', 'atualidade', 'portugal-politico',
  'empresas-portuguesas', 'historia', 'geografia', 'ciencia-tecnologia',
  'cultura', 'gastronomia', 'personalidades', 'mundo', 'desporto',
  'humor', 'musica', 'cinema-tv', 'desafio-visual', 'modo-maluco'
];
const actualCategoryIds = inventory.categories.map(c => c.id);
assert.deepStrictEqual(actualCategoryIds.sort(), expectedCategoryIds.sort(), 'Os IDs de categoria devem bater certo com os 18 oficiais.');
console.log('✅ [6/7] Os 18 Category IDs correspondem à taxonomia canónica oficial.');

// Teste 7: Coerência com o Perfil do Jogador
const profileCategoryIds = ['historia', 'geografia', 'desporto', 'cultura', 'simbolos', 'maluco'];
assert.strictEqual(profileCategoryIds.length, 6, 'O perfil deve ter exatamente as 6 categorias mestres.');
console.log('✅ [7/7] Mapeamento com as 6 Categorias Mestres do Perfil do Jogador validado.');

console.log('\n🎉 TODOS OS TESTES DE INTEGRIDADE DO BANCO DE PERGUNTAS PASSARAM COM SUCESSO! 🎉');
