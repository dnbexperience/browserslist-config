import browserslist from 'browserslist'
import prettier from 'prettier'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { writeFile, readFile } from 'fs/promises'

export const browsers: Record<string, string> = {
  and_chr: 'Chrome Android',
  and_ff: 'Firefox Android',
  chrome: 'Chrome',
  edge: 'Edge',
  firefox: 'Firefox',
  ios_saf: 'iOS Safari',
  opera: 'Opera',
  safari: 'Safari',
  samsung: 'Samsung Browser',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)
const configPath = resolve(__dirname, './browserslist.cjs')
const browserslistConfig = require(configPath)

interface Browser {
  name: string
  minimumVersion: number
}

function getSupportedBrowsers(): Browser[] {
  return browserslistConfig
    .map((browser) => {
      const [, version] = browser.split(/\s*[>=<]+\s*/)
      const browserName = browserslist(browser)?.[0]?.split?.(' ')?.[0]

      return {
        name: browsers[browserName],
        minimumVersion: version,
      }
    })
    .sort((a, b) => a?.name?.localeCompare(b?.name))
}

export async function generateBrowsersFile() {
  const browsers = getSupportedBrowsers()

  const outputPath = resolve(__dirname, './supportedBrowsers.mjs')

  const content = `// This file is auto-generated. Do not edit directly.

export default ${JSON.stringify(browsers, null, 2)};
`

  // Read .prettierrc file
  const prettierConfigPath = resolve(process.cwd(), '.prettierrc')
  const prettierConfig = JSON.parse(
    (await readFile(prettierConfigPath, 'utf-8')) || '[]'
  )

  // Format the content using Prettier with .prettierrc config
  const formattedContent = await prettier.format(content, {
    ...prettierConfig,
    parser: 'babel',
    filepath: outputPath,
  })

  await writeFile(outputPath, formattedContent, 'utf-8')
}

// Exported for testing
export function isRunningFromCLI(
  importMetaUrl: string,
  processArgv1: string
): boolean {
  return importMetaUrl === `file://${processArgv1}`
}

// Only run when called directly from CLI
if (isRunningFromCLI(import.meta.url, process.argv[1])) {
  generateBrowsersFile().catch(console.error)
}
