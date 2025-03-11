import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('package.json', () => {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
  )

  it('should require Node.js version >= 18', () => {
    expect(packageJson.engines.node).toBe('>=18')
  })
})
