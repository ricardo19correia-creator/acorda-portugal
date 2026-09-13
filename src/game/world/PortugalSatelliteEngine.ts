import { Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import nationalGeoJSONRaw from '@/src/data/maps/portugal-national.json'
import type { FeatureCollection } from 'geojson'
import type { PortugalVivoDistrict, ActiveConfrontation } from '@/src/hooks/usePortugalVivoData'

export type MapSector = 'continente' | 'acores' | 'madeira'

export interface MapLayersState {
  satellite: boolean
  terrain: boolean
  roads: boolean
  cities: boolean
  districts: boolean
  players: boolean
  confrontations: boolean
}

export const DEFAULT_MAP_LAYERS: MapLayersState = {
  satellite: true,
  terrain: false,
  roads: true,
  cities: true,
  districts: true,
  players: true,
  confrontations: true,
}

// Bounding boxes geográficas rigorosas
export const SECTOR_BOUNDS: Record<MapSector, [[number, number], [number, number]]> = {
  continente: [
    [-9.60, 36.92], // SW (Cabo de São Vicente / Sagres)
    [-6.15, 42.20], // NE (Miranda do Douro / Melgaço)
  ],
  acores: [
    [-31.40, 36.88], // SW (Corvo e Flores até Santa Maria)
    [-24.90, 39.80], // NE
  ],
  madeira: [
    [-17.40, 32.55], // SW (Ponta do Pargo e Desertas)
    [-16.20, 33.20], // NE (Porto Santo)
  ],
}

// Estilo geográfico natural satellite-first (100% legal, estável, sem tokens)
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
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
    'terrain-topo': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri World Topo',
      maxzoom: 18,
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
        'background-color': '#061019', // Tom oceânico profundo natural
      },
    },
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-base',
      paint: {
        'raster-opacity': 1.0,
        'raster-fade-duration': 300,
      },
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'terrain-layer',
      type: 'raster',
      source: 'terrain-topo',
      layout: {
        visibility: 'none',
      },
      paint: {
        'raster-opacity': 0.85,
        'raster-fade-duration': 300,
      },
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'roads-layer',
      type: 'raster',
      source: 'roads-overlay',
      paint: {
        'raster-opacity': 0.45, // Extremamente discreto para não sobrepor a natureza
      },
      minzoom: 6,
      maxzoom: 20,
    },
    {
      id: 'places-layer',
      type: 'raster',
      source: 'places-overlay',
      paint: {
        'raster-opacity': 0.70,
      },
      minzoom: 6,
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
  private callbacks: PortugalSatelliteEngineOptions

  private scanAnimFrame: number | null = null
  private scanRadius = 0

  constructor(options: PortugalSatelliteEngineOptions) {
    this.container = options.container
    this.callbacks = options
    this.layersState = { ...DEFAULT_MAP_LAYERS, ...options.layers }
    this.currentSector = options.initialSector || 'continente'

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    // Inicialização da instância MapLibre GL
    this.map = new MapLibreMap({
      container: options.container,
      style: SATELLITE_STYLE,
      center: [-7.95, 39.60], // Centroide geográfico de Portugal Continental
      zoom: isMobile ? 5.7 : 6.6,
      pitch: 0,
      bearing: 0,
      maxBounds: [
        [-38.0, 28.0], // Limites do Atlântico abrangendo Continente, Açores e Madeira
        [3.0, 46.0],
      ],
      attributionControl: false,
    })

    this.map.once('load', () => {
      this.isLoaded = true
      this.initVectorLayers()
      this.bindEvents()

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
  // 1. INICIALIZAÇÃO DE CAMADAS VETORIAIS GEOGRÁFICAS E GAMEPLAY
  // =========================================================
  private initVectorLayers() {
    if (!this.map || !this.map.getStyle()) return

    const geoData = nationalGeoJSONRaw as unknown as FeatureCollection

    // Fonte de polígonos de distritos
    if (!this.map.getSource('districts-source')) {
      this.map.addSource('districts-source', {
        type: 'geojson',
        data: geoData,
        generateId: true,
      })
    }

    // 1.1. Preenchimento de distrito discreto (sem cores sólidas de puzzle!)
    if (!this.map.getLayer('districts-fill')) {
      this.map.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'districts-source',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#00e5ff',
            ['boolean', ['feature-state', 'hover'], false],
            '#38bdf8',
            ['boolean', ['feature-state', 'dispute'], false],
            '#f97316',
            ['boolean', ['feature-state', 'leader'], false],
            '#f59e0b',
            '#ffffff',
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.24,
            ['boolean', ['feature-state', 'hover'], false],
            0.16,
            ['boolean', ['feature-state', 'dispute'], false],
            0.14,
            ['boolean', ['feature-state', 'leader'], false],
            0.10,
            0.02, // 98% transparente para o satélite real aparecer majestosamente!
          ],
        },
      })
    }

    // 1.2. Linha de fronteira limpa e nítida
    if (!this.map.getLayer('districts-line')) {
      this.map.addLayer({
        id: 'districts-line',
        type: 'line',
        source: 'districts-source',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#00e5ff',
            ['boolean', ['feature-state', 'hover'], false],
            '#7dd3fc',
            ['boolean', ['feature-state', 'dispute'], false],
            '#fb923c',
            ['boolean', ['feature-state', 'leader'], false],
            '#fbbf24',
            '#94a3b8',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            2.8,
            ['boolean', ['feature-state', 'hover'], false],
            2.2,
            1.2,
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1.0,
            ['boolean', ['feature-state', 'hover'], false],
            0.95,
            0.60,
          ],
        },
      })
    }

    // 1.3. Fonte e camada para Linhas de Confronto Territorial
    if (!this.map.getSource('disputes-source')) {
      this.map.addSource('disputes-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!this.map.getLayer('disputes-lines')) {
      this.map.addLayer({
        id: 'disputes-lines',
        type: 'line',
        source: 'disputes-source',
        paint: {
          'line-color': '#f97316',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.85,
        },
      })
    }

    // 1.4. Fonte e camada de Presença Real e Balizas de Atividade
    if (!this.map.getSource('presence-source')) {
      this.map.addSource('presence-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    // Halo subtil de presença humana ativa
    if (!this.map.getLayer('presence-halo')) {
      this.map.addLayer({
        id: 'presence-halo',
        type: 'circle',
        source: 'presence-source',
        paint: {
          'circle-radius': ['get', 'radiusHalo'],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.20,
          'circle-blur': 0.8,
        },
      })
    }

    // Ponto central nítido de atividade
    if (!this.map.getLayer('presence-beacon')) {
      this.map.addLayer({
        id: 'presence-beacon',
        type: 'circle',
        source: 'presence-source',
        paint: {
          'circle-radius': ['get', 'radiusDot'],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.90,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      })
    }
  }

  // =========================================================
  // 2. ATUALIZAÇÃO DE DADOS EM TEMPO REAL
  // =========================================================
  public updateData(districts: PortugalVivoDistrict[], confrontations: ActiveConfrontation[]) {
    this.districtsData = districts
    this.districtMap.clear()
    for (const d of districts) {
      this.districtMap.set(d.id.toLowerCase(), d)
      this.districtMap.set(d.slug.toLowerCase(), d)
      this.districtMap.set(d.name.toLowerCase(), d)
      this.districtMap.set(d.canonicalName.toLowerCase(), d)
    }

    if (!this.isLoaded || !this.map || !this.map.getSource('districts-source')) return

    // 2.1. Atualizar feature states dos distritos (seleção, líder, disputa, hover)
    const geoData = nationalGeoJSONRaw as unknown as FeatureCollection
    geoData.features.forEach((feat, idx) => {
      const p = feat.properties || {}
      const dId = (p.id || '').toString().toLowerCase()
      const dName = (p.name || '').toString().toLowerCase()
      const district = this.districtMap.get(dId) || this.districtMap.get(dName)

      if (district) {
        const isSelected = this.selectedDistrictId === district.id
        const isHovered = this.hoveredDistrictId === district.id
        const isLeader = district.isLeader
        const inDispute = Boolean(district.inDisputeWith)

        this.map.setFeatureState(
          { source: 'districts-source', id: idx },
          {
            selected: isSelected,
            hover: isHovered,
            leader: isLeader,
            dispute: inDispute,
            online: district.onlineNow,
          }
        )
      }
    })

    // 2.2. Atualizar Geometria de Confrontos (Linhas que unem distritos em duelo)
    const disputeFeatures = confrontations.map((c) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [c.centerA, c.centerB],
      },
      properties: {
        id: c.id,
        districtA: c.districtA,
        districtB: c.districtB,
      },
    }))

    const disputeSource = this.map.getSource('disputes-source') as any
    if (disputeSource && disputeSource.setData) {
      disputeSource.setData({
        type: 'FeatureCollection',
        features: disputeFeatures,
      })
    }

    // 2.3. Atualizar Balizas de Presença Real (Apenas onde existem jogadores reais online)
    const presenceFeatures = districts
      .filter((d) => d.onlineNow > 0 || d.isLeader)
      .map((d) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: d.center,
        },
        properties: {
          id: d.id,
          name: d.name,
          online: d.onlineNow,
          isLeader: d.isLeader,
          color: d.isLeader ? '#f59e0b' : '#10b981',
          radiusDot: d.isLeader ? 6 : Math.min(10, 4 + d.onlineNow * 1.5),
          radiusHalo: d.isLeader ? 18 : Math.min(26, 12 + d.onlineNow * 2.5),
        },
      }))

    const presenceSource = this.map.getSource('presence-source') as any
    if (presenceSource && presenceSource.setData) {
      presenceSource.setData({
        type: 'FeatureCollection',
        features: presenceFeatures,
      })
    }
  }

  // =========================================================
  // 3. NAVEGAÇÃO E CÂMARA CINEMÁTICA INTELIGENTE
  // =========================================================
  public fitSector(sector: MapSector, options?: { animate?: boolean; duration?: number }) {
    if (!this.map) return
    this.currentSector = sector
    const bounds = SECTOR_BOUNDS[sector] || SECTOR_BOUNDS.continente
    const animate = options?.animate ?? true
    const duration = animate ? (options?.duration ?? 1100) : 0

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const pad = isMobile
      ? { top: 80, bottom: 90, left: 16, right: 16 }
      : { top: 90, bottom: 90, left: 60, right: 60 }

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

    const duration = options?.duration ?? 1200
    const width = this.container.clientWidth || window.innerWidth
    const height = this.container.clientHeight || window.innerHeight

    const isMobilePortrait = width < 640 && height > width
    const isLandscape = height < 520 && width > height

    // Offset de câmara anti-obstrução: o distrito nunca é coberto pelo painel
    let padding = { top: 60, bottom: 60, left: 60, right: 60 }

    if (isMobilePortrait) {
      // No telemóvel, o painel ocupa a parte inferior (~35% do ecrã).
      // Aumentamos o bottom padding para empurrar o distrito para a metade superior limpa!
      padding = {
        top: 80,
        bottom: Math.round(height * 0.42),
        left: 24,
        right: 24,
      }
    } else if (isLandscape) {
      // Em landscape o painel fica à direita
      padding = {
        top: 60,
        bottom: 60,
        left: 40,
        right: Math.round(width * 0.38),
      }
    } else {
      // Desktop: painel lateral à esquerda ou direita
      padding = {
        top: 80,
        bottom: 80,
        left: Math.round(width * 0.28),
        right: 60,
      }
    }

    try {
      this.map.fitBounds(
        [district.bounds.southWest, district.bounds.northEast],
        {
          padding,
          duration,
          pitch: isMobilePortrait ? 15 : 25, // Perspectiva ligeiramente inclinada elegante
          bearing: 0,
          essential: true,
        }
      )
    } catch (e) {
      console.warn('[PortugalSatelliteEngine] focusDistrict falhou:', e)
    }

    this.updateData(this.districtsData, [])
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

  // =========================================================
  // 4. MODO ORBITAL 3D & CONTROLO DE CÂMARA
  // =========================================================
  public toggle3D() {
    if (!this.map) return
    const currentPitch = this.map.getPitch()
    const targetPitch = currentPitch > 15 ? 0 : 50
    this.map.easeTo({
      pitch: targetPitch,
      duration: 800,
    })
  }

  public zoomIn() {
    this.map.zoomIn({ duration: 300 })
  }

  public zoomOut() {
    this.map.zoomOut({ duration: 300 })
  }

  // =========================================================
  // 5. SCAN TERRITORIAL (Varredura de Observação)
  // =========================================================
  public triggerTerritorialScan(onComplete?: () => void) {
    if (!this.map) return

    // Varredura de satélite: suave rotação e pitch dinâmico que destaca focos de poder
    const currentBearing = this.map.getBearing()
    const currentPitch = this.map.getPitch()

    this.map.easeTo({
      pitch: Math.min(45, currentPitch + 15),
      bearing: currentBearing + 6,
      duration: 1000,
    })

    setTimeout(() => {
      this.map.easeTo({
        pitch: currentPitch,
        bearing: currentBearing,
        duration: 900,
      })
      if (onComplete) onComplete()
    }, 1200)
  }

  // =========================================================
  // 6. CONTROLO DE CAMADAS
  // =========================================================
  public setLayerVisibility(key: keyof MapLayersState, visible: boolean) {
    this.layersState[key] = visible
    if (!this.map || !this.map.getStyle()) return

    if (key === 'satellite') {
      this.map.setLayoutProperty('satellite-layer', 'visibility', visible ? 'visible' : 'none')
    } else if (key === 'terrain') {
      this.map.setLayoutProperty('terrain-layer', 'visibility', visible ? 'visible' : 'none')
    } else if (key === 'roads') {
      this.map.setLayoutProperty('roads-layer', 'visibility', visible ? 'visible' : 'none')
    } else if (key === 'cities') {
      this.map.setLayoutProperty('places-layer', 'visibility', visible ? 'visible' : 'none')
    } else if (key === 'districts') {
      this.map.setLayoutProperty('districts-line', 'visibility', visible ? 'visible' : 'none')
      this.map.setLayoutProperty('districts-fill', 'visibility', visible ? 'visible' : 'none')
    } else if (key === 'players') {
      this.map.setLayoutProperty('presence-beacon', 'visibility', visible ? 'visible' : 'none')
      this.map.setLayoutProperty('presence-halo', 'visibility', visible ? 'visible' : 'none')
    } else if (key === 'confrontations') {
      this.map.setLayoutProperty('disputes-lines', 'visibility', visible ? 'visible' : 'none')
    }
  }

  public getLayersState(): MapLayersState {
    return { ...this.layersState }
  }

  // =========================================================
  // 7. EVENTOS DE RATO E TOQUE
  // =========================================================
  private bindEvents() {
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
  }

  public resize() {
    if (this.map) {
      this.map.resize()
    }
  }

  public destroy() {
    if (this.scanAnimFrame) {
      cancelAnimationFrame(this.scanAnimFrame)
    }
    if (this.map) {
      this.map.remove()
    }
  }
}
