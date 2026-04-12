import { describe, it, expect } from 'vitest'
import { compareFingerprints } from '../src/analysis/compare'
import type { Fingerprint } from '../src/types'

function makeFp(components: Record<string, unknown>): Fingerprint {
  const comps: any = {}
  for (const [key, value] of Object.entries(components)) {
    comps[key] = { value, duration: 1, entropy: 5, stability: 0.8 }
  }
  return {
    id: 'test',
    stableId: 'test',
    weightedId: 'test',
    crossBrowserId: 'test',
    confidence: 0.8,
    spoofingScore: 0,
    entropy: 50,
    components: comps,
    timestamp: Date.now(),
  }
}

describe('compareFingerprints', () => {
  it('returns score 1 for identical fingerprints', () => {
    const fp = makeFp({ a: 'hello', b: 42 })
    const result = compareFingerprints(fp, fp)
    expect(result.score).toBe(1)
    expect(result.diff).toHaveLength(0)
    expect(result.matching).toHaveLength(2)
  })

  it('returns score 0 for completely different fingerprints', () => {
    const fp1 = makeFp({ a: 'hello' })
    const fp2 = makeFp({ a: 'world' })
    const result = compareFingerprints(fp1, fp2)
    expect(result.score).toBe(0)
    expect(result.diff).toContain('a')
    expect(result.matching).toHaveLength(0)
  })

  it('calculates partial match correctly', () => {
    const fp1 = makeFp({ a: 'same', b: [1, 2, 3], c: 'same2' })
    const fp2 = makeFp({ a: 'same', b: [4, 5, 6], c: 'same2' })
    const result = compareFingerprints(fp1, fp2)
    expect(result.matching).toContain('a')
    expect(result.matching).toContain('c')
    expect(result.diff).toContain('b')
    expect(result.score).toBeCloseTo(2 / 3, 1)
  })

  it('handles missing collectors in one fingerprint', () => {
    const fp1 = makeFp({ a: 'val', b: 'val' })
    const fp2 = makeFp({ a: 'val' })
    const result = compareFingerprints(fp1, fp2)
    expect(result.diff).toContain('b')
    expect(result.score).toBeLessThan(1)
  })

  it('treats both-null as matching', () => {
    const fp1 = makeFp({ a: null })
    const fp2 = makeFp({ a: null })
    const result = compareFingerprints(fp1, fp2)
    expect(result.score).toBe(1)
    expect(result.matching).toContain('a')
  })
})
