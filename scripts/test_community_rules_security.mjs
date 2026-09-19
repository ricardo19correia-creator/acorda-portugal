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

async function runSecuritySuite() {
  console.log('================================================================================');
  console.log('🛡️  TESTE FORENSE DE SEGURANÇA E AUTORIZAÇÃO: COMUNIDADE ACORDA PORTUGAL');
  console.log('================================================================================\n');

  const token = getAccessToken();
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Verificar Rules Deployed
  console.log('--- 1. VERIFICAÇÃO DAS REGRAS NO FIREBASE ---');
  const releases = await requestJson(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const activeRelease = releases.data?.releases?.find(r => r.name.includes('cloud.firestore'));
  assert(activeRelease != null, `Release cloud.firestore ativa: ${activeRelease?.rulesetName}`);

  const ruleset = await requestJson(
    `https://firebaserules.googleapis.com/v1/${activeRelease.rulesetName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const rulesContent = ruleset.data?.source?.files?.[0]?.content || '';
  assert(rulesContent.includes('match /community_posts/{postId}'), 'Ruleset ativo contém match /community_posts/{postId}');
  assert(rulesContent.includes("resource.data.status == 'published'"), 'Ruleset ativo restringe leitura por status == published');
  assert(!rulesContent.includes('match /community_posts/{postId} {\n      allow read: if true;'), 'Ruleset ativo NÃO possui allow read: if true incondicional');

  // 2. Verificar Tentativa de Escrita Sem Autenticação (deve ser rejeitada)
  console.log('\n--- 2. TENTATIVA DE ESCRITA NÃO AUTENTICADA (DEVE FALHAR) ---');
  const unauthWrite = await requestJson(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/community_posts`,
    {
      method: 'POST',
      body: {
        fields: {
          message: { stringValue: 'Tentativa hacker não autenticada' },
          status: { stringValue: 'published' },
        },
      },
    }
  );
  assert(unauthWrite.status === 401 || unauthWrite.status === 403, `Escrita anónima rejeitada com status ${unauthWrite.status} (PERMISSION_DENIED / UNAUTHENTICATED)`);

  // 3. Verificar Leitura da Coleção
  console.log('\n--- 3. LEITURA E QUERY DA COMUNIDADE ---');
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

  const queryRes = await requestJson(
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

  if (queryRes.status === 200) {
    const docs = (queryRes.data || []).filter(d => d.document);
    assert(true, `Query estruturada executada com sucesso! Documentos retornados: ${docs.length}`);
  } else {
    console.log('Query status:', queryRes.status, JSON.stringify(queryRes.data));
    assert(false, `Query estruturada executada com sucesso`);
  }

  // 4. Verificação de Denúncias Privadas (Apenas Admin)
  console.log('\n--- 4. AUDITORIA DE PRIVACIDADE: COMMUNITY_REPORTS ---');
  assert(rulesContent.includes('match /community_reports/{reportId} {\n      allow read: if isAdmin();'), 'Denúncias restritas a administradores (allow read: if isAdmin())');

  console.log('\n================================================================================');
  console.log(`TOTAL TESTES: ${passed + failed} | SUCESSOS: ${passed} | FALHAS: ${failed}`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecuritySuite().catch(console.error);
