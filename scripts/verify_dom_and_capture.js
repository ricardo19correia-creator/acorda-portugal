const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9245;

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
  console.log('>>> [TEST] A iniciar Chrome Headless na porta', REMOTE_PORT);
  const tempProfile = path.join(process.cwd(), 'scratch', 'chrome_prof_' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${REMOTE_PORT}`,
    '--headless=new',
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

  const testResults = {};

  async function inspectPage(pageUrl, pageName) {
    console.log(`\n========================================`);
    console.log(`>>> [TEST] A carregar rota: ${pageUrl}`);
    console.log(`========================================`);
    await send('Page.navigate', { url: pageUrl });
    await wait(4500); // Aguardar compilação/hidratação Next.js

    const inspection = await send('Runtime.evaluate', {
      expression: `(() => {
        // 1. Contentor com data-map-engine
        const engineContainer = document.querySelector('[data-map-engine="PORTUGAL-MAP-ENGINE-V2"]');
        const liveBanner = document.querySelector('#map-engine-v2-verification-banner');
        const bannerTextFound = document.body.innerText.includes('PORTUGAL MAP ENGINE V2 — LIVE');
        
        // 2. Borda magenta
        let hasMagentaBorder = false;
        if (engineContainer) {
          const style = window.getComputedStyle(engineContainer);
          hasMagentaBorder = style.borderColor.includes('255, 0, 255') || 
                             style.border.includes('magenta') || 
                             style.borderTopColor === 'rgb(255, 0, 255)' ||
                             engineContainer.style.border.includes('magenta');
        }

        // 3. SVG e Layers
        const svg = document.querySelector('svg[data-debug-map="REAL-MAP"]');
        const paths = svg ? Array.from(svg.querySelectorAll('path')) : [];
        const territoryGroups = svg ? Array.from(svg.querySelectorAll('g[id^="territory-"]')) : [];
        
        // 4. Distritos específicos
        const expectedDistricts = [
          'aveiro', 'beja', 'braga', 'braganca', 'castelo-branco',
          'coimbra', 'evora', 'faro', 'guarda', 'leiria',
          'lisboa', 'portalegre', 'porto', 'santarem', 'setubal',
          'viana-do-castelo', 'vila-real', 'viseu', 'acores', 'madeira'
        ];
        
        const foundDistricts = expectedDistricts.filter(id => {
          return document.getElementById('territory-' + id) !== null;
        });

        // 5. Cidades / Capitais visíveis no SVG
        const cityTexts = svg ? Array.from(svg.querySelectorAll('text')).map(t => t.textContent.trim()) : [];
        const expectedCities = ['Lisboa', 'Porto', 'Coimbra', 'Faro', 'Braga', 'Évora', 'Funchal', 'Ponta Delgada'];
        const foundCities = expectedCities.filter(c => cityTexts.some(txt => txt.includes(c)));

        // 6. Ilhas (Açores e Madeira)
        const hasAcores = Boolean(document.getElementById('territory-acores') || cityTexts.includes('Ponta Delgada'));
        const hasMadeira = Boolean(document.getElementById('territory-madeira') || cityTexts.includes('Funchal'));

        // 7. Mapa Antigo ou Raster MapLibre / ArcGIS
        const maplibreMap = document.querySelector('.maplibregl-map');
        const maplibreCanvas = document.querySelector('canvas.maplibregl-canvas');
        const anyCanvas = document.querySelector('canvas');
        const arcgisTiles = Array.from(document.querySelectorAll('img')).some(img => 
          (img.src && (img.src.includes('arcgisonline') || img.src.includes('basemaps.cartocdn') || img.src.includes('openstreetmap')))
        );

        // 8. Cores Vivas (não cinzento)
        const lisboaEl = document.getElementById('territory-lisboa');
        const lisboaPath = lisboaEl ? lisboaEl.querySelector('path') : null;
        const lisboaFill = lisboaPath ? window.getComputedStyle(lisboaPath).fill : null;

        // 9. Centralização e Tamanho do Continente
        let mainlandRect = null;
        let svgRect = null;
        let isCentered = false;
        let isLarge = false;

        const mainlandGroup = document.getElementById('mainland-districts-group');
        if (mainlandGroup && svg) {
          const mBox = mainlandGroup.getBoundingClientRect();
          const sBox = svg.getBoundingClientRect();
          mainlandRect = { left: mBox.left, right: mBox.right, width: mBox.width, height: mBox.height };
          svgRect = { left: sBox.left, right: sBox.right, width: sBox.width, height: sBox.height };
          
          // Mede o alinhamento horizontal: se a distância à esquerda e à direita for razoavelmente balanceada
          const leftSpace = mBox.left - sBox.left;
          const rightSpace = sBox.right - mBox.right;
          // Se não estiver colado à direita (o bug antigo tinha rightSpace quase 0 e leftSpace enorme)
          isCentered = leftSpace > 50 && rightSpace > 50 && Math.abs(leftSpace - rightSpace) < 300;
          isLarge = mBox.height > (sBox.height * 0.60);
        }

        return {
          hasEngineContainer: Boolean(engineContainer),
          dataEngineAttr: engineContainer ? engineContainer.getAttribute('data-map-engine') : null,
          bannerFound: Boolean(liveBanner),
          bannerTextFound: bannerTextFound,
          hasMagentaBorder: hasMagentaBorder,
          hasSvg: Boolean(svg),
          pathCount: paths.length,
          territoryGroupCount: territoryGroups.length,
          expectedDistrictsCount: expectedDistricts.length,
          foundDistrictsCount: foundDistricts.length,
          foundDistrictsList: foundDistricts,
          foundCitiesList: foundCities,
          hasAcores: hasAcores,
          hasMadeira: hasMadeira,
          hasMaplibreMap: Boolean(maplibreMap),
          hasMaplibreCanvas: Boolean(maplibreCanvas),
          hasAnyCanvas: Boolean(anyCanvas),
          hasArcgisTiles: arcgisTiles,
          lisboaFill: lisboaFill,
          isCentered: isCentered,
          isLarge: isLarge,
          mainlandRect,
          svgRect
        };
      })()`,
      returnByValue: true
    });

    const val = inspection.result.value;
    console.log(`Resultado da inspeção DOM em ${pageName}:`);
    console.log(JSON.stringify(val, null, 2));

    // Se for rankings, fazer scroll para o mapa para captura perfeita
    if (pageUrl.includes('rankings')) {
      await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('[data-map-engine="PORTUGAL-MAP-ENGINE-V2"]');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()`
      });
      await wait(1000);
    }

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const localScratchPath = path.join(process.cwd(), 'scratch', `validation_${pageName}.png`);
    fs.writeFileSync(localScratchPath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Screenshot guardada em ${localScratchPath}`);

    const artifactDir = 'C:\\Users\\Riky Moreira\\.gemini\\antigravity\\brain\\a526ebae-8b25-41bc-90cf-11992f69ad6f';
    const artifactPath = path.join(artifactDir, `validation_${pageName}.png`);
    fs.writeFileSync(artifactPath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Screenshot copiada para artefacto ${artifactPath}`);

    testResults[pageName] = val;
  }

  try {
    await inspectPage('http://localhost:3000/portugal-mapa', 'portugal_mapa');
    await inspectPage('http://localhost:3000/rankings', 'rankings');
  } catch (err) {
    console.error('Erro na inspeção:', err);
  } finally {
    chrome.kill();
  }

  console.log('\n========================================');
  console.log('>>> [RESUMO GERAL DOS TESTES]');
  console.log('========================================');
  console.log(JSON.stringify(testResults, null, 2));
}

run().catch(console.error);
