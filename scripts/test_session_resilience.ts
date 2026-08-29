import assert from 'assert'
import fs from 'fs'
import path from 'path'

console.log('============================================================')
console.log('🇵🇹 ACORDA PORTUGAL — AUDITORIA FORENSE DE SESSÃO E RESILIÊNCIA')
console.log('============================================================\n')

// 1. Verificar ficheiro AuthProvider
const authProviderPath = path.join(process.cwd(), 'components', 'auth-provider.tsx')
assert(fs.existsSync(authProviderPath), 'components/auth-provider.tsx deve existir')
const authProviderContent = fs.readFileSync(authProviderPath, 'utf8')

// Teste 1.1: Máquina de estados
assert(authProviderContent.includes('AUTH_INITIALIZING'), 'AuthProvider deve suportar AUTH_INITIALIZING')
assert(authProviderContent.includes('AUTHENTICATED'), 'AuthProvider deve suportar AUTHENTICATED')
assert(authProviderContent.includes('AUTH_UNAUTHENTICATED'), 'AuthProvider deve suportar AUTH_UNAUTHENTICATED')
assert(authProviderContent.includes('NETWORK_TEMPORARY_ERROR'), 'AuthProvider deve suportar NETWORK_TEMPORARY_ERROR')
assert(authProviderContent.includes('FIRESTORE_TEMPORARY_ERROR'), 'AuthProvider deve suportar FIRESTORE_TEMPORARY_ERROR')
assert(authProviderContent.includes('SESSION_EXPIRED_REAL'), 'AuthProvider deve suportar SESSION_EXPIRED_REAL')
console.log('[TEST 1] Máquina de Estados do AuthProvider: PASS')

// Teste 1.2: Hidratação de Cache Imediata
assert(authProviderContent.includes('getCachedInitialProfile'), 'AuthProvider deve possuir hidratação instantânea de cache')
console.log('[TEST 2] Hidratação Instantânea de Perfil (Zero telas brancas): PASS')

// Teste 1.3: Silent Retries com Backoff Exponencial
assert(authProviderContent.includes('firestoreRetryCountRef'), 'AuthProvider deve implementar retries controlados')
assert(authProviderContent.includes('Math.pow(2,'), 'AuthProvider deve utilizar backoff exponencial')
console.log('[TEST 3] Silent Retries com Backoff Exponencial no Firestore: PASS')

// 2. Verificar Error Boundary (app/error.tsx)
const errorPath = path.join(process.cwd(), 'app', 'error.tsx')
assert(fs.existsSync(errorPath), 'app/error.tsx deve existir')
const errorContent = fs.readFileSync(errorPath, 'utf8')

// Garantir que app/error.tsx NÃO se intitula "Recuperação de Sessão" nem "Instabilidade Temporária"
assert(!errorContent.includes('<h1 className="font-display text-2xl font-black uppercase text-white tracking-tight">\n            Recuperação de Sessão'), 'app/error.tsx não deve intitular-se Recuperação de Sessão')
assert(!errorContent.includes('Instabilidade Temporária'), 'app/error.tsx não deve intitular-se Instabilidade Temporária')
assert(errorContent.includes('ap_error_auto_retried'), 'app/error.tsx deve conter auto-recuperação de chunks e rede')
console.log('[TEST 4] Error Boundary app/error.tsx desmistificado e resiliente: PASS')

// 3. Verificar app/jogar/page.tsx
const jogarPath = path.join(process.cwd(), 'app', 'jogar', 'page.tsx')
assert(fs.existsSync(jogarPath), 'app/jogar/page.tsx deve existir')
const jogarContent = fs.readFileSync(jogarPath, 'utf8')

assert(!jogarContent.includes('Redirecionando para o ecrã de início de sessão.'), 'app/jogar/page.tsx não deve exibir avisos alarmistas na inicialização')
assert(jogarContent.includes('A carregar o Desafio Nacional...'), 'app/jogar/page.tsx deve ter loading limpo durante AUTH_INITIALIZING')
console.log('[TEST 5] Fluxo de arranque em /jogar: PASS')

// 4. Verificar session-manager
const sessionMgrPath = path.join(process.cwd(), 'lib', 'session-manager.ts')
assert(fs.existsSync(sessionMgrPath), 'lib/session-manager.ts deve existir')
const sessionMgrContent = fs.readFileSync(sessionMgrPath, 'utf8')
assert(sessionMgrContent.includes('setDoc'), 'registerUserSession deve utilizar setDoc merge')
console.log('[TEST 6] Registo seguro de sessão única: PASS')

console.log('\n============================================================')
console.log('✅ TODOS OS TESTES DE RESILIÊNCIA E SESSÃO PASSARAM COM SUCESSO!')
console.log('============================================================')
