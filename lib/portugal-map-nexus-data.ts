import { PORTUGAL_GEO_DATA, type DistrictGeoItem } from '@/lib/portugal-geo-data'
import { TERRITORY_METADATA, type TerritoryMetadata as TerritoryGeoMetadata } from '@/lib/territory-metadata'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import { getOfficialArenaImage } from '@/src/data/shopArenas'
import type { MapArenaPOI } from '@/components/portugal-map/types'

export interface NexusTerritory {
  id: string
  name: string
  canonicalName: string
  slug: string
  type: 'mainland' | 'island'
  region: 'Norte' | 'Centro' | 'Lisboa e Vale do Tejo' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira'
  center: [number, number] // [lng, lat]
  elevation: number // Normalized 3D height
  dominantColor: string
  accentColor: string
  capital: string
  motto: string
  tacticalTag: string
  populationStr: string
  pathSvg: string
  centroidSvg: [number, number]
  zoom3D: number
  pitch3D: number
  bearing3D: number
}

export interface NexusCity {
  id: string
  name: string
  district: string
  coordinates: [number, number] // [lng, lat]
  tier: 'capital' | 'major' | 'regional'
  population: string
  tag: string
}

export interface NexusLandmark {
  id: string
  name: string
  district: string
  coordinates: [number, number] // [lng, lat]
  era: string
  icon: string
  description: string
  futuristicArchetype: string
}

export interface NexusConnection {
  id: string
  fromCoords: [number, number] // [lng, lat]
  toCoords: [number, number] // [lng, lat]
  fromName: string
  toName: string
  type: 'trunk' | 'regional' | 'atlantic_relay'
  color?: string
}

export interface NexusEvent {
  id: string
  title: string
  district: string
  coordinates: [number, number]
  type: 'war' | 'tournament' | 'invasion'
  status: 'active' | 'upcoming' | 'concluded'
  description: string
  xpReward: number
}

// 1. RELEVO GEOGRÁFICO REAL DE PORTUGAL (Normalizado para Malha 3D)
const TERRITORY_ELEVATIONS: Record<string, number> = {
  'Guarda': 1.99,          // Serra da Estrela (Torre 1993m)
  'Açores': 2.35,          // Montanha do Pico (2351m)
  'Madeira': 1.86,         // Pico Ruivo (1862m)
  'Vila Real': 1.41,       // Serra do Marão / Alvão
  'Bragança': 1.32,        // Montesinho
  'Viseu': 1.15,           // Caramulo / Montemuro
  'Castelo Branco': 1.22,  // Gardunha
  'Braga': 1.05,           // Gerês / Cabreira
  'Viana do Castelo': 1.02,// Peneda-Gerês
  'Coimbra': 0.85,         // Lousã
  'Portalegre': 0.95,      // São Mamede
  'Faro': 0.65,            // Monchique
  'Leiria': 0.55,          // Aire e Candeeiros
  'Santarém': 0.45,        // Planície Ribatejana
  'Évora': 0.52,           // Planície Alentejana
  'Beja': 0.48,            // Baixo Alentejo
  'Lisboa': 0.58,          // Serra de Sintra
  'Setúbal': 0.50,         // Serra da Arrábida
  'Porto': 0.42,           // Litoral Norte / Foz do Douro
  'Aveiro': 0.32,          // Ria e Litoral plano
}

const TERRITORY_TAGS: Record<string, string> = {
  'Porto': 'NEXUS INVICTA // COMANDO NORTE',
  'Lisboa': 'CAPITAL IMPERIAL // NÚCLEO ZERO',
  'Braga': 'CIDADELA DO BERÇO // PROTOCOLO SACRO',
  'Coimbra': 'MATRIZ DOS SABERES // CIDADE UNIVERSAL',
  'Aveiro': 'BAÍA QUÂNTICA // ROTA DAS ÁGUAS',
  'Faro': 'BASTIÃO MERIDIONAL // COSTA DOURADA',
  'Vila Real': 'CORTIÇO TRANSMONTANO // FORJA DO OURO',
  'Viseu': 'FORTE DE VIRIATO // CORAÇÃO DAS BEIRAS',
  'Guarda': 'PINÁCULO DA ESTRELA // VIGIA DAS ALTURAS',
  'Castelo Branco': 'LINHA DA BEIRA // SENTINELA RAIA',
  'Leiria': 'CIDADELA DO PINHAL // ARCO GÓTICO',
  'Santarém': 'MIRADOURO DO RIBATEJO // VALE ESCARLATE',
  'Setúbal': 'BAÍA AZUL // GUARDA DO SADO',
  'Évora': 'TEMPLO DO ALENTEJO // MONUMENTO ETERNO',
  'Portalegre': 'POSTO DE SÃO MAMEDE // FRONTEIRA LESTE',
  'Beja': 'CAMPINA DOURADA // HORIZONTE PLANO',
  'Viana do Castelo': 'FALCÃO DO MINHO // ATLÂNTICO NORTE',
  'Bragança': 'FORTALEZA DO NORDESTE // CASTELO IMPÉRIO',
  'Açores': 'FORTALEZA ATLÂNTICA // PORTAL VULCÂNICO',
  'Madeira': 'PÉROLA OCEÂNICA // ARQUIPÉLAGO DE ESMERALDA',
}

const TERRITORY_POPULATION: Record<string, string> = {
  'Lisboa': '2.87M',
  'Porto': '1.74M',
  'Braga': '846K',
  'Setúbal': '875K',
  'Aveiro': '700K',
  'Faro': '467K',
  'Leiria': '470K',
  'Coimbra': '408K',
  'Santarém': '425K',
  'Viseu': '351K',
  'Viana do Castelo': '231K',
  'Vila Real': '185K',
  'Castelo Branco': '177K',
  'Açores': '242K',
  'Madeira': '250K',
  'Évora': '152K',
  'Guarda': '142K',
  'Beja': '144K',
  'Bragança': '122K',
  'Portalegre': '104K',
}

// 2. CONSTRUÇÃO CANÓNICA DOS 20 TERRITÓRIOS
export const CANONICAL_TERRITORIES: NexusTerritory[] = (() => {
  const geoMap = new Map<string, DistrictGeoItem>()
  for (const item of PORTUGAL_GEO_DATA) {
    geoMap.set(item.name.toLowerCase(), item)
  }

  const result: NexusTerritory[] = []

  for (const [name, meta] of Object.entries(TERRITORY_METADATA)) {
    const lower = name.toLowerCase()
    const geo = geoMap.get(lower)

    result.push({
      id: meta.id,
      name,
      canonicalName: meta.canonicalName,
      slug: meta.id,
      type: meta.type,
      region: meta.region,
      center: meta.center,
      elevation: TERRITORY_ELEVATIONS[name] ?? 0.8,
      dominantColor: meta.dominantColor,
      accentColor: meta.accentColor,
      capital: meta.capital,
      motto: meta.motto,
      tacticalTag: TERRITORY_TAGS[name] || `SETOR ${name.toUpperCase()}`,
      populationStr: TERRITORY_POPULATION[name] || '250K',
      pathSvg: geo?.path || '',
      centroidSvg: geo?.centroid || [400, 400],
      zoom3D: meta.zoom,
      pitch3D: meta.pitch,
      bearing3D: meta.bearing,
    })
  }

  return result
})()

export function getNexusTerritoryByName(name: string): NexusTerritory | undefined {
  if (!name) return undefined
  const query = name.toLowerCase().trim()
  return CANONICAL_TERRITORIES.find(
    (t) =>
      t.name.toLowerCase() === query ||
      t.id.toLowerCase() === query ||
      t.canonicalName.toLowerCase() === query
  )
}

// 3. CIDADES OFICIAIS DE PORTUGAL // REDE GEODÉSICA
export const CANONICAL_CITIES: NexusCity[] = [
  { id: 'city_lisboa', name: 'Lisboa', district: 'Lisboa', coordinates: [-9.1393, 38.7223], tier: 'capital', population: '545K', tag: 'Metrópole Alfa' },
  { id: 'city_porto', name: 'Porto', district: 'Porto', coordinates: [-8.6110, 41.1496], tier: 'capital', population: '231K', tag: 'Polo Invicta' },
  { id: 'city_braga', name: 'Braga', district: 'Braga', coordinates: [-8.4265, 41.5454], tier: 'major', population: '193K', tag: 'Arcebispado 2150' },
  { id: 'city_coimbra', name: 'Coimbra', district: 'Coimbra', coordinates: [-8.4265, 40.2075], tier: 'major', population: '140K', tag: 'Universidade Central' },
  { id: 'city_aveiro', name: 'Aveiro', district: 'Aveiro', coordinates: [-8.6538, 40.6405], tier: 'major', population: '80K', tag: 'Canal dos Moliceiros' },
  { id: 'city_faro', name: 'Faro', district: 'Faro', coordinates: [-7.9304, 37.0194], tier: 'major', population: '67K', tag: 'Ria Formosa Hub' },
  { id: 'city_funchal', name: 'Funchal', district: 'Madeira', coordinates: [-16.9085, 32.6500], tier: 'major', population: '105K', tag: 'Capital Insular Sul' },
  { id: 'city_ponta_delgada', name: 'Ponta Delgada', district: 'Açores', coordinates: [-25.6687, 37.7412], tier: 'major', population: '68K', tag: 'Portão Oceânico' },
  { id: 'city_setubal', name: 'Setúbal', district: 'Setúbal', coordinates: [-8.8926, 38.5244], tier: 'major', population: '123K', tag: 'Estuário do Sado' },
  { id: 'city_leiria', name: 'Leiria', district: 'Leiria', coordinates: [-8.8078, 39.7436], tier: 'regional', population: '63K', tag: 'Castelo do Lis' },
  { id: 'city_evora', name: 'Évora', district: 'Évora', coordinates: [-7.9068, 38.5714], tier: 'regional', population: '53K', tag: 'Acrópole Romana' },
  { id: 'city_guimaraes', name: 'Guimarães', district: 'Braga', coordinates: [-8.2902, 41.4425], tier: 'major', population: '156K', tag: 'Berço da Nação' },
  { id: 'city_sintra', name: 'Sintra', district: 'Lisboa', coordinates: [-9.3907, 38.8000], tier: 'major', population: '385K', tag: 'Serra Mística' },
  { id: 'city_santarem', name: 'Santarém', district: 'Santarém', coordinates: [-8.6833, 39.2333], tier: 'regional', population: '60K', tag: 'Capital do Gótico' },
  { id: 'city_viseu', name: 'Viseu', district: 'Viseu', coordinates: [-7.9103, 40.6575], tier: 'regional', population: '99K', tag: 'Cidade de Viriato' },
  { id: 'city_vila_real', name: 'Vila Real', district: 'Vila Real', coordinates: [-7.7441, 41.3006], tier: 'regional', population: '50K', tag: 'Portal do Douro' },
  { id: 'city_viana', name: 'Viana do Castelo', district: 'Viana do Castelo', coordinates: [-8.8329, 41.6918], tier: 'regional', population: '85K', tag: 'Foz do Lima' },
  { id: 'city_braganca', name: 'Bragança', district: 'Bragança', coordinates: [-6.7567, 41.8058], tier: 'regional', population: '35K', tag: 'Cidadela Nordeste' },
  { id: 'city_guarda', name: 'Guarda', district: 'Guarda', coordinates: [-7.2689, 40.5373], tier: 'regional', population: '40K', tag: 'Cidade Mais Alta' },
  { id: 'city_castelo_branco', name: 'Castelo Branco', district: 'Castelo Branco', coordinates: [-7.4917, 39.8222], tier: 'regional', population: '52K', tag: 'Beira Baixa' },
  { id: 'city_beja', name: 'Beja', district: 'Beja', coordinates: [-7.8632, 38.0151], tier: 'regional', population: '35K', tag: 'Torre de Menagem' },
  { id: 'city_portalegre', name: 'Portalegre', district: 'Portalegre', coordinates: [-7.4312, 39.2938], tier: 'regional', population: '22K', tag: 'Tapeçarias Reais' },
  { id: 'city_portimao', name: 'Portimão', district: 'Faro', coordinates: [-8.5379, 37.1386], tier: 'regional', population: '55K', tag: 'Costa Ocidental Sul' },
  { id: 'city_cascais', name: 'Cascais', district: 'Lisboa', coordinates: [-9.4215, 38.6979], tier: 'regional', population: '214K', tag: 'Vila da Costa' },
]

// 4. LANDMARKS HOLOGRÁFICOS OFICIAIS
export const CANONICAL_LANDMARKS: NexusLandmark[] = [
  {
    id: 'lm_torre_belem',
    name: 'Torre de Belém & Padrão Imperial',
    district: 'Lisboa',
    coordinates: [-9.216, 38.6916],
    era: 'Manuelino Futurista',
    icon: '🏛️',
    description: 'Baluarte ribeirinho de onde partiram as naus lusitanas, agora centro de comando geodésico.',
    futuristicArchetype: 'Fortress Beacon',
  },
  {
    id: 'lm_ponte_d_luis',
    name: 'Ponte D. Luís I',
    district: 'Porto',
    coordinates: [-8.6095, 41.1400],
    era: 'Engenharia de Ferro & Luz',
    icon: '🌉',
    description: 'Arco monumental de ferro que liga as margens do Rio Douro sob fluxos energéticos perpétuos.',
    futuristicArchetype: 'Quantum Energy Bridge',
  },
  {
    id: 'lm_bom_jesus',
    name: 'Santuário do Bom Jesus do Monte',
    district: 'Braga',
    coordinates: [-8.3773, 41.5546],
    era: 'Barroco Monumental',
    icon: '⚡',
    description: 'Escadório monumental que se eleva acima da névoa até o templo sagrado da fé minhota.',
    futuristicArchetype: 'Ascension Monolith',
  },
  {
    id: 'lm_palacio_pena',
    name: 'Palácio Nacional da Pena',
    district: 'Lisboa',
    coordinates: [-9.3907, 38.7877],
    era: 'Romantismo dos Reis',
    icon: '🏰',
    description: 'Castelo de torres douradas e escarlates no topo da Serra de Sintra, coroado de lendas.',
    futuristicArchetype: 'Sky Citadel',
  },
  {
    id: 'lm_univ_coimbra',
    name: 'Universidade Joanina dos Saberes',
    district: 'Coimbra',
    coordinates: [-8.4265, 40.2075],
    era: 'Iluminismo Lusitano',
    icon: '📜',
    description: 'A mais venerável academia do país onde o conhecimento lusitano é preservado há séculos.',
    futuristicArchetype: 'Archive of Antiquities',
  },
  {
    id: 'lm_templo_evora',
    name: 'Templo Romano de Diana',
    district: 'Évora',
    coordinates: [-7.9068, 38.5726],
    era: 'Império Romano',
    icon: '🏛️',
    description: 'Colunatas coríntias intactas erguidas há dois mil anos na colina mais alta do Alentejo.',
    futuristicArchetype: 'Ancestral Pillar',
  },
  {
    id: 'lm_castelo_guimaraes',
    name: 'Castelo de Guimarães (O Berço)',
    district: 'Braga',
    coordinates: [-8.2902, 41.4478],
    era: 'Fundação da Nacionalidade (1128)',
    icon: '⚔️',
    description: 'Onde ecoou o primeiro brado da independência e se forjou o escudo das quinas.',
    futuristicArchetype: 'Sovereign Keep',
  },
  {
    id: 'lm_mosteiro_batalha',
    name: 'Mosteiro de Santa Maria da Vitória',
    district: 'Leiria',
    coordinates: [-8.8258, 39.6599],
    era: 'Gótico e Capelas Imperfeitas',
    icon: '🛡️',
    description: 'Erguido em cumprimento de promessa real pela vitória inquestionável de Aljubarrota.',
    futuristicArchetype: 'Trophy Monument',
  },
  {
    id: 'lm_ponta_delgada',
    name: 'Portas da Cidade de Ponta Delgada',
    district: 'Açores',
    coordinates: [-25.6687, 37.7397],
    era: 'Século XVIII / Vulcânico',
    icon: '🌋',
    description: 'Três arcos de basalto negro que recebem os navegantes e guardam o coração das 9 ilhas.',
    futuristicArchetype: 'Oceanic Gate',
  },
  {
    id: 'lm_funchal_forte',
    name: 'Fortaleza de São Tiago & Cabo Girão',
    district: 'Madeira',
    coordinates: [-16.8995, 32.6475],
    era: 'Fortaleza Atlântica',
    icon: '🌊',
    description: 'Muralhas douradas sobre o oceano e a mais vertiginosa falésia da Europa.',
    futuristicArchetype: 'Island Bastion',
  },
]

// 5. CONEXÕES DE REDE LUSITANA (Geodésicas & Arcos Luminosos Minimalistas)
export const CANONICAL_CONNECTIONS: NexusConnection[] = [
  // Eixo Principal Norte-Sul
  { id: 'conn_porto_lisboa', fromCoords: [-8.6110, 41.1496], toCoords: [-9.1393, 38.7223], fromName: 'Porto', toName: 'Lisboa', type: 'trunk' },
  { id: 'conn_porto_braga', fromCoords: [-8.6110, 41.1496], toCoords: [-8.4265, 41.5454], fromName: 'Porto', toName: 'Braga', type: 'trunk' },
  { id: 'conn_porto_aveiro', fromCoords: [-8.6110, 41.1496], toCoords: [-8.6538, 40.6405], fromName: 'Porto', toName: 'Aveiro', type: 'regional' },
  { id: 'conn_aveiro_coimbra', fromCoords: [-8.6538, 40.6405], toCoords: [-8.4265, 40.2075], fromName: 'Aveiro', toName: 'Coimbra', type: 'regional' },
  { id: 'conn_coimbra_leiria', fromCoords: [-8.4265, 40.2075], toCoords: [-8.8078, 39.7436], fromName: 'Coimbra', toName: 'Leiria', type: 'regional' },
  { id: 'conn_leiria_lisboa', fromCoords: [-8.8078, 39.7436], toCoords: [-9.1393, 38.7223], fromName: 'Leiria', toName: 'Lisboa', type: 'regional' },

  // Eixo Sul & Alentejo
  { id: 'conn_lisboa_setubal', fromCoords: [-9.1393, 38.7223], toCoords: [-8.8926, 38.5244], fromName: 'Lisboa', toName: 'Setúbal', type: 'trunk' },
  { id: 'conn_setubal_evora', fromCoords: [-8.8926, 38.5244], toCoords: [-7.9068, 38.5714], fromName: 'Setúbal', toName: 'Évora', type: 'regional' },
  { id: 'conn_evora_beja', fromCoords: [-7.9068, 38.5714], toCoords: [-7.8632, 38.0151], fromName: 'Évora', toName: 'Beja', type: 'regional' },
  { id: 'conn_beja_faro', fromCoords: [-7.8632, 38.0151], toCoords: [-7.9304, 37.0194], fromName: 'Beja', toName: 'Faro', type: 'trunk' },

  // Eixo do Interior & Raia
  { id: 'conn_braga_vilareal', fromCoords: [-8.4265, 41.5454], toCoords: [-7.7441, 41.3006], fromName: 'Braga', toName: 'Vila Real', type: 'regional' },
  { id: 'conn_vilareal_braganca', fromCoords: [-7.7441, 41.3006], toCoords: [-6.7567, 41.8058], fromName: 'Vila Real', toName: 'Bragança', type: 'regional' },
  { id: 'conn_braganca_guarda', fromCoords: [-6.7567, 41.8058], toCoords: [-7.2689, 40.5373], fromName: 'Bragança', toName: 'Guarda', type: 'regional' },
  { id: 'conn_guarda_cbranco', fromCoords: [-7.2689, 40.5373], toCoords: [-7.4917, 39.8222], fromName: 'Guarda', toName: 'Castelo Branco', type: 'regional' },
  { id: 'conn_cbranco_portalegre', fromCoords: [-7.4917, 39.8222], toCoords: [-7.4312, 39.2938], fromName: 'Castelo Branco', toName: 'Portalegre', type: 'regional' },
  { id: 'conn_portalegre_evora', fromCoords: [-7.4312, 39.2938], toCoords: [-7.9068, 38.5714], fromName: 'Portalegre', toName: 'Évora', type: 'regional' },

  // Relés Atlânticos (Conexão Fisiológica das Ilhas ao Continente)
  { id: 'conn_lisboa_acores', fromCoords: [-9.1393, 38.7223], toCoords: [-25.6687, 37.7412], fromName: 'Lisboa', toName: 'Açores', type: 'atlantic_relay', color: '#38bdf8' },
  { id: 'conn_lisboa_madeira', fromCoords: [-9.1393, 38.7223], toCoords: [-16.9085, 32.6500], fromName: 'Lisboa', toName: 'Madeira', type: 'atlantic_relay', color: '#e11d48' },
  { id: 'conn_acores_madeira', fromCoords: [-25.6687, 37.7412], toCoords: [-16.9085, 32.6500], fromName: 'Açores', toName: 'Madeira', type: 'atlantic_relay', color: '#10b981' },
]

// 6. EVENTOS TEMPORÁRIOS // ATIVIDADE DINÂMICA
export const CANONICAL_EVENTS: NexusEvent[] = [
  {
    id: 'evt_guerra_douro',
    title: 'Guerra do Douro',
    district: 'Porto',
    coordinates: [-8.6110, 41.1496],
    type: 'war',
    status: 'active',
    description: 'Batalha territorial pelo domínio das margens e pontes da Invicta.',
    xpReward: 2500,
  },
  {
    id: 'evt_torneio_nacional',
    title: 'Torneio Imperial do Tejo',
    district: 'Lisboa',
    coordinates: [-9.1393, 38.7223],
    type: 'tournament',
    status: 'active',
    description: 'Competição suprema de mestres no Terreiro do Paço.',
    xpReward: 5000,
  },
  {
    id: 'evt_invasao_sul',
    title: 'Invasão da Costa Sul',
    district: 'Faro',
    coordinates: [-7.9304, 37.0194],
    type: 'invasion',
    status: 'upcoming',
    description: 'Disputa feroz pelas fortificações marítimas do Algarve.',
    xpReward: 3200,
  },
]

// 7. ARENAS CANÓNICAS COM IMAGENS VERIFICADAS
export const CANONICAL_ARENAS: MapArenaPOI[] = OFFICIAL_MAP_ARENAS.map((arena) => ({
  ...arena,
  image: getOfficialArenaImage(arena.id) || arena.image || '/arenas/praca-liberdade.jpg',
}))

export function getCanonicalArenaById(id: string): MapArenaPOI | undefined {
  if (!id) return undefined
  const query = id.toLowerCase().trim()
  return CANONICAL_ARENAS.find((a) => a.id.toLowerCase() === query)
}
