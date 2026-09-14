import { Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import mainlandGeoJSONRaw from '@/src/data/maps/portugal-districts.json'
import azoresGeoJSONRaw from '@/src/data/maps/azores-islands.json'
import madeiraGeoJSONRaw from '@/src/data/maps/madeira-islands.json'
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import type { PortugalVivoDistrict, ResolvedPlayerPin } from '@/src/hooks/usePortugalVivoData'
import { PORTUGAL_CONCELHOS_COORDS } from '@/src/data/concelhos-coords'

export type MapSector = 'continente' | 'acores' | 'madeira'

export interface MapLayersState {
  satellite: boolean
  terrain: boolean
  roads: boolean
  cities: boolean
  districts: boolean
  players: boolean
  hotspots: boolean
}

export const DEFAULT_MAP_LAYERS: MapLayersState = {
  satellite: true,
  terrain: false,
  roads: true,
  cities: true,
  districts: true,
  players: true,
  hotspots: true,
}

// Bounding boxes geográficas rigorosas para enquadramento perfeito
export const SECTOR_BOUNDS: Record<MapSector, [[number, number], [number, number]]> = {
  continente: [
    [-9.70, 36.85], // SW (Cabo de São Vicente / Sagres)
    [-6.10, 42.25], // NE (Miranda do Douro / Melgaço)
  ],
  acores: [
    [-31.45, 36.85], // SW (Corvo e Flores)
    [-24.95, 39.85], // NE (Santa Maria e São Miguel)
  ],
  madeira: [
    [-17.35, 32.55], // SW (Ponta do Pargo)
    [-16.25, 33.20], // NE (Porto Santo)
  ],
}

// Unificação de todos os territórios (18 distritos continentais + 9 ilhas dos Açores + 2 da Madeira)
const UNIFIED_TERRITORIES: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    ...((mainlandGeoJSONRaw as any).features || []),
    ...((azoresGeoJSONRaw as any).features || []),
    ...((madeiraGeoJSONRaw as any).features || []),
  ],
}

// Concelhos canónicos oficiais (307 concelhos) para nível de zoom progressivo
const CONCELHOS_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: Object.entries(PORTUGAL_CONCELHOS_COORDS).map(([id, info], idx) => ({
    type: 'Feature',
    id: idx + 1000,
    geometry: {
      type: 'Point',
      coordinates: info.coordinates,
    },
    properties: {
      id,
      name: info.name,
      district: info.district,
    },
  })),
}

// Estilo geográfico natural e tecnológico satellite-first (100% legal, estável, sem tokens)
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'satellite-base': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar',
      maxzoom: 19,
    },
    'roads-overlay': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
    'places-overlay': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#020914', // Abismo oceânico atlântico
      },
    },
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-base',
      paint: {
        'raster-opacity': 0.88,
        'raster-contrast': 0.12,
        'raster-fade-duration': 250,
      },
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'roads-layer',
      type: 'raster',
      source: 'roads-overlay',
      paint: {
        'raster-opacity': 0.35,
      },
      minzoom: 8,
      maxzoom: 20,
    },
    {
      id: 'places-layer',
      type: 'raster',
      source: 'places-overlay',
      paint: {
        'raster-opacity': 0.55,
      },
      minzoom: 9,
      maxzoom: 20,
    },
  ],
}

export interface PortugalSatelliteEngineOptions {
  container: HTMLElement
  initialSector?: MapSector
  initialDistrictId?: string
  layers?: Partial<MapLayersState>
  onSelectDistrict?: (district: PortugalVivoDistrict | null) => void
  onHoverDistrict?: (district: PortugalVivoDistrict | null) => void
  onSelectPlayer?: (player: ResolvedPlayerPin | null) => void
  onSectorChange?: (sector: MapSector) => void
  onReady?: () => void
}

export class PortugalSatelliteEngine {
  public map: MapLibreMap
  private container: HTMLElement
  private isLoaded = false
  private currentSector: MapSector = 'continente'
  private selectedDistrictId: string | null = null
  private hoveredDistrictId: string | null = null
  private layersState: MapLayersState
  private districtsData: PortugalVivoDistrict[] = []
  private districtMap = new Map<string, PortugalVivoDistrict>()
  private playersData: ResolvedPlayerPin[] = []
  private playersMap = new Map<string, ResolvedPlayerPin>()
  private callbacks: PortugalSatelliteEngineOptions

  private pendingDistrictsData: PortugalVivoDistrict[] | null = null
  private pendingPlayersData: ResolvedPlayerPin[] | null = null

  constructor(options: PortugalSatelliteEngineOptions) {
    this.container = options.container
    this.callbacks = options
    this.layersState = { ...DEFAULT_MAP_LAYERS, ...options.layers }
    this.currentSector = options.initialSector || 'continente'

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    this.map = new MapLibreMap({
      container: options.container,
      style: SATELLITE_STYLE,
      center: [-8.2245, 39.50], // Centro de Portugal
      zoom: isMobile ? 5.8 : 6.7,
      pitch: 0,
      bearing: 0,
      maxBounds: [
        [-36.0, 30.0],
        [-3.0, 44.0],
      ],
      attributionControl: false,
    })

    this.map.once('load', () => {
      this.isLoaded = true
      this.initVectorLayers()
      this.bindEvents()

      // Aplicar dados pendentes que tenham chegado antes do mapa carregar
      if (this.pendingDistrictsData) {
        this.updateData(this.pendingDistrictsData)
        this.pendingDistrictsData = null
      }
      if (this.pendingPlayersData) {
        this.updatePlayers(this.pendingPlayersData)
        this.pendingPlayersData = null
      }

      if (options.initialDistrictId) {
        this.selectDistrictById(options.initialDistrictId)
      } else {
        this.fitSector(this.currentSector, { animate: false })
      }

      if (options.onReady) {
        options.onReady()
      }
    })
  }

  // =========================================================
  // 1. CAMADAS VETORIAIS: DISTRITOS, ILHAS, CONCELHOS E JOGADORES
  // =========================================================
  private initVectorLayers() {
    if (!this.map || !this.map.getStyle()) return

    // 1.1. Fonte Unificada de Territórios (Continente + Açores + Madeira)
    if (!this.map.getSource('territories-source')) {
      this.map.addSource('territories-source', {
        type: 'geojson',
        data: UNIFIED_TERRITORIES,
        generateId: true,
      })
    }

    // Preenchimento subtil de distrito / ilha com relevo e distinção
    if (!this.map.getLayer('districts-fill')) {
      this.map.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'territories-source',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#f59e0b', // Dourado radiante na seleção
            ['boolean', ['feature-state', 'hover'], false],
            '#38bdf8', // Ciano luminoso no hover
            ['boolean', ['feature-state', 'hasOnline'], false],
            '#10b981', // Verde esmeralda vivo com jogadores
            '#064e3b', // Base esmeralda profunda
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.38,
            ['boolean', ['feature-state', 'hover'], false],
            0.28,
            ['boolean', ['feature-state', 'hasOnline'], false],
            0.22,
            0.14,
          ],
        },
      })
    }

    // Glow de fronteira de distrito / ilha
    if (!this.map.getLayer('districts-glow')) {
      this.map.addLayer({
        id: 'districts-glow',
        type: 'line',
        source: 'territories-source',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#fbbf24',
            ['boolean', ['feature-state', 'hover'], false],
            '#00e5ff',
            '#10b981',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            6,
            ['boolean', ['feature-state', 'hover'], false],
            4.5,
            2.5,
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.6,
            ['boolean', ['feature-state', 'hover'], false],
            0.4,
            0.25,
          ],
          'line-blur': 2.5,
        },
      })
    }

    // Limites de distritos nítidos
    if (!this.map.getLayer('districts-line')) {
      this.map.addLayer({
        id: 'districts-line',
        type: 'line',
        source: 'territories-source',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#fef08a',
            ['boolean', ['feature-state', 'hover'], false],
            '#ffffff',
            '#34d399',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            2.8,
            ['boolean', ['feature-state', 'hover'], false],
            2.2,
            1.4,
          ],
          'line-opacity': 0.95,
        },
      })
    }

    // Nomes dos 18 Distritos e Ilhas Principais (Zoom Nacional)
    if (!this.map.getLayer('districts-label')) {
      this.map.addLayer({
        id: 'districts-label',
        type: 'symbol',
        source: 'territories-source',
        maxzoom: 8.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5.5, 9.5,
            7.5, 12,
            8.5, 13,
          ],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.12,
          'text-optional': true,
        },
        paint: {
          'text-color': '#f8fafc',
          'text-halo-color': '#020617',
          'text-halo-width': 2.5,
        },
      })
    }

    // 1.2. Camada dos 307 Concelhos (Zoom Intermédio e Aproximado: zoom >= 8.5)
    if (!this.map.getSource('concelhos-source')) {
      this.map.addSource('concelhos-source', {
        type: 'geojson',
        data: CONCELHOS_GEOJSON,
      })
    }

    if (!this.map.getLayer('concelhos-dot')) {
      this.map.addLayer({
        id: 'concelhos-dot',
        type: 'circle',
        source: 'concelhos-source',
        minzoom: 8.5,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.5, 2,
            11, 3.5,
            14, 5,
          ],
          'circle-color': '#38bdf8',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        },
      })
    }

    if (!this.map.getLayer('concelhos-label')) {
      this.map.addLayer({
        id: 'concelhos-label',
        type: 'symbol',
        source: 'concelhos-source',
        minzoom: 8.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.5, 9,
            10.5, 11,
            13, 13,
          ],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true, // Esconde sobreposições automaticamente para manter o mapa limpo
          'text-padding': 6,
        },
        paint: {
          'text-color': '#e2e8f0',
          'text-halo-color': '#020617',
          'text-halo-width': 2,
        },
      })
    }

    // 1.3. Fonte e Camadas de Jogadores Reais com Clustering Automático
    if (!this.map.getSource('players-source')) {
      this.map.addSource('players-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 36,
      })
    }

    // Clusters: Glow
    if (!this.map.getLayer('players-clusters-glow')) {
      this.map.addLayer({
        id: 'players-clusters-glow',
        type: 'circle',
        source: 'players-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'point_count'], 4],
            '#f59e0b',
            '#10b981',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 3, 26, 8, 32],
          'circle-opacity': 0.40,
          'circle-blur': 0.75,
        },
      })
    }

    // Clusters: Núcleo
    if (!this.map.getLayer('players-clusters-core')) {
      this.map.addLayer({
        id: 'players-clusters-core',
        type: 'circle',
        source: 'players-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'point_count'], 4],
            '#d97706',
            '#059669',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 14, 3, 18, 8, 22],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.96,
        },
      })
    }

    // Clusters: Texto com número de jogadores
    if (!this.map.getLayer('players-clusters-count')) {
      this.map.addLayer({
        id: 'players-clusters-count',
        type: 'symbol',
        source: 'players-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['concat', '● ', '{point_count_abbreviated}'],
          'text-size': 11.5,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })
    }

    // Jogadores Individuais: Halo Animado
    if (!this.map.getLayer('players-unclustered-halo')) {
      this.map.addLayer({
        id: 'players-unclustered-halo',
        type: 'circle',
        source: 'players-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            24,
            17,
          ],
          'circle-color': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            '#00e5ff',
            '#10b981',
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            0.55,
            0.35,
          ],
          'circle-blur': 0.8,
        },
      })
    }

    // Jogadores Individuais: Ponto Central Nítido
    if (!this.map.getLayer('players-unclustered-core')) {
      this.map.addLayer({
        id: 'players-unclustered-core',
        type: 'circle',
        source: 'players-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            8.5,
            6.5,
          ],
          'circle-color': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            '#00e5ff',
            '#10b981',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1.0,
        },
      })
    }

    // Jogadores Individuais: Etiqueta de Identificação
    if (!this.map.getLayer('players-unclustered-label')) {
      this.map.addLayer({
        id: 'players-unclustered-label',
        type: 'symbol',
        source: 'players-source',
        minzoom: 5.0,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            ['concat', '📍 VOCÊ (Nv. ', ['to-string', ['get', 'level']], ')'],
            ['concat', '● ', ['get', 'displayName'], ' (Nv. ', ['to-string', ['get', 'level']], ')'],
          ],
          'text-size': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            11,
            9.5,
          ],
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            '#38bdf8',
            '#f8fafc',
          ],
          'text-halo-color': '#020617',
          'text-halo-width': 2.5,
        },
      })
    }
  }

  // =========================================================
  // 2. ATUALIZAÇÃO REATIVA DE DADOS EM TEMPO REAL
  // =========================================================
  public updateData(
    districts: PortugalVivoDistrict[],
    _confrontations?: any[],
    players?: ResolvedPlayerPin[],
    _events?: any[]
  ) {
    this.districtsData = districts
    this.districtMap.clear()
    for (const d of districts) {
      this.districtMap.set(d.id.toLowerCase(), d)
      this.districtMap.set(d.slug.toLowerCase(), d)
      this.districtMap.set(d.name.toLowerCase(), d)
      this.districtMap.set(d.canonicalName.toLowerCase(), d)
    }

    if (players) {
      this.updatePlayers(players)
    }

    if (!this.isLoaded || !this.map || !this.map.getSource('territories-source')) {
      this.pendingDistrictsData = districts
      return
    }

    // Atualizar estados dos 29 territórios (seleção, hover, jogadores online)
    UNIFIED_TERRITORIES.features.forEach((feat, idx) => {
      const p = feat.properties || {}
      const dId = (p.id || '').toString().toLowerCase()
      const dName = (p.name || '').toString().toLowerCase()
      const district = this.districtMap.get(dId) || this.districtMap.get(dName)

      if (district) {
        const isSelected = this.selectedDistrictId === district.id
        const isHovered = this.hoveredDistrictId === district.id
        const hasOnline = district.onlineNow > 0

        this.map.setFeatureState(
          { source: 'territories-source', id: idx },
          {
            selected: isSelected,
            hover: isHovered,
            hasOnline,
            onlineCount: district.onlineNow,
          }
        )
      }
    })
  }

  // Atualizar Marcadores dos Jogadores em Tempo Real
  public updatePlayers(players: ResolvedPlayerPin[]) {
    this.playersData = players
    this.playersMap.clear()
    for (const p of players) {
      this.playersMap.set(p.userId, p)
    }

    if (!this.isLoaded || !this.map) {
      this.pendingPlayersData = players
      return
    }

    const playerFeatures: Feature<Geometry>[] = players.map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: p.coords,
      },
      properties: {
        userId: p.userId,
        displayName: p.displayName,
        photoURL: p.photoURL || p.avatar || '',
        district: p.district,
        city: p.city || '',
        level: p.level,
        xp: p.xp || 0,
        activity: p.activity,
        locationSource: p.locationSource,
        accuracy: p.accuracy,
        isCurrentUser: p.isCurrentUser,
      },
    }))

    const playersSource = this.map.getSource('players-source') as any
    if (playersSource && playersSource.setData) {
      playersSource.setData({
        type: 'FeatureCollection',
        features: playerFeatures,
      })
    }
  }

  // =========================================================
  // 3. NAVEGAÇÃO, ENQUADRAMENTOS E CÂMARA CINEMÁTICA
  // =========================================================
  public fitSector(sector: MapSector, options?: { animate?: boolean; duration?: number }) {
    if (!this.map) return
    this.currentSector = sector
    const bounds = SECTOR_BOUNDS[sector] || SECTOR_BOUNDS.continente
    const animate = options?.animate ?? true
    const duration = animate ? (options?.duration ?? 1100) : 0

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const pad = isMobile
      ? { top: 75, bottom: 85, left: 16, right: 16 }
      : { top: 85, bottom: 85, left: 50, right: 50 }

    try {
      this.map.fitBounds(bounds, {
        padding: pad,
        duration,
        pitch: 0,
        bearing: 0,
        essential: true,
      })
      if (this.callbacks.onSectorChange) {
        this.callbacks.onSectorChange(sector)
      }
    } catch (e) {
      console.warn('[PortugalSatelliteEngine] fitBounds falhou:', e)
    }
  }

  public focusDistrict(district: PortugalVivoDistrict, options?: { duration?: number }) {
    if (!this.map || !district) return
    this.selectedDistrictId = district.id

    const duration = options?.duration ?? 1100
    const width = this.container.clientWidth || window.innerWidth
    const height = this.container.clientHeight || window.innerHeight
    const isMobilePortrait = width < 640 && height > width

    const padding = isMobilePortrait
      ? { top: 80, bottom: Math.round(height * 0.38), left: 24, right: 24 }
      : { top: 80, bottom: 80, left: Math.round(width * 0.28), right: 60 }

    try {
      this.map.fitBounds(
        [district.bounds.southWest, district.bounds.northEast],
        {
          padding,
          duration,
          pitch: isMobilePortrait ? 15 : 20,
          bearing: 0,
          essential: true,
        }
      )
    } catch (e) {
      console.warn('[PortugalSatelliteEngine] focusDistrict falhou:', e)
    }

    this.updateData(this.districtsData)
  }

  public selectDistrictById(idOrSlug: string) {
    const d = this.districtMap.get(idOrSlug.toLowerCase())
    if (d) {
      this.focusDistrict(d)
      if (this.callbacks.onSelectDistrict) {
        this.callbacks.onSelectDistrict(d)
      }
    }
  }

  public clearSelection() {
    this.selectedDistrictId = null
    this.hoveredDistrictId = null
    this.fitSector(this.currentSector, { duration: 900 })
    if (this.callbacks.onSelectDistrict) {
      this.callbacks.onSelectDistrict(null)
    }
  }

  public locateUser(coords: [number, number], zoom = 14) {
    if (!this.map) return
    this.map.flyTo({
      center: coords,
      zoom,
      duration: 1300,
      pitch: 15,
      essential: true,
    })
  }

  public toggle3D() {
    if (!this.map) return
    const currentPitch = this.map.getPitch()
    const targetPitch = currentPitch > 15 ? 0 : 45
    this.map.easeTo({
      pitch: targetPitch,
      duration: 750,
    })
  }

  public zoomIn() {
    if (this.map) this.map.zoomIn({ duration: 250 })
  }

  public zoomOut() {
    if (this.map) this.map.zoomOut({ duration: 250 })
  }

  public triggerTerritorialScan(onComplete?: () => void) {
    if (!this.map) return
    const currentBearing = this.map.getBearing()
    const currentPitch = this.map.getPitch()

    this.map.easeTo({
      pitch: Math.min(40, currentPitch + 12),
      bearing: currentBearing + 5,
      duration: 800,
    })

    setTimeout(() => {
      this.map.easeTo({
        pitch: currentPitch,
        bearing: currentBearing,
        duration: 700,
      })
      if (onComplete) onComplete()
    }, 900)
  }

  // =========================================================
  // 4. EVENTOS DE RATO E TOQUE
  // =========================================================
  private bindEvents() {
    // Hover em Distritos
    this.map.on('mousemove', 'districts-fill', (e) => {
      if (e.features && e.features.length > 0) {
        this.map.getCanvas().style.cursor = 'pointer'
        const feat = e.features[0]
        const p = feat.properties || {}
        const dId = (p.id || '').toString().toLowerCase()
        const dName = (p.name || '').toString().toLowerCase()
        const district = this.districtMap.get(dId) || this.districtMap.get(dName) || null

        if (district && this.hoveredDistrictId !== district.id) {
          this.hoveredDistrictId = district.id
          if (this.callbacks.onHoverDistrict) {
            this.callbacks.onHoverDistrict(district)
          }
        }
      }
    })

    this.map.on('mouseleave', 'districts-fill', () => {
      this.map.getCanvas().style.cursor = ''
      if (this.hoveredDistrictId !== null) {
        this.hoveredDistrictId = null
        if (this.callbacks.onHoverDistrict) {
          this.callbacks.onHoverDistrict(null)
        }
      }
    })

    // Clique em Distrito / Ilha
    this.map.on('click', 'districts-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const feat = e.features[0]
        const p = feat.properties || {}
        const dId = (p.id || '').toString().toLowerCase()
        const dName = (p.name || '').toString().toLowerCase()
        const district = this.districtMap.get(dId) || this.districtMap.get(dName)

        if (district) {
          this.focusDistrict(district)
          if (this.callbacks.onSelectDistrict) {
            this.callbacks.onSelectDistrict(district)
          }
        }
      }
    })

    // Clique em Clusters de Jogadores — Expande suavemente
    this.map.on('click', 'players-clusters-core', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['players-clusters-core'] })
      if (!features.length) return
      const clusterId = features[0].properties.cluster_id
      const source = this.map.getSource('players-source') as any
      if (source && source.getClusterExpansionZoom) {
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return
          const coords = (features[0].geometry as any).coordinates
          this.map.easeTo({
            center: coords,
            zoom: Math.min(zoom + 0.8, 14),
            duration: 650,
          })
        })
      }
    })

    this.map.on('mouseenter', 'players-clusters-core', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', 'players-clusters-core', () => {
      this.map.getCanvas().style.cursor = ''
    })

    // Clique em Jogador Individual — Dispara painel contextual
    this.map.on('click', 'players-unclustered-core', (e) => {
      if (e.features && e.features.length > 0) {
        const feat = e.features[0]
        const p = feat.properties || {}
        const userId = p.userId
        const player = this.playersMap.get(userId)
        if (player && this.callbacks.onSelectPlayer) {
          this.callbacks.onSelectPlayer(player)
        }
      }
    })

    this.map.on('mouseenter', 'players-unclustered-core', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', 'players-unclustered-core', () => {
      this.map.getCanvas().style.cursor = ''
    })
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
