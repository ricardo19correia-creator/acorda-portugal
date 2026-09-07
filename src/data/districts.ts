import type { FeatureCollection, Feature, Geometry, Polygon, MultiPolygon } from 'geojson'
import {
  PORTUGAL_DISTRICTS_GEOJSON,
  TERRITORY_METADATA,
  REGION_CAMERA_PRESETS,
  type TerritoryGeoMetadata,
} from '@/lib/portugal-geojson'
import {
  CANONICAL_CITIES,
  CANONICAL_LANDMARKS,
  CANONICAL_ARENAS,
  CANONICAL_CONNECTIONS,
  CANONICAL_EVENTS,
  type NexusCity,
  type NexusLandmark,
  type NexusConnection,
  type NexusEvent,
} from '@/lib/portugal-map-nexus-data'
import type { MapArenaPOI } from '@/components/portugal-map/types'

export {
  VALID_DISTRICTS,
  PORTUGAL_DISTRICTS,
  type ValidDistrict,
  type PortugalDistrict,
} from '@/data/districts'

export type DistrictId =
  | 'aveiro'
  | 'beja'
  | 'braga'
  | 'braganca'
  | 'castelo_branco'
  | 'coimbra'
  | 'evora'
  | 'faro'
  | 'guarda'
  | 'leiria'
  | 'lisboa'
  | 'portalegre'
  | 'porto'
  | 'santarem'
  | 'setubal'
  | 'viana_do_castelo'
  | 'vila_real'
  | 'viseu'
  | 'acores'
  | 'madeira'

export interface DistrictBounds {
  southWest: [number, number] // [lng, lat]
  northEast: [number, number] // [lng, lat]
}

export interface DistrictItem {
  id: DistrictId
  slug: string
  name: string
  canonicalName: string
  capital: string
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira'
  type: 'mainland' | 'island'
  center: [number, number] // [lng, lat]
  bounds: DistrictBounds
  zoom: number
  pitch: number
  bearing: number
  selectionColor: string
  dominantColor: string
  accentColor: string
  motto: string
  ranking: number
  score: number
  players: number
  arenasCount: number
  status: 'active' | 'contested' | 'peace' | 'event'
  events: string[]
  geometry: Geometry
}

// Calculate bounding box from polygon or multipolygon coordinates
function computeBoundingBox(geometry: Geometry): DistrictBounds {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  const inspectCoord = (pt: number[]) => {
    const lng = pt[0]
    const lat = pt[1]
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  if (geometry.type === 'Polygon') {
    for (const ring of (geometry as Polygon).coordinates) {
      for (const pt of ring) inspectCoord(pt)
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of (geometry as MultiPolygon).coordinates) {
      for (const ring of poly) {
        for (const pt of ring) inspectCoord(pt)
      }
    }
  }

  if (!isFinite(minLng)) {
    minLng = -9.5; maxLng = -6.2; minLat = 36.9; maxLat = 42.2
  }

  return {
    southWest: [minLng, minLat],
    northEast: [maxLng, maxLat],
  }
}

// Map canonical district metadata to unified DistrictItem array
export const DISTRICTS_LIST: DistrictItem[] = Object.entries(TERRITORY_METADATA).map(([key, meta], idx) => {
  const matchingFeature = PORTUGAL_DISTRICTS_GEOJSON.features.find((f) => {
    const pName = (f.properties?.name || '').toString().toLowerCase()
    const pId = (f.properties?.id || '').toString().toLowerCase()
    return (
      pName === key.toLowerCase() ||
      pName === meta.canonicalName.toLowerCase() ||
      pId === meta.id.toLowerCase()
    )
  })

  const geometry: Geometry = matchingFeature?.geometry || {
    type: 'Point',
    coordinates: meta.center,
  }

  const bounds = computeBoundingBox(geometry)
  const arenasCount = CANONICAL_ARENAS.filter(
    (a) => a.district.toLowerCase() === meta.name.toLowerCase() || a.district.toLowerCase() === meta.canonicalName.toLowerCase()
  ).length

  return {
    id: meta.id as DistrictId,
    slug: meta.id.replace(/_/g, '-'),
    name: meta.name,
    canonicalName: meta.canonicalName,
    capital: meta.capital,
    region: meta.region,
    type: meta.type,
    center: meta.center,
    bounds,
    zoom: meta.zoom,
    pitch: meta.pitch,
    bearing: meta.bearing,
    selectionColor: meta.dominantColor || '#00e5ff',
    dominantColor: meta.dominantColor,
    accentColor: meta.accentColor,
    motto: meta.motto,
    ranking: idx + 1,
    score: 1000 + (20 - idx) * 45,
    players: 0, // Injected dynamically via WorldStateProvider
    arenasCount: arenasCount || 1,
    status: idx % 4 === 0 ? 'contested' : 'active',
    events: idx === 0 ? ['Guerra dos Distritos // Batalha Ativa'] : [],
    geometry,
  }
})

// Quick Lookup Map by slug, id, or lower-case name
const DISTRICTS_MAP = new Map<string, DistrictItem>()
for (const d of DISTRICTS_LIST) {
  DISTRICTS_MAP.set(d.id.toLowerCase(), d)
  DISTRICTS_MAP.set(d.slug.toLowerCase(), d)
  DISTRICTS_MAP.set(d.name.toLowerCase(), d)
  DISTRICTS_MAP.set(d.canonicalName.toLowerCase(), d)
}

export function getDistrict(query: string): DistrictItem | undefined {
  if (!query) return undefined
  return DISTRICTS_MAP.get(query.trim().toLowerCase())
}

export function getAllDistricts(): DistrictItem[] {
  return DISTRICTS_LIST
}

// Build FeatureCollection for MapLibre GPU Layers
export function getDistrictsGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: DISTRICTS_LIST.map((district, idx) => ({
      type: 'Feature',
      id: idx + 1, // numeric ID for feature-state
      properties: {
        id: district.id,
        slug: district.slug,
        name: district.name,
        canonicalName: district.canonicalName,
        region: district.region,
        type: district.type,
        ranking: district.ranking,
        score: district.score,
        players: district.players,
        arenasCount: district.arenasCount,
        status: district.status,
        color: district.dominantColor,
        selectionColor: district.selectionColor,
        centerLng: district.center[0],
        centerLat: district.center[1],
      },
      geometry: district.geometry,
    })),
  }
}

// Re-export canonical collections for single point of consumption
export {
  CANONICAL_CITIES,
  CANONICAL_LANDMARKS,
  CANONICAL_ARENAS,
  CANONICAL_CONNECTIONS,
  CANONICAL_EVENTS,
  REGION_CAMERA_PRESETS,
}
