import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';

const PROJECT_ID = 'desafio-nacional-5fe71';

function getAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Firebase tools config não encontrado em ${configPath}`);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const tokens = config.tokens;
  if (!tokens || !tokens.access_token) {
    throw new Error('Nenhum access_token encontrado.');
  }
  return tokens.access_token;
}

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ ok: false, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const token = getAccessToken();
  console.log('--- INSPECIONANDO FIRESTORE ---');
  
  // 1. Inspecionar publicProfiles
  const pubRes = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/publicProfiles`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('PUBLIC PROFILES:');
  if (pubRes.data && pubRes.data.documents) {
    pubRes.data.documents.forEach(doc => {
      const id = doc.name.split('/').pop();
      const fields = doc.fields || {};
      console.log(`Doc ID: ${id} => displayName: ${fields.displayName?.stringValue || fields.name?.stringValue}, xp: ${fields.xp?.integerValue || fields.xp?.doubleValue}, district: ${fields.district?.stringValue}`);
    });
  } else {
    console.log('Nenhum documento em publicProfiles.');
  }

  // 2. Inspecionar users
  const usersRes = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('\nUSERS:');
  if (usersRes.data && usersRes.data.documents) {
    usersRes.data.documents.forEach(doc => {
      const id = doc.name.split('/').pop();
      const fields = doc.fields || {};
      console.log(`User ID: ${id} => displayName: ${fields.displayName?.stringValue || fields.name?.stringValue}, email: ${fields.email?.stringValue}, xp: ${fields.xp?.integerValue || fields.xp?.doubleValue}`);
    });
  } else {
    console.log('Nenhum documento em users.');
  }
}

run().catch(console.error);
