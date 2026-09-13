import { NextResponse } from 'next/server'
import { PORTUGAL_CONCELHOS_COORDS } from '@/src/data/concelhos-coords'

function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .trim()
}

export async function GET(req: Request) {
  try {
    // 1. Verificar cabeçalhos de rede do Vercel / Edge Network
    const vercelCity = req.headers.get('x-vercel-ip-city')
    const vercelRegion = req.headers.get('x-vercel-ip-country-region')
    const latStr = req.headers.get('x-vercel-ip-latitude')
    const lngStr = req.headers.get('x-vercel-ip-longitude')

    if (latStr && lngStr) {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      if (!isNaN(lat) && !isNaN(lng)) {
        return NextResponse.json({
          source: 'vercel_edge_headers',
          city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
          region: vercelRegion || undefined,
          coords: [Number(lng.toFixed(5)), Number(lat.toFixed(5))],
        })
      }
    }

    // 2. Fallback para deteção de IP gratuita se estiver em ambiente local ou sem cabeçalhos
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const ipQuery = clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1' ? `/${clientIp}` : ''

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const res = await fetch(`https://freeipapi.com/api/json${ipQuery}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const cityName = data.cityName || ''
          return NextResponse.json({
            source: 'ip_geo_service',
            city: cityName,
            region: data.regionName || '',
            coords: [Number(data.longitude.toFixed(5)), Number(data.latitude.toFixed(5))],
          })
        }
      }
    } catch {
      // Ignorar e avançar
    }

    // 3. Fallback neutro
    return NextResponse.json({
      source: 'fallback',
      city: undefined,
      region: undefined,
      coords: undefined,
    })
  } catch {
    return NextResponse.json({ source: 'error', coords: undefined }, { status: 500 })
  }
}
