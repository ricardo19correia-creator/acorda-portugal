import fs from 'fs'
import path from 'path'

const VIP_DIR = path.resolve(process.cwd(), 'public/arenas/vip')
const ULTIMATE_DIR = path.resolve(process.cwd(), 'public/arenas/vip/ultimate')

if (!fs.existsSync(VIP_DIR)) fs.mkdirSync(VIP_DIR, { recursive: true })
if (!fs.existsSync(ULTIMATE_DIR)) fs.mkdirSync(ULTIMATE_DIR, { recursive: true })

// 1. PALÁCIO NACIONAL (Mítica)
const palacioNacionalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="pal_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="40%" stop-color="#0f172a" />
      <stop offset="80%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="30%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="marble_floor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="30%" stop-color="#1e293b" />
      <stop offset="70%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <radialGradient id="god_rays" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.35" />
      <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="velvet_carpet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#991b1b" />
      <stop offset="50%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>
  </defs>

  <!-- Fundo Arquitetónico -->
  <rect width="1920" height="1080" fill="url(#pal_bg)" />
  <rect width="1920" height="1080" fill="url(#god_rays)" />

  <!-- Abóbada e Arcos Monumentais de Fundo -->
  <g stroke="url(#gold_grad)" stroke-width="3" fill="none" opacity="0.6">
    <path d="M 160,650 Q 960,-100 1760,650" />
    <path d="M 280,650 Q 960,40 1640,650" />
    <path d="M 400,650 Q 960,160 1520,650" />
    <path d="M 540,650 Q 960,260 1380,650" />
  </g>

  <!-- Janelas de Vitral Gótico Iluminadas -->
  <g fill="#0284c7" opacity="0.35">
    <path d="M 800,280 Q 880,180 960,280 L 960,480 L 800,480 Z" />
    <path d="M 960,280 Q 1040,180 1120,280 L 1120,480 L 960,480 Z" />
  </g>
  <g stroke="url(#gold_grad)" stroke-width="4" fill="none">
    <path d="M 800,280 Q 880,180 960,280 L 960,480 L 800,480 Z" />
    <path d="M 960,280 Q 1040,180 1120,280 L 1120,480 L 960,480 Z" />
    <circle cx="960" cy="240" r="45" stroke="url(#gold_grad)" stroke-width="4" />
  </g>

  <!-- Brasão Real das Quinas Central -->
  <g transform="translate(960, 360)">
    <path d="M -60,-80 L 60,-80 L 60,20 Q 0,90 -60,20 Z" fill="#0284c7" stroke="url(#gold_grad)" stroke-width="5" />
    <!-- 5 Quinas -->
    <rect x="-10" y="-60" width="20" height="28" rx="4" fill="#ffffff" />
    <rect x="-38" y="-35" width="20" height="28" rx="4" fill="#ffffff" />
    <rect x="18" y="-35" width="20" height="28" rx="4" fill="#ffffff" />
    <rect x="-24" y="0" width="20" height="28" rx="4" fill="#ffffff" />
    <rect x="4" y="0" width="20" height="28" rx="4" fill="#ffffff" />
  </g>

  <!-- Colunata Imperial com Capitéis Dourados -->
  <!-- Colunas da Esquerda -->
  <g fill="#1e293b" stroke="url(#gold_grad)" stroke-width="4">
    <rect x="100" y="240" width="110" height="600" />
    <rect x="90" y="220" width="130" height="25" fill="url(#gold_grad)" />
    <rect x="90" y="815" width="130" height="25" fill="url(#gold_grad)" />

    <rect x="290" y="300" width="110" height="540" />
    <rect x="280" y="280" width="130" height="25" fill="url(#gold_grad)" />
    <rect x="280" y="815" width="130" height="25" fill="url(#gold_grad)" />

    <rect x="480" y="360" width="110" height="480" />
    <rect x="470" y="340" width="130" height="25" fill="url(#gold_grad)" />
    <rect x="470" y="815" width="130" height="25" fill="url(#gold_grad)" />
  </g>

  <!-- Colunas da Direita -->
  <g fill="#1e293b" stroke="url(#gold_grad)" stroke-width="4">
    <rect x="1330" y="360" width="110" height="480" />
    <rect x="1320" y="340" width="130" height="25" fill="url(#gold_grad)" />
    <rect x="1320" y="815" width="130" height="25" fill="url(#gold_grad)" />

    <rect x="1520" y="300" width="110" height="540" />
    <rect x="1510" y="280" width="130" height="25" fill="url(#gold_grad)" />
    <rect x="1510" y="815" width="130" height="25" fill="url(#gold_grad)" />

    <rect x="1710" y="240" width="110" height="600" />
    <rect x="1700" y="220" width="130" height="25" fill="url(#gold_grad)" />
    <rect x="1700" y="815" width="130" height="25" fill="url(#gold_grad)" />
  </g>

  <!-- Chão de Mármore com Perspetiva e Reflexos -->
  <path d="M 0,840 L 1920,840 L 1920,1080 L 0,1080 Z" fill="url(#marble_floor)" stroke="url(#gold_grad)" stroke-width="4" />
  <g stroke="rgba(245, 158, 11, 0.25)" stroke-width="2">
    <line x1="0" y1="840" x2="600" y2="1080" />
    <line x1="300" y1="840" x2="750" y2="1080" />
    <line x1="600" y1="840" x2="880" y2="1080" />
    <line x1="1920" y1="840" x2="1320" y2="1080" />
    <line x1="1620" y1="840" x2="1170" y2="1080" />
    <line x1="1320" y1="840" x2="1040" y2="1080" />
    <!-- Linhas Horizontais -->
    <line x1="0" y1="900" x2="1920" y2="900" />
    <line x1="0" y1="980" x2="1920" y2="980" />
  </g>

  <!-- Passadeira Real Rubina Central -->
  <polygon points="760,840 1160,840 1340,1080 580,1080" fill="url(#velvet_carpet)" stroke="url(#gold_grad)" stroke-width="5" />

  <!-- Estandartes Reais Suspensos -->
  <polygon points="230,220 290,220 290,520 260,490 230,520" fill="#dc2626" stroke="url(#gold_grad)" stroke-width="3" />
  <polygon points="1630,220 1690,220 1690,520 1660,490 1630,520" fill="#15803d" stroke="url(#gold_grad)" stroke-width="3" />
</svg>`

// 2. ESTÁDIO DAS LENDAS (Mítica)
const estadioDasLendasSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="stadium_sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="50%" stop-color="#042f2e" />
      <stop offset="100%" stop-color="#064e3b" />
    </linearGradient>
    <radialGradient id="floodlight_left" cx="0%" cy="0%" r="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.6" />
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="floodlight_right" cx="100%" cy="0%" r="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.6" />
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="pitch_green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#065f46" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#stadium_sky)" />
  <rect width="1920" height="1080" fill="url(#floodlight_left)" />
  <rect width="1920" height="1080" fill="url(#floodlight_right)" />

  <!-- Bancadas Monumentais em Curva com Pontos de Luz -->
  <g fill="#0f172a" stroke="#10b981" stroke-width="2" opacity="0.85">
    <path d="M 0,380 Q 960,260 1920,380 L 1920,680 Q 960,600 0,680 Z" />
    <path d="M 0,440 Q 960,320 1920,440" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <path d="M 0,500 Q 960,380 1920,500" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <path d="M 0,560 Q 960,440 1920,560" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <path d="M 0,620 Q 960,500 1920,620" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
  </g>

  <!-- Torres de Iluminação / Holofotes de Alta Potência -->
  <g fill="#334155" stroke="#38bdf8" stroke-width="3">
    <!-- Torre Esquerda -->
    <polygon points="120,60 220,60 180,360 160,360" />
    <circle cx="140" cy="70" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)" />
    <circle cx="170" cy="70" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)" />
    <circle cx="200" cy="70" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)" />

    <!-- Torre Direita -->
    <polygon points="1700,60 1800,60 1760,360 1740,360" />
    <circle cx="1720" cy="70" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)" />
    <circle cx="1750" cy="70" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)" />
    <circle cx="1780" cy="70" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)" />
  </g>

  <!-- Ecrã Gigante Holográfico Central com Troféu -->
  <g transform="translate(960, 260)">
    <rect x="-300" y="-140" width="600" height="240" rx="16" fill="#020617" stroke="#10b981" stroke-width="4" opacity="0.95" />
    <rect x="-290" y="-130" width="580" height="220" rx="12" fill="#042f2e" stroke="#06b6d4" stroke-width="2" />
    <text x="0" y="-70" fill="#facc15" font-family="monospace" font-weight="900" font-size="24" letter-spacing="6" text-anchor="middle">DESAFIO NACIONAL // GRANDE FINAL</text>
    <!-- Troféu Central Dourado -->
    <path d="M -40,-40 L 40,-40 L 30,20 Q 0,50 -30,20 Z" fill="#f59e0b" stroke="#fef08a" stroke-width="3" />
    <path d="M -40,-30 Q -65,-30 -45,-5 Q -30,10 -30,0" fill="none" stroke="#fef08a" stroke-width="3" />
    <path d="M 40,-30 Q 65,-30 45,-5 Q 30,10 30,0" fill="none" stroke="#fef08a" stroke-width="3" />
    <rect x="-15" y="45" width="30" height="20" fill="#b45309" />
    <rect x="-30" y="65" width="60" height="15" fill="#f59e0b" />
  </g>

  <!-- Relvado Cyber com Marcações Geométricas de Luz -->
  <polygon points="0,680 1920,680 1920,1080 0,1080" fill="url(#pitch_green)" stroke="#10b981" stroke-width="4" />
  <!-- Grande Área & Círculo Central de Laser -->
  <g stroke="#34d399" stroke-width="4" fill="none" opacity="0.8">
    <ellipse cx="960" cy="880" rx="360" ry="120" />
    <circle cx="960" cy="880" r="16" fill="#34d399" />
    <line x1="0" y1="880" x2="1920" y2="880" stroke-dasharray="16 8" />
  </g>
</svg>`

// 3. PORTUGAL 3D DIGITAL TWIN (Mítica)
const portugal3dSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="cyber_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="60%" stop-color="#082f49" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <radialGradient id="core_glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#cyber_bg)" />
  <rect width="1920" height="1080" fill="url(#core_glow)" />

  <!-- Grelha de Radar Isométrico Hexagonal -->
  <g stroke="rgba(6, 182, 212, 0.2)" stroke-width="1.5" fill="none">
    <ellipse cx="960" cy="580" rx="750" ry="340" />
    <ellipse cx="960" cy="580" rx="550" ry="250" />
    <ellipse cx="960" cy="580" rx="350" ry="160" />
    <line x1="210" y1="580" x2="1710" y2="580" />
    <line x1="960" y1="240" x2="960" y2="920" />
    <line x1="430" y1="340" x2="1490" y2="820" />
    <line x1="430" y1="820" x2="1490" y2="340" />
  </g>

  <!-- Silhueta Tridimensional de Portugal Continental em Neon Ciano -->
  <g fill="#0e7490" stroke="#22d3ee" stroke-width="5" filter="drop-shadow(0 0 25px rgba(6,182,212,0.8))">
    <polygon points="
      920,280 970,290 1020,330 1010,420 1040,480 1000,560 970,620 980,720
      950,780 890,790 850,780 840,700 860,620 840,540 850,440 890,340 920,280
    " />
  </g>

  <!-- Açores (3 Grupos de Ilhas Holográficas) -->
  <g fill="#14b8a6" stroke="#5eead4" stroke-width="3" filter="drop-shadow(0 0 15px #14b8a6)">
    <!-- Grupo Ocidental -->
    <circle cx="500" cy="460" r="14" />
    <circle cx="525" cy="480" r="10" />
    <!-- Grupo Central -->
    <circle cx="580" cy="500" r="16" />
    <circle cx="610" cy="520" r="14" />
    <circle cx="630" cy="490" r="12" />
    <!-- Grupo Oriental -->
    <circle cx="690" cy="540" r="18" />
    <circle cx="720" cy="565" r="12" />
  </g>

  <!-- Madeira & Porto Santo -->
  <g fill="#06b6d4" stroke="#67e8f9" stroke-width="3" filter="drop-shadow(0 0 15px #06b6d4)">
    <ellipse cx="640" cy="740" rx="28" ry="15" />
    <circle cx="680" cy="715" r="12" />
  </g>

  <!-- 20 Nós Territoriais Conectados por Feixes de Dados -->
  <g fill="#ffffff" stroke="#38bdf8" stroke-width="2">
    <circle cx="940" cy="340" r="8" /><!-- Braga -->
    <circle cx="900" cy="380" r="10" /><!-- Porto -->
    <circle cx="870" cy="520" r="9" /><!-- Coimbra -->
    <circle cx="850" cy="640" r="14" /><!-- Lisboa -->
    <circle cx="880" cy="710" r="9" /><!-- Setúbal -->
    <circle cx="910" cy="780" r="10" /><!-- Faro -->
  </g>

  <!-- Varredura Holográfica de Radar 2150 -->
  <g opacity="0.6">
    <line x1="960" y1="580" x2="1600" y2="400" stroke="#38bdf8" stroke-width="4" filter="drop-shadow(0 0 12px #38bdf8)" />
    <path d="M 960,580 L 1600,400 A 700,700 0 0,0 1450,280 Z" fill="rgba(56, 189, 248, 0.15)" />
  </g>
</svg>`

// 4. TRONO REAL (Lendária)
const tronoRealSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="throne_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="50%" stop-color="#450a0a" />
      <stop offset="100%" stop-color="#0c0a09" />
    </linearGradient>
    <radialGradient id="torch_glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
      <stop offset="40%" stop-color="#ef4444" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="gold_throne" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="50%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#throne_bg)" />

  <!-- Tochas Murais com Luz Viva -->
  <circle cx="280" cy="380" r="180" fill="url(#torch_glow)" />
  <circle cx="1640" cy="380" r="180" fill="url(#torch_glow)" />
  <!-- Suportes de Ferro das Tochas -->
  <g fill="#292524" stroke="#78716c" stroke-width="4">
    <rect x="270" y="380" width="20" height="140" />
    <polygon points="260,370 300,370 290,410 270,410" fill="#f59e0b" />
    <rect x="1630" y="380" width="20" height="140" />
    <polygon points="1620,370 1660,370 1650,410 1630,410" fill="#f59e0b" />
  </g>

  <!-- Trono Monumental Central -->
  <g transform="translate(960, 520)">
    <!-- Espaldar Alto do Trono com Brasão -->
    <path d="M -180,180 L -180,-240 Q 0,-340 180,-240 L 180,180 Z" fill="#1c1917" stroke="url(#gold_throne)" stroke-width="8" />
    <circle cx="0" cy="-180" r="55" fill="#dc2626" stroke="url(#gold_throne)" stroke-width="5" />
    <!-- Esfera Armilar Dourada no Espaldar -->
    <circle cx="0" cy="-180" r="35" fill="none" stroke="url(#gold_throne)" stroke-width="4" />
    <ellipse cx="0" cy="-180" rx="35" ry="12" fill="none" stroke="url(#gold_throne)" stroke-width="3" />

    <!-- Assento e Braços do Trono -->
    <rect x="-190" y="160" width="380" height="60" rx="12" fill="#7f1d1d" stroke="url(#gold_throne)" stroke-width="6" />
    <rect x="-220" y="80" width="50" height="120" rx="8" fill="url(#gold_throne)" />
    <rect x="170" y="80" width="50" height="120" rx="8" fill="url(#gold_throne)" />

    <!-- Degraus do Estrado Real -->
    <polygon points="-320,240 320,240 380,320 -380,320" fill="#292524" stroke="url(#gold_throne)" stroke-width="5" />
    <polygon points="-420,320 420,320 500,420 -500,420" fill="#1c1917" stroke="url(#gold_throne)" stroke-width="5" />
  </g>
</svg>`

// 5. CASTELO DOS CAMPEÕES (Épica)
const casteloDosCampeoesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="castle_sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090514" />
      <stop offset="50%" stop-color="#2e1065" />
      <stop offset="100%" stop-color="#172554" />
    </linearGradient>
    <linearGradient id="stone_grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="50%" stop-color="#475569" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#castle_sky)" />

  <!-- Montanhas da Beira Baixa ao Fundo -->
  <polygon points="0,580 480,340 960,540 1440,310 1920,560 1920,1080 0,1080" fill="#0f172a" opacity="0.9" />

  <!-- Muralhas e Ameias Medievais de Granito -->
  <g fill="url(#stone_grad)" stroke="#94a3b8" stroke-width="4">
    <!-- Muralha Esquerda -->
    <polygon points="80,480 540,480 540,880 80,880" />
    <!-- Ameias Esquerda -->
    <rect x="80" y="440" width="60" height="40" />
    <rect x="180" y="440" width="60" height="40" />
    <rect x="280" y="440" width="60" height="40" />
    <rect x="380" y="440" width="60" height="40" />
    <rect x="480" y="440" width="60" height="40" />

    <!-- Torre de Menagem Central Imponente -->
    <polygon points="720,260 1200,260 1220,880 700,880" />
    <rect x="720" y="220" width="70" height="40" />
    <rect x="830" y="220" width="70" height="40" />
    <rect x="940" y="220" width="70" height="40" />
    <rect x="1050" y="220" width="70" height="40" />
    <rect x="1150" y="220" width="70" height="40" />

    <!-- Muralha Direita -->
    <polygon points="1380,480 1840,480 1840,880 1380,880" />
    <rect x="1380" y="440" width="60" height="40" />
    <rect x="1480" y="440" width="60" height="40" />
    <rect x="1580" y="440" width="60" height="40" />
    <rect x="1680" y="440" width="60" height="40" />
    <rect x="1780" y="440" width="60" height="40" />
  </g>

  <!-- Tochas e Bandeiras Heráldicas -->
  <polygon points="940,120 980,120 980,220 960,200 940,220" fill="#dc2626" stroke="#facc15" stroke-width="3" />
</svg>`

// 6. CÉU LUSITANO (Épica)
const ceuLusitanoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="aurora_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="40%" stop-color="#042f2e" />
      <stop offset="80%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="aurora_wave" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0" />
      <stop offset="30%" stop-color="#14b8a6" stop-opacity="0.6" />
      <stop offset="60%" stop-color="#ec4899" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#aurora_bg)" />

  <!-- Ondas de Aurora Boreal Verde-Rubi -->
  <path d="M 0,340 Q 480,140 960,280 T 1920,220 L 1920,540 Q 1440,680 960,480 T 0,560 Z" fill="url(#aurora_wave)" />
  <path d="M 0,220 Q 560,420 1120,240 T 1920,380 L 1920,620 Q 1360,440 800,580 T 0,440 Z" fill="url(#aurora_wave)" opacity="0.6" />

  <!-- Constelações e Esfera Armilar Celeste -->
  <g stroke="#fef08a" stroke-width="2" fill="none">
    <circle cx="960" cy="460" r="220" stroke-width="3" stroke="#38bdf8" />
    <ellipse cx="960" cy="460" rx="220" ry="80" stroke="#facc15" />
    <ellipse cx="960" cy="460" rx="80" ry="220" stroke="#ec4899" />
  </g>
</svg>`

// 7. TRONO SUPREMO DO CAMPEÃO (Mítica — Ultra VIP)
const tronoSupremoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="supreme_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="40%" stop-color="#1c1917" />
      <stop offset="80%" stop-color="#450a0a" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <linearGradient id="ultra_gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="25%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="75%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#supreme_bg)" />

  <!-- Colunas de Fogo e Pilares Volumétricos de Ouro -->
  <g stroke="url(#ultra_gold)" stroke-width="6" fill="#18181b">
    <polygon points="180,180 320,180 280,880 140,880" />
    <polygon points="1600,180 1740,180 1780,880 1640,880" />
  </g>

  <!-- Trono Colossal de Mestre Supremo -->
  <g transform="translate(960, 480)">
    <!-- Auréola Gigante Imperial -->
    <circle cx="0" cy="-220" r="160" fill="none" stroke="url(#ultra_gold)" stroke-width="8" filter="drop-shadow(0 0 35px #f59e0b)" />
    <!-- Trono de Platina e Ouro -->
    <path d="M -220,240 L -220,-280 L 0,-380 L 220,-280 L 220,240 Z" fill="#09090b" stroke="url(#ultra_gold)" stroke-width="10" />
    <!-- Grande Brasão com Rubis -->
    <circle cx="0" cy="-160" r="70" fill="#dc2626" stroke="url(#ultra_gold)" stroke-width="6" />
    <polygon points="0,-210 20,-170 65,-170 30,-140 45,-95 0,-125 -45,-95 -30,-140 -65,-170 -20,-170" fill="url(#ultra_gold)" />
  </g>
</svg>`

// 8. PORTUGAL CELESTIAL (Mítica — Ultra VIP)
const portugalCelestialSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="space_bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#090514" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="nebula_glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#a855f7" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0.8" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#space_bg)" />

  <!-- Nebulosa Espiral Cósmica -->
  <path d="M 340,680 Q 960,180 1580,680 Q 960,1020 340,680 Z" fill="url(#nebula_glow)" opacity="0.45" filter="blur(40px)" />

  <!-- Portugal 3D Cósmico no Espaço -->
  <g transform="translate(960, 520) scale(1.2)" fill="#1e1b4b" stroke="#38bdf8" stroke-width="5" filter="drop-shadow(0 0 35px #06b6d4)">
    <polygon points="
      -40,-200 10,-190 60,-150 50,-60 80,0 40,80 10,140 20,240
      -10,300 -70,310 -110,300 -120,220 -100,140 -120,60 -110,-40 -70,-140 -40,-200
    " />
  </g>
</svg>`

// 9. COLISEU DOS CAMPEÕES (Lendária)
const coliseuDosCampeoesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="coliseum_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="50%" stop-color="#27272a" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#coliseum_bg)" />

  <!-- Arcadas Romanas do Coliseu -->
  <g stroke="#f59e0b" stroke-width="4" fill="#18181b">
    <path d="M 120,780 L 120,420 Q 240,280 360,420 L 360,780 Z" />
    <path d="M 420,780 L 420,420 Q 540,280 660,420 L 660,780 Z" />
    <path d="M 720,780 L 720,420 Q 840,280 960,420 L 960,780 Z" />
    <path d="M 1020,780 L 1020,420 Q 1140,280 1260,420 L 1260,780 Z" />
    <path d="M 1320,780 L 1320,420 Q 1440,280 1560,420 L 1560,780 Z" />
    <path d="M 1620,780 L 1620,420 Q 1740,280 1860,420 L 1860,780 Z" />
  </g>
</svg>`

// 10. PALÁCIO DOS REIS (Lendária)
const palacioDosReisSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="reis_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#reis_bg)" />

  <!-- Arcada Manuelina com Nós e Vitrais -->
  <g stroke="#38bdf8" stroke-width="5" fill="#0f172a" opacity="0.9">
    <path d="M 280,880 L 280,380 Q 960,80 1640,380 L 1640,880 Z" />
  </g>
</svg>`

// 11. CIDADELA ETERNA (Épica / Lendária)
const cidadelaEternaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="cidadela_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#cidadela_bg)" />

  <!-- Picos Rochosos da Serra da Estrela e Fortaleza -->
  <polygon points="0,520 540,240 1020,480 1560,220 1920,460 1920,1080 0,1080" fill="#1e1b4b" stroke="#818cf8" stroke-width="4" />
</svg>`

// Gravar ficheiros
fs.writeFileSync(path.join(VIP_DIR, 'palacio-nacional.svg'), palacioNacionalSvg, 'utf8')
fs.writeFileSync(path.join(VIP_DIR, 'estadio-lendas.svg'), estadioDasLendasSvg, 'utf8')
fs.writeFileSync(path.join(VIP_DIR, 'portugal-3d.svg'), portugal3dSvg, 'utf8')
fs.writeFileSync(path.join(VIP_DIR, 'trono-real.svg'), tronoRealSvg, 'utf8')
fs.writeFileSync(path.join(VIP_DIR, 'castelo-campeoes.svg'), casteloDosCampeoesSvg, 'utf8')
fs.writeFileSync(path.join(VIP_DIR, 'ceu-lusitano.svg'), ceuLusitanoSvg, 'utf8')

fs.writeFileSync(path.join(ULTIMATE_DIR, 'trono-supremo-campeao.svg'), tronoSupremoSvg, 'utf8')
fs.writeFileSync(path.join(ULTIMATE_DIR, 'portugal-celestial.svg'), portugalCelestialSvg, 'utf8')
fs.writeFileSync(path.join(ULTIMATE_DIR, 'coliseu-campeoes.svg'), coliseuDosCampeoesSvg, 'utf8')
fs.writeFileSync(path.join(ULTIMATE_DIR, 'palacio-reis.svg'), palacioDosReisSvg, 'utf8')
fs.writeFileSync(path.join(ULTIMATE_DIR, 'cidadela-eterna.svg'), cidadelaEternaSvg, 'utf8')

console.log('✅ TODAS AS 11 ARENAS SUPREMAS GERADAS COM SUCESSO EM ALTA DEFINIÇÃO!')
