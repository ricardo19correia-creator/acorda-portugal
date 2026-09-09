const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9260;

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
  console.log('>>> [FINAL PRODUCTION TEST] A iniciar Chrome em modo incógnito na porta', REMOTE_PORT);
  const tempProfile = path.join(process.cwd(), 'scratch', 'chrome_prof_final_' + Date.now());
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

  // Forçar bypass total de cache
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  const routes = [
    { url: 'https://acordaportugal.pt/', name: 'final_homepage' },
    { url: 'https://acordaportugal.pt/portugal-mapa', name: 'final_portugal_mapa' },
    { url: 'https://acordaportugal.pt/rankings', name: 'final_rankings' },
    { url: 'https://acordaportugal.pt/arenas?tab=map', name: 'final_arenas_map' },
  ];

  const results = {};

  for (const r of routes) {
    console.log(`\n========================================`);
    console.log(`>>> [FINAL TEST] A testar: ${r.url}`);
    console.log(`========================================`);

    await send('Page.navigate', { url: r.url });
    await wait(4500);

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        // 1. Verificação de Debug Removido
        const hasDebugBanner = Boolean(document.querySelector('#map-engine-v2-verification-banner'));
        const hasLiveDebugText = document.body.innerText.includes('PORTUGAL MAP ENGINE V2');
        
        let hasMagentaBorder = false;
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const s = window.getComputedStyle(el);
          if (s.borderColor.includes('255, 0, 255') || (el.style && el.style.border && el.style.border.includes('magenta'))) {
            hasMagentaBorder = true;
            break;
          }
        }

        // 2. Verificação de 2150 Removido
        const has2150InMap = document.body.innerText.includes('2150');

        // 3. Verificação do SVG e Camadas AAA
        const svg = document.querySelector('svg[data-debug-map="REAL-MAP"]');
        const paths = svg ? svg.querySelectorAll('path').length : 0;
        const has3dExtrusion = Boolean(document.getElementById('mainland-3d-extrusion'));
        const hasTopographicRelief = Boolean(document.getElementById('portugal-topographic-relief'));
        const hasNationalNetwork = Boolean(document.getElementById('portugal-national-network'));
        const hasCoastlineLuminescence = Boolean(document.getElementById('portugal-coastline-luminescence'));
        const hasAcores = Boolean(document.getElementById('inset-acores'));
        const hasMadeira = Boolean(document.getElementById('inset-madeira'));
        const hasTorre = document.body.innerText.includes('TORRE 1993m') || Boolean(document.getElementById('serra-da-estrela-relief'));
        const hasFoia = document.body.innerText.includes('FÓIA 902m') || Boolean(document.getElementById('serra-de-monchique-relief'));

        // 4. Motores antigos eliminados
        const hasOldMapLibre = Boolean(document.querySelector('.maplibregl-map'));
        const hasArcgisCanvas = Boolean(document.querySelector('canvas.maplibregl-canvas'));

        // 5. Distritos e Capitais
        const expectedDistricts = [
          'aveiro', 'beja', 'braga', 'braganca', 'coimbra',
          'evora', 'faro', 'guarda', 'leiria', 'lisboa',
          'portalegre', 'porto', 'santarem', 'setubal', 'viseu'
        ];
        const foundDistricts = expectedDistricts.filter(d => document.getElementById('territory-' + d) !== null);

        return {
          url: window.location.href,
          debugRemoved: !hasDebugBanner && !hasLiveDebugText && !hasMagentaBorder,
          no2150: !has2150InMap,
          hasRealSvg: Boolean(svg),
          pathCount: paths,
          has3dExtrusion,
          hasTopographicRelief,
          hasNationalNetwork,
          hasCoastlineLuminescence,
          hasAcores,
          hasMadeira,
          hasTorrePeak: hasTorre,
          hasFoiaPeak: hasFoia,
          hasOldMapLibre,
          hasArcgisCanvas,
          foundDistrictsCount: foundDistricts.length
        };
      })()`,
      returnByValue: true
    });

    const val = check.result.value;
    console.log(`Resultado para ${r.name}:`, JSON.stringify(val, null, 2));
    results[r.name] = val;

    // Scroll para focar o mapa se necessário
    await send('Runtime.evaluate', {
      expression: `(() => {
        const svg = document.querySelector('svg[data-debug-map="REAL-MAP"]');
        if (svg) svg.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`
    });
    await wait(1000);

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const localScratch = path.join(process.cwd(), 'scratch', `${r.name}.png`);
    fs.writeFileSync(localScratch, Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot to ${localScratch}`);

    const artifactDir = 'C:\\Users\\Riky Moreira\\.gemini\\antigravity\\brain\\a526ebae-8b25-41bc-90cf-11992f69ad6f';
    const artifactPath = path.join(artifactDir, `${r.name}.png`);
    fs.writeFileSync(artifactPath, Buffer.from(ss.data, 'base64'));
  }

  chrome.kill();
  console.log('\n========================================');
  console.log('>>> [RESUMO FINAL DE PRODUÇÃO]');
  console.log('========================================');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
