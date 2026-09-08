const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9238;

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

async function capture() {
  console.log('1. Launching Chrome headless on port', REMOTE_PORT);
  const tempProfile = path.join(process.cwd(), 'scratch', 'chrome_prof_' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${REMOTE_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfile}`
  ]);

  let list = null;
  for (let i = 0; i < 15; i++) {
    await wait(500);
    try {
      list = await fetchJson(`http://127.0.0.1:${REMOTE_PORT}/json/list`);
      if (list && list.length > 0) break;
    } catch (e) {}
  }

  if (!list) {
    console.error('Failed to connect to Chrome remote debugging');
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

  // Capture 1: /portugal-mapa
  console.log('2. Navigating to /portugal-mapa');
  await send('Page.navigate', { url: 'http://localhost:3000/portugal-mapa' });
  await wait(3500);

  // Verify DOM attributes
  const domCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('[data-debug-map="REAL-MAP"]');
      const svg = document.querySelector('svg[data-debug-map="REAL-MAP"]');
      const lisboa = document.querySelector('#territory-lisboa path');
      const fill = lisboa ? getComputedStyle(lisboa).fill : 'none';
      return {
        hasRealMapAttr: Boolean(el),
        hasSvg: Boolean(svg),
        lisboaFill: fill
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM check /portugal-mapa:', domCheck.result.value);

  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  const path1 = path.join(process.cwd(), 'scratch', 'real_portugal_mapa.png');
  fs.writeFileSync(path1, Buffer.from(ss1.data, 'base64'));
  console.log('Saved', path1);

  // Capture 2: /rankings
  console.log('3. Navigating to /rankings');
  await send('Page.navigate', { url: 'http://localhost:3000/rankings' });
  await wait(3500);

  const domCheck2 = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('[data-debug-map="REAL-MAP"]');
      const svg = document.querySelector('svg[data-debug-map="REAL-MAP"]');
      return {
        hasRealMapAttr: Boolean(el),
        hasSvg: Boolean(svg)
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM check /rankings:', domCheck2.result.value);

  // Scroll down slightly to ensure map is in view if needed
  await send('Runtime.evaluate', {
    expression: `(() => {
      const mapContainer = document.querySelector('[data-debug-map="REAL-MAP"]');
      if (mapContainer) mapContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await wait(1000);

  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  const path2 = path.join(process.cwd(), 'scratch', 'real_rankings_map.png');
  fs.writeFileSync(path2, Buffer.from(ss2.data, 'base64'));
  console.log('Saved', path2);

  chrome.kill();
  console.log('Done!');
  process.exit(0);
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
