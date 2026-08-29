import http from 'http'
import { spawn } from 'child_process'
import path from 'path'

async function fetchUrl(port: number, pathName: string): Promise<{ statusCode: number, headers: http.IncomingHttpHeaders, byteLength: number }> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${pathName}`, (res) => {
      let byteLength = 0
      res.on('data', (chunk) => {
        byteLength += chunk.length
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          byteLength
        })
      })
    }).on('error', reject)
  })
}

async function main() {
  console.log('--- INICIANDO SERVIDOR LOCAL NEXT.JS (PORTA 3088) ---')
  const PORT = 3088
  const serverProcess = spawn('npx', ['next', 'start', '-p', PORT.toString()], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe'
  })

  let isReady = false
  serverProcess.stdout.on('data', (data) => {
    const text = data.toString()
    if (text.includes('Ready') || text.includes('started') || text.includes('3088') || text.includes('http')) {
      isReady = true
    }
  })

  // Aguardar até 8 segundos pelo servidor
  for (let i = 0; i < 16; i++) {
    await new Promise((r) => setTimeout(r, 500))
    if (isReady) break
  }

  try {
    console.log('\n1. Testando GET /download ...')
    const pageRes = await fetchUrl(PORT, '/download')
    console.log('   Status Code:', pageRes.statusCode)
    console.log('   Content-Type:', pageRes.headers['content-type'])
    console.log('   Page Size:', pageRes.byteLength, 'bytes')

    console.log('\n2. Testando GET /downloads/acorda-portugal-release.apk ...')
    const apkRes = await fetchUrl(PORT, '/downloads/acorda-portugal-release.apk')
    console.log('   Status Code:', apkRes.statusCode)
    console.log('   Content-Type:', apkRes.headers['content-type'])
    console.log('   Content-Disposition:', apkRes.headers['content-disposition'])
    console.log('   APK Stream Size:', (apkRes.byteLength / (1024 * 1024)).toFixed(2), 'MB (', apkRes.byteLength, 'bytes )')

    const success = pageRes.statusCode === 200 && apkRes.statusCode === 200 && apkRes.byteLength === 130450034
    console.log('\n3. RESULTADO DO TESTE DE SERVIDOR LOCAL:', success ? 'PASS' : 'FAIL')
  } catch (err: any) {
    console.error('Erro no teste:', err.message)
  } finally {
    serverProcess.kill()
  }
}

main()
