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
  safari: 'Safari',
  samsung: 'Samsung Browser',
}

// Maps browserslist family names to esbuild/Vite target names.
// Families that share an engine are merged (e.g. ChromeAndroid → chrome).
// Samsung Browser has no esbuild equivalent and is omitted.
const esbuildTargetMap: Record<string, string> = {
  chrome: 'chrome',
  ChromeAndroid: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
  FirefoxAndroid: 'firefox',
  iOS: 'ios',
  safari: 'safari',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)
const configPath = resolve(__dirname, './browserslist.cjs')
const browserslistConfig = require(configPath)

export interface Browser {
  name: string
  minimumVersion: string
}

export function getSupportedBrowsers(): Browser[] {
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

export function getBuildTargets(): string[] {
  const targets: Record<string, string> = {}

  for (const entry of browserslistConfig) {
    const [family, version] = entry.split(/\s*[>=<]+\s*/)
    const target = esbuildTargetMap[family]
    if (!target) continue

    // When multiple families map to the same target (e.g. chrome + ChromeAndroid),
    // keep the lower version so the output is compatible with both.
    if (
      !targets[target] ||
      parseFloat(version) < parseFloat(targets[target])
    ) {
      targets[target] = version
    }
  }

  return Object.entries(targets)
    .map(([target, version]) => `${target}${version}`)
    .sort()
}

export async function generateBrowsersFile() {
  const browsers = getSupportedBrowsers()
  const buildTargets = getBuildTargets()

  // Read .prettierrc file
  const prettierConfigPath = resolve(process.cwd(), '.prettierrc')
  const prettierConfig = JSON.parse(
    (await readFile(prettierConfigPath, 'utf-8')) || '[]'
  )

  const formatAndWrite = async (filePath: string, raw: string) => {
    const formatted = await prettier.format(raw, {
      ...prettierConfig,
      parser: 'babel',
      filepath: filePath,
    })
    await writeFile(filePath, formatted, 'utf-8')
  }

  const supportedPath = resolve(__dirname, './supportedBrowsers.mjs')
  await formatAndWrite(
    supportedPath,
    `// This file is auto-generated. Do not edit directly.\n\nexport default ${JSON.stringify(browsers, null, 2)};\n`
  )

  const targetsPath = resolve(__dirname, './buildTargets.mjs')
  await formatAndWrite(
    targetsPath,
    `// This file is auto-generated. Do not edit directly.\n\nexport default ${JSON.stringify(buildTargets)};\n`
  )
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
