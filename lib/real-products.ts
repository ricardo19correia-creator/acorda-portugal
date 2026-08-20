// Catálogo oficial de pacotes com dinheiro real (Stripe) do Acorda Portugal
// O backend é a fonte de verdade para preços, recompensas e inventário.

export type RealProductType = 'coins' | 'pass' | 'pack'

export interface RealProductReward {
  euros: number
  xp?: number
  items?: Record<string, number>
  badge?: string
  vipPass?: boolean
}

export interface RealProduct {
  id: string
  name: string
  description: string
  type: RealProductType
  priceInCents: number // em cêntimos (ex: 299 = 2,99 €)
  currency: 'eur'
  badgeText?: string
  popular?: boolean
  bestValue?: boolean
  icon: string
  reward: RealProductReward
  active: boolean
}

export const REAL_PRODUCTS_CATALOG: RealProduct[] = [
  {
    id: 'coin_pack_starter',
    name: 'Saco de Moedas (€5.000)',
    description: 'Adiciona 5.000 € Acorda e 100 XP instantaneamente à tua conta.',
    type: 'coins',
    priceInCents: 299, // 2,99 €
    currency: 'eur',
    icon: 'Coins',
    badgeText: 'Iniciado',
    reward: {
      euros: 5000,
      xp: 100,
    },
    active: true,
  },
  {
    id: 'coin_pack_pro',
    name: 'Cofre Nacional (€15.000)',
    description: '15.000 € Acorda + 300 XP + 2x 50/50 e 2x Pistas de bónus.',
    type: 'coins',
    priceInCents: 799, // 7,99 €
    currency: 'eur',
    icon: 'Sparkles',
    popular: true,
    badgeText: 'Mais Popular',
    reward: {
      euros: 15000,
      xp: 300,
      items: {
        consumable_50_50: 2,
        consumable_pista: 2,
      },
    },
    active: true,
  },
  {
    id: 'coin_pack_ultimate',
    name: 'Tesouro Lusitano (€50.000)',
    description: '50.000 € Acorda + 1.000 XP + Moldura Ouro Real de prestígio.',
    type: 'coins',
    priceInCents: 1999, // 19,99 €
    currency: 'eur',
    icon: 'Crown',
    bestValue: true,
    badgeText: 'Melhor Valor',
    reward: {
      euros: 50000,
      xp: 1000,
      items: {
        frame_ouro_real: 1,
      },
      badge: 'Patrono Real',
    },
    active: true,
  },
  {
    id: 'pass_patriota_vip',
    name: 'Passe Patriota VIP',
    description: 'Desbloqueia as recompensas da Temporada VIP, 2.500 € Acorda e Distintivo VIP exclusivo no perfil.',
    type: 'pass',
    priceInCents: 499, // 4,99 €
    currency: 'eur',
    icon: 'Shield',
    badgeText: 'Temporada',
    reward: {
      euros: 2500,
      xp: 500,
      vipPass: true,
      badge: 'Membro VIP',
    },
    active: true,
  },
  {
    id: 'pack_conquistador',
    name: 'Pack Conquistador Distrital',
    description: '10.000 € Acorda + 5x 50/50 + 5x Congelar Tempo + Moldura Azulejo Nobre + Título «Guardião Lusitano».',
    type: 'pack',
    priceInCents: 999, // 9,99 €
    currency: 'eur',
    icon: 'Award',
    badgeText: 'Edição Especial',
    reward: {
      euros: 10000,
      xp: 400,
      items: {
        consumable_50_50: 5,
        consumable_congelar_tempo: 5,
        frame_azulejo_nobre: 1,
        title_guardiao_lusitano: 1,
      },
    },
    active: true,
  },
]

export function getRealProductById(id: string): RealProduct | undefined {
  return REAL_PRODUCTS_CATALOG.find((p) => p.id === id && p.active)
}
