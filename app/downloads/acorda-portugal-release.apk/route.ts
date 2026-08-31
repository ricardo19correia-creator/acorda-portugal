import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UPSTREAM_APK_URL = 'https://github.com/ricardo19correia-creator/acorda-portugal/raw/efad7bc4b8408f6ebcb35fb34a2e584ca3b5860d/public/downloads/acorda-portugal-release.apk'

export async function GET(request: NextRequest) {
  try {
    const upstreamRes = await fetch(UPSTREAM_APK_URL, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    })

    if (!upstreamRes.ok || !upstreamRes.body) {
      console.error('[APK_UPSTREAM_ERROR]', upstreamRes.status, upstreamRes.statusText)
      return new NextResponse('APK temporariamente indisponível', { status: 502 })
    }

    const contentLength = upstreamRes.headers.get('content-length') || '77876772'

    return new NextResponse(upstreamRes.body as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="acorda-portugal-release.apk"',
        'Content-Length': contentLength,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('[APK_DOWNLOAD_ROUTE_ERROR]', error)
    return new NextResponse('Erro ao processar download do APK', { status: 500 })
  }
}

export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="acorda-portugal-release.apk"',
        'Content-Length': '77876772',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
