import type { Arena, ArenaRarity } from '@/src/types/arena'

export const getArenaRarityBadge = (rarity: ArenaRarity): string => {
  switch (rarity) {
    case 'Comum':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'Rara':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    case 'Épica':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Lendária':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
    case 'Mítica':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
    case 'Exclusiva':
      return 'bg-rose-600/30 text-rose-200 border-rose-400/60 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700'
  }
}

export interface ArenaDefinition {
  id: string
  name: string
  image: string
  price: number
  unlocked: boolean
  description?: string
  effect?: string
}

export const ARENAS: ArenaDefinition[] = [
  {
    id: "arena-1",
    name: "Arena 1",
    image: "/arenas/arena-1.jpg",
    price: 0,
    unlocked: true,
    description: "Cenário clássico da Praça do Império sob o sol dourado de Portugal.",
    effect: "particles",
  },
  {
    id: "arena-2",
    name: "Arena 2",
    image: "/arenas/arena-2.jpg",
    price: 100,
    unlocked: false,
    description: "Muralhas medievais e tochas acesas dos antigos defensores da pátria.",
    effect: "fire",
  },
  {
    id: "arena-3",
    name: "Arena 3",
    image: "/arenas/arena-3.jpg",
    price: 200,
    unlocked: false,
    description: "Oceano tempestuoso e ondas gigantes do canhão da Nazaré.",
    effect: "waves",
  },
  {
    id: "arena-4",
    name: "Arena 4",
    image: "/arenas/arena-4.jpg",
    price: 300,
    unlocked: false,
    description: "Santuário lendário do Rei Poeta banhado por luz dourada.",
    effect: "particles",
  },
  {
    id: "arena-5",
    name: "Arena 5",
    image: "/arenas/arena-5.jpg",
    price: 400,
    unlocked: false,
    description: "Arena clássica de duelo de elite com holofotes vibrantes.",
    effect: "particles",
  },
  {
    id: "arena-6",
    name: "Arena 6",
    image: "/arenas/arena-6.jpg",
    price: 500,
    unlocked: false,
    description: "Ruelas históricas de Lisboa ao luar com o eco místico do fado.",
    effect: "fog",
  },
  {
    id: "arena-7",
    name: "Arena 7",
    image: "/arenas/arena-7.jpg",
    price: 600,
    unlocked: false,
    description: "Crateras fumegantes e lava ardente no coração dos Açores.",
    effect: "lava",
  },
  {
    id: "arena-8",
    name: "Arena 8",
    image: "/arenas/arena-8.jpg",
    price: 700,
    unlocked: false,
    description: "As rotas marítimas portuguesas no espaço interestelar.",
    effect: "stars",
  },
  {
    id: "arena-9",
    name: "Arena 9",
    image: "/arenas/arena-9.jpg",
    price: 800,
    unlocked: false,
    description: "O relvado sagrado da Seleção Nacional sob trovoada e fogos.",
    effect: "fireworks",
  },
  {
    id: "arena-10",
    name: "Arena 10",
    image: "/arenas/arena-10.jpg",
    price: 1000,
    unlocked: false,
    description: "Ponte do Tejo no ano 2077 com tráfego néon futurista.",
    effect: "lightning",
  },
  {
    id: "arena-batalha-medieval",
    name: "Batalha Medieval",
    image: "/arenas/arena-batalha-medieval.jpg",
    price: 1200,
    unlocked: false,
    description: "Campo de batalha épico com armaduras, estandartes e fogo triunfal.",
    effect: "fire",
  },
  {
    id: "arena-castelo-obidos",
    name: "Castelo de Óbidos",
    image: "/arenas/arena-castelo-obidos.jpg",
    price: 1500,
    unlocked: false,
    description: "Muralhas medievais iluminadas por tochas ardentes ao cair da noite.",
    effect: "fire",
  },
  {
    id: "arena-corte-portuguesa",
    name: "Corte Portuguesa",
    image: "/arenas/arena-corte-portuguesa.jpg",
    price: 1500,
    unlocked: false,
    description: "Salão nobre da realeza com tapeçarias douradas e candelabros cintilantes.",
    effect: "stars",
  },
  {
    id: "arena-costa-atlantica",
    name: "Costa Atlântica",
    image: "/arenas/arena-costa-atlantica.jpg",
    price: 1300,
    unlocked: false,
    description: "Falésias majestosas batidas pelas ondas vivas do Atlântico e névoa marinha.",
    effect: "waves",
  },
  {
    id: "arena-era-descobrimentos",
    name: "Era dos Descobrimentos",
    image: "/arenas/arena-era-descobrimentos.jpg",
    price: 2000,
    unlocked: false,
    description: "Caravelas desbravando o mar ignoto sob céu estrelado e astrolábios mágicos.",
    effect: "stars",
  },
  {
    id: "arena-lisboa-imperial",
    name: "Lisboa Imperial",
    image: "/arenas/arena-lisboa-imperial.jpg",
    price: 1800,
    unlocked: false,
    description: "Praça do Comércio e Terreiro do Paço banhados por partículas solares reluzentes.",
    effect: "particles",
  },
  {
    id: "arena-madeira-noite",
    name: "Madeira Noite",
    image: "/arenas/arena-madeira-noite.jpg",
    price: 1400,
    unlocked: false,
    description: "Funchal iluminado pela baía com o espetáculo pirotécnico de Ano Novo.",
    effect: "fireworks",
  },
  {
    id: "arena-madeira-tropical",
    name: "Madeira Tropical",
    image: "/arenas/arena-madeira-tropical.jpg",
    price: 1400,
    unlocked: false,
    description: "Floresta Laurissilva e cascatas exuberantes sob névoa mística e brisa fresca.",
    effect: "rain",
  },
  {
    id: "arena-pico-estrelas",
    name: "Pico das Estrelas",
    image: "/arenas/arena-pico-estrelas.jpg",
    price: 1600,
    unlocked: false,
    description: "A montanha mais alta de Portugal sob um céu cristalino repleto de constelações.",
    effect: "stars",
  },
  {
    id: "arena-ponte-d-luis",
    name: "Ponte D. Luís",
    image: "/arenas/arena-ponte-d-luis.jpg",
    price: 1700,
    unlocked: false,
    description: "A icónica travessia do Douro envolta no brilho dourado do pôr-do-sol ribeirinho.",
    effect: "particles",
  },
  {
    id: "arena-portugal-medieval",
    name: "Portugal Medieval",
    image: "/arenas/arena-portugal-medieval.jpg",
    price: 1600,
    unlocked: false,
    description: "Vila fortificada do século XII com estandartes dos primeiros reis de Portugal.",
    effect: "fire",
  },
  {
    id: "arena-praca-liberdade",
    name: "Praça da Liberdade",
    image: "/arenas/arena-praca-liberdade.jpg",
    price: 1500,
    unlocked: false,
    description: "Cenário clássico da emblemática praça portuense com partículas solares douradas.",
    effect: "particles",
  },
  {
    id: "arena-vulcao-erupcao",
    name: "Vulcão em Erupção",
    image: "/arenas/arena-vulcao-erupcao.jpg",
    price: 2500,
    unlocked: false,
    description: "Caldeira vulcânica em plena erupção com rios de lava incandescente e fumo denso.",
    effect: "lava",
  }
];

export const OFFICIAL_ARENAS: Arena[] = ARENAS.map((a, idx) => ({
  id: a.id,
  name: a.name,
  imagePath: a.image,
  image: a.image,
  unlockedByDefault: a.unlocked,
  category: 'portugal',
  categoryLabel: 'Portugal',
  rarity: idx === 0 ? 'Comum' : a.price < 500 ? 'Comum' : a.price < 1000 ? 'Rara' : a.price < 2000 ? 'Épica' : 'Lendária',
  price: a.price,
  description: a.description || `Arena oficial ${a.name}`,
  effect: (a.effect as any) || 'particles',
  badgeColor: getArenaRarityBadge(idx === 0 ? 'Comum' : a.price < 500 ? 'Comum' : a.price < 1000 ? 'Rara' : a.price < 2000 ? 'Épica' : 'Lendária'),
}))

export function getArenaById(id: string): Arena | undefined {
  if (!id) return undefined
  const cleanId = id.toLowerCase().replace(/_/g, '-')
  const match = ARENAS.find((a) => a.id === id || a.id.toLowerCase() === cleanId)
  if (match) {
    return {
      id: match.id,
      name: match.name,
      imagePath: match.image,
      image: match.image,
      unlockedByDefault: match.unlocked,
      category: 'portugal',
      categoryLabel: 'Portugal',
      rarity: match.price === 0 ? 'Comum' : match.price < 500 ? 'Comum' : match.price < 1000 ? 'Rara' : match.price < 2000 ? 'Épica' : 'Lendária',
      price: match.price,
      description: match.description || `Arena oficial ${match.name}`,
      effect: (match.effect as any) || 'particles',
      badgeColor: getArenaRarityBadge(match.price === 0 ? 'Comum' : match.price < 500 ? 'Comum' : match.price < 1000 ? 'Rara' : match.price < 2000 ? 'Épica' : 'Lendária'),
    }
  }
  return OFFICIAL_ARENAS.find((a) => a.id === id || a.imagePath?.includes(id) || a.image?.includes(id)) || OFFICIAL_ARENAS[0]
}

export function getDefaultArena(): Arena {
  return OFFICIAL_ARENAS[0]
}

export function getRandomArena(): Arena {
  const idx = Math.floor(Math.random() * OFFICIAL_ARENAS.length)
  return OFFICIAL_ARENAS[idx]
}
