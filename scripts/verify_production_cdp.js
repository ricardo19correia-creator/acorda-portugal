const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9255;

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('>>> [PROD TEST] A iniciar Chrome em modo incógnito na porta', REMOTE_PORT);
  const tempProfile = path.join(process.cwd(), 'scratch', 'chrome_prof_prod_' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${REMOTE_PORT}`,
    '--headless=new',
    '--incognito',
    '--disable-gpu',
    '--window-size=1440,960',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfile}`
  ]);

  let list = null;
  for (let i = 0; i < 20; i++) {
    await wait(400);
    try {
      list = await fetchJson(`http://127.0.0.1:${REMOTE_PORT}/json/list`);
      if (list && list.length > 0) break;
    } catch (e) {}
  }

  if (!list) {
    console.error('Falha ao conectar ao Chrome CDP');
    chrome.kill();
    process.exit(1);
  }

  const target = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const parsed = JSON.parse(evt.data);
        if (parsed.id === msgId) {
          ws.removeEventListener('message', handler);
          if (parsed.error) reject(parsed.error);
          else resolve(parsed.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  // Ignorar cache HTTP
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  const routes = [
    { url: 'https://acordaportugal.pt/', name: 'homepage' },
    { url: 'https://acordaportugal.pt/portugal-mapa', name: 'portugal_mapa' },
    { url: 'https://acordaportugal.pt/rankings', name: 'rankings' },
    { url: 'https://acordaportugal.pt/arenas', name: 'arenas' },
  ];

  const results = {};

  for (const r of routes) {
    console.log(`\n========================================`);
    console.log(`>>> [PROD TEST] A testar rota: ${r.url}`);
    console.log(`========================================`);

    await send('Page.navigate', { url: r.url });
    await wait(4000);

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.querySelector('[data-map-engine="PORTUGAL-MAP-ENGINE-V2"]');
        const banner = document.querySelector('#map-engine-v2-verification-banner');
        const textFound = document.body.innerText.includes('PORTUGAL MAP ENGINE V2 — LIVE');

        let hasMagenta = false;
        if (container) {
          const s = window.getComputedStyle(container);
          hasMagenta = s.borderColor.includes('255, 0, 255') || container.style.border.includes('magenta');
        }

        const svg = document.querySelector('svg[data-debug-map="REAL-MAP"]');
        const paths = svg ? svg.querySelectorAll('path').length : 0;

        const hasOldMapLibre = Boolean(document.querySelector('.maplibregl-map'));
        const hasArcgisCanvas = Boolean(document.querySelector('canvas.maplibregl-canvas'));

        const expectedDistricts = [
          'aveiro', 'beja', 'braga', 'braganca', 'castelo-branco',
          'coimbra', 'evora', 'faro', 'guarda', 'leiria',
          'lisboa', 'portalegre', 'porto', 'santarem', 'setubal',
          'viana-do-castelo', 'vila-real', 'viseu', 'acores', 'madeira'
        ];
        const foundDistricts = expectedDistricts.filter(d => document.getElementById('territory-' + d) !== null);

        return {
          url: window.location.href,
          hasEngineContainer: Boolean(container),
          hasBannerText: textFound,
          hasMagentaBorder: hasMagenta,
          hasRealSvg: Boolean(svg),
          pathCount: paths,
          hasOldMapLibre: hasOldMapLibre,
          hasArcgisCanvas: hasArcgisCanvas,
          foundDistrictsCount: foundDistricts.length,
          foundDistricts: foundDistricts
        };
      })()`,
      returnByValue: true
    });

    const val = check.result.value;
    console.log(`Resultado para ${r.name}:`, JSON.stringify(val, null, 2));
    results[r.name] = val;

    // Scroll para focar o mapa se for rankings ou homepage
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('[data-map-engine="PORTUGAL-MAP-ENGINE-V2"]');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`
    });
    await wait(800);

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const localScratch = path.join(process.cwd(), 'scratch', `prod_${r.name}.png`);
    fs.writeFileSync(localScratch, Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot to ${localScratch}`);

    const artifactDir = 'C:\\Users\\Riky Moreira\\.gemini\\antigravity\\brain\\a526ebae-8b25-41bc-90cf-11992f69ad6f';
    const artifactPath = path.join(artifactDir, `prod_${r.name}.png`);
    fs.writeFileSync(artifactPath, Buffer.from(ss.data, 'base64'));
  }

  chrome.kill();
  console.log('\n========================================');
  console.log('>>> [RESUMO GERAL PRODUÇÃO]');
  console.log('========================================');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
