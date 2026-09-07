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
// Zero external token needed, open-source accelerated tiles
const PORTUGAL_2150_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark-basemap': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#020617', // Deep Atlantic Oceanic Blue
      },
    },
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark-basemap',
      paint: {
        'raster-opacity': 0.68,
        'raster-contrast': 0.15,
        'raster-brightness-min': 0.05,
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

  constructor(options: PortugalWorldEngineOptions) {
    this.container = options.container
    this.mode = options.mode || 'world'
    this.layersConfig = { ...DEFAULT_WORLD_LAYERS, ...options.layers }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    // Initialize MapLibre WebGL instance
    this.map = new Map({
      container: options.container,
      style: PORTUGAL_2150_STYLE,
      center: [-8.2245, 39.55],
      zoom: isMobile ? 5.3 : 6.3,
      pitch: 35,
      bearing: -4,
      maxBounds: [
        [-34.0, 31.0], // West/South bounds covering Azores & Madeira
        [-4.5, 43.5],  // East/North bounds covering Portugal and borders
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

    this.map.on('load', () => {
      this.isLoaded = true
      this.initLayers()
      this.interaction.bindEvents()

      if (options.initialDistrict) {
        this.selectDistrict(options.initialDistrict)
      } else if (options.initialSector && options.initialSector !== 'continente') {
        this.camera.goToSector(options.initialSector, 500)
      }

      if (options.callbacks?.onReady) {
        options.callbacks.onReady()
      }
    })
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
    this.districtLayer.setVisible(this.layersConfig.territorios)
    this.cityLayer.setVisible(this.layersConfig.cidades)
    this.arenaLayer.setVisible(this.layersConfig.arenas)
    this.landmarkLayer.setVisible(this.layersConfig.landmarks)
    this.eventLayer.setVisible(this.layersConfig.eventos)
    this.playerLayer.setVisible(this.layersConfig.ranking)

    const connVal = this.layersConfig.conexoes ? 'visible' : 'none'
    if (this.map.getLayer('connections-glow')) this.map.setLayoutProperty('connections-glow', 'visibility', connVal)
    if (this.map.getLayer('connections-line')) this.map.setLayoutProperty('connections-line', 'visibility', connVal)
  }

  public selectDistrict(districtQuery: string | DistrictItem | null) {
    if (!districtQuery) {
      this.districtLayer.setSelected(null)
      return
    }

    const item = typeof districtQuery === 'string' ? getDistrict(districtQuery) : districtQuery
    if (!item) return

    // Find numeric ID (1-based index)
    const numericId = DISTRICTS_LIST.findIndex((d) => d.id === item.id) + 1
    if (numericId > 0) {
      this.districtLayer.setSelected(numericId)
    }
    this.camera.focusDistrict(item, 850)
  }

  public updateCallbacks(callbacks: WorldEngineCallbacks) {
    this.interaction.updateCallbacks(callbacks)
  }

  public resize() {
    if (this.map) {
      this.map.resize()
    }
  }

  public destroy() {
    if (this.map) {
      this.map.remove()
    }
  }
}
