const fs = require('fs');
const sharp = require('sharp');

const svg = `
<svg width='512' height='512' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <!-- Background Studio Gradient -->
    <radialGradient id='bgGrad' cx='50%' cy='42%' r='65%'>
      <stop offset='0%' stop-color='#1a2436'/>
      <stop offset='60%' stop-color='#0b111e'/>
      <stop offset='100%' stop-color='#030712'/>
    </radialGradient>

    <!-- Neon Rim Glow -->
    <linearGradient id='rimGlow' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#06b6d4' stop-opacity='0.8'/>
      <stop offset='50%' stop-color='#8b5cf6' stop-opacity='0.4'/>
      <stop offset='100%' stop-color='#ec4899' stop-opacity='0.7'/>
    </linearGradient>

    <!-- Skin 3D Lighting -->
    <linearGradient id='skinGrad' x1='35%' y1='15%' x2='75%' y2='85%'>
      <stop offset='0%' stop-color='#fed7aa'/>
      <stop offset='40%' stop-color='#fba874'/>
      <stop offset='100%' stop-color='#c25e2e'/>
    </linearGradient>
    <linearGradient id='skinShadow' x1='0%' y1='0%' x2='0%' y2='100%'>
      <stop offset='0%' stop-color='#9a3412' stop-opacity='0.4'/>
      <stop offset='100%' stop-color='#7c2d12' stop-opacity='0.8'/>
    </linearGradient>

    <!-- Hair 3D Gradient -->
    <linearGradient id='hairGrad' x1='20%' y1='0%' x2='80%' y2='100%'>
      <stop offset='0%' stop-color='#38bdf8'/>
      <stop offset='35%' stop-color='#0284c7'/>
      <stop offset='80%' stop-color='#0f172a'/>
      <stop offset='100%' stop-color='#030712'/>
    </linearGradient>
    <linearGradient id='hairHighlight' x1='0%' y1='0%' x2='100%' y2='50%'>
      <stop offset='0%' stop-color='#bae6fd' stop-opacity='0.8'/>
      <stop offset='100%' stop-color='#38bdf8' stop-opacity='0'/>
    </linearGradient>

    <!-- Jacket / Clothes -->
    <linearGradient id='jacketGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#312e81'/>
      <stop offset='50%' stop-color='#1e1b4b'/>
      <stop offset='100%' stop-color='#0f172a'/>
    </linearGradient>

    <!-- Headset Metal & LEDs -->
    <linearGradient id='headsetMetal' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#64748b'/>
      <stop offset='50%' stop-color='#334155'/>
      <stop offset='100%' stop-color='#0f172a'/>
    </linearGradient>
    <radialGradient id='ledGlow' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='#38bdf8'/>
      <stop offset='60%' stop-color='#06b6d4'/>
      <stop offset='100%' stop-color='#0e7490'/>
    </radialGradient>

    <!-- Filter Shadow -->
    <filter id='dropShadow' x='-20%' y='-20%' width='140%' height='140%'>
      <feDropShadow dx='0' dy='8' stdDeviation='12' flood-color='#000000' flood-opacity='0.5'/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width='512' height='512' fill='url(#bgGrad)'/>
  <!-- Subtle Ambient Circle -->
  <circle cx='256' cy='220' r='180' fill='#06b6d4' opacity='0.08'/>

  <!-- Torso / Jacket (Bust) -->
  <g filter='url(#dropShadow)'>
    <!-- Shoulders & Upper Body -->
    <path d='M 120 512 C 120 395 180 345 256 345 C 332 345 392 395 392 512 Z' fill='url(#jacketGrad)'/>
    <!-- Collar & Zip Accent -->
    <path d='M 215 348 L 256 425 L 297 348 Z' fill='#0284c7' opacity='0.9'/>
    <path d='M 235 348 L 256 395 L 277 348 Z' fill='#0f172a'/>
    <!-- Jacket Neon Seams -->
    <path d='M 155 512 C 160 430 200 375 230 358' fill='none' stroke='#38bdf8' stroke-width='3' opacity='0.7'/>
    <path d='M 357 512 C 352 430 312 375 282 358' fill='none' stroke='#ec4899' stroke-width='3' opacity='0.7'/>
  </g>

  <!-- Neck -->
  <path d='M 226 270 L 226 360 C 236 368 276 368 286 360 L 286 270 Z' fill='url(#skinGrad)'/>
  <path d='M 226 270 C 242 290 270 290 286 270 L 286 310 C 270 318 242 318 226 310 Z' fill='url(#skinShadow)' opacity='0.5'/>

  <!-- Head Base -->
  <g filter='url(#dropShadow)'>
    <!-- Face / Jaw Silhouette -->
    <path d='M 176 195 C 176 130 336 130 336 195 C 336 265 296 305 256 308 C 216 305 176 265 176 195 Z' fill='url(#skinGrad)'/>

    <!-- Stylized Eyes -->
    <!-- Left Eye -->
    <path d='M 200 205 Q 218 198 232 208 Q 218 214 200 205 Z' fill='#0f172a'/>
    <circle cx='218' cy='206' r='6' fill='#0284c7'/>
    <circle cx='218' cy='206' r='3.5' fill='#030712'/>
    <circle cx='216' cy='204' r='2' fill='#ffffff'/>
    <path d='M 198 202 Q 216 194 234 204' fill='none' stroke='#0f172a' stroke-width='3.5' stroke-linecap='round'/>
    <!-- Left Eyebrow -->
    <path d='M 195 188 Q 215 180 234 186' fill='none' stroke='#0369a1' stroke-width='4' stroke-linecap='round'/>

    <!-- Right Eye -->
    <path d='M 280 208 Q 294 198 312 205 Q 294 214 280 208 Z' fill='#0f172a'/>
    <circle cx='294' cy='206' r='6' fill='#0284c7'/>
    <circle cx='294' cy='206' r='3.5' fill='#030712'/>
    <circle cx='292' cy='204' r='2' fill='#ffffff'/>
    <path d='M 278 204 Q 296 194 314 202' fill='none' stroke='#0f172a' stroke-width='3.5' stroke-linecap='round'/>
    <!-- Right Eyebrow -->
    <path d='M 278 186 Q 297 180 317 188' fill='none' stroke='#0369a1' stroke-width='4' stroke-linecap='round'/>

    <!-- Nose -->
    <path d='M 252 206 Q 256 235 250 240 Q 256 244 262 240' fill='none' stroke='#c25e2e' stroke-width='3' stroke-linecap='round'/>

    <!-- Mouth / Confident Gamer Smirk -->
    <path d='M 238 266 Q 256 278 274 266' fill='none' stroke='#991b1b' stroke-width='4' stroke-linecap='round'/>
    <path d='M 242 268 Q 256 276 270 268' fill='#ffffff' opacity='0.85'/>
  </g>

  <!-- Hair (Modern Asymmetrical Bob / Neon Highlights) -->
  <g filter='url(#dropShadow)'>
    <!-- Back Hair Volume -->
    <path d='M 160 190 C 150 120 220 80 256 80 C 292 80 362 120 352 190 C 355 240 340 280 330 300 C 345 230 340 160 310 130 C 280 100 230 100 202 130 C 172 160 167 230 182 300 C 172 280 157 240 160 190 Z' fill='url(#hairGrad)'/>
    <!-- Front Bangs & Layers -->
    <path d='M 175 145 C 200 100 300 95 335 140 C 315 130 280 135 250 155 C 225 172 200 178 175 145 Z' fill='url(#hairGrad)'/>
    <!-- Neon Highlights -->
    <path d='M 185 140 Q 230 105 285 125' fill='none' stroke='url(#hairHighlight)' stroke-width='6' stroke-linecap='round'/>
    <path d='M 180 180 C 170 230 175 270 190 295 C 182 265 180 220 186 175 Z' fill='#38bdf8' opacity='0.85'/>
    <path d='M 332 180 C 342 230 337 270 322 295 C 330 265 332 220 326 175 Z' fill='#818cf8' opacity='0.85'/>
  </g>

  <!-- Cyber Gaming Headset -->
  <g filter='url(#dropShadow)'>
    <!-- Headband Arch -->
    <path d='M 148 185 C 145 90 367 90 364 185' fill='none' stroke='url(#headsetMetal)' stroke-width='16' stroke-linecap='round'/>
    <path d='M 152 175 C 150 98 362 98 360 175' fill='none' stroke='#0284c7' stroke-width='3' stroke-linecap='round'/>

    <!-- Left Ear Cup -->
    <rect x='132' y='170' width='32' height='60' rx='16' fill='url(#headsetMetal)' stroke='#0f172a' stroke-width='3'/>
    <circle cx='148' cy='200' r='12' fill='url(#ledGlow)'/>
    <circle cx='148' cy='200' r='14' fill='none' stroke='#38bdf8' stroke-width='2'/>

    <!-- Right Ear Cup -->
    <rect x='348' y='170' width='32' height='60' rx='16' fill='url(#headsetMetal)' stroke='#0f172a' stroke-width='3'/>
    <circle cx='364' cy='200' r='12' fill='url(#ledGlow)'/>
    <circle cx='364' cy='200' r='14' fill='none' stroke='#38bdf8' stroke-width='2'/>

    <!-- Microphone Boom with LED Tip -->
    <path d='M 148 220 Q 155 270 205 275' fill='none' stroke='url(#headsetMetal)' stroke-width='6' stroke-linecap='round'/>
    <circle cx='208' cy='275' r='5' fill='#06b6d4'/>
    <circle cx='208' cy='275' r='2' fill='#ffffff'/>
  </g>

  <!-- Outer Circular Framing Ring (Soft HUD Accent) -->
  <circle cx='256' cy='256' r='252' fill='none' stroke='url(#rimGlow)' stroke-width='4' opacity='0.6'/>
</svg>
`;

sharp(Buffer.from(svg))
  .png({ quality: 95 })
  .toFile('avatar_06_test.png')
  .then(info => console.log('Successfully generated avatar_06_test.png:', info))
  .catch(err => console.error('Error rendering:', err));