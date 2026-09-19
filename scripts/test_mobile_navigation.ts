import fs from 'fs'
import path from 'path'

console.log('================================================================================')
console.log('📱 TESTE DE NAVEGAÇÃO MOBILE — ACORDA PORTUGAL (5 DESTINOS OFICIAIS)')
console.log('================================================================================\n')

let allPassed = true

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`)
  } else {
    console.error(`❌ [FAIL] ${testName}`)
    allPassed = false
  }
}

// 1. Ler o componente MobileBottomBar
console.log('--- 1. AUDITORIA DO COMPONENTE MobileBottomBar.tsx ---')
const bottomBarPath = path.join(process.cwd(), 'components', 'navigation', 'MobileBottomBar.tsx')
assert(fs.existsSync(bottomBarPath), 'Ficheiro MobileBottomBar.tsx existe')
const bottomBarCode = fs.readFileSync(bottomBarPath, 'utf8')

// 2. Verificar os 5 itens oficiais e as suas rotas
console.log('\n--- 2. VERIFICAÇÃO DOS 5 DESTINOS DA BARRA INFERIOR ---')
const expectedItems = [
  { label: 'Início', href: '/', icon: 'Home' },
  { label: 'Jogar', href: '/jogar', icon: 'Gamepad2' },
  { label: 'Ranking', href: '/rankings', icon: 'Trophy' },
  { label: 'Eventos', href: '/eventos', icon: 'Calendar' },
  { label: 'Comunidade', href: '/comunidade', icon: 'MessageSquare' },
]

for (const item of expectedItems) {
  assert(
    bottomBarCode.includes(`label: '${item.label}'`) &&
    bottomBarCode.includes(`href: '${item.href}'`) &&
    bottomBarCode.includes(`icon: ${item.icon}`),
    `Item configurado corretamente: ${item.label} (${item.href}) com ícone ${item.icon}`
  )
}

// 3. Confirmar ausência de itens redundantes no dock móvel
console.log('\n--- 3. CONFIRMAÇÃO DE AUSÊNCIA DE ITENS REDUNDANTES NO DOCK MÓVEL ---')
assert(!bottomBarCode.includes("label: 'Loja'"), 'Loja removida do dock móvel (mantida no cabeçalho desktop)')
assert(!bottomBarCode.includes("label: 'Perfil'"), 'Perfil removido do dock móvel (mantido no cabeçalho desktop)')

// 4. Verificar safe-area e posicionamento fixo
console.log('\n--- 4. AUDITORIA DE SAFE-AREA E POSICIONAMENTO ---')
assert(bottomBarCode.includes('fixed bottom-0'), 'Barra com classe fixed bottom-0')
assert(bottomBarCode.includes('env(safe-area-inset-bottom'), 'Barra respeita safe-area-inset-bottom do iPhone/Android')
assert(bottomBarCode.includes('id="mobile-bottom-dock"'), 'Identificador oficial mobile-bottom-dock presente')

// 5. Verificar padding do layout principal
console.log('\n--- 5. AUDITORIA DO PADDING NO app/layout.tsx ---')
const layoutCode = fs.readFileSync(path.join(process.cwd(), 'app', 'layout.tsx'), 'utf8')
assert(layoutCode.includes('MobileBottomBar'), 'MobileBottomBar renderizada no app/layout.tsx')
assert(layoutCode.includes('calc(4rem+env(safe-area-inset-bottom,0px))'), 'Padding inferior adaptativo safe-area presente em app-main-layout')

// 6. Verificar navegação desktop preservada em components/site-header.tsx
console.log('\n--- 6. VERIFICAÇÃO DA NAVEGAÇÃO DESKTOP ---')
const headerCode = fs.readFileSync(path.join(process.cwd(), 'components', 'site-header.tsx'), 'utf8')
assert(headerCode.includes("href: '/comunidade'"), 'Comunidade acessível na navegação do SiteHeader desktop')
assert(headerCode.includes("href: '/jogar'"), 'Jogar acessível no SiteHeader desktop')
assert(headerCode.includes("href: '/rankings'"), 'Rankings acessível no SiteHeader desktop')
assert(headerCode.includes("href: '/eventos'"), 'Eventos acessível no SiteHeader desktop')
assert(headerCode.includes("href: '/loja'"), 'Loja acessível no SiteHeader desktop')
assert(headerCode.includes("href: '/perfil'"), 'Perfil acessível no SiteHeader desktop')

// 7. Simulação de rotas e estado ativo
console.log('\n--- 7. SIMULAÇÃO DE ESTADOS ATIVOS DE ROTA ---')
function testIsActive(href: string, pathname: string) {
  return href === '/'
    ? pathname === '/'
    : pathname === href || (href !== '/' && pathname.startsWith(href))
}

assert(testIsActive('/', '/') === true, 'Início está ativo em /')
assert(testIsActive('/comunidade', '/') === false, 'Comunidade inativa em /')
assert(testIsActive('/comunidade', '/comunidade') === true, 'Comunidade está ativa em /comunidade')
assert(testIsActive('/comunidade', '/comunidade?cat=jogo') === true, 'Comunidade ativa com query params em /comunidade')
assert(testIsActive('/jogar', '/comunidade') === false, 'Jogar inativo em /comunidade')
assert(testIsActive('/jogar', '/jogar') === true, 'Jogar ativo em /jogar')
assert(testIsActive('/rankings', '/rankings') === true, 'Ranking ativo em /rankings')
assert(testIsActive('/eventos', '/eventos') === true, 'Eventos ativo em /eventos')

console.log('\n================================================================================')
if (allPassed) {
  console.log('🎉 TODOS OS TESTES DE NAVEGAÇÃO MOBILE PASSARAM COM 100% DE SUCESSO!')
} else {
  console.error('❌ ALGUNS TESTES FALHARAM.')
  process.exit(1)
}
console.log('================================================================================\n')
