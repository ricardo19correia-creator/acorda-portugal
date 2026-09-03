import type { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson'

export interface TerritoryGeoMetadata {
  id: string
  name: string
  canonicalName: string
  type: 'mainland' | 'island'
  center: [number, number] // [lng, lat]
  zoom: number
  pitch: number
  bearing: number
  dominantColor: string
  accentColor: string
  capital: string
  motto: string
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira'
}

export const TERRITORY_METADATA: Record<string, TerritoryGeoMetadata> = {
  'Aveiro': {
    id: 'aveiro',
    name: 'Aveiro',
    canonicalName: 'Aveiro',
    type: 'mainland',
    center: [-8.6538, 40.6405],
    zoom: 9.2,
    pitch: 60,
    bearing: -10,
    dominantColor: '#38bdf8',
    accentColor: '#0284c7',
    capital: 'Aveiro',
    motto: 'Veneza de Portugal & Rota dos Moliceiros',
    region: 'Centro',
  },
  'Beja': {
    id: 'beja',
    name: 'Beja',
    canonicalName: 'Beja',
    type: 'mainland',
    center: [-7.8632, 38.0151],
    zoom: 8.4,
    pitch: 58,
    bearing: 5,
    dominantColor: '#eab308',
    accentColor: '#ca8a04',
    capital: 'Beja',
    motto: 'Coração Dourado do Baixo Alentejo',
    region: 'Alentejo',
  },
  'Braga': {
    id: 'braga',
    name: 'Braga',
    canonicalName: 'Braga',
    type: 'mainland',
    center: [-8.4265, 41.5454],
    zoom: 9.3,
    pitch: 62,
    bearing: -15,
    dominantColor: '#ef4444',
    accentColor: '#b91c1c',
    capital: 'Braga',
    motto: 'Cidade dos Arcebispos & Berço Guerreiro',
    region: 'Norte',
  },
  'Bragança': {
    id: 'braganca',
    name: 'Bragança',
    canonicalName: 'Bragança',
    type: 'mainland',
    center: [-6.7572, 41.8058],
    zoom: 8.5,
    pitch: 64,
    bearing: -20,
    dominantColor: '#f97316',
    accentColor: '#c2410c',
    capital: 'Bragança',
    motto: 'Reino Maravilhoso de Trás-os-Montes',
    region: 'Norte',
  },
  'Castelo Branco': {
    id: 'castelo_branco',
    name: 'Castelo Branco',
    canonicalName: 'Castelo Branco',
    type: 'mainland',
    center: [-7.4912, 39.8222],
    zoom: 8.6,
    pitch: 60,
    bearing: 0,
    dominantColor: '#10b981',
    accentColor: '#059669',
    capital: 'Castelo Branco',
    motto: 'Guardiã da Beira Baixa & Rota Templária',
    region: 'Centro',
  },
  'Coimbra': {
    id: 'coimbra',
    name: 'Coimbra',
    canonicalName: 'Coimbra',
    type: 'mainland',
    center: [-8.4103, 40.2033],
    zoom: 8.9,
    pitch: 62,
    bearing: -8,
    dominantColor: '#06b6d4',
    accentColor: '#0891b2',
    capital: 'Coimbra',
    motto: 'Capital do Conhecimento & Cidade dos Poetas',
    region: 'Centro',
  },
  'Évora': {
    id: 'evora',
    name: 'Évora',
    canonicalName: 'Évora',
    type: 'mainland',
    center: [-7.9071, 38.5714],
    zoom: 8.5,
    pitch: 58,
    bearing: 10,
    dominantColor: '#f59e0b',
    accentColor: '#d97706',
    capital: 'Évora',
    motto: 'Cidade Museu & Património Sagrado do Alentejo',
    region: 'Alentejo',
  },
  'Faro': {
    id: 'faro',
    name: 'Faro',
    canonicalName: 'Faro',
    type: 'mainland',
    center: [-7.9304, 37.0194],
    zoom: 8.8,
    pitch: 60,
    bearing: 15,
    dominantColor: '#0ea5e9',
    accentColor: '#0284c7',
    capital: 'Faro',
    motto: 'Bastião do Sul & Reino dos Algarves',
    region: 'Algarve',
  },
  'Guarda': {
    id: 'guarda',
    name: 'Guarda',
    canonicalName: 'Guarda',
    type: 'mainland',
    center: [-7.2683, 40.5364],
    zoom: 8.7,
    pitch: 66,
    bearing: -12,
    dominantColor: '#8b5cf6',
    accentColor: '#6d28d9',
    capital: 'Guarda',
    motto: 'Cidade Mais Alta & Fortaleza das Beiras',
    region: 'Centro',
  },
  'Leiria': {
    id: 'leiria',
    name: 'Leiria',
    canonicalName: 'Leiria',
    type: 'mainland',
    center: [-8.8078, 39.7436],
    zoom: 8.9,
    pitch: 60,
    bearing: -5,
    dominantColor: '#10b981',
    accentColor: '#047857',
    capital: 'Leiria',
    motto: 'Pinhal d’El Rei & Castelo da Nacionalidade',
    region: 'Centro',
  },
  'Lisboa': {
    id: 'lisboa',
    name: 'Lisboa',
    canonicalName: 'Lisboa',
    type: 'mainland',
    center: [-9.1393, 38.7223],
    zoom: 9.6,
    pitch: 65,
    bearing: -15,
    dominantColor: '#ec4899',
    accentColor: '#db2777',
    capital: 'Lisboa',
    motto: 'Capital Imperial & Cidade das Sete Colinas',
    region: 'Lisboa e Vale do Tejo',
  },
  'Portalegre': {
    id: 'portalegre',
    name: 'Portalegre',
    canonicalName: 'Portalegre',
    type: 'mainland',
    center: [-7.4312, 39.2938],
    zoom: 8.6,
    pitch: 60,
    bearing: 5,
    dominantColor: '#84cc16',
    accentColor: '#65a30d',
    capital: 'Portalegre',
    motto: 'Porta do Alentejo & Serra de S. Mamede',
    region: 'Alentejo',
  },
  'Porto': {
    id: 'porto',
    name: 'Porto',
    canonicalName: 'Porto',
    type: 'mainland',
    center: [-8.6291, 41.1579],
    zoom: 9.6,
    pitch: 64,
    bearing: -18,
    dominantColor: '#3b82f6',
    accentColor: '#1d4ed8',
    capital: 'Porto',
    motto: 'Invicta Cidade & Berço da Pátria Lusitana',
    region: 'Norte',
  },
  'Santarém': {
    id: 'santarem',
    name: 'Santarém',
    canonicalName: 'Santarém',
    type: 'mainland',
    center: [-8.6833, 39.2333],
    zoom: 8.7,
    pitch: 58,
    bearing: -4,
    dominantColor: '#f97316',
    accentColor: '#ea580c',
    capital: 'Santarém',
    motto: 'Capital do Gótico & Campina do Ribatejo',
    region: 'Lisboa e Vale do Tejo',
  },
  'Setúbal': {
    id: 'setubal',
    name: 'Setúbal',
    canonicalName: 'Setúbal',
    type: 'mainland',
    center: [-8.8926, 38.5244],
    zoom: 8.9,
    pitch: 62,
    bearing: -10,
    dominantColor: '#06b6d4',
    accentColor: '#0891b2',
    capital: 'Setúbal',
    motto: 'Baía Azul do Sado & Serra da Arrábida',
    region: 'Lisboa e Vale do Tejo',
  },
  'Viana do Castelo': {
    id: 'viana_do_castelo',
    name: 'Viana do Castelo',
    canonicalName: 'Viana do Castelo',
    type: 'mainland',
    center: [-8.8329, 41.6918],
    zoom: 9.2,
    pitch: 64,
    bearing: -12,
    dominantColor: '#14b8a6',
    accentColor: '#0d9488',
    capital: 'Viana do Castelo',
    motto: 'Princesa do Lima & Tradição do Minho',
    region: 'Norte',
  },
  'Vila Real': {
    id: 'vila_real',
    name: 'Vila Real',
    canonicalName: 'Vila Real',
    type: 'mainland',
    center: [-7.7441, 41.3006],
    zoom: 8.9,
    pitch: 64,
    bearing: -16,
    dominantColor: '#a855f7',
    accentColor: '#9333ea',
    capital: 'Vila Real',
    motto: 'Corte de Trás-os-Montes & Alto Douro Vinhateiro',
    region: 'Norte',
  },
  'Viseu': {
    id: 'viseu',
    name: 'Viseu',
    canonicalName: 'Viseu',
    type: 'mainland',
    center: [-7.9103, 40.6575],
    zoom: 8.8,
    pitch: 62,
    bearing: -10,
    dominantColor: '#6366f1',
    accentColor: '#4f46e5',
    capital: 'Viseu',
    motto: 'Cidade de Viriato & Coração da Beira Alta',
    region: 'Centro',
  },
  'Açores': {
    id: 'acores',
    name: 'Região Autónoma dos Açores',
    canonicalName: 'Açores',
    type: 'island',
    center: [-28.0289, 38.5714],
    zoom: 7.2,
    pitch: 60,
    bearing: 0,
    dominantColor: '#38bdf8',
    accentColor: '#0284c7',
    capital: 'Ponta Delgada / Angra / Horta',
    motto: 'Arquipélago dos Vulcões & Fortaleza do Atlântico',
    region: 'Açores',
  },
  'Madeira': {
    id: 'madeira',
    name: 'Região Autónoma da Madeira',
    canonicalName: 'Madeira',
    type: 'island',
    center: [-16.9595, 32.7607],
    zoom: 9.3,
    pitch: 65,
    bearing: 15,
    dominantColor: '#e11d48',
    accentColor: '#be123c',
    capital: 'Funchal',
    motto: 'Pérola do Atlântico & Floresta Laurissilva',
    region: 'Madeira',
  },
}

/**
 * GeoJSON Polygons representativos em WGS84 para os 20 Territórios
 */
export const PORTUGAL_DISTRICTS_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Viana do Castelo', id: 'viana_do_castelo', density: 85, color: '#14b8a6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.89, 41.87], [-8.65, 42.15], [-8.15, 42.02], [-8.35, 41.68], [-8.87, 41.65], [-8.89, 41.87]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Braga', id: 'braga', density: 195, color: '#ef4444' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.87, 41.65], [-8.35, 41.68], [-7.98, 41.72], [-8.05, 41.35], [-8.72, 41.45], [-8.87, 41.65]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Porto', id: 'porto', density: 250, color: '#3b82f6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.72, 41.45], [-8.05, 41.35], [-8.12, 41.05], [-8.65, 40.98], [-8.74, 41.15], [-8.72, 41.45]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Vila Real', id: 'vila_real', density: 75, color: '#a855f7' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-7.98, 41.72], [-7.35, 41.85], [-7.25, 41.25], [-7.85, 41.12], [-8.05, 41.35], [-7.98, 41.72]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Bragança', id: 'braganca', density: 45, color: '#f97316' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-7.35, 41.85], [-6.45, 41.88], [-6.38, 41.35], [-7.15, 41.15], [-7.25, 41.25], [-7.35, 41.85]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Aveiro', id: 'aveiro', density: 160, color: '#38bdf8' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.74, 41.15], [-8.65, 40.98], [-8.25, 40.92], [-8.35, 40.42], [-8.78, 40.45], [-8.74, 41.15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Viseu', id: 'viseu', density: 90, color: '#6366f1' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.25, 40.92], [-7.85, 41.12], [-7.25, 41.05], [-7.45, 40.48], [-8.15, 40.45], [-8.25, 40.92]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Guarda', id: 'guarda', density: 60, color: '#8b5cf6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-7.25, 41.05], [-6.75, 41.12], [-6.82, 40.25], [-7.45, 40.28], [-7.45, 40.48], [-7.25, 41.05]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Coimbra', id: 'coimbra', density: 140, color: '#06b6d4' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.78, 40.45], [-8.15, 40.45], [-7.82, 40.05], [-8.55, 39.95], [-8.92, 40.15], [-8.78, 40.45]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Castelo Branco', id: 'castelo_branco', density: 70, color: '#10b981' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-7.82, 40.05], [-7.45, 40.28], [-6.88, 40.15], [-7.12, 39.55], [-7.95, 39.62], [-7.82, 40.05]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Leiria', id: 'leiria', density: 130, color: '#10b981' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.92, 40.15], [-8.55, 39.95], [-8.42, 39.52], [-9.15, 39.35], [-9.25, 39.75], [-8.92, 40.15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Santarém', id: 'santarem', density: 110, color: '#f97316' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.55, 39.95], [-7.95, 39.62], [-8.15, 38.95], [-8.85, 38.92], [-8.42, 39.52], [-8.55, 39.95]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Portalegre', id: 'portalegre', density: 50, color: '#84cc16' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-7.95, 39.62], [-7.12, 39.55], [-7.02, 38.95], [-7.85, 38.85], [-8.15, 38.95], [-7.95, 39.62]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Lisboa', id: 'lisboa', density: 280, color: '#ec4899' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-9.45, 38.95], [-9.05, 39.15], [-8.85, 38.92], [-9.05, 38.68], [-9.52, 38.68], [-9.45, 38.95]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Setúbal', id: 'setubal', density: 170, color: '#06b6d4' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-9.25, 38.68], [-8.65, 38.68], [-8.45, 37.85], [-8.85, 37.85], [-9.15, 38.45], [-9.25, 38.68]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Évora', id: 'evora', density: 65, color: '#f59e0b' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.15, 38.95], [-7.85, 38.85], [-7.15, 38.45], [-7.45, 38.05], [-8.35, 38.25], [-8.15, 38.95]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Beja', id: 'beja', density: 55, color: '#eab308' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.45, 38.25], [-7.45, 38.05], [-7.25, 37.45], [-8.65, 37.38], [-8.75, 37.85], [-8.45, 38.25]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Faro', id: 'faro', density: 150, color: '#0ea5e9' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-8.95, 37.05], [-7.35, 37.15], [-7.38, 37.45], [-8.85, 37.35], [-8.95, 37.05]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Açores', id: 'acores', density: 95, color: '#38bdf8' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // S. Miguel
          [[[-25.85, 37.75], [-25.15, 37.75], [-25.15, 37.95], [-25.85, 37.95], [-25.85, 37.75]]],
          // Terceira
          [[[-27.42, 38.65], [-27.02, 38.65], [-27.02, 38.82], [-27.42, 38.82], [-27.42, 38.65]]],
          // Pico / Faial / S. Jorge
          [[[-28.85, 38.45], [-28.05, 38.45], [-28.05, 38.75], [-28.85, 38.75], [-28.85, 38.45]]]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Madeira', id: 'madeira', density: 120, color: '#e11d48' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Madeira Ilha
          [[[-17.32, 32.62], [-16.65, 32.62], [-16.65, 32.92], [-17.32, 32.92], [-17.32, 32.62]]],
          // Porto Santo
          [[[-16.42, 33.02], [-16.25, 33.02], [-16.25, 33.12], [-16.42, 33.12], [-16.42, 33.02]]]
        ]
      }
    }
  ]
}

export function getTerritoryByName(name: string): TerritoryGeoMetadata | undefined {
  if (!name) return undefined
  const clean = name.trim().toLowerCase()
  for (const [key, val] of Object.entries(TERRITORY_METADATA)) {
    if (
      key.toLowerCase() === clean ||
      val.name.toLowerCase() === clean ||
      val.canonicalName.toLowerCase() === clean ||
      val.id.toLowerCase() === clean
    ) {
      return val
    }
  }
  return undefined
}
