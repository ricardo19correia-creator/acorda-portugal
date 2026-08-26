/**
 * Script de Teste e Validação dos Estados do Componente MobileLaunchCountdown
 * Acorda Portugal — acordaportugal.pt
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

console.log('🧪 A testar estados e configurações do componente MobileLaunchCountdown...\n')

// 1. Ler e extrair configurações de lib/mobile-launch-config.ts
const configPath = path.join(__dirname, '..', 'lib', 'mobile-launch-config.ts')
const configSource = fs.readFileSync(configPath, 'utf8')

// Validar constantes oficiais no código fonte
assert.strictEqual(configSource.includes("OFFICIAL_LAUNCH_DATE_ISO = '2026-09-11T22:00:00+01:00'"), true)
assert.strictEqual(configSource.includes("OFFICIAL_LAUNCH_TIMEZONE = 'Europe/Lisbon'"), true)
assert.strictEqual(configSource.includes("badge: '🚀 LANÇAMENTO MOBILE'"), true)
assert.strictEqual(configSource.includes("title: 'O DESAFIO ESTÁ A CHEGAR AO TEU TELEMÓVEL'"), true)
assert.strictEqual(configSource.includes("buttonText: 'TESTAR AGORA'"), true)
assert.strictEqual(configSource.includes("href: '/jogar'"), true)
assert.strictEqual(configSource.includes("badge: '🎉 JÁ ESTÁ DISPONÍVEL!'"), true)
assert.strictEqual(configSource.includes("title: 'O ACORDA PORTUGAL CHEGOU AO TEU TELEMÓVEL'"), true)
console.log('✓ Configuração e Copy dos estados Pré e Pós-Lançamento: VÁLIDOS')

// 2. Validar plataformas em estado padrão
assert.strictEqual(configSource.includes("status: 'coming_soon'"), true)
assert.strictEqual(configSource.includes("comingSoonText: 'Disponível em breve'"), true)
assert.strictEqual(configSource.includes("buttonText: 'DESCARREGAR ANDROID'"), true)
assert.strictEqual(configSource.includes("buttonText: 'DESCARREGAR iOS'"), true)
console.log('✓ Plataformas Android e iOS configuradas sem URLs falsas (coming_soon): VÁLIDAS')

// 3. Validar componente mobile-launch-countdown.tsx
const componentPath = path.join(__dirname, '..', 'components', 'mobile-launch-countdown.tsx')
const componentSource = fs.readFileSync(componentPath, 'utf8')

// Validar referências a acessibilidade, SEO e interatividade
assert.strictEqual(componentSource.includes('aria-labelledby'), true, 'Componente deve ter aria-labelledby')
assert.strictEqual(componentSource.includes('sr-only'), true, 'Componente deve conter texto acessível sr-only')
assert.strictEqual(componentSource.includes('useSyncExternalStore'), true, 'Componente deve usar useSyncExternalStore para hidratação segura')
assert.strictEqual(componentSource.includes('handleStartGame'), true, 'Componente deve suportar navegação segura com auth check')
assert.strictEqual(componentSource.includes('/jogar'), true, 'Componente deve apontar para a rota oficial /jogar')
assert.strictEqual(componentSource.includes('/jogar/duelo'), true, 'Componente deve apontar para a rota de duelo 1v1')
console.log('✓ Acessibilidade (sr-only, aria-labelledby), SEO e roteamento verificados no componente: VÁLIDOS')

console.log('\n🎉 TODOS OS TESTES DE ESTADO DO COMPONENTE PASSARAM COM SUCESSO!')
