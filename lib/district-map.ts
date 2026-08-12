export type DistrictMapEntry = {
  slug: string
  name: string
  svgId: string
}

// Minimal mapping between slug, display name and SVG element id
// Keep names identical to lib/game-data DISTRICTS.name when possible
export const DISTRICT_MAP: DistrictMapEntry[] = [
  { slug: 'porto', name: 'Porto', svgId: 'district-porto' },
  { slug: 'lisboa', name: 'Lisboa', svgId: 'district-lisboa' },
  { slug: 'braga', name: 'Braga', svgId: 'district-braga' },
  { slug: 'aveiro', name: 'Aveiro', svgId: 'district-aveiro' },
  { slug: 'beja', name: 'Beja', svgId: 'district-beja' },
  { slug: 'braganca', name: 'Braganca', svgId: 'district-braganca' },
  { slug: 'castelo-branco', name: 'Castelo Branco', svgId: 'district-castelo-branco' },
  { slug: 'coimbra', name: 'Coimbra', svgId: 'district-coimbra' },
  { slug: 'evora', name: 'Évora', svgId: 'district-evora' },
  { slug: 'faro', name: 'Faro', svgId: 'district-faro' },
  { slug: 'guarda', name: 'Guarda', svgId: 'district-guarda' },
  { slug: 'leiria', name: 'Leiria', svgId: 'district-leiria' },
  { slug: 'portalegre', name: 'Portalegre', svgId: 'district-portalegre' },
  { slug: 'santarem', name: 'Santarém', svgId: 'district-santarem' },
  { slug: 'setubal', name: 'Setúbal', svgId: 'district-setubal' },
  { slug: 'viana-do-castelo', name: 'Viana do Castelo', svgId: 'district-viana-do-castelo' },
  { slug: 'vila-real', name: 'Vila Real', svgId: 'district-vila-real' },
  { slug: 'viseu', name: 'Viseu', svgId: 'district-viseu' },
  { slug: 'acores', name: 'Açores', svgId: 'district-acores' },
  { slug: 'madeira', name: 'Madeira', svgId: 'district-madeira' },
]
