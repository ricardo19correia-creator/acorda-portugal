import { NextRequest, NextResponse } from 'next/server'
import { processEuPagoWebhook } from '@/app/api/webhook/eupago/route'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = await processEuPagoWebhook(body)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno'
    console.error('[EUPAGO WEBHOOK ALIAS ERROR]:', errorMsg)
    return NextResponse.json({ sucesso: false, error: errorMsg }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'https://acordaportugal.pt/api/webhooks/eupago',
    service: 'euPago Webhooks Router Alias',
  })
}
