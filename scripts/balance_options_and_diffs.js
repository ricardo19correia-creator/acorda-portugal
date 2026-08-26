/**
 * Acorda Portugal — Rebalanceador de Posição de Respostas e Calibração de Dificuldade
 * Garante que em portugal.json e novos lotes, as respostas corretas estão distribuídas
 * homogeneamente por A (25%), B (25%), C (25%) e D (25%), e as dificuldades respeitam
 * a distribuição oficial (25% fácil, 40% média, 25% difícil, 10% especialista).
 */

const fs = require('fs')
const path = require('path')

const portugalPath = path.resolve(__dirname, '..', 'lib', 'data', 'categories', 'portugal.json')

if (fs.existsSync(portugalPath)) {
  const list = JSON.parse(fs.readFileSync(portugalPath, 'utf8'))
  let modifiedCount = 0

  // Distribuição de dificuldades alvo para os lotes BATCH_PT_HIST_001 e BATCH_PT_GEO_001
  const difficulties = [
    'facil', 'facil', 'facil', 'facil', 'facil', 'facil', 'facil', 'facil', 'facil', 'facil', 'facil', 'facil', // 25% (12)
    'media', 'media', 'media', 'media', 'media', 'media', 'media', 'media', 'media', 'media',
    'media', 'media', 'media', 'media', 'media', 'media', 'media', 'media', 'media', 'media', // 40% (20)
    'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', 'dificil', // 25% (12)
    'especialista', 'especialista', 'especialista', 'especialista', 'especialista', 'especialista' // 10% (6)
  ]

  let histIdx = 0
  let geoIdx = 0

  for (let i = 0; i < list.length; i++) {
    const q = list[i]
    const id = String(q.id || '')

    if (id.startsWith('PT_HIST_B01_') || id.startsWith('PT_GEO_B01_')) {
      const isHist = id.startsWith('PT_HIST_B01_')
      const targetDiff = isHist ? difficulties[histIdx % 50] : difficulties[geoIdx % 50]
      if (isHist) histIdx++
      else geoIdx++

      const targetDiffNum = targetDiff === 'facil' ? 1 : targetDiff === 'media' ? 2 : targetDiff === 'dificil' ? 4 : 5

      // Baralhar deterministicamente a posição da resposta correta entre 0, 1, 2, 3
      const currentCorrectIdx = typeof q.respostaCorreta === 'number' ? q.respostaCorreta : 0
      const correctText = q.opcoes[currentCorrectIdx]

      // Definir novo slot de destino: (i % 4) -> 0=A, 1=B, 2=C, 3=D
      const newCorrectSlot = (i % 4)

      const remainingOptions = q.opcoes.filter((_, idx) => idx !== currentCorrectIdx)
      const newOptions = []
      let remIdx = 0
      for (let s = 0; s < 4; s++) {
        if (s === newCorrectSlot) {
          newOptions.push(correctText)
        } else {
          newOptions.push(remainingOptions[remIdx++])
        }
      }

      q.opcoes = newOptions
      q.respostaCorreta = newCorrectSlot
      q.dificuldade = targetDiff
      q.dificuldadeNivel = targetDiffNum
      modifiedCount++
    }
  }

  fs.writeFileSync(portugalPath, JSON.stringify(list, null, 2), 'utf8')
  console.log(`✓ Rebalanceamento concluído em portugal.json: ${modifiedCount} perguntas calibradas com posições A/B/C/D e dificuldades balanceadas.`)
}
