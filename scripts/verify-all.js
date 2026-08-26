/**
 * Verificação Completa de Integridade do Contador de Lançamento Mobile
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 A verificar integridade dos ficheiros criados/modificados...\n')

const requiredFiles = [
  'lib/mobile-launch-config.ts',
  'lib/countdown.ts',
  'components/mobile-launch-countdown.tsx',
  'app/page.tsx',
  'scripts/test-countdown.js',
]

for (const relPath of requiredFiles) {
  const fullPath = path.join(__dirname, '..', relPath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Ficheiro em falta: ${relPath}`)
    process.exit(1)
  }
  const content = fs.readFileSync(fullPath, 'utf8')
  console.log(`✓ Ficheiro presente e com ${content.split('\n').length} linhas: ${relPath}`)
}

// Verificar conteúdo de lib/mobile-launch-config.ts
const configContent = fs.readFileSync(path.join(__dirname, '..', 'lib/mobile-launch-config.ts'), 'utf8')
if (!configContent.includes('2026-09-11T22:00:00+01:00')) {
  console.error('❌ Data oficial em falta na configuração!')
  process.exit(1)
}
if (!configContent.includes('Europe/Lisbon')) {
  console.error('❌ Timezone oficial em falta na configuração!')
  process.exit(1)
}
console.log('✓ Configuração contém a data 2026-09-11T22:00:00+01:00 e timezone Europe/Lisbon')

// Verificar inserção na homepage app/page.tsx
const pageContent = fs.readFileSync(path.join(__dirname, '..', 'app/page.tsx'), 'utf8')
if (!pageContent.includes('<MobileLaunchCountdown />')) {
  console.error('❌ MobileLaunchCountdown não encontrado em app/page.tsx!')
  process.exit(1)
}
const heroIndex = pageContent.indexOf('<Hero />')
const countdownIndex = pageContent.indexOf('<MobileLaunchCountdown />')
const guzmaniaIndex = pageContent.indexOf('<GuzmaniaSection />')

if (heroIndex === -1 || countdownIndex === -1 || guzmaniaIndex === -1) {
  console.error('❌ Um ou mais componentes da homepage não encontrados!')
  process.exit(1)
}

if (!(heroIndex < countdownIndex && countdownIndex < guzmaniaIndex)) {
  console.error('❌ Ordem visual incorreta na homepage!')
  process.exit(1)
}
console.log('✓ Ordem visual na Homepage confirmada: <Hero /> -> <MobileLaunchCountdown /> -> <GuzmaniaSection />')

console.log('\n✨ Verificação de integridade estática CONCLUÍDA com sucesso!')
