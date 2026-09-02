/**
 * Acorda Portugal — Registo Central e Indexador de Perguntas
 * Carrega, valida, normaliza e indexa em memória todos os bancos de perguntas das 18 categorias oficiais,
 * Desafio Nacional, territoriais e modos especiais.
 */

import { MAIN_CATEGORIES, getCategoryBySlug, normalizeCategorySlug } from '@/lib/categories-data'
import type { Question, QuizDifficulty, OfficialQuestion } from '@/src/types/quiz'
import { validateQuestion } from '@/lib/question-system/validator'
import { deduplicateQuestions } from '@/lib/question-system/deduplicator'

// Importações dos bancos de dados do ecossistema
import questionsDesafioNacionalRaw from '@/src/data/questions_desafio_nacional.json'
import questionsDataRaw from '@/lib/data/questions.json'
import vilaRealDataRaw from '@/data/perguntas_vila_real_500.json'
import modoMalucoDataRaw from '@/data/perguntas_modo_maluco_5000.json'

// Importações dos ficheiros das 18 categorias oficiais em lib/data/categories/
import catAtualidadeRaw from '@/lib/data/categories/atualidade.json'
import catCienciaRaw from '@/lib/data/categories/ciencia-tecnologia.json'
import catCinemaRaw from '@/lib/data/categories/cinema-tv.json'
import catCulturaRaw from '@/lib/data/categories/cultura.json'
import catDesafioVisualRaw from '@/lib/data/categories/desafio-visual.json'
import catDesportoRaw from '@/lib/data/categories/desporto.json'
import catEmpresasRaw from '@/lib/data/categories/empresas-portuguesas.json'
import catFutebolRaw from '@/lib/data/categories/futebol-portugues.json'
import catGastronomiaRaw from '@/lib/data/categories/gastronomia.json'
import catGeografiaRaw from '@/lib/data/categories/geografia.json'
import catHistoriaRaw from '@/lib/data/categories/historia.json'
import catHumorRaw from '@/lib/data/categories/humor.json'
import catModoMalucoRaw from '@/lib/data/categories/modo-maluco.json'
import catMundoRaw from '@/lib/data/categories/mundo.json'
import catMusicaRaw from '@/lib/data/categories/musica.json'
import catPersonalidadesRaw from '@/lib/data/categories/personalidades.json'
import catPortugalPoliticoRaw from '@/lib/data/categories/portugal-politico.json'
import catPortugalRaw from '@/lib/data/categories/portugal.json'

export interface SubthemeStat {
  id: string
  name: string
  approvedCount: number
  targetCount: number // 2000
  missingCount: number
}

export interface ThemeStat {
  id: string
  slug: string
  name: string
  emoji: string
  totalApproved: number
  totalTarget: number
  subthemes: SubthemeStat[]
}

export interface SystemStatsReport {
  totalQuestionsLoaded: number
  totalApproved: number
  totalThemes: number
  totalSubthemes: number
  globalTarget: number // 227 * 2000 = 454.000
  completionPercentage: number
  themes: ThemeStat[]
}

export class QuestionRegistry {
  private static instance: QuestionRegistry | null = null

  private questions: Question[] = []
  private byId = new Map<string, Question>()
  private byTheme = new Map<string, Question[]>() // themeSlug -> Question[]
  private bySubtheme = new Map<string, Question[]>() // `${themeSlug}::${subthemeSlug}` -> Question[]
  private initialized = false

  public static getInstance(): QuestionRegistry {
    if (!QuestionRegistry.instance) {
      QuestionRegistry.instance = new QuestionRegistry()
      QuestionRegistry.instance.initialize()
    }
    return QuestionRegistry.instance
  }

  /**
   * Inicializa e indexa todos os bancos de dados
   */
  public initialize(): void {
    if (this.initialized) return

    const rawList: any[] = []

    // 1. As 18 Categorias Oficiais
    const categoryDatasets = [
      { slug: 'portugal', data: catPortugalRaw },
      { slug: 'futebol-portugues', data: catFutebolRaw },
      { slug: 'atualidade', data: catAtualidadeRaw },
      { slug: 'portugal-politico', data: catPortugalPoliticoRaw },
      { slug: 'empresas-portuguesas', data: catEmpresasRaw },
      { slug: 'historia', data: catHistoriaRaw },
      { slug: 'geografia', data: catGeografiaRaw },
      { slug: 'ciencia-tecnologia', data: catCienciaRaw },
      { slug: 'cultura', data: catCulturaRaw },
      { slug: 'gastronomia', data: catGastronomiaRaw },
      { slug: 'personalidades', data: catPersonalidadesRaw },
      { slug: 'mundo', data: catMundoRaw },
      { slug: 'desporto', data: catDesportoRaw },
      { slug: 'humor', data: catHumorRaw },
      { slug: 'musica', data: catMusicaRaw },
      { slug: 'cinema-tv', data: catCinemaRaw },
      { slug: 'desafio-visual', data: catDesafioVisualRaw },
      { slug: 'modo-maluco', data: catModoMalucoRaw },
    ]

    for (const item of categoryDatasets) {
      if (Array.isArray(item.data)) {
        for (const q of item.data) {
          rawList.push({ ...q, defaultCategory: item.slug })
        }
      }
    }

    // 2. Banco Desafio Nacional (2.000 Qs)
    if (Array.isArray(questionsDesafioNacionalRaw)) {
      for (const q of questionsDesafioNacionalRaw) {
        rawList.push({ ...q, defaultCategory: 'desafio-nacional', subcategory: (q as any).subcategory || 'História de Portugal' })
      }
    }

    // 3. Perguntas Territoriais de Vila Real (500 Qs)
    if (Array.isArray(vilaRealDataRaw)) {
      for (const q of vilaRealDataRaw) {
        rawList.push({ ...q, defaultCategory: 'desafio-cidade', city: 'Vila Real', district: 'Vila Real' })
      }
    }

    // 4. Modo Maluco (5.000 Qs)
    if (Array.isArray(modoMalucoDataRaw)) {
      for (const q of modoMalucoDataRaw) {
        rawList.push({ ...q, defaultCategory: 'modo-maluco' })
      }
    }

    // Validação e normalização de cada pergunta com deduplicação rigorosa
    const seenIds = new Set<string>()
    const seenPrompts = new Set<string>()
    const normalizedList: Question[] = []

    for (let i = 0; i < rawList.length; i++) {
      const raw = rawList[i]
      const validation = validateQuestion(raw)
      const norm = validation.normalizedQuestion

      if (norm) {
        const promptKey = String(norm.pergunta || '')
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]/gu, '')
          .trim()

        // Deduplicação estrita: ignora se o texto exato já existir
        if (promptKey.length > 5 && seenPrompts.has(promptKey)) {
          continue
        }
        if (promptKey.length > 5) {
          seenPrompts.add(promptKey)
        }

        let finalId = norm.id
        if (seenIds.has(finalId)) {
          finalId = `${finalId}_${i}`
        }
        seenIds.add(finalId)

        const gameQ: Question = {
          id: finalId,
          question: norm.pergunta,
          options: norm.opcoes,
          correctAnswer: norm.respostaCorreta,
          difficulty: norm.dificuldadeNivel,
          category: norm.temaSlug,
          subcategory: norm.subtema,
          district: norm.territorio?.distrito,
          city: norm.territorio?.concelho,
          explanation: norm.explicacao,
          image: norm.visual?.imageUrl,
          type: norm.tipo,
          source: norm.fonte,
          verifiedAt: norm.dataVerificacao,
          isCurrent: norm.atualidade,
          active: norm.ativa,
          version: norm.versao,
          status: norm.status,
        }

        normalizedList.push(gameQ)
      }
    }

    this.questions = normalizedList
    this.buildIndexes()
    this.initialized = true
  }

  /**
   * Constrói os mapas e índices em memória
   */
  private buildIndexes(): void {
    this.byId.clear()
    this.byTheme.clear()
    this.bySubtheme.clear()

    for (const q of this.questions) {
      this.byId.set(q.id, q)

      const themeKey = normalizeCategorySlug(q.category)
      if (!this.byTheme.has(themeKey)) {
        this.byTheme.set(themeKey, [])
      }
      this.byTheme.get(themeKey)!.push(q)

      if (q.subcategory) {
        const subKey = `${themeKey}::${normalizeCategorySlug(q.subcategory)}`
        if (!this.bySubtheme.has(subKey)) {
          this.bySubtheme.set(subKey, [])
        }
        this.bySubtheme.get(subKey)!.push(q)
      }
    }
  }

  /**
   * Obtém todas as perguntas aprovadas no sistema
   */
  public getAllQuestions(): Question[] {
    return this.questions
  }

  /**
   * Obtém pergunta pelo ID
   */
  public getById(id: string): Question | undefined {
    return this.byId.get(id)
  }

  public getQuestionById(id: string): Question | undefined {
    return this.getById(id)
  }

  /**
   * Seleção para "Tema Completo" — Mistura perguntas de todos os subtemas daquele tema
   */
  public getTemaCompleto(themeSlug: string, difficulty?: number): Question[] {
    const normTheme = normalizeCategorySlug(themeSlug)
    const list = this.byTheme.get(normTheme) || []

    if (difficulty && difficulty >= 1 && difficulty <= 5) {
      const exact = list.filter((q) => q.difficulty === difficulty)
      if (exact.length >= 10) return exact
      const adjacent = list.filter((q) => Math.abs(q.difficulty - difficulty) <= 1)
      if (adjacent.length >= 10) return adjacent
    }

    return list
  }

  /**
   * Seleção para "Jogar Tudo" — Mistura perguntas do banco global (excluindo Modo Maluco)
   */
  public getJogarTudo(difficulty?: number): Question[] {
    const list = this.questions.filter((q) => {
      const cat = q.category.toLowerCase()
      return !cat.includes('maluco') && !q.id.startsWith('mm_')
    })

    if (difficulty && difficulty >= 1 && difficulty <= 5) {
      const exact = list.filter((q) => q.difficulty === difficulty)
      if (exact.length >= 10) return exact
      const adjacent = list.filter((q) => Math.abs(q.difficulty - difficulty) <= 1)
      if (adjacent.length >= 10) return adjacent
    }

    return list
  }

  /**
   * Seleção para Subtema Específico
   */
  public getBySubtheme(themeSlug: string, subthemeSlug: string, difficulty?: number): Question[] {
    const normTheme = normalizeCategorySlug(themeSlug)
    const normSub = normalizeCategorySlug(subthemeSlug)
    const key = `${normTheme}::${normSub}`

    let list = this.bySubtheme.get(key)
    if (!list || list.length === 0) {
      // Fallback: procura por correspondência parcial no subtema
      const themeQuestions = this.byTheme.get(normTheme) || []
      list = themeQuestions.filter((q) => {
        if (!q.subcategory) return false
        const qSubNorm = normalizeCategorySlug(q.subcategory)
        return qSubNorm.includes(normSub) || normSub.includes(qSubNorm)
      })
    }

    if (!list || list.length === 0) {
      // Fallback gracioso: Tema Completo
      list = this.getTemaCompleto(themeSlug, difficulty)
    }

    if (difficulty && difficulty >= 1 && difficulty <= 5 && list.length >= 15) {
      const exact = list.filter((q) => q.difficulty === difficulty)
      if (exact.length >= 10) return exact
      const adjacent = list.filter((q) => Math.abs(q.difficulty - difficulty) <= 1)
      if (adjacent.length >= 10) return adjacent
    }

    return list
  }

  /**
   * Gera o Relatório Oficial de Estatísticas por Tema e Subtema rumo à meta de 2.000
   */
  public getSystemStats(): SystemStatsReport {
    const TARGET_PER_SUBTHEME = 2000
    const themeStatsList: ThemeStat[] = []

    let grandTotalApproved = 0
    let totalSubthemesCount = 0

    for (const cat of MAIN_CATEGORIES) {
      const themeQuestions = this.byTheme.get(cat.slug) || []
      let themeTotalApproved = 0

      const subthemeStats: SubthemeStat[] = []
      for (const sub of cat.subcategories) {
        totalSubthemesCount++
        const subSlug = normalizeCategorySlug(sub.id || sub.name)
        const key = `${cat.slug}::${subSlug}`
        const subQuestions = this.bySubtheme.get(key) || themeQuestions.filter((q) => {
          if (!q.subcategory) return false
          const qSub = normalizeCategorySlug(q.subcategory)
          return qSub === subSlug || qSub.includes(subSlug) || subSlug.includes(qSub)
        })

        const approvedCount = subQuestions.length
        themeTotalApproved += approvedCount
        grandTotalApproved += approvedCount

        subthemeStats.push({
          id: sub.id,
          name: sub.name,
          approvedCount,
          targetCount: TARGET_PER_SUBTHEME,
          missingCount: Math.max(0, TARGET_PER_SUBTHEME - approvedCount),
        })
      }

      themeStatsList.push({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        emoji: cat.emoji,
        totalApproved: themeTotalApproved,
        totalTarget: cat.subcategories.length * TARGET_PER_SUBTHEME,
        subthemes: subthemeStats,
      })
    }

    const globalTarget = totalSubthemesCount * TARGET_PER_SUBTHEME
    const completionPercentage = globalTarget > 0 ? (grandTotalApproved / globalTarget) * 100 : 0

    return {
      totalQuestionsLoaded: this.questions.length,
      totalApproved: grandTotalApproved,
      totalThemes: MAIN_CATEGORIES.length,
      totalSubthemes: totalSubthemesCount,
      globalTarget,
      completionPercentage: Number(completionPercentage.toFixed(2)),
      themes: themeStatsList,
    }
  }

  /**
   * Adiciona um lote de novas perguntas aprovadas ao registo
   */
  public addBatch(newQuestions: (OfficialQuestion | Question)[]): number {
    let addedCount = 0
    for (const q of newQuestions) {
      const validation = validateQuestion(q)
      const norm = validation.normalizedQuestion
      if (norm && !this.byId.has(norm.id)) {
        const gameQ: Question = {
          id: norm.id,
          question: norm.pergunta,
          options: norm.opcoes,
          correctAnswer: norm.respostaCorreta,
          difficulty: norm.dificuldadeNivel,
          category: norm.temaSlug,
          subcategory: norm.subtema,
          district: norm.territorio?.distrito,
          city: norm.territorio?.concelho,
          explanation: norm.explicacao,
          image: norm.visual?.imageUrl,
          type: norm.tipo,
          source: norm.fonte,
          verifiedAt: norm.dataVerificacao,
          isCurrent: norm.atualidade,
          active: norm.ativa,
          version: norm.versao,
          status: norm.status,
        }
        this.questions.push(gameQ)
        this.byId.set(gameQ.id, gameQ)
        addedCount++
      }
    }

    if (addedCount > 0) {
      this.buildIndexes()
    }
    return addedCount
  }
}

export const registry = QuestionRegistry.getInstance()
