const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'desafio-nacional-5fe71';

async function testRest() {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`;
  console.log('Fetching Firestore REST API:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Result:', data);
  } catch (err) {
    console.error('REST Error:', err);
  }
}

testRest();
