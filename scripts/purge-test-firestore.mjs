import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';

const PROJECT_ID = 'desafio-nacional-5fe71';
const PROTECTED_UID = 'A4tBQnNi8ySw2lYUI7rlxAo2bKE2';
const PROTECTED_EMAIL = 'ricardo19correia@gmail.com';

function getAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Firebase tools config não encontrado em ${configPath}`);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.tokens.access_token;
}

function requestJson(url, options = {}, body = null) {
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
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  const token = getAccessToken();
  console.log('--- EXECUTANDO LIMPEZA DEFINITIVA NO FIRESTORE E AUTH ---');

  // 1. Limpar publicProfiles
  const pubRes = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/publicProfiles`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (pubRes.data && pubRes.data.documents) {
    for (const doc of pubRes.data.documents) {
      const id = doc.name.split('/').pop();
      if (id !== PROTECTED_UID) {
        console.log(`A apagar publicProfiles/${id}...`);
        await requestJson(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/publicProfiles/${id}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }
  }

  // 2. Limpar users
  const usersRes = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (usersRes.data && usersRes.data.documents) {
    for (const doc of usersRes.data.documents) {
      const id = doc.name.split('/').pop();
      if (id !== PROTECTED_UID) {
        console.log(`A apagar users/${id}...`);
        await requestJson(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${id}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }
  }

  // 3. Limpar Firebase Auth
  const authRes = await requestJson(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:batchGet?maxResults=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (authRes.data && authRes.data.users) {
    for (const u of authRes.data.users) {
      if (u.localId !== PROTECTED_UID && u.email !== PROTECTED_EMAIL) {
        console.log(`A apagar utilizador no Firebase Auth: ${u.localId} (${u.email || u.displayName})...`);
        await requestJson(
          `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
          { localId: u.localId }
        );
      }
    }
  }

  console.log('--- LIMPEZA DEFINITIVA CONCLUÍDA COM SUCESSO ---');
}

run().catch(console.error);
