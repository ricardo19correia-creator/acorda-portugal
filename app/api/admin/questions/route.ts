import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { QuestionRegistry } from '@/lib/question-system/registry'
import { deduplicateQuestions } from '@/lib/question-system/deduplicator'
import { MAIN_CATEGORIES } from '@/lib/categories-data'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') || 'list' // 'list' | 'stats' | 'duplicates'
    const categoryFilter = searchParams.get('category') || 'all'
    const subcategoryFilter = searchParams.get('subcategory') || 'all'
    const difficultyFilter = searchParams.get('difficulty') || 'all'
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 25)))

    const registry = QuestionRegistry.getInstance()

    // 1. Modo Estatísticas Gerais
    if (mode === 'stats') {
      const stats = registry.getSystemStats()
      return NextResponse.json({
        success: true,
        stats,
        categories: MAIN_CATEGORIES.map((c) => ({
          slug: c.slug,
          name: c.name,
          emoji: c.icon,
          subthemesCount: c.subcategories.length,
        })),
      })
    }

    // 2. Modo Deteção de Duplicados
    if (mode === 'duplicates') {
      let pool = registry.getAllQuestions()
      if (categoryFilter !== 'all') {
        pool = pool.filter((q) => (q as any).tema === categoryFilter || q.category === categoryFilter)
      }
      // Amostra comparativa representativa
      const sample = pool.slice(0, 1000)
      const report = deduplicateQuestions(sample, [], 0.80)

      return NextResponse.json({
        success: true,
        duplicatesReport: {
          totalChecked: report.totalChecked,
          duplicateCount: report.duplicateCount,
          duplicates: report.duplicates,
        },
      })
    }

    // 3. Modo Listagem e Pesquisa de Perguntas
    let questions = registry.getAllQuestions()

    if (categoryFilter !== 'all') {
      questions = questions.filter((q) => (q as any).tema === categoryFilter || q.category === categoryFilter)
    }

    if (subcategoryFilter !== 'all') {
      questions = questions.filter((q) => (q as any).subtema === subcategoryFilter || q.subcategory === subcategoryFilter)
    }

    if (difficultyFilter !== 'all') {
      const diffNum = Number(difficultyFilter)
      questions = questions.filter((q) => (q as any).dificuldade === diffNum || q.difficulty === diffNum)
    }

    if (searchQuery) {
      questions = questions.filter((q) => {
        const text = (q.question || (q as any).pergunta || '').toLowerCase()
        const id = String(q.id || '').toLowerCase()
        const explanation = (q.explanation || (q as any).explicacao || '').toLowerCase()
        const opts = (Array.isArray(q.options) ? q.options.map((o: any) => typeof o === 'string' ? o : o.text) : []).join(' ').toLowerCase()
        return text.includes(searchQuery) || id.includes(searchQuery) || explanation.includes(searchQuery) || opts.includes(searchQuery)
      })
    }

    const totalCount = questions.length
    const startIndex = (page - 1) * limit
    const paginatedQuestions = questions.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      questions: paginatedQuestions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error('[API ADMIN QUESTIONS GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao consultar banco de perguntas.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, questionId, questionData, reason } = body

    if (!action || !questionId) {
      return NextResponse.json({ error: 'Parâmetros "action" e "questionId" são obrigatórios.' }, { status: 400 })
    }

    const registry = QuestionRegistry.getInstance()
    const question = registry.getQuestionById(questionId)

    if (!question) {
      return NextResponse.json({ error: `Pergunta "${questionId}" não encontrada.` }, { status: 404 })
    }

    if (action === 'edit') {
      const updated = {
        ...question,
        question: questionData?.question || questionData?.pergunta || question.question,
        options: questionData?.options || questionData?.opcoes || question.options,
        correctAnswer: questionData?.correctAnswer ?? questionData?.respostaCorreta ?? question.correctAnswer,
        explanation: questionData?.explanation ?? questionData?.explicacao ?? question.explanation,
        difficulty: questionData?.difficulty ?? questionData?.dificuldade ?? question.difficulty,
      }

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'QUESTION_EDITED',
        entity: 'QUESTION',
        entityId: questionId,
        details: `Editou a pergunta ${questionId}`,
        previousValue: question,
        newValue: updated,
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Pergunta ${questionId} atualizada com sucesso.`,
        question: updated,
      })
    }

    if (action === 'mark_duplicate') {
      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'QUESTION_MARKED_DUPLICATE',
        entity: 'QUESTION',
        entityId: questionId,
        details: `Marcou a pergunta ${questionId} como duplicada. Motivo: ${reason || 'Identificada no scanner'}`,
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, message: `Pergunta ${questionId} marcada como duplicada.` })
    }

    return NextResponse.json({ error: `Ação inválida: "${action}"` }, { status: 400 })
  } catch (error: any) {
    console.error('[API ADMIN QUESTIONS POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar alteração de pergunta.' }, { status: 500 })
  }
}
