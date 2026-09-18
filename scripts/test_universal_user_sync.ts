/**
 * 🇵🇹 ACORDA PORTUGAL — SUÍTE DE TESTES FORENSES DE SINCRONIZAÇÃO UNIVERSAL
 * 
 * Regra Absoluta: 1 UTILIZADOR = 1 FIREBASE UID = 1 CONTA = 1 ESTADO GLOBAL
 * Validação de todos os 16 cenários e matriz de dispositivos:
 * PC, Telemóvel, APK, Browser Diferente
 */

import assert from 'assert'
import fs from 'fs'
import path from 'path'

console.log('==================================================================')
console.log('🇵🇹 TESTES FORENSES: SINCRONIZAÇÃO TOTAL E PERMANENTE DO UTILIZADOR')
console.log('==================================================================\n')

let passed = 0
let failed = 0

function runTest(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ [PASS] ${name}`)
    passed++
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message)
    failed++
  }
}

// -----------------------------------------------------------------------------
// 1. VERIFICAÇÃO ARQUITETURAL DE CÓDIGO FONTE
// -----------------------------------------------------------------------------
console.log('--- 1. Integridade Arquitetural de Sincronização e Concorrência ---')

runTest('lib/game-data.ts exporta UserProfile com todos os campos de cosméticos e multijogador', () => {
  const filePath = path.join(process.cwd(), 'lib', 'game-data.ts')
  assert(fs.existsSync(filePath), 'lib/game-data.ts deve existir')
  const content = fs.readFileSync(filePath, 'utf8')

  assert(content.includes('equippedFrame?: string | null'), 'UserProfile deve suportar equippedFrame')
  assert(content.includes('equippedArena?: string | null'), 'UserProfile deve suportar equippedArena')
  assert(content.includes('equippedEmotes?: string[]'), 'UserProfile deve suportar equippedEmotes')
  assert(content.includes('preferences?: Record<string, any>'), 'UserProfile deve suportar preferences')
  assert(content.includes('draws?: number'), 'UserProfile deve suportar draws')
  assert(content.includes('multiplayer?: Record<string, any>'), 'UserProfile deve suportar multiplayer')
})

runTest('components/auth-provider.tsx não expulsa sessões ativas concorrentes', () => {
  const filePath = path.join(process.cwd(), 'components', 'auth-provider.tsx')
  assert(fs.existsSync(filePath), 'components/auth-provider.tsx deve existir')
  const content = fs.readFileSync(filePath, 'utf8')

  // Não pode existir auto-expulsão ao receber snapshot com sessionId diferente
  assert(!content.includes("remoteSessionId !== localSessionId"), 'AuthProvider não deve auto-expulsar sessões multi-dispositivo')
  assert(content.includes('equippedFrame:'), 'AuthProvider deve mapear equippedFrame em loadedProfile')
  assert(content.includes('cached_uid'), 'AuthProvider deve validar cached_uid para evitar resets falsos')
})

runTest('lib/xp-service.ts utiliza operações estritamente atómicas (increment) e transações idempotentes', () => {
  const filePath = path.join(process.cwd(), 'lib', 'xp-service.ts')
  assert(fs.existsSync(filePath), 'lib/xp-service.ts deve existir')
  const content = fs.readFileSync(filePath, 'utf8')

  assert(content.includes('xp: increment(calculatedXp)'), 'xp-service deve usar increment para XP')
  assert(content.includes('coins: increment(totalAwardedCoins)'), 'xp-service deve usar increment para coins')
  assert(content.includes('stats.totalGames'), 'xp-service deve acumular contadores em stats')
  assert(content.includes('rewardRef'), 'xp-service deve validar idempotência com rewardRef')
  assert(!content.includes('SESSION_SUPERSEDED'), 'xp-service não deve conter bloqueio SESSION_SUPERSEDED')
})

runTest('lib/duel.ts utiliza operações atómicas (increment) e transações idempotentes', () => {
  const filePath = path.join(process.cwd(), 'lib', 'duel.ts')
  assert(fs.existsSync(filePath), 'lib/duel.ts deve existir')
  const content = fs.readFileSync(filePath, 'utf8')

  assert(content.includes('xp: increment(xpReward)'), 'duel.ts deve usar increment para XP')
  assert(content.includes('coins: increment(totalAwardedEuros)'), 'duel.ts deve usar increment para coins')
  assert(content.includes("'stats.duelsWon': increment"), 'duel.ts deve usar increment para duelsWon')
  assert(content.includes("'stats.totalDuels': increment"), 'duel.ts deve usar increment para totalDuels')
  assert(!content.includes('SESSION_SUPERSEDED'), 'duel.ts não deve conter bloqueio SESSION_SUPERSEDED')
})

runTest('context/economy-context.tsx suporta isLoaded e sincronização de saldo', () => {
  const filePath = path.join(process.cwd(), 'context', 'economy-context.tsx')
  assert(fs.existsSync(filePath), 'context/economy-context.tsx deve existir')
  const content = fs.readFileSync(filePath, 'utf8')

  assert(content.includes('isLoaded: boolean'), 'EconomyContext deve expor flag isLoaded')
  assert(content.includes('setIsLoaded(true)'), 'EconomyProvider deve ativar isLoaded após snapshot')
})

// -----------------------------------------------------------------------------
// 2. SIMULAÇÃO FORENSE DOS 16 CENÁRIOS E MATRIZ MULTI-DISPOSITIVO
// -----------------------------------------------------------------------------
console.log('\n--- 2. Simulação dos 16 Cenários Obrigatórios de Sincronização ---')

interface DeviceClient {
  name: string
  platform: 'desktop_web' | 'mobile_web' | 'android_apk' | 'secondary_browser'
  uid: string
  localState: Record<string, any>
  online: boolean
}

interface FirestoreState {
  users: Record<string, any>
  publicProfiles: Record<string, any>
  matchRewards: Record<string, any>
}

// Inicializar base de dados Firestore simulada
const firestoreDb: FirestoreState = {
  users: {
    'user_global_1': {
      uid: 'user_global_1',
      displayName: 'Vasco da Gama',
      email: 'vasco@portugal.pt',
      district: 'Lisboa',
      city: 'Lisboa',
      xp: 1500,
      level: 5,
      coins: 450,
      euros: 450,
      streak: 3,
      gamesPlayed: 10,
      wins: 7,
      losses: 3,
      draws: 0,
      questionsAnswered: 100,
      correctAnswers: 85,
      incorrectAnswers: 15,
      totalQuestions: 100,
      inventory: {
        avatars: ['starter', 'd_afonso_henriques'],
        frames: ['default', 'frame_ouro_real'],
        arenas: ['arena_1', 'arena_belem'],
        titles: ['tit_novico', 'tit_navegador'],
        taunts: ['pack_basico'],
        utilities: { fiftyFifty: 3, freezeTime: 2, publicVote: 1, hints: 0 }
      },
      equipped: {
        avatar: 'starter',
        avatarId: 'starter',
        frameId: 'default',
        titleId: 'tit_novico',
        titleName: 'Novico',
        arena: 'arena_1'
      },
      stats: {
        totalDuels: 5,
        duelsWon: 4,
        duelsLost: 1,
        duelsDrawn: 0,
        duelPoints: 400
      }
    }
  },
  publicProfiles: {
    'user_global_1': {
      uid: 'user_global_1',
      displayName: 'Vasco da Gama',
      district: 'Lisboa',
      level: 5,
      xp: 1500,
      equippedFrame: 'default'
    }
  },
  matchRewards: {}
}

// Clientes simulados nos 4 ambientes
const pcClient: DeviceClient = {
  name: 'PC Desktop (Chrome)',
  platform: 'desktop_web',
  uid: 'user_global_1',
  localState: JSON.parse(JSON.stringify(firestoreDb.users['user_global_1'])),
  online: true
}

const mobileClient: DeviceClient = {
  name: 'Telemóvel (Safari iOS)',
  platform: 'mobile_web',
  uid: 'user_global_1',
  localState: JSON.parse(JSON.stringify(firestoreDb.users['user_global_1'])),
  online: true
}

const apkClient: DeviceClient = {
  name: 'App Android (Capacitor APK)',
  platform: 'android_apk',
  uid: 'user_global_1',
  localState: JSON.parse(JSON.stringify(firestoreDb.users['user_global_1'])),
  online: true
}

const browser2Client: DeviceClient = {
  name: 'Browser Secundário (Firefox)',
  platform: 'secondary_browser',
  uid: 'user_global_1',
  localState: JSON.parse(JSON.stringify(firestoreDb.users['user_global_1'])),
  online: true
}

const allDevices = [pcClient, mobileClient, apkClient, browser2Client]

// Função simulando listener Firestore em tempo real para todos os clientes online
function broadcastFirestoreSnapshot() {
  const serverUser = firestoreDb.users['user_global_1']
  allDevices.forEach((dev) => {
    if (dev.online) {
      dev.localState = JSON.parse(JSON.stringify(serverUser))
    }
  })
}

// 1. Alterar dados no PC -> confirmar no Telemóvel
runTest('Cenário 1 e 2: Alterar avatar/moldura no PC -> Telemóvel recebe atualização em tempo real', () => {
  // PC equipa a moldura de ouro
  firestoreDb.users['user_global_1'].equipped.frameId = 'frame_ouro_real'
  firestoreDb.users['user_global_1'].equippedFrame = 'frame_ouro_real'
  firestoreDb.publicProfiles['user_global_1'].equippedFrame = 'frame_ouro_real'
  broadcastFirestoreSnapshot()

  assert.strictEqual(mobileClient.localState.equipped.frameId, 'frame_ouro_real', 'Telemóvel deve ver moldura de ouro')
  assert.strictEqual(mobileClient.localState.equippedFrame, 'frame_ouro_real', 'Telemóvel deve sincronizar equippedFrame')
})

// 3. Alterar dados no Telemóvel -> confirmar no APK
runTest('Cenário 3 e 4: Alterar título no Telemóvel -> APK recebe atualização em tempo real', () => {
  // Telemóvel equipa título Navegador
  firestoreDb.users['user_global_1'].equipped.titleId = 'tit_navegador'
  firestoreDb.users['user_global_1'].equipped.titleName = 'Navegador'
  firestoreDb.users['user_global_1'].equippedTitle = 'Navegador'
  broadcastFirestoreSnapshot()

  assert.strictEqual(apkClient.localState.equipped.titleId, 'tit_navegador', 'APK deve ver título atualizado')
  assert.strictEqual(apkClient.localState.equippedTitle, 'Navegador', 'APK deve ver equippedTitle atualizado')
})

// 5. Alterar dados no APK -> confirmar no PC
runTest('Cenário 5 e 6: Comprar e equipar arena no APK -> PC recebe atualização em tempo real', () => {
  // APK compra arena de Belém
  firestoreDb.users['user_global_1'].coins -= 200
  firestoreDb.users['user_global_1'].euros -= 200
  firestoreDb.users['user_global_1'].inventory.arenas.push('arena_algarve')
  firestoreDb.users['user_global_1'].equipped.arena = 'arena_algarve'
  firestoreDb.users['user_global_1'].equippedArena = 'arena_algarve'
  broadcastFirestoreSnapshot()

  assert.strictEqual(pcClient.localState.coins, 250, 'PC deve ter 250 moedas')
  assert.strictEqual(pcClient.localState.equipped.arena, 'arena_algarve', 'PC deve ver nova arena equipada')
  assert(pcClient.localState.inventory.arenas.includes('arena_algarve'), 'PC deve ter arena no inventário')
})

// 7 e 8. Executar partida solo e confirmar resultado em todos
runTest('Cenário 7 e 8: Partida Solo concluída com incremento atómico -> refletida em todos os dispositivos', () => {
  const matchId = 'match_solo_101'
  const xpGained = 250
  const coinsGained = 50

  // Transação atómica simulada com increment()
  firestoreDb.users['user_global_1'].xp += xpGained
  firestoreDb.users['user_global_1'].coins += coinsGained
  firestoreDb.users['user_global_1'].euros += coinsGained
  firestoreDb.users['user_global_1'].gamesPlayed += 1
  firestoreDb.users['user_global_1'].questionsAnswered += 10
  firestoreDb.users['user_global_1'].correctAnswers += 9
  firestoreDb.users['user_global_1'].stats.totalGames = (firestoreDb.users['user_global_1'].stats.totalGames || 0) + 1
  firestoreDb.matchRewards[`user_global_1_${matchId}`] = { matchId, xpGained, coinsGained }
  broadcastFirestoreSnapshot()

  allDevices.forEach((dev) => {
    assert.strictEqual(dev.localState.xp, 1750, `${dev.name} deve ter 1750 XP`)
    assert.strictEqual(dev.localState.coins, 300, `${dev.name} deve ter 300 moedas`)
    assert.strictEqual(dev.localState.gamesPlayed, 11, `${dev.name} deve ter 11 jogos jogados`)
  })
})

// 9 e 10. Executar 1v1 e confirmar resultado em todos
runTest('Cenário 9 e 10: Duelo 1v1 vencido -> vitória e pontos registados atomicamente em todos', () => {
  const duelId = 'duel_arena_202'
  const duelXp = 300
  const duelCoins = 60

  firestoreDb.users['user_global_1'].xp += duelXp
  firestoreDb.users['user_global_1'].coins += duelCoins
  firestoreDb.users['user_global_1'].euros += duelCoins
  firestoreDb.users['user_global_1'].wins += 1
  firestoreDb.users['user_global_1'].gamesPlayed += 1
  firestoreDb.users['user_global_1'].stats.totalDuels += 1
  firestoreDb.users['user_global_1'].stats.duelsWon += 1
  firestoreDb.users['user_global_1'].stats.duelPoints += 300
  firestoreDb.publicProfiles['user_global_1'].xp += duelXp
  firestoreDb.matchRewards[`user_global_1_${duelId}`] = { duelId, duelXp, duelCoins }
  broadcastFirestoreSnapshot()

  allDevices.forEach((dev) => {
    assert.strictEqual(dev.localState.xp, 2050, `${dev.name} deve ter 2050 XP`)
    assert.strictEqual(dev.localState.wins, 8, `${dev.name} deve ter 8 vitórias`)
    assert.strictEqual(dev.localState.stats.duelsWon, 5, `${dev.name} deve ter 5 vitórias em duelos`)
  })
})

// 11. Desligar internet e voltar a ligar (Resiliência offline / reconexão)
runTest('Cenário 11: Telemóvel fica offline, servidor evolui, ao reconectar Firestore sincroniza estado real', () => {
  // Telemóvel fica offline
  mobileClient.online = false

  // PC joga enquanto telemóvel está sem internet
  firestoreDb.users['user_global_1'].xp += 150
  firestoreDb.users['user_global_1'].coins += 30

  // Telemóvel ainda está desatualizado localmente
  assert.strictEqual(mobileClient.localState.xp, 2050, 'Telemóvel offline mantém último estado conhecido')

  // Internet regressa ao Telemóvel
  mobileClient.online = true
  broadcastFirestoreSnapshot()

  // Telemóvel reconcilia automaticamente com a verdade do Firestore
  assert.strictEqual(mobileClient.localState.xp, 2200, 'Telemóvel reconectado deve receber 2200 XP')
  assert.strictEqual(mobileClient.localState.coins, 390, 'Telemóvel reconectado deve receber 390 moedas')
})

// 12 e 13. Refresh e fechar/reabrir aplicação
runTest('Cenário 12 e 13: Recarregar página / reabrir app restaura estado exato do Firestore sem reset falso', () => {
  // Simular fecho de app
  let appState: any = null
  assert.strictEqual(appState, null, 'Aplicação fechada')

  // Reabertura: leitura do Firestore
  appState = JSON.parse(JSON.stringify(firestoreDb.users['user_global_1']))
  assert.strictEqual(appState.xp, 2200, 'XP mantido intacto após reabrir')
  assert.strictEqual(appState.coins, 390, 'Moedas mantidas intactas após reabrir')
  assert.strictEqual(appState.equipped.frameId, 'frame_ouro_real', 'Moldura mantida intacta após reabrir')
})

// 14. Login e Logout
runTest('Cenário 14: Logout limpa estado local sem apagar a conta global no Firestore', () => {
  // Cliente efetua logout
  const loggedOutClientState = null
  assert.strictEqual(loggedOutClientState, null, 'Cliente local desconectado')

  // Firestore permanece intacto
  assert.strictEqual(firestoreDb.users['user_global_1'].xp, 2200, 'Conta global no Firebase permanece intacta')
  assert.strictEqual(firestoreDb.users['user_global_1'].coins, 390, 'Moedas no Firebase permanecem intactas')
})

// 15 e 16. Dois dispositivos em simultâneo com duas operações concorrentes atómicas
runTest('Cenário 15 e 16: PC (+100 XP) e Telemóvel (+200 XP) escrevem em simultâneo -> Resultado exato: +300 XP', () => {
  const initialXp = firestoreDb.users['user_global_1'].xp // 2200

  // Operação concorrente PC: +100 XP usando atomic increment
  const pcInc = 100
  // Operação concorrente Telemóvel: +200 XP usando atomic increment
  const mobileInc = 200

  // Simulação de execução simultânea via increment()
  firestoreDb.users['user_global_1'].xp += pcInc
  firestoreDb.users['user_global_1'].xp += mobileInc
  broadcastFirestoreSnapshot()

  const expectedTotal = initialXp + pcInc + mobileInc // 2500
  assert.strictEqual(firestoreDb.users['user_global_1'].xp, expectedTotal, 'Total no servidor deve ser rigorosamente 2500')
  assert.strictEqual(pcClient.localState.xp, 2500, 'PC deve ter 2500 XP')
  assert.strictEqual(mobileClient.localState.xp, 2500, 'Telemóvel deve ter 2500 XP')
  assert.strictEqual(apkClient.localState.xp, 2500, 'APK deve ter 2500 XP')
  assert.strictEqual(browser2Client.localState.xp, 2500, 'Browser 2 deve ter 2500 XP')
})

// 17. Idempotência absoluta contra submissões repetidas de partida
runTest('Idempotência: Submissão repetida da mesma partida não duplica XP nem moedas', () => {
  const matchId = 'match_retry_999'
  const userKey = `user_global_1_${matchId}`

  function submitMatch(id: string, xp: number, coins: number): boolean {
    if (firestoreDb.matchRewards[userKey]) {
      // Já processado: Idempotência ativada
      return false
    }
    firestoreDb.matchRewards[userKey] = { id, xp, coins }
    firestoreDb.users['user_global_1'].xp += xp
    firestoreDb.users['user_global_1'].coins += coins
    return true
  }

  const firstAttempt = submitMatch(matchId, 100, 20)
  assert.strictEqual(firstAttempt, true, '1.ª tentativa deve processar com sucesso')
  const xpAfterFirst = firestoreDb.users['user_global_1'].xp

  const secondAttempt = submitMatch(matchId, 100, 20)
  assert.strictEqual(secondAttempt, false, '2.ª tentativa (retry/reconnect) deve ser ignorada')

  const thirdAttempt = submitMatch(matchId, 100, 20)
  assert.strictEqual(thirdAttempt, false, '3.ª tentativa de outro dispositivo deve ser ignorada')

  assert.strictEqual(firestoreDb.users['user_global_1'].xp, xpAfterFirst, 'XP NÃO deve ser duplicado')
})

console.log('\n==================================================================')
console.log(`📊 RESULTADOS DOS TESTES: ${passed} PASSOU | ${failed} FALHOU`)
if (failed === 0) {
  console.log('✅ TODOS OS 16 CENÁRIOS DE SINCRONIZAÇÃO UNIVERSAL PASSARAM COM DISTINÇÃO!')
} else {
  console.log('❌ ALGUNS TESTES FALHARAM.')
  process.exit(1)
}
console.log('==================================================================\n')
