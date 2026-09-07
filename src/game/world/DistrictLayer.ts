import type { Map } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import { getDistrictsGeoJSON } from './WorldData'

export class DistrictLayer {
  private map: Map
  private sourceId = 'source-districts'
  private fillLayerId = 'districts-fill'
  private outlineLayerId = 'districts-outline'
  private glowLayerId = 'districts-glow'
  private labelsLayerId = 'districts-labels'
  private currentHoverId: number | null = null
  private currentSelectedId: number | null = null

  constructor(map: Map) {
    this.map = map
  }

  public init(initialGeoJSON?: FeatureCollection) {
    if (!this.map || !this.map.isStyleLoaded()) return
    const data = initialGeoJSON || getDistrictsGeoJSON()

    try {
      if (!this.map.getSource(this.sourceId)) {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data,
          generateId: false, // IDs are already set as 1..20
        })
      }

      // 1. District Fill with GPU feature-state
      if (!this.map.getLayer(this.fillLayerId)) {
        this.map.addLayer({
          id: this.fillLayerId,
          type: 'fill',
          source: this.sourceId,
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#00e5ff',
              ['boolean', ['feature-state', 'hover'], false],
              '#38bdf8',
              ['get', 'color'],
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.55,
              ['boolean', ['feature-state', 'hover'], false],
              0.42,
              0.26,
            ],
          },
        })
      }

      // 2. Soft Outer Glow on Borders
      if (!this.map.getLayer(this.glowLayerId)) {
        this.map.addLayer({
          id: this.glowLayerId,
          type: 'line',
          source: this.sourceId,
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#00e5ff',
              ['boolean', ['feature-state', 'hover'], false],
              '#38bdf8',
              '#06b6d4',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              9,
              ['boolean', ['feature-state', 'hover'], false],
              7,
              3.5,
            ],
            'line-blur': 4,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.8,
              ['boolean', ['feature-state', 'hover'], false],
              0.6,
              0.3,
            ],
          },
        })
      }

      // 3. Crisp High-Tech Filament Border
      if (!this.map.getLayer(this.outlineLayerId)) {
        this.map.addLayer({
          id: this.outlineLayerId,
          type: 'line',
          source: this.sourceId,
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#ffffff',
              ['boolean', ['feature-state', 'hover'], false],
              '#a5f3fc',
              '#22d3ee',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              3.0,
              ['boolean', ['feature-state', 'hover'], false],
              2.4,
              1.6,
            ],
            'line-opacity': 0.9,
          },
        })
      }

      // 4. District Names Labels
      if (!this.map.getLayer(this.labelsLayerId)) {
        this.map.addLayer({
          id: this.labelsLayerId,
          type: 'symbol',
          source: this.sourceId,
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              9.5,
              8,
              13,
              11,
              16,
            ],
            'text-transform': 'uppercase',
            'text-letter-spacing': 0.1,
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': '#f1f5f9',
            'text-halo-color': '#020617',
            'text-halo-width': 2.0,
            'text-opacity': 0.88,
          },
        })
      }
    } catch (err) {
      console.warn('[DistrictLayer] Erro ao inicializar camadas:', err)
    }
  }

  public setHover(featureId: number | null) {
    if (!this.map || !this.map.isStyleLoaded()) return
    try {
      if (!this.map.getSource(this.sourceId)) return
      if (this.currentHoverId !== null) {
        this.map.setFeatureState(
          { source: this.sourceId, id: this.currentHoverId },
          { hover: false }
        )
      }
      this.currentHoverId = featureId
      if (featureId !== null) {
        this.map.setFeatureState(
          { source: this.sourceId, id: featureId },
          { hover: true }
        )
      }
    } catch (err) {
      console.warn('[DistrictLayer] Erro transitório em setHover:', err)
    }
  }

  public setSelected(featureId: number | null) {
    if (!this.map || !this.map.isStyleLoaded()) return
    try {
      if (!this.map.getSource(this.sourceId)) return
      if (this.currentSelectedId !== null) {
        this.map.setFeatureState(
          { source: this.sourceId, id: this.currentSelectedId },
          { selected: false }
        )
      }
      this.currentSelectedId = featureId
      if (featureId !== null) {
        this.map.setFeatureState(
          { source: this.sourceId, id: featureId },
          { selected: true }
        )
      }
    } catch (err) {
      console.warn('[DistrictLayer] Erro transitório em setSelected:', err)
    }
  }

  public setVisible(visible: boolean) {
    if (!this.map || !this.map.isStyleLoaded()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.fillLayerId)) this.map.setLayoutProperty(this.fillLayerId, 'visibility', val)
      if (this.map.getLayer(this.outlineLayerId)) this.map.setLayoutProperty(this.outlineLayerId, 'visibility', val)
      if (this.map.getLayer(this.glowLayerId)) this.map.setLayoutProperty(this.glowLayerId, 'visibility', val)
      if (this.map.getLayer(this.labelsLayerId)) this.map.setLayoutProperty(this.labelsLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro transitório em setVisible:', err)
    }
  }
}
