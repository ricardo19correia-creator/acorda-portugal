import { Map, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getDistrict, type DistrictItem, DISTRICTS_LIST } from '@/src/data/districts'
import { getConnectionsGeoJSON } from './WorldData'
import { DistrictLayer } from './DistrictLayer'
import { CityLayer } from './CityLayer'
import { ArenaLayer } from './ArenaLayer'
import { LandmarkLayer } from './LandmarkLayer'
import { EventLayer } from './EventLayer'
import { PlayerLayer } from './PlayerLayer'
import { WorldCamera } from './WorldCamera'
import { WorldInteraction } from './WorldInteraction'
import {
  type WorldMapMode,
  type WorldSector,
  type WorldLayersConfig,
  type WorldEngineCallbacks,
  DEFAULT_WORLD_LAYERS,
} from './WorldState'

// High-Tech Dark Style Specification for "PORTUGAL 2150"
// Zero external token needed, open-source high-resolution tactical basemap
const PORTUGAL_2150_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'tactical-dark-basemap': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, DeLorme, NAVTEQ',
      maxzoom: 16,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#020617', // Deep Atlantic Cyber Void
      },
    },
    {
      id: 'tactical-dark-layer',
      type: 'raster',
      source: 'tactical-dark-basemap',
      paint: {
        'raster-opacity': 0.14,
        'raster-contrast': 0.15,
        'raster-brightness-min': 0.02,
      },
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export interface PortugalWorldEngineOptions {
  container: HTMLElement
  mode?: WorldMapMode
  initialSector?: WorldSector
  initialDistrict?: string
  layers?: Partial<WorldLayersConfig>
  callbacks?: WorldEngineCallbacks
}

export class PortugalWorldEngine {
  public map: Map
  public camera: WorldCamera
  public interaction: WorldInteraction
  public districtLayer: DistrictLayer
  public cityLayer: CityLayer
  public arenaLayer: ArenaLayer
  public landmarkLayer: LandmarkLayer
  public eventLayer: EventLayer
  public playerLayer: PlayerLayer

  private mode: WorldMapMode
  private layersConfig: WorldLayersConfig
  private isLoaded = false
  private container: HTMLElement
  private pendingDistrict: string | DistrictItem | null = null

  constructor(options: PortugalWorldEngineOptions) {
    this.container = options.container
    this.mode = options.mode || 'world'
    this.layersConfig = { ...DEFAULT_WORLD_LAYERS, ...options.layers }
    if (options.initialDistrict) {
      this.pendingDistrict = options.initialDistrict
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    // Initialize MapLibre WebGL instance centered on mainland Portugal
    this.map = new Map({
      container: options.container,
      style: PORTUGAL_2150_STYLE,
      center: [-7.95, 39.60], // True geographic centroid of mainland Portugal
      zoom: isMobile ? 5.5 : 6.5,
      pitch: 0, // Clean upright 2D perspective on overview
      bearing: 0,
      maxBounds: [
        [-38.0, 28.0], // Generous non-clamping bounds covering Atlantic, Azores, Madeira & Portugal
        [4.0, 46.0],
      ],
      attributionControl: false,
    })

    this.camera = new WorldCamera(this.map)
    this.districtLayer = new DistrictLayer(this.map)
    this.cityLayer = new CityLayer(this.map)
    this.arenaLayer = new ArenaLayer(this.map)
    this.landmarkLayer = new LandmarkLayer(this.map)
    this.eventLayer = new EventLayer(this.map)
    this.playerLayer = new PlayerLayer(this.map)

    this.interaction = new WorldInteraction(
      this.map,
      this.districtLayer,
      options.callbacks || {}
    )

    const notifyReady = (force = false) => {
      if (this.isLoaded || !this.map) return
      if (!force && !this.map.getStyle()) return
      this.isLoaded = true

      try {
        // Ensure map canvas dimensions match DOM container precisely before calculating bounds
        this.map.resize()

        this.initLayers()
        this.interaction.bindEvents()

        if (this.pendingDistrict) {
          const target = this.pendingDistrict
          this.pendingDistrict = null
          this.selectDistrict(target)
        } else {
          // ALWAYS fit sector on initial load (defaults to 'continente')
          const initialSector = options.initialSector || 'continente'
          this.camera.fitSector(initialSector, { animate: false })
        }
      } catch (loadErr) {
        console.warn('[PortugalWorldEngine] Erro durante o evento on(load):', loadErr)
      } finally {
        if (options.callbacks?.onReady) {
          options.callbacks.onReady()
        }
      }
    }

    this.map.on('load', () => notifyReady())
    this.map.on('styledata', () => notifyReady())
    this.map.on('idle', () => notifyReady())
    this.map.on('render', () => {
      if (!this.isLoaded && this.map.getStyle()) {
        notifyReady()
      }
    })

    // Polling safety interval
    const checkInterval = setInterval(() => {
      if (this.isLoaded) {
        clearInterval(checkInterval)
        return
      }
      if (this.map && this.map.getStyle()) {
        clearInterval(checkInterval)
        notifyReady()
      }
    }, 200)

    // Absolute fallback: after 2.5s, force ready state
    setTimeout(() => {
      clearInterval(checkInterval)
      if (!this.isLoaded && this.map) {
        notifyReady(true)
      }
    }, 2500)
  }

  private initLayers() {
    // 1. National Connections & River Veins
    if (!this.map.getSource('source-connections')) {
      this.map.addSource('source-connections', {
        type: 'geojson',
        data: getConnectionsGeoJSON(),
      })
    }
    if (!this.map.getLayer('connections-glow')) {
      this.map.addLayer({
        id: 'connections-glow',
        type: 'line',
        source: 'source-connections',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.5,
          'line-blur': 2,
          'line-opacity': 0.35,
        },
      })
    }
    if (!this.map.getLayer('connections-line')) {
      this.map.addLayer({
        id: 'connections-line',
        type: 'line',
        source: 'source-connections',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.2,
          'line-opacity': 0.7,
        },
      })
    }

    // 2. Initialize Game Content Layers
    this.districtLayer.init()
    this.cityLayer.init()
    this.arenaLayer.init()
    this.landmarkLayer.init()
    this.eventLayer.init()
    this.playerLayer.init()

    this.applyLayersConfig()
    this.applyMode(this.mode)
  }

  public setMode(mode: WorldMapMode) {
    this.mode = mode
    if (this.isLoaded) {
      this.applyMode(mode)
    }
  }

  private applyMode(mode: WorldMapMode) {
    if (mode === 'ranking') {
      this.playerLayer.setVisible(true)
      this.arenaLayer.setVisible(false)
      this.eventLayer.setVisible(false)
    } else if (mode === 'arena') {
      this.arenaLayer.setVisible(true)
      this.cityLayer.setVisible(false)
      this.landmarkLayer.setVisible(false)
      this.playerLayer.setVisible(false)
    } else if (mode === 'district') {
      this.districtLayer.setVisible(true)
      this.arenaLayer.setVisible(true)
      this.cityLayer.setVisible(true)
    } else {
      // 'world' default
      this.applyLayersConfig()
    }
  }

  public setLayers(layers: Partial<WorldLayersConfig>) {
    this.layersConfig = { ...this.layersConfig, ...layers }
    if (this.isLoaded) {
      this.applyLayersConfig()
    }
  }

  private applyLayersConfig() {
    if (!this.map || !this.map.getStyle()) return
    try {
      this.districtLayer.setTerritoriosVisible(this.layersConfig.territorios)
      this.districtLayer.setFronteirasVisible(this.layersConfig.fronteiras)
      this.districtLayer.setNomesVisible(this.layersConfig.nomes)
      this.districtLayer.setJogadoresOnlineVisible(this.layersConfig.jogadoresOnline)
      this.districtLayer.setAtividadeVisible(this.layersConfig.atividade)

      this.cityLayer.setVisible(this.layersConfig.cidades)
      this.arenaLayer.setVisible(this.layersConfig.arenas)
      this.landmarkLayer.setVisible(this.layersConfig.landmarks)
      this.eventLayer.setVisible(this.layersConfig.eventos)
      this.playerLayer.setVisible(this.layersConfig.ranking)

      const connVal = this.layersConfig.conexoes ? 'visible' : 'none'
      if (this.map.getLayer('connections-glow')) this.map.setLayoutProperty('connections-glow', 'visibility', connVal)
      if (this.map.getLayer('connections-line')) this.map.setLayoutProperty('connections-line', 'visibility', connVal)
    } catch (err) {
      console.warn('[PortugalWorldEngine] Erro em applyLayersConfig:', err)
    }
  }

  public updateOnlinePresence(districtCounts: Record<string, number>) {
    if (!this.isLoaded || !this.map || !this.map.getStyle()) return
    this.districtLayer.updateOnlinePresence(districtCounts)
  }

  public selectDistrict(districtQuery: string | DistrictItem | null) {
    if (!this.isLoaded || !this.map || !this.map.getStyle()) {
      this.pendingDistrict = districtQuery
      return
    }

    try {
      if (!districtQuery) {
        this.districtLayer.setSelected(null)
        return
      }

      const item = typeof districtQuery === 'string' ? getDistrict(districtQuery) : districtQuery
      if (!item) return

      // Use assigned numeric ID (1-based index)
      const numericId = item.numericId || DISTRICTS_LIST.findIndex((d) => d.id === item.id) + 1
      if (numericId > 0) {
        this.districtLayer.setSelected(numericId)
      }
      this.camera.focusDistrict(item, 850)
    } catch (err) {
      console.warn('[PortugalWorldEngine] Erro em selectDistrict:', err)
    }
  }

  public updateCallbacks(callbacks: WorldEngineCallbacks) {
    this.interaction.updateCallbacks(callbacks)
  }

  public resize() {
    try {
      if (this.map) {
        this.map.resize()
      }
    } catch (err) {
      console.warn('[PortugalWorldEngine] Erro em resize:', err)
    }
  }

  public destroy() {
    this.isLoaded = false
    try {
      if (this.map) {
        this.map.remove()
      }
    } catch (err) {
      console.warn('[PortugalWorldEngine] Erro em destroy:', err)
    }
  }
}
