const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const targetDirs = [
  path.join(process.cwd(), 'public', 'assets', 'shop', 'aids'),
  path.join(process.cwd(), 'public', 'images', 'shop', 'aids'),
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// -------------------------------------------------------------------------------------------------
// ASSET 1: AID_002 — 50/50 (Cyber-Tactical Split & Elimination)
// -------------------------------------------------------------------------------------------------
const svg5050 = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#041f2d" />
      <stop offset="50%" stop-color="#083344" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <radialGradient id="cyanCoreGlow" cx="50%" cy="48%" r="60%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.45" />
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="cyanMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0c4a6e" />
    </linearGradient>
    <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.75" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="44" fill="url(#bgGrad1)" />
  <rect x="16" y="16" width="480" height="480" rx="36" fill="none" stroke="#0e7490" stroke-width="2.5" stroke-opacity="0.4" />
  
  <!-- Circuit Grid Lines -->
  <path d="M40 100 L120 100 L160 60 M472 100 L392 100 L352 60 M40 400 L120 400 L160 440 M472 400 L392 400 L352 440" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-opacity="0.35" stroke-dasharray="6 4" />
  
  <!-- Central Radial Core Glow -->
  <circle cx="256" cy="235" r="190" fill="url(#cyanCoreGlow)" />

  <!-- Tactical Hexagonal Central Frame -->
  <polygon points="256,65 410,150 410,320 256,405 102,320 102,150" fill="#091422" fill-opacity="0.9" stroke="url(#cyanMetal)" stroke-width="4" filter="url(#cardShadow)" />
  <polygon points="256,80 395,158 395,312 256,390 117,312 117,158" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="10 6" />

  <!-- Diagonal Laser Division Beam (Splitting the field in 2) -->
  <line x1="125" y1="360" x2="387" y2="110" stroke="url(#laserBeam)" stroke-width="6" filter="url(#laserGlow)" />
  <line x1="125" y1="360" x2="387" y2="110" stroke="#ffffff" stroke-width="2" />

  <!-- Option Nodes -->
  <!-- Top-Left: Option A (KEPT - GLOWING CYAN) -->
  <g transform="translate(150, 130)" filter="url(#cardShadow)">
    <circle cx="28" cy="28" r="32" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
    <circle cx="28" cy="28" r="24" fill="#0284c7" fill-opacity="0.4" />
    <text x="28" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#38bdf8" text-anchor="middle">A</text>
    <!-- Kept Badge Checkmark -->
    <circle cx="50" cy="8" r="10" fill="#10b981" />
    <path d="M46 8 L49 11 L55 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Bottom-Right: Option C (KEPT - GLOWING CYAN) -->
  <g transform="translate(305, 275)" filter="url(#cardShadow)">
    <circle cx="28" cy="28" r="32" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
    <circle cx="28" cy="28" r="24" fill="#0284c7" fill-opacity="0.4" />
    <text x="28" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#38bdf8" text-anchor="middle">C</text>
    <!-- Kept Badge Checkmark -->
    <circle cx="50" cy="8" r="10" fill="#10b981" />
    <path d="M46 8 L49 11 L55 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Top-Right: Option B (ELIMINATED - SHATTERED RED X) -->
  <g transform="translate(305, 130)" opacity="0.6">
    <circle cx="28" cy="28" r="32" fill="#18181b" stroke="#475569" stroke-width="2" stroke-dasharray="4 3" />
    <text x="28" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="26" fill="#64748b" text-anchor="middle">B</text>
    <!-- Elimination Red X -->
    <line x1="8" y1="8" x2="48" y2="48" stroke="#ef4444" stroke-width="5" stroke-linecap="round" filter="url(#laserGlow)" />
    <line x1="48" y1="8" x2="8" y2="48" stroke="#ef4444" stroke-width="5" stroke-linecap="round" filter="url(#laserGlow)" />
  </g>

  <!-- Bottom-Left: Option D (ELIMINATED - SHATTERED RED X) -->
  <g transform="translate(150, 275)" opacity="0.6">
    <circle cx="28" cy="28" r="32" fill="#18181b" stroke="#475569" stroke-width="2" stroke-dasharray="4 3" />
    <text x="28" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="26" fill="#64748b" text-anchor="middle">D</text>
    <!-- Elimination Red X -->
    <line x1="8" y1="8" x2="48" y2="48" stroke="#ef4444" stroke-width="5" stroke-linecap="round" filter="url(#laserGlow)" />
    <line x1="48" y1="8" x2="8" y2="48" stroke="#ef4444" stroke-width="5" stroke-linecap="round" filter="url(#laserGlow)" />
  </g>

  <!-- Center "50/50" Emblem Badge -->
  <g transform="translate(256, 235)" filter="url(#cardShadow)">
    <rect x="-70" y="-26" width="140" height="52" rx="16" fill="#031525" stroke="#38bdf8" stroke-width="3" />
    <text x="0" y="10" font-family="system-ui, sans-serif" font-weight="950" font-size="30" fill="#ffffff" letter-spacing="1" text-anchor="middle" filter="url(#laserGlow)">50 / 50</text>
  </g>

  <!-- Portuguese Quinas Accent Top Left -->
  <g transform="translate(48, 48)">
    <rect x="0" y="0" width="28" height="34" rx="6" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
    <circle cx="8" cy="10" r="2" fill="#ffffff" />
    <circle cx="20" cy="10" r="2" fill="#ffffff" />
    <circle cx="14" cy="17" r="2" fill="#ffffff" />
    <circle cx="8" cy="24" r="2" fill="#ffffff" />
    <circle cx="20" cy="24" r="2" fill="#ffffff" />
  </g>

  <!-- Top Badge: PACK x5 -->
  <g transform="translate(370, 48)">
    <rect x="0" y="0" width="94" height="30" rx="8" fill="#083344" stroke="#06b6d4" stroke-width="1.5" />
    <text x="47" y="20" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#38bdf8" text-anchor="middle">PACK x5</text>
  </g>

  <!-- Bottom Text Banner -->
  <rect x="40" y="420" width="432" height="64" rx="18" fill="#05131f" fill-opacity="0.95" stroke="#0284c7" stroke-width="2" filter="url(#cardShadow)" />
  <text x="256" y="448" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" letter-spacing="1.5" text-anchor="middle">AJUDA 50 / 50</text>
  <text x="256" y="469" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#38bdf8" letter-spacing="0.5" text-anchor="middle">Elimina 2 Alternativas Erradas</text>
</svg>
`;

// -------------------------------------------------------------------------------------------------
// ASSET 2: AID_003 — PERGUNTA AO PÚBLICO (Crowd Voting & 3D Bar Graph)
// -------------------------------------------------------------------------------------------------
const svgPublico = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2e0854" />
      <stop offset="50%" stop-color="#1e1035" />
      <stop offset="100%" stop-color="#090514" />
    </linearGradient>
    <radialGradient id="purpleGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.4" />
      <stop offset="60%" stop-color="#7e22ce" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#3b0764" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="barWinner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="30%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="barRegular" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="60%" stop-color="#6b21a8" />
      <stop offset="100%" stop-color="#3b0764" />
    </linearGradient>
    <filter id="purpleFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="44" fill="url(#bgGrad2)" />
  <rect x="16" y="16" width="480" height="480" rx="36" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-opacity="0.4" />

  <!-- Ambient Stage Glow -->
  <circle cx="256" cy="220" r="200" fill="url(#purpleGlow)" />

  <!-- Classical Arched Amphitheater Ceiling / Dome Arch -->
  <path d="M60 260 C60 120 452 120 452 260" fill="none" stroke="#c084fc" stroke-width="2" stroke-opacity="0.35" stroke-dasharray="8 6" />
  <path d="M85 260 C85 150 427 150 427 260" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.25" />

  <!-- Background Crowd Silhouettes (Cheering Audience with Raised Voting Cards) -->
  <g fill="#1a0b2e" fill-opacity="0.9" stroke="#6b21a8" stroke-width="1">
    <!-- Audience Row 1 (Back) -->
    <circle cx="100" cy="190" r="16" /><path d="M85 230 C85 205 115 205 115 230 Z" />
    <circle cx="150" cy="180" r="16" /><path d="M135 220 C135 195 165 195 165 220 Z" />
    <circle cx="200" cy="175" r="16" /><path d="M185 215 C185 190 215 190 215 215 Z" />
    <circle cx="312" cy="175" r="16" /><path d="M297 215 C297 190 327 190 327 215 Z" />
    <circle cx="362" cy="180" r="16" /><path d="M347 220 C347 195 377 195 377 220 Z" />
    <circle cx="412" cy="190" r="16" /><path d="M397 230 C397 205 427 205 427 230 Z" />

    <!-- Audience Raised Voting Hands & Devices with Light Beams -->
    <line x1="108" y1="185" x2="114" y2="155" stroke="#c084fc" stroke-width="3" stroke-linecap="round" />
    <circle cx="114" cy="153" r="4" fill="#facc15" />
    <line x1="208" y1="170" x2="214" y2="140" stroke="#c084fc" stroke-width="3" stroke-linecap="round" />
    <circle cx="214" cy="138" r="4" fill="#facc15" />
    <line x1="304" y1="170" x2="298" y2="140" stroke="#c084fc" stroke-width="3" stroke-linecap="round" />
    <circle cx="298" cy="138" r="4" fill="#facc15" />
    <line x1="404" y1="185" x2="398" y2="155" stroke="#c084fc" stroke-width="3" stroke-linecap="round" />
    <circle cx="398" cy="153" r="4" fill="#facc15" />
  </g>

  <!-- Central Dynamic 3D Bar Graph Container Platform -->
  <rect x="76" y="210" width="360" height="185" rx="20" fill="#0d041a" fill-opacity="0.9" stroke="#9333ea" stroke-width="2.5" />
  
  <!-- Grid Lines in Chart -->
  <line x1="96" y1="260" x2="416" y2="260" stroke="#3b0764" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="96" y1="310" x2="416" y2="310" stroke="#3b0764" stroke-width="1.5" stroke-dasharray="4 4" />

  <!-- 1. BAR A: 14% -->
  <g transform="translate(106, 210)">
    <rect x="0" y="115" width="48" height="45" rx="8" fill="url(#barRegular)" stroke="#c084fc" stroke-width="1.5" />
    <text x="24" y="108" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#c084fc" text-anchor="middle">14%</text>
    <rect x="8" y="165" width="32" height="22" rx="6" fill="#1e1035" />
    <text x="24" y="181" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#94a3b8" text-anchor="middle">A</text>
  </g>

  <!-- 2. BAR B: 68% (WINNER - GLOWING GOLD & TOWERING) -->
  <g transform="translate(182, 210)">
    <!-- Golden Winner Bar -->
    <rect x="0" y="32" width="68" height="128" rx="10" fill="url(#barWinner)" stroke="#fde047" stroke-width="2.5" filter="url(#goldGlow)" />
    <!-- Golden Crown over Bar B -->
    <g transform="translate(16, 2)" filter="url(#goldGlow)">
      <path d="M2 18 L10 4 L18 12 L26 4 L34 18 Z" fill="url(#goldCrownGrad)" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="10" cy="4" r="2.5" fill="#ffffff" />
      <circle cx="18" cy="12" r="2.5" fill="#ffffff" />
      <circle cx="26" cy="4" r="2.5" fill="#ffffff" />
    </g>
    <text x="34" y="25" font-family="system-ui, sans-serif" font-weight="950" font-size="18" fill="#fde047" text-anchor="middle" filter="url(#purpleFilter)">68%</text>
    <rect x="18" y="165" width="32" height="22" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1.5" />
    <text x="34" y="181" font-family="system-ui, sans-serif" font-weight="950" font-size="14" fill="#fde047" text-anchor="middle">B</text>
  </g>

  <!-- 3. BAR C: 9% -->
  <g transform="translate(278, 210)">
    <rect x="0" y="128" width="48" height="32" rx="8" fill="url(#barRegular)" stroke="#c084fc" stroke-width="1.5" />
    <text x="24" y="122" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#c084fc" text-anchor="middle">9%</text>
    <rect x="8" y="165" width="32" height="22" rx="6" fill="#1e1035" />
    <text x="24" y="181" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#94a3b8" text-anchor="middle">C</text>
  </g>

  <!-- 4. BAR D: 9% -->
  <g transform="translate(354, 210)">
    <rect x="0" y="128" width="48" height="32" rx="8" fill="url(#barRegular)" stroke="#c084fc" stroke-width="1.5" />
    <text x="24" y="122" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#c084fc" text-anchor="middle">9%</text>
    <rect x="8" y="165" width="32" height="22" rx="6" fill="#1e1035" />
    <text x="24" y="181" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#94a3b8" text-anchor="middle">D</text>
  </g>

  <!-- Top Premium Laurel Header Banner -->
  <g transform="translate(156, 44)">
    <rect x="0" y="0" width="200" height="34" rx="12" fill="#451a03" stroke="#f59e0b" stroke-width="2" filter="url(#goldGlow)" />
    <text x="100" y="23" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#fef08a" letter-spacing="1" text-anchor="middle">⭐ AJUDA PREMIUM ⭐</text>
  </g>

  <!-- Top Left Pack Qty Badge -->
  <g transform="translate(48, 48)">
    <rect x="0" y="0" width="94" height="30" rx="8" fill="#3b0764" stroke="#a855f7" stroke-width="1.5" />
    <text x="47" y="20" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#c084fc" text-anchor="middle">PACK x3</text>
  </g>

  <!-- Bottom Text Banner -->
  <rect x="40" y="420" width="432" height="64" rx="18" fill="#0d041a" fill-opacity="0.95" stroke="#a855f7" stroke-width="2" filter="url(#goldGlow)" />
  <text x="256" y="448" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" letter-spacing="1.5" text-anchor="middle">PERGUNTA AO PÚBLICO</text>
  <text x="256" y="469" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#c084fc" letter-spacing="0.5" text-anchor="middle">Votação Simulada da Plateia</text>
</svg>
`;

// -------------------------------------------------------------------------------------------------
// ASSET 3: AID_004 — CONGELAR TEMPO (Frozen Chronometer & Cryo-Stasis)
// -------------------------------------------------------------------------------------------------
const svgFreezeTime = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021c38" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#000914" />
    </linearGradient>
    <radialGradient id="iceCoreGlow" cx="50%" cy="48%" r="65%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
      <stop offset="40%" stop-color="#0284c7" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="frostMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0f9ff" />
      <stop offset="30%" stop-color="#7dd3fc" />
      <stop offset="70%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0c4a6e" />
    </linearGradient>
    <filter id="freezeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="iceShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="44" fill="url(#bgGrad3)" />
  <rect x="16" y="16" width="480" height="480" rx="36" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-opacity="0.4" />

  <!-- Ambient Sub-Zero Radial Glow -->
  <circle cx="256" cy="230" r="190" fill="url(#iceCoreGlow)" />

  <!-- Octagonal Cryo-Vortex Outer Rim with Snowflake Rays -->
  <g stroke="#7dd3fc" stroke-width="1.5" stroke-opacity="0.4">
    <line x1="256" y1="50" x2="256" y2="410" stroke-dasharray="6 6" />
    <line x1="76" y1="230" x2="436" y2="230" stroke-dasharray="6 6" />
    <line x1="128" y1="102" x2="384" y2="358" stroke-dasharray="6 6" />
    <line x1="384" y1="102" x2="128" y2="358" stroke-dasharray="6 6" />
  </g>

  <!-- Snowflake Crystal Fractals in Corners -->
  <g stroke="#bae6fd" stroke-width="2" stroke-linecap="round" opacity="0.6">
    <!-- Top-Left Snowflake -->
    <path d="M70 120 L100 120 M85 105 L85 135 M75 110 L95 130 M95 110 L75 130" />
    <!-- Top-Right Snowflake -->
    <path d="M412 120 L442 120 M427 105 L427 135 M417 110 L437 130 M437 110 L417 130" />
    <!-- Bottom-Left Snowflake -->
    <path d="M70 340 L100 340 M85 325 L85 355 M75 330 L95 350 M95 330 L75 350" />
    <!-- Bottom-Right Snowflake -->
    <path d="M412 340 L442 340 M427 325 L427 355 M417 330 L437 350 M437 330 L417 350" />
  </g>

  <!-- Massive Frozen Antique Chronometer Outer Dial -->
  <circle cx="256" cy="230" r="145" fill="#041220" stroke="url(#frostMetal)" stroke-width="6" filter="url(#iceShadow)" />
  <circle cx="256" cy="230" r="130" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 6" />

  <!-- Chronometer Ticks & Roman Numerals -->
  <g font-family="serif" font-weight="900" font-size="18" fill="#e0f2fe" text-anchor="middle" opacity="0.9">
    <text x="256" y="125">XII</text>
    <text x="365" y="236">III</text>
    <text x="256" y="345">VI</text>
    <text x="147" y="236">IX</text>
  </g>

  <!-- Frozen Clock Gears / Ice Mechanism (Visible through dial) -->
  <circle cx="256" cy="230" r="85" fill="#061e38" stroke="#0284c7" stroke-width="3" />
  <circle cx="256" cy="230" r="65" fill="#082f49" fill-opacity="0.8" />

  <!-- Frozen Icicles Hanging from Watch Crown & Base -->
  <polygon points="256,65 246,85 266,85" fill="#e0f2fe" filter="url(#freezeGlow)" />
  <polygon points="200,98 194,120 206,112" fill="#bae6fd" />
  <polygon points="312,98 318,120 306,112" fill="#bae6fd" />
  <polygon points="256,395 248,375 264,375" fill="#e0f2fe" />

  <!-- Prominent Central Frozen PAUSE Symbol ⏸ -->
  <g transform="translate(256, 230)" filter="url(#freezeGlow)">
    <rect x="-32" y="-40" width="24" height="80" rx="8" fill="#f0f9ff" stroke="#38bdf8" stroke-width="3" />
    <rect x="8" y="-40" width="24" height="80" rx="8" fill="#f0f9ff" stroke="#38bdf8" stroke-width="3" />
    <!-- Frost line overlay on pause bars -->
    <line x1="-20" y1="-30" x2="-20" y2="30" stroke="#7dd3fc" stroke-width="2" />
    <line x1="20" y1="-30" x2="20" y2="30" stroke="#7dd3fc" stroke-width="2" />
  </g>

  <!-- Upper Prominent Cryo Badge: +15s -->
  <g transform="translate(256, 52)" filter="url(#iceShadow)">
    <rect x="-75" y="0" width="150" height="34" rx="12" fill="#0369a1" stroke="#e0f2fe" stroke-width="2.5" />
    <text x="0" y="23" font-family="system-ui, sans-serif" font-weight="950" font-size="16" fill="#ffffff" letter-spacing="1.5" text-anchor="middle" filter="url(#freezeGlow)">⏱️ +15s TEMPO</text>
  </g>

  <!-- Top Right Pack Qty Badge -->
  <g transform="translate(370, 48)">
    <rect x="0" y="0" width="94" height="30" rx="8" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.5" />
    <text x="47" y="20" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#bae6fd" text-anchor="middle">PACK x3</text>
  </g>

  <!-- Bottom Text Banner -->
  <rect x="40" y="420" width="432" height="64" rx="18" fill="#041122" fill-opacity="0.95" stroke="#38bdf8" stroke-width="2" filter="url(#iceShadow)" />
  <text x="256" y="448" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" letter-spacing="1.5" text-anchor="middle">CONGELAR TEMPO</text>
  <text x="256" y="469" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#7dd3fc" letter-spacing="0.5" text-anchor="middle">Pausa o Cronómetro (+15 Segundos)</text>
</svg>
`;

async function main() {
  console.log('='.repeat(80));
  console.log('🇵🇹 ACORDA PORTUGAL — GERADOR DE ASSETS EXCLUSIVOS (3 ARTES VISUAIS ÚNICAS)');
  console.log('='.repeat(80));

  const items = [
    {
      id: 'AID_002',
      name: 'Pack x5 Ajudas 50/50',
      fileName: 'aid-50-50.webp',
      altFileName: 'aid-5050.webp',
      svg: svg5050,
    },
    {
      id: 'AID_003',
      name: 'Pack x3 Pergunta ao Público',
      fileName: 'aid-publico.webp',
      altFileName: 'aid-pergunta-publico.webp',
      svg: svgPublico,
    },
    {
      id: 'AID_004',
      name: 'Pack x3 Congelar Tempo',
      fileName: 'aid-freeze-time.webp',
      altFileName: 'aid-congelar-tempo.webp',
      svg: svgFreezeTime,
    },
  ];

  const hashes = {};

  for (const item of items) {
    const svgBuffer = Buffer.from(item.svg.trim());
    const webpBuffer = await sharp(svgBuffer)
      .resize(512, 512)
      .webp({ quality: 95, lossless: false })
      .toBuffer();

    const sha256 = crypto.createHash('sha256').update(webpBuffer).digest('hex');
    hashes[item.id] = {
      name: item.name,
      fileName: item.fileName,
      hash: sha256,
      sizeBytes: webpBuffer.length,
    };

    for (const dir of targetDirs) {
      // Gravar nome canónico
      const primaryPath = path.join(dir, item.fileName);
      fs.writeFileSync(primaryPath, webpBuffer);
      // Gravar nome alternativo/legado para retrocompatibilidade física
      const altPath = path.join(dir, item.altFileName);
      fs.writeFileSync(altPath, webpBuffer);
    }

    console.log(`✅ [ASSET CRIADO] ${item.id} (${item.name}) -> ${item.fileName} | SHA-256: ${sha256.substring(0, 16)}... (${webpBuffer.length} bytes)`);
  }

  // Validação de Duplicação Estrita
  const uniqueHashes = new Set(Object.values(hashes).map((h) => h.hash));
  if (uniqueHashes.size !== 3) {
    console.error('❌ ERRO CRÍTICO: Existem assets com hashes idênticos! Abortando.');
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log('✨ SUCESSO: 3 ARTES VISUAIS ÚNICAS GERADAS COM ZERO DUPLICAÇÃO!');
  console.log('='.repeat(80));
}

main().catch((err) => {
  console.error('Erro ao gerar assets:', err);
  process.exit(1);
});
