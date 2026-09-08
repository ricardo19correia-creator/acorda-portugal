// Cidades Canónicas de Portugal com Coordenadas SVG Exatas para o Mapa Vetorial Nacional

export interface PortugalCity {
  id: string
  name: string
  districtId: string
  districtName: string
  coordinates: [number, number] // [lng, lat]
  x: number // SVG X
  y: number // SVG Y
  isCapital: boolean
  tier: 'capital' | 'major' | 'regional'
  population: string
  tag: string
}

export const PORTUGAL_CITIES: PortugalCity[] = [
  {
    "id": "city_lisboa",
    "name": "Lisboa",
    "districtId": "lisboa",
    "districtName": "Lisboa",
    "coordinates": [
      -9.1393,
      38.7223
    ],
    "isCapital": true,
    "tier": "capital",
    "population": "545K",
    "tag": "Metrópole Alfa",
    "x": 315,
    "y": 538.6
  },
  {
    "id": "city_porto",
    "name": "Porto",
    "districtId": "porto",
    "districtName": "Porto",
    "coordinates": [
      -8.611,
      41.1496
    ],
    "isCapital": true,
    "tier": "capital",
    "population": "231K",
    "tag": "Polo Invicta",
    "x": 374.5,
    "y": 181.6
  },
  {
    "id": "city_braga",
    "name": "Braga",
    "districtId": "braga",
    "districtName": "Braga",
    "coordinates": [
      -8.4265,
      41.5454
    ],
    "isCapital": true,
    "tier": "major",
    "population": "193K",
    "tag": "Cidade dos Arcebispos",
    "x": 395.3,
    "y": 122.2
  },
  {
    "id": "city_coimbra",
    "name": "Coimbra",
    "districtId": "coimbra",
    "districtName": "Coimbra",
    "coordinates": [
      -8.4265,
      40.2075
    ],
    "isCapital": true,
    "tier": "major",
    "population": "140K",
    "tag": "Universidade Central",
    "x": 395.3,
    "y": 321.7
  },
  {
    "id": "city_aveiro",
    "name": "Aveiro",
    "districtId": "aveiro",
    "districtName": "Aveiro",
    "coordinates": [
      -8.6538,
      40.6405
    ],
    "isCapital": true,
    "tier": "major",
    "population": "80K",
    "tag": "Veneza de Portugal",
    "x": 369.7,
    "y": 257.6
  },
  {
    "id": "city_faro",
    "name": "Faro",
    "districtId": "faro",
    "districtName": "Faro",
    "coordinates": [
      -7.9304,
      37.0194
    ],
    "isCapital": true,
    "tier": "major",
    "population": "67K",
    "tag": "Capital Algarvia",
    "x": 451.3,
    "y": 781.9
  },
  {
    "id": "city_setubal",
    "name": "Setúbal",
    "districtId": "setubal",
    "districtName": "Setúbal",
    "coordinates": [
      -8.8926,
      38.5244
    ],
    "isCapital": true,
    "tier": "major",
    "population": "123K",
    "tag": "Baía do Sado",
    "x": 342.8,
    "y": 567.2
  },
  {
    "id": "city_leiria",
    "name": "Leiria",
    "districtId": "leiria",
    "districtName": "Leiria",
    "coordinates": [
      -8.8078,
      39.7436
    ],
    "isCapital": true,
    "tier": "major",
    "population": "63K",
    "tag": "Castelo do Lis",
    "x": 352.4,
    "y": 389.9
  },
  {
    "id": "city_santarem",
    "name": "Santarém",
    "districtId": "santarem",
    "districtName": "Santarém",
    "coordinates": [
      -8.6833,
      39.2333
    ],
    "isCapital": true,
    "tier": "major",
    "population": "60K",
    "tag": "Miradouro do Ribatejo",
    "x": 366.4,
    "y": 464.5
  },
  {
    "id": "city_evora",
    "name": "Évora",
    "districtId": "evora",
    "districtName": "Évora",
    "coordinates": [
      -7.9068,
      38.5714
    ],
    "isCapital": true,
    "tier": "major",
    "population": "53K",
    "tag": "Templo Romano",
    "x": 453.9,
    "y": 560.4
  },
  {
    "id": "city_viseu",
    "name": "Viseu",
    "districtId": "viseu",
    "districtName": "Viseu",
    "coordinates": [
      -7.9103,
      40.6575
    ],
    "isCapital": true,
    "tier": "major",
    "population": "99K",
    "tag": "Cidade de Viriato",
    "x": 453.5,
    "y": 255
  },
  {
    "id": "city_vila_real",
    "name": "Vila Real",
    "districtId": "vila_real",
    "districtName": "Vila Real",
    "coordinates": [
      -7.7441,
      41.3006
    ],
    "isCapital": true,
    "tier": "major",
    "population": "50K",
    "tag": "Portal do Douro",
    "x": 472.3,
    "y": 159
  },
  {
    "id": "city_viana_do_castelo",
    "name": "Viana do Castelo",
    "districtId": "viana_do_castelo",
    "districtName": "Viana do Castelo",
    "coordinates": [
      -8.8329,
      41.6918
    ],
    "isCapital": true,
    "tier": "major",
    "population": "85K",
    "tag": "Foz do Lima",
    "x": 349.5,
    "y": 100.1
  },
  {
    "id": "city_braganca",
    "name": "Bragança",
    "districtId": "braganca",
    "districtName": "Bragança",
    "coordinates": [
      -6.7567,
      41.8058
    ],
    "isCapital": true,
    "tier": "major",
    "population": "35K",
    "tag": "Cidadela Nordeste",
    "x": 583.6,
    "y": 82.9
  },
  {
    "id": "city_guarda",
    "name": "Guarda",
    "districtId": "guarda",
    "districtName": "Guarda",
    "coordinates": [
      -7.2689,
      40.5373
    ],
    "isCapital": true,
    "tier": "major",
    "population": "40K",
    "tag": "Cidade Mais Alta",
    "x": 525.9,
    "y": 272.9
  },
  {
    "id": "city_castelo_branco",
    "name": "Castelo Branco",
    "districtId": "castelo_branco",
    "districtName": "Castelo Branco",
    "coordinates": [
      -7.4917,
      39.8222
    ],
    "isCapital": true,
    "tier": "major",
    "population": "52K",
    "tag": "Beira Baixa",
    "x": 500.7,
    "y": 378.4
  },
  {
    "id": "city_beja",
    "name": "Beja",
    "districtId": "beja",
    "districtName": "Beja",
    "coordinates": [
      -7.8632,
      38.0151
    ],
    "isCapital": true,
    "tier": "major",
    "population": "35K",
    "tag": "Torre de Menagem",
    "x": 458.9,
    "y": 640.3
  },
  {
    "id": "city_portalegre",
    "name": "Portalegre",
    "districtId": "portalegre",
    "districtName": "Portalegre",
    "coordinates": [
      -7.4312,
      39.2938
    ],
    "isCapital": true,
    "tier": "major",
    "population": "22K",
    "tag": "São Mamede",
    "x": 507.6,
    "y": 455.7
  },
  {
    "id": "city_ponta_delgada",
    "name": "Ponta Delgada",
    "districtId": "acores",
    "districtName": "Açores",
    "coordinates": [
      -25.6687,
      37.7412
    ],
    "isCapital": true,
    "tier": "capital",
    "population": "68K",
    "tag": "Portão dos Açores",
    "x": 204,
    "y": 174.3
  },
  {
    "id": "city_funchal",
    "name": "Funchal",
    "districtId": "madeira",
    "districtName": "Madeira",
    "coordinates": [
      -16.9085,
      32.65
    ],
    "isCapital": true,
    "tier": "capital",
    "population": "105K",
    "tag": "Pérola do Atlântico",
    "x": 105.8,
    "y": 581.3
  },
  {
    "id": "city_guimaraes",
    "name": "Guimarães",
    "districtId": "braga",
    "districtName": "Braga",
    "coordinates": [
      -8.2902,
      41.4425
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "156K",
    "tag": "Berço da Nação",
    "x": 410.7,
    "y": 137.7
  },
  {
    "id": "city_sintra",
    "name": "Sintra",
    "districtId": "lisboa",
    "districtName": "Lisboa",
    "coordinates": [
      -9.3907,
      38.8
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "385K",
    "tag": "Serra Mística",
    "x": 286.6,
    "y": 527.4
  },
  {
    "id": "city_cascais",
    "name": "Cascais",
    "districtId": "lisboa",
    "districtName": "Lisboa",
    "coordinates": [
      -9.4215,
      38.6979
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "214K",
    "tag": "Vila da Costa",
    "x": 283.2,
    "y": 542.1
  },
  {
    "id": "city_portimao",
    "name": "Portimão",
    "districtId": "faro",
    "districtName": "Faro",
    "coordinates": [
      -8.5379,
      37.1386
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "55K",
    "tag": "Barlavento",
    "x": 382.8,
    "y": 765
  },
  {
    "id": "city_figueira_da_foz",
    "name": "Figueira da Foz",
    "districtId": "coimbra",
    "districtName": "Coimbra",
    "coordinates": [
      -8.855,
      40.1508
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "62K",
    "tag": "Foz do Mondego",
    "x": 347,
    "y": 330.1
  },
  {
    "id": "city_chaves",
    "name": "Chaves",
    "districtId": "vila_real",
    "districtName": "Vila Real",
    "coordinates": [
      -7.4716,
      41.7408
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "41K",
    "tag": "Termas Romanas",
    "x": 503,
    "y": 92.7
  },
  {
    "id": "city_covilha",
    "name": "Covilhã",
    "districtId": "castelo_branco",
    "districtName": "Castelo Branco",
    "coordinates": [
      -7.5028,
      40.2828
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "51K",
    "tag": "Porta da Estrela",
    "x": 499.5,
    "y": 310.6
  },
  {
    "id": "city_elvas",
    "name": "Elvas",
    "districtId": "portalegre",
    "districtName": "Portalegre",
    "coordinates": [
      -7.1628,
      38.8814
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "20K",
    "tag": "Fortaleza Raiana",
    "x": 537.8,
    "y": 515.6
  },
  {
    "id": "city_peniche",
    "name": "Peniche",
    "districtId": "leiria",
    "districtName": "Leiria",
    "coordinates": [
      -9.3811,
      39.3558
    ],
    "isCapital": false,
    "tier": "regional",
    "population": "27K",
    "tag": "Cabo Carvoeiro",
    "x": 287.7,
    "y": 446.6
  }
]

export function getCitiesByDistrict(districtNameOrId: string): PortugalCity[] {
  const q = districtNameOrId.toLowerCase().trim()
  return PORTUGAL_CITIES.filter(
    (c) => c.districtId.toLowerCase() === q || c.districtName.toLowerCase() === q
  )
}
