import type { FeatureCollection, Feature, Point, LineString } from 'geojson'
import {
  DISTRICTS_LIST,
  getDistrictsGeoJSON,
  CANONICAL_CITIES,
  CANONICAL_LANDMARKS,
  CANONICAL_ARENAS,
  CANONICAL_CONNECTIONS,
  CANONICAL_EVENTS,
  type DistrictItem,
} from '@/src/data/districts'

/**
 * Builds GeoJSON for Cities with zoom tier properties
 */
export function getCitiesGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: CANONICAL_CITIES.map((city) => ({
      type: 'Feature',
      id: city.id,
      properties: {
        id: city.id,
        name: city.name,
        district: city.district,
        tier: city.tier,
        population: city.population,
        tag: city.tag,
        isCapital: city.tier === 'capital',
        minZoom: city.tier === 'capital' ? 3.5 : city.tier === 'major' ? 6.0 : 7.8,
      },
      geometry: {
        type: 'Point',
        coordinates: city.coordinates,
      },
    })),
  }
}

/**
 * Builds GeoJSON for Arenas with VIP and rarity styling properties
 */
export function getArenasGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: CANONICAL_ARENAS.map((arena) => {
      const isVip =
        (arena.rarity as string) === 'VIP' ||
        arena.rarity === 'Exclusiva' ||
        Boolean((arena as any).category?.startsWith('vip_'))
      const isLegendary = arena.rarity === 'Lendária' || arena.rarity === 'Épica'
      return {
        type: 'Feature',
        id: arena.id,
        properties: {
          id: arena.id,
          name: arena.name,
          district: arena.district,
          rarity: arena.rarity,
          category: (arena as any).category || 'default',
          image: arena.image,
          isVip,
          isLegendary,
          haloColor: isVip ? '#fbbf24' : isLegendary ? '#f59e0b' : '#00e5ff',
          coreColor: isVip ? '#ffd700' : isLegendary ? '#f97316' : '#06b6d4',
        },
        geometry: {
          type: 'Point',
          coordinates: arena.coordinates,
        },
      }
    }),
  }
}

/**
 * Builds GeoJSON for Landmarks (National monuments & heritage)
 */
export function getLandmarksGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: CANONICAL_LANDMARKS.map((landmark) => ({
      type: 'Feature',
      id: landmark.id,
      properties: {
        id: landmark.id,
        name: landmark.name,
        district: landmark.district,
        era: landmark.era,
        archetype: landmark.futuristicArchetype,
        icon: landmark.icon,
        description: landmark.description,
      },
      geometry: {
        type: 'Point',
        coordinates: landmark.coordinates,
      },
    })),
  }
}

/**
 * Builds GeoJSON for Active Events
 */
export function getEventsGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: CANONICAL_EVENTS.map((event) => ({
      type: 'Feature',
      id: event.id,
      properties: {
        id: event.id,
        title: event.title,
        type: event.type,
        district: event.district,
        badgeText: (event as any).badgeText || (event.type === 'war' ? 'GUERRA TERRITORIAL' : 'TORNEIO ATIVO'),
        multiplier: (event as any).multiplier || '2.5X XP',
      },
      geometry: {
        type: 'Point',
        coordinates: event.coordinates,
      },
    })),
  }
}

/**
 * Builds GeoJSON for National Connections and Rivers
 */
export function getConnectionsGeoJSON(): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: CANONICAL_CONNECTIONS.map((conn) => ({
      type: 'Feature',
      id: conn.id,
      properties: {
        id: conn.id,
        fromName: conn.fromName,
        toName: conn.toName,
        type: conn.type,
        color: conn.type === 'atlantic_relay' ? '#00e5ff' : '#0284c7',
      },
      geometry: {
        type: 'LineString',
        coordinates: [conn.fromCoords, conn.toCoords],
      },
    })),
  }
}

export { getDistrictsGeoJSON }
