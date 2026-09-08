import type { Map } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import { getDistrictsGeoJSON, DISTRICTS_LIST } from '@/src/data/districts'
import { getDistrictsCentersGeoJSON } from './WorldData'

export class DistrictLayer {
  private map: Map
  private sourceId = 'source-districts'
  private centersSourceId = 'source-districts-centers'
  private fillLayerId = 'districts-fill'
  private outlineLayerId = 'districts-outline'
  private glowLayerId = 'districts-glow'
  private activityLayerId = 'districts-activity'
  private labelsLayerId = 'districts-labels'
  private presencePulseLayerId = 'districts-presence-pulse'
  private presenceBadgeLayerId = 'districts-presence-badge'
  private currentHoverId: number | null = null
  private currentSelectedId: number | null = null

  constructor(map: Map) {
    this.map = map
  }

  public init(initialGeoJSON?: FeatureCollection) {
    if (!this.map || !this.map.getStyle()) return
    const data = initialGeoJSON || getDistrictsGeoJSON()
    const centersData = getDistrictsCentersGeoJSON()

    try {
      // 1. Polygon Source for Districts
      if (!this.map.getSource(this.sourceId)) {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data,
          generateId: false, // numeric IDs 1..52
        })
      }

      // 2. Centroid Source for Presence Beacons
      if (!this.map.getSource(this.centersSourceId)) {
        this.map.addSource(this.centersSourceId, {
          type: 'geojson',
          data: centersData,
          generateId: false,
        })
      }

      // 3. District Fill with Vibrant 2150 Colors + Living Player Luminosity
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
            // Living map effect: High base opacity (0.58), increases with real online players up to 0.78
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.90,
              ['boolean', ['feature-state', 'hover'], false],
              0.80,
              [
                '+',
                0.58,
                [
                  'min',
                  0.20,
                  ['*', ['to-number', ['feature-state', 'onlinePlayers'], 0], 0.05],
                ],
              ],
            ],
          },
        })
      }

      // 4. Activity Heatmap Radiant Layer (Optional overlay toggle)
      if (!this.map.getLayer(this.activityLayerId)) {
        this.map.addLayer({
          id: this.activityLayerId,
          type: 'fill',
          source: this.sourceId,
          layout: {
            visibility: 'none',
          },
          paint: {
            'fill-color': [
              'case',
              ['>=', ['to-number', ['feature-state', 'onlinePlayers'], 0], 50],
              '#f43f5e', // Rose Néon / Atividade Muito Alta
              ['>=', ['to-number', ['feature-state', 'onlinePlayers'], 0], 21],
              '#f59e0b', // Âmbar Solar / Atividade Alta
              ['>=', ['to-number', ['feature-state', 'onlinePlayers'], 0], 6],
              '#10b981', // Esmeralda / Atividade Média
              ['>=', ['to-number', ['feature-state', 'onlinePlayers'], 1], 1],
              '#06b6d4', // Ciano / Atividade Baixa
              '#020617',
            ],
            'fill-opacity': [
              'case',
              ['>', ['to-number', ['feature-state', 'onlinePlayers'], 0], 0],
              0.60,
              0.0,
            ],
          },
        })
      }

      // 5. Soft Ambient Laser Glow on Boundaries
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
              ['>', ['to-number', ['feature-state', 'onlinePlayers'], 0], 0],
              '#34d399', // Living emerald glow if active players online
              '#06b6d4',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              10,
              ['boolean', ['feature-state', 'hover'], false],
              8,
              5,
            ],
            'line-blur': 3.5,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.90,
              ['boolean', ['feature-state', 'hover'], false],
              0.80,
              0.48,
            ],
          },
        })
      }

      // 6. Crisp High-Tech Laser Filament Border
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
              '#e0f2fe',
              '#7dd3fc',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              2.6,
              ['boolean', ['feature-state', 'hover'], false],
              2.0,
              1.5,
            ],
            'line-opacity': 0.95,
          },
        })
      }

      // 7. Presence Beacon Pulse Node (Only rendered when online players > 0)
      if (!this.map.getLayer(this.presencePulseLayerId)) {
        this.map.addLayer({
          id: this.presencePulseLayerId,
          type: 'circle',
          source: this.centersSourceId,
          paint: {
            'circle-radius': [
              'case',
              ['>', ['to-number', ['feature-state', 'onlinePlayers'], 0], 0],
              ['interpolate', ['linear'], ['zoom'], 4.5, 6, 8, 14],
              0,
            ],
            'circle-color': '#10b981',
            'circle-opacity': 0.35,
            'circle-blur': 0.6,
          },
        })
      }

      // 8. Presence Badge Core
      if (!this.map.getLayer(this.presenceBadgeLayerId)) {
        this.map.addLayer({
          id: this.presenceBadgeLayerId,
          type: 'circle',
          source: this.centersSourceId,
          paint: {
            'circle-radius': [
              'case',
              ['>', ['to-number', ['feature-state', 'onlinePlayers'], 0], 0],
              ['interpolate', ['linear'], ['zoom'], 4.5, 3, 8, 6],
              0,
            ],
            'circle-color': '#34d399',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#022c22',
            'circle-opacity': 0.95,
          },
        })
      }

      // 9. High-Tech Uppercase Typography Labels
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
              4.5,
              9.0,
              6.5,
              12.0,
              8.5,
              15.0,
              11.0,
              18.0,
            ],
            'text-transform': 'uppercase',
            'text-letter-spacing': 0.12,
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#020617',
            'text-halo-width': 2.8,
            'text-opacity': 0.95,
          },
        })
      }
    } catch (err) {
      console.warn('[DistrictLayer] Erro ao inicializar camadas:', err)
    }
  }

  public setHover(featureId: number | null) {
    if (!this.map || !this.map.getStyle()) return
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
    if (!this.map || !this.map.getStyle()) return
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

  public updateOnlinePresence(districtCounts: Record<string, number>) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const hasPolygonSource = Boolean(this.map.getSource(this.sourceId))
      const hasCenterSource = Boolean(this.map.getSource(this.centersSourceId))

      for (const d of DISTRICTS_LIST) {
        const count =
          districtCounts[d.id] ||
          districtCounts[d.slug] ||
          districtCounts[d.name.toLowerCase()] ||
          districtCounts[d.canonicalName.toLowerCase()] ||
          0

        const activityLevel =
          count >= 50
            ? 'very-high'
            : count >= 21
            ? 'high'
            : count >= 6
            ? 'medium'
            : count >= 1
            ? 'low'
            : 'none'

        if (hasPolygonSource) {
          this.map.setFeatureState(
            { source: this.sourceId, id: d.numericId },
            {
              onlinePlayers: count,
              activityLevel,
            }
          )
        }

        if (hasCenterSource) {
          this.map.setFeatureState(
            { source: this.centersSourceId, id: d.numericId },
            {
              onlinePlayers: count,
              activityLevel,
            }
          )
        }
      }
    } catch (err) {
      console.warn('[DistrictLayer] Erro em updateOnlinePresence:', err)
    }
  }

  public setVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.fillLayerId)) this.map.setLayoutProperty(this.fillLayerId, 'visibility', val)
      if (this.map.getLayer(this.outlineLayerId)) this.map.setLayoutProperty(this.outlineLayerId, 'visibility', val)
      if (this.map.getLayer(this.glowLayerId)) this.map.setLayoutProperty(this.glowLayerId, 'visibility', val)
      if (this.map.getLayer(this.labelsLayerId)) this.map.setLayoutProperty(this.labelsLayerId, 'visibility', val)
      if (this.map.getLayer(this.presencePulseLayerId)) this.map.setLayoutProperty(this.presencePulseLayerId, 'visibility', val)
      if (this.map.getLayer(this.presenceBadgeLayerId)) this.map.setLayoutProperty(this.presenceBadgeLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro transitório em setVisible:', err)
    }
  }

  public setTerritoriosVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.fillLayerId)) this.map.setLayoutProperty(this.fillLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro em setTerritoriosVisible:', err)
    }
  }

  public setFronteirasVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.outlineLayerId)) this.map.setLayoutProperty(this.outlineLayerId, 'visibility', val)
      if (this.map.getLayer(this.glowLayerId)) this.map.setLayoutProperty(this.glowLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro em setFronteirasVisible:', err)
    }
  }

  public setNomesVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.labelsLayerId)) this.map.setLayoutProperty(this.labelsLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro em setNomesVisible:', err)
    }
  }

  public setJogadoresOnlineVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.presencePulseLayerId)) this.map.setLayoutProperty(this.presencePulseLayerId, 'visibility', val)
      if (this.map.getLayer(this.presenceBadgeLayerId)) this.map.setLayoutProperty(this.presenceBadgeLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro em setJogadoresOnlineVisible:', err)
    }
  }

  public setAtividadeVisible(visible: boolean) {
    if (!this.map || !this.map.getStyle()) return
    try {
      const val = visible ? 'visible' : 'none'
      if (this.map.getLayer(this.activityLayerId)) this.map.setLayoutProperty(this.activityLayerId, 'visibility', val)
    } catch (err) {
      console.warn('[DistrictLayer] Erro em setAtividadeVisible:', err)
    }
  }
}
