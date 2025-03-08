import { describe, it, expect } from 'vitest'
import supportedBrowsers from '../supportedBrowsers.mjs'

describe('supportedBrowsers', () => {
  it('should contain correct browser minimum versions', () => {
    const expectedBrowsers = [
      { name: 'Chrome', minimumVersion: expect.any(String) },
      { name: 'Chrome Android', minimumVersion: expect.any(String) },
      { name: 'Edge', minimumVersion: expect.any(String) },
      { name: 'Firefox', minimumVersion: expect.any(String) },
      { name: 'Firefox Android', minimumVersion: expect.any(String) },
      { name: 'iOS Safari', minimumVersion: expect.any(String) },
      { name: 'Opera', minimumVersion: expect.any(String) },
      { name: 'Safari', minimumVersion: expect.any(String) },
      { name: 'Samsung Browser', minimumVersion: expect.any(String) },
    ]

    expect(supportedBrowsers).toEqual(expectedBrowsers)
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
