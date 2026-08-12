const fs = require('fs');
const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) { console.error('Usage: node parse_csv_manual.js <input.csv> <output.geojson>'); process.exit(2); }

const text = fs.readFileSync(input, 'utf8');
const lines = text.split(/\r?\n/);
if (lines.length < 2) { console.error('No lines'); process.exit(1); }
const header = lines[0].split(';');
console.log('Header cols', header);

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // handle double-quote escape
      if (inQuotes && line[i+1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ';' && !inQuotes) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

const features = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line || line.trim() === '') continue;
  const cols = parseCSVLine(line);
  // expecting 4 cols: Geo Point;Geo Shape;Dicofre;Distrito
  if (cols.length < 4) continue;
  const geoShape = cols[1];
  const dicofre = cols[2];
  const distrito = cols[3];
  // geoShape may be JSON string with double-double quotes already unescaped by parser
  let geomText = geoShape;
  // ensure starts with { and ends with }
  const first = geomText.indexOf('{');
  const last = geomText.lastIndexOf('}');
  if (first === -1 || last === -1) continue;
  geomText = geomText.substring(first, last+1);
  // replace double double-quotes with single quotes
  geomText = geomText.replace(/""/g, '"');
  try {
    const geometry = JSON.parse(geomText);
    features.push({ type: 'Feature', properties: { Distrito: distrito, Dicofre: dicofre }, geometry });
  } catch (e) {
    // skip
  }
}
const fc = { type: 'FeatureCollection', features };
fs.writeFileSync(output, JSON.stringify(fc));
console.log('Wrote', features.length, 'features to', output);
