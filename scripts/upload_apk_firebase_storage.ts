import fs from 'fs'
import path from 'path'
import https from 'https'

async function uploadToFirebaseStorage() {
  const apkPath = path.join(process.cwd(), 'public', 'downloads', 'acorda-portugal-release.apk')
  if (!fs.existsSync(apkPath)) {
    console.error('APK file not found!')
    return
  }

  const fileBuffer = fs.readFileSync(apkPath)
  const bucketName = 'desafio-nacional-5fe71.firebasestorage.app'
  const objectName = encodeURIComponent('downloads/acorda-portugal-release.apk')
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?uploadType=media&name=${objectName}`

  console.log(`Uploading ${fileBuffer.length} bytes to Firebase Storage...`)

  return new Promise((resolve, reject) => {
    const req = https.request(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': fileBuffer.length,
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('Firebase Storage Upload Status:', res.statusCode)
        console.log('Response:', data)
        resolve({ statusCode: res.statusCode, data })
      })
    })

    req.on('error', (err) => {
      console.error('Upload error:', err)
      reject(err)
    })

    req.write(fileBuffer)
    req.end()
  })
}

uploadToFirebaseStorage()
