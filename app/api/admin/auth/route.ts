import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({
      authorized: false,
      error: authResult.error,
      email: authResult.verifiedEmail || null,
      uid: authResult.verifiedUid || null,
    }, { status: authResult.status })
  }

  return NextResponse.json({
    authorized: true,
    role: authResult.adminUser?.role || 'owner',
    adminUser: authResult.adminUser,
    email: authResult.verifiedEmail || authResult.adminUser?.email || null,
    uid: authResult.verifiedUid || authResult.adminUser?.uid || null,
  })
}
