import type { DistrictItem, DistrictId } from '@/src/data/districts'
import type { MapArenaPOI } from '@/components/portugal-map/types'
import type { NexusCity, NexusLandmark, NexusEvent } from '@/lib/portugal-map-nexus-data'

export type WorldMapMode = 'world' | 'ranking' | 'arena' | 'district'

export type WorldSector = 'continente' | 'acores' | 'madeira'

export interface WorldLayersConfig {
  territorios: boolean
  cidades: boolean
  arenas: boolean
  landmarks: boolean
  eventos: boolean
  ranking: boolean
  conexoes: boolean
}

export const DEFAULT_WORLD_LAYERS: WorldLayersConfig = {
  territorios: true,
  cidades: true,
  arenas: true,
  landmarks: true,
  eventos: true,
  ranking: false,
  conexoes: true,
}

export interface WorldEngineCallbacks {
  onSelectDistrict?: (district: DistrictItem) => void
  onHoverDistrict?: (district: DistrictItem | null) => void
  onSelectArena?: (arena: MapArenaPOI) => void
  onSelectCity?: (city: NexusCity) => void
  onSelectLandmark?: (landmark: NexusLandmark) => void
  onSelectEvent?: (event: NexusEvent) => void
  onSectorChange?: (sector: WorldSector) => void
  onReady?: () => void
}

export interface WorldStateData {
  districts: DistrictItem[]
  selectedDistrict: DistrictItem | null
  hoveredDistrict: DistrictItem | null
  selectedArena: MapArenaPOI | null
  activeSector: WorldSector
  activeMode: WorldMapMode
  layers: WorldLayersConfig
  isReady: boolean
}
