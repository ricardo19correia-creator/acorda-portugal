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
      res.on('end', () => {
        const data = JSON.parse(body);
        if (data.access_token) resolve(data.access_token);
        else reject(new Error('Failed to get token: ' + body));
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function patchDoc(token, collection, docId, fields, maskFields) {
  return new Promise((resolve, reject) => {
    const queryParams = maskFields.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/desafio-nacional-5fe71/databases/(default)/documents/${collection}/${docId}?${queryParams}`;
    const payload = JSON.stringify({ fields });

    const req = https.request(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`PATCH ${collection}/${docId} failed (${res.statusCode}): ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getDoc(token, collection, docId) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/desafio-nacional-5fe71/databases/(default)/documents/${collection}/${docId}`;
    const req = https.request(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(body) });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Authenticating with Google OAuth...');
  const token = await getAccessToken();
  console.log('Authentication successful.');

  // 1. Diana.M (5z4Up3z8Nlf3xBXOzh1g4Njv4a63): 669 XP, level 1, 2 games, 7 correct
  console.log('\n--- Reconciling Diana.M ---');
  await patchDoc(token, 'users', '5z4Up3z8Nlf3xBXOzh1g4Njv4a63', {
    xp: { integerValue: '669' },
    level: { integerValue: '1' },
    correctAnswers: { integerValue: '7' }
  }, ['xp', 'level', 'correctAnswers']);
  console.log('Diana.M users document patched: xp=669, level=1, correctAnswers=7');

  await patchDoc(token, 'publicProfiles', '5z4Up3z8Nlf3xBXOzh1g4Njv4a63', {
    xp: { integerValue: '669' },
    level: { integerValue: '1' },
    gamesPlayed: { integerValue: '2' },
    correctAnswers: { integerValue: '7' }
  }, ['xp', 'level', 'gamesPlayed', 'correctAnswers']);
  console.log('Diana.M publicProfiles document patched: xp=669, level=1, gamesPlayed=2, correctAnswers=7');

  // 2. Johny 94 (gQ5gC3bTzAYmZ4qpMP5YRAq92K12): 3527 XP, level 2, 4 games, 23 correct
  console.log('\n--- Reconciling Johny 94 ---');
  await patchDoc(token, 'users', 'gQ5gC3bTzAYmZ4qpMP5YRAq92K12', {
    xp: { integerValue: '3527' },
    level: { integerValue: '2' },
    correctAnswers: { integerValue: '23' }
  }, ['xp', 'level', 'correctAnswers']);
  console.log('Johny 94 users document patched: xp=3527, level=2, correctAnswers=23');

  await patchDoc(token, 'publicProfiles', 'gQ5gC3bTzAYmZ4qpMP5YRAq92K12', {
    xp: { integerValue: '3527' },
    level: { integerValue: '2' },
    gamesPlayed: { integerValue: '4' },
    correctAnswers: { integerValue: '23' }
  }, ['xp', 'level', 'gamesPlayed', 'correctAnswers']);
  console.log('Johny 94 publicProfiles document patched: xp=3527, level=2, gamesPlayed=4, correctAnswers=23');

  // 3. PuTiNy-93 (LNw24Ezg6yVPlFrQEGhjn4sdTj52): Create in publicProfiles with 4168 XP, level 2
  console.log('\n--- Reconciling PuTiNy-93 ---');
  const putinyUser = await getDoc(token, 'users', 'LNw24Ezg6yVPlFrQEGhjn4sdTj52');
  const uFields = putinyUser.data.fields;
  const putinyAvatar = uFields.avatar?.stringValue || 'avatares/nortenha.png';
  const putinyDistrict = uFields.district?.stringValue || 'Vila Real';
  const putinyUsername = uFields.username?.stringValue || 'PuTiNy-93';
  const putinyDisplayName = uFields.displayName?.stringValue || 'PuTiNy-93';

  await patchDoc(token, 'publicProfiles', 'LNw24Ezg6yVPlFrQEGhjn4sdTj52', {
    displayName: { stringValue: putinyDisplayName },
    username: { stringValue: putinyUsername },
    avatar: { stringValue: putinyAvatar },
    district: { stringValue: putinyDistrict },
    xp: { integerValue: '4168' },
    level: { integerValue: '2' },
    gamesPlayed: { integerValue: '12' },
    correctAnswers: { integerValue: '92' },
    winRate: { integerValue: '100' },
    updatedAt: { timestampValue: new Date().toISOString() }
  }, ['displayName', 'username', 'avatar', 'district', 'xp', 'level', 'gamesPlayed', 'correctAnswers', 'winRate', 'updatedAt']);
  console.log('PuTiNy-93 publicProfiles document created/patched: xp=4168, level=2, gamesPlayed=12');

  await patchDoc(token, 'users', 'LNw24Ezg6yVPlFrQEGhjn4sdTj52', {
    level: { integerValue: '2' }
  }, ['level']);
  console.log('PuTiNy-93 users level aligned to 2');

  console.log('\n✅ All database reconciliations executed successfully!');
}

main().catch(err => {
  console.error('Reconciliation error:', err);
  process.exit(1);
});
