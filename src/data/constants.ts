import { DEFAULT_AVATAR } from '@/lib/avatars'
import { VALID_DISTRICTS } from './districts'

export const DEFAULT_AVATAR_URL = DEFAULT_AVATAR.image
export const DEFAULT_AVATAR_ID = DEFAULT_AVATAR.id

export { VALID_DISTRICTS }
export const PORTUGAL_DISTRICTS = VALID_DISTRICTS
export type PortugalDistrict = (typeof VALID_DISTRICTS)[number]
