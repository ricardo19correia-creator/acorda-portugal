import type { Map } from 'maplibre-gl'
import { getEventsGeoJSON } from './WorldData'

export class EventLayer {
  private map: Map
  private sourceId = 'source-events'
  public coreLayerId = 'events-core'
  public labelLayerId = 'events-labels'

  constructor(map: Map) {
    this.map = map
  }

  public init() {
    if (!this.map || !this.map.getStyle()) return
    try {
      if (!this.map.getSource(this.sourceId)) {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: getEventsGeoJSON(),
        })
      }

      if (!this.map.getLayer(this.coreLayerId)) {
        this.map.addLayer({
          id: this.coreLayerId,
          type: 'circle',
          source: this.sourceId,
          paint: {
            'circle-radius': 7,
            'circle-color': '#f43f5e',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffe4e6',
            'circle-opacity': 0.95,
          },
        })
      }

      if (!this.map.getLayer(this.labelLayerId)) {
        this.map.addLayer({
          id: this.labelLayerId,
          type: 'symbol',
          source: this.sourceId,
          layout: {
            'text-field': ['concat', '🔥 ', ['get', 'title']],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-offset': [0, 1.1],
            'text-anchor': 'top',
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#fda4af',
            'text-halo-color': '#020617',
            'text-halo-width': 1.8,
          },
        })
      }
    } catch (err) {
      console.warn('[EventLayer] Erro em init:', err)
    }
  }

  public setVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.coreLayerId)) this.map.setLayoutProperty(this.coreLayerId, 'visibility', val)
      if (this.map.getLayer(this.labelLayerId)) this.map.setLayoutProperty(this.labelLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[EventLayer] Erro em setVisible:', err)
    }
  }
}
