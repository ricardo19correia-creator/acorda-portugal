// Re-exported from the Single Source of Truth for Portugal Map Geometry
import { PORTUGAL_TERRITORIES, type PortugalTerritory } from './portugal-territories'

export type DistrictGeoItem = PortugalTerritory

export const PORTUGAL_GEO_DATA: DistrictGeoItem[] = PORTUGAL_TERRITORIES

export {
  PORTUGAL_TERRITORIES,
  PORTUGAL_TERRITORIES_MAP,
  type PortugalTerritory,
  getTerritoryById,
  getTerritoryByName,
} from './portugal-territories'
