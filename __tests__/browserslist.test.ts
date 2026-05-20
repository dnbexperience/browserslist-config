import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'
import path from 'path'
import browserslist from 'browserslist'

const require = createRequire(import.meta.url)
const configPath = path.resolve(__dirname, '../browserslist.cjs')
const browserslistConfig = require(configPath).join(', ')

describe('Browserslist', () => {
  const config = browserslist(browserslistConfig)

  it('should resolve the configured browser minimums', () => {
    expect(config).toContain('chrome 109')
    expect(config).toContain('firefox 115')
    expect(config).toContain('edge 109')
    expect(config).toContain('opera 95')
    expect(config).toContain('safari 13.1')
    expect(config).toContain('ios_saf 13.0-13.1')
    expect(config).toContain('samsung 17.0')
  })
})
