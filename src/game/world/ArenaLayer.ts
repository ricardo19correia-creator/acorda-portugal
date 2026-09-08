import type { Map } from 'maplibre-gl'
import { getArenasGeoJSON } from './WorldData'

export class ArenaLayer {
  private map: Map
  private sourceId = 'source-arenas'
  public coreLayerId = 'arenas-core'
  public glowLayerId = 'arenas-glow'
  public labelLayerId = 'arenas-labels'

  constructor(map: Map) {
    this.map = map
  }

  public init() {
    if (!this.map || !this.map.getStyle()) return
    try {
      if (!this.map.getSource(this.sourceId)) {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: getArenasGeoJSON(),
        })
      }

    // 1. Arena Glow Pulse Halo
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
            5,
            ['case', ['get', 'isVip'], 9, 6],
            10,
            ['case', ['get', 'isVip'], 20, 14],
          ],
          'circle-color': ['get', 'haloColor'],
          'circle-opacity': 0.4,
          'circle-blur': 0.8,
        },
      })
    }

    // 2. Arena Core Interactive Beacon
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
            5,
            ['case', ['get', 'isVip'], 5.5, 4],
            10,
            ['case', ['get', 'isVip'], 9, 7],
          ],
          'circle-color': ['get', 'coreColor'],
          'circle-stroke-width': [
            'case',
            ['get', 'isVip'],
            2.5,
            1.8,
          ],
          'circle-stroke-color': [
            'case',
            ['get', 'isVip'],
            '#fef08a',
            '#e0f2fe',
          ],
        },
      })
    }

    // 3. Arena Labels at medium/high zoom
    if (!this.map.getLayer(this.labelLayerId)) {
      this.map.addLayer({
        id: this.labelLayerId,
        type: 'symbol',
        source: this.sourceId,
        minzoom: 7.0,
        layout: {
          'text-field': ['concat', '✦ ', ['get', 'name']],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': [
            'case',
            ['get', 'isVip'],
            '#fbbf24',
            '#38bdf8',
          ],
          'text-halo-color': '#020617',
          'text-halo-width': 1.8,
        },
      })
    }
  } catch (err) {
    console.warn('[ArenaLayer] Erro ao inicializar camadas:', err)
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
      console.warn('[ArenaLayer] Erro em setVisible:', err)
    }
  }
}
