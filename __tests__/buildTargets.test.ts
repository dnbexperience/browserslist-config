import { describe, it, expect } from 'vitest'
import { getBuildTargets } from '../generateSupportedBrowsers'
import buildTargets from '../buildTargets.mjs'

describe('buildTargets', () => {
  it('should stay in sync with the generated build targets', () => {
    expect(buildTargets).toEqual(getBuildTargets())
  })

  it('should contain only valid esbuild target strings', () => {
    const validPrefixes = [
      'chrome',
      'edge',
      'firefox',
      'ios',
      'opera',
      'safari',
    ]

    buildTargets.forEach((target: string) => {
      const hasValidPrefix = validPrefixes.some((prefix) =>
        target.startsWith(prefix)
      )
      expect(hasValidPrefix).toBe(true)

      // After removing the prefix, the remainder should be a version number
      const prefix = validPrefixes.find((p) => target.startsWith(p))
      const version = target.slice(prefix!.length)
      expect(version).toMatch(/^\d+(\.\d+)?$/)
    })
  })

  it('should merge families that share an engine', () => {
    // chrome and ChromeAndroid should produce a single "chrome" target
    const chromeTargets = buildTargets.filter((t: string) =>
      t.startsWith('chrome')
    )
    expect(chromeTargets).toHaveLength(1)

    // firefox and FirefoxAndroid should produce a single "firefox" target
    const firefoxTargets = buildTargets.filter((t: string) =>
      t.startsWith('firefox')
    )
    expect(firefoxTargets).toHaveLength(1)
  })

  it('should not include samsung (no esbuild equivalent)', () => {
    const samsungTargets = buildTargets.filter((t: string) =>
      t.startsWith('samsung')
    )
    expect(samsungTargets).toHaveLength(0)
  })

  it('should be sorted alphabetically', () => {
    const sorted = [...buildTargets].sort()
    expect(buildTargets).toEqual(sorted)
  })
})
