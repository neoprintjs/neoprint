import { describe, it, expect } from 'vitest'
import { computeStableId } from '../src/analysis/stable-id'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown, entropy = 5, stability = 0.9): any {
  return { value, duration: 1, entropy, stability }
}

describe('computeStableId', () => {
  it('returns a 32-char hex string', () => {
    const components: FingerprintComponents = {
      math: comp({ sin: 0.123, cos: 0.456 }),
      fonts: comp(['Arial', 'Helvetica']),
    }
    const result = computeStableId(components)
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })

  it('is deterministic', () => {
    const components: FingerprintComponents = {
      math: comp({ sin: 0.123 }),
      intl: comp({ locale: 'en' }),
    }
    expect(computeStableId(components)).toBe(computeStableId(components))
  })

  it('ignores non-stable collectors', () => {
    const base: FingerprintComponents = {
      math: comp({ val: 1 }),
    }
    const withVolatile: FingerprintComponents = {
      math: comp({ val: 1 }),
      screen: comp({ width: 1920 }),
      navigator: comp({ ua: 'test' }),
      network: comp({ rtt: 50 }),
    }
    // screen, navigator, network are not in STABLE_COLLECTORS
    expect(computeStableId(base)).toBe(computeStableId(withVolatile))
  })

  it('uses only stable collectors', () => {
    const components: FingerprintComponents = {
      math: comp({ val: 1 }),
      webgl: comp({ vendor: 'NVIDIA', renderer: 'RTX', maxTextureSize: 16384, params: {} }),
      fonts: comp(['Arial']),
      intl: comp({ locale: 'en' }),
      gpu: comp({ supported: true }),
      speech: comp([{ name: 'Voice', lang: 'en' }]),
      cssFeatures: comp(['grid', 'flex']),
    }
    const result = computeStableId(components)
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })

  it('skips null-value collectors', () => {
    const a: FingerprintComponents = { math: comp({ val: 1 }) }
    const b: FingerprintComponents = { math: comp({ val: 1 }), fonts: comp(null) }
    expect(computeStableId(a)).toBe(computeStableId(b))
  })

  it('strips volatile webgl fields (extensions)', () => {
    const c1: FingerprintComponents = {
      webgl: comp({ vendor: 'V', renderer: 'R', maxTextureSize: 8192, params: { x: 1 }, extensions: ['ext1'] }),
    }
    const c2: FingerprintComponents = {
      webgl: comp({ vendor: 'V', renderer: 'R', maxTextureSize: 8192, params: { x: 1 }, extensions: ['ext1', 'ext2'] }),
    }
    expect(computeStableId(c1)).toBe(computeStableId(c2))
  })
})
