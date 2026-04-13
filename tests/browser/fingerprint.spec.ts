import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CJS_BUNDLE = path.resolve(__dirname, '../../dist/index.cjs')

async function setup(page: any) {
  await page.goto('about:blank')

  // Inject CJS bundle with a shim: create exports object, load bundle, expose on window
  const bundleCode = fs.readFileSync(CJS_BUNDLE, 'utf-8')
  await page.evaluate((code: string) => {
    const exports: any = {};
    const module = { exports };
    new Function('exports', 'module', code)(exports, module);
    (window as any).__np = module.exports.default || module.exports
  }, bundleCode)
}

test.describe('neoprint.get()', () => {
  test('returns a valid fingerprint object', async ({ page }) => {
    await setup(page)
    const fp = await page.evaluate(async () => (window as any).__np.get())

    expect(fp.id).toMatch(/^[0-9a-f]{32}$/)
    expect(fp.stableId).toMatch(/^[0-9a-f]{32}$/)
    expect(fp.weightedId).toMatch(/^[0-9a-f]{32}$/)
    expect(fp.crossBrowserId).toMatch(/^[0-9a-f]{32}$/)
    expect(fp.confidence).toBeGreaterThan(0)
    expect(fp.confidence).toBeLessThanOrEqual(1)
    expect(fp.entropy).toBeGreaterThan(0)
    expect(fp.timestamp).toBeGreaterThan(0)
  })

  test('produces deterministic stable and cross-browser IDs', async ({ page }) => {
    await setup(page)
    const ids = await page.evaluate(async () => {
      const np = (window as any).__np
      const a = await np.get()
      const b = await np.get()
      return { s1: a.stableId, s2: b.stableId, c1: a.crossBrowserId, c2: b.crossBrowserId }
    })

    expect(ids.s1).toBe(ids.s2)
    expect(ids.c1).toBe(ids.c2)
  })

  test('collects 15+ collectors', async ({ page }) => {
    await setup(page)
    const count = await page.evaluate(async () => {
      return Object.keys((await (window as any).__np.get()).components).length
    })

    expect(count).toBeGreaterThanOrEqual(15)
  })

  test('each collector has correct shape', async ({ page }) => {
    await setup(page)
    const issues = await page.evaluate(async () => {
      const fp = await (window as any).__np.get()
      const issues: string[] = []
      for (const [name, comp] of Object.entries(fp.components) as any) {
        if (typeof comp.duration !== 'number') issues.push(`${name}: no duration`)
        if (typeof comp.entropy !== 'number') issues.push(`${name}: no entropy`)
        if (typeof comp.stability !== 'number') issues.push(`${name}: no stability`)
      }
      return issues
    })

    expect(issues).toEqual([])
  })

  test('privacy mode excludes invasive collectors', async ({ page }) => {
    await setup(page)
    const names = await page.evaluate(async () => {
      return Object.keys((await (window as any).__np.get({ mode: 'privacy' })).components)
    })

    expect(names).not.toContain('canvas')
    expect(names).not.toContain('webgl')
    expect(names).not.toContain('audio')
    expect(names).toContain('math')
  })

  test('selective collectors', async ({ page }) => {
    await setup(page)
    const names = await page.evaluate(async () => {
      return Object.keys((await (window as any).__np.get({ collectors: ['math', 'screen'] })).components)
    })

    expect(names).toEqual(['math', 'screen'])
  })
})

test.describe('neoprint.compare()', () => {
  test('identical fingerprints score 1.0', async ({ page }) => {
    await setup(page)
    const score = await page.evaluate(async () => {
      const np = (window as any).__np
      const fp = await np.get()
      return np.compare(fp, fp).score
    })

    expect(score).toBe(1)
  })
})

test.describe('neoprint.detectBot()', () => {
  test('returns valid result', async ({ page }) => {
    await setup(page)
    const result = await page.evaluate(async () => {
      const np = (window as any).__np
      return np.detectBot(await np.get())
    })

    expect(result).toHaveProperty('isBot')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('signals')
  })
})

test.describe('neoprint.environment()', () => {
  test('returns environment info', async ({ page }) => {
    await setup(page)
    const env = await page.evaluate(async () => (window as any).__np.environment())

    expect(env.type).toBeTruthy()
    expect(env.os.name).toBeTruthy()
    expect(env.browser.name).toBeTruthy()
    expect(env).toHaveProperty('privacy')
  })
})

test.describe('neoprint.attestDevice()', () => {
  test('returns attestation with verifiable token', async ({ page }) => {
    await setup(page)
    const result = await page.evaluate(async () => {
      const np = (window as any).__np
      const fp = await np.get()
      const attest = await np.attestDevice(fp, { strictness: 'low', challenge: 'test-nonce' })
      const verified = np.verifyIntegrityToken(attest.integrityToken)
      return { score: attest.score, factors: attest.factors.length, verified }
    })

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
    expect(result.factors).toBeGreaterThan(0)
    expect(result.verified.valid).toBe(true)
    expect(result.verified.payload.ch).toBe('test-nonce')
  })
})

test.describe('neoprint.benchmark()', () => {
  test('returns timing data', async ({ page }) => {
    await setup(page)
    const result = await page.evaluate(async () => (window as any).__np.benchmark())

    expect(result.total).toBeGreaterThan(0)
    expect(Object.keys(result).length).toBeGreaterThan(5)
  })
})

test.describe('neoprint.export/import()', () => {
  test('roundtrips fingerprint', async ({ page }) => {
    await setup(page)
    const match = await page.evaluate(async () => {
      const np = (window as any).__np
      const fp = await np.get()
      return np.import(np.export(fp)).id === fp.id
    })

    expect(match).toBe(true)
  })
})
