import fs from 'fs';
import path from 'path';

async function checkAssetsAndLinks() {
  console.log('--- AUDITORIA DE IMAGENS E FICHEIROS ESTÁTICOS EM PUBLIC/ ---');
  const publicDir = path.resolve('public');
  
  // Verificar pastas e ficheiros críticos
  const criticalPaths = [
    'arenas',
    'images/avatars',
    'downloads',
    'brand',
    'icon.png',
    'apple-icon.png',
    'logo-oficial.png'
  ];

  let errors = 0;

  for (const cPath of criticalPaths) {
    const full = path.join(publicDir, cPath);
    if (!fs.existsSync(full)) {
      console.error(`❌ Ficheiro/diretório crítico ausente: ${cPath}`);
      errors++;
    } else {
      console.log(`✅ Ficheiro/diretório verificado: ${cPath}`);
    }
  }

  // Verificar arenas
  const arenaFiles = fs.readdirSync(path.join(publicDir, 'arenas')).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Total de ficheiros em public/arenas/: ${arenaFiles.length}`);
  if (arenaFiles.length < 43) {
    console.error(`❌ Menos de 43 arenas encontradas: ${arenaFiles.length}`);
    errors++;
  } else {
    console.log(`✅ public/arenas/ contém pelo menos 43 imagens (${arenaFiles.length})`);
  }

  // Verificar avatares
  const avatarFiles = fs.readdirSync(path.join(publicDir, 'images/avatars')).filter(f => f.endsWith('.png'));
  console.log(`Total de ficheiros em public/images/avatars/: ${avatarFiles.length}`);
  if (avatarFiles.length < 36) {
    console.error(`❌ Menos de 36 avatares encontrados: ${avatarFiles.length}`);
    errors++;
  } else {
    console.log(`✅ public/images/avatars/ contém pelo menos 36 imagens (${avatarFiles.length})`);
  }

  // Verificar APK
  const apkPath = path.join(publicDir, 'downloads', 'acorda-portugal-release.apk');
  if (!fs.existsSync(apkPath)) {
    console.error(`❌ APK não encontrado em public/downloads/acorda-portugal-release.apk`);
    errors++;
  } else {
    const stats = fs.statSync(apkPath);
    console.log(`✅ APK oficial verificado em public/downloads/ (tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    if (stats.size < 10000000) {
      console.error(`❌ APK anormalmente pequeno: ${stats.size} bytes`);
      errors++;
    }
  }

  console.log(`\nRESULTADO DA AUDITORIA DE ASSETS: ${errors === 0 ? 'TODOS OS ASSETS VÁLIDOS' : `${errors} ERROS DETETADOS`}`);
  if (errors > 0) process.exit(1);
}

checkAssetsAndLinks().catch((err) => {
  console.error(err);
  process.exit(1);
});
