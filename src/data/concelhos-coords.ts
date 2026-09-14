// Tabela canónica oficial com as coordenadas exatas de todos os concelhos de Portugal
export interface ConcelhoGeoInfo {
  name: string
  district: string
  coordinates: [number, number] // [lng, lat]
}

export const PORTUGAL_CONCELHOS_COORDS: Record<string, ConcelhoGeoInfo> = {
  "santa cruz": {
    "name": "Santa Cruz",
    "district": "Madeira",
    "coordinates": [
      -16.77948,
      32.65869
    ]
  },
  "portalegre": {
    "name": "Portalegre",
    "district": "Portalegre",
    "coordinates": [
      -7.39957,
      39.26927
    ]
  },
  "marco de canaveses": {
    "name": "Marco De Canaveses",
    "district": "Porto",
    "coordinates": [
      -8.15831,
      41.15558
    ]
  },
  "monchique": {
    "name": "Monchique",
    "district": "Faro",
    "coordinates": [
      -8.59169,
      37.31617
    ]
  },
  "alijo": {
    "name": "Alijó",
    "district": "Vila Real",
    "coordinates": [
      -7.486,
      41.30381
    ]
  },
  "setubal": {
    "name": "Setúbal",
    "district": "Setúbal",
    "coordinates": [
      -8.88749,
      38.51613
    ]
  },
  "batalha": {
    "name": "Batalha",
    "district": "Leiria",
    "coordinates": [
      -8.76554,
      39.63705
    ]
  },
  "alandroal": {
    "name": "Alandroal",
    "district": "Évora",
    "coordinates": [
      -7.3829,
      38.61577
    ]
  },
  "loures": {
    "name": "Loures",
    "district": "Lisboa",
    "coordinates": [
      -9.15168,
      38.8613
    ]
  },
  "cinfaes": {
    "name": "Cinfães",
    "district": "Viseu",
    "coordinates": [
      -8.10258,
      41.03524
    ]
  },
  "obidos": {
    "name": "Óbidos",
    "district": "Leiria",
    "coordinates": [
      -9.18926,
      39.36333
    ]
  },
  "pampilhosa da serra": {
    "name": "Pampilhosa Da Serra",
    "district": "Coimbra",
    "coordinates": [
      -7.91637,
      40.08431
    ]
  },
  "tavira": {
    "name": "Tavira",
    "district": "Faro",
    "coordinates": [
      -7.73228,
      37.22516
    ]
  },
  "agueda": {
    "name": "Águeda",
    "district": "Aveiro",
    "coordinates": [
      -8.39564,
      40.58601
    ]
  },
  "seia": {
    "name": "Seia",
    "district": "Guarda",
    "coordinates": [
      -7.71916,
      40.37777
    ]
  },
  "pacos de ferreira": {
    "name": "Paços De Ferreira",
    "district": "Porto",
    "coordinates": [
      -8.38001,
      41.28852
    ]
  },
  "espinho": {
    "name": "Espinho",
    "district": "Aveiro",
    "coordinates": [
      -8.62583,
      40.99477
    ]
  },
  "sernancelhe": {
    "name": "Sernancelhe",
    "district": "Viseu",
    "coordinates": [
      -7.50709,
      40.91002
    ]
  },
  "alter do chao": {
    "name": "Alter Do Chão",
    "district": "Portalegre",
    "coordinates": [
      -7.72489,
      39.21298
    ]
  },
  "vila do conde": {
    "name": "Vila Do Conde",
    "district": "Porto",
    "coordinates": [
      -8.68285,
      41.33803
    ]
  },
  "aguiar da beira": {
    "name": "Aguiar Da Beira",
    "district": "Guarda",
    "coordinates": [
      -7.52839,
      40.78117
    ]
  },
  "olhao": {
    "name": "Olhão",
    "district": "Faro",
    "coordinates": [
      -7.81046,
      37.06204
    ]
  },
  "coruche": {
    "name": "Coruche",
    "district": "Santarém",
    "coordinates": [
      -8.44752,
      38.94022
    ]
  },
  "sobral de monte agraco": {
    "name": "Sobral De Monte Agraço",
    "district": "Lisboa",
    "coordinates": [
      -9.16072,
      38.99514
    ]
  },
  "aljustrel": {
    "name": "Aljustrel",
    "district": "Beja",
    "coordinates": [
      -8.18811,
      37.88786
    ]
  },
  "alcacer do sal": {
    "name": "Alcácer Do Sal",
    "district": "Setúbal",
    "coordinates": [
      -8.48087,
      38.36947
    ]
  },
  "porto santo": {
    "name": "Porto Santo",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -16.34383,
      33.06646
    ]
  },
  "angra do heroismo": {
    "name": "Angra Do Heroísmo",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -27.24886,
      38.70823
    ]
  },
  "arronches": {
    "name": "Arronches",
    "district": "Portalegre",
    "coordinates": [
      -7.24335,
      39.11686
    ]
  },
  "belmonte": {
    "name": "Belmonte",
    "district": "Castelo Branco",
    "coordinates": [
      -7.32967,
      40.33077
    ]
  },
  "barcelos": {
    "name": "Barcelos",
    "district": "Braga",
    "coordinates": [
      -8.62373,
      41.5367
    ]
  },
  "sabrosa": {
    "name": "Sabrosa",
    "district": "Vila Real",
    "coordinates": [
      -7.59864,
      41.25235
    ]
  },
  "celorico da beira": {
    "name": "Celorico Da Beira",
    "district": "Guarda",
    "coordinates": [
      -7.38494,
      40.62231
    ]
  },
  "avis": {
    "name": "Avis",
    "district": "Portalegre",
    "coordinates": [
      -7.91285,
      39.06969
    ]
  },
  "odivelas": {
    "name": "Odivelas",
    "district": "Lisboa",
    "coordinates": [
      -9.19928,
      38.79792
    ]
  },
  "moncao": {
    "name": "Monção",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.42637,
      42.02724
    ]
  },
  "alfandega da fe": {
    "name": "Alfândega Da Fé",
    "district": "Bragança",
    "coordinates": [
      -6.95112,
      41.34985
    ]
  },
  "arganil": {
    "name": "Arganil",
    "district": "Coimbra",
    "coordinates": [
      -7.98549,
      40.22904
    ]
  },
  "sabugal": {
    "name": "Sabugal",
    "district": "Guarda",
    "coordinates": [
      -7.03246,
      40.37328
    ]
  },
  "mogadouro": {
    "name": "Mogadouro",
    "district": "Bragança",
    "coordinates": [
      -6.67004,
      41.33338
    ]
  },
  "redondo": {
    "name": "Redondo",
    "district": "Évora",
    "coordinates": [
      -7.59878,
      38.62561
    ]
  },
  "sines": {
    "name": "Sines",
    "district": "Setúbal",
    "coordinates": [
      -8.77778,
      37.92489
    ]
  },
  "leiria": {
    "name": "Leiria",
    "district": "Leiria",
    "coordinates": [
      -8.80234,
      39.78948
    ]
  },
  "monforte": {
    "name": "Monforte",
    "district": "Portalegre",
    "coordinates": [
      -7.43539,
      39.04789
    ]
  },
  "vila nova de cerveira": {
    "name": "Vila Nova De Cerveira",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.70662,
      41.91728
    ]
  },
  "vila do porto": {
    "name": "Vila Do Porto",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -25.09937,
      36.97227
    ]
  },
  "corvo": {
    "name": "Corvo",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -31.10585,
      39.69993
    ]
  },
  "alcanena": {
    "name": "Alcanena",
    "district": "Santarém",
    "coordinates": [
      -8.6893,
      39.47236
    ]
  },
  "guarda": {
    "name": "Guarda",
    "district": "Guarda",
    "coordinates": [
      -7.24505,
      40.51952
    ]
  },
  "idanha a nova": {
    "name": "Idanha-a-nova",
    "district": "Castelo Branco",
    "coordinates": [
      -7.11304,
      39.90029
    ]
  },
  "ferreira do alentejo": {
    "name": "Ferreira Do Alentejo",
    "district": "Beja",
    "coordinates": [
      -8.18887,
      38.08825
    ]
  },
  "montijo": {
    "name": "Montijo",
    "district": "Setúbal",
    "coordinates": [
      -8.69357,
      38.72992
    ]
  },
  "serpa": {
    "name": "Serpa",
    "district": "Beja",
    "coordinates": [
      -7.48964,
      37.93294
    ]
  },
  "santo tirso": {
    "name": "Santo Tirso",
    "district": "Porto",
    "coordinates": [
      -8.44401,
      41.3209
    ]
  },
  "mesao frio": {
    "name": "Mesão Frio",
    "district": "Vila Real",
    "coordinates": [
      -7.87101,
      41.16392
    ]
  },
  "mondim de basto": {
    "name": "Mondim De Basto",
    "district": "Vila Real",
    "coordinates": [
      -7.89508,
      41.38872
    ]
  },
  "tabua": {
    "name": "Tábua",
    "district": "Coimbra",
    "coordinates": [
      -8.01519,
      40.33416
    ]
  },
  "santa maria da feira": {
    "name": "Santa Maria Da Feira",
    "district": "Aveiro",
    "coordinates": [
      -8.51052,
      40.96696
    ]
  },
  "palmela": {
    "name": "Palmela",
    "district": "Setúbal",
    "coordinates": [
      -8.80662,
      38.6178
    ]
  },
  "gouveia": {
    "name": "Gouveia",
    "district": "Guarda",
    "coordinates": [
      -7.58032,
      40.50137
    ]
  },
  "murca": {
    "name": "Murça",
    "district": "Vila Real",
    "coordinates": [
      -7.44074,
      41.4224
    ]
  },
  "sao joao da pesqueira": {
    "name": "São João Da Pesqueira",
    "district": "Viseu",
    "coordinates": [
      -7.438,
      41.11852
    ]
  },
  "sao bras de alportel": {
    "name": "São Brás De Alportel",
    "district": "Faro",
    "coordinates": [
      -7.87864,
      37.19568
    ]
  },
  "moimenta da beira": {
    "name": "Moimenta Da Beira",
    "district": "Viseu",
    "coordinates": [
      -7.63858,
      40.96427
    ]
  },
  "alcobaca": {
    "name": "Alcobaça",
    "district": "Leiria",
    "coordinates": [
      -8.99043,
      39.55242
    ]
  },
  "alpiarca": {
    "name": "Alpiarça",
    "district": "Santarém",
    "coordinates": [
      -8.57056,
      39.24113
    ]
  },
  "castro daire": {
    "name": "Castro Daire",
    "district": "Viseu",
    "coordinates": [
      -7.93292,
      40.91289
    ]
  },
  "vila real de santo antonio": {
    "name": "Vila Real De Santo António",
    "district": "Faro",
    "coordinates": [
      -7.51928,
      37.19434
    ]
  },
  "marvao": {
    "name": "Marvão",
    "district": "Portalegre",
    "coordinates": [
      -7.3628,
      39.40531
    ]
  },
  "boticas": {
    "name": "Boticas",
    "district": "Vila Real",
    "coordinates": [
      -7.73402,
      41.67595
    ]
  },
  "tondela": {
    "name": "Tondela",
    "district": "Viseu",
    "coordinates": [
      -8.1227,
      40.54336
    ]
  },
  "estremoz": {
    "name": "Estremoz",
    "district": "Évora",
    "coordinates": [
      -7.61368,
      38.84546
    ]
  },
  "vila nova de gaia": {
    "name": "Vila Nova De Gaia",
    "district": "Porto",
    "coordinates": [
      -8.58054,
      41.07444
    ]
  },
  "campo maior": {
    "name": "Campo Maior",
    "district": "Portalegre",
    "coordinates": [
      -7.05047,
      39.02619
    ]
  },
  "melgaco": {
    "name": "Melgaço",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.21331,
      42.04963
    ]
  },
  "vila pouca de aguiar": {
    "name": "Vila Pouca De Aguiar",
    "district": "Vila Real",
    "coordinates": [
      -7.62327,
      41.511
    ]
  },
  "santa comba dao": {
    "name": "Santa Comba Dão",
    "district": "Viseu",
    "coordinates": [
      -8.11564,
      40.40059
    ]
  },
  "castelo de vide": {
    "name": "Castelo De Vide",
    "district": "Portalegre",
    "coordinates": [
      -7.49332,
      39.46456
    ]
  },
  "povoacao": {
    "name": "Povoação",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -25.26019,
      37.76596
    ]
  },
  "penacova": {
    "name": "Penacova",
    "district": "Coimbra",
    "coordinates": [
      -8.26757,
      40.29756
    ]
  },
  "santa marta de penaguiao": {
    "name": "Santa Marta De Penaguião",
    "district": "Vila Real",
    "coordinates": [
      -7.80227,
      41.22807
    ]
  },
  "ribeira de pena": {
    "name": "Ribeira De Pena",
    "district": "Vila Real",
    "coordinates": [
      -7.79696,
      41.50889
    ]
  },
  "rio maior": {
    "name": "Rio Maior",
    "district": "Santarém",
    "coordinates": [
      -8.90142,
      39.32893
    ]
  },
  "lousada": {
    "name": "Lousada",
    "district": "Porto",
    "coordinates": [
      -8.27514,
      41.28553
    ]
  },
  "viana do castelo": {
    "name": "Viana Do Castelo",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.75937,
      41.71702
    ]
  },
  "maia": {
    "name": "Maia",
    "district": "Porto",
    "coordinates": [
      -8.60136,
      41.24495
    ]
  },
  "oliveira de azemeis": {
    "name": "Oliveira De Azeméis",
    "district": "Aveiro",
    "coordinates": [
      -8.46839,
      40.84221
    ]
  },
  "matosinhos": {
    "name": "Matosinhos",
    "district": "Porto",
    "coordinates": [
      -8.67143,
      41.21297
    ]
  },
  "vila real": {
    "name": "Vila Real",
    "district": "Vila Real",
    "coordinates": [
      -7.73862,
      41.31165
    ]
  },
  "lajes do pico": {
    "name": "Lajes Do Pico",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -28.22389,
      38.42997
    ]
  },
  "portel": {
    "name": "Portel",
    "district": "Évora",
    "coordinates": [
      -7.69672,
      38.30184
    ]
  },
  "arcos de valdevez": {
    "name": "Arcos De Valdevez",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.36452,
      41.90286
    ]
  },
  "ansiao": {
    "name": "Ansião",
    "district": "Leiria",
    "coordinates": [
      -8.43868,
      39.93416
    ]
  },
  "cuba": {
    "name": "Cuba",
    "district": "Beja",
    "coordinates": [
      -7.91351,
      38.19276
    ]
  },
  "moita": {
    "name": "Moita",
    "district": "Setúbal",
    "coordinates": [
      -9.0014,
      38.65353
    ]
  },
  "sever do vouga": {
    "name": "Sever Do Vouga",
    "district": "Aveiro",
    "coordinates": [
      -8.35201,
      40.7241
    ]
  },
  "fornos de algodres": {
    "name": "Fornos De Algodres",
    "district": "Guarda",
    "coordinates": [
      -7.5001,
      40.65104
    ]
  },
  "santiago do cacem": {
    "name": "Santiago Do Cacém",
    "district": "Setúbal",
    "coordinates": [
      -8.56807,
      37.95314
    ]
  },
  "montalegre": {
    "name": "Montalegre",
    "district": "Vila Real",
    "coordinates": [
      -7.85137,
      41.77559
    ]
  },
  "paredes": {
    "name": "Paredes",
    "district": "Porto",
    "coordinates": [
      -8.39613,
      41.18152
    ]
  },
  "gaviao": {
    "name": "Gavião",
    "district": "Portalegre",
    "coordinates": [
      -7.89501,
      39.43884
    ]
  },
  "barreiro": {
    "name": "Barreiro",
    "district": "Setúbal",
    "coordinates": [
      -9.04497,
      38.62843
    ]
  },
  "silves": {
    "name": "Silves",
    "district": "Faro",
    "coordinates": [
      -8.34585,
      37.27033
    ]
  },
  "trancoso": {
    "name": "Trancoso",
    "district": "Guarda",
    "coordinates": [
      -7.3347,
      40.79148
    ]
  },
  "nelas": {
    "name": "Nelas",
    "district": "Viseu",
    "coordinates": [
      -7.86521,
      40.52687
    ]
  },
  "oleiros": {
    "name": "Oleiros",
    "district": "Castelo Branco",
    "coordinates": [
      -7.87111,
      39.94458
    ]
  },
  "faro": {
    "name": "Faro",
    "district": "Faro",
    "coordinates": [
      -7.91824,
      37.05564
    ]
  },
  "lajes das flores": {
    "name": "Lajes Das Flores",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -31.2142,
      39.41365
    ]
  },
  "cadaval": {
    "name": "Cadaval",
    "district": "Lisboa",
    "coordinates": [
      -9.06755,
      39.23491
    ]
  },
  "torre de moncorvo": {
    "name": "Torre De Moncorvo",
    "district": "Bragança",
    "coordinates": [
      -7.0168,
      41.17259
    ]
  },
  "evora": {
    "name": "Évora",
    "district": "Évora",
    "coordinates": [
      -7.87022,
      38.53314
    ]
  },
  "reguengos de monsaraz": {
    "name": "Reguengos De Monsaraz",
    "district": "Évora",
    "coordinates": [
      -7.47743,
      38.39612
    ]
  },
  "armamar": {
    "name": "Armamar",
    "district": "Viseu",
    "coordinates": [
      -7.67757,
      41.09491
    ]
  },
  "chaves": {
    "name": "Chaves",
    "district": "Vila Real",
    "coordinates": [
      -7.43707,
      41.75021
    ]
  },
  "arraiolos": {
    "name": "Arraiolos",
    "district": "Évora",
    "coordinates": [
      -7.91637,
      38.78676
    ]
  },
  "amadora": {
    "name": "Amadora",
    "district": "Lisboa",
    "coordinates": [
      -9.2295,
      38.75981
    ]
  },
  "machico": {
    "name": "Machico",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -16.80231,
      32.74084
    ]
  },
  "alvaiazere": {
    "name": "Alvaiázere",
    "district": "Leiria",
    "coordinates": [
      -8.39541,
      39.81925
    ]
  },
  "trofa": {
    "name": "Trofa",
    "district": "Porto",
    "coordinates": [
      -8.56726,
      41.31137
    ]
  },
  "montemor o velho": {
    "name": "Montemor-o-velho",
    "district": "Coimbra",
    "coordinates": [
      -8.65846,
      40.21469
    ]
  },
  "sardoal": {
    "name": "Sardoal",
    "district": "Santarém",
    "coordinates": [
      -8.13851,
      39.56297
    ]
  },
  "almada": {
    "name": "Almada",
    "district": "Setúbal",
    "coordinates": [
      -9.19306,
      38.63563
    ]
  },
  "pombal": {
    "name": "Pombal",
    "district": "Leiria",
    "coordinates": [
      -8.6777,
      39.9266
    ]
  },
  "baiao": {
    "name": "Baião",
    "district": "Porto",
    "coordinates": [
      -7.98925,
      41.15757
    ]
  },
  "sao roque do pico": {
    "name": "São Roque Do Pico",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -28.31634,
      38.49537
    ]
  },
  "ponta delgada": {
    "name": "Ponta Delgada",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -25.7287,
      37.81939
    ]
  },
  "lagoa": {
    "name": "Lagoa",
    "district": "Faro",
    "coordinates": [
      -8.45328,
      37.12574
    ]
  },
  "vila franca do campo": {
    "name": "Vila Franca Do Campo",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -25.41776,
      37.74454
    ]
  },
  "sao pedro do sul": {
    "name": "São Pedro Do Sul",
    "district": "Viseu",
    "coordinates": [
      -8.09464,
      40.8164
    ]
  },
  "carregal do sal": {
    "name": "Carregal Do Sal",
    "district": "Viseu",
    "coordinates": [
      -7.98801,
      40.44978
    ]
  },
  "vinhais": {
    "name": "Vinhais",
    "district": "Bragança",
    "coordinates": [
      -7.04866,
      41.8325
    ]
  },
  "mora": {
    "name": "Mora",
    "district": "Évora",
    "coordinates": [
      -8.08882,
      38.9189
    ]
  },
  "penela": {
    "name": "Penela",
    "district": "Coimbra",
    "coordinates": [
      -8.36985,
      40.01012
    ]
  },
  "vila verde": {
    "name": "Vila Verde",
    "district": "Braga",
    "coordinates": [
      -8.44348,
      41.68076
    ]
  },
  "resende": {
    "name": "Resende",
    "district": "Viseu",
    "coordinates": [
      -7.93977,
      41.07622
    ]
  },
  "caldas da rainha": {
    "name": "Caldas Da Rainha",
    "district": "Leiria",
    "coordinates": [
      -9.0882,
      39.40757
    ]
  },
  "vila velha de rodao": {
    "name": "Vila Velha De Ródão",
    "district": "Castelo Branco",
    "coordinates": [
      -7.66377,
      39.68093
    ]
  },
  "sousel": {
    "name": "Sousel",
    "district": "Portalegre",
    "coordinates": [
      -7.73947,
      38.96152
    ]
  },
  "aveiro": {
    "name": "Aveiro",
    "district": "Aveiro",
    "coordinates": [
      -8.62829,
      40.6422
    ]
  },
  "ourem": {
    "name": "Ourém",
    "district": "Santarém",
    "coordinates": [
      -8.57423,
      39.69238
    ]
  },
  "nordeste": {
    "name": "Nordeste",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -25.21691,
      37.82355
    ]
  },
  "santana": {
    "name": "Santana",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -16.90513,
      32.7813
    ]
  },
  "almeirim": {
    "name": "Almeirim",
    "district": "Santarém",
    "coordinates": [
      -8.57999,
      39.15893
    ]
  },
  "manteigas": {
    "name": "Manteigas",
    "district": "Guarda",
    "coordinates": [
      -7.52006,
      40.39114
    ]
  },
  "mortagua": {
    "name": "Mortágua",
    "district": "Viseu",
    "coordinates": [
      -8.25315,
      40.41952
    ]
  },
  "felgueiras": {
    "name": "Felgueiras",
    "district": "Porto",
    "coordinates": [
      -8.20159,
      41.3506
    ]
  },
  "esposende": {
    "name": "Esposende",
    "district": "Braga",
    "coordinates": [
      -8.75799,
      41.54695
    ]
  },
  "torres novas": {
    "name": "Torres Novas",
    "district": "Santarém",
    "coordinates": [
      -8.55082,
      39.50555
    ]
  },
  "beja": {
    "name": "Beja",
    "district": "Beja",
    "coordinates": [
      -7.85591,
      37.96245
    ]
  },
  "covilha": {
    "name": "Covilhã",
    "district": "Castelo Branco",
    "coordinates": [
      -7.56261,
      40.25671
    ]
  },
  "alenquer": {
    "name": "Alenquer",
    "district": "Lisboa",
    "coordinates": [
      -9.03906,
      39.09816
    ]
  },
  "penalva do castelo": {
    "name": "Penalva Do Castelo",
    "district": "Viseu",
    "coordinates": [
      -7.65588,
      40.67131
    ]
  },
  "seixal": {
    "name": "Seixal",
    "district": "Setúbal",
    "coordinates": [
      -9.10879,
      38.60461
    ]
  },
  "nisa": {
    "name": "Nisa",
    "district": "Portalegre",
    "coordinates": [
      -7.66758,
      39.52287
    ]
  },
  "penedono": {
    "name": "Penedono",
    "district": "Viseu",
    "coordinates": [
      -7.39508,
      40.99124
    ]
  },
  "fafe": {
    "name": "Fafe",
    "district": "Braga",
    "coordinates": [
      -8.14826,
      41.47726
    ]
  },
  "vila flor": {
    "name": "Vila Flor",
    "district": "Bragança",
    "coordinates": [
      -7.15947,
      41.32169
    ]
  },
  "miranda do corvo": {
    "name": "Miranda Do Corvo",
    "district": "Coimbra",
    "coordinates": [
      -8.3274,
      40.10486
    ]
  },
  "peniche": {
    "name": "Peniche",
    "district": "Leiria",
    "coordinates": [
      -9.31943,
      39.33869
    ]
  },
  "salvaterra de magos": {
    "name": "Salvaterra De Magos",
    "district": "Santarém",
    "coordinates": [
      -8.68781,
      39.04673
    ]
  },
  "ponte de lima": {
    "name": "Ponte De Lima",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.58751,
      41.75742
    ]
  },
  "velas": {
    "name": "Velas",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -28.1505,
      38.68325
    ]
  },
  "ponta do sol": {
    "name": "Ponta Do Sol",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -17.09391,
      32.72279
    ]
  },
  "anadia": {
    "name": "Anadia",
    "district": "Aveiro",
    "coordinates": [
      -8.44278,
      40.45262
    ]
  },
  "oliveira do hospital": {
    "name": "Oliveira Do Hospital",
    "district": "Coimbra",
    "coordinates": [
      -7.86372,
      40.36846
    ]
  },
  "elvas": {
    "name": "Elvas",
    "district": "Portalegre",
    "coordinates": [
      -7.22886,
      38.9105
    ]
  },
  "vila nova da barquinha": {
    "name": "Vila Nova Da Barquinha",
    "district": "Santarém",
    "coordinates": [
      -8.40041,
      39.48168
    ]
  },
  "montemor o novo": {
    "name": "Montemor-o-novo",
    "district": "Évora",
    "coordinates": [
      -8.29614,
      38.64857
    ]
  },
  "serta": {
    "name": "Sertã",
    "district": "Castelo Branco",
    "coordinates": [
      -8.09918,
      39.82444
    ]
  },
  "freixo de espada a cinta": {
    "name": "Freixo De Espada À Cinta",
    "district": "Bragança",
    "coordinates": [
      -6.83272,
      41.11351
    ]
  },
  "borba": {
    "name": "Borba",
    "district": "Évora",
    "coordinates": [
      -7.46935,
      38.81653
    ]
  },
  "vila de rei": {
    "name": "Vila De Rei",
    "district": "Castelo Branco",
    "coordinates": [
      -8.14431,
      39.68312
    ]
  },
  "amares": {
    "name": "Amares",
    "district": "Braga",
    "coordinates": [
      -8.3453,
      41.65168
    ]
  },
  "peso da regua": {
    "name": "Peso Da Régua",
    "district": "Vila Real",
    "coordinates": [
      -7.76877,
      41.18327
    ]
  },
  "golega": {
    "name": "Golegã",
    "district": "Santarém",
    "coordinates": [
      -8.51105,
      39.38206
    ]
  },
  "benavente": {
    "name": "Benavente",
    "district": "Santarém",
    "coordinates": [
      -8.81105,
      38.86776
    ]
  },
  "lamego": {
    "name": "Lamego",
    "district": "Viseu",
    "coordinates": [
      -7.8225,
      41.08072
    ]
  },
  "loule": {
    "name": "Loulé",
    "district": "Faro",
    "coordinates": [
      -8.04692,
      37.22517
    ]
  },
  "murtosa": {
    "name": "Murtosa",
    "district": "Aveiro",
    "coordinates": [
      -8.67344,
      40.75775
    ]
  },
  "azambuja": {
    "name": "Azambuja",
    "district": "Lisboa",
    "coordinates": [
      -8.89686,
      39.13368
    ]
  },
  "vizela": {
    "name": "Vizela",
    "district": "Braga",
    "coordinates": [
      -8.29562,
      41.37332
    ]
  },
  "vila do bispo": {
    "name": "Vila Do Bispo",
    "district": "Faro",
    "coordinates": [
      -8.88346,
      37.08628
    ]
  },
  "cascais": {
    "name": "Cascais",
    "district": "Lisboa",
    "coordinates": [
      -9.401,
      38.72497
    ]
  },
  "mira": {
    "name": "Mira",
    "district": "Coimbra",
    "coordinates": [
      -8.75472,
      40.43307
    ]
  },
  "castro verde": {
    "name": "Castro Verde",
    "district": "Beja",
    "coordinates": [
      -8.02829,
      37.7047
    ]
  },
  "penamacor": {
    "name": "Penamacor",
    "district": "Castelo Branco",
    "coordinates": [
      -7.13677,
      40.17652
    ]
  },
  "vouzela": {
    "name": "Vouzela",
    "district": "Viseu",
    "coordinates": [
      -8.13925,
      40.67497
    ]
  },
  "grandola": {
    "name": "Grândola",
    "district": "Setúbal",
    "coordinates": [
      -8.58138,
      38.18553
    ]
  },
  "figueiro dos vinhos": {
    "name": "Figueiró Dos Vinhos",
    "district": "Leiria",
    "coordinates": [
      -8.28207,
      39.92521
    ]
  },
  "constancia": {
    "name": "Constância",
    "district": "Santarém",
    "coordinates": [
      -8.29149,
      39.4257
    ]
  },
  "lisboa": {
    "name": "Lisboa",
    "district": "Lisboa",
    "coordinates": [
      -9.15677,
      38.73767
    ]
  },
  "santa cruz da graciosa": {
    "name": "Santa Cruz Da Graciosa",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -28.01021,
      39.0522
    ]
  },
  "praia da vitoria": {
    "name": "Praia Da Vitória",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -27.15531,
      38.74685
    ]
  },
  "vila nova de famalicao": {
    "name": "Vila Nova De Famalicão",
    "district": "Braga",
    "coordinates": [
      -8.50337,
      41.40865
    ]
  },
  "tarouca": {
    "name": "Tarouca",
    "district": "Viseu",
    "coordinates": [
      -7.7621,
      41.01393
    ]
  },
  "mangualde": {
    "name": "Mangualde",
    "district": "Viseu",
    "coordinates": [
      -7.72009,
      40.59488
    ]
  },
  "povoa de lanhoso": {
    "name": "Póvoa De Lanhoso",
    "district": "Braga",
    "coordinates": [
      -8.25259,
      41.58823
    ]
  },
  "albufeira": {
    "name": "Albufeira",
    "district": "Faro",
    "coordinates": [
      -8.23265,
      37.13373
    ]
  },
  "castanheira de pera": {
    "name": "Castanheira De Pêra",
    "district": "Leiria",
    "coordinates": [
      -8.19581,
      40.01995
    ]
  },
  "mourao": {
    "name": "Mourão",
    "district": "Évora",
    "coordinates": [
      -7.27493,
      38.31821
    ]
  },
  "estarreja": {
    "name": "Estarreja",
    "district": "Aveiro",
    "coordinates": [
      -8.57575,
      40.76156
    ]
  },
  "valenca": {
    "name": "Valença",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.60635,
      41.99831
    ]
  },
  "crato": {
    "name": "Crato",
    "district": "Portalegre",
    "coordinates": [
      -7.64504,
      39.31332
    ]
  },
  "carrazeda de ansiaes": {
    "name": "Carrazeda De Ansiães",
    "district": "Bragança",
    "coordinates": [
      -7.30803,
      41.22803
    ]
  },
  "arruda dos vinhos": {
    "name": "Arruda Dos Vinhos",
    "district": "Lisboa",
    "coordinates": [
      -9.0942,
      38.97466
    ]
  },
  "tabuaco": {
    "name": "Tabuaço",
    "district": "Viseu",
    "coordinates": [
      -7.56556,
      41.09427
    ]
  },
  "valongo": {
    "name": "Valongo",
    "district": "Porto",
    "coordinates": [
      -8.49419,
      41.20669
    ]
  },
  "ferreira do zezere": {
    "name": "Ferreira Do Zêzere",
    "district": "Santarém",
    "coordinates": [
      -8.31688,
      39.72136
    ]
  },
  "caminha": {
    "name": "Caminha",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.79086,
      41.84756
    ]
  },
  "amarante": {
    "name": "Amarante",
    "district": "Porto",
    "coordinates": [
      -8.04208,
      41.27252
    ]
  },
  "mertola": {
    "name": "Mértola",
    "district": "Beja",
    "coordinates": [
      -7.70656,
      37.64679
    ]
  },
  "condeixa a nova": {
    "name": "Condeixa-a-nova",
    "district": "Coimbra",
    "coordinates": [
      -8.49963,
      40.09871
    ]
  },
  "nazare": {
    "name": "Nazaré",
    "district": "Leiria",
    "coordinates": [
      -9.04501,
      39.59457
    ]
  },
  "vendas novas": {
    "name": "Vendas Novas",
    "district": "Évora",
    "coordinates": [
      -8.51479,
      38.65501
    ]
  },
  "almodovar": {
    "name": "Almodôvar",
    "district": "Beja",
    "coordinates": [
      -8.08447,
      37.47499
    ]
  },
  "castelo branco": {
    "name": "Castelo Branco",
    "district": "Castelo Branco",
    "coordinates": [
      -7.50166,
      39.85484
    ]
  },
  "cantanhede": {
    "name": "Cantanhede",
    "district": "Coimbra",
    "coordinates": [
      -8.63734,
      40.35496
    ]
  },
  "lousa": {
    "name": "Lousã",
    "district": "Coimbra",
    "coordinates": [
      -8.22838,
      40.13177
    ]
  },
  "porto moniz": {
    "name": "Porto Moniz",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -17.14672,
      32.81702
    ]
  },
  "cmara de lobos": {
    "name": "Cmara De Lobos",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -16.97667,
      32.70229
    ]
  },
  "vidigueira": {
    "name": "Vidigueira",
    "district": "Beja",
    "coordinates": [
      -7.71706,
      38.16883
    ]
  },
  "cartaxo": {
    "name": "Cartaxo",
    "district": "Santarém",
    "coordinates": [
      -8.78962,
      39.1458
    ]
  },
  "mealhada": {
    "name": "Mealhada",
    "district": "Aveiro",
    "coordinates": [
      -8.44103,
      40.35377
    ]
  },
  "odemira": {
    "name": "Odemira",
    "district": "Beja",
    "coordinates": [
      -8.57685,
      37.60727
    ]
  },
  "castro marim": {
    "name": "Castro Marim",
    "district": "Faro",
    "coordinates": [
      -7.51685,
      37.29263
    ]
  },
  "celorico de basto": {
    "name": "Celorico De Basto",
    "district": "Braga",
    "coordinates": [
      -8.03963,
      41.40131
    ]
  },
  "vale de cambra": {
    "name": "Vale De Cambra",
    "district": "Aveiro",
    "coordinates": [
      -8.33624,
      40.83323
    ]
  },
  "sao joao da madeira": {
    "name": "São João Da Madeira",
    "district": "Aveiro",
    "coordinates": [
      -8.49037,
      40.89563
    ]
  },
  "alcoutim": {
    "name": "Alcoutim",
    "district": "Faro",
    "coordinates": [
      -7.65196,
      37.41982
    ]
  },
  "funchal": {
    "name": "Funchal",
    "district": "Madeira",
    "coordinates": [
      -16.88293,
      32.58842
    ]
  },
  "torres vedras": {
    "name": "Torres Vedras",
    "district": "Lisboa",
    "coordinates": [
      -9.26043,
      39.10489
    ]
  },
  "alcochete": {
    "name": "Alcochete",
    "district": "Setúbal",
    "coordinates": [
      -8.9159,
      38.73564
    ]
  },
  "vila nova de paiva": {
    "name": "Vila Nova De Paiva",
    "district": "Viseu",
    "coordinates": [
      -7.76337,
      40.87233
    ]
  },
  "miranda do douro": {
    "name": "Miranda Do Douro",
    "district": "Bragança",
    "coordinates": [
      -6.3585,
      41.51061
    ]
  },
  "cabeceiras de basto": {
    "name": "Cabeceiras De Basto",
    "district": "Braga",
    "coordinates": [
      -7.95391,
      41.54017
    ]
  },
  "macedo de cavaleiros": {
    "name": "Macedo De Cavaleiros",
    "district": "Bragança",
    "coordinates": [
      -6.9063,
      41.54337
    ]
  },
  "vimioso": {
    "name": "Vimioso",
    "district": "Bragança",
    "coordinates": [
      -6.53076,
      41.57073
    ]
  },
  "ovar": {
    "name": "Ovar",
    "district": "Aveiro",
    "coordinates": [
      -8.61983,
      40.87623
    ]
  },
  "abrantes": {
    "name": "Abrantes",
    "district": "Santarém",
    "coordinates": [
      -8.15785,
      39.42631
    ]
  },
  "arouca": {
    "name": "Arouca",
    "district": "Aveiro",
    "coordinates": [
      -8.25172,
      40.92876
    ]
  },
  "coimbra": {
    "name": "Coimbra",
    "district": "Coimbra",
    "coordinates": [
      -8.44618,
      40.21615
    ]
  },
  "sesimbra": {
    "name": "Sesimbra",
    "district": "Setúbal",
    "coordinates": [
      -9.12012,
      38.49493
    ]
  },
  "viana do alentejo": {
    "name": "Viana Do Alentejo",
    "district": "Évora",
    "coordinates": [
      -8.12242,
      38.38459
    ]
  },
  "terras de bouro": {
    "name": "Terras De Bouro",
    "district": "Braga",
    "coordinates": [
      -8.19119,
      41.73907
    ]
  },
  "satao": {
    "name": "Sátão",
    "district": "Viseu",
    "coordinates": [
      -7.67397,
      40.7703
    ]
  },
  "bombarral": {
    "name": "Bombarral",
    "district": "Leiria",
    "coordinates": [
      -9.15792,
      39.28409
    ]
  },
  "sintra": {
    "name": "Sintra",
    "district": "Lisboa",
    "coordinates": [
      -9.35766,
      38.82303
    ]
  },
  "guimaraes": {
    "name": "Guimarães",
    "district": "Braga",
    "coordinates": [
      -8.31556,
      41.46085
    ]
  },
  "figueira da foz": {
    "name": "Figueira Da Foz",
    "district": "Coimbra",
    "coordinates": [
      -8.80875,
      40.16889
    ]
  },
  "fundao": {
    "name": "Fundão",
    "district": "Castelo Branco",
    "coordinates": [
      -7.48244,
      40.12146
    ]
  },
  "ilhavo": {
    "name": "Ílhavo",
    "district": "Aveiro",
    "coordinates": [
      -8.69987,
      40.60617
    ]
  },
  "oliveira do bairro": {
    "name": "Oliveira Do Bairro",
    "district": "Aveiro",
    "coordinates": [
      -8.55152,
      40.51585
    ]
  },
  "braga": {
    "name": "Braga",
    "district": "Braga",
    "coordinates": [
      -8.42092,
      41.54448
    ]
  },
  "calheta de sao jorge": {
    "name": "Calheta De São Jorge",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -27.91422,
      38.59421
    ]
  },
  "moura": {
    "name": "Moura",
    "district": "Beja",
    "coordinates": [
      -7.28744,
      38.13343
    ]
  },
  "povoa de varzim": {
    "name": "Póvoa De Varzim",
    "district": "Porto",
    "coordinates": [
      -8.71789,
      41.41908
    ]
  },
  "paredes de coura": {
    "name": "Paredes De Coura",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.57211,
      41.91019
    ]
  },
  "meda": {
    "name": "Mêda",
    "district": "Guarda",
    "coordinates": [
      -7.25282,
      40.93665
    ]
  },
  "lagos": {
    "name": "Lagos",
    "district": "Faro",
    "coordinates": [
      -8.72801,
      37.15189
    ]
  },
  "valpacos": {
    "name": "Valpaços",
    "district": "Vila Real",
    "coordinates": [
      -7.34127,
      41.61184
    ]
  },
  "oeiras": {
    "name": "Oeiras",
    "district": "Lisboa",
    "coordinates": [
      -9.27631,
      38.71699
    ]
  },
  "vila franca de xira": {
    "name": "Vila Franca De Xira",
    "district": "Lisboa",
    "coordinates": [
      -8.9845,
      38.92211
    ]
  },
  "figueira de castelo rodrigo": {
    "name": "Figueira De Castelo Rodrigo",
    "district": "Guarda",
    "coordinates": [
      -6.95941,
      40.88447
    ]
  },
  "vila nova de poiares": {
    "name": "Vila Nova De Poiares",
    "district": "Coimbra",
    "coordinates": [
      -8.2504,
      40.21693
    ]
  },
  "porto de mos": {
    "name": "Porto De Mós",
    "district": "Leiria",
    "coordinates": [
      -8.81701,
      39.55792
    ]
  },
  "barrancos": {
    "name": "Barrancos",
    "district": "Beja",
    "coordinates": [
      -7.05219,
      38.14819
    ]
  },
  "gois": {
    "name": "Góis",
    "district": "Coimbra",
    "coordinates": [
      -8.08943,
      40.10254
    ]
  },
  "pinhel": {
    "name": "Pinhel",
    "district": "Guarda",
    "coordinates": [
      -7.11014,
      40.74196
    ]
  },
  "so vicente": {
    "name": "So Vicente",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -17.01093,
      32.78707
    ]
  },
  "ribeira grande": {
    "name": "Ribeira Grande",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -25.45498,
      37.8043
    ]
  },
  "calheta": {
    "name": "Calheta",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -17.18234,
      32.77028
    ]
  },
  "santa cruz das flores": {
    "name": "Santa Cruz Das Flores",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -31.19217,
      39.47149
    ]
  },
  "marinha grande": {
    "name": "Marinha Grande",
    "district": "Leiria",
    "coordinates": [
      -8.95264,
      39.78524
    ]
  },
  "vagos": {
    "name": "Vagos",
    "district": "Aveiro",
    "coordinates": [
      -8.68955,
      40.51546
    ]
  },
  "lourinha": {
    "name": "Lourinhã",
    "district": "Lisboa",
    "coordinates": [
      -9.26925,
      39.24651
    ]
  },
  "pedrogao grande": {
    "name": "Pedrógão Grande",
    "district": "Leiria",
    "coordinates": [
      -8.18258,
      39.93493
    ]
  },
  "ourique": {
    "name": "Ourique",
    "district": "Beja",
    "coordinates": [
      -8.2911,
      37.63992
    ]
  },
  "fronteira": {
    "name": "Fronteira",
    "district": "Portalegre",
    "coordinates": [
      -7.62664,
      39.07601
    ]
  },
  "porto": {
    "name": "Porto",
    "district": "Porto",
    "coordinates": [
      -8.62094,
      41.1617
    ]
  },
  "horta": {
    "name": "Horta",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -28.70024,
      38.57812
    ]
  },
  "braganca": {
    "name": "Bragança",
    "district": "Bragança",
    "coordinates": [
      -6.73526,
      41.77092
    ]
  },
  "soure": {
    "name": "Soure",
    "district": "Coimbra",
    "coordinates": [
      -8.61959,
      40.06679
    ]
  },
  "vila vicosa": {
    "name": "Vila Viçosa",
    "district": "Évora",
    "coordinates": [
      -7.35316,
      38.76889
    ]
  },
  "albergaria a velha": {
    "name": "Albergaria-a-velha",
    "district": "Aveiro",
    "coordinates": [
      -8.49548,
      40.70011
    ]
  },
  "gondomar": {
    "name": "Gondomar",
    "district": "Porto",
    "coordinates": [
      -8.48302,
      41.10961
    ]
  },
  "oliveira de frades": {
    "name": "Oliveira De Frades",
    "district": "Viseu",
    "coordinates": [
      -8.23838,
      40.70374
    ]
  },
  "santarem": {
    "name": "Santarém",
    "district": "Santarém",
    "coordinates": [
      -8.72919,
      39.33699
    ]
  },
  "macao": {
    "name": "Mação",
    "district": "Santarém",
    "coordinates": [
      -7.97488,
      39.60518
    ]
  },
  "mafra": {
    "name": "Mafra",
    "district": "Lisboa",
    "coordinates": [
      -9.30889,
      38.96114
    ]
  },
  "alvito": {
    "name": "Alvito",
    "district": "Beja",
    "coordinates": [
      -8.0415,
      38.24406
    ]
  },
  "proenca a nova": {
    "name": "Proença-a-nova",
    "district": "Castelo Branco",
    "coordinates": [
      -7.85578,
      39.7383
    ]
  },
  "chamusca": {
    "name": "Chamusca",
    "district": "Santarém",
    "coordinates": [
      -8.38035,
      39.27165
    ]
  },
  "castelo de paiva": {
    "name": "Castelo De Paiva",
    "district": "Aveiro",
    "coordinates": [
      -8.30304,
      41.01825
    ]
  },
  "ponte de sor": {
    "name": "Ponte De Sor",
    "district": "Portalegre",
    "coordinates": [
      -8.08241,
      39.18794
    ]
  },
  "viseu": {
    "name": "Viseu",
    "district": "Viseu",
    "coordinates": [
      -7.90559,
      40.68804
    ]
  },
  "ponte da barca": {
    "name": "Ponte Da Barca",
    "district": "Viana Do Castelo",
    "coordinates": [
      -8.30985,
      41.80673
    ]
  },
  "madalena": {
    "name": "Madalena",
    "district": "Região Autónoma Dos Açores",
    "coordinates": [
      -28.46262,
      38.48578
    ]
  },
  "ribeira brava": {
    "name": "Ribeira Brava",
    "district": "Região Autónoma Da Madeira",
    "coordinates": [
      -17.03245,
      32.70899
    ]
  },
  "vila nova de foz coa": {
    "name": "Vila Nova De Foz Côa",
    "district": "Guarda",
    "coordinates": [
      -7.16993,
      41.05265
    ]
  },
  "aljezur": {
    "name": "Aljezur",
    "district": "Faro",
    "coordinates": [
      -8.80085,
      37.29721
    ]
  },
  "entroncamento": {
    "name": "Entroncamento",
    "district": "Santarém",
    "coordinates": [
      -8.47866,
      39.46437
    ]
  },
  "vieira do minho": {
    "name": "Vieira Do Minho",
    "district": "Braga",
    "coordinates": [
      -8.10397,
      41.63148
    ]
  },
  "mirandela": {
    "name": "Mirandela",
    "district": "Bragança",
    "coordinates": [
      -7.18767,
      41.50846
    ]
  },
  "portimao": {
    "name": "Portimão",
    "district": "Faro",
    "coordinates": [
      -8.58305,
      37.19156
    ]
  },
  "almeida": {
    "name": "Almeida",
    "district": "Guarda",
    "coordinates": [
      -6.914,
      40.62297
    ]
  },
  "tomar": {
    "name": "Tomar",
    "district": "Santarém",
    "coordinates": [
      -8.38675,
      39.6029
    ]
  },
  "penafiel": {
    "name": "Penafiel",
    "district": "Porto",
    "coordinates": [
      -8.29381,
      41.15063
    ]
  }
}
