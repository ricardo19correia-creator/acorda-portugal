import { SHOP_CATALOG, type ShopItem } from '@/lib/economy'
import type { UserProfile, EquippedCosmetics } from '@/lib/game-data'

export type { EquippedCosmetics }

export function getEquippedCosmetics(profile: Partial<UserProfile> | null | undefined) {
  const equipped: EquippedCosmetics = (profile as any)?.equipped || {}
  const frameId = equipped.frame || null
  const titleId = equipped.title || null
  const themeId = equipped.theme || null
  const auraId = equipped.aura || null

  const frameItem: ShopItem | null = frameId ? SHOP_CATALOG.find((i) => i.id === frameId) || null : null
  const titleItem: ShopItem | null = titleId ? SHOP_CATALOG.find((i) => i.id === titleId) || null : null
  const themeItem: ShopItem | null = themeId ? SHOP_CATALOG.find((i) => i.id === themeId) || null : null
  const auraItem: ShopItem | null = auraId ? SHOP_CATALOG.find((i) => i.id === auraId) || null : null

  return {
    frameId,
    titleId,
    themeId,
    auraId,
    frameItem,
    titleItem,
    themeItem,
    auraItem,
  }
}

/**
 * Retorna as classes CSS de borda e efeito luminoso correspondentes à moldura equipada
 */
export function getFrameStyle(frameId?: string | null): string {
  switch (frameId) {
    case 'frame_verde_esperanca':
      return 'ring-4 ring-primary shadow-[0_0_22px_oklch(0.76_0.19_150/0.7)]'
    case 'frame_mar_portugues':
      return 'ring-4 ring-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.75)]'
    case 'frame_azulejo_nobre':
      return 'ring-4 ring-purple-400 shadow-[0_0_26px_rgba(192,132,252,0.8)]'
    case 'frame_ouro_real':
      return 'ring-4 ring-gold shadow-[0_0_32px_rgba(250,204,21,0.9)]'
    default:
      return 'ring-2 ring-primary/40'
  }
}

/**
 * Retorna o título a ser exibido: o título cosmético equipado se existir, caso contrário o título do nível
 */
export function getPlayerDisplayTitle(
  profile: Partial<UserProfile> | null | undefined,
  fallbackTitle: string = 'Navegador',
): string {
  const { titleItem } = getEquippedCosmetics(profile)
  if (titleItem) {
    return titleItem.name.replace(/^Título:\s*«?/, '').replace(/»?$/, '')
  }
  return fallbackTitle
}
