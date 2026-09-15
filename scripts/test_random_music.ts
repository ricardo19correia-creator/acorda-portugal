/**
 * scripts/test_random_music.ts
 *
 * Verificação rigorosa do sistema de música de fundo aleatória:
 * 1. Seleção aleatória na nova sessão (pickInitialRandomTrack).
 * 2. Variação entre sessões (última faixa é evitada ao entrar novamente).
 * 3. Transições automáticas sem repetição imediata (getNextRandomTrack).
 * 4. Cobertura uniforme de todas as músicas da playlist oficial.
 * 5. Sequências não-determinísticas e dinâmicas.
 */

import {
  BGM_PLAYLIST,
  pickInitialRandomTrack,
  getNextRandomTrack,
} from '../context/AudioContext'

function runRandomMusicTests(): boolean {
  console.log('==================================================================')
  console.log('  TESTE DO MOTOR DE MÚSICA ALEATÓRIA (BGM DINÂMICA)')
  console.log('==================================================================\n')

  let allPassed = true

  // 1. Playlist oficial
  console.log(`1. Playlist Oficial (${BGM_PLAYLIST.length} faixas):`)
  BGM_PLAYLIST.forEach((track, i) => console.log(`   - Faixa ${i + 1}: ${track}`))

  if (BGM_PLAYLIST.length !== 4) {
    console.error('❌ ERRO: A playlist não contém exatamente as 4 faixas oficiais!')
    allPassed = false
  } else {
    console.log('   ✅ Playlist oficial preservada intacta.')
  }

  // 2. Teste de arranque de nova sessão (sem histórico)
  console.log('\n2. Teste de arranque de nova sessão (10.000 iterações):')
  const initialCounts = [0, 0, 0, 0]
  const TOTAL_RUNS = 10000

  for (let i = 0; i < TOTAL_RUNS; i++) {
    const track = pickInitialRandomTrack(null, BGM_PLAYLIST.length)
    initialCounts[track]++
  }

  console.log('   Distribuição das músicas iniciais:')
  initialCounts.forEach((count, i) => {
    const pct = ((count / TOTAL_RUNS) * 100).toFixed(2)
    console.log(`     Faixa ${i + 1}: ${count} vezes (${pct}%)`)
  })

  // Cada faixa deve rondar os 25% (aceita-se entre 20% e 30%)
  const hasGoodDistribution = initialCounts.every(
    (c) => c > TOTAL_RUNS * 0.2 && c < TOTAL_RUNS * 0.3
  )
  if (!hasGoodDistribution) {
    console.error('❌ ERRO: Distribuição inicial não é aleatória uniforme!')
    allPassed = false
  } else {
    console.log('   ✅ Distribuição inicial estatisticamente uniforme e aleatória.')
  }

  // 3. Teste de arranque com histórico (evitar a última faixa ouvida)
  console.log('\n3. Teste de diferenciação entre sessões (evitar repetição da última música):')
  let avoidedLastCount = 0
  for (let last = 0; last < BGM_PLAYLIST.length; last++) {
    for (let i = 0; i < 1000; i++) {
      const next = pickInitialRandomTrack(last, BGM_PLAYLIST.length)
      if (next === last) {
        avoidedLastCount++
      }
    }
  }

  if (avoidedLastCount > 0) {
    console.error(`❌ ERRO: ${avoidedLastCount} vezes a faixa anterior foi repetida na nova sessão!`)
    allPassed = false
  } else {
    console.log('   ✅ A última faixa da sessão anterior NUNCA é repetida no arranque da nova sessão (0 falhas em 4.000 testes).')
  }

  // 4. Teste de transições sucessivas (10.000 transições onEnded / nextTrack)
  console.log('\n4. Teste de transições contínuas sem repetição imediata (10.000 músicas consecutivas):')
  let currentTrack = pickInitialRandomTrack(null, BGM_PLAYLIST.length)
  let pool: number[] = []
  for (let i = 0; i < BGM_PLAYLIST.length; i++) {
    if (i !== currentTrack) pool.push(i)
  }

  let immediateRepetitions = 0
  const transitionCounts = [0, 0, 0, 0]
  transitionCounts[currentTrack]++

  const sequenceSamples: number[] = [currentTrack]

  for (let step = 0; step < TOTAL_RUNS; step++) {
    const res = getNextRandomTrack(currentTrack, pool, BGM_PLAYLIST.length)
    if (res.nextIndex === currentTrack) {
      immediateRepetitions++
    }
    currentTrack = res.nextIndex
    pool = res.newPool
    transitionCounts[currentTrack]++

    if (sequenceSamples.length < 20) {
      sequenceSamples.push(currentTrack)
    }
  }

  console.log(`   Repetições imediatas detetadas: ${immediateRepetitions} / ${TOTAL_RUNS}`)
  if (immediateRepetitions > 0) {
    console.error('❌ ERRO: Ocorreram repetições imediatas de música!')
    allPassed = false
  } else {
    console.log('   ✅ ZERO repetições imediatas detetadas em 10.000 transições!')
  }

  console.log('   Distribuição durante a reprodução contínua:')
  transitionCounts.forEach((count, i) => {
    const pct = ((count / TOTAL_RUNS) * 100).toFixed(2)
    console.log(`     Faixa ${i + 1}: ${count} vezes (${pct}%)`)
  })

  console.log(`   Amostra de sequência de 20 músicas: [${sequenceSamples.map((idx) => idx + 1).join(' -> ')}]`)

  // Verificar se todas as faixas tocaram proporcionalmente
  const allPlayedWell = transitionCounts.every(
    (c) => c > TOTAL_RUNS * 0.2 && c < TOTAL_RUNS * 0.3
  )
  if (!allPlayedWell) {
    console.error('❌ ERRO: As músicas não tocaram de forma equilibrada!')
    allPassed = false
  } else {
    console.log('   ✅ Todas as faixas tocam com perfeita distribuição dinâmica.')
  }

  console.log('\n==================================================================')
  console.log(allPassed ? '  🎉 TODOS OS TESTES DE ÁUDIO ALEATÓRIO PASSARAM COM SUCESSO!' : '  ⚠️ ALGUNS TESTES FALHARAM!')
  console.log('==================================================================\n')

  return allPassed
}

const success = runRandomMusicTests()
process.exit(success ? 0 : 1)
