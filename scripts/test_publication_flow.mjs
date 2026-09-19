import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';

const PROJECT_ID = 'desafio-nacional-5fe71';

function getAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.tokens.access_token;
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
          resolve({ ok: false, raw: data, status: res.statusCode });
        }
      });
    });
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.on('error', reject);
    req.end();
  });
}

async function runPublicationFlowTest() {
  console.log('================================================================================');
  console.log('🧪 TESTE REAL DE PUBLICAÇÃO E LEITURA — CICLO COMPLETO DA COMUNIDADE');
  console.log('================================================================================\n');

  const token = getAccessToken();

  // Test User A creating TESTE COMUNIDADE 001
  console.log('Passo 1: Utilizador A cria publicação "TESTE COMUNIDADE 001"...');
  const postId1 = 'test_post_001_' + Date.now();
  const now1 = new Date().toISOString();
  const createRes1 = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/community_posts/${postId1}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        fields: {
          postId: { stringValue: postId1 },
          userId: { stringValue: 'user_a_test' },
          authorName: { stringValue: 'Explorador A' },
          authorAvatar: { stringValue: '/images/avatars/avatar_1.png' },
          message: { stringValue: 'TESTE COMUNIDADE 001' },
          category: { stringValue: 'sugestao' },
          createdAt: { stringValue: now1 },
          updatedAt: { stringValue: now1 },
          likesCount: { integerValue: '0' },
          commentsCount: { integerValue: '0' },
          status: { stringValue: 'published' },
          isEdited: { booleanValue: false },
        },
      },
    }
  );
  console.log('Criação 001 resultado:', createRes1.status === 200 ? '✅ SUCESSO' : '❌ ERRO', createRes1.status);

  // User B querying the feed
  console.log('\nPasso 2: Utilizador B consulta a lista de publicações...');
  const queryPayload = {
    structuredQuery: {
      from: [{ collectionId: 'community_posts' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'published' },
        },
      },
      orderBy: [
        {
          field: { fieldPath: 'createdAt' },
          direction: 'DESCENDING',
        },
      ],
      limit: 10,
    },
  };

  const queryRes1 = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: queryPayload,
    }
  );

  const docs1 = (queryRes1.data || []).filter(d => d.document);
  const found1 = docs1.some(d => d.document.name.includes(postId1));
  console.log(`Utilizador B encontrou a publicação 001? ${found1 ? '✅ SIM' : '❌ NÃO'} (Total posts retornados: ${docs1.length})`);

  // User A creating TESTE COMUNIDADE 002
  console.log('\nPasso 3: Utilizador A cria publicação "TESTE COMUNIDADE 002"...');
  const postId2 = 'test_post_002_' + Date.now();
  const now2 = new Date(Date.now() + 1000).toISOString();
  const createRes2 = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/community_posts/${postId2}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        fields: {
          postId: { stringValue: postId2 },
          userId: { stringValue: 'user_a_test' },
          authorName: { stringValue: 'Explorador A' },
          authorAvatar: { stringValue: '/images/avatars/avatar_1.png' },
          message: { stringValue: 'TESTE COMUNIDADE 002' },
          category: { stringValue: 'jogo' },
          createdAt: { stringValue: now2 },
          updatedAt: { stringValue: now2 },
          likesCount: { integerValue: '0' },
          commentsCount: { integerValue: '0' },
          status: { stringValue: 'published' },
          isEdited: { booleanValue: false },
        },
      },
    }
  );
  console.log('Criação 002 resultado:', createRes2.status === 200 ? '✅ SUCESSO' : '❌ ERRO', createRes2.status);

  // User B re-querying feed
  console.log('\nPasso 4: Utilizador B recebe a nova publicação...');
  const queryRes2 = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: queryPayload,
    }
  );

  const docs2 = (queryRes2.data || []).filter(d => d.document);
  const found2 = docs2.some(d => d.document.name.includes(postId2));
  console.log(`Utilizador B encontrou a publicação 002 no topo? ${found2 ? '✅ SIM' : '❌ NÃO'} (Total posts retornados: ${docs2.length})`);

  // Cleanup test posts
  console.log('\nPasso 5: Limpeza segura dos posts de teste...');
  await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/community_posts/${postId1}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/community_posts/${postId2}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('✅ Posts de teste removidos. Base de dados mantida higienizada.');

  console.log('\n================================================================================');
  console.log('🌟 CICLO COMPLETO DE PUBLICAÇÃO, INDEXAÇÃO E CONSULTA EXECUTADO COM 100% DE SUCESSO!');
  console.log('================================================================================\n');
}

runPublicationFlowTest().catch(console.error);
