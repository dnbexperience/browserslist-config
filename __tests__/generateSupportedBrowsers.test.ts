import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { browsers } from '../generateSupportedBrowsers'
import browserslist from 'browserslist'
import { readFile, writeFile } from 'fs/promises'

// Mock external modules
vi.mock('fs/promises')
vi.mock('browserslist')
vi.mock('prettier')

describe('generateSupportedBrowsers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('browsers mapping', () => {
    it('should have correct browser name mappings', () => {
      const expectedMappings = {
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

      expect(browsers).toEqual(expectedMappings)
    })

    it('should correctly parse browserslist config format', async () => {
      vi.mock('../browserslist.cjs', () => [
        'chrome >= 109',
        'firefox >= 115',
        'edge >= 109',
        'safari >= 13.1',
        'ios_saf >= 13.1',
        'ChromeAndroid >= 106',
        'FirefoxAndroid >= 115',
        'samsung >= 17',
      ])

      // Mock browserslist to return expected browser identifiers
      vi.mocked(browserslist).mockImplementation((query) => {
        const [browser, version] = String(query).split(' >= ')
        switch (browser) {
          case 'chrome':
            return ['chrome 109']
          case 'firefox':
            return ['firefox 115']
          case 'edge':
            return ['edge 109']
          case 'safari':
            return ['safari 13.1']
          case 'iOS':
            return ['ios_saf 13.1']
          case 'ChromeAndroid':
            return ['and_chr 106']
          case 'FirefoxAndroid':
            return ['and_ff 115']
          case 'samsung':
            return ['samsung 17']
          case 'opera':
            return ['opera 17']
          default:
            return []
        }
      })

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await generateBrowsersFile()

      const writeFileCalls = vi.mocked(writeFile).mock.calls
      const writtenContent = writeFileCalls[0][1] as string

      // Extract the JSON content from the generated file
      const jsonContent = writtenContent
        .split('\n')
        .filter((line) => !line.startsWith('//'))
        .map((line) => {
          if (/[a-z]:/.test(line)) {
            line = line.trim().replace(/(.*):/, '"$1":')
          }
          return line.trim()
        })
        .join('')
        .replace('export default ', '')
        .replace(/,\}/g, '}')
        .replace('},];', '}]')

      const parsedContent = JSON.parse(jsonContent)

      expect(parsedContent).toEqual([
        { name: 'Chrome', minimumVersion: '109' },
        { name: 'Chrome Android', minimumVersion: '106' },
        { name: 'Edge', minimumVersion: '109' },
        { name: 'Firefox', minimumVersion: '115' },
        { name: 'Firefox Android', minimumVersion: '115' },
        { name: 'iOS Safari', minimumVersion: '13.1' },
        { name: 'Opera', minimumVersion: '95' },
        { name: 'Safari', minimumVersion: '13.1' },
        { name: 'Samsung Browser', minimumVersion: '17' },
      ])
    })

    it('should handle invalid browser queries', async () => {
      vi.mock('../browserslist.cjs', () => [
        'invalid >= 1.0',
        'chrome >= 109',
      ])

      // Mock browserslist responses
      vi.mocked(browserslist).mockImplementation((query) => {
        if (String(query).startsWith('invalid')) return []
        return ['chrome 109']
      })

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await generateBrowsersFile()

      const writeFileCalls = vi.mocked(writeFile).mock.calls
      const writtenContent = writeFileCalls[0][1] as string

      // Extract the JSON content from the generated file
      const jsonContent = writtenContent
        .split('\n')
        .filter((line) => !line.startsWith('//'))
        .map((line) => {
          if (/[a-z]:/.test(line)) {
            line = line.trim().replace(/(.*):/, '"$1":')
          }
          return line.trim()
        })
        .join('')
        .replace('export default ', '')
        .replace(/,\}/g, '}')
        .replace('},];', '}]')

      const parsedContent = JSON.parse(jsonContent)

      // Should only include valid browser entries
      expect(parsedContent).toEqual(
        expect.arrayContaining([{ name: 'Chrome', minimumVersion: '109' }])
      )
    })
  })

  describe('version calculation', () => {
    it('should correctly determine minimum version from multiple versions', async () => {
      vi.mocked(browserslist).mockImplementation((browser) => {
        const name = String(browser)?.split(' ')[0]

        switch (name) {
          case 'chrome':
            return ['chrome 111', 'chrome 109', 'chrome 110']
          case 'firefox':
            return ['firefox 117', 'firefox 115']
          case 'safari':
            return ['safari 16.5', 'safari 13.1']
          default:
            return []
        }
      })

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await generateBrowsersFile()

      const writeFileCalls = vi.mocked(writeFile).mock.calls
      const writtenContent = writeFileCalls[0][1] as string

      // Extract the JSON content from the generated file
      const jsonContent = writtenContent
        .split('\n')
        .filter((line) => !line.startsWith('//'))
        .map((line) => {
          if (/[a-z]:/.test(line)) {
            line = line.trim().replace(/(.*):/, '"$1":')
          }
          return line.trim()
        })
        .join('')
        .replace('export default ', '')
        .replace(/,\}/g, '}')
        .replace('},];', '}]')

      const parsedContent = JSON.parse(jsonContent)

      // Find browsers in the results
      const chrome = parsedContent.find((b: any) => b.name === 'Chrome')
      const firefox = parsedContent.find((b: any) => b.name === 'Firefox')
      const safari = parsedContent.find((b: any) => b.name === 'Safari')

      // Verify minimum versions
      expect(chrome.minimumVersion).toBe('109')
      expect(firefox.minimumVersion).toBe('115')
      expect(safari.minimumVersion).toBe('13.1')
    })

    it('should handle decimal version numbers correctly', async () => {
      vi.mocked(browserslist).mockImplementation((browser) => {
        const name = String(browser)?.split(' ')[0]

        switch (name) {
          case 'safari':
            return ['safari 16.5', 'safari 13.1']
          case 'iOS':
            return ['ios_saf 16.5', 'ios_saf 13.1']
          default:
            return []
        }
      })

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await generateBrowsersFile()

      const writeFileCalls = vi.mocked(writeFile).mock.calls
      const writtenContent = writeFileCalls[0][1] as string
      const jsonContent = writtenContent
        .split('\n')
        .filter((line) => !line.startsWith('//'))
        .map((line, i) => {
          if (/[a-z]:/.test(line)) {
            line = line.trim().replace(/(.*):/, '"$1":')
          }
          return line.trim()
        })
        .join('')
        .replace('export default ', '')
        .replace(/,\}/g, '}')
        .replace('},];', '}]')

      const parsedContent = JSON.parse(jsonContent)

      const safari = parsedContent.find((b: any) => b.name === 'Safari')
      const iosSafari = parsedContent.find(
        (b: any) => b.name === 'iOS Safari'
      )

      expect(safari.minimumVersion).toBe('13.1')
      expect(iosSafari.minimumVersion).toBe('13.1')
    })
  })

  describe('file generation', () => {
    it('should write to the correct output file', async () => {
      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await generateBrowsersFile()

      const writeFileCalls = vi.mocked(writeFile).mock.calls
      expect(writeFileCalls[0][0]).toMatch(/supportedBrowsers\.mjs$/)
    })

    it('should include auto-generated comment', async () => {
      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await generateBrowsersFile()

      const writeFileCalls = vi.mocked(writeFile).mock.calls
      const writtenContent = writeFileCalls[0][1] as string
      expect(writtenContent).toMatch(
        /\/\/ This file is auto-generated\. Do not edit directly\./
      )
    })

    it('should handle prettier config file not found', async () => {
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'))

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await expect(generateBrowsersFile()).rejects.toThrow(
        'File not found'
      )
    })
  })

  describe('error handling', () => {
    it('should handle browserslist errors', async () => {
      vi.mocked(browserslist).mockImplementation(() => {
        throw new Error('Invalid browserslist query')
      })

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await expect(generateBrowsersFile()).rejects.toThrow(
        'Invalid browserslist query'
      )
    })

    it('should handle file write errors', async () => {
      vi.mocked(writeFile).mockRejectedValue(new Error('Write failed'))

      const { generateBrowsersFile } = await import(
        '../generateSupportedBrowsers'
      )
      await expect(generateBrowsersFile()).rejects.toThrow('Write failed')
    })
  })

  describe('CLI execution', () => {
    it('should correctly identify when running from CLI', async () => {
      // Import the module
      const { isRunningFromCLI } = await import(
        '../generateSupportedBrowsers'
      )

      // When paths match
      expect(
        isRunningFromCLI('file:///path/to/script.js', '/path/to/script.js')
      ).toBe(true)

      // When paths don't match
      expect(
        isRunningFromCLI('file:///path/to/script.js', '/different/path.js')
      ).toBe(false)

      // When argv is empty
      expect(isRunningFromCLI('file:///path/to/script.js', '')).toBe(false)
    })
  })
})
