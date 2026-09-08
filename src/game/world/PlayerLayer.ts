import type { Map } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import { DISTRICTS_LIST } from '@/src/data/districts'

export class PlayerLayer {
  private map: Map
  private sourceId = 'source-rankings'
  public rankingLayerId = 'rankings-badge'

  constructor(map: Map) {
    this.map = map
  }

  public init() {
    if (!this.map || !this.map.getStyle()) return
    try {
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: DISTRICTS_LIST.map((d) => ({
          type: 'Feature',
          id: d.id,
          properties: {
            id: d.id,
            name: d.name,
            ranking: d.ranking,
            score: d.score,
            badgeLabel: `#${d.ranking}`,
          },
          geometry: {
            type: 'Point',
            coordinates: d.center,
          },
        })),
      }

      if (!this.map.getSource(this.sourceId)) {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: geojson,
        })
      }

      if (!this.map.getLayer(this.rankingLayerId)) {
        this.map.addLayer({
          id: this.rankingLayerId,
          type: 'symbol',
          source: this.sourceId,
          layout: {
            'text-field': ['get', 'badgeLabel'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              11,
              9,
              15,
            ],
            'text-offset': [0, -1.2],
            'text-anchor': 'bottom',
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': [
              'case',
              ['<=', ['get', 'ranking'], 1],
              '#fbbf24', // Gold for #1
              ['<=', ['get', 'ranking'], 3],
              '#e2e8f0', // Silver/Bronze for top 3
              '#38bdf8',
            ],
            'text-halo-color': '#020617',
            'text-halo-width': 2.0,
          },
        })
      }
    } catch (err) {
      console.warn('[PlayerLayer] Erro em init:', err)
    }
  }

  public setVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.rankingLayerId)) {
        this.map.setLayoutProperty(this.rankingLayerId, 'visibility', val)
      }
    } catch (err) {
      console.warn('[PlayerLayer] Erro em setVisible:', err)
    }
  }
}
