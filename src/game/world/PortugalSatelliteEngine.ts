import { Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import nationalGeoJSONRaw from '@/src/data/maps/portugal-national.json'
import type { FeatureCollection } from 'geojson'
import type { PortugalVivoDistrict, ActiveConfrontation, ResolvedPlayerPin } from '@/src/hooks/usePortugalVivoData'
import { CANONICAL_CITIES, type NexusEvent } from '@/lib/portugal-map-nexus-data'

export type MapSector = 'continente' | 'acores' | 'madeira'

export interface MapLayersState {
  satellite: boolean
  terrain: boolean
  roads: boolean
  cities: boolean
  districts: boolean
  players: boolean
  confrontations: boolean
  events: boolean
  hotspots: boolean
}

export const DEFAULT_MAP_LAYERS: MapLayersState = {
  satellite: true,
  terrain: false,
  roads: true,
  cities: true,
  districts: true,
  players: true,
  confrontations: true,
  events: true,
  hotspots: true,
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
  onSelectPlayer?: (player: ResolvedPlayerPin | null) => void
  onSelectEvent?: (event: NexusEvent | null) => void
  onSelectDispute?: (dispute: ActiveConfrontation | null) => void
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
  private eventsData: NexusEvent[] = []
  private eventsMap = new Map<string, NexusEvent>()
  private confrontationsData: ActiveConfrontation[] = []
  private confrontationsMap = new Map<string, ActiveConfrontation>()
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
            ['>', ['to-number', ['feature-state', 'online'], 0], 0],
            '#059669', // Verde Esmeralda Tático para Território Ativo com Jogadores Online
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
            0.12,
            ['>', ['to-number', ['feature-state', 'online'], 0], 0],
            0.18, // Território ativo destacado com elegância preservando o satélite
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
            ['>', ['to-number', ['feature-state', 'online'], 0], 0],
            '#34d399', // Contorno luminoso no distrito ativo
            '#94a3b8',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            2.8,
            ['boolean', ['feature-state', 'hover'], false],
            2.2,
            ['>', ['to-number', ['feature-state', 'online'], 0], 0],
            2.2, // Contorno reforçado no distrito ativo
            1.2,
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1.0,
            ['boolean', ['feature-state', 'hover'], false],
            0.95,
            ['>', ['to-number', ['feature-state', 'online'], 0], 0],
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

    // 1.3.1. POIs de Disputas em Direto (Marcador ⚔️ no ponto médio)
    if (!this.map.getSource('disputes-pois-source')) {
      this.map.addSource('disputes-pois-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!this.map.getLayer('disputes-pois-glow')) {
      this.map.addLayer({
        id: 'disputes-pois-glow',
        type: 'circle',
        source: 'disputes-pois-source',
        paint: {
          'circle-radius': 22,
          'circle-color': '#f59e0b',
          'circle-opacity': 0.35,
          'circle-blur': 0.8,
        },
      })
    }

    if (!this.map.getLayer('disputes-pois-core')) {
      this.map.addLayer({
        id: 'disputes-pois-core',
        type: 'circle',
        source: 'disputes-pois-source',
        paint: {
          'circle-radius': 10,
          'circle-color': '#d97706',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      })
    }

    if (!this.map.getLayer('disputes-pois-label')) {
      this.map.addLayer({
        id: 'disputes-pois-label',
        type: 'symbol',
        source: 'disputes-pois-source',
        minzoom: 6.5,
        layout: {
          'text-field': ['concat', '⚔️ ', ['get', 'title']],
          'text-size': 10,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#fde68a',
          'text-halo-color': '#020617',
          'text-halo-width': 2,
        },
      })
    }

    // 1.3.2. Fonte e Camadas de Eventos Especiais Reais (⚡ EVENTO)
    if (!this.map.getSource('events-source')) {
      this.map.addSource('events-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!this.map.getLayer('events-glow')) {
      this.map.addLayer({
        id: 'events-glow',
        type: 'circle',
        source: 'events-source',
        paint: {
          'circle-radius': 22,
          'circle-color': '#f43f5e',
          'circle-opacity': 0.35,
          'circle-blur': 0.8,
        },
      })
    }

    if (!this.map.getLayer('events-core')) {
      this.map.addLayer({
        id: 'events-core',
        type: 'circle',
        source: 'events-source',
        paint: {
          'circle-radius': 10,
          'circle-color': '#e11d48',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      })
    }

    if (!this.map.getLayer('events-label')) {
      this.map.addLayer({
        id: 'events-label',
        type: 'symbol',
        source: 'events-source',
        minzoom: 6.5,
        layout: {
          'text-field': ['concat', '⚡ ', ['get', 'title']],
          'text-size': 10,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#fda4af',
          'text-halo-color': '#020617',
          'text-halo-width': 2,
        },
      })
    }

    // 1.3.3. Fonte e Camada de Cidades Canónicas do Acorda Portugal
    const cityFeatures = CANONICAL_CITIES.map((c) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: c.coordinates,
      },
      properties: {
        id: c.id,
        name: c.name,
        district: c.district,
        tier: c.tier,
      },
    }))

    if (!this.map.getSource('canonical-cities-source')) {
      this.map.addSource('canonical-cities-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: cityFeatures,
        },
      })
    }

    if (!this.map.getLayer('canonical-cities-beacon')) {
      this.map.addLayer({
        id: 'canonical-cities-beacon',
        type: 'circle',
        source: 'canonical-cities-source',
        minzoom: 7.2,
        paint: {
          'circle-radius': 3.5,
          'circle-color': '#38bdf8',
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      })
    }

    if (!this.map.getLayer('canonical-cities-label')) {
      this.map.addLayer({
        id: 'canonical-cities-label',
        type: 'symbol',
        source: 'canonical-cities-source',
        minzoom: 7.4,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#f1f5f9',
          'text-halo-color': '#020617',
          'text-halo-width': 2,
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

    // Etiqueta de Distrito Ativo com contagem de jogadores online
    if (!this.map.getLayer('presence-label')) {
      this.map.addLayer({
        id: 'presence-label',
        type: 'symbol',
        source: 'presence-source',
        filter: ['>', ['to-number', ['get', 'online'], 0], 0],
        minzoom: 5.2,
        layout: {
          'text-field': [
            'concat',
            '📍 ',
            ['get', 'name'],
            ' (',
            ['to-string', ['get', 'online']],
            ' online)',
          ],
          'text-size': 11,
          'text-offset': [0, -1.8],
          'text-anchor': 'bottom',
        },
        paint: {
          'text-color': '#34d399',
          'text-halo-color': '#020617',
          'text-halo-width': 2.5,
        },
      })
    }

    // 1.5. Fonte e Camadas de Jogadores Reais com Clustering Inteligente e Hotspots 🔥
    if (!this.map.getSource('players-source')) {
      this.map.addSource('players-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 42,
      })
    }

    // Glow de Clusters com Deteção de Hotspot Térmico (>= 3 jogadores vira Hotspot 🔥)
    if (!this.map.getLayer('players-clusters-glow')) {
      this.map.addLayer({
        id: 'players-clusters-glow',
        type: 'circle',
        source: 'players-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'point_count'], 3],
            '#f59e0b',
            '#00e5ff',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 3, 26, 8, 34],
          'circle-opacity': 0.32,
          'circle-blur': 0.75,
        },
      })
    }

    // Núcleo de Clusters com contagem de jogadores e estilo Hotspot
    if (!this.map.getLayer('players-clusters-core')) {
      this.map.addLayer({
        id: 'players-clusters-core',
        type: 'circle',
        source: 'players-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'point_count'], 3],
            '#d97706',
            '#0284c7',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 14, 3, 18, 8, 24],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      })
    }

    // Texto numérico dentro do Cluster (mostra 🔥 se >= 3 jogadores)
    if (!this.map.getLayer('players-clusters-count')) {
      this.map.addLayer({
        id: 'players-clusters-count',
        type: 'symbol',
        source: 'players-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': [
            'case',
            ['>=', ['get', 'point_count'], 3],
            ['concat', '🔥 ', '{point_count_abbreviated}'],
            '{point_count_abbreviated}',
          ],
          'text-size': 11,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })
    }

    // Jogadores Individuais (Unclustered) — Halo de Presença
    if (!this.map.getLayer('players-unclustered-halo')) {
      this.map.addLayer({
        id: 'players-unclustered-halo',
        type: 'circle',
        source: 'players-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': ['get', 'haloRadius'],
          'circle-color': ['get', 'haloColor'],
          'circle-opacity': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            0.60,
            0.32,
          ],
          'circle-blur': 0.75,
        },
      })
    }

    // Jogadores Individuais — Ponto de Beacon Nítido
    if (!this.map.getLayer('players-unclustered-core')) {
      this.map.addLayer({
        id: 'players-unclustered-core',
        type: 'circle',
        source: 'players-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': ['get', 'beaconRadius'],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            3,
            2,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1.0,
        },
      })
    }

    // Jogadores Individuais — Etiqueta de Nome / "VOCÊ ESTÁ AQUI" (zoom >= 5.0)
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
            ['concat', '📍 VOCÊ ESTÁ AQUI (Nv. ', ['to-string', ['get', 'level']], ')'],
            ['concat', '🟢 ', ['get', 'displayName'], ' (Nv. ', ['to-string', ['get', 'level']], ')'],
          ],
          'text-size': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            11,
            9.5,
          ],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': [
            'case',
            ['boolean', ['get', 'isCurrentUser'], false],
            '#38bdf8',
            '#f1f5f9',
          ],
          'text-halo-color': '#020617',
          'text-halo-width': 2.5,
        },
      })
    }
  }

  // =========================================================
  // 2. ATUALIZAÇÃO DE DADOS EM TEMPO REAL
  // =========================================================
  public updateData(
    districts: PortugalVivoDistrict[],
    confrontations: ActiveConfrontation[],
    players?: ResolvedPlayerPin[],
    events?: NexusEvent[]
  ) {
    this.districtsData = districts
    this.districtMap.clear()
    for (const d of districts) {
      this.districtMap.set(d.id.toLowerCase(), d)
      this.districtMap.set(d.slug.toLowerCase(), d)
      this.districtMap.set(d.name.toLowerCase(), d)
      this.districtMap.set(d.canonicalName.toLowerCase(), d)
    }

    this.confrontationsData = confrontations
    this.confrontationsMap.clear()
    for (const c of confrontations) {
      this.confrontationsMap.set(c.id, c)
    }

    if (events) {
      this.eventsData = events
      this.eventsMap.clear()
      for (const ev of events) {
        this.eventsMap.set(ev.id, ev)
      }
    }

    if (players) {
      this.updatePlayers(players)
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

    // 2.2.1. Atualizar POIs de Disputas em Direto no ponto médio
    const disputePOIFeatures = confrontations.map((c) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: c.centerMid || [
          (c.centerA[0] + c.centerB[0]) / 2,
          (c.centerA[1] + c.centerB[1]) / 2,
        ],
      },
      properties: {
        id: c.id,
        title: `${c.districtA} vs ${c.districtB}`,
      },
    }))

    const disputePOISource = this.map.getSource('disputes-pois-source') as any
    if (disputePOISource && disputePOISource.setData) {
      disputePOISource.setData({
        type: 'FeatureCollection',
        features: disputePOIFeatures,
      })
    }

    // 2.2.2. Atualizar POIs de Eventos Especiais Reais
    const eventFeatures = (events || this.eventsData).map((ev) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: ev.coordinates,
      },
      properties: {
        id: ev.id,
        title: ev.title,
        district: ev.district,
      },
    }))

    const eventsSource = this.map.getSource('events-source') as any
    if (eventsSource && eventsSource.setData) {
      eventsSource.setData({
        type: 'FeatureCollection',
        features: eventFeatures,
      })
    }

    // 2.3. Atualizar Balizas de Presença Real por Distrito (Apenas onde existem jogadores reais online)
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

  // 2.4. Atualizar Posição Geográfica Exata de Cada Jogador Online
  public updatePlayers(players: ResolvedPlayerPin[]) {
    this.playersData = players
    this.playersMap.clear()
    for (const p of players) {
      this.playersMap.set(p.userId, p)
    }

    if (!this.isLoaded || !this.map) return

    const playerFeatures = players.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: p.coords,
      },
      properties: {
        userId: p.userId,
        displayName: p.displayName,
        photoURL: p.photoURL || '',
        district: p.district,
        city: p.city || '',
        level: p.level,
        xp: p.xp || 0,
        activity: p.activity,
        isCurrentUser: p.isCurrentUser,
        color: p.isCurrentUser ? '#00e5ff' : '#10b981',
        haloColor: p.isCurrentUser ? '#38bdf8' : '#34d399',
        beaconRadius: p.isCurrentUser ? 10 : 7,
        haloRadius: p.isCurrentUser ? 30 : 18,
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

    // Destaque transitório em distritos com presença online
    const geoData = nationalGeoJSONRaw as unknown as FeatureCollection
    geoData.features.forEach((feat, idx) => {
      const p = feat.properties || {}
      const dId = (p.id || '').toString().toLowerCase()
      const dName = (p.name || '').toString().toLowerCase()
      const district = this.districtMap.get(dId) || this.districtMap.get(dName)
      if (district && district.onlineNow > 0) {
        this.map.setFeatureState(
          { source: 'districts-source', id: idx },
          { hover: true }
        )
      }
    })

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

      // Restaurar estado dos distritos após o scan
      setTimeout(() => {
        geoData.features.forEach((feat, idx) => {
          const p = feat.properties || {}
          const dId = (p.id || '').toString().toLowerCase()
          const dName = (p.name || '').toString().toLowerCase()
          const district = this.districtMap.get(dId) || this.districtMap.get(dName)
          if (district) {
            this.map.setFeatureState(
              { source: 'districts-source', id: idx },
              { hover: this.hoveredDistrictId === district.id }
            )
          }
        })
      }, 2500)

      if (onComplete) onComplete()
    }, 1200)
  }

  // =========================================================
  // 6. CONTROLO DE CAMADAS
  // =========================================================
  public setLayerVisibility(key: keyof MapLayersState, visible: boolean) {
    this.layersState[key] = visible
    if (!this.map || !this.map.getStyle()) return

    const vis = visible ? 'visible' : 'none'

    if (key === 'satellite') {
      this.map.setLayoutProperty('satellite-layer', 'visibility', vis)
    } else if (key === 'terrain') {
      this.map.setLayoutProperty('terrain-layer', 'visibility', vis)
    } else if (key === 'roads') {
      this.map.setLayoutProperty('roads-layer', 'visibility', vis)
    } else if (key === 'cities') {
      if (this.map.getLayer('places-layer')) this.map.setLayoutProperty('places-layer', 'visibility', vis)
      if (this.map.getLayer('canonical-cities-beacon')) this.map.setLayoutProperty('canonical-cities-beacon', 'visibility', vis)
      if (this.map.getLayer('canonical-cities-label')) this.map.setLayoutProperty('canonical-cities-label', 'visibility', vis)
    } else if (key === 'districts') {
      if (this.map.getLayer('districts-line')) this.map.setLayoutProperty('districts-line', 'visibility', vis)
      if (this.map.getLayer('districts-fill')) this.map.setLayoutProperty('districts-fill', 'visibility', vis)
    } else if (key === 'players') {
      const playerLayers = [
        'players-clusters-glow',
        'players-clusters-core',
        'players-clusters-count',
        'players-unclustered-halo',
        'players-unclustered-core',
        'players-unclustered-label',
        'presence-beacon',
        'presence-halo',
        'presence-label',
      ]
      for (const id of playerLayers) {
        if (this.map.getLayer(id)) {
          this.map.setLayoutProperty(id, 'visibility', vis)
        }
      }
    } else if (key === 'confrontations') {
      const disputeLayers = [
        'disputes-lines',
        'disputes-pois-glow',
        'disputes-pois-core',
        'disputes-pois-label',
      ]
      for (const id of disputeLayers) {
        if (this.map.getLayer(id)) {
          this.map.setLayoutProperty(id, 'visibility', vis)
        }
      }
    } else if (key === 'events') {
      const eventLayers = [
        'events-glow',
        'events-core',
        'events-label',
      ]
      for (const id of eventLayers) {
        if (this.map.getLayer(id)) {
          this.map.setLayoutProperty(id, 'visibility', vis)
        }
      }
    } else if (key === 'hotspots') {
      if (this.map.getLayer('players-clusters-glow')) {
        this.map.setLayoutProperty('players-clusters-glow', 'visibility', vis)
      }
    }
  }

  public getLayersState(): MapLayersState {
    return { ...this.layersState }
  }

  // =========================================================
  // 7. LOCALIZAÇÃO DO UTILIZADOR & PESQUISA INTELIGENTE
  // =========================================================
  public locateUser(coords: [number, number], zoom = 13.2) {
    if (!this.map) return
    this.map.flyTo({
      center: coords,
      zoom,
      duration: 1400,
      pitch: 20,
      essential: true,
    })
  }

  public searchAndFocus(queryStr: string): boolean {
    if (!this.map || !queryStr.trim()) return false
    const q = queryStr.toLowerCase().trim()

    // 1. Procurar por distrito
    const district = this.districtMap.get(q)
    if (district) {
      this.focusDistrict(district)
      if (this.callbacks.onSelectDistrict) {
        this.callbacks.onSelectDistrict(district)
      }
      return true
    }

    // 2. Procurar por cidade canónica
    const city = CANONICAL_CITIES.find(
      (c) => c.name.toLowerCase() === q || c.id.toLowerCase() === q
    )
    if (city) {
      this.map.flyTo({
        center: city.coordinates,
        zoom: 12.5,
        duration: 1200,
        pitch: 20,
        essential: true,
      })
      const parentDist = this.districtMap.get(city.district.toLowerCase())
      if (parentDist && this.callbacks.onSelectDistrict) {
        this.callbacks.onSelectDistrict(parentDist)
      }
      return true
    }

    // 3. Procurar por arquipélago
    if (q.includes('acores') || q.includes('açores')) {
      this.fitSector('acores')
      return true
    }
    if (q.includes('madeira')) {
      this.fitSector('madeira')
      return true
    }
    if (q.includes('continente') || q.includes('portugal')) {
      this.fitSector('continente')
      return true
    }

    return false
  }

  // =========================================================
  // 8. EVENTOS DE RATO E TOQUE
  // =========================================================
  private bindEvents() {
    // 8.1. Hover e Clique em Distritos
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

    // 8.2. Clique em Clusters de Jogadores — Expansão fluida com zoom
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
            zoom: Math.min(zoom + 0.6, 14),
            duration: 700,
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

    // 8.3. Clique em Jogador Individual — Dispara painel contextual
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

    // 8.4. Clique em Disputa Territorial — Dispara painel contextual
    this.map.on('click', 'disputes-pois-core', (e) => {
      if (e.features && e.features.length > 0) {
        const feat = e.features[0]
        const p = feat.properties || {}
        const dispute = this.confrontationsMap.get(p.id)
        if (dispute && this.callbacks.onSelectDispute) {
          this.callbacks.onSelectDispute(dispute)
        }
      }
    })
    this.map.on('mouseenter', 'disputes-pois-core', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', 'disputes-pois-core', () => {
      this.map.getCanvas().style.cursor = ''
    })

    // 8.5. Clique em Evento Especial — Dispara painel contextual
    this.map.on('click', 'events-core', (e) => {
      if (e.features && e.features.length > 0) {
        const feat = e.features[0]
        const p = feat.properties || {}
        const ev = this.eventsMap.get(p.id)
        if (ev && this.callbacks.onSelectEvent) {
          this.callbacks.onSelectEvent(ev)
        }
      }
    })
    this.map.on('mouseenter', 'events-core', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', 'events-core', () => {
      this.map.getCanvas().style.cursor = ''
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
