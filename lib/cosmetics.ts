import { SHOP_CATALOG, type ShopItem } from '@/lib/economy'
import type { UserProfile, EquippedCosmetics } from '@/lib/game-data'

export type { EquippedCosmetics }

export function getEquippedCosmetics(profile: Partial<UserProfile> | null | undefined) {
  const equipped: EquippedCosmetics = (profile as any)?.equipped || {}
  const frameId = equipped.frame || null
  const titleId = equipped.title || null
  const themeId = equipped.theme || null
  const auraId = equipped.aura || null
  const sfxId = equipped.sfx || null

  const frameItem: ShopItem | null = frameId ? SHOP_CATALOG.find((i) => i.id === frameId) || null : null
  const titleItem: ShopItem | null = titleId ? SHOP_CATALOG.find((i) => i.id === titleId) || null : null
  const themeItem: ShopItem | null = themeId ? SHOP_CATALOG.find((i) => i.id === themeId) || null : null
  const auraItem: ShopItem | null = auraId ? SHOP_CATALOG.find((i) => i.id === auraId) || null : null
  const sfxItem: ShopItem | null = sfxId ? SHOP_CATALOG.find((i) => i.id === sfxId) || null : null

  return {
    frameId,
    titleId,
    themeId,
    auraId,
    sfxId,
    frameItem,
    titleItem,
    themeItem,
    auraItem,
    sfxItem,
  }
}

/**
 * Retorna as classes CSS de borda e efeito luminoso correspondentes à moldura equipada
 */
export function getFrameStyle(frameId?: string | null): string {
  switch (frameId) {
    case 'frame_chama_sebastiao':
      return 'ring-4 ring-amber-500 shadow-[0_0_35px_rgba(239,68,68,0.95),0_0_18px_rgba(245,158,11,0.9)] animate-pulse'
    case 'frame_cyber_galo':
      return 'ring-4 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.9),0_0_12px_rgba(6,182,212,0.85)] border border-cyan-400'
    case 'frame_onda_nazare':
      return 'ring-4 ring-cyan-400 shadow-[0_0_28px_rgba(6,182,212,0.9),0_0_14px_rgba(59,130,246,0.8)]'
    case 'frame_padrao_descobrimentos':
      return 'ring-4 ring-emerald-600 shadow-[0_0_20px_rgba(5,150,105,0.8)] border border-white/20'
    case 'frame_ouro_real':
      return 'ring-4 ring-gold shadow-[0_0_32px_rgba(250,204,21,0.9)]'
    case 'frame_azulejo_nobre':
      return 'ring-4 ring-purple-400 shadow-[0_0_26px_rgba(192,132,252,0.8)]'
    case 'frame_mar_portugues':
      return 'ring-4 ring-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.75)]'
    case 'frame_verde_esperanca':
      return 'ring-4 ring-primary shadow-[0_0_22px_rgba(16,185,129,0.7)]'
    default:
      return 'ring-2 ring-primary/40'
  }
}

/**
 * Retorna o estilo do badge do título cosmético equipado
 */
export function getTitleBadgeStyle(titleId?: string | null): string {
  switch (titleId) {
    case 'title_rei_18_distritos':
      return 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
    case 'title_tuga_cibernetico':
      return 'bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-black shadow-[0_0_14px_rgba(16,185,129,0.6)]'
    case 'title_terror_do_quiz':
      return 'bg-red-950/90 border border-red-500 text-red-300 font-black shadow-[0_0_14px_rgba(239,68,68,0.6)]'
    case 'title_guardiao_lusitano':
      return 'bg-purple-950/90 border border-purple-400 text-purple-300 font-black shadow-[0_0_12px_rgba(192,132,252,0.5)]'
    case 'title_voz_do_povo':
      return 'bg-zinc-800/90 border border-zinc-400 text-zinc-200 font-bold shadow-sm'
    case 'title_patriota':
      return 'bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 font-bold'
    case 'title_lenda_viva':
      return 'bg-gradient-to-r from-purple-600 via-pink-500 to-gold text-white font-black shadow-[0_0_20px_rgba(234,179,8,0.8)]'
    default:
      return 'bg-white/10 border border-white/15 text-muted-foreground font-semibold'
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
