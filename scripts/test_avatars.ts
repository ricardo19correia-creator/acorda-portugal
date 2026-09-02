import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { REAL_AVATARS, getAvatarById, getAvatarImage, isValidAvatarId, normalizeAvatarId } from '../lib/avatars';
import { OFFICIAL_SHOP_AVATARS, avatarShopList } from '../src/data/shopAvatars';

async function runAvatarTestSuite() {
  console.log('====================================================');
  console.log('🇵🇹 ACORDA PORTUGAL — AUDITORIA FORENSE DE 36 AVATARES');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const avatarsDir = path.resolve('public/images/avatars');

  // TEST 1: Catálogo tem exatamente 36 avatares
  assert(REAL_AVATARS.length === 36, `REAL_AVATARS contém exatamente 36 avatares (atual: ${REAL_AVATARS.length})`);

  // TEST 2: Todos os 36 IDs são únicos e canónicos
  const ids = REAL_AVATARS.map((a) => a.id);
  const uniqueIds = new Set(ids);
  assert(uniqueIds.size === 36, `Todos os 36 IDs são únicos (encontrados: ${uniqueIds.size})`);

  for (let i = 1; i <= 36; i++) {
    const expectedId = `avatar_${String(i).padStart(2, '0')}`;
    assert(ids.includes(expectedId), `ID canónico ${expectedId} existe no catálogo`);
  }

  // TEST 3: Todos os 36 nomes são únicos
  const names = REAL_AVATARS.map((a) => a.name.trim());
  const uniqueNames = new Set(names);
  assert(uniqueNames.size === 36, `Todos os 36 nomes são únicos (sem duplicados nominais: ${uniqueNames.size}/36)`);

  // TEST 4: Todos os 36 ficheiros físicos existem no disco e são válidos
  const fileHashes = new Set<string>();
  let allFilesValid = true;
  let allFilesUnique = true;

  for (let i = 1; i <= 36; i++) {
    const id = `avatar_${String(i).padStart(2, '0')}`;
    const filePath = path.join(avatarsDir, `${id}.png`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Ficheiro físico em falta: ${filePath}`);
      allFilesValid = false;
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.size < 10000) {
      console.error(`❌ Ficheiro demasiado pequeno ou corrompido: ${filePath} (${stat.size} bytes)`);
      allFilesValid = false;
      continue;
    }

    // Check dimensions with sharp
    try {
      const metadata = await sharp(filePath).metadata();
      if (metadata.width !== 512 || metadata.height !== 512) {
        console.error(`❌ Dimensões inválidas para ${id}.png: ${metadata.width}x${metadata.height} (esperado: 512x512)`);
        allFilesValid = false;
      }
    } catch (err) {
      console.error(`❌ Erro ao ler metadados de ${id}.png:`, err);
      allFilesValid = false;
    }

    // Check SHA-256 hash to ensure zero identical duplicate images
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    if (fileHashes.has(hash)) {
      console.error(`❌ Imagem duplicada detectada para ${id}.png (hash coincidente)`);
      allFilesUnique = false;
    } else {
      fileHashes.add(hash);
    }
  }

  assert(allFilesValid, 'Todos os 36 ficheiros físicos existem, têm dimensões 512x512 e tamanho > 10KB');
  assert(allFilesUnique && fileHashes.size === 36, `Zero imagens duplicadas: 36 hashes SHA-256 únicos (${fileHashes.size}/36)`);

  // TEST 5: Resolução canónica e backward compatibility
  const testAliases = [
    { input: 'avatar_01', expectedId: 'avatar_01' },
    { input: 'avatar_18', expectedId: 'avatar_18' },
    { input: 'avatar_36', expectedId: 'avatar_36' },
    { input: 'camoes_2050', expectedId: 'avatar_36' },
    { input: 'guardiao_acores', expectedId: 'avatar_03' },
    { input: 'lenda_futebol', expectedId: 'avatar_11' },
    { input: 'alma_alfama', expectedId: 'avatar_12' },
    { input: 'sebastiao_nevoeiro', expectedId: 'avatar_34' },
    { input: 'campeao_nacional', expectedId: 'avatar_33' },
    { input: 'lenda_suprema_acorda', expectedId: 'avatar_35' },
    { input: 'representante_distrital', expectedId: 'avatar_21' },
    { input: 'tita_top_10', expectedId: 'avatar_30' },
  ];

  let allAliasesPass = true;
  for (const item of testAliases) {
    const resolved = getAvatarById(item.input);
    if (resolved.id !== item.expectedId) {
      console.error(`❌ Resolução falhou para alias "${item.input}": esperado ${item.expectedId}, obtido ${resolved.id}`);
      allAliasesPass = false;
    }
  }
  assert(allAliasesPass, 'Todos os aliases legados e IDs canónicos são resolvidos corretamente');

  // TEST 6: getAvatarImage retorna sempre imagem válida existente
  let allImagesResolve = true;
  for (let i = 1; i <= 36; i++) {
    const id = `avatar_${String(i).padStart(2, '0')}`;
    const imgUrl = getAvatarImage(id);
    if (!imgUrl.endsWith(`${id}.png`)) {
      console.error(`❌ getAvatarImage("${id}") retornou "${imgUrl}"`);
      allImagesResolve = false;
    }
  }
  assert(allImagesResolve, 'getAvatarImage() resolve as 36 imagens canónicas com 100% de precisão');

  // TEST 7: Loja Oficial sincronizada
  assert(OFFICIAL_SHOP_AVATARS.length === 36, `OFFICIAL_SHOP_AVATARS tem 36 itens (atual: ${OFFICIAL_SHOP_AVATARS.length})`);
  assert(avatarShopList.length === 36, `avatarShopList mapeia 36 itens (atual: ${avatarShopList.length})`);

  console.log('\n====================================================');
  console.log(`📊 RELATÓRIO FINAL: ${passed} PASS, ${failed} FAIL`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES PASSARAM COM DISTINÇÃO!');
  }
}

runAvatarTestSuite().catch((err) => {
  console.error('Erro fatal nos testes:', err);
  process.exit(1);
});