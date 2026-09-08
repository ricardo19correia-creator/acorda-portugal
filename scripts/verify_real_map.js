async function test() {
  const routes = ['/portugal-mapa', '/rankings', '/arenas', '/'];
  for (const r of routes) {
    const res = await fetch('http://localhost:3000' + r);
    const html = await res.text();
    const hasDebug = html.includes('REAL-MAP');
    const hasViewBox = html.includes('0 0 1000 860');
    console.log(`Route: ${r.padEnd(16)} | Status: ${res.status} | REAL-MAP: ${hasDebug} | ViewBox 1000x860: ${hasViewBox}`);
  }
}
test();
