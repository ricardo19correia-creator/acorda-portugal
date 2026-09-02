import fs from 'fs'
import path from 'path'

const root = process.cwd()

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 1. VIP AVATARS (6) - 512x512
const avatars = [
  {
    file: 'vip_avatar_001.svg',
    title: 'Rei de Portugal',
    rarity: 'Lendário',
    accent: '#F59E0B',
    secondary: '#B45309',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_king" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#311B92" />
      <stop offset="50%" stop-color="#1A0A3A" />
      <stop offset="100%" stop-color="#05020E" />
    </radialGradient>
    <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="35%" stop-color="#F59E0B" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="robe_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#991B1B" />
      <stop offset="60%" stop-color="#7F1D1D" />
      <stop offset="100%" stop-color="#450A0A" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg_king)" />
  <circle cx="256" cy="256" r="220" fill="none" stroke="url(#gold_grad)" stroke-width="6" opacity="0.6" />
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold_grad)" stroke-width="2" stroke-dasharray="8,6" opacity="0.8" />
  
  <!-- Rays of Majesty -->
  <g opacity="0.25" stroke="url(#gold_grad)" stroke-width="2">
    <line x1="256" y1="20" x2="256" y2="492" />
    <line x1="20" y1="256" x2="492" y2="256" />
    <line x1="89" y1="89" x2="423" y2="423" />
    <line x1="89" y1="423" x2="423" y2="89" />
  </g>

  <!-- Imperial Robe / Mantle -->
  <path d="M120 512 C120 380, 180 340, 256 340 C332 340, 392 380, 392 512 Z" fill="url(#robe_grad)" stroke="url(#gold_grad)" stroke-width="6" />
  <path d="M160 512 C170 410, 200 370, 256 370 C312 370, 342 410, 352 512 Z" fill="#FEF3C7" stroke="url(#gold_grad)" stroke-width="4" />
  <!-- Ermine spots -->
  <g fill="#1E1B4B" opacity="0.8">
    <polygon points="230,420 234,428 226,428" /><circle cx="230" cy="432" r="1.5" />
    <polygon points="282,420 286,428 278,428" /><circle cx="282" cy="432" r="1.5" />
    <polygon points="256,450 260,458 252,458" /><circle cx="256" cy="462" r="1.5" />
  </g>

  <!-- King Head & Beard Silhouette -->
  <circle cx="256" cy="240" r="75" fill="#FED7AA" stroke="url(#gold_grad)" stroke-width="4" />
  <path d="M190 245 C190 320, 230 350, 256 350 C282 350, 322 320, 322 245 C305 260, 290 270, 256 270 C222 270, 207 260, 190 245 Z" fill="#78350F" />
  <!-- Royal Mustache -->
  <path d="M220 265 Q256 250 292 265 Q256 280 220 265 Z" fill="#92400E" />

  <!-- Eyes of Authority -->
  <ellipse cx="230" cy="225" rx="8" ry="5" fill="#1E293B" />
  <ellipse cx="282" cy="225" rx="8" ry="5" fill="#1E293B" />
  <circle cx="232" cy="223" r="2.5" fill="#FFF" />
  <circle cx="284" cy="223" r="2.5" fill="#FFF" />

  <!-- Imperial Crown of Portugal -->
  <g filter="url(#glow)">
    <path d="M180 185 L195 95 L225 145 L256 70 L287 145 L317 95 L332 185 Z" fill="url(#gold_grad)" stroke="#FFF9C4" stroke-width="3" />
    <rect x="175" y="180" width="162" height="24" rx="6" fill="url(#gold_grad)" stroke="#FFF9C4" stroke-width="2" />
    <!-- Jewels -->
    <circle cx="200" cy="192" r="5" fill="#DC2626" />
    <circle cx="228" cy="192" r="5" fill="#16A34A" />
    <circle cx="256" cy="192" r="6" fill="#2563EB" />
    <circle cx="284" cy="192" r="5" fill="#16A34A" />
    <circle cx="312" cy="192" r="5" fill="#DC2626" />
    <!-- Cross atop crown -->
    <path d="M256 50 L256 70 M248 58 L264 58" stroke="url(#gold_grad)" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Banner Badge -->
  <rect x="146" y="460" width="220" height="36" rx="18" fill="#111827" stroke="url(#gold_grad)" stroke-width="3" />
  <text x="256" y="484" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">REI DE PORTUGAL</text>
</svg>`
  },
  {
    file: 'vip_avatar_002.svg',
    title: 'Guardião Nacional',
    rarity: 'Mítico',
    accent: '#E11D48',
    secondary: '#BE123C',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_guard" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#4C0519" />
      <stop offset="60%" stop-color="#1F030B" />
      <stop offset="100%" stop-color="#050003" />
    </radialGradient>
    <linearGradient id="mythic_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDA4AF" />
      <stop offset="50%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#881337" />
    </linearGradient>
    <linearGradient id="armillary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
    <filter id="ruby_glow">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg_guard)" />
  <circle cx="256" cy="256" r="230" fill="none" stroke="url(#mythic_grad)" stroke-width="4" stroke-dasharray="12,8" opacity="0.8" />
  
  <!-- Armillary Sphere In Background -->
  <g opacity="0.2" stroke="url(#armillary)" stroke-width="4" fill="none">
    <circle cx="256" cy="230" r="160" />
    <ellipse cx="256" cy="230" rx="160" ry="60" />
    <ellipse cx="256" cy="230" rx="60" ry="160" />
    <line x1="96" y1="70" x2="416" y2="390" stroke-width="6" />
  </g>

  <!-- Heavy Guardian Plate Pauldrons -->
  <path d="M100 512 L130 360 L210 370 L230 512 Z" fill="#0F172A" stroke="url(#mythic_grad)" stroke-width="6" />
  <path d="M412 512 L382 360 L302 370 L282 512 Z" fill="#0F172A" stroke="url(#mythic_grad)" stroke-width="6" />
  <path d="M180 512 C180 390, 332 390, 332 512 Z" fill="#1E293B" stroke="url(#mythic_grad)" stroke-width="6" />

  <!-- Supreme Quinas Crest On Chest -->
  <polygon points="256,410 286,430 286,470 256,495 226,470 226,430" fill="#1D4ED8" stroke="#FFF" stroke-width="3" />
  <circle cx="256" cy="445" r="4" fill="#FFF" />
  <circle cx="244" cy="455" r="3.5" fill="#FFF" />
  <circle cx="268" cy="455" r="3.5" fill="#FFF" />
  <circle cx="248" cy="472" r="3.5" fill="#FFF" />
  <circle cx="264" cy="472" r="3.5" fill="#FFF" />

  <!-- Guardian Helm & Glowing Ruby Visor -->
  <path d="M186 270 C186 160, 326 160, 326 270 L306 350 L206 350 Z" fill="#0F172A" stroke="url(#mythic_grad)" stroke-width="6" />
  <path d="M210 240 L302 240 L292 280 L256 300 L220 280 Z" fill="#020617" stroke="url(#mythic_grad)" stroke-width="3" />
  
  <!-- Glowing Slit Visor -->
  <g filter="url(#ruby_glow)">
    <polygon points="225,255 287,255 280,268 256,275 232,268" fill="#FB7185" />
  </g>

  <!-- Crowned Helm Crest -->
  <path d="M256 120 L276 180 L236 180 Z" fill="url(#mythic_grad)" stroke="#FDA4AF" stroke-width="2" />
  <circle cx="256" cy="115" r="8" fill="#FDE047" stroke="#FFF" stroke-width="2" />

  <!-- Banner Badge -->
  <rect x="136" y="460" width="240" height="36" rx="18" fill="#0F172A" stroke="url(#mythic_grad)" stroke-width="3" />
  <text x="256" y="484" text-anchor="middle" fill="#FDA4AF" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">GUARDIÃO NACIONAL</text>
</svg>`
  },
  {
    file: 'vip_avatar_003.svg',
    title: 'Navegador Supremo',
    rarity: 'Épico',
    accent: '#0284C7',
    secondary: '#0369A1',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_nav" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#0C4A6E" />
      <stop offset="70%" stop-color="#082F49" />
      <stop offset="100%" stop-color="#02121E" />
    </radialGradient>
    <linearGradient id="ocean_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="gold_brass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg_nav)" />
  <!-- Wind Rose Compass in Background -->
  <circle cx="256" cy="240" r="180" fill="none" stroke="url(#gold_brass)" stroke-width="2" stroke-dasharray="6,6" opacity="0.4" />
  <g opacity="0.35" fill="url(#gold_brass)">
    <polygon points="256,60 264,240 256,220 248,240" />
    <polygon points="256,420 264,240 256,260 248,240" />
    <polygon points="76,240 256,248 236,240 256,232" />
    <polygon points="436,240 256,248 276,240 256,232" />
  </g>

  <!-- Captain Coat -->
  <path d="M120 512 C120 370, 190 330, 256 330 C322 330, 392 370, 392 512 Z" fill="#032B44" stroke="url(#gold_brass)" stroke-width="5" />
  <path d="M220 340 L256 420 L292 340 Z" fill="#F8FAFC" stroke="url(#gold_brass)" stroke-width="2" />
  <!-- Gold epaulets -->
  <ellipse cx="140" cy="375" rx="35" ry="18" fill="url(#gold_brass)" />
  <ellipse cx="372" cy="375" rx="35" ry="18" fill="url(#gold_brass)" />

  <!-- Head, Determined Navigator Face -->
  <circle cx="256" cy="240" r="70" fill="#FDBA74" />
  <path d="M196 230 C196 300, 230 330, 256 330 C282 330, 316 300, 316 230 C296 250, 276 260, 256 260 C236 260, 216 250, 196 230 Z" fill="#451A03" />

  <!-- Navigator Eyes scanning the horizon -->
  <ellipse cx="235" cy="225" rx="8" ry="5" fill="#0F172A" />
  <ellipse cx="277" cy="225" rx="8" ry="5" fill="#0F172A" />
  <circle cx="237" cy="223" r="2.5" fill="#38BDF8" />
  <circle cx="279" cy="223" r="2.5" fill="#38BDF8" />

  <!-- Classic Bicorne/Captains Hat with Order of Christ Cross -->
  <path d="M140 180 C180 100, 332 100, 372 180 C320 170, 192 170, 140 180 Z" fill="#021727" stroke="url(#gold_brass)" stroke-width="5" />
  <!-- Red Cross of Christ -->
  <g transform="translate(256, 145) scale(0.7)">
    <path d="M-15 -35 L15 -35 L10 -15 L35 -15 L35 15 L10 15 L15 35 L-15 35 L-10 15 L-35 15 L-35 -15 L-10 -15 Z" fill="#DC2626" stroke="#FFF" stroke-width="3" />
  </g>

  <!-- Banner Badge -->
  <rect x="136" y="460" width="240" height="36" rx="18" fill="#021727" stroke="url(#ocean_grad)" stroke-width="3" />
  <text x="256" y="484" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">NAVEGADOR SUPREMO</text>
</svg>`
  },
  {
    file: 'vip_avatar_004.svg',
    title: 'Cavaleiro de Portugal',
    rarity: 'Épico',
    accent: '#38BDF8',
    secondary: '#1E293B',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_kn" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="steel_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="silver_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg_kn)" />
  <circle cx="256" cy="256" r="230" fill="none" stroke="url(#silver_gold)" stroke-width="4" opacity="0.6" />

  <!-- Shield of Arms Behind -->
  <polygon points="256,70 380,120 360,340 256,420 152,340 132,120" fill="#0F172A" stroke="url(#silver_gold)" stroke-width="6" opacity="0.7" />

  <!-- Steel Armor Shoulders & Tunic -->
  <path d="M120 512 L140 370 L256 360 L372 370 L392 512 Z" fill="url(#steel_grad)" stroke="#1E293B" stroke-width="6" />
  <!-- Red Cross Over Armor -->
  <rect x="244" y="370" width="24" height="142" fill="#DC2626" />
  <rect x="180" y="420" width="152" height="24" fill="#DC2626" />

  <!-- Medieval Great Helm -->
  <path d="M190 290 L190 190 C190 140, 322 140, 322 190 L322 290 L256 340 Z" fill="url(#steel_grad)" stroke="#0F172A" stroke-width="6" />
  <!-- Brass Reinforcement Band -->
  <path d="M190 220 L322 220 L322 250 L190 250 Z" fill="url(#silver_gold)" stroke="#0F172A" stroke-width="2" />
  <line x1="256" y1="150" x2="256" y2="335" stroke="url(#silver_gold)" stroke-width="12" />

  <!-- Vision Slits -->
  <rect x="205" y="230" width="40" height="8" rx="2" fill="#020617" />
  <rect x="267" y="230" width="40" height="8" rx="2" fill="#020617" />
  <!-- Breathing Holes -->
  <g fill="#020617">
    <circle cx="225" cy="275" r="3" /><circle cx="240" cy="275" r="3" /><circle cx="272" cy="275" r="3" /><circle cx="287" cy="275" r="3" />
    <circle cx="232" cy="290" r="3" /><circle cx="280" cy="290" r="3" />
  </g>

  <!-- Crest Feather Plume (Red & Green) -->
  <path d="M256 145 C230 90, 200 80, 180 90 C220 120, 240 130, 256 145 Z" fill="#16A34A" />
  <path d="M256 145 C270 80, 310 70, 330 80 C290 110, 270 130, 256 145 Z" fill="#DC2626" />

  <!-- Banner Badge -->
  <rect x="136" y="460" width="240" height="36" rx="18" fill="#0F172A" stroke="url(#silver_gold)" stroke-width="3" />
  <text x="256" y="484" text-anchor="middle" fill="#FEF08A" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">CAVALEIRO DE PORTUGAL</text>
</svg>`
  },
  {
    file: 'vip_avatar_005.svg',
    title: 'Conquistador',
    rarity: 'Lendário',
    accent: '#D97706',
    secondary: '#78350F',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_conq" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#451A03" />
      <stop offset="60%" stop-color="#1C0A00" />
      <stop offset="100%" stop-color="#080200" />
    </radialGradient>
    <linearGradient id="gold_armor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="40%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg_conq)" />
  <circle cx="256" cy="256" r="230" fill="none" stroke="url(#gold_armor)" stroke-width="4" stroke-dasharray="8,4" opacity="0.7" />

  <!-- Cuirass Armor -->
  <path d="M120 512 C120 370, 180 340, 256 340 C332 340, 392 370, 392 512 Z" fill="url(#gold_armor)" stroke="#451A03" stroke-width="6" />
  <!-- Collar / Gorget -->
  <path d="M190 340 C200 390, 312 390, 322 340 Z" fill="#78350F" stroke="#FDE68A" stroke-width="3" />

  <!-- Conquistador Head & Stern Look -->
  <circle cx="256" cy="240" r="70" fill="#FDBA74" />
  <!-- Spanish/Portuguese Styled Goatee -->
  <path d="M236 290 L256 345 L276 290 Z" fill="#1C1917" />
  <path d="M220 270 Q256 255 292 270 Q256 285 220 270 Z" fill="#1C1917" />

  <!-- Fierce Eyes -->
  <ellipse cx="235" cy="230" rx="8" ry="4.5" fill="#1C1917" />
  <ellipse cx="277" cy="230" rx="8" ry="4.5" fill="#1C1917" />
  <circle cx="236" cy="228" r="2" fill="#F59E0B" />
  <circle cx="278" cy="228" r="2" fill="#F59E0B" />

  <!-- Classic Morion Helmet -->
  <path d="M130 200 C200 170, 312 170, 382 200 C340 215, 172 215, 130 200 Z" fill="url(#gold_armor)" stroke="#451A03" stroke-width="4" />
  <path d="M190 195 C190 120, 322 120, 322 195 Z" fill="url(#gold_armor)" stroke="#451A03" stroke-width="4" />
  <!-- Morion High Curved Comb -->
  <path d="M246 80 C246 80, 256 60, 266 80 L266 180 L246 180 Z" fill="url(#gold_armor)" stroke="#FFF" stroke-width="2" />
  <path d="M236 70 C240 50, 272 50, 276 70 C270 120, 242 120, 236 70 Z" fill="#B45309" />

  <!-- Banner Badge -->
  <rect x="156" y="460" width="200" height="36" rx="18" fill="#1C1917" stroke="url(#gold_armor)" stroke-width="3" />
  <text x="256" y="484" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">CONQUISTADOR</text>
</svg>`
  },
  {
    file: 'vip_avatar_006.svg',
    title: 'Espírito Lusitano',
    rarity: 'Raro',
    accent: '#10B981',
    secondary: '#047857',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_luso" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="60%" stop-color="#022C22" />
      <stop offset="100%" stop-color="#01140F" />
    </radialGradient>
    <linearGradient id="luso_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7" />
      <stop offset="50%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg_luso)" />
  <circle cx="256" cy="256" r="230" fill="none" stroke="url(#luso_grad)" stroke-width="4" stroke-dasharray="10,6" opacity="0.8" />

  <!-- Lusitanian Laurel Wreath Glow -->
  <g fill="none" stroke="#FDE047" stroke-width="3" opacity="0.6">
    <ellipse cx="256" cy="220" rx="140" ry="120" />
  </g>

  <!-- Noble Tunic -->
  <path d="M130 512 C130 380, 190 350, 256 350 C322 350, 382 380, 382 512 Z" fill="#047857" stroke="#6EE7B7" stroke-width="5" />
  <polygon points="256,360 276,430 256,480 236,430" fill="#DC2626" stroke="#FEF08A" stroke-width="2" />

  <!-- Lusitano Hero Face -->
  <circle cx="256" cy="245" r="75" fill="#FED7AA" />
  <path d="M185 240 C185 160, 327 160, 327 240 C310 200, 202 200, 185 240 Z" fill="#78350F" />

  <!-- Radiant Golden Laurel Wreath On Head -->
  <g fill="#FBBF24" stroke="#78350F" stroke-width="1.5">
    <ellipse cx="195" cy="190" rx="12" ry="6" transform="rotate(-30 195 190)" />
    <ellipse cx="215" cy="170" rx="12" ry="6" transform="rotate(-15 215 170)" />
    <ellipse cx="240" cy="160" rx="12" ry="6" />
    <ellipse cx="272" cy="160" rx="12" ry="6" />
    <ellipse cx="297" cy="170" rx="12" ry="6" transform="rotate(15 297 170)" />
    <ellipse cx="317" cy="190" rx="12" ry="6" transform="rotate(30 317 190)" />
  </g>

  <!-- Proud Eyes -->
  <ellipse cx="235" cy="235" rx="8" ry="5" fill="#1F2937" />
  <ellipse cx="277" cy="235" rx="8" ry="5" fill="#1F2937" />
  <circle cx="236" cy="233" r="2.5" fill="#10B981" />
  <circle cx="278" cy="233" r="2.5" fill="#10B981" />

  <!-- Banner Badge -->
  <rect x="146" y="460" width="220" height="36" rx="18" fill="#064E3B" stroke="url(#luso_grad)" stroke-width="3" />
  <text x="256" y="484" text-anchor="middle" fill="#6EE7B7" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">ESPÍRITO LUSITANO</text>
</svg>`
  }
]

// 2. VIP FRAMES (6) - 512x512
const frames = [
  {
    file: 'vip_frame_001.svg',
    title: 'Coroa Imperial Portuguesa',
    color1: '#F59E0B',
    color2: '#EF4444',
    desc: 'Moldura imperial com filigrana dourada e coroa régia',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="f1_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <filter id="f1_glow">
      <feGaussianBlur stdDeviation="8" result="b" />
      <feComposite in="SourceGraphic" in2="b" operator="over" />
    </filter>
  </defs>
  <!-- Outer Ornate Filigree Frame -->
  <rect x="24" y="24" width="464" height="464" rx="48" fill="none" stroke="url(#f1_gold)" stroke-width="12" filter="url(#f1_glow)" />
  <rect x="36" y="36" width="440" height="440" rx="40" fill="none" stroke="#EF4444" stroke-width="3" stroke-dasharray="10,6" />
  
  <!-- 4 Corner Royal Ornaments -->
  <g fill="url(#f1_gold)">
    <circle cx="48" cy="48" r="16" />
    <circle cx="464" cy="48" r="16" />
    <circle cx="48" cy="464" r="16" />
    <circle cx="464" cy="464" r="16" />
  </g>

  <!-- Top Imperial Crown Crest -->
  <g transform="translate(256, 32) scale(0.85)" filter="url(#f1_glow)">
    <path d="M-40 0 L-25 -30 L0 -10 L25 -30 L40 0 Z" fill="url(#f1_gold)" stroke="#FFF" stroke-width="2" />
    <circle cx="-25" cy="-30" r="4" fill="#EF4444" />
    <circle cx="0" cy="-35" r="5" fill="#2563EB" />
    <circle cx="25" cy="-30" r="4" fill="#10B981" />
  </g>
  <!-- Inner Transparent Window -->
  <rect x="64" y="64" width="384" height="384" rx="32" fill="none" stroke="url(#f1_gold)" stroke-width="4" opacity="0.6" />
</svg>`
  },
  {
    file: 'vip_frame_002.svg',
    title: 'Portugal Dourado',
    color1: '#EAB308',
    color2: '#10B981',
    desc: 'Moldura dourada com as quinas e esfera armilar',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="f2_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>
  </defs>
  <rect x="24" y="24" width="464" height="464" rx="44" fill="none" stroke="url(#f2_gold)" stroke-width="14" />
  <rect x="42" y="42" width="428" height="428" rx="36" fill="none" stroke="#10B981" stroke-width="4" />
  <!-- Corner Castles -->
  <g fill="url(#f2_gold)">
    <rect x="36" y="36" width="24" height="24" rx="4" /><rect x="452" y="36" width="24" height="24" rx="4" />
    <rect x="36" y="452" width="24" height="24" rx="4" /><rect x="452" y="452" width="24" height="24" rx="4" />
  </g>
  <!-- Armillary spheres top and bottom -->
  <circle cx="256" cy="32" r="14" fill="none" stroke="url(#f2_gold)" stroke-width="3" />
  <circle cx="256" cy="480" r="14" fill="none" stroke="url(#f2_gold)" stroke-width="3" />
</svg>`
  },
  {
    file: 'vip_frame_003.svg',
    title: 'Reino Celestial',
    color1: '#818CF8',
    color2: '#C084FC',
    desc: 'Moldura cósmica com cristais e estrelas reluzentes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="f3_cosmic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="50%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
  </defs>
  <rect x="24" y="24" width="464" height="464" rx="48" fill="none" stroke="url(#f3_cosmic)" stroke-width="10" />
  <!-- Floating Diamonds -->
  <g fill="url(#f3_cosmic)">
    <polygon points="256,12 268,26 256,40 244,26" />
    <polygon points="256,472 268,486 256,500 244,486" />
    <polygon points="12,256 26,268 40,256 26,244" />
    <polygon points="472,256 486,268 500,256 486,244" />
  </g>
  <circle cx="256" cy="256" r="215" fill="none" stroke="url(#f3_cosmic)" stroke-width="2" stroke-dasharray="6,8" opacity="0.7" />
</svg>`
  },
  {
    file: 'vip_frame_004.svg',
    title: 'Glória Nacional',
    color1: '#38BDF8',
    color2: '#0284C7',
    desc: 'Moldura de prestígio com coroa de louros e fitas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="f4_sky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAE6FD" />
      <stop offset="50%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
  </defs>
  <rect x="28" y="28" width="456" height="456" rx="40" fill="none" stroke="url(#f4_sky)" stroke-width="12" />
  <!-- Laurel leaves around frame border -->
  <g fill="url(#f4_sky)">
    <ellipse cx="60" cy="60" rx="14" ry="7" transform="rotate(45 60 60)" />
    <ellipse cx="452" cy="60" rx="14" ry="7" transform="rotate(-45 452 60)" />
    <ellipse cx="60" cy="452" rx="14" ry="7" transform="rotate(-45 60 452)" />
    <ellipse cx="452" cy="452" rx="14" ry="7" transform="rotate(45 452 452)" />
  </g>
</svg>`
  },
  {
    file: 'vip_frame_005.svg',
    title: 'Diamante Lusitano',
    color1: '#E0F2FE',
    color2: '#38BDF8',
    desc: 'Moldura multifacetada com brilho de diamante',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="f5_diam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#BAE6FD" />
      <stop offset="80%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
  </defs>
  <rect x="26" y="26" width="460" height="460" rx="44" fill="none" stroke="url(#f5_diam)" stroke-width="12" />
  <polygon points="256,18 280,36 256,54 232,36" fill="#FFF" stroke="url(#f5_diam)" stroke-width="2" />
  <polygon points="256,458 280,476 256,494 232,476" fill="#FFF" stroke="url(#f5_diam)" stroke-width="2" />
</svg>`
  },
  {
    file: 'vip_frame_006.svg',
    title: 'Fogo de Portugal',
    color1: '#EF4444',
    color2: '#F59E0B',
    desc: 'Moldura dinâmica com labaredas e brasas vivas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="f6_fire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#F59E0B" />
      <stop offset="80%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#991B1B" />
    </linearGradient>
  </defs>
  <rect x="26" y="26" width="460" height="460" rx="44" fill="none" stroke="url(#f6_fire)" stroke-width="12" />
  <!-- Flame notches -->
  <g fill="url(#f6_fire)">
    <path d="M40 80 Q20 50 50 30 Q70 60 40 80 Z" />
    <path d="M472 80 Q492 50 462 30 Q442 60 472 80 Z" />
    <path d="M40 432 Q20 462 50 482 Q70 452 40 432 Z" />
    <path d="M472 432 Q492 462 462 482 Q442 452 472 432 Z" />
  </g>
</svg>`
  }
]

// 3. VIP TITLES (8) - 512x160 (Banner / Insignia style)
const titles = [
  { file: 'vip_title_001.svg', text: 'LENDA NACIONAL', color: '#F59E0B', rank: 'Lendário' },
  { file: 'vip_title_002.svg', text: 'IMORTAL', color: '#E11D48', rank: 'Mítico' },
  { file: 'vip_title_003.svg', text: 'REI DO DESAFIO', color: '#F59E0B', rank: 'Lendário' },
  { file: 'vip_title_004.svg', text: 'MESTRE LUSITANO', color: '#A855F7', rank: 'Épico' },
  { file: 'vip_title_005.svg', text: 'CAMPEÃO SUPREMO', color: '#8B5CF6', rank: 'Épico' },
  { file: 'vip_title_006.svg', text: 'SENHOR DAS PERGUNTAS', color: '#38BDF8', rank: 'Épico' },
  { file: 'vip_title_007.svg', text: 'ORGULHO NACIONAL', color: '#06B6D4', rank: 'Raro' },
  { file: 'vip_title_008.svg', text: 'ACORDADO PARA SEMPRE', color: '#10B981', rank: 'Raro' },
]

// 4. VIP ARENAS (6) - 1920x1080 (Cinematic vector backdrops)
const arenas = [
  {
    file: 'palacio-nacional.svg',
    title: 'Palácio Nacional',
    color: '#F59E0B',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_pal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E1B4B" />
      <stop offset="100%" stop-color="#31103F" />
    </linearGradient>
    <linearGradient id="pal_gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky_pal)" />
  <!-- Monumental Palace Columns -->
  <g fill="#1E293B" stroke="url(#pal_gold)" stroke-width="4">
    <rect x="200" y="300" width="120" height="780" />
    <rect x="420" y="300" width="120" height="780" />
    <rect x="1380" y="300" width="120" height="780" />
    <rect x="1600" y="300" width="120" height="780" />
    <!-- Center Grand Arch -->
    <path d="M680 1080 L680 500 Q960 300 1240 500 L1240 1080 Z" fill="#0B0F19" stroke="url(#pal_gold)" stroke-width="8" />
  </g>
  <!-- Chandelier & Light Beams -->
  <circle cx="960" cy="420" r="80" fill="#FEF08A" opacity="0.3" />
  <text x="960" y="240" fill="#F59E0B" font-family="sans-serif" font-weight="900" font-size="44" letter-spacing="8" text-anchor="middle">PALÁCIO NACIONAL</text>
</svg>`
  },
  {
    file: 'estadio-lendas.svg',
    title: 'Estádio das Lendas',
    color: '#10B981',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_stad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#022C22" />
      <stop offset="60%" stop-color="#064E3B" />
      <stop offset="100%" stop-color="#052E16" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky_stad)" />
  <!-- Stadium Floodlights -->
  <circle cx="300" cy="180" r="140" fill="#34D399" opacity="0.25" />
  <circle cx="1620" cy="180" r="140" fill="#34D399" opacity="0.25" />
  <!-- Stadium Rings and Pitch Lines -->
  <ellipse cx="960" cy="850" rx="800" ry="320" fill="#065F46" stroke="#34D399" stroke-width="8" />
  <ellipse cx="960" cy="850" rx="300" ry="120" fill="none" stroke="#FFF" stroke-width="6" opacity="0.8" />
  <text x="960" y="220" fill="#34D399" font-family="sans-serif" font-weight="900" font-size="44" letter-spacing="8" text-anchor="middle">ESTÁDIO DAS LENDAS</text>
</svg>`
  },
  {
    file: 'portugal-3d.svg',
    title: 'Portugal 3D',
    color: '#38BDF8',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_3d" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="60%" stop-color="#0C4A6E" />
      <stop offset="100%" stop-color="#082F49" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky_3d)" />
  <!-- 3D Perspective Grid -->
  <g stroke="#38BDF8" stroke-width="2" opacity="0.35">
    <line x1="960" y1="400" x2="0" y2="1080" />
    <line x1="960" y1="400" x2="400" y2="1080" />
    <line x1="960" y1="400" x2="800" y2="1080" />
    <line x1="960" y1="400" x2="1120" y2="1080" />
    <line x1="960" y1="400" x2="1520" y2="1080" />
    <line x1="960" y1="400" x2="1920" y2="1080" />
    <ellipse cx="960" cy="740" rx="700" ry="240" fill="none" />
  </g>
  <text x="960" y="240" fill="#38BDF8" font-family="sans-serif" font-weight="900" font-size="44" letter-spacing="8" text-anchor="middle">PORTUGAL 3D</text>
</svg>`
  },
  {
    file: 'trono-real.svg',
    title: 'Trono Real',
    color: '#EAB308',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="throne_bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#450A0A" />
      <stop offset="60%" stop-color="#1C0404" />
      <stop offset="100%" stop-color="#050000" />
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#throne_bg)" />
  <!-- Monumental Royal Throne Silhoutte -->
  <g fill="#1F2937" stroke="#EAB308" stroke-width="6">
    <polygon points="760,1080 840,400 960,320 1080,400 1160,1080" />
    <!-- Crown on top of throne -->
    <path d="M900 320 L930 250 L960 280 L990 250 L1020 320 Z" fill="#EAB308" stroke="#FFF" stroke-width="2" />
  </g>
  <text x="960" y="200" fill="#EAB308" font-family="sans-serif" font-weight="900" font-size="44" letter-spacing="8" text-anchor="middle">TRONO REAL</text>
</svg>`
  },
  {
    file: 'castelo-campeoes.svg',
    title: 'Castelo dos Campeões',
    color: '#D97706',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_cas" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181B" />
      <stop offset="60%" stop-color="#27272A" />
      <stop offset="100%" stop-color="#09090B" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky_cas)" />
  <!-- Medieval Battlements -->
  <g fill="#18181B" stroke="#D97706" stroke-width="6">
    <rect x="300" y="450" width="240" height="630" />
    <rect x="1380" y="450" width="240" height="630" />
    <path d="M540 600 L1380 600 L1380 1080 L540 1080 Z" />
  </g>
  <text x="960" y="240" fill="#D97706" font-family="sans-serif" font-weight="900" font-size="44" letter-spacing="8" text-anchor="middle">CASTELO DOS CAMPEÕES</text>
</svg>`
  },
  {
    file: 'ceu-lusitano.svg',
    title: 'Céu Lusitano',
    color: '#6366F1',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_ceu" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="50%" stop-color="#312E81" />
      <stop offset="100%" stop-color="#4338CA" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky_ceu)" />
  <circle cx="960" cy="540" r="300" fill="#818CF8" opacity="0.25" />
  <text x="960" y="240" fill="#C7D2FE" font-family="sans-serif" font-weight="900" font-size="44" letter-spacing="8" text-anchor="middle">CÉU LUSITANO</text>
</svg>`
  }
]

// 5. VIP EMOTES (8) - 256x256
const emotes = [
  { file: 'vip_emote_001.svg', emoji: '👑', label: 'Coroa' },
  { file: 'vip_emote_002.svg', emoji: '🇵🇹', label: 'Vitória Nacional' },
  { file: 'vip_emote_003.svg', emoji: '😂👑', label: 'Risada Real' },
  { file: 'vip_emote_004.svg', emoji: '🔥', label: 'Fogo' },
  { file: 'vip_emote_005.svg', emoji: '😱', label: 'Sem Palavras' },
  { file: 'vip_emote_006.svg', emoji: '🧠', label: 'Mestre' },
  { file: 'vip_emote_007.svg', emoji: '👏', label: 'Boa Jogada' },
  { file: 'vip_emote_008.svg', emoji: '🇵🇹🔥', label: 'Portugal Ganhou' },
]

// 6. VIP TAUNT PACKS (4) - 512x256 (Card banner style)
const tauntpacks = [
  { file: 'vip_tauntpack_001.svg', name: 'Provocação Real', icon: '👑', color: '#F59E0B' },
  { file: 'vip_tauntpack_002.svg', name: 'Guerra dos Campeões', icon: '⚔️', color: '#E11D48' },
  { file: 'vip_tauntpack_003.svg', name: 'Lusitano Implacável', icon: '🇵🇹', color: '#D97706' },
  { file: 'vip_tauntpack_004.svg', name: 'Mestre da Trollagem', icon: '😜', color: '#A855F7' },
]

console.log('Generating 38 VIP Assets...')

// Avatars
const avatarsDir = path.join(root, 'public', 'images', 'avatars', 'vip')
ensureDir(avatarsDir)
avatars.forEach(a => {
  fs.writeFileSync(path.join(avatarsDir, a.file), a.svg.trim())
})
console.log('✔ 6 VIP Avatars created')

// Frames
const framesDir = path.join(root, 'public', 'images', 'frames', 'vip')
ensureDir(framesDir)
frames.forEach(f => {
  fs.writeFileSync(path.join(framesDir, f.file), f.svg.trim())
})
console.log('✔ 6 VIP Frames created')

// Titles
const titlesDir = path.join(root, 'public', 'images', 'titles', 'vip')
ensureDir(titlesDir)
titles.forEach(t => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 160" width="100%" height="100%">
  <defs>
    <linearGradient id="g_${t.file.replace('.svg', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="496" height="144" rx="28" fill="url(#g_${t.file.replace('.svg', '')})" stroke="${t.color}" stroke-width="4" />
  <rect x="20" y="20" width="472" height="120" rx="20" fill="none" stroke="${t.color}" stroke-width="1.5" stroke-dasharray="8,6" opacity="0.6" />
  <text x="256" y="88" text-anchor="middle" fill="${t.color}" font-family="sans-serif" font-weight="900" font-size="22" letter-spacing="3">${t.text}</text>
  <text x="256" y="118" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-weight="700" font-size="12" letter-spacing="2">TÍTULO VIP · ${t.rank.toUpperCase()}</text>
</svg>`
  fs.writeFileSync(path.join(titlesDir, t.file), svg.trim())
})
console.log('✔ 8 VIP Titles created')

// Arenas
const arenasDir = path.join(root, 'public', 'arenas', 'vip')
ensureDir(arenasDir)
arenas.forEach(ar => {
  fs.writeFileSync(path.join(arenasDir, ar.file), ar.svg.trim())
})
console.log('✔ 6 VIP Arenas created')

// Emotes
const emotesDir = path.join(root, 'public', 'images', 'emotes', 'vip')
ensureDir(emotesDir)
emotes.forEach(em => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <circle cx="128" cy="128" r="116" fill="#0F172A" stroke="#F59E0B" stroke-width="6" />
  <circle cx="128" cy="128" r="102" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6,4" opacity="0.6" />
  <text x="128" y="148" text-anchor="middle" font-size="80">${em.emoji}</text>
  <text x="128" y="215" text-anchor="middle" fill="#FDE047" font-family="sans-serif" font-weight="800" font-size="14">${em.label.toUpperCase()}</text>
</svg>`
  fs.writeFileSync(path.join(emotesDir, em.file), svg.trim())
})
console.log('✔ 8 VIP Emotes created')

// Taunt Packs
const tauntpacksDir = path.join(root, 'public', 'images', 'tauntpacks', 'vip')
ensureDir(tauntpacksDir)
tauntpacks.forEach(tp => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256" width="100%" height="100%">
  <rect x="8" y="8" width="496" height="240" rx="32" fill="#0F172A" stroke="${tp.color}" stroke-width="6" />
  <rect x="22" y="22" width="468" height="212" rx="24" fill="none" stroke="${tp.color}" stroke-width="2" stroke-dasharray="8,6" opacity="0.5" />
  <text x="70" y="130" font-size="64">${tp.icon}</text>
  <text x="160" y="115" fill="#FFF" font-family="sans-serif" font-weight="900" font-size="28">${tp.name.toUpperCase()}</text>
  <text x="160" y="155" fill="${tp.color}" font-family="sans-serif" font-weight="700" font-size="16" letter-spacing="2">6 PROVOCAÇÕES EXCLUSIVAS</text>
  <rect x="160" y="175" width="120" height="26" rx="13" fill="${tp.color}33" stroke="${tp.color}" stroke-width="1.5" />
  <text x="220" y="193" text-anchor="middle" fill="${tp.color}" font-family="sans-serif" font-weight="800" font-size="11">PACK VIP</text>
</svg>`
  fs.writeFileSync(path.join(tauntpacksDir, tp.file), svg.trim())
})
console.log('✔ 4 VIP Taunt Packs created')

console.log('ALL 38 VIP ASSETS GENERATED SUCCESSFULLY.')
