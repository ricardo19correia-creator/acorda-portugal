/**
 * Modelo Oficial de Questões do Quiz do Acorda Portugal — Desafio Nacional
 * Schema canónico unificado e compatível com todos os modos de jogo, validação e pipeline.
 */

export type QuizDifficulty = 1 | 2 | 3 | 4 | 5

export type QuestionDifficulty = 'facil' | 'media' | 'dificil' | 'especialista'

export type QuestionType =
  | 'standard'
  | 'verdadeiro_falso'
  | 'visual'
  | 'imagem'
  | 'atualidade'
  | 'cronologia'
  | 'localizacao'
  | 'identificacao'
  | 'logica'
  | 'humor'
  | 'modo_maluco'

export type QuestionStatus =
  | 'draft'
  | 'generated'
  | 'validating'
  | 'rejected'
  | 'needs_review'
  | 'approved'
  | 'published'
  | 'expired'
  | 'archived'

/**
 * Schema Oficial Canónico de Perguntas (Acorda Portugal)
 */
export interface OfficialQuestion {
  id: string
  tema: string
  temaSlug: string
  subtema: string
  subtemaSlug: string
  pergunta: string
  opcoes: [string, string, string, string]
  respostaCorreta: number // 0 a 3
  explicacao: string
  dificuldade: QuestionDifficulty
  dificuldadeNivel: QuizDifficulty // 1 a 5
  tipo: QuestionType
  fonte: string
  fonteUrl?: string
  dataVerificacao: string // YYYY-MM-DD
  atualidade: boolean
  validadeData?: string
  ativa: boolean
  versao: number
  status: QuestionStatus
  factClusterId?: string
  visual?: {
    imageUrl: string
    imageSource?: string
    imageLicense?: string
    imageAlt?: string
  }
  territorio?: {
    distrito?: string
    concelho?: string
    regiao?: string
  }
  stats?: {
    vezesJogada: number
    acertos: number
    erros: number
    taxaAcerto?: number
  }
}

/**
 * Interface de Consumo Direto no Motor de Jogo (Compatibilidade Retroativa Total)
 */
export interface Question {
  id: string
  question: string
  options: [string, string, string, string]
  correctAnswer: number // 0 a 3
  difficulty: QuizDifficulty // 1 a 5
  category: string // 'Desafio Nacional', 'portugal', 'historia', etc.
  subcategory?: string
  district?: string
  city?: string
  explanation?: string
  image?: string
  type?: QuestionType
  source?: string
  verifiedAt?: string
  isCurrent?: boolean
  active?: boolean
  version?: number
  status?: QuestionStatus
}

/**
 * Converte nível numérico (1 a 5) para dificuldade textual oficial
 */
export function difficultyLevelToText(lvl: QuizDifficulty | number): QuestionDifficulty {
  if (lvl <= 1) return 'facil'
  if (lvl === 2 || lvl === 3) return 'media'
  if (lvl === 4) return 'dificil'
  return 'especialista'
}

/**
 * Converte dificuldade textual oficial para nível numérico (1 a 5)
 */
export function difficultyTextToLevel(diff: string | QuestionDifficulty): QuizDifficulty {
  const clean = String(diff || '').toLowerCase().trim()
  if (clean === 'facil' || clean === 'fácil' || clean === '1') return 1
  if (clean === 'normal' || clean === '2') return 2
  if (clean === 'media' || clean === 'médio' || clean === 'medio' || clean === '3') return 3
  if (clean === 'dificil' || clean === 'difícil' || clean === '4') return 4
  if (clean === 'especialista' || clean === 'mestre' || clean === 'insano' || clean === '5') return 5
  return 2
}
