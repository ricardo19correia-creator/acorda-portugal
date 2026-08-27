import { NextResponse } from 'next/server'
import { syncBotPopulationState } from '@/lib/bot-network/bot-population-manager'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const status = await syncBotPopulationState()
    return NextResponse.json({
      success: true,
      message: 'População de bots sincronizada com sucesso.',
      population: status,
    })
  } catch (error: any) {
    console.error('[API BOT SEED ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao sincronizar bots.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return GET(req)
}
