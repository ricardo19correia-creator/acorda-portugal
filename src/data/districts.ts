import type { FeatureCollection, Feature, Geometry, Polygon, MultiPolygon } from 'geojson'
import { REGION_CAMERA_PRESETS } from '@/lib/territory-metadata'
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
import nationalGeoJSONRaw from '@/src/data/maps/portugal-national.json'

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
  | 'acores_santa_maria'
  | 'acores_sao_miguel'
  | 'acores_terceira'
  | 'acores_graciosa'
  | 'acores_sao_jorge'
  | 'acores_pico'
  | 'acores_faial'
  | 'acores_flores'
  | 'acores_corvo'
  | 'madeira_ilha'
  | 'madeira_porto_santo'
  | (string & {})

export interface DistrictBounds {
  southWest: [number, number] // [lng, lat]
  northEast: [number, number] // [lng, lat]
}

export interface DistrictItem {
  id: DistrictId
  numericId: number
  slug: string
  name: string
  canonicalName: string
  capital: string
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira'
  type: 'mainland' | 'island'
  parentRegion: 'continente' | 'acores' | 'madeira'
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

// Bounding box computation from geometry coordinates
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

// Canonical island and district mottos
const TERRITORY_MOTTOS: Record<string, string> = {
  aveiro: 'Veneza de Portugal & Rota dos Moliceiros',
  beja: 'Coração Dourado do Baixo Alentejo',
  braga: 'Capital dos Arcebispos & Berço de Guerreiros',
  braganca: 'Baluarte Transmontano & Sentinela do Nordeste',
  castelo_branco: 'Guardiã da Beira Baixa & Fronteira Heroica',
  coimbra: 'Cidade dos Doutores & Trono do Conhecimento',
  evora: 'Templo de Diana & Joia Alentejana',
  faro: 'Costa Dourada & Bastião do Algarve',
  guarda: 'A Mais Alta & Mais Nobre Sentinela da Beira',
  leiria: 'Castelo Templário & Pinhal do Rei',
  lisboa: 'Capital Imperial & Coração do Império Lusitano',
  portalegre: 'Sentinela do Alto Alentejo & Forte de São Mamede',
  porto: 'Invicta & Berço da Nação Heroica',
  santarem: 'Capital do Gótico & Ribatejo Imortal',
  setubal: 'Baía dos Golfinhos & Trono da Arrábida',
  viana_do_castelo: 'Coração do Minho & Princesa do Lima',
  vila_real: 'Porta de Trás-os-Montes & Reino Maravilhoso',
  viseu: 'Cidade de Viriato & Coração da Beira Alta',
  acores_sao_miguel: 'A Ilha Verde & Lagoa das Sete Cidades',
  acores_santa_maria: 'A Ilha Amarela & Primeira a Despontar',
  acores_terceira: 'A Ilha Lilás & Angra Heroica',
  acores_graciosa: 'A Ilha Branca & Caldeira Enigmática',
  acores_sao_jorge: 'A Ilha Castanha & Freguesias de Fajãs',
  acores_pico: 'A Ilha Cinzenta & Ponto Mais Alto de Portugal',
  acores_faial: 'A Ilha Azul & Marina dos Navegadores',
  acores_flores: 'A Ilha Rosa & Jardim do Atlântico',
  acores_corvo: 'A Ilha Preta & Sentinela do Extremo Ocidente',
  madeira_ilha: 'Pérola do Atlântico & Laurissilva Eterna',
  madeira_porto_santo: 'A Ilha Dourada & Praia dos Descobrimentos',
}

// Map the 29 authentic features to typed DistrictItem structures
export const DISTRICTS_LIST: DistrictItem[] = ((nationalGeoJSONRaw as unknown as FeatureCollection).features || []).map(
  (feature, idx) => {
    const props = feature.properties || {}
    const id = (props.id || `territory_${idx}`).toString().toLowerCase() as DistrictId
    const numericId = Number(props.numericId || feature.id || idx + 1)
    const name = props.name || id
    const canonicalName = props.canonicalName || name
    const capital = props.capital || name
    const region = (props.region || 'Centro') as DistrictItem['region']
    const type = (props.type || 'mainland') as DistrictItem['type']
    const parentRegion: DistrictItem['parentRegion'] =
      region === 'Açores' ? 'acores' : region === 'Madeira' ? 'madeira' : 'continente'

    const geometry = feature.geometry as Geometry
    const bounds = computeBoundingBox(geometry)

    const center: [number, number] = [
      Number(props.centerLng) || (bounds.southWest[0] + bounds.northEast[0]) / 2,
      Number(props.centerLat) || (bounds.southWest[1] + bounds.northEast[1]) / 2,
    ]

    const dominantColor = props.color || (type === 'island' ? '#00e5ff' : '#38bdf8')
    const accentColor = dominantColor
    const selectionColor = '#00e5ff'
    const motto = TERRITORY_MOTTOS[id] || `${name} // Bastião Nacional 2150`

    // Count arenas mapped in this district or island
    const arenasCount = CANONICAL_ARENAS.filter(
      (a) =>
        a.district.toLowerCase() === name.toLowerCase() ||
        a.district.toLowerCase() === canonicalName.toLowerCase() ||
        a.district.toLowerCase() === id.toLowerCase()
    ).length

    // Camera preset based on type
    const zoom = type === 'island' ? 10.2 : 9.0
    const pitch = 30
    const bearing = 0

    return {
      id,
      numericId,
      slug: id.replace(/_/g, '-'),
      name,
      canonicalName,
      capital,
      region,
      type,
      parentRegion,
      center,
      bounds,
      zoom,
      pitch,
      bearing,
      selectionColor,
      dominantColor,
      accentColor,
      motto,
      ranking: idx + 1,
      score: 1000 + (30 - idx) * 35,
      players: 0, // Injected dynamically via WorldStateProvider
      arenasCount: arenasCount || 1,
      status: idx % 4 === 0 ? 'contested' : 'active',
      events: idx === 0 ? ['Guerra dos Distritos // Batalha Ativa'] : [],
      geometry,
    }
  }
)

// Quick Lookup Map by slug, id, lower-case name, and aliases
const DISTRICTS_MAP = new Map<string, DistrictItem>()
for (const d of DISTRICTS_LIST) {
  DISTRICTS_MAP.set(d.id.toLowerCase(), d)
  DISTRICTS_MAP.set(d.slug.toLowerCase(), d)
  DISTRICTS_MAP.set(d.name.toLowerCase(), d)
  DISTRICTS_MAP.set(d.canonicalName.toLowerCase(), d)
  DISTRICTS_MAP.set(String(d.numericId), d)
}

// Aliases for regional lookups
const saoMiguel = DISTRICTS_LIST.find((d) => d.id === 'acores_sao_miguel')
if (saoMiguel) {
  DISTRICTS_MAP.set('acores', saoMiguel)
  DISTRICTS_MAP.set('açores', saoMiguel)
}

const madeiraIlha = DISTRICTS_LIST.find((d) => d.id === 'madeira_ilha')
if (madeiraIlha) {
  DISTRICTS_MAP.set('madeira', madeiraIlha)
}

export function getDistrict(query: string): DistrictItem | undefined {
  if (!query) return undefined
  const q = query.trim().toLowerCase()
  return DISTRICTS_MAP.get(q)
}

export function getAllDistricts(): DistrictItem[] {
  return DISTRICTS_LIST
}

// Build FeatureCollection for MapLibre GPU Layers
export function getDistrictsGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: DISTRICTS_LIST.map((district) => ({
      type: 'Feature',
      id: district.numericId, // numeric ID for MapLibre feature-state
      properties: {
        numericId: district.numericId,
        id: district.id,
        slug: district.slug,
        name: district.name,
        canonicalName: district.canonicalName,
        capital: district.capital,
        region: district.region,
        type: district.type,
        parentRegion: district.parentRegion,
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
