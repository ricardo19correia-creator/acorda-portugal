import type { DistrictWarTerritory } from '@/lib/district-war'
import type { ArenaRarity } from '@/src/types/arena'

export type MapDisplayMode = 'satellite' | 'terrain' | 'tactical' | 'night'
export type MapRegion = 'continente' | 'acores' | 'madeira'

export interface CameraPreset {
  center: [number, number] // [lng, lat]
  zoom: number
  pitch: number
  bearing: number
}

export interface MapArenaPOI {
  id: string
  name: string
  district: string
  coordinates: [number, number] // [lng, lat]
  rarity: ArenaRarity
  image: string
  description: string
  category?: string
  effect?: string
}

export interface MapSearchResult {
  id: string
  title: string
  subtitle: string
  type: 'district' | 'arena' | 'city'
  coordinates: [number, number]
  zoom?: number
  pitch?: number
  bearing?: number
  metadata?: any
}

export interface MapEngineState {
  isReady: boolean
  is3DSupported: boolean
  isUsingFallbackImagery: boolean
  isTerrainActive: boolean
  activeMode: MapDisplayMode
  activeRegion: MapRegion
  errorMessage?: string
}

export interface PortugalGameMapProps {
  initialDistrict?: string
  initialRegion?: MapRegion
  territories: DistrictWarTerritory[]
  onSelectDistrict?: (districtName: string) => void
  onSelectPlayer?: (player: any) => void
  onStartGame?: (route: string) => void
}
