import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Healthcheck / Ping ultraleve e sem dependências pesadas
 * Usado para verificação rápida de disponibilidade de rede.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: Date.now(), service: 'acorda-portugal' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    },
  )
}

export async function POST() {
  return GET()
}
