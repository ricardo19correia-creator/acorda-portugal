import type { Map, PointLike } from 'maplibre-gl'
import { getDistrict, type DistrictItem } from '@/src/data/districts'
import { CANONICAL_ARENAS, CANONICAL_LANDMARKS } from '@/lib/portugal-map-nexus-data'
import type { MapArenaPOI } from '@/components/portugal-map/types'
import type { DistrictLayer } from './DistrictLayer'
import type { WorldEngineCallbacks } from './WorldState'

export class WorldInteraction {
  private map: Map
  private districtLayer: DistrictLayer
  private callbacks: WorldEngineCallbacks
  private hoveredFeatureId: number | null = null

  constructor(
    map: Map,
    districtLayer: DistrictLayer,
    callbacks: WorldEngineCallbacks = {}
  ) {
    this.map = map
    this.districtLayer = districtLayer
    this.callbacks = callbacks
  }

  public updateCallbacks(callbacks: WorldEngineCallbacks) {
    this.callbacks = callbacks
  }

  public bindEvents() {
    const map = this.map

    // 1. Hover on districts
    map.on('mousemove', 'districts-fill', (e) => {
      if (!e.features || e.features.length === 0) return
      map.getCanvas().style.cursor = 'pointer'

      const feat = e.features[0]
      const fId = feat.id as number
      const districtId = feat.properties?.id || feat.properties?.slug || feat.properties?.name

      if (this.hoveredFeatureId !== fId) {
        this.hoveredFeatureId = fId
        this.districtLayer.setHover(fId)

        const district = getDistrict(districtId)
        if (this.callbacks.onHoverDistrict) {
          this.callbacks.onHoverDistrict(district || null)
        }
      }
    })

    map.on('mouseleave', 'districts-fill', () => {
      map.getCanvas().style.cursor = ''
      if (this.hoveredFeatureId !== null) {
        this.districtLayer.setHover(null)
        this.hoveredFeatureId = null
        if (this.callbacks.onHoverDistrict) {
          this.callbacks.onHoverDistrict(null)
        }
      }
    })

    // 2. Click on Arena (Prioritized)
    map.on('click', 'arenas-core', (e) => {
      if (!e.features || e.features.length === 0) return
      const feat = e.features[0]
      const aId = feat.properties?.id
      const arena = CANONICAL_ARENAS.find((a) => a.id === aId)
      if (arena && this.callbacks.onSelectArena) {
        this.callbacks.onSelectArena(arena as unknown as MapArenaPOI)
      }
    })

    // 3. Click on Landmark
    map.on('click', 'landmarks-core', (e) => {
      if (!e.features || e.features.length === 0) return
      const feat = e.features[0]
      const lmId = feat.properties?.id
      const lm = CANONICAL_LANDMARKS.find((l) => l.id === lmId)
      if (lm && this.callbacks.onSelectLandmark) {
        this.callbacks.onSelectLandmark(lm)
      }
    })

    // 4. Click on District
    map.on('click', 'districts-fill', (e) => {
      if (!e.features || e.features.length === 0) return
      const feat = e.features[0]
      const fId = feat.id as number
      const districtId = feat.properties?.id || feat.properties?.slug || feat.properties?.name

      this.districtLayer.setSelected(fId)

      const district = getDistrict(districtId)
      if (district && this.callbacks.onSelectDistrict) {
        this.callbacks.onSelectDistrict(district)
      }
    })

    // 5. Click on empty space (Deselects)
    map.on('click', (e) => {
      if (!map.isStyleLoaded()) return
      try {
        const bbox: [PointLike, PointLike] = [
          [e.point.x - 3, e.point.y - 3],
          [e.point.x + 3, e.point.y + 3],
        ]
        const interactiveFeatures = map.queryRenderedFeatures(bbox, {
          layers: ['districts-fill', 'arenas-core', 'landmarks-core', 'events-core'].filter((id) =>
            Boolean(map.getLayer(id))
          ),
        })

        if (interactiveFeatures.length === 0) {
          this.districtLayer.setSelected(null)
          if (this.callbacks.onSelectDistrict) {
            // Deselect
            (this.callbacks.onSelectDistrict as any)(null)
          }
          if (this.callbacks.onSelectArena) {
            (this.callbacks.onSelectArena as any)(null)
          }
        }
      } catch (err) {
        console.warn('[WorldInteraction] Erro em click handler:', err)
      }
    })

    // Cursor pointers on other layers
    const pointerLayers = ['arenas-core', 'landmarks-core', 'events-core', 'cities-core']
    for (const lId of pointerLayers) {
      if (map.getLayer(lId)) {
        map.on('mouseenter', lId, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', lId, () => {
          map.getCanvas().style.cursor = ''
        })
      }
    }
  }
}
