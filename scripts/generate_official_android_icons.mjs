import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const RES_DIR = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');
const ICON_SRC = path.join(process.cwd(), 'public', 'icon.png');
const LOGO_SRC = path.join(process.cwd(), 'public', 'logo-oficial.png');

const MIPMAP_DENSITIES = [
  { name: 'mipmap-mdpi', size: 48, foregroundSize: 108 },
  { name: 'mipmap-hdpi', size: 72, foregroundSize: 162 },
  { name: 'mipmap-xhdpi', size: 96, foregroundSize: 216 },
  { name: 'mipmap-xxhdpi', size: 144, foregroundSize: 324 },
  { name: 'mipmap-xxxhdpi', size: 192, foregroundSize: 432 },
];

const SPLASH_SIZES = [
  { dir: 'drawable', width: 480, height: 800 },
  { dir: 'drawable-land-mdpi', width: 480, height: 320 },
  { dir: 'drawable-land-hdpi', width: 800, height: 480 },
  { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
  { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
  { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
  { dir: 'drawable-port-mdpi', width: 320, height: 480 },
  { dir: 'drawable-port-hdpi', width: 480, height: 800 },
  { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
  { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
  { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
];

async function generateIcons() {
  console.log('=== GERANDO ÍCONES OFICIAIS ANDROID ===');
  const iconBuf = fs.readFileSync(ICON_SRC);

  // 1. Gerar Mipmaps (ic_launcher.png / .webp, ic_launcher_round.png / .webp, ic_launcher_foreground.png / .webp)
  for (const { name, size, foregroundSize } of MIPMAP_DENSITIES) {
    const targetDir = path.join(RES_DIR, name);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.webp e ic_launcher.png (Quadrado / Cantos Suaves com Logo Oficial)
    const standardIcon = await sharp(iconBuf)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 7, b: 6, alpha: 1 } })
      .webp({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.webp'), standardIcon);

    const standardPng = await sharp(iconBuf)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 7, b: 6, alpha: 1 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), standardPng);

    // ic_launcher_round (Círculo)
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#050706"/></svg>`
    );
    const roundIcon = await sharp(iconBuf)
      .resize(Math.round(size * 0.85), Math.round(size * 0.85), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    
    const compositeRound = await sharp(circleSvg)
      .composite([{ input: roundIcon, gravity: 'center' }])
      .webp({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.webp'), compositeRound);
    
    const compositeRoundPng = await sharp(circleSvg)
      .composite([{ input: roundIcon, gravity: 'center' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), compositeRoundPng);

    // ic_launcher_foreground (Adaptive Icon Foreground - seguro na zona central de 66%)
    const safeLogoSize = Math.round(foregroundSize * 0.65);
    const resizedLogo = await sharp(iconBuf)
      .resize(safeLogoSize, safeLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const blankCanvas = Buffer.from(
      `<svg width="${foregroundSize}" height="${foregroundSize}"></svg>`
    );
    const foregroundWebp = await sharp(blankCanvas)
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .webp({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.webp'), foregroundWebp);

    const foregroundPng = await sharp(blankCanvas)
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), foregroundPng);

    console.log(` -> ${name}: ic_launcher (${size}x${size}), round (${size}x${size}), foreground (${foregroundSize}x${foregroundSize}) OK`);
  }

  // 2. Corrigir ic_launcher_background.xml para tema escuro do Acorda Portugal (#050706)
  const bgXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#050706"
        android:pathData="M0,0h108v108h-108z"/>
</vector>
`;
  fs.writeFileSync(path.join(RES_DIR, 'drawable', 'ic_launcher_background.xml'), bgXmlContent, 'utf8');

  // 3. Atualizar mipmap-anydpi-v26/ic_launcher.xml e ic_launcher_round.xml
  const anyDpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anyDpiDir)) fs.mkdirSync(anyDpiDir, { recursive: true });

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

  // 4. Gerar Splash Screens Oficiais
  console.log('\n=== GERANDO SPLASH SCREENS OFICIAIS ===');
  for (const { dir, width, height } of SPLASH_SIZES) {
    const splashDir = path.join(RES_DIR, dir);
    if (!fs.existsSync(splashDir)) fs.mkdirSync(splashDir, { recursive: true });

    const logoMaxDim = Math.round(Math.min(width, height) * 0.45);
    const splashLogo = await sharp(iconBuf)
      .resize(logoMaxDim, logoMaxDim, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const splashBg = Buffer.from(
      `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#050706"/></svg>`
    );
    const splashPng = await sharp(splashBg)
      .composite([{ input: splashLogo, gravity: 'center' }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(splashDir, 'splash.png'), splashPng);
    console.log(` -> ${dir}/splash.png: ${width}x${height} OK`);
  }

  console.log('\nTodos os ícones e splashes oficiais foram gerados com sucesso!');
}

generateIcons().catch(console.error);
