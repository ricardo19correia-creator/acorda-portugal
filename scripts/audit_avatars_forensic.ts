import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { REAL_AVATARS, DEFAULT_AVATAR } from '../lib/avatars';
import { OFFICIAL_SHOP_AVATARS, avatarShopList } from '../src/data/shopAvatars';

function runForensicAudit() {
  console.log('================================================================================');
  console.log('🇵🇹 AUDITORIA FORENSE DEFINITIVA — LOJA E CATÁLOGO DE AVATARES');
  console.log('================================================================================\n');

  const totalAvatars = OFFICIAL_SHOP_AVATARS.length;
  let avatarsWithImage = 0;
  let missingImages = 0;
  let idDuplicates = 0;
  let hashDuplicates = 0;
  let placeholderCount = 0;
  let mockCount = 0;
  let legacyReferencesInActiveCode = 0;
  let legacyFallbackCount = 0;

  const seenIds = new Set<string>();
  const seenHashes = new Map<string, string>();
  const seenImagePaths = new Set<string>();

  // 1. Validar Catálogo Oficial
  OFFICIAL_SHOP_AVATARS.forEach((av) => {
    // Check ID duplicate
    if (seenIds.has(av.id)) {
      idDuplicates++;
      console.error(`❌ ID Duplicado: ${av.id}`);
    }
    seenIds.add(av.id);

    // Check Image
    if (av.image && av.image.trim().length > 0) {
      avatarsWithImage++;
      const cleanPath = av.image.startsWith('/') ? av.image.slice(1) : av.image;
      const fullPath = path.resolve(process.cwd(), 'public', cleanPath);

      if (!fs.existsSync(fullPath)) {
        missingImages++;
        console.error(`❌ Imagem em falta no disco: ${av.image} (Avatar: ${av.name})`);
      } else {
        const buf = fs.readFileSync(fullPath);
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        if (seenHashes.has(hash)) {
          hashDuplicates++;
          console.error(`❌ Imagem duplicada: ${av.image} tem o mesmo hash de ${seenHashes.get(hash)}`);
        } else {
          seenHashes.set(hash, av.id);
        }
        seenImagePaths.add(av.image);
      }
    }

    // Check Placeholders / Mocks
    if (av.name.toLowerCase().includes('placeholder') || av.name.toLowerCase().includes('teste')) {
      placeholderCount++;
    }
    if (av.id.toLowerCase().includes('mock') || av.description.toLowerCase().includes('mock')) {
      mockCount++;
    }
  });

  // 2. Verificar se existem ficheiros legados em public/images/avatars
  const avatarDir = path.resolve(process.cwd(), 'public', 'images', 'avatars');
  const legacyFilenames = [
    'alma-alfama-2050.jpg',
    'alma-alfama-2050.png',
    'camoes-2050.jpg',
    'camoes-2050.png',
    'Campeão Nacional.png',
    'LENDA SUPREMA DO ACORDA.png',
    'lenda-futebol-2050.jpg',
    'lenda-futebol-2050.png',
    'REPRESENTANTE DISTRITAL.png',
    'sebastiao-2050.jpg',
    'sebastiao-2050.png',
    'TITÃ DO TOP 10.png',
    'vulcao-acores.jpg',
    'vulcao-acores.png'
  ];

  legacyFilenames.forEach((f) => {
    if (fs.existsSync(path.join(avatarDir, f))) {
      legacyReferencesInActiveCode++;
      console.error(`❌ Ficheiro legado ainda existe em public/images/avatars/: ${f}`);
    }
  });

  // 3. Verificar código da Loja e Componentes por referências aos nomes legados
  const filesToCheck = [
    'app/loja/page.tsx',
    'app/perfil/page.tsx',
    'components/live-online-card.tsx',
    'components/live-players-modal.tsx',
    'components/player-profile.tsx',
    'data/constants.ts',
    'src/data/constants.ts',
    'src/data/shopAvatars.ts',
  ];

  const legacyTokens = [
    'camoes-2050.jpg',
    'camoes-2050.png',
    'sebastiao-2050.jpg',
    'vulcao-acores.jpg',
    'alma-alfama-2050.jpg',
    'lenda-futebol-2050.jpg',
    'Campeão Nacional.png',
    'LENDA SUPREMA DO ACORDA.png',
    'REPRESENTANTE DISTRITAL.png',
    'TITÃ DO TOP 10.png',
    'camoes_2050',
    'sebastiao_nevoeiro',
    'guardiao_acores',
    'lenda_futebol',
    'alma_alfama',
  ];

  filesToCheck.forEach((rel) => {
    const full = path.resolve(process.cwd(), rel);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf-8');
      legacyTokens.forEach((token) => {
        if (content.includes(token)) {
          legacyFallbackCount++;
          console.error(`❌ Token legado "${token}" encontrado no ficheiro ativo ${rel}`);
        }
      });
    }
  });

  console.log('------------------------------------------------------------');
  console.log('RESULTADO OFICIAL:');
  console.log('------------------------------------------------------------');
  console.log(`TOTAL DE AVATARS:                 ${totalAvatars}`);
  console.log(`AVATARS COM IMAGEM:               ${avatarsWithImage}`);
  console.log(`IMAGENS ÚNICAS:                   ${seenHashes.size}`);
  console.log(`DUPLICADOS:                       ${hashDuplicates}`);
  console.log(`IDS DUPLICADOS:                   ${idDuplicates}`);
  console.log(`IMAGENS EM FALTA:                 ${missingImages}`);
  console.log(`REFERÊNCIAS PARA AVATARS ANTIGOS: ${legacyReferencesInActiveCode}`);
  console.log(`PLACEHOLDERS:                     ${placeholderCount}`);
  console.log(`MOCK AVATARS:                     ${mockCount}`);
  console.log(`FALLBACKS ANTIGOS:                ${legacyFallbackCount}`);
  console.log('------------------------------------------------------------\n');

  const allPassed =
    totalAvatars === 36 &&
    avatarsWithImage === 36 &&
    seenHashes.size === 36 &&
    hashDuplicates === 0 &&
    idDuplicates === 0 &&
    missingImages === 0 &&
    legacyReferencesInActiveCode === 0 &&
    placeholderCount === 0 &&
    mockCount === 0 &&
    legacyFallbackCount === 0;

  if (allPassed) {
    console.log('✅ SUCESSO ABSOLUTO: 100% DOS CRITÉRIOS ATENDIDOS SEM EXCEÇÃO!');
    process.exit(0);
  } else {
    console.error('❌ AUDITORIA FALHOU: Existem valores críticos não nulos!');
    process.exit(1);
  }
}

runForensicAudit();
