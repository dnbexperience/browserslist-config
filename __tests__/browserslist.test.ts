import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'
import path from 'path'
import browserslist from 'browserslist'

const require = createRequire(import.meta.url)
const configPath = path.resolve(__dirname, '../browserslist.cjs')
const browserslistConfigEntries = require(configPath)
const browserslistConfig = browserslistConfigEntries.join(', ')

describe('Browserslist', () => {
  const config = browserslist(browserslistConfig)

  it('should keep the configured lower browser versions', () => {
    expect(browserslistConfigEntries).toEqual([
      'chrome >= 109',
      'firefox >= 115',
      'edge >= 109',
      'safari >= 14.1',
      'ChromeAndroid >= 109',
      'FirefoxAndroid >= 115',
      'samsung >= 21',
      'iOS >= 14.5',
    ])
  })

  it('should resolve browsers for the configured families', () => {
    expect(config).toContain('chrome 109')
    expect(config).toContain('firefox 115')
    expect(config).toContain('edge 109')
    expect(config.some((browser) => browser.startsWith('and_chr '))).toBe(
      true
    )
    expect(config.some((browser) => browser.startsWith('and_ff '))).toBe(
      true
    )
    expect(config.some((browser) => browser.startsWith('safari '))).toBe(
      true
    )
    expect(config.some((browser) => browser.startsWith('ios_saf '))).toBe(
      true
    )
    expect(config.some((browser) => browser.startsWith('samsung '))).toBe(
      true
    )
  })
})
