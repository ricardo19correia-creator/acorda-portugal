const fs = require('fs');
const path = require('path');
const https = require('https');

const cfgPath = path.join(process.env.USERPROFILE, '.config', 'configstore', 'firebase-tools.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

async function getAccessToken() {
  const postData = new URLSearchParams({
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: cfg.tokens.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body).access_token));
    });
    req.write(postData);
    req.end();
  });
}

function listDocs(token, collection) {
  return new Promise((resolve) => {
    const url = 'https://firestore.googleapis.com/v1/projects/desafio-nacional-5fe71/databases/(default)/documents/' + collection + '?pageSize=100';
    const req = https.request(url, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.end();
  });
}

(async () => {
  const token = await getAccessToken();
  const usersRes = await listDocs(token, 'users');
  const pubRes = await listDocs(token, 'publicProfiles');

  const usersMap = new Map();
  for (const doc of (usersRes.documents || [])) {
    const uid = doc.name.split('/').pop();
    usersMap.set(uid, doc.fields);
  }

  const pubMap = new Map();
  for (const doc of (pubRes.documents || [])) {
    const uid = doc.name.split('/').pop();
    pubMap.set(uid, doc.fields);
  }

  console.log('Total users:', usersMap.size);
  console.log('Total publicProfiles:', pubMap.size);

  let discrepancies = 0;
  for (const [uid, uf] of usersMap.entries()) {
    const pf = pubMap.get(uid);
    const uName = uf?.displayName?.stringValue || uf?.username?.stringValue || uf?.email?.stringValue || '(no name)';
    const pName = pf?.displayName?.stringValue || pf?.username?.stringValue || '(missing in pub)';
    const uXp = parseInt(uf?.xp?.integerValue || '0', 10);
    const pXp = pf ? parseInt(pf?.xp?.integerValue || '0', 10) : null;

    if (!pf) {
      console.log('STILL MISSING IN PUBLIC:', uid, uName, 'XP:', uXp);
      discrepancies++;
    } else if (uXp !== pXp) {
      console.log('XP MISMATCH:', uid, uName, 'userXP:', uXp, 'pubXP:', pXp);
      discrepancies++;
    }
  }

  console.log('Discrepancies found:', discrepancies);

  const sorted = Array.from(pubMap.entries()).map(([uid, f]) => ({
    uid,
    name: f.displayName?.stringValue || f.username?.stringValue || 'Sem Nome',
    xp: parseInt(f.xp?.integerValue || '0', 10),
    level: parseInt(f.level?.integerValue || '1', 10),
    district: f.district?.stringValue || 'Portugal',
    games: parseInt(f.gamesPlayed?.integerValue || '0', 10)
  })).sort((a, b) => b.xp - a.xp);

  console.log('\nTop 15 in publicProfiles after reconciliation:');
  sorted.slice(0, 15).forEach((p, idx) => {
    console.log((idx + 1) + '. ' + p.name + ' | ' + p.xp + ' XP | Lvl ' + p.level + ' | ' + p.district + ' | ' + p.games + ' games');
  });
})();
