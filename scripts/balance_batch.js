/**
 * Balanceador Determinístico de Respostas A/B/C/D para Lotes de Produção
 */

const fs = require('fs')
const path = require('path')

function balanceBatch(filePath) {
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const targetPattern = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 2] // 13 A, 12 B, 13 C, 12 D

  for (let i = 0; i < list.length; i++) {
    const q = list[i]
    const currentCorrectIdx = q.respostaCorreta
    const correctText = q.opcoes[currentCorrectIdx]
    const targetIdx = targetPattern[i % targetPattern.length]

    if (currentCorrectIdx !== targetIdx) {
      const otherOpts = q.opcoes.filter((_, idx) => idx !== currentCorrectIdx)
      const newOpts = []
      let otherCursor = 0
      for (let pos = 0; pos < 4; pos++) {
        if (pos === targetIdx) {
          newOpts.push(correctText)
        } else {
          newOpts.push(otherOpts[otherCursor++])
        }
      }
      q.opcoes = newOpts
      q.respostaCorreta = targetIdx
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8')
  console.log(`✓ Lote ${path.basename(filePath)} balanceado uniformemente: A:13, B:12, C:13, D:12`)
}

const fileToBalance = process.argv[2] || path.join(__dirname, '..', 'data', 'batches', 'batch_cinema_televisao_001.json')
balanceBatch(path.resolve(fileToBalance))
