import https from 'https'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

function getFileSha256(filePath: string): string {
  const buf = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(buf).digest('hex')
}

async function checkUrl(url: string): Promise<{ statusCode: number, headers: any, byteLength?: number, contentType?: string }> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let byteLength = 0
      res.on('data', (chunk) => {
        byteLength += chunk.length
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          byteLength,
          contentType: res.headers['content-type']
        })
      })
    }).on('error', (err) => {
      resolve({
        statusCode: 0,
        headers: {},
        byteLength: 0,
        contentType: err.message
      })
    })
  })
}

async function main() {
  console.log('--- TESTANDO URLS DE PRODUCAO (https://acordaportugal.pt) ---')
  const downloadPageRes = await checkUrl('https://acordaportugal.pt/download')
  console.log('GET /download -> Status:', downloadPageRes.statusCode, 'Content-Type:', downloadPageRes.contentType)

  const apkRes = await checkUrl('https://acordaportugal.pt/downloads/acorda-portugal-release.apk')
  console.log('GET /downloads/acorda-portugal-release.apk -> Status:', apkRes.statusCode, 'Content-Type:', apkRes.contentType, 'Bytes:', apkRes.byteLength)

  console.log('\n--- VERIFICANDO FICHEIROS LOCAIS ---')
  const localApkBuild = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
  const localApkWeb = path.join(process.cwd(), 'public', 'downloads', 'acorda-portugal-release.apk')

  const buildExists = fs.existsSync(localApkBuild)
  const webExists = fs.existsSync(localApkWeb)

  console.log('Local APK Build exists:', buildExists)
  console.log('Local APK Web exists:', webExists)

  if (buildExists && webExists) {
    const buildSize = fs.statSync(localApkBuild).size
    const webSize = fs.statSync(localApkWeb).size
    const buildHash = getFileSha256(localApkBuild)
    const webHash = getFileSha256(localApkWeb)
    console.log('Build APK Size:', (buildSize / (1024 * 1024)).toFixed(2), 'MB (', buildSize, 'bytes )')
    console.log('Web APK Size:', (webSize / (1024 * 1024)).toFixed(2), 'MB (', webSize, 'bytes )')
    console.log('Build SHA-256:', buildHash)
    console.log('Web SHA-256:', webHash)
    console.log('Hashes Match:', buildHash === webHash)
  }
}

main()
