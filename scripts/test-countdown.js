/**
 * Script de Testes e Validação Temporal do Contador de Lançamento Mobile
 * Acorda Portugal — acordaportugal.pt
 */

const assert = require('assert')

// Reproduz a função de cálculo para execução pura em Node.js
function calculateTimeRemaining(targetTimestampMs, currentTimestampMs = Date.now()) {
  if (typeof targetTimestampMs !== 'number' || isNaN(targetTimestampMs)) {
    return {
      days: 0, hours: 0, minutes: 0, seconds: 0,
      totalRemainingMs: 0, isLaunched: true,
      formatted: { days: '00', hours: '00', minutes: '00', seconds: '00' }
    }
  }

  const safeCurrent = typeof currentTimestampMs === 'number' && !isNaN(currentTimestampMs)
    ? currentTimestampMs
    : Date.now()

  const diff = targetTimestampMs - safeCurrent

  if (diff <= 0) {
    return {
      days: 0, hours: 0, minutes: 0, seconds: 0,
      totalRemainingMs: 0, isLaunched: true,
      formatted: { days: '00', hours: '00', minutes: '00', seconds: '00' }
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.max(0, Math.floor(totalSeconds / (3600 * 24)))
  const hours = Math.max(0, Math.floor((totalSeconds % (3600 * 24)) / 3600))
  const minutes = Math.max(0, Math.floor((totalSeconds % 3600) / 60))
  const seconds = Math.max(0, Math.floor(totalSeconds % 60))

  return {
    days,
    hours,
    minutes,
    seconds,
    totalRemainingMs: diff,
    isLaunched: false,
    formatted: {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    },
  }
}

console.log('🧪 Iniciando bateria de testes do Contador de Lançamento Mobile...\n')

// 1. Data Oficial
const targetIso = '2026-09-11T22:00:00+01:00'
const targetDate = new Date(targetIso)
const targetMs = targetDate.getTime()

console.log(`✓ Data Oficial: ${targetIso}`)
console.log(`✓ Timestamp UTC (ms): ${targetMs}`)
console.log(`✓ Data formatada UTC: ${targetDate.toUTCString()}`)
assert.strictEqual(targetDate.toISOString(), '2026-09-11T21:00:00.000Z', 'Data deve corresponder a 21:00 UTC em 11 de setembro de 2026')

// 2. Teste: 1 hora antes do lançamento a partir de vários fusos horários
const oneHourBeforeLisbon = new Date('2026-09-11T21:00:00+01:00').getTime()
const oneHourBeforeLondon = new Date('2026-09-11T21:00:00+01:00').getTime()
const oneHourBeforeUtc = new Date('2026-09-11T20:00:00Z').getTime()
const oneHourBeforeNy = new Date('2026-09-11T16:00:00-04:00').getTime()
const oneHourBeforeTokyo = new Date('2026-09-12T05:00:00+09:00').getTime()

const resLisbon = calculateTimeRemaining(targetMs, oneHourBeforeLisbon)
const resUtc = calculateTimeRemaining(targetMs, oneHourBeforeUtc)
const resNy = calculateTimeRemaining(targetMs, oneHourBeforeNy)
const resTokyo = calculateTimeRemaining(targetMs, oneHourBeforeTokyo)

assert.deepStrictEqual(resLisbon.formatted, { days: '00', hours: '01', minutes: '00', seconds: '00' })
assert.deepStrictEqual(resUtc.formatted, { days: '00', hours: '01', minutes: '00', seconds: '00' })
assert.deepStrictEqual(resNy.formatted, { days: '00', hours: '01', minutes: '00', seconds: '00' })
assert.deepStrictEqual(resTokyo.formatted, { days: '00', hours: '01', minutes: '00', seconds: '00' })
console.log('✓ Teste de Fusos Horários Múltiplos: APROVADO (1 hora antes produz exatamente 00:01:00:00 em qualquer fuso)')

// 3. Teste: Dias, Horas, Minutos e Segundos complexos
// 15 dias, 8 horas, 42 minutos e 17 segundos antes
const complexDiffMs = (15 * 86400 + 8 * 3600 + 42 * 60 + 17) * 1000
const complexBeforeMs = targetMs - complexDiffMs
const resComplex = calculateTimeRemaining(targetMs, complexBeforeMs)
assert.strictEqual(resComplex.days, 15)
assert.strictEqual(resComplex.hours, 8)
assert.strictEqual(resComplex.minutes, 42)
assert.strictEqual(resComplex.seconds, 17)
assert.strictEqual(resComplex.isLaunched, false)
assert.deepStrictEqual(resComplex.formatted, { days: '15', hours: '08', minutes: '42', seconds: '17' })
console.log('✓ Teste de Contagem Mista (15d 08h 42m 17s): APROVADO')

// 4. Teste: Momento Exato do Lançamento
const resExact = calculateTimeRemaining(targetMs, targetMs)
assert.strictEqual(resExact.isLaunched, true)
assert.deepStrictEqual(resExact.formatted, { days: '00', hours: '00', minutes: '00', seconds: '00' })
console.log('✓ Teste do Momento Exato de Lançamento (diff = 0): APROVADO (isLaunched = true, 00:00:00:00)')

// 5. Teste: Pós-Lançamento (1 segundo depois)
const resPost1s = calculateTimeRemaining(targetMs, targetMs + 1000)
assert.strictEqual(resPost1s.isLaunched, true)
assert.strictEqual(resPost1s.days, 0)
assert.strictEqual(resPost1s.hours, 0)
assert.strictEqual(resPost1s.minutes, 0)
assert.strictEqual(resPost1s.seconds, 0)
assert.deepStrictEqual(resPost1s.formatted, { days: '00', hours: '00', minutes: '00', seconds: '00' })
console.log('✓ Teste Pós-Lançamento (+1s): APROVADO (isLaunched = true, sem valores negativos)')

// 6. Teste: Pós-Lançamento a longo prazo (100 dias depois)
const resPost100d = calculateTimeRemaining(targetMs, targetMs + (100 * 86400 * 1000))
assert.strictEqual(resPost100d.isLaunched, true)
assert.strictEqual(resPost100d.days, 0)
assert.strictEqual(resPost100d.hours, 0)
assert.strictEqual(resPost100d.minutes, 0)
assert.strictEqual(resPost100d.seconds, 0)
console.log('✓ Teste Pós-Lançamento (+100 dias): APROVADO (sem valores negativos)')

// 7. Teste de Proteção contra entradas inválidas
const resNaN = calculateTimeRemaining(NaN, 100)
assert.strictEqual(resNaN.isLaunched, true)
assert.strictEqual(resNaN.days, 0)
console.log('✓ Teste de Segurança contra Entradas Inválidas: APROVADO')

console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!')
