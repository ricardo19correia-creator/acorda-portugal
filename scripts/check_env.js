const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);
const keys = Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('VERCEL') || k.includes('GOOGLE'));
console.log('Detected Env Keys:', keys);
for (const k of keys) {
  if (k.includes('KEY') || k.includes('TOKEN')) {
    console.log(k, '=> [SET, length: ' + (process.env[k] ? process.env[k].length : 0) + ']');
  } else {
    console.log(k, '=>', process.env[k]);
  }
}
