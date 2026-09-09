const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9265;

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

function checkAssetHttp(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
      });
    }).on('error', (e) => {
      resolve({ error: e.message });
    });
  });
}

async function run() {
  console.log('=====================================================');
  console.log('1. VERIFICAÇÃO HTTP DO ASSET /videos/global-background.mp4');
  console.log('=====================================================');
  const assetRes = await checkAssetHttp('http://localhost:3000/videos/global-background.mp4');
  console.log('HTTP Asset check:', JSON.stringify(assetRes, null, 2));

  console.log('\n=====================================================');
  console.log('2. INICIAR CHROME CDP PARA INSPEÇÃO DO DOM E RUNTIME');
  console.log('=====================================================');
  const tempProfile = path.join(process.cwd(), 'scratch', 'chrome_prof_diag_' + Date.now());
  if (!fs.existsSync(path.join(process.cwd(), 'scratch'))) {
    fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });
  }

  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${REMOTE_PORT}`,
    '--headless=new',
    '--incognito',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfile}`
  ]);

  let list = null;
  for (let i = 0; i < 25; i++) {
    await wait(300);
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

  const mediaRequests = [];
  ws.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Network.responseReceived') {
      const url = msg.params.response.url;
      if (url.includes('.mp4') || url.includes('video')) {
        mediaRequests.push({
          url: url,
          status: msg.params.response.status,
          headers: msg.params.response.headers,
          mimeType: msg.params.response.mimeType
        });
      }
    }
  });

  console.log('\n>>> A navegar para http://localhost:3000/ ...');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await wait(3500);

  const evalDom = await send('Runtime.evaluate', {
    expression: `(() => {
      const video = document.querySelector('video');
      const allVideos = Array.from(document.querySelectorAll('video'));
      
      const elementsAtPoints = [
        document.elementFromPoint(100, 100),
        document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2),
        document.elementFromPoint(window.innerWidth - 100, 200)
      ].map(el => el ? { tag: el.tagName, id: el.id, class: el.className, bg: window.getComputedStyle(el).backgroundColor } : null);

      if (!video) {
        return {
          found: false,
          totalVideos: allVideos.length,
          bodyBg: window.getComputedStyle(document.body).backgroundColor,
          htmlBg: window.getComputedStyle(document.documentElement).backgroundColor,
          elementsAtPoints
        };
      }

      const style = window.getComputedStyle(video);
      const parent = video.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;

      // Buscar todos os irmãos do parent do video
      const siblings = parent ? Array.from(parent.children).map(c => ({
        tag: c.tagName,
        class: c.className,
        styleBg: c.style.backgroundImage,
        computedBg: window.getComputedStyle(c).backgroundColor,
        zIndex: window.getComputedStyle(c).zIndex,
        opacity: window.getComputedStyle(c).opacity
      })) : [];

      return {
        found: true,
        totalVideos: allVideos.length,
        currentSrc: video.currentSrc,
        src: video.src,
        sources: Array.from(video.querySelectorAll('source')).map(s => s.src),
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        muted: video.muted,
        loop: video.loop,
        autoplay: video.autoplay,
        computedStyle: {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          position: style.position,
          zIndex: style.zIndex,
          width: style.width,
          height: style.height,
          objectFit: style.objectFit
        },
        parentStyle: parentStyle ? {
          tag: parent.tagName,
          display: parentStyle.display,
          position: parentStyle.position,
          zIndex: parentStyle.zIndex,
          opacity: parentStyle.opacity
        } : null,
        parentSiblings: siblings,
        elementsAtPoints
      };
    })()`,
    returnByValue: true
  });

  console.log('\nDOM Inspection at t=0s:');
  console.log(JSON.stringify(evalDom.result.value, null, 2));

  // Esperar 2 segundos para ver se currentTime avança
  await wait(2000);

  const evalTime = await send('Runtime.evaluate', {
    expression: `(() => {
      const video = document.querySelector('video');
      if (!video) return { found: false };
      return {
        paused: video.paused,
        currentTime: video.currentTime,
        readyState: video.readyState
      };
    })()`,
    returnByValue: true
  });

  console.log('\nDOM Inspection at t=2s (verificar avanço do currentTime):');
  console.log(JSON.stringify(evalTime.result.value, null, 2));

  console.log('\nMedia Network Requests:');
  console.log(JSON.stringify(mediaRequests, null, 2));

  // Tirar Screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  const ssPath = path.join(process.cwd(), 'scratch', 'homepage_diag.png');
  fs.writeFileSync(ssPath, Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot to:', ssPath);

  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
