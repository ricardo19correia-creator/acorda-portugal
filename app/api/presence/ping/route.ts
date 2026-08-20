import { NextRequest } from 'next/server'
import { POST as handlePresencePost, GET as handlePresenceGet } from '../route'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  return handlePresencePost(request)
}

export async function GET() {
  return handlePresenceGet()
}
