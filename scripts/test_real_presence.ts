import {
  filterActiveRealPlayers,
  sanitizePublicDisplayName,
  OFFLINE_TTL_MS,
  type RealPlayerPresence,
} from '../lib/real-presence'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FALHA: ${msg}`)
  }
  console.log(`✅ [PASS] ${msg}`)
}

function runPresenceTests() {
  console.log('================================================================================')
  console.log('🧪 BATERIA DE TESTES: SISTEMA DE PRESENÇA REAL (100% HUMANO)')
  console.log('================================================================================\n')

  const now = Date.now()

  // TESTE 1: Estado Vazio -> 0 jogadores online
  console.log('--- TESTE 1: ESTADO VAZIO ---')
  const emptyState = filterActiveRealPlayers([], undefined, now)
  assert(emptyState.humanOnline === 0, 'Zero jogadores quando base de dados está vazia')
  assert(emptyState.playingCount === 0, 'Zero jogadores em partida')
  assert(emptyState.duelCount === 0, 'Zero jogadores em duelo')
  assert(emptyState.players.length === 0, 'Lista de jogadores vazia')

  // TESTE 2: Jogadores Ativos dentro do TTL
  console.log('\n--- TESTE 2: JOGADORES ATIVOS DENTRO DO TTL ---')
  const mockDocs = [
    {
      userId: 'user_1',
      displayName: 'Vasco da Gama',
      district: 'Lisboa',
      activity: 'playing',
      lastSeen: now - 15_000, // 15s atrás (ativo)
      online: true,
      level: 4,
    },
    {
      userId: 'user_2',
      displayName: 'Infante D. Henrique',
      district: 'Porto',
      activity: 'duel',
      lastSeen: now - 30_000, // 30s atrás (ativo)
      online: true,
      level: 6,
    },
    {
      userId: 'user_3',
      displayName: 'Luís de Camões',
      district: 'Coimbra',
      activity: 'browsing',
      lastSeen: now - 45_000, // 45s atrás (ativo)
      online: true,
      level: 10,
    },
  ]

  const activeState = filterActiveRealPlayers(mockDocs, 'user_1', now)
  assert(activeState.humanOnline === 3, 'Exatamente 3 jogadores online detetados')
  assert(activeState.playingCount === 1, 'Exatamente 1 jogador em partida')
  assert(activeState.duelCount === 1, 'Exatamente 1 jogador em duelo')
  assert(activeState.players[0].userId === 'user_1', 'Utilizador atual ordenado em primeiro lugar')

  // TESTE 3: Expiração Automática por TTL (Desconexão / Fecho de App)
  console.log('\n--- TESTE 3: EXPIRAÇÃO AUTOMÁTICA POR TTL (INATIVIDADE / APP FECHADA) ---')
  const expiredDocs = [
    ...mockDocs,
    {
      userId: 'user_ghost',
      displayName: 'Jogador Desconectado',
      district: 'Braga',
      activity: 'playing',
      lastSeen: now - (OFFLINE_TTL_MS + 5_000), // Expirado (80s atrás)
      online: true,
    },
  ]
  const stateWithExpired = filterActiveRealPlayers(expiredDocs, undefined, now)
  assert(stateWithExpired.humanOnline === 3, 'Jogador expirado (>75s) descartado automaticamente')
  assert(!stateWithExpired.players.some((p) => p.userId === 'user_ghost'), 'Ghost user não incluído na lista')

  // TESTE 4: Jogador com online: false é excluído imediatamente (Logout / Unload)
  console.log('\n--- TESTE 4: EXCLUSÃO DE STATUS OFFLINE (LOGOUT / UNLOAD) ---')
  const docsWithOffline = [
    ...mockDocs,
    {
      userId: 'user_logout',
      displayName: 'Jogador que fez Logout',
      district: 'Faro',
      activity: 'browsing',
      lastSeen: now - 5_000, // Recente mas com online: false
      online: false,
    },
  ]
  const stateWithOffline = filterActiveRealPlayers(docsWithOffline, undefined, now)
  assert(stateWithOffline.humanOnline === 3, 'Jogador com online: false descartado mesmo que lastSeen seja recente')

  // TESTE 5: Deduplicação e Prevenção de Múltiplas Sessões
  console.log('\n--- TESTE 5: DEDUPLICAÇÃO DE MÚLTIPLAS TABS / DOCUMENTOS ---')
  const duplicateDocs = [
    ...mockDocs,
    {
      userId: 'user_1', // Mesma conta noutra tab
      displayName: 'Vasco da Gama (Tab 2)',
      district: 'Lisboa',
      activity: 'browsing',
      lastSeen: now - 5_000,
      online: true,
    },
  ]
  const deduplicatedState = filterActiveRealPlayers(duplicateDocs, undefined, now)
  assert(deduplicatedState.humanOnline === 3, 'Múltiplas tabs do mesmo utilizador contam apenas como 1 jogador online')

  // TESTE 6: Proteção de Privacidade e Sanitização de Nomes
  console.log('\n--- TESTE 6: PROTEÇÃO DE PRIVACIDADE ---')
  const emailName = sanitizePublicDisplayName('ricardo.silva@gmail.com', 'Porto')
  assert(emailName === 'ricardo.silva', 'Email sanitizado para nome público sem domínio')
  const emptyNameWithDistrict = sanitizePublicDisplayName('', 'Aveiro')
  assert(emptyNameWithDistrict === 'Cidadão (Aveiro)', 'Nome vazio com distrito formatado adequadamente')
  const nullName = sanitizePublicDisplayName(null, '')
  assert(nullName === 'Jogador Nacional', 'Nome nulo recebe fallback nacional')

  console.log('\n================================================================================')
  console.log('🌟 TODOS OS TESTES DO SISTEMA DE PRESENÇA REAL PASSARAM COM 100% DE SUCESSO!')
  console.log('================================================================================')
}

runPresenceTests()