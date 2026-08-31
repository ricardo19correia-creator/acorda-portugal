import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const javaHome = 'C:\\Program Files\\Android\\Android Studio\\jbr'
const androidDir = path.resolve('android')

console.log('A executar assembleRelease no Android...')

try {
  const result = execSync('gradlew.bat assembleRelease', {
    cwd: androidDir,
    env: {
      ...process.env,
      JAVA_HOME: javaHome,
      PATH: `${javaHome}\\bin;${process.env.PATH}`,
    },
    encoding: 'utf-8',
    stdio: 'inherit',
  })
  console.log('assembleRelease concluído com sucesso!')

  const apkSource = path.resolve('android/app/build/outputs/apk/release/app-release.apk')
  const apkDest = path.resolve('downloads/acorda-portugal-release.apk')
  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkDest)
    const stats = fs.statSync(apkDest)
    console.log(`Copiado para downloads/acorda-portugal-release.apk (${stats.size} bytes / ${(stats.size / (1024 * 1024)).toFixed(2)} MB)`)
  }
} catch (err) {
  console.error('Erro no assembleRelease:', err)
  process.exit(1)
}
