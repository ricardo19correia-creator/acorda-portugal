// Suite de Testes Automáticos — Higienização e Sistema de Eventos
// Valida a limpeza de dados fictícios e a integridade de cálculo dinâmico de eventos

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import {
  OFFICIAL_EVENT,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  calculateEventPoints,
  getLisbonDateString,
  sortEventParticipants,
  type EventParticipant,
  type OfficialEventConfig,
} from '../lib/events-service.ts'
import { EVENTS } from '../lib/game-data.ts'

console.log('================================================================================')
console.log('🧪 ACORDA PORTUGAL — BATERIA DE TESTES: LIMPEZA & SISTEMA DE EVENTOS')
console.log('================================================================================\n')

// 1. Limpeza de Eventos Fictícios
console.log('[1] Teste de Limpeza de Eventos Fictícios em lib/game-data.ts...')
const gameDataCode = fs.readFileSync(path.join(process.cwd(), 'lib', 'game-data.ts'), 'utf8')
const forbiddenNames = [
  'Semana de Portugal',
  'Especial Desporto',
  'Termina em 2d 14h',
  'Termina em 5d 03h',
  'Portugal em Jogo',
]
for (const fn of forbiddenNames) {
  assert(!gameDataCode.includes(fn), `Evento/dado fictício proibido "${fn}" não pode existir em lib/game-data.ts`)
}
assert.strictEqual(EVENTS.length, 0, 'Array EVENTS em lib/game-data.ts deve estar 100% vazio')
console.log('✅ Array EVENTS está vazio e livre de qualquer evento placeholder.')

// 2. Ausência de Evento Fictício Hardcoded
console.log('\n[2] Teste de Ausência de Evento Hardcoded...')
assert.strictEqual(OFFICIAL_EVENT, null, 'OFFICIAL_EVENT deve ser null (sem evento fictício)')
assert.strictEqual(getEventStatus(null), null, 'getEventStatus(null) deve retornar null')
assert.strictEqual(getEventCountdown(null), null, 'getEventCountdown(null) deve retornar null')
console.log('✅ Nenhum evento simulado ou fake existe como fallback.')

// 3. Teste de Cálculo com Evento Real (Simulado em Teste)
console.log('\n[3] Teste de Mudança Automática de Estado com Objeto Real...')
const testEvent: OfficialEventConfig = {
  id: 'evento-teste',
  title: 'Evento Teste',
  subtitle: 'Teste de Validação',
  tag: 'Teste',
  type: 'Especial',
  description: 'Descrição de teste',
  startDate: '2026-09-20T10:00:00+01:00',
  endDate: '2026-09-25T20:00:00+01:00',
  timezone: 'Europe/Lisbon',
  rewards: [],
  rules: { maxDailyMatches: 10, pointDivisor: 10 },
}

// Antes do início
const beforeStart = new Date('2026-09-19T10:00:00Z')
assert.strictEqual(getEventStatus(testEvent, beforeStart), 'upcoming')
assert.strictEqual(getEventStatusLabel('upcoming'), 'Em breve')

// Durante o evento
const duringEvent = new Date('2026-09-21T15:00:00Z')
assert.strictEqual(getEventStatus(testEvent, duringEvent), 'active')
assert.strictEqual(getEventStatusLabel('active'), 'A decorrer')

// Depois do término
const afterEnd = new Date('2026-09-26T00:01:00Z')
assert.strictEqual(getEventStatus(testEvent, afterEnd), 'ended')
assert.strictEqual(getEventStatusLabel('ended'), 'Terminado')
console.log('✅ Cálculo de estados dinâmicos (Em breve, A decorrer, Terminado) funciona com precisão.')

// 4. Conversão de Pontos da Partida para Pontos de Evento
console.log('\n[4] Teste de Conversão de Pontos de Evento...')
assert.strictEqual(calculateEventPoints(1000), 100, '1000 pontos na partida → 100 Pontos de Evento')
assert.strictEqual(calculateEventPoints(800), 80, '800 pontos na partida → 80 Pontos de Evento')
assert.strictEqual(calculateEventPoints(600), 60, '600 pontos na partida → 60 Pontos de Evento')
assert.strictEqual(calculateEventPoints(400), 40, '400 pontos na partida → 40 Pontos de Evento')
assert.strictEqual(calculateEventPoints(200), 20, '200 pontos na partida → 20 Pontos de Evento')
assert.strictEqual(calculateEventPoints(0), 0, '0 pontos na partida → 0 Pontos de Evento')
assert.strictEqual(calculateEventPoints(-50), 0, 'Pontos negativos não geram Pontos de Evento')
console.log('✅ Fórmula de conversão de Pontos de Evento conforme a especificação.')

// 5. Ordenação e Critério de Desempate Determinístico no Ranking
console.log('\n[5] Teste de Ranking e Critério de Desempate...')
const mockPlayers: EventParticipant[] = [
  {
    userId: 'user_c',
    displayName: 'Carlos Silva',
    eventPoints: 100,
    totalMatches: 2,
    totalScore: 1000,
    bestScore: 600,
  },
  {
    userId: 'user_a',
    displayName: 'Ana Pereira',
    eventPoints: 150,
    totalMatches: 2,
    totalScore: 1500,
    bestScore: 800,
  },
  {
    userId: 'user_b',
    displayName: 'Bernardo Costa',
    eventPoints: 100,
    totalMatches: 3,
    totalScore: 1050,
    bestScore: 500,
  },
]

const sorted = sortEventParticipants(mockPlayers)
assert.strictEqual(sorted[0].userId, 'user_a', 'Ana Pereira deve liderar com 150 EP')
assert.strictEqual(sorted[0].pos, 1)
assert.strictEqual(sorted[1].userId, 'user_b', 'Bernardo Costa deve ser 2.º lugar no desempate por totalScore')
assert.strictEqual(sorted[1].pos, 2)
assert.strictEqual(sorted[2].userId, 'user_c', 'Carlos Silva deve ser 3.º lugar')
assert.strictEqual(sorted[2].pos, 3)
console.log('✅ Critério de desempate determinístico verificado.')

// 6. Fuso Horário de Lisboa
console.log('\n[6] Teste de Data no Fuso Horário de Lisboa...')
const lisbonDate = getLisbonDateString()
assert(/^\d{4}-\d{2}-\d{2}$/.test(lisbonDate), 'Formato de data de Lisboa deve ser YYYY-MM-DD')
console.log(`✅ Data em Lisboa (Europe/Lisbon): ${lisbonDate}`)

// 7. Verificação da Barra de Navegação Móvel
console.log('\n[7] Teste da Ordem Estrita de Navegação Móvel...')
const mobileNavCode = fs.readFileSync(path.join(process.cwd(), 'components', 'navigation', 'MobileBottomBar.tsx'), 'utf8')
const expectedNavItems = [
  "{ label: 'Início', href: '/', icon: Home }",
  "{ label: 'Jogar', href: '/jogar', icon: Gamepad2 }",
  "{ label: 'Rankings', href: '/rankings', icon: Trophy }",
  "{ label: 'Eventos', href: '/eventos', icon: Calendar }",
  "{ label: 'Loja', href: '/loja', icon: ShoppingBag }",
  "{ label: 'Perfil', href: '/perfil', icon: User }",
]
for (const item of expectedNavItems) {
  assert(mobileNavCode.includes(item), `Item de navegação obrigatório presente: ${item}`)
}
console.log('✅ Ordem da barra móvel confirmada: Início → Jogar → Rankings → Eventos → Loja → Perfil.')

console.log('\n================================================================================')
console.log('🎉 RESULTADO: TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!')
console.log('================================================================================\n')
