import { DEFAULT_AVATAR } from '@/lib/avatars'

export const DEFAULT_AVATAR_URL = DEFAULT_AVATAR.image // '/images/avatars/camoes-2050.jpg'
export const DEFAULT_AVATAR_ID = DEFAULT_AVATAR.id // 'camoes_2050'

export const PORTUGAL_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
] as const

export type PortugalDistrict = typeof PORTUGAL_DISTRICTS[number]
