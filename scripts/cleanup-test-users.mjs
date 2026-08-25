import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';

// E-mail e Nomes protegidos que NUNCA podem ser apagados
const PROTECTED_EMAILS = ['ricardo19correia@gmail.com'];
const PROTECTED_NAMES = ['Riky Moreira', 'riky moreira', 'ricardo correia', 'ricardo moreira'];
const PROJECT_ID = 'desafio-nacional-5fe71';

function isProtected(email = '', displayName = '', name = '') {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanDisplay = (displayName || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();

  return (
    PROTECTED_EMAILS.some((e) => cleanEmail.includes(e.toLowerCase())) ||
    PROTECTED_NAMES.some((n) => cleanDisplay.includes(n.toLowerCase()) || cleanName.includes(n.toLowerCase()))
  );
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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, status: res.statusCode, data: parsed });
          } else {
            resolve({ ok: false, status: res.statusCode, data: parsed, raw: data });
          }
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function requestWithRetry(url, options = {}, body = null, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await requestJson(url, options, body);
      return res;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.warn(`Aviso de rede, a tentar novamente (${i + 1}/${maxRetries})...`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function getAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Ficheiro de configuração do Firebase CLI não encontrado em: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const tokens = config.tokens;
  if (!tokens) {
    throw new Error('Nenhum token encontrado no ficheiro de configuração do Firebase CLI.');
  }

  return tokens.access_token;
}

async function cleanup() {
  console.log('🔄 A obter credenciais do Firebase CLI...');
  const accessToken = await getAccessToken();

  console.log('📡 A consultar todos os utilizadores no Firebase Authentication...');
  const authResponse = await requestWithRetry(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:batchGet?maxResults=1000`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!authResponse.ok) {
    throw new Error(`Erro ao consultar utilizadores Auth: ${authResponse.status} ${JSON.stringify(authResponse.data || authResponse.raw)}`);
  }

  const allUsers = authResponse.data?.users || [];
  console.log(`📋 Total de utilizadores encontrados no Firebase Auth: ${allUsers.length}`);

  const uidsToDelete = [];
  const protectedUsers = [];

  for (const u of allUsers) {
    const email = u.email || '';
    const displayName = u.displayName || '';

    if (isProtected(email, displayName)) {
      protectedUsers.push(u);
      console.log(`🛡️ [CONTA PRINCIPAL PROTEGIDA] ${displayName || 'Riky Moreira'} (${email}) - UID: ${u.localId}`);
    } else {
      uidsToDelete.push({
        uid: u.localId,
        displayName: displayName || 'Sem Nome',
        email: email || 'Sem Email',
      });
    }
  }

  console.log(`\n🎯 Contas de teste/bots a eliminar do Firebase Auth: ${uidsToDelete.length}`);

  // 1. Eliminar contas de teste no Firebase Auth
  let deletedAuthCount = 0;
  if (uidsToDelete.length > 0) {
    const batchSize = 50;
    for (let i = 0; i < uidsToDelete.length; i += batchSize) {
      const batch = uidsToDelete.slice(i, i + batchSize);
      const deleteResponse = await requestWithRetry(
        `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:batchDelete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
        {
          localIds: batch.map((item) => item.uid),
          force: true,
        }
      );

      if (deleteResponse.ok) {
        batch.forEach((item) => {
          console.log(`🗑️ [AUTH ELIMINADO] ${item.displayName} (${item.email}) - UID: ${item.uid}`);
          deletedAuthCount++;
        });
      } else {
        console.error(`❌ Erro ao apagar lote de utilizadores Auth:`, deleteResponse.data || deleteResponse.raw);
      }
    }
  }

  // 2. Eliminar documentos correspondentes no Firestore (coleções 'users' e 'publicProfiles')
  console.log('\n🔍 A verificar documentos no Firestore...');
  let deletedFirestoreCount = 0;

  const listDocs = async (collectionName) => {
    try {
      const resp = await requestWithRetry(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=300`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (resp.ok && resp.data?.documents) {
        return resp.data.documents;
      }
    } catch (e) {
      console.warn(`Aviso ao listar ${collectionName}:`, e.message);
    }
    return [];
  };

  const deleteFirestoreDoc = async (docPath) => {
    try {
      const resp = await requestWithRetry(
        `https://firestore.googleapis.com/v1/${docPath}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return resp.ok;
    } catch {
      return false;
    }
  };

  // Limpeza de 'users'
  const userDocs = await listDocs('users');
  console.log(`📋 Documentos encontrados em 'users': ${userDocs.length}`);
  for (const doc of userDocs) {
    const docName = doc.name; // projects/.../databases/(default)/documents/users/UID
    const uid = docName.split('/').pop();
    const fields = doc.fields || {};
    const email = fields.email?.stringValue || '';
    const name = fields.displayName?.stringValue || fields.name?.stringValue || '';

    if (isProtected(email, name) || protectedUsers.some((p) => p.localId === uid)) {
      console.log(`🛡️ [PROTEGIDO FIRESTORE users] ${name || 'Riky Moreira'} (${email}) - UID: ${uid}`);
      continue;
    }

    const success = await deleteFirestoreDoc(docName);
    if (success) {
      console.log(`🗑️ [FIRESTORE users ELIMINADO] ${name || 'Sem Nome'} (${email || uid})`);
      deletedFirestoreCount++;
    }
  }

  // Limpeza de 'publicProfiles'
  const publicDocs = await listDocs('publicProfiles');
  console.log(`📋 Documentos encontrados em 'publicProfiles': ${publicDocs.length}`);
  for (const doc of publicDocs) {
    const docName = doc.name;
    const uid = docName.split('/').pop();
    const fields = doc.fields || {};
    const email = fields.email?.stringValue || '';
    const name = fields.displayName?.stringValue || fields.name?.stringValue || '';

    if (isProtected(email, name) || protectedUsers.some((p) => p.localId === uid)) {
      console.log(`🛡️ [PROTEGIDO FIRESTORE publicProfiles] ${name || 'Riky Moreira'} (${email}) - UID: ${uid}`);
      continue;
    }

    const success = await deleteFirestoreDoc(docName);
    if (success) {
      console.log(`🗑️ [FIRESTORE publicProfiles ELIMINADO] ${name || 'Sem Nome'} (${email || uid})`);
      deletedFirestoreCount++;
    }
  }

  console.log('\n======================================================');
  console.log('✅ LIMPEZA DE CONTAS DE TESTE CONCLUÍDA COM SUCESSO!');
  console.log(`🔥 Contas eliminadas no Firebase Auth: ${deletedAuthCount}`);
  console.log(`📦 Documentos eliminados no Firestore: ${deletedFirestoreCount}`);
  console.log(`🛡️ Conta Principal do Riky Moreira (ricardo19correia@gmail.com) 100% PRESERVADA.`);
  console.log('======================================================\n');
}

cleanup().catch(console.error);
