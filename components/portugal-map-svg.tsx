'use client'

import { DISTRICT_MAP } from '@/lib/district-map'

export function PortugalMapSVG({
  className,
  selected,
  onSelect,
}: {
  className?: string
  selected?: string
  onSelect?: (name: string) => void
}) {
  const selectedId = DISTRICT_MAP.find((d) => d.name === selected || d.slug === selected)?.svgId

  const activate = (name: string) => onSelect?.(name)

  const districtProps = (name: string, svgId: string) => ({
    id: svgId,
    className: `district ${selectedId === svgId ? 'selected' : ''}`,
    role: 'button',
    tabIndex: 0,
    'aria-label': name,
    'aria-pressed': selectedId === svgId,
    onClick: () => activate(name),
    onKeyDown: (event: React.KeyboardEvent<SVGPathElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate(name)
      }
    },
  })

  return (
    <div className={className}>
      <svg
        viewBox="0 0 820 960"
        width="100%"
        height="100%"
        role="img"
        aria-label="Mapa geográfico interativo de Portugal"
        preserveAspectRatio="xMidYMid meet"
        className="block h-auto w-full"
      >
        <defs>
          <filter id="district-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="district-fill" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(26, 81, 69, 0.96)" />
            <stop offset="100%" stopColor="rgba(9, 24, 19, 0.96)" />
          </linearGradient>

          <linearGradient id="district-edge" x1="0" x2="1">
            <stop offset="0%" stopColor="#9ef7d4" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#54ffb6" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="820" height="960" fill="#04150f" rx="18" />

        <g transform="translate(28,34)">
          <path
            d="M78 116 L150 58 L220 40 L310 54 L392 82 L458 68 L554 94 L626 130 L690 188 L704 256 L682 320 L700 392 L674 470 L690 550 L655 620 L618 692 L640 786 L586 862 L524 926 L440 942 L344 932 L278 890 L220 884 L168 836 L118 770 L92 708 L62 620 L50 528 L60 430 L78 332 L52 244 Z"
            fill="rgba(7, 24, 20, 0.94)"
            stroke="rgba(159, 247, 212, 0.2)"
            strokeWidth="1.4"
          />

          <path
            {...districtProps('Viana do Castelo', 'district-viana-do-castelo')}
            d="M118 110 L171 70 L234 72 L270 104 L252 150 L200 172 L154 170 L120 144 Z"
          />

          <path
            {...districtProps('Vila Real', 'district-vila-real')}
            d="M246 110 L306 88 L364 112 L362 166 L312 194 L260 184 L230 152 Z"
          />

          <path
            {...districtProps('Braga', 'district-braga')}
            d="M168 174 L246 152 L312 168 L332 214 L308 256 L232 272 L178 244 L154 206 Z"
          />

          <path
            {...districtProps('Porto', 'district-porto')}
            d="M182 242 L238 224 L290 232 L314 278 L300 326 L250 344 L188 326 L162 284 Z"
          />

          <path
            {...districtProps('Aveiro', 'district-aveiro')}
            d="M152 324 L224 294 L302 308 L344 350 L330 404 L272 434 L186 426 L142 382 Z"
          />

          <path
            {...districtProps('Viseu', 'district-viseu')}
            d="M266 218 L356 204 L420 228 L448 284 L438 344 L388 378 L318 370 L272 318 Z"
          />

          <path
            {...districtProps('Bragança', 'district-braganca')}
            d="M374 96 L458 82 L536 108 L566 154 L548 210 L500 232 L428 220 L382 176 Z"
          />

          <path
            {...districtProps('Guarda', 'district-guarda')}
            d="M348 214 L430 198 L500 230 L534 292 L520 352 L470 388 L394 382 L334 332 L324 268 Z"
          />

          <path
            {...districtProps('Castelo Branco', 'district-castelo-branco')}
            d="M482 382 L550 360 L620 392 L648 448 L634 514 L566 540 L500 524 L470 468 Z"
          />

          <path
            {...districtProps('Leiria', 'district-leiria')}
            d="M142 418 L216 392 L298 410 L334 456 L320 520 L250 554 L172 548 L120 500 Z"
          />

          <path
            {...districtProps('Coimbra', 'district-coimbra')}
            d="M244 518 L324 492 L394 514 L426 576 L402 640 L332 664 L260 646 L214 582 Z"
          />

          <path
            {...districtProps('Santarém', 'district-santarem')}
            d="M116 544 L196 526 L252 550 L292 606 L272 664 L204 696 L128 684 L94 624 Z"
          />

          <path
            {...districtProps('Lisboa', 'district-lisboa')}
            d="M176 654 L242 638 L286 666 L286 720 L236 750 L176 742 L144 694 Z"
          />

          <path
            {...districtProps('Setúbal', 'district-setubal')}
            d="M232 700 L308 684 L362 706 L382 764 L344 820 L280 826 L232 780 L214 734 Z"
          />

          <path
            {...districtProps('Évora', 'district-evora')}
            d="M370 548 L446 528 L522 546 L548 608 L532 678 L474 716 L406 704 L362 642 Z"
          />

          <path
            {...districtProps('Portalegre', 'district-portalegre')}
            d="M540 510 L610 490 L674 516 L690 570 L660 626 L600 648 L548 620 L526 568 Z"
          />

          <path
            {...districtProps('Beja', 'district-beja')}
            d="M394 702 L470 682 L554 700 L590 756 L576 820 L514 850 L448 844 L402 786 Z"
          />

          <path
            {...districtProps('Faro', 'district-faro')}
            d="M482 824 L560 810 L620 836 L626 892 L576 930 L516 932 L482 894 Z"
          />

          <path
            {...districtProps('Madeira', 'district-madeira')}
            d="M68 818 L96 804 L122 820 L116 848 L82 860 L56 844 Z"
          />

          <path
            {...districtProps('Açores', 'district-acores')}
            d="M150 830 L192 814 L238 828 L232 868 L188 878 L152 860 Z"
          />

          <g fontSize="11" fill="#dfffe9" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" textAnchor="middle">
            <text x="200" y="131">Viana</text>
            <text x="286" y="145">Vila Real</text>
            <text x="230" y="221">Braga</text>
            <text x="212" y="288">Porto</text>
            <text x="238" y="384">Aveiro</text>
            <text x="350" y="296">Viseu</text>
            <text x="468" y="160">Bragança</text>
            <text x="430" y="286">Guarda</text>
            <text x="544" y="462">Castelo Branco</text>
            <text x="220" y="491">Leiria</text>
            <text x="314" y="567">Coimbra</text>
            <text x="184" y="618">Santarém</text>
            <text x="224" y="702">Lisboa</text>
            <text x="280" y="766">Setúbal</text>
            <text x="456" y="617">Évora</text>
            <text x="626" y="586">Portalegre</text>
            <text x="494" y="780">Beja</text>
            <text x="546" y="876">Faro</text>
            <text x="88" y="840">Madeira</text>
            <text x="194" y="853">Açores</text>
          </g>
        </g>
      </svg>
    </div>
  )
}
