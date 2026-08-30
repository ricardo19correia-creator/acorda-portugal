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

    req.on('error', (e) => reject(e));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function parseFirestoreFields(fields = {}) {
  const result = {};
  for (const [key, valueObj] of Object.entries(fields)) {
    if ('stringValue' in valueObj) result[key] = valueObj.stringValue;
    else if ('integerValue' in valueObj) result[key] = parseInt(valueObj.integerValue, 10);
    else if ('doubleValue' in valueObj) result[key] = parseFloat(valueObj.doubleValue);
    else if ('booleanValue' in valueObj) result[key] = valueObj.booleanValue;
    else if ('nullValue' in valueObj) result[key] = null;
    else if ('mapValue' in valueObj) result[key] = parseFirestoreFields(valueObj.mapValue.fields);
  }
  return result;
}

async function run() {
  const token = getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  console.log('=== AUDITORIA FIREBASE REST API ===\n');

  // 1. Coleção publicProfiles
  const pubUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/publicProfiles?pageSize=300`;
  const pubRes = await requestJson(pubUrl, { headers });
  const pubDocs = pubRes.data?.documents || [];

  console.log(`[Coleção 'publicProfiles'] Documentos encontrados: ${pubDocs.length}`);
  let humanProfiles = [];
  let botProfilesInPublic = [];

  for (const doc of pubDocs) {
    const docId = doc.name.split('/').pop();
    const data = parseFirestoreFields(doc.fields);
    if (data.isNpc === true || data.playerType === 'npc' || docId.startsWith('npc_')) {
      botProfilesInPublic.push({ id: docId, ...data });
    } else {
      humanProfiles.push({ id: docId, ...data });
      console.log(`   👤 Humano: [${docId}] "${data.displayName || data.name}" | XP: ${data.xp} | Nível: ${data.level} | Distrito: ${data.district}`);
    }
  }

  // 2. Coleção botPlayers
  const botsUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/botPlayers?pageSize=300`;
  const botsRes = await requestJson(botsUrl, { headers });
  const botDocs = botsRes.data?.documents || [];

  console.log(`\n[Coleção 'botPlayers'] Documentos encontrados: ${botDocs.length}`);

  // 3. Coleção users
  const usersUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?pageSize=300`;
  const usersRes = await requestJson(usersUrl, { headers });
  const usersDocs = usersRes.data?.documents || [];
  console.log(`\n[Coleção 'users'] Documentos encontrados: ${usersDocs.length}`);

  console.log('\n========================================');
  console.log('RELATÓRIO DE AUDITORIA DE POPULAÇÃO');
  console.log('========================================');
  console.log(`humanCount (Jogadores Humanos Reais): ${humanProfiles.length}`);
  console.log(`botCount em botPlayers: ${botDocs.length}`);
  console.log(`botCount em publicProfiles: ${botProfilesInPublic.length}`);
  console.log(`totalBots no Firestore: ${botDocs.length + botProfilesInPublic.length}`);
  console.log(`totalPlayers (humanos + bots): ${humanProfiles.length + botDocs.length + botProfilesInPublic.length}`);
  console.log('========================================\n');
}

run().catch(console.error);
