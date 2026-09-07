import type { Map } from 'maplibre-gl'
import { getLandmarksGeoJSON } from './WorldData'

export class LandmarkLayer {
  private map: Map
  private sourceId = 'source-landmarks'
  public coreLayerId = 'landmarks-core'
  public labelLayerId = 'landmarks-labels'

  constructor(map: Map) {
    this.map = map
  }

  public init() {
    if (!this.map.getSource(this.sourceId)) {
      this.map.addSource(this.sourceId, {
        type: 'geojson',
        data: getLandmarksGeoJSON(),
      })
    }

    if (!this.map.getLayer(this.coreLayerId)) {
      this.map.addLayer({
        id: this.coreLayerId,
        type: 'circle',
        source: this.sourceId,
        minzoom: 6.0,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6,
            4,
            10,
            8,
          ],
          'circle-color': '#10b981',
          'circle-stroke-width': 1.8,
          'circle-stroke-color': '#ecfdf5',
          'circle-opacity': 0.9,
        },
      })
    }

    if (!this.map.getLayer(this.labelLayerId)) {
      this.map.addLayer({
        id: this.labelLayerId,
        type: 'symbol',
        source: this.sourceId,
        minzoom: 7.0,
        layout: {
          'text-field': ['concat', '🏛 ', ['get', 'name']],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#6ee7b7',
          'text-halo-color': '#020617',
          'text-halo-width': 1.8,
        },
      })
    }
  }

  public setVisible(visible: boolean) {
    const val = visible ? 'visible' : 'none'
    if (this.map.getLayer(this.coreLayerId)) this.map.setLayoutProperty(this.coreLayerId, 'visibility', val)
    if (this.map.getLayer(this.labelLayerId)) this.map.setLayoutProperty(this.labelLayerId, 'visibility', val)
  }
}
