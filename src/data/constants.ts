import { DEFAULT_AVATAR } from '@/lib/avatars'
import { VALID_DISTRICTS } from './districts'

export const DEFAULT_AVATAR_URL = DEFAULT_AVATAR.image // '/images/avatars/camoes-2050.jpg'
export const DEFAULT_AVATAR_ID = DEFAULT_AVATAR.id // 'camoes_2050'

export { VALID_DISTRICTS }
export const PORTUGAL_DISTRICTS = VALID_DISTRICTS
export type PortugalDistrict = (typeof VALID_DISTRICTS)[number]
