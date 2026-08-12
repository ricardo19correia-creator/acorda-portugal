const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/lib/sync');

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error('Usage: node parse_csv_to_geojson.js <input.csv> <output.geojson>');
  process.exit(2);
}

const csvText = fs.readFileSync(input, 'utf8');
// parse with ; delimiter, columns: true
const records = parse(csvText, { delimiter: ';', columns: true, relax_quotes: true, skip_empty_lines: true });
console.log('Parsed', records.length, 'CSV rows');

const features = [];
for (const r of records) {
  const shape = r['Geo Shape'] || r['GeoShape'] || r['geo_shape'] || r['GeoShape'];
  const distrito = r['Distrito'] || r['district'] || r['Distrito '];
  const dicofre = r['Dicofre'] || r['dicofre'];
  if (!shape) continue;
  // The shape may contain double-double quotes for internal quotes. Normalize by replacing "" with " if present.
  let geomText = shape;
  // If the field starts and ends with a double quote, strip outer quotes
  if (geomText.length >= 2 && geomText[0] === '"' && geomText[geomText.length-1] === '"') {
    geomText = geomText.substring(1, geomText.length-1);
  }
  // Replace doubled quotes "" with single quote "
  geomText = geomText.replace(/""/g, '"');

  try {
    const geometry = JSON.parse(geomText);
    features.push({ type: 'Feature', properties: { Distrito: distrito, Dicofre: dicofre }, geometry });
  } catch (e) {
    // parsing failed; try to locate first { and last }
    const first = geomText.indexOf('{');
    const last = geomText.lastIndexOf('}');
    if (first >= 0 && last > first) {
      const sub = geomText.substring(first, last+1).replace(/""/g, '"');
      try {
        const geometry = JSON.parse(sub);
        features.push({ type: 'Feature', properties: { Distrito: distrito, Dicofre: dicofre }, geometry });
      } catch (err) {
        // give up on this row
      }
    }
  }
}

const fc = { type: 'FeatureCollection', features };
fs.writeFileSync(output, JSON.stringify(fc));
console.log('Wrote', features.length, 'features to', output);
