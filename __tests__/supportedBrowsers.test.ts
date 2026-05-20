import { describe, it, expect } from 'vitest'
import { getSupportedBrowsers } from '../generateSupportedBrowsers'
import supportedBrowsers from '../supportedBrowsers.mjs'

describe('supportedBrowsers', () => {
  it('should stay in sync with the generated browser data', () => {
    expect(supportedBrowsers).toEqual(getSupportedBrowsers())
  })

  it('should have all browsers with required properties', () => {
    supportedBrowsers.forEach((browser) => {
      expect(browser).toHaveProperty('name')
      expect(browser).toHaveProperty('minimumVersion')
      expect(typeof browser.name).toBe('string')
      expect(typeof browser.minimumVersion).toBe('string')
    })
  })
})
