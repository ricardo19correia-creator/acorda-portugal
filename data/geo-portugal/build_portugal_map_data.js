const fs = require('fs');
const path = require('path');
const d3 = require('d3-geo');

const INPUT = path.join(__dirname, 'geo-portugal', 'portugal-districts.geojson');
const geojson = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// Canonical names mapping
const DISTRICT_NAMES = {
  'LEIRIA': 'Leiria',
  'AVEIRO': 'Aveiro',
  'LISBOA': 'Lisboa',
  'BRAGA': 'Braga',
  'CASTELO BRANCO': 'Castelo Branco',
  'ÉVORA': 'Évora',
  'VIANA DO CASTELO': 'Viana do Castelo',
  'VISEU': 'Viseu',
  'SANTARÉM': 'Santarém',
  'PORTO': 'Porto',
  'BEJA': 'Beja',
  'PORTALEGRE': 'Portalegre',
  'GUARDA': 'Guarda',
  'COIMBRA': 'Coimbra',
  'FARO': 'Faro',
  'BRAGANÇA': 'Bragança',
  'VILA REAL': 'Vila Real',
  'SETÚBAL': 'Setúbal',
  'Região Autónoma da Madeira': 'Madeira',
  'Região Autónoma dos Açores': 'Açores',
};

// Split mainland vs islands
const mainlandFeatures = geojson.features.filter(f => {
  const d = f.properties.Distrito;
  return d !== 'Região Autónoma da Madeira' && d !== 'Região Autónoma dos Açores';
});

const madeiraFeature = geojson.features.find(f => f.properties.Distrito === 'Região Autónoma da Madeira');
const acoresFeature = geojson.features.find(f => f.properties.Distrito === 'Região Autónoma dos Açores');

// ViewBox dimensions: 720 x 820
// Mainland projection on the right: x: 230 to 690, y: 30 to 790
const mainlandGeojson = {
  type: 'FeatureCollection',
  features: mainlandFeatures,
};

const mainlandProjection = d3.geoMercator();
mainlandProjection.fitExtent([[240, 30], [680, 790]], mainlandGeojson);

// Açores projection: in top-left inset (x: 25 to 225, y: 50 to 250)
const acoresProjection = d3.geoMercator();
acoresProjection.fitExtent([[25, 50], [225, 250]], acoresFeature);

// Madeira projection: in bottom-left inset (x: 35 to 215, y: 550 to 750)
const madeiraProjection = d3.geoMercator();
madeiraProjection.fitExtent([[35, 550], [215, 750]], madeiraFeature);

// Douglas-Peucker point simplification algorithm
function sqrDist(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function sqrDistToSegment(p, p1, p2) {
  let l2 = sqrDist(p1, p2);
  if (l2 === 0) return sqrDist(p, p1);
  let t = ((p[0] - p1[0]) * (p2[0] - p1[0]) + (p[1] - p1[1]) * (p2[1] - p1[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return sqrDist(p, [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]);
}

function simplifyPoints(points, tolerance = 1.2) {
  if (points.length <= 3) return points;
  const sqTolerance = tolerance * tolerance;

  function simplifyDP(pts) {
    let maxSqDist = 0;
    let index = 0;
    const end = pts.length - 1;

    for (let i = 1; i < end; i++) {
      const d = sqrDistToSegment(pts[i], pts[0], pts[end]);
      if (d > maxSqDist) {
        maxSqDist = d;
        index = i;
      }
    }

    if (maxSqDist > sqTolerance) {
      const left = simplifyDP(pts.slice(0, index + 1));
      const right = simplifyDP(pts.slice(index));
      return left.slice(0, left.length - 1).concat(right);
    } else {
      return [pts[0], pts[end]];
    }
  }

  return simplifyDP(points);
}

// Convert GeoJSON geometry coordinates to SVG path using custom projection & simplification
function geometryToSvgPath(geom, projection, tolerance = 0.8) {
  function ringToPath(ring) {
    // Project all points
    const projected = ring.map(coord => projection(coord)).filter(Boolean);
    const simplified = simplifyPoints(projected, tolerance);
    if (simplified.length < 3) return '';
    return 'M' + simplified.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
  }

  if (geom.type === 'Polygon') {
    return geom.coordinates.map(ring => ringToPath(ring)).filter(Boolean).join(' ');
  } else if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map(polygon => {
      return polygon.map(ring => ringToPath(ring)).filter(Boolean).join(' ');
    }).filter(Boolean).join(' ');
  }
  return '';
}

// Generate map data
const outputData = [];

// 18 Mainland districts
for (const feat of mainlandFeatures) {
  const rawName = feat.properties.Distrito;
  const name = DISTRICT_NAMES[rawName] || rawName;
  const pathD = geometryToSvgPath(feat.geometry, mainlandProjection, 0.9);
  const centroid = d3.geoPath().projection(mainlandProjection).centroid(feat).map(n => Number(n.toFixed(1)));

  outputData.push({
    name,
    type: 'mainland',
    path: pathD,
    centroid,
  });
}

// Açores
if (acoresFeature) {
  const pathD = geometryToSvgPath(acoresFeature.geometry, acoresProjection, 0.4);
  const centroid = d3.geoPath().projection(acoresProjection).centroid(acoresFeature).map(n => Number(n.toFixed(1)));
  outputData.push({
    name: 'Açores',
    type: 'island',
    path: pathD,
    centroid,
  });
}

// Madeira
if (madeiraFeature) {
  const pathD = geometryToSvgPath(madeiraFeature.geometry, madeiraProjection, 0.4);
  const centroid = d3.geoPath().projection(madeiraProjection).centroid(madeiraFeature).map(n => Number(n.toFixed(1)));
  outputData.push({
    name: 'Madeira',
    type: 'island',
    path: pathD,
    centroid,
  });
}

const targetJsFile = path.join(__dirname, '..', '..', 'lib', 'portugal-geo-data.ts');
const tsContent = `// Auto-generated crisp vector map data for Portugal (18 Mainland Districts + Açores + Madeira)
export type DistrictGeoItem = {
  name: string
  type: 'mainland' | 'island'
  path: string
  centroid: [number, number]
}

export const PORTUGAL_GEO_DATA: DistrictGeoItem[] = ${JSON.stringify(outputData, null, 2)}
`;

fs.writeFileSync(targetJsFile, tsContent, 'utf8');
const stats = fs.statSync(targetJsFile);
console.log('Successfully generated', outputData.length, 'regions to', targetJsFile, `(${Math.round(stats.size / 1024)} KB)`);
