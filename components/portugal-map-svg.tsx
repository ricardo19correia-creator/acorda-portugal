'use client'

import React, { useCallback } from 'react'
import { DISTRICT_MAP } from '@/lib/district-map'

export function PortugalMapSVG({
  className,
  selected,
  onSelect,
}: {
  className?: string
  selected?: string // district name (display name) to keep compatibility
  onSelect?: (name: string) => void
}) {
  // helper to find svgId from name
  const nameToSvgId = useCallback((name?: string) => {
    if (!name) return undefined
    const entry = DISTRICT_MAP.find((d) => d.name === name || d.slug === name)
    return entry?.svgId
  }, [])

  const handleSelect = (name: string) => {
    onSelect?.(name)
  }

  const selectedId = nameToSvgId(selected)

  // Inline SVG: stylised, simplified shapes for districts (designed for effect and interactivity)
  // Each region has an id like district-porto etc. The geometric shapes are artistic blobs arranged to resemble Portugal.
  // Islands (Açores, Madeira) are included as inset clusters on the left.

  return (
    <div className={className}>
      <svg
        viewBox="0 0 800 1100"
        width="100%"
        height="100%"
        role="img"
        aria-label="Mapa interativo de Portugal"
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-auto"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="mapFill" x1="0" x2="1">
            <stop offset="0%" stopColor="#04221a" />
            <stop offset="100%" stopColor="#072a1e" />
          </linearGradient>

          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0%" stopColor="#00ff9b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9bffb8" stopOpacity="0.6" />
          </linearGradient>

        </defs>

        {/* background vignette */}
        <rect className="map-bg" x="0" y="0" width="800" height="1100" rx="8" />

        {/* Mainland silhouette composed of multiple region shapes (artistic, stylised) */}
        {/* Northern cluster */}
        <g id="mainland" transform="translate(140,60)">
          <path
            id="district-braga"
            className={`region ${selectedId === 'district-braga' ? 'selected' : ''}`}
            d="M140 0 C120 30 96 56 88 86 C80 116 84 152 70 182 C54 215 38 240 22 270 L8 300 C-4 330 6 366 30 386 C58 410 92 410 124 412 C152 414 178 410 206 398 C236 384 262 360 280 332 C298 304 312 268 308 232 C302 188 292 150 280 116 C266 78 248 44 220 20 C200 4 170 -4 140 0 Z"
            role="button"
            tabIndex={0}
            aria-label="Braga"
            onClick={() => handleSelect('Braga')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Braga') : undefined)}
          />

          <path
            id="district-porto"
            className={`region ${selectedId === 'district-porto' ? 'selected' : ''}`}
            d="M160 160 C150 188 140 220 136 250 C132 280 134 310 146 336 C158 362 178 382 206 398 C236 414 270 418 300 418 C330 418 360 410 384 392 C408 374 428 350 444 322 C458 296 462 266 458 238 C452 202 442 170 430 140 C410 96 380 64 340 54 C320 50 280 56 260 86 C244 108 176 150 160 160 Z"
            role="button"
            tabIndex={0}
            aria-label="Porto"
            onClick={() => handleSelect('Porto')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Porto') : undefined)}
          />

          <path
            id="district-viana-do-castelo"
            className={`region ${selectedId === 'district-viana-do-castelo' ? 'selected' : ''}`}
            d="M74 40 C60 80 46 116 40 154 C36 184 38 214 50 242 C62 270 82 292 106 308 C128 322 154 330 180 332 C166 300 152 274 146 240 C140 206 138 172 150 138 C158 112 170 84 184 62 C160 48 132 36 104 34 C92 34 82 36 74 40 Z"
            role="button"
            tabIndex={0}
            aria-label="Viana do Castelo"
            onClick={() => handleSelect('Viana do Castelo')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Viana do Castelo') : undefined)}
          />

          <path
            id="district-braganca"
            className={`region ${selectedId === 'district-braganca' ? 'selected' : ''}`}
            d="M332 18 C320 46 314 82 312 112 C310 140 312 172 332 200 C352 230 376 252 402 268 C428 284 456 294 486 300 C510 304 538 302 560 288 C580 276 594 256 604 232 C616 204 624 172 620 140 C616 108 604 78 588 52 C556 20 496 6 452 10 C432 12 382 14 332 18 Z"
            role="button"
            tabIndex={0}
            aria-label="Braganca"
            onClick={() => handleSelect('Braganca')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Braganca') : undefined)}
          />

          {/* Central-north cluster (Porto / Aveiro / Viseu / Braga around) */}
          <path
            id="district-aveiro"
            className={`region ${selectedId === 'district-aveiro' ? 'selected' : ''}`}
            d="M180 220 C160 240 148 268 150 298 C152 326 164 352 188 372 C214 394 244 404 276 406 C300 408 326 404 348 392 C360 384 376 368 386 350 C398 328 402 304 398 280 C392 248 378 220 354 200 C330 180 206 196 180 220 Z"
            role="button"
            tabIndex={0}
            aria-label="Aveiro"
            onClick={() => handleSelect('Aveiro')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Aveiro') : undefined)}
          />

          <path
            id="district-viseu"
            className={`region ${selectedId === 'district-viseu' ? 'selected' : ''}`}
            d="M304 240 C292 268 286 298 292 330 C298 362 316 388 340 404 C366 422 396 428 426 426 C452 424 480 414 502 396 C524 378 538 352 544 324 C550 292 542 260 526 234 C508 204 480 184 452 172 C422 158 362 170 334 196 C322 208 312 224 304 240 Z"
            role="button"
            tabIndex={0}
            aria-label="Viseu"
            onClick={() => handleSelect('Viseu')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Viseu') : undefined)}
          />

          <path
            id="district-leiria"
            className={`region ${selectedId === 'district-leiria' ? 'selected' : ''}`}
            d="M120 320 C100 342 88 372 92 400 C96 430 112 452 136 468 C162 486 196 494 230 492 C262 490 292 480 318 464 C344 448 364 426 378 400 C392 372 396 338 392 304 C388 270 370 240 350 216 C334 196 200 264 120 320 Z"
            role="button"
            tabIndex={0}
            aria-label="Leiria"
            onClick={() => handleSelect('Leiria')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Leiria') : undefined)}
          />

          {/* Centre-south cluster */}
          <path
            id="district-coimbra"
            className={`region ${selectedId === 'district-coimbra' ? 'selected' : ''}`}
            d="M220 380 C204 404 190 434 192 466 C194 498 214 522 242 540 C272 560 306 566 340 562 C374 558 400 544 422 524 C446 502 462 476 468 444 C474 410 466 374 452 344 C438 314 412 292 382 278 C356 266 260 334 220 380 Z"
            role="button"
            tabIndex={0}
            aria-label="Coimbra"
            onClick={() => handleSelect('Coimbra')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Coimbra') : undefined)}
          />

          <path
            id="district-evora"
            className={`region ${selectedId === 'district-evora' ? 'selected' : ''}`}
            d="M300 480 C288 512 280 546 290 576 C302 612 326 640 358 660 C392 682 430 686 466 678 C498 672 526 652 546 626 C566 596 576 562 576 528 C576 496 566 466 548 440 C530 412 498 392 466 384 C420 372 344 408 300 480 Z"
            role="button"
            tabIndex={0}
            aria-label="Évora"
            onClick={() => handleSelect('Évora')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Évora') : undefined)}
          />

          <path
            id="district-faro"
            className={`region ${selectedId === 'district-faro' ? 'selected' : ''}`}
            d="M340 620 C332 652 334 688 356 712 C380 740 410 760 446 768 C478 774 512 768 538 748 C562 730 576 702 582 672 C588 642 580 614 562 590 C544 566 516 548 486 538 C452 526 412 532 384 552 C358 572 344 596 340 620 Z"
            role="button"
            tabIndex={0}
            aria-label="Faro"
            onClick={() => handleSelect('Faro')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Faro') : undefined)}
          />

          <path
            id="district-setubal"
            className={`region ${selectedId === 'district-setubal' ? 'selected' : ''}`}
            d="M192 460 C168 482 152 510 150 540 C148 572 160 602 180 628 C204 660 238 682 276 692 C312 702 352 700 386 686 C418 672 444 648 462 618 C484 582 496 540 496 500 C496 468 486 438 468 412 C450 386 416 368 384 362 C350 356 254 400 192 460 Z"
            role="button"
            tabIndex={0}
            aria-label="Setúbal"
            onClick={() => handleSelect('Setúbal')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Setúbal') : undefined)}
          />

          <path
            id="district-santarem"
            className={`region ${selectedId === 'district-santarem' ? 'selected' : ''}`}
            d="M120 440 C100 468 90 504 96 540 C102 576 122 606 150 628 C180 652 216 668 252 674 C288 680 324 678 354 666 C384 654 404 634 420 606 C438 574 446 538 440 502 C434 468 418 436 392 410 C362 380 216 396 120 440 Z"
            role="button"
            tabIndex={0}
            aria-label="Santarém"
            onClick={() => handleSelect('Santarém')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Santarém') : undefined)}
          />

          {/* eastern districts: Guarda, Portalegre, Castelo Branco, Vila Real */}
          <path
            id="district-guarda"
            className={`region ${selectedId === 'district-guarda' ? 'selected' : ''}`}
            d="M420 180 C440 208 460 240 468 274 C476 308 476 344 468 378 C460 412 444 440 424 466 C404 494 378 514 350 532 C324 548 294 556 264 558 C232 560 202 548 176 524 C152 502 140 474 136 444 C132 412 146 376 166 344 C182 318 202 292 224 270 C248 246 372 154 420 180 Z"
            role="button"
            tabIndex={0}
            aria-label="Guarda"
            onClick={() => handleSelect('Guarda')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Guarda') : undefined)}
          />

          <path
            id="district-portalegre"
            className={`region ${selectedId === 'district-portalegre' ? 'selected' : ''}`}
            d="M460 300 C480 330 494 366 498 404 C502 444 496 486 478 520 C458 558 428 588 392 604 C354 622 312 628 272 624 C234 620 198 606 166 582 C134 558 116 524 112 488 C108 452 124 418 150 388 C180 354 200 326 234 300 C266 276 416 272 460 300 Z"
            role="button"
            tabIndex={0}
            aria-label="Portalegre"
            onClick={() => handleSelect('Portalegre')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Portalegre') : undefined)}
          />

          <path
            id="district-castelo-branco"
            className={`region ${selectedId === 'district-castelo-branco' ? 'selected' : ''}`}
            d="M360 360 C376 388 394 418 412 446 C430 476 452 502 476 526 C504 554 536 574 568 582 C602 592 640 588 672 572 C700 558 724 532 736 502 C748 470 754 434 744 400 C732 362 712 330 686 300 C662 272 596 268 560 286 C528 302 500 328 476 356 C456 380 418 354 360 360 Z"
            role="button"
            tabIndex={0}
            aria-label="Castelo Branco"
            onClick={() => handleSelect('Castelo Branco')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Castelo Branco') : undefined)}
          />

          <path
            id="district-vila-real"
            className={`region ${selectedId === 'district-vila-real' ? 'selected' : ''}`}
            d="M280 40 C260 70 242 96 236 126 C230 156 234 188 250 216 C268 246 292 270 320 286 C350 306 384 316 422 318 C388 276 358 246 330 216 C303 188 292 146 280 112 C270 86 270 56 280 40 Z"
            role="button"
            tabIndex={0}
            aria-label="Vila Real"
            onClick={() => handleSelect('Vila Real')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Vila Real') : undefined)}
          />

          {/* northern-central label markers (visual) */}
          <text x="190" y="100" className="region-label">Porto</text>
          <text x="120" y="60" className="region-label">Braga</text>
          <text x="220" y="220" className="region-label">Aveiro</text>

          {/* southern labels */}
          <text x="360" y="520" className="region-label">Évora</text>
          <text x="444" y="700" className="region-label">Faro</text>
          <text x="200" y="420" className="region-label">Coimbra</text>
        </g>

        {/* Islands group (left side inset) */}
        <g id="islands" transform="translate(20,740)">
          <g id="acores-group">
            <path
              id="district-acores"
              className={`island ${selectedId === 'district-acores' ? 'selected' : ''}`}
              d="M40 20 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0 Z"
              role="button"
              tabIndex={0}
              aria-label="Açores"
              onClick={() => handleSelect('Açores')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Açores') : undefined)}
            />
            <text x="40" y="60" className="region-label">Açores</text>
          </g>

          <g id="madeira-group" transform="translate(120,20)">
            <path
              id="district-madeira"
              className={`island ${selectedId === 'district-madeira' ? 'selected' : ''}`}
              d="M10 10 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z"
              role="button"
              tabIndex={0}
              aria-label="Madeira"
              onClick={() => handleSelect('Madeira')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleSelect('Madeira') : undefined)}
            />
            <text x="-4" y="40" className="region-label">Madeira</text>
          </g>
        </g>

      </svg>
    </div>
  )
}
