/**
 * Acorda Portugal — Pipeline Oficial de Produção e Importação de Perguntas
 * Orquestra o Novo Quality Gate de Produção:
 *   GENERATED -> STRUCTURAL_VALIDATION -> LANGUAGE_VALIDATION -> DEDUPLICATION -> FACTUAL_VALIDATION -> QUALITY_SCORE -> APPROVED -> PUBLISHED
 */

import fs from 'fs'
import path from 'path'
import { validateQuestion, calculateQualityScore, type ValidationResult, type ValidationError, type QualityScore } from '@/lib/question-system/validator'
import { deduplicateQuestions, type DeduplicationReport } from '@/lib/question-system/deduplicator'
import { QuestionRegistry } from '@/lib/question-system/registry'
import type { OfficialQuestion, Question } from '@/src/types/quiz'

export interface PipelineOptions {
  autoApprove?: boolean
  similarityThreshold?: number
  minQualityScore?: number // Default: 75
  defaultTheme?: string
  defaultSubtheme?: string
  sourceFile?: string
  balanceOptions?: boolean
}

export interface PipelineReport {
  timestamp: string
  totalInput: number
  validCount: number
  invalidCount: number
  duplicateCount: number
  lowQualityCount: number
  approvedCount: number
  rejectedCount: number
  validationErrors: { id: string; errors: ValidationError[] }[]
  duplicatesReport: DeduplicationReport
  qualityScores: { id: string; score: QualityScore }[]
  approvedQuestions: OfficialQuestion[]
}

/**
 * Processa um lote completo de perguntas através de todas as fases do novo Quality Gate
 */
export function processBatch(
  rawQuestions: any[],
  options: PipelineOptions = {},
): PipelineReport {
  const threshold = options.similarityThreshold ?? 0.82
  const minScore = options.minQualityScore ?? 75
  const validationErrors: { id: string; errors: ValidationError[] }[] = []
  const structurallyValidList: OfficialQuestion[] = []
  const qualityScoresList: { id: string; score: QualityScore }[] = []

  // Fase 1: Validação Estrutural e Linguística (PT-PT)
  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i]
    if (options.defaultTheme && !raw.tema && !raw.category) {
      raw.tema = options.defaultTheme
    }
    if (options.defaultSubtheme && !raw.subtema && !raw.subcategory) {
      raw.subtema = options.defaultSubtheme
    }

    const res = validateQuestion(raw)
    if (res.valid && res.normalizedQuestion) {
      structurallyValidList.push(res.normalizedQuestion)
    } else {
      validationErrors.push({
        id: String(raw.id || `item_${i + 1}`),
        errors: res.errors,
      })
    }
  }

  // Fase 2: Anti-Duplicação e Deduplicação Semântica contra o banco global
  const registry = QuestionRegistry.getInstance()
  const existingQuestions = registry.getAllQuestions()

  const dedupReport = deduplicateQuestions(
    structurallyValidList,
    existingQuestions,
    threshold,
  )

  // Fase 3: Quality Score e Validação Factual
  let lowQualityCount = 0
  const approvedQuestions: OfficialQuestion[] = []

  for (let i = 0; i < dedupReport.cleanQuestions.length; i++) {
    const q = dedupReport.cleanQuestions[i] as OfficialQuestion
    const qScore = calculateQualityScore(q)
    qualityScoresList.push({ id: q.id, score: qScore })

    if (qScore.qualityScore < minScore || qScore.classification === 'rejeitar') {
      lowQualityCount++
      validationErrors.push({
        id: q.id,
        errors: [{
          field: 'qualityScore',
          code: 'SCORE_TOO_LOW',
          message: `Quality Score insuficiente (${qScore.qualityScore}/100 - ${qScore.classification}). Requer no mínimo ${minScore}/100.`,
          severity: 'error',
        }],
      })
      continue
    }

    // Fase 4: Opcional - Balanceamento de Slot de Resposta Correta (A/B/C/D)
    if (options.balanceOptions !== false) {
      const targetSlot = i % 4
      const currentCorrectIdx = q.respostaCorreta
      if (currentCorrectIdx !== targetSlot && currentCorrectIdx >= 0 && currentCorrectIdx < 4) {
        const correctText = q.opcoes[currentCorrectIdx]
        const remaining = q.opcoes.filter((_, idx) => idx !== currentCorrectIdx)
        const balanced: [string, string, string, string] = ['', '', '', '']
        let remIdx = 0
        for (let s = 0; s < 4; s++) {
          if (s === targetSlot) balanced[s] = correctText
          else balanced[s] = remaining[remIdx++]
        }
        q.opcoes = balanced
        q.respostaCorreta = targetSlot
      }
    }

    if (options.autoApprove) {
      q.status = 'approved'
      q.ativa = true
    }

    approvedQuestions.push(q)
  }

  return {
    timestamp: new Date().toISOString(),
    totalInput: rawQuestions.length,
    validCount: structurallyValidList.length,
    invalidCount: validationErrors.length,
    duplicateCount: dedupReport.duplicateCount,
    lowQualityCount,
    approvedCount: approvedQuestions.length,
    rejectedCount: validationErrors.length + dedupReport.duplicateCount + lowQualityCount,
    validationErrors,
    duplicatesReport: dedupReport,
    qualityScores: qualityScoresList,
    approvedQuestions,
  }
}

/**
 * Grava um lote aprovado num ficheiro JSON de forma atómica e segura
 */
export function saveBatchToJSON(
  questions: (OfficialQuestion | Question)[],
  targetFilePath: string,
  append = true,
): { success: boolean; count: number; error?: string } {
  try {
    const fullPath = path.resolve(targetFilePath)
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    let existingData: any[] = []
    if (append && fs.existsSync(fullPath)) {
      const fileContent = fs.readFileSync(fullPath, 'utf8')
      try {
        existingData = JSON.parse(fileContent)
        if (!Array.isArray(existingData)) existingData = []
      } catch {
        existingData = []
      }
    }

    const existingIds = new Set(existingData.map((q) => String(q.id)))
    let newAdditions = 0

    for (const q of questions) {
      if (!existingIds.has(String(q.id))) {
        existingData.push(q)
        existingIds.add(String(q.id))
        newAdditions++
      }
    }

    // Gravação atómica com ficheiro temporário
    const tmpPath = `${fullPath}.tmp`
    fs.writeFileSync(tmpPath, JSON.stringify(existingData, null, 2), 'utf8')
    fs.renameSync(tmpPath, fullPath)

    return { success: true, count: newAdditions }
  } catch (err: any) {
    return { success: false, count: 0, error: err.message }
  }
}
