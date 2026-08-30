import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  return NextResponse.json({
    success: true,
    message: 'A criação e injeção automática de bots foi desativada permanentemente no Acorda Portugal. O sistema opera a 100% com jogadores humanos reais.',
    totalBots: 0,
  })
}

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  return NextResponse.json({
    success: true,
    message: 'A criação e injeção automática de bots foi desativada permanentemente no Acorda Portugal. O sistema opera a 100% com jogadores humanos reais.',
    totalBots: 0,
  })
}
