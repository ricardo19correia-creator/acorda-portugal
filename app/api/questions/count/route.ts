import { NextResponse } from 'next/server'
import { QuestionRegistry } from '@/lib/question-system/registry'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const registry = QuestionRegistry.getInstance()
    const allQuestions = registry.getAllQuestions()
    const totalCount = Array.isArray(allQuestions) ? allQuestions.length : 0

    return NextResponse.json(
      {
        success: true,
        total: totalCount,
        count: totalCount,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro ao obter contagem de perguntas.',
        total: 0,
        count: 0,
      },
      { status: 500 }
    )
  }
}
