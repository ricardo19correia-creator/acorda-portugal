import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UPSTREAM_APK_URL = 'https://github.com/ricardo19correia-creator/acorda-portugal/raw/main/downloads/acorda-portugal-release.apk'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(UPSTREAM_APK_URL, 307)
}

export async function HEAD(request: NextRequest) {
  return NextResponse.redirect(UPSTREAM_APK_URL, 307)
}
