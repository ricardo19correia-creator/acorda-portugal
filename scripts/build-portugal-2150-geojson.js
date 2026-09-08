const fs = require('fs');
const path = require('path');

const RAW_GEOJSON_PATH = path.join(__dirname, '..', 'data', 'geo-portugal', 'geo-portugal', 'portugal-districts.geojson');
const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'maps');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const raw = JSON.parse(fs.readFileSync(RAW_GEOJSON_PATH, 'utf8'));

// Douglas-Peucker simplification
function sqrDist(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}
function sqrDistToSegment(p, p1, p2) {
  let l2 = sqrDist(p1, p2);
  if (l2 === 0) return sqrDist(p, p1);
  let t = Math.max(0, Math.min(1, ((p[0] - p1[0]) * (p2[0] - p1[0]) + (p[1] - p1[1]) * (p2[1] - p1[1])) / l2));
  return sqrDist(p, [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]);
}
function simplifyRing(ring, tol = 0.0035) {
  if (ring.length <= 4) return ring;
  const sqTol = tol * tol;
  function simplifyDP(pts) {
    let maxD = 0, idx = 0;
    const end = pts.length - 1;
    for (let i = 1; i < end; i++) {
      const d = sqrDistToSegment(pts[i], pts[0], pts[end]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > sqTol) {
      return simplifyDP(pts.slice(0, idx + 1)).slice(0, -1).concat(simplifyDP(pts.slice(idx)));
    }
    return [pts[0], pts[end]];
  }
  const res = simplifyDP(ring);
  if (res.length < 4) return ring;
  if (res[0][0] !== res[res.length-1][0] || res[0][1] !== res[res.length-1][1]) {
    res.push([res[0][0], res[0][1]]);
  }
  return res;
}
function ringArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += (ring[i][0] * ring[i+1][1] - ring[i+1][0] * ring[i][1]);
  }
  return Math.abs(area) / 2;
}

// Canonical District Metadata & Futuristic 2150 Palette
const DISTRICT_CONFIG = {
  'VIANA DO CASTELO': { id: 'viana_do_castelo', name: 'Viana do Castelo', color: '#06b6d4', region: 'Norte', capital: 'Viana do Castelo', center: [-8.8329, 41.6918] },
  'BRAGA': { id: 'braga', name: 'Braga', color: '#3b82f6', region: 'Norte', capital: 'Braga', center: [-8.4265, 41.5454] },
  'VILA REAL': { id: 'vila_real', name: 'Vila Real', color: '#8b5cf6', region: 'Norte', capital: 'Vila Real', center: [-7.7441, 41.3006] },
  'BRAGANÇA': { id: 'braganca', name: 'Bragança', color: '#6366f1', region: 'Norte', capital: 'Bragança', center: [-6.7572, 41.8058] },
  'PORTO': { id: 'porto', name: 'Porto', color: '#0ea5e9', region: 'Norte', capital: 'Porto', center: [-8.6291, 41.1579] },
  'AVEIRO': { id: 'aveiro', name: 'Aveiro', color: '#14b8a6', region: 'Centro', capital: 'Aveiro', center: [-8.6538, 40.6405] },
  'VISEU': { id: 'viseu', name: 'Viseu', color: '#7c3aed', region: 'Centro', capital: 'Viseu', center: [-7.9103, 40.6575] },
  'GUARDA': { id: 'guarda', name: 'Guarda', color: '#9333ea', region: 'Centro', capital: 'Guarda', center: [-7.2683, 40.5364] },
  'COIMBRA': { id: 'coimbra', name: 'Coimbra', color: '#0284c7', region: 'Centro', capital: 'Coimbra', center: [-8.4103, 40.2033] },
  'CASTELO BRANCO': { id: 'castelo_branco', name: 'Castelo Branco', color: '#10b981', region: 'Centro', capital: 'Castelo Branco', center: [-7.4912, 39.8222] },
  'LEIRIA': { id: 'leiria', name: 'Leiria', color: '#10b981', region: 'Centro', capital: 'Leiria', center: [-8.8078, 39.7436] },
  'SANTARÉM': { id: 'santarem', name: 'Santarém', color: '#059669', region: 'Lisboa e Vale do Tejo', capital: 'Santarém', center: [-8.6833, 39.2333] },
  'PORTALEGRE': { id: 'portalegre', name: 'Portalegre', color: '#84cc16', region: 'Alentejo', capital: 'Portalegre', center: [-7.4312, 39.2938] },
  'LISBOA': { id: 'lisboa', name: 'Lisboa', color: '#00e5ff', region: 'Lisboa e Vale do Tejo', capital: 'Lisboa', center: [-9.1393, 38.7223] },
  'SETÚBAL': { id: 'setubal', name: 'Setúbal', color: '#0284c7', region: 'Lisboa e Vale do Tejo', capital: 'Setúbal', center: [-8.8926, 38.5244] },
  'ÉVORA': { id: 'evora', name: 'Évora', color: '#d97706', region: 'Alentejo', capital: 'Évora', center: [-7.9071, 38.5714] },
  'BEJA': { id: 'beja', name: 'Beja', color: '#eab308', region: 'Alentejo', capital: 'Beja', center: [-7.8632, 38.0151] },
  'FARO': { id: 'faro', name: 'Faro', color: '#06b6d4', region: 'Algarve', capital: 'Faro', center: [-7.9304, 37.0194] },
};

// 1. Process 18 Mainland Districts
const mainlandFeatures = raw.features.filter(f => !f.properties.Distrito.includes('Região'));
const processedMainland = mainlandFeatures.map((f, idx) => {
  const dName = f.properties.Distrito;
  const cfg = DISTRICT_CONFIG[dName];
  if (!cfg) {
    console.error('Unknown district name:', dName);
    return null;
  }

  let geom = f.geometry;
  if (geom.type === 'Polygon') {
    geom.coordinates = geom.coordinates.map(r => simplifyRing(r, 0.0035));
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates = geom.coordinates
      .filter(poly => ringArea(poly[0]) > 0.00005)
      .map(poly => poly.map(r => simplifyRing(r, 0.0035)));
  }

  return {
    type: 'Feature',
    id: idx + 1,
    properties: {
      numericId: idx + 1,
      id: cfg.id,
      name: cfg.name,
      canonicalName: cfg.name,
      region: cfg.region,
      capital: cfg.capital,
      color: cfg.color,
      centerLng: cfg.center[0],
      centerLat: cfg.center[1],
      type: 'mainland',
    },
    geometry: geom,
  };
}).filter(Boolean);

const mainlandGeoJSON = {
  type: 'FeatureCollection',
  features: processedMainland,
};
fs.writeFileSync(path.join(OUT_DIR, 'portugal-districts.json'), JSON.stringify(mainlandGeoJSON));
console.log('Mainland districts written:', processedMainland.length, 'Size KB:', (JSON.stringify(mainlandGeoJSON).length / 1024).toFixed(1));

// 2. Process Azores 9 Islands
const acoresRaw = raw.features.find(f => f.properties.Distrito.includes('Açores'));
const islandsMeta = [
  { name: 'Santa Maria', id: 'acores_santa_maria', color: '#38bdf8', center: [-25.10, 36.98], lngMin: -25.25, lngMax: -25.0, latMin: 36.9, latMax: 37.1 },
  { name: 'São Miguel', id: 'acores_sao_miguel', color: '#00e5ff', center: [-25.48, 37.78], lngMin: -25.9, lngMax: -25.1, latMin: 37.7, latMax: 38.0 },
  { name: 'Terceira', id: 'acores_terceira', color: '#a855f7', center: [-27.22, 38.72], lngMin: -27.45, lngMax: -27.0, latMin: 38.6, latMax: 38.9 },
  { name: 'Graciosa', id: 'acores_graciosa', color: '#10b981', center: [-28.01, 39.05], lngMin: -28.1, lngMax: -27.9, latMin: 39.0, latMax: 39.15 },
  { name: 'São Jorge', id: 'acores_sao_jorge', color: '#06b6d4', center: [-28.05, 38.64], lngMin: -28.4, lngMax: -27.7, latMin: 38.5, latMax: 38.8 },
  { name: 'Pico', id: 'acores_pico', color: '#f59e0b', center: [-28.32, 38.47], lngMin: -28.6, lngMax: -28.0, latMin: 38.35, latMax: 38.6 },
  { name: 'Faial', id: 'acores_faial', color: '#3b82f6', center: [-28.72, 38.58], lngMin: -28.9, lngMax: -28.55, latMin: 38.5, latMax: 38.7 },
  { name: 'Flores', id: 'acores_flores', color: '#14b8a6', center: [-31.18, 39.45], lngMin: -31.35, lngMax: -31.1, latMin: 39.35, latMax: 39.6 },
  { name: 'Corvo', id: 'acores_corvo', color: '#8b5cf6', center: [-31.11, 39.70], lngMin: -31.2, lngMax: -31.05, latMin: 39.65, latMax: 39.75 },
];

const processedAzores = [];
islandsMeta.forEach((meta, idx) => {
  const matchingPolys = [];
  acoresRaw.geometry.coordinates.forEach(poly => {
    let sumLng = 0, sumLat = 0, pts = 0;
    poly[0].forEach(p => { sumLng += p[0]; sumLat += p[1]; pts++; });
    const cLng = sumLng / pts;
    const cLat = sumLat / pts;
    if (cLng >= meta.lngMin && cLng <= meta.lngMax && cLat >= meta.latMin && cLat <= meta.latMax && pts > 30) {
      matchingPolys.push(poly.map(r => simplifyRing(r, 0.003)));
    }
  });

  if (matchingPolys.length > 0) {
    processedAzores.push({
      type: 'Feature',
      id: 30 + idx + 1,
      properties: {
        numericId: 30 + idx + 1,
        id: meta.id,
        name: meta.name,
        canonicalName: meta.name,
        region: 'Açores',
        capital: meta.name === 'São Miguel' ? 'Ponta Delgada' : meta.name === 'Terceira' ? 'Angra do Heroísmo' : meta.name === 'Faial' ? 'Horta' : meta.name,
        color: meta.color,
        centerLng: meta.center[0],
        centerLat: meta.center[1],
        type: 'island',
      },
      geometry: matchingPolys.length === 1 ? {
        type: 'Polygon',
        coordinates: matchingPolys[0],
      } : {
        type: 'MultiPolygon',
        coordinates: matchingPolys,
      }
    });
  }
});

const azoresGeoJSON = {
  type: 'FeatureCollection',
  features: processedAzores,
};
fs.writeFileSync(path.join(OUT_DIR, 'azores-islands.json'), JSON.stringify(azoresGeoJSON));
console.log('Azores islands written:', processedAzores.length, 'Size KB:', (JSON.stringify(azoresGeoJSON).length / 1024).toFixed(1));

// 3. Process Madeira (Madeira Main Island + Porto Santo)
const madeiraRaw = raw.features.find(f => f.properties.Distrito.includes('Madeira'));
const madeiraIslandsMeta = [
  { name: 'Ilha da Madeira', id: 'madeira_ilha', color: '#a855f7', center: [-16.95, 32.75], lngMin: -17.3, lngMax: -16.6, latMin: 32.6, latMax: 32.9 },
  { name: 'Porto Santo', id: 'madeira_porto_santo', color: '#eab308', center: [-16.34, 33.06], lngMin: -16.45, lngMax: -16.25, latMin: 33.0, latMax: 33.15 },
];

const processedMadeira = [];
madeiraIslandsMeta.forEach((meta, idx) => {
  const matchingPolys = [];
  madeiraRaw.geometry.coordinates.forEach(poly => {
    let sumLng = 0, sumLat = 0, pts = 0;
    poly[0].forEach(p => { sumLng += p[0]; sumLat += p[1]; pts++; });
    const cLng = sumLng / pts;
    const cLat = sumLat / pts;
    if (cLng >= meta.lngMin && cLng <= meta.lngMax && cLat >= meta.latMin && cLat <= meta.latMax && pts > 500) {
      matchingPolys.push(poly.map(r => simplifyRing(r, 0.003)));
    }
  });

  if (matchingPolys.length > 0) {
    processedMadeira.push({
      type: 'Feature',
      id: 50 + idx + 1,
      properties: {
        numericId: 50 + idx + 1,
        id: meta.id,
        name: meta.name,
        canonicalName: meta.name,
        region: 'Madeira',
        capital: meta.name === 'Ilha da Madeira' ? 'Funchal' : 'Vila Baleira',
        color: meta.color,
        centerLng: meta.center[0],
        centerLat: meta.center[1],
        type: 'island',
      },
      geometry: matchingPolys.length === 1 ? {
        type: 'Polygon',
        coordinates: matchingPolys[0],
      } : {
        type: 'MultiPolygon',
        coordinates: matchingPolys,
      }
    });
  }
});

const madeiraGeoJSON = {
  type: 'FeatureCollection',
  features: processedMadeira,
};
fs.writeFileSync(path.join(OUT_DIR, 'madeira-islands.json'), JSON.stringify(madeiraGeoJSON));
console.log('Madeira islands written:', processedMadeira.length, 'Size KB:', (JSON.stringify(madeiraGeoJSON).length / 1024).toFixed(1));

// 4. Combined National GeoJSON (Continente + Açores + Madeira)
const combinedGeoJSON = {
  type: 'FeatureCollection',
  features: [
    ...processedMainland,
    ...processedAzores,
    ...processedMadeira,
  ],
};
fs.writeFileSync(path.join(OUT_DIR, 'portugal-national.json'), JSON.stringify(combinedGeoJSON));
console.log('Combined National features written:', combinedGeoJSON.features.length, 'Total Size KB:', (JSON.stringify(combinedGeoJSON).length / 1024).toFixed(1));

console.log('SUCCESS: All 2150 territory geometries compiled!');
