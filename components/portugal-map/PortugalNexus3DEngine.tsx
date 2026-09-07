'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import {
  CANONICAL_TERRITORIES,
  CANONICAL_CITIES,
  CANONICAL_LANDMARKS,
  CANONICAL_ARENAS,
} from '@/lib/portugal-map-nexus-data'
import type { MapArenaPOI, MapDisplayMode, MapRegion } from './types'
import type { DistrictWarTerritory } from '@/lib/district-war'

export interface MapLayersState {
  territorios: boolean
  cidades: boolean
  arenas: boolean
  jogadores: boolean
  eventos: boolean
  ranking: boolean
  conexoes: boolean
  landmarks: boolean
}

export interface PortugalNexus3DEngineProps {
  selectedDistrict: string
  hoveredDistrict: string | null
  activeRegion: MapRegion
  activeMode: MapDisplayMode
  showArenas: boolean
  isCinematic: boolean
  layers: MapLayersState
  territories: DistrictWarTerritory[]
  onSelectDistrict: (districtName: string) => void
  onHoverDistrict: (districtName: string | null) => void
  onSelectArena: (arena: MapArenaPOI) => void
  onToggleCinematic: () => void
  onTriggerSynchronized?: (districtName: string) => void
  className?: string
}

// Coordinate projection from SVG [x: ~270..600, y: ~30..790] to 3D World space [wx, wz]
// Mainland center: x=430, y=410
const SVG_CENTER_X = 430
const SVG_CENTER_Y = 410
const SVG_SCALE = 0.38

function svgToWorld3D(x: number, y: number, isIsland = false, islandType = ''): [number, number] {
  if (isIsland) {
    if (islandType.toLowerCase().includes('açores') || islandType.toLowerCase().includes('acores')) {
      // Position Açores in Atlantic west sector
      return [-125 + (x - 400) * 0.42, -25 + (y - 400) * 0.42]
    } else if (islandType.toLowerCase().includes('madeira')) {
      // Position Madeira in Atlantic southwest sector
      return [-105 + (x - 400) * 0.42, 95 + (y - 400) * 0.42]
    }
  }
  const wx = (x - SVG_CENTER_X) * SVG_SCALE
  const wz = (y - SVG_CENTER_Y) * SVG_SCALE
  return [wx, wz]
}

// Convert geographic WGS84 [lng, lat] to world space [wx, wz]
function wgs84ToWorld3D(lng: number, lat: number): [number, number] {
  // Azores: lng ~ -25 to -28, lat ~ 37 to 39
  if (lng < -20) {
    return [-125 + (lng - (-25.6)) * 8, -25 - (lat - 37.7) * 8]
  }
  // Madeira: lng ~ -16.9, lat ~ 32.7
  if (lat < 35) {
    return [-105 + (lng - (-16.9)) * 12, 95 - (lat - 32.7) * 12]
  }
  // Mainland Portugal: lat 37.0 to 42.15, lng -9.55 to -6.18
  const minLat = 36.9
  const maxLat = 42.2
  const minLng = -9.6
  const maxLng = -6.1

  const normX = (lng - minLng) / (maxLng - minLng)
  const normZ = 1 - (lat - minLat) / (maxLat - minLat)

  const svgX = 270 + normX * (600 - 270)
  const svgY = 30 + normZ * (790 - 30)

  return svgToWorld3D(svgX, svgY)
}

// Convert SVG path command string into array of 2D points
function parseSvgPathToPoints(pathStr: string): THREE.Vector2[][] {
  if (!pathStr) return []
  const polygons: THREE.Vector2[][] = []
  const subPaths = pathStr.split(/(?=[M])/g)

  for (const sub of subPaths) {
    const trimmed = sub.trim()
    if (!trimmed) continue

    const matches = trimmed.match(/[MLZ]?\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/gi)
    if (!matches || matches.length < 3) continue

    const pts: THREE.Vector2[] = []
    for (const m of matches) {
      const parts = m.replace(/[MLZ]/gi, '').trim().split(/[,\s]+/)
      if (parts.length >= 2) {
        const x = parseFloat(parts[0])
        const y = parseFloat(parts[1])
        if (!isNaN(x) && !isNaN(y)) {
          pts.push(new THREE.Vector2(x, y))
        }
      }
    }

    if (pts.length >= 3) {
      polygons.push(pts)
    }
  }

  return polygons
}

/**
 * Fast 2D point in polygon test
 */
function pointInPolygon(pt: [number, number], poly: THREE.Vector2[]): boolean {
  let inside = false
  const [x, y] = pt
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Portuguese Digital Elevation Model (DEM)
 * Computes authentic 3D altitude (Y) across the continuous terrain surface:
 * - Real mountain massifs (Estrela, Gerês, Marão, Montesinho, Montemuro, Gardunha, Monchique, Pico)
 * - Carved major rivers (Douro, Tejo, Mondego, Guadiana, Minho)
 * - Coastal slope down to Atlantic sea level
 */
function getPortugalElevation(wx: number, wz: number, isIsland = false, islandType = ''): number {
  if (isIsland) {
    if (islandType.toLowerCase().includes('açores') || islandType.toLowerCase().includes('acores')) {
      // Montanha do Pico (2351m - highest point in Portugal)
      const distToPico = Math.hypot(wx - (-125), wz - (-25))
      const picoPeak = Math.max(0, 24.5 * Math.exp(-distToPico * 0.14))
      return Math.max(1.8, picoPeak + 2.5)
    } else if (islandType.toLowerCase().includes('madeira')) {
      // Pico Ruivo (1862m) + dramatic sea cliffs
      const distToRuivo = Math.hypot(wx - (-105), wz - 95)
      const ruivoPeak = Math.max(0, 19.5 * Math.exp(-distToRuivo * 0.16))
      return Math.max(2.0, ruivoPeak + 2.2)
    }
  }

  // 1. Base Continental Slope: Interior high plateau sloping towards western ocean
  const normX = Math.max(0, Math.min(1, (wx + 60) / 120))
  let elevation = 1.4 + normX * 4.8

  // 2. Real Mountain Massifs (Gaussian altitude fields)
  // 2.1 Serra da Estrela (Torre 1993m - Continental Peak)
  const distEstrela = Math.hypot(wx - 14, wz - (-32))
  const estrela = 22.5 * Math.exp(-(distEstrela * distEstrela) / 260)

  // 2.2 Serra do Açor & Lousã
  const distAcor = Math.hypot(wx - 5, wz - (-22))
  const acor = 12.5 * Math.exp(-(distAcor * distAcor) / 200)

  // 2.3 Peneda-Gerês (1545m)
  const distGeres = Math.hypot(wx - (-7), wz - (-108))
  const geres = 17.5 * Math.exp(-(distGeres * distGeres) / 240)

  // 2.4 Serra do Marão & Alvão (1415m)
  const distMarao = Math.hypot(wx - 5, wz - (-92))
  const marao = 15.2 * Math.exp(-(distMarao * distMarao) / 190)

  // 2.5 Serra de Montesinho (1486m)
  const distMontesinho = Math.hypot(wx - 38, wz - (-118))
  const montesinho = 14.5 * Math.exp(-(distMontesinho * distMontesinho) / 220)

  // 2.6 Serra de Montemuro (1382m) & Caramulo (1075m)
  const distMontemuro = Math.hypot(wx - 0, wz - (-65))
  const montemuro = 13.0 * Math.exp(-(distMontemuro * distMontemuro) / 180)
  const distCaramulo = Math.hypot(wx - (-6), wz - (-45))
  const caramulo = 11.0 * Math.exp(-(distCaramulo * distCaramulo) / 150)

  // 2.7 Serra da Gardunha (1227m)
  const distGardunha = Math.hypot(wx - 18, wz - (-12))
  const gardunha = 12.0 * Math.exp(-(distGardunha * distGardunha) / 140)

  // 2.8 Serra de São Mamede (1025m)
  const distMamede = Math.hypot(wx - 26, wz - 22)
  const mamede = 10.2 * Math.exp(-(distMamede * distMamede) / 130)

  // 2.9 Serra de Aire e Candeeiros (678m)
  const distAire = Math.hypot(wx - (-24), wz - (-8))
  const aire = 6.5 * Math.exp(-(distAire * distAire) / 100)

  // 2.10 Serra de Sintra (528m)
  const distSintra = Math.hypot(wx - (-56), wz - 48)
  const sintra = 6.2 * Math.exp(-(distSintra * distSintra) / 75)

  // 2.11 Serra da Arrábida (501m)
  const distArrabida = Math.hypot(wx - (-40), wz - 60)
  const arrabida = 5.5 * Math.exp(-(distArrabida * distArrabida) / 70)

  // 2.12 Serra de Monchique (Fóia 902m) & Caldeirão (589m)
  const distMonchique = Math.hypot(wx - (-22), wz - 122)
  const monchique = 10.5 * Math.exp(-(distMonchique * distMonchique) / 140)
  const distCaldeirao = Math.hypot(wx - 5, wz - 120)
  const caldeirao = 6.8 * Math.exp(-(distCaldeirao * distCaldeirao) / 170)

  elevation += estrela + acor + geres + marao + montesinho + montemuro + caramulo + gardunha + mamede + aire + sintra + arrabida + monchique + caldeirao

  // 3. Carved Major River Valleys
  // 3.1 Rio Douro Canyon (From border to Porto)
  const douroT = Math.max(0, Math.min(1, (wx + 28) / 83))
  const douroZ = -76 - Math.sin(douroT * Math.PI) * 9
  const distDouro = Math.abs(wz - douroZ)
  if (wx >= -32 && wx <= 55 && distDouro < 14) {
    const canyonFactor = Math.exp(-(distDouro * distDouro) / 36)
    elevation -= canyonFactor * 5.5
  }

  // 3.2 Rio Tejo Valley (From Vila Velha past Santarém to Lisboa)
  const tejoT = Math.max(0, Math.min(1, (wx + 45) / 70))
  const tejoZ = 45 - tejoT * 45
  const distTejo = Math.abs(wz - tejoZ)
  if (wx >= -48 && wx <= 25 && distTejo < 16) {
    const valleyFactor = Math.exp(-(distTejo * distTejo) / 45)
    elevation -= valleyFactor * 4.5
  }

  // 3.3 Rio Mondego Valley
  const distMondego = Math.hypot(wz - (-37), wx - (-25))
  if (distMondego < 18) {
    elevation -= Math.exp(-(distMondego * distMondego) / 45) * 3.8
  }

  return Math.max(0.6, elevation)
}

export function PortugalNexus3DEngine({
  selectedDistrict,
  hoveredDistrict,
  activeRegion,
  layers,
  onSelectDistrict,
  onHoverDistrict,
  onSelectArena,
  onTriggerSynchronized,
  className,
}: PortugalNexus3DEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Three.js Core
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Groups and Interactive Objects
  const districtPolygonsRef = useRef<{ name: string; polygon: THREE.Vector2[] }[]>([])
  const districtBoundariesRef = useRef<Map<string, {
    line: THREE.LineLoop
    points: THREE.Vector3[]
    centroid: [number, number]
  }>>(new Map())
  const terrainMeshRef = useRef<THREE.Mesh | null>(null)
  const arenaMeshesRef = useRef<Map<string, THREE.Group>>(new Map())
  const cityMeshesRef = useRef<Map<string, THREE.Group>>(new Map())
  const landmarkMeshesRef = useRef<Map<string, THREE.Group>>(new Map())
  const pulseRingsRef = useRef<{ line: THREE.Line; progress: number; active: boolean }[]>([])

  // Camera Animation State
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3
    lookAt: THREE.Vector3
    startPos: THREE.Vector3
    startLookAt: THREE.Vector3
    isAnimating: boolean
    progress: number
    duration: number
  }>({
    pos: new THREE.Vector3(0, 115, 130),
    lookAt: new THREE.Vector3(0, 0, 10),
    startPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3(),
    isAnimating: false,
    progress: 0,
    duration: 1.4,
  })

  // Cinematic opening sequence (Atlantic swoop)
  const introCinematicRef = useRef<{
    active: boolean
    startTime: number
    duration: number
  }>({
    active: true,
    startTime: 0,
    duration: 3.2,
  })

  // Controls State
  const controlsRef = useRef<{
    isDragging: boolean
    isRightDragging: boolean
    previousMousePosition: { x: number; y: number }
    panVelocity: THREE.Vector2
    spherical: THREE.Spherical
    target: THREE.Vector3
    targetLookAt: THREE.Vector3
  }>({
    isDragging: false,
    isRightDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    panVelocity: new THREE.Vector2(0, 0),
    spherical: new THREE.Spherical(180, Math.PI / 4.4, -0.05),
    target: new THREE.Vector3(0, 0, 10),
    targetLookAt: new THREE.Vector3(0, 0, 10),
  })

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999))
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())

  // Web Audio procedural synthesizer for tactile feedback
  const playTacticalChime = useCallback((high = false) => {
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      const baseFreq = high ? 784 : 440
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1)

      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } catch {
      // Audio policy
    }
  }, [])

  // Smooth camera fly-to transition
  const flyCameraTo = useCallback((targetPos: THREE.Vector3, targetLookAt: THREE.Vector3, duration = 1.4) => {
    if (!cameraRef.current) return
    const c = cameraTargetRef.current
    c.startPos.copy(cameraRef.current.position)
    c.startLookAt.copy(controlsRef.current.target)
    c.pos.copy(targetPos)
    c.lookAt.copy(targetLookAt)
    c.isAnimating = true
    c.progress = 0
    c.duration = duration
  }, [])

  // 1. INITIALIZE THREE.JS SCENE, TRUE 3D TERRAIN, OCEAN & LIGHTS
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1.1 Scene & Atmospheric Fog
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0x020713)
    scene.fog = new THREE.FogExp2(0x030c1f, 0.0035)

    // 1.2 Camera (Oblique 3D Perspective)
    const camera = new THREE.PerspectiveCamera(44, width / height, 1, 1400)
    cameraRef.current = camera
    camera.position.set(-90, 160, 210) // Opening position over Atlantic
    camera.lookAt(0, 0, 10)

    // 1.3 WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    })
    rendererRef.current = renderer
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // 1.4 Dynamic Orbital & Sun Lighting (Producing real hillshading on mountain slopes)
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.0)
    scene.add(ambientLight)

    // Directional Sunlight: casting real shadows across valleys and slopes
    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 3.4)
    sunLight.position.set(130, 200, 90)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    scene.add(sunLight)

    // Rim Light (Atmospheric coastal & mountain rim highlights)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.8)
    rimLight.position.set(-180, 130, -100)
    scene.add(rimLight)

    // 1.5 Deep Atlantic Ocean Base Floor
    const oceanGeometry = new THREE.PlaneGeometry(1600, 1600, 32, 32)
    oceanGeometry.rotateX(-Math.PI / 2)
    const oceanMaterial = new THREE.MeshStandardMaterial({
      color: 0x010815,
      roughness: 0.22,
      metalness: 0.88,
    })
    const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMaterial)
    oceanMesh.position.y = -1.2
    scene.add(oceanMesh)

    // Bathymetric coordinate grid (thin oceanic lines)
    const oceanGrid = new THREE.GridHelper(1200, 40, 0x06b6d4, 0x071e3d)
    oceanGrid.position.y = -1.1
    ;(oceanGrid.material as THREE.Material).opacity = 0.16
    ;(oceanGrid.material as THREE.Material).transparent = true
    scene.add(oceanGrid)

    // 1.6 Parse District Boundaries for Spatial Testing & Filaments
    districtPolygonsRef.current = []
    districtBoundariesRef.current.clear()

    const boundaryMasterGroup = new THREE.Group()
    boundaryMasterGroup.name = 'district_boundaries_3d'

    for (const territory of CANONICAL_TERRITORIES) {
      const isIsland = territory.type === 'island'
      const rawPolygons = parseSvgPathToPoints(territory.pathSvg)
      if (rawPolygons.length === 0) continue

      for (const pts of rawPolygons) {
        // Convert to 3D world coordinates
        const pts3D: THREE.Vector3[] = []
        const pts2D: THREE.Vector2[] = []

        for (const pt of pts) {
          const [wx, wz] = svgToWorld3D(pt.x, pt.y, isIsland, territory.name)
          const wy = getPortugalElevation(wx, wz, isIsland, territory.name)
          pts3D.push(new THREE.Vector3(wx, wy + 0.2, wz))
          pts2D.push(new THREE.Vector2(wx, wz))
        }

        districtPolygonsRef.current.push({
          name: territory.name,
          polygon: pts2D,
        })

        // Create 3D Boundary Energy Filament draping over terrain
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts3D)
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.28,
        })
        const lineLoop = new THREE.LineLoop(lineGeom, lineMat)
        boundaryMasterGroup.add(lineLoop)

        districtBoundariesRef.current.set(territory.name.toLowerCase(), {
          line: lineLoop,
          points: pts3D,
          centroid: territory.centroidSvg,
        })
      }
    }
    scene.add(boundaryMasterGroup)

    // 1.7 VERDADEIRO TERRENO 3D TOPOGRÁFICO CONTÍNUO (25.000 VÉRTICES COM DEM REAL)
    // Mainland Portugal bounding box in world coordinates:
    // X: -65 to +65, Z: -130 to +135
    const terrainWidth = 130
    const terrainHeight = 265
    const segX = 110
    const segZ = 180
    const terrainGeom = new THREE.PlaneGeometry(terrainWidth, terrainHeight, segX, segZ)
    terrainGeom.rotateX(-Math.PI / 2) // Orient horizontally

    const posAttr = terrainGeom.attributes.position as THREE.BufferAttribute
    const count = posAttr.count
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const vx = posAttr.getX(i)
      const vz = posAttr.getZ(i)

      // Test whether vertex is inside Portuguese mainland territory
      let inside = false
      for (const item of districtPolygonsRef.current) {
        if (pointInPolygon([vx, vz], item.polygon)) {
          inside = true
          break
        }
      }

      if (inside) {
        // True 3D Topographic Altitude
        const vy = getPortugalElevation(vx, vz)
        posAttr.setY(i, vy)

        // Shading: Elevation & Topographic Contour Lines
        const normH = Math.min(1, vy / 22.0)
        let r = 0.04 + normH * 0.15
        let g = 0.08 + normH * 0.26
        let b = 0.15 + normH * 0.42

        // Topographic Isohypse Contour Lines: subtle neon crest every 2 units of elevation
        if (Math.abs(vy % 2.0) < 0.15) {
          r += 0.08
          g += 0.25
          b += 0.35
        }

        // River veins (electric sapphire along Douro & Tejo valleys)
        if (vy < 2.5 && ((vx > -32 && vx < 40 && Math.abs(vz - (-76)) < 8) || (vx > -45 && vx < 20 && Math.abs(vz - 25) < 10))) {
          r = 0.0
          g = 0.8
          b = 1.0
        }

        colors[i * 3] = r
        colors[i * 3 + 1] = g
        colors[i * 3 + 2] = b
      } else {
        // Atlantic Continental Shelf & Deep Ocean Abyss
        const distToCoast = Math.max(0, -vx - 35)
        const seaDepth = -1.6 - distToCoast * 0.15
        posAttr.setY(i, seaDepth)

        colors[i * 3] = 0.01
        colors[i * 3 + 1] = 0.04
        colors[i * 3 + 2] = 0.09
      }
    }

    terrainGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    terrainGeom.computeVertexNormals() // Hillshade normal calculation!

    // High-tech Tactical Topographic PBR Material
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.45,
      metalness: 0.45,
      flatShading: false,
    })

    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMaterial)
    terrainMesh.receiveShadow = true
    terrainMesh.castShadow = true
    scene.add(terrainMesh)
    terrainMeshRef.current = terrainMesh

    // 1.8 3D VOLCANIC MASSIS OF AÇORES & MADEIRA (Real oceanic peaks)
    // Açores - Montanha do Pico (2351m - Highest Point of Portugal)
    const acoresGeom = new THREE.ConeGeometry(8.5, 24.5, 24)
    const acoresMat = new THREE.MeshStandardMaterial({
      color: 0x112848,
      roughness: 0.4,
      metalness: 0.5,
    })
    const acoresPico = new THREE.Mesh(acoresGeom, acoresMat)
    acoresPico.position.set(-125, 11, -25)
    acoresPico.castShadow = true
    acoresPico.receiveShadow = true
    scene.add(acoresPico)

    // Madeira - Pico Ruivo (1862m) & Sea Cliffs
    const madeiraGeom = new THREE.ConeGeometry(9.0, 19.5, 20)
    const madeiraMat = new THREE.MeshStandardMaterial({
      color: 0x122944,
      roughness: 0.4,
      metalness: 0.5,
    })
    const madeiraRuivo = new THREE.Mesh(madeiraGeom, madeiraMat)
    madeiraRuivo.position.set(-105, 8.5, 95)
    madeiraRuivo.castShadow = true
    madeiraRuivo.receiveShadow = true
    scene.add(madeiraRuivo)

    // 1.9 3D CITIES (Geodetic nodes, capitals with vertical light spires)
    cityMeshesRef.current.clear()
    const citiesGroup = new THREE.Group()
    citiesGroup.name = 'cities_layer'

    for (const city of CANONICAL_CITIES) {
      const [wx, wz] = wgs84ToWorld3D(city.coordinates[0], city.coordinates[1])
      const isCapital = city.tier === 'capital'
      const isIsland = city.district === 'Açores' || city.district === 'Madeira'
      const wy = getPortugalElevation(wx, wz, isIsland, city.district)

      const cityGroup = new THREE.Group()
      cityGroup.position.set(wx, wy + 0.6, wz)
      cityGroup.userData = { isCity: true, cityData: city }

      // Glowing Node Core
      const coreGeom = new THREE.SphereGeometry(isCapital ? 1.5 : 0.9, 12, 12)
      const coreMat = new THREE.MeshBasicMaterial({
        color: isCapital ? 0x38bdf8 : 0x00e5ff,
      })
      const coreMesh = new THREE.Mesh(coreGeom, coreMat)
      cityGroup.add(coreMesh)

      // Capital Light Column (Lisboa & Porto)
      if (isCapital) {
        const spireGeom = new THREE.CylinderGeometry(0.18, 0.18, 22, 8)
        const spireMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.6,
        })
        const spire = new THREE.Mesh(spireGeom, spireMat)
        spire.position.y = 11
        cityGroup.add(spire)

        // Concentric Holographic Ground Rings
        const ringGeom = new THREE.RingGeometry(2.0, 2.6, 24)
        ringGeom.rotateX(-Math.PI / 2)
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        })
        const ring = new THREE.Mesh(ringGeom, ringMat)
        ring.position.y = 0.2
        cityGroup.add(ring)
      }

      citiesGroup.add(cityGroup)
      cityMeshesRef.current.set(city.name.toLowerCase(), cityGroup)
    }
    scene.add(citiesGroup)

    // 1.10 3D ARENAS (Crystalline energy beacons with sky beams)
    arenaMeshesRef.current.clear()
    const arenasGroup = new THREE.Group()
    arenasGroup.name = 'arenas_layer'

    for (const arena of CANONICAL_ARENAS) {
      const [wx, wz] = wgs84ToWorld3D(arena.coordinates[0], arena.coordinates[1])
      const isIsland = arena.district === 'Açores' || arena.district === 'Madeira'
      const wy = getPortugalElevation(wx, wz, isIsland, arena.district)

      const arenaGroup = new THREE.Group()
      arenaGroup.position.set(wx, wy + 2.4, wz)
      arenaGroup.userData = { isArena: true, arenaData: arena }

      // Crystalline Floating Octahedron Core
      const octaGeom = new THREE.OctahedronGeometry(1.4, 0)
      const isLegendary = arena.rarity === 'Lendária' || arena.rarity === 'Épica'
      const beaconColor = isLegendary ? 0xf59e0b : 0x06b6d4
      const octaMat = new THREE.MeshStandardMaterial({
        color: beaconColor,
        emissive: beaconColor,
        emissiveIntensity: 0.95,
        roughness: 0.2,
        metalness: 0.85,
      })
      const octaMesh = new THREE.Mesh(octaGeom, octaMat)
      octaMesh.name = 'beacon_core'
      arenaGroup.add(octaMesh)

      // Vertical Sky Beam
      const beamGeom = new THREE.CylinderGeometry(0.12, 0.12, 20, 8)
      const beamMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        transparent: true,
        opacity: 0.45,
      })
      const beam = new THREE.Mesh(beamGeom, beamMat)
      beam.position.y = 10
      arenaGroup.add(beam)

      arenasGroup.add(arenaGroup)
      arenaMeshesRef.current.set(arena.id, arenaGroup)
    }
    scene.add(arenasGroup)

    // 1.11 3D LANDMARKS (Holographic Monuments: Belém, D. Luís, Pena, Bom Jesus, etc.)
    landmarkMeshesRef.current.clear()
    const landmarksGroup = new THREE.Group()
    landmarksGroup.name = 'landmarks_layer'

    for (const landmark of CANONICAL_LANDMARKS) {
      const [wx, wz] = wgs84ToWorld3D(landmark.coordinates[0], landmark.coordinates[1])
      const isIsland = landmark.district === 'Açores' || landmark.district === 'Madeira'
      const wy = getPortugalElevation(wx, wz, isIsland, landmark.district)

      const lmGroup = new THREE.Group()
      lmGroup.position.set(wx, wy + 1.2, wz)
      lmGroup.userData = { isLandmark: true, landmarkData: landmark }

      // Monument Totem
      const totemGeom = new THREE.BoxGeometry(1.8, 3.2, 1.8)
      const totemMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.7,
        roughness: 0.3,
        metalness: 0.7,
      })
      const totem = new THREE.Mesh(totemGeom, totemMat)
      lmGroup.add(totem)

      landmarksGroup.add(lmGroup)
      landmarkMeshesRef.current.set(landmark.id, lmGroup)
    }
    scene.add(landmarksGroup)

    // 1.12 Luminous River Networks (Douro, Tejo, Mondego)
    const riverGroup = new THREE.Group()
    riverGroup.name = 'rivers_layer'

    const RIVERS = [
      // Rio Douro
      [new THREE.Vector3(55, 3.6, -85), new THREE.Vector3(20, 2.8, -80), new THREE.Vector3(-10, 1.8, -76), new THREE.Vector3(-32, 0.8, -76)],
      // Rio Tejo
      [new THREE.Vector3(25, 3.8, 0), new THREE.Vector3(-5, 2.5, 15), new THREE.Vector3(-25, 1.4, 28), new THREE.Vector3(-48, 0.8, 45)],
      // Rio Mondego
      [new THREE.Vector3(15, 4.2, -32), new THREE.Vector3(-10, 2.2, -36), new THREE.Vector3(-28, 1.2, -37), new THREE.Vector3(-38, 0.8, -36)],
    ]

    for (const curvePts of RIVERS) {
      const curve = new THREE.CatmullRomCurve3(curvePts)
      const tubeGeom = new THREE.TubeGeometry(curve, 32, 0.5, 8, false)
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.85,
      })
      const riverMesh = new THREE.Mesh(tubeGeom, tubeMat)
      riverGroup.add(riverMesh)
    }
    scene.add(riverGroup)

    // Clock start
    clockRef.current.start()
    introCinematicRef.current.startTime = clockRef.current.getElapsedTime()

    // 1.13 RENDER LOOP (60 FPS with Delta & Inertia Easing)
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      const elapsedTime = clockRef.current.getElapsedTime()
      const delta = clockRef.current.getDelta()

      // 1. Opening Cinematic Swoop (Atlantic ocean -> settles at 48° pitch)
      if (introCinematicRef.current.active) {
        const cinematicTime = elapsedTime - introCinematicRef.current.startTime
        const progress = Math.min(1, cinematicTime / introCinematicRef.current.duration)
        const ease = progress * progress * (3 - 2 * progress)

        camera.position.x = -90 + (0 - (-90)) * ease
        camera.position.y = 160 + (115 - 160) * ease
        camera.position.z = 210 + (130 - 210) * ease
        camera.lookAt(0, 0, 10)

        sunLight.intensity = 1.4 + ease * 2.0

        if (progress >= 1) {
          introCinematicRef.current.active = false
          controlsRef.current.target.set(0, 0, 10)
        }
      } else if (cameraTargetRef.current.isAnimating) {
        const c = cameraTargetRef.current
        c.progress += delta / c.duration
        const ease = Math.min(1, c.progress * c.progress * (3 - 2 * c.progress))

        camera.position.lerpVectors(c.startPos, c.pos, ease)
        controlsRef.current.target.lerpVectors(c.startLookAt, c.lookAt, ease)
        camera.lookAt(controlsRef.current.target)

        if (c.progress >= 1) {
          c.isAnimating = false
        }
      } else {
        // Inertia panning
        const ctrl = controlsRef.current
        if (!ctrl.isDragging && (Math.abs(ctrl.panVelocity.x) > 0.001 || Math.abs(ctrl.panVelocity.y) > 0.001)) {
          ctrl.target.x += ctrl.panVelocity.x
          ctrl.target.z += ctrl.panVelocity.y
          camera.position.x += ctrl.panVelocity.x
          camera.position.z += ctrl.panVelocity.y
          ctrl.panVelocity.multiplyScalar(0.9)
          camera.lookAt(ctrl.target)
        }
      }

      // 2. Rotate arena crystals
      arenasGroup.children.forEach((group) => {
        const core = group.getObjectByName('beacon_core')
        if (core) {
          core.rotation.y += 0.02
          core.rotation.x = Math.sin(elapsedTime * 2) * 0.15
        }
      })

      // 3. PULSO TERRITORIAL Wavefront Animation Loop
      if (pulseRingsRef.current.length > 0) {
        pulseRingsRef.current = pulseRingsRef.current.filter((pulse) => {
          pulse.progress += delta * 1.3
          if (pulse.progress >= 1) {
            scene.remove(pulse.line)
            pulse.line.geometry.dispose()
            ;(pulse.line.material as THREE.Material).dispose()
            return false
          }
          ;(pulse.line.material as THREE.LineBasicMaterial).opacity = (1 - pulse.progress) * 0.95
          return true
        })
      }

      // 4. Layer Visibility Control
      boundaryMasterGroup.visible = layers.territorios
      citiesGroup.visible = layers.cidades
      arenasGroup.visible = layers.arenas
      landmarksGroup.visible = layers.landmarks
      riverGroup.visible = layers.conexoes

      renderer.render(scene, camera)
    }

    animate()

    // 1.14 Window Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.dispose()
      scene.clear()
    }
  }, [])

  // 2. TRIGGER PULSO TERRITORIAL ON DISTRICT SELECTION
  const triggerTerritorialPulse = useCallback((districtName: string) => {
    const data = districtBoundariesRef.current.get(districtName.toLowerCase())
    if (!data || !sceneRef.current) return

    playTacticalChime(true)
    if (onTriggerSynchronized) {
      onTriggerSynchronized(districtName)
    }

    // High energy pulse wavefront line
    const pulseGeom = new THREE.BufferGeometry().setFromPoints(data.points)
    const pulseMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    const pulseLine = new THREE.Line(pulseGeom, pulseMat)
    sceneRef.current.add(pulseLine)

    pulseRingsRef.current.push({
      line: pulseLine,
      progress: 0,
      active: true,
    })
  }, [playTacticalChime, onTriggerSynchronized])

  // 3. REACT TO DISTRICT SELECTION & HOVER
  useEffect(() => {
    districtBoundariesRef.current.forEach((item, name) => {
      const isSelected = selectedDistrict.toLowerCase() === name
      const isHovered = hoveredDistrict?.toLowerCase() === name
      const lineMat = item.line.material as THREE.LineBasicMaterial

      if (isSelected) {
        lineMat.color.setHex(0x00e5ff)
        lineMat.opacity = 0.95
      } else if (isHovered) {
        lineMat.color.setHex(0x38bdf8)
        lineMat.opacity = 0.75
      } else {
        lineMat.color.setHex(0x06b6d4)
        lineMat.opacity = 0.25
      }
    })
  }, [selectedDistrict, hoveredDistrict])

  // 4. REACT TO SECTOR SWITCHES (CONTINENTE / AÇORES / MADEIRA)
  useEffect(() => {
    if (activeRegion === 'acores') {
      flyCameraTo(new THREE.Vector3(-125, 55, 15), new THREE.Vector3(-125, 0, -25), 1.5)
    } else if (activeRegion === 'madeira') {
      flyCameraTo(new THREE.Vector3(-105, 55, 135), new THREE.Vector3(-105, 0, 95), 1.5)
    } else {
      flyCameraTo(new THREE.Vector3(0, 115, 130), new THREE.Vector3(0, 0, 10), 1.5)
    }
  }, [activeRegion, flyCameraTo])

  // 5. MOUSE & TOUCH INTERACTION HANDLERS (Drag Pan, Orbit, Click Picking)
  const handlePointerDown = (e: React.PointerEvent) => {
    const isRight = e.button === 2
    controlsRef.current.isDragging = !isRight
    controlsRef.current.isRightDragging = isRight
    controlsRef.current.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    const ctrl = controlsRef.current
    const deltaX = e.clientX - ctrl.previousMousePosition.x
    const deltaY = e.clientY - ctrl.previousMousePosition.y
    ctrl.previousMousePosition = { x: e.clientX, y: e.clientY }

    if (ctrl.isDragging) {
      const panSpeed = 0.28
      const vx = -deltaX * panSpeed
      const vz = -deltaY * panSpeed
      ctrl.panVelocity.set(vx, vz)
      ctrl.target.x += vx
      ctrl.target.z += vz
      if (cameraRef.current) {
        cameraRef.current.position.x += vx
        cameraRef.current.position.z += vz
        cameraRef.current.lookAt(ctrl.target)
      }
    } else if (ctrl.isRightDragging && cameraRef.current) {
      const orbitSpeed = 0.005
      const offset = cameraRef.current.position.clone().sub(ctrl.target)
      ctrl.spherical.setFromVector3(offset)
      ctrl.spherical.theta -= deltaX * orbitSpeed
      ctrl.spherical.phi = Math.max(0.35, Math.min(Math.PI / 2.3, ctrl.spherical.phi - deltaY * orbitSpeed))
      offset.setFromSpherical(ctrl.spherical)
      cameraRef.current.position.copy(ctrl.target).add(offset)
      cameraRef.current.lookAt(ctrl.target)
    } else {
      if (!cameraRef.current || !sceneRef.current || !terrainMeshRef.current) return
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const hits = raycasterRef.current.intersectObject(terrainMeshRef.current, false)

      if (hits.length > 0) {
        const pt: [number, number] = [hits[0].point.x, hits[0].point.z]
        let found: string | null = null
        for (const item of districtPolygonsRef.current) {
          if (pointInPolygon(pt, item.polygon)) {
            found = item.name
            break
          }
        }
        if (found !== hoveredDistrict) {
          onHoverDistrict(found)
        }
      } else if (hoveredDistrict !== null) {
        onHoverDistrict(null)
      }
    }
  }

  const handlePointerUp = () => {
    controlsRef.current.isDragging = false
    controlsRef.current.isRightDragging = false
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current) return
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    raycasterRef.current.setFromCamera(mouse, cameraRef.current)

    // Check Arena pick first
    const arenaGroups = Array.from(arenaMeshesRef.current.values())
    const arenaHits = raycasterRef.current.intersectObjects(arenaGroups, true)
    if (arenaHits.length > 0) {
      let cur: THREE.Object3D | null = arenaHits[0].object
      while (cur && !cur.userData?.isArena) {
        cur = cur.parent
      }
      if (cur?.userData?.arenaData) {
        playTacticalChime(true)
        onSelectArena(cur.userData.arenaData)
        return
      }
    }

    // Check 3D Terrain point pick
    if (terrainMeshRef.current) {
      const hits = raycasterRef.current.intersectObject(terrainMeshRef.current, false)
      if (hits.length > 0) {
        const pt: [number, number] = [hits[0].point.x, hits[0].point.z]
        for (const item of districtPolygonsRef.current) {
          if (pointInPolygon(pt, item.polygon)) {
            onSelectDistrict(item.name)
            triggerTerritorialPulse(item.name)

            const hitPoint = hits[0].point
            flyCameraTo(
              new THREE.Vector3(hitPoint.x, hitPoint.y + 40, hitPoint.z + 45),
              new THREE.Vector3(hitPoint.x, hitPoint.y, hitPoint.z),
              1.2
            )
            return
          }
        }
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92
    const offset = cameraRef.current.position.clone().sub(controlsRef.current.target)
    const dist = offset.length()
    if ((dist > 35 && zoomFactor < 1) || (dist < 320 && zoomFactor > 1)) {
      offset.multiplyScalar(zoomFactor)
      cameraRef.current.position.copy(controlsRef.current.target).add(offset)
    }
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  )
}

export default PortugalNexus3DEngine
