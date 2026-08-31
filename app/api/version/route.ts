import { NextResponse } from 'next/server'
import { BUILD_INFO } from '@/lib/build-info'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    data: BUILD_INFO,
  })
}
