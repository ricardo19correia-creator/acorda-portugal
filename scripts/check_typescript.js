const ts = require('typescript')
const path = require('path')

const configPath = path.join(process.cwd(), 'tsconfig.json')
const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
if (configFile.error) {
  console.error('Error reading tsconfig.json:', configFile.error.messageText)
  process.exit(1)
}

const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  process.cwd()
)

parsedConfig.options.noEmit = true
parsedConfig.options.incremental = false
delete parsedConfig.options.tsBuildInfoFile

const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options)
const allDiagnostics = ts.getPreEmitDiagnostics(program)

if (allDiagnostics.length === 0) {
  console.log('✓ TypeScript check PASSED: 0 errors!')
  process.exit(0)
} else {
  console.log(`✗ TypeScript check FAILED with ${allDiagnostics.length} diagnostics:`)
  allDiagnostics.slice(0, 15).forEach((d) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, '\n')
    if (d.file) {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start)
      console.log(`${d.file.fileName} (${line + 1},${character + 1}): ${message}`)
    } else {
      console.log(message)
    }
  })
  process.exit(1)
}
