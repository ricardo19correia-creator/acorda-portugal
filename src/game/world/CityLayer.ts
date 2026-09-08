import type { Map } from 'maplibre-gl'
import { getCitiesGeoJSON } from './WorldData'

export class CityLayer {
  private map: Map
  private sourceId = 'source-cities'
  private glowLayerId = 'cities-glow'
  private coreLayerId = 'cities-core'
  private labelLayerId = 'cities-labels'

  constructor(map: Map) {
    this.map = map
  }

  public init() {
    if (!this.map || !this.map.getStyle()) return
    try {
      if (!this.map.getSource(this.sourceId)) {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: getCitiesGeoJSON(),
        })
      }

    // 1. City Glow Halo
    if (!this.map.getLayer(this.glowLayerId)) {
      this.map.addLayer({
        id: this.glowLayerId,
        type: 'circle',
        source: this.sourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            ['case', ['get', 'isCapital'], 7, 3],
            9,
            ['case', ['get', 'isCapital'], 14, 7],
          ],
          'circle-color': '#00e5ff',
          'circle-opacity': 0.35,
          'circle-blur': 0.8,
        },
      })
    }

    // 2. City Core Node
    if (!this.map.getLayer(this.coreLayerId)) {
      this.map.addLayer({
        id: this.coreLayerId,
        type: 'circle',
        source: this.sourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            ['case', ['get', 'isCapital'], 3.5, 1.8],
            9,
            ['case', ['get', 'isCapital'], 6, 3.5],
          ],
          'circle-color': [
            'case',
            ['get', 'isCapital'],
            '#ffffff',
            '#38bdf8',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#0369a1',
        },
      })
    }

    // 3. City Text Labels (Scaled by tier and zoom)
    if (!this.map.getLayer(this.labelLayerId)) {
      this.map.addLayer({
        id: this.labelLayerId,
        type: 'symbol',
        source: this.sourceId,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            ['case', ['get', 'isCapital'], 11, 8],
            9,
            ['case', ['get', 'isCapital'], 15, 12],
          ],
          'text-offset': [0, 0.9],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#f8fafc',
          'text-halo-color': '#020617',
          'text-halo-width': 1.5,
        },
      })
    }
  } catch (err) {
    console.warn('[CityLayer] Erro ao inicializar camadas:', err)
  }
}

  public setVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.glowLayerId)) this.map.setLayoutProperty(this.glowLayerId, 'visibility', val)
      if (this.map.getLayer(this.coreLayerId)) this.map.setLayoutProperty(this.coreLayerId, 'visibility', val)
      if (this.map.getLayer(this.labelLayerId)) this.map.setLayoutProperty(this.labelLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[CityLayer] Erro em setVisible:', err)
    }
  }
}
