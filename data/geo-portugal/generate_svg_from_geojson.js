const fs = require('fs');
const path = require('path');
const d3 = require('d3-geo');

const INPUT = path.join(__dirname, 'geo-portugal', 'portugal-districts.geojson');
const OUTPUT = path.join(__dirname, '..', '..', 'public', 'images', 'portugal-districts.svg');

if (!fs.existsSync(INPUT)) {
  console.error('Input GeoJSON not found:', INPUT);
  process.exit(1);
}

const geojson = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// target svg size
const WIDTH = 1400;
const HEIGHT = 900;

const projection = d3.geoMercator();
const pathGen = d3.geoPath().projection(projection);

// Fit projection to all features
projection.fitSize([WIDTH, HEIGHT], geojson);

// We'll create paths for each feature. Identify feature property for district name
// The CSV parser wrote properties: { Distrito: 'LEIRIA', Dicofre: '10' }

// mapping function to generate stable slug from Distrito value
function slugFromDistrito(name) {
  // normalize to lower, replace spaces and accents
  return name.toLowerCase()
    .normalize('NFKD').replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}

// create folder for output if missing
const outDir = path.dirname(OUTPUT);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const parts = [];

// We'll collect projected centroids to allow drawing connector lines for insets
const featureData = geojson.features.map((feat) => {
  const distrito = feat.properties && (feat.properties.Distrito || feat.properties.DISTRICT || feat.properties.DistritoName || feat.properties.name) || 'unknown';
  const slug = slugFromDistrito(String(distrito));
  const id = `district-${slug}`;
  const d = pathGen(feat);
  const centroid = d ? projection(d3.geoCentroid ? d3.geoCentroid(feat) : d3.geoCentroid(feat)) : null;
  return { id, slug, distrito, d, feat, centroid };
});

// Determine which are acores and madeira by slug matching
const acoresKey = featureData.find(f => f.slug.includes('acores') || f.slug.includes('acores'));
const madeiraKey = featureData.find(f => f.slug.includes('madeira'));

// We will render main map with all features, then create two inset groups for acores and madeira
// Decide inset sizes and positions
const INSET_SIZE = 220; // square size for each inset
const PADDING = 24;
const insetAcoresPos = { x: WIDTH - INSET_SIZE - PADDING, y: HEIGHT - 2 * (INSET_SIZE + PADDING) };
const insetMadeiraPos = { x: WIDTH - INSET_SIZE - PADDING, y: HEIGHT - (INSET_SIZE + PADDING) };

// Helper to scale a feature path into inset box preserving aspect ratio
function computeInsetTransform(feature) {
  if (!feature || !feature.feat) return null;
  const bboxPath = pathGen.bounds(feature.feat); // [[minX,minY],[maxX,maxY]] in pixel space
  const minX = bboxPath[0][0], minY = bboxPath[0][1], maxX = bboxPath[1][0], maxY = bboxPath[1][1];
  const w = maxX - minX, h = maxY - minY;
  if (w <= 0 || h <= 0) return null;
  const scale = (INSET_SIZE - 20) / Math.max(w, h);
  // we will translate so that the feature bbox top-left goes to (insetX + (INSET_SIZE - w*scale)/2, same for y)
  return { minX, minY, scale, w, h };
}

const acoresTransform = computeInsetTransform(acoresKey);
const madeiraTransform = computeInsetTransform(madeiraKey);

// Build SVG content
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" aria-hidden="false" role="img">`);
parts.push('<defs>');
parts.push('<style><![CDATA[');
parts.push(`.district { fill: rgba(10,14,12,0.6); stroke: rgba(30,255,120,0.07); stroke-width: 0.8; transition: fill 220ms ease, filter 240ms ease, transform 240ms ease; cursor: pointer; }`);
parts.push(`.district:hover { filter: drop-shadow(0 0 8px rgba(40,255,150,0.12)); }`);
parts.push(`.district.selected { fill: rgba(20,255,120,0.12); filter: drop-shadow(0 0 20px rgba(40,255,150,0.22)); }`);
parts.push(`.inset-frame { fill: rgba(0,0,0,0.35); stroke: rgba(255,255,255,0.04); }`);
parts.push(']]></style>');
parts.push('</defs>');

// background
parts.push(`<rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="#061014"/>`);

// Main group for all districts
parts.push('<g id="map-main">');
for (const f of featureData) {
  // Skip acores and madeira drawing here if we will render them as insets as well
  const isAcores = f.slug.includes('acores');
  const isMadeira = f.slug.includes('madeira');
  // We'll still render the real geometry at original position but set a small class for visibility
  const cls = `district" data-slug="${f.slug}`;
  const safeD = f.d ? f.d : '';
  parts.push(`<path id="${f.id}" class="district" data-slug="${f.slug}" data-name="${f.distrito}" d="${safeD}" tabindex="0" role="button" aria-label="Distrito ${f.distrito}" aria-pressed="false"/>`);
}
parts.push('</g>');

// Insets for Açores and Madeira (rendered scaled)
function addInset(feature, pos, label) {
  if (!feature || !feature.d) return;
  const t = computeInsetTransform(feature);
  if (!t) return;
  const translateX = pos.x + (INSET_SIZE - t.w * t.scale) / 2 - t.minX * t.scale;
  const translateY = pos.y + (INSET_SIZE - t.h * t.scale) / 2 - t.minY * t.scale;
  // frame
  parts.push(`<g class="inset" transform="translate(0,0)">`);
  parts.push(`<rect x="${pos.x}" y="${pos.y}" width="${INSET_SIZE}" height="${INSET_SIZE}" class="inset-frame" rx="8" ry="8"/>`);
  parts.push(`<g transform="translate(${translateX} ${translateY}) scale(${t.scale})">`);
  // render the feature's geometry inside scaled group
  // use same path d but we need to regenerate path in pixel coords and then scale back - but simpler: use original feature projected coords path and apply scale/translate
  parts.push(`<path id="${feature.id}-inset" class="district" data-slug="${feature.slug}" data-name="${feature.distrito}" d="${feature.d}" tabindex="0" role="button" aria-label="Distrito ${feature.distrito}" aria-pressed="false"/>`);
  parts.push('</g>');
  // label
  parts.push(`<text x="${pos.x + 12}" y="${pos.y + 18}" fill="#7ef7b0" font-size="12" font-family="Inter, Arial, sans-serif">${label}</text>`);
  parts.push('</g>');
  // connector: line from centroid (projected) to inset center
  if (feature.centroid) {
    const cx = feature.centroid[0];
    const cy = feature.centroid[1];
    const ix = pos.x + INSET_SIZE / 2;
    const iy = pos.y + INSET_SIZE / 2;
    parts.push(`<line x1="${cx}" y1="${cy}" x2="${ix}" y2="${iy}" stroke="rgba(126,247,176,0.08)" stroke-width="1" stroke-dasharray="3 3"/>`);
  }
}

addInset(acoresKey, insetAcoresPos, 'AÇORES');
addInset(madeiraKey, insetMadeiraPos, 'MADEIRA');

parts.push('</svg>');

const svg = parts.join('\n');
fs.writeFileSync(OUTPUT, svg, 'utf8');
console.log('Wrote SVG to', OUTPUT);
console.log('Feature count:', featureData.length);
