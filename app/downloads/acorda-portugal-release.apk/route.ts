import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UPSTREAM_APK_URL = 'https://raw.githubusercontent.com/ricardo19correia-creator/acorda-portugal/main/public/downloads/acorda-portugal-release.apk'

export async function GET(request: NextRequest) {
  try {
    // 1. Tentar servir do disco local se disponível no ambiente
    const localApkPath = path.join(process.cwd(), 'public', 'downloads', 'acorda-portugal-release.apk')
    if (fs.existsSync(localApkPath)) {
      const stats = fs.statSync(localApkPath)
      if (stats.size > 1000) {
        const fileBuffer = fs.readFileSync(localApkPath)
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Disposition': 'attachment; filename="acorda-portugal-release.apk"',
            'Content-Length': String(stats.size),
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        })
      }
    }

    // 2. Servir stream direto do upstream raw GitHub (HTTP 200 contínuo)
    const upstreamRes = await fetch(UPSTREAM_APK_URL, {
      cache: 'no-store',
    })

    if (!upstreamRes.ok || !upstreamRes.body) {
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
    const localApkPath = path.join(process.cwd(), 'public', 'downloads', 'acorda-portugal-release.apk')
    if (fs.existsSync(localApkPath)) {
      const stats = fs.statSync(localApkPath)
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="acorda-portugal-release.apk"',
          'Content-Length': String(stats.size),
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      })
    }

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
