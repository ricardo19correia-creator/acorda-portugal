import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  return NextResponse.json({
    authorized: true,
    adminUser: authResult.adminUser,
  })
}
