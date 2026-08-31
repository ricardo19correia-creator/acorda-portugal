import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UPSTREAM_APK_URL = 'https://github.com/ricardo19correia-creator/acorda-portugal/raw/efad7bc4b8408f6ebcb35fb34a2e584ca3b5860d/public/downloads/acorda-portugal-release.apk'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(UPSTREAM_APK_URL, 307)
}

export async function HEAD(request: NextRequest) {
  return NextResponse.redirect(UPSTREAM_APK_URL, 307)
}
