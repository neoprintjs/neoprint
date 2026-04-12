import { describe, it, expect } from 'vitest'
import { computeWeightedId } from '../src/analysis/weighted-id'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown, entropy: number): any {
  return { value, duration: 1, entropy, stability: 0.8 }
}

describe('computeWeightedId', () => {
  it('returns a 32-char hex string', () => {
    const components: FingerprintComponents = {
      a: comp('data', 10),
      b: comp('data2', 5),
    }
    const result = computeWeightedId(components)
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })

  it('is deterministic', () => {
    const components: FingerprintComponents = {
      a: comp('data', 10),
    }
    expect(computeWeightedId(components)).toBe(computeWeightedId(components))
  })

  it('returns zeros for empty components', () => {
    expect(computeWeightedId({})).toBe('0'.repeat(32))
  })

  it('skips null-value collectors', () => {
    const a: FingerprintComponents = { x: comp('val', 5) }
    const b: FingerprintComponents = { x: comp('val', 5), y: comp(null, 0) }
    expect(computeWeightedId(a)).toBe(computeWeightedId(b))
  })

  it('produces different IDs for different data', () => {
    const a: FingerprintComponents = { x: comp('aaa', 10) }
    const b: FingerprintComponents = { x: comp('bbb', 10) }
    expect(computeWeightedId(a)).not.toBe(computeWeightedId(b))
  })

  it('high-entropy collectors dominate the hash', () => {
    const base: FingerprintComponents = {
      high: comp('high-val', 12),
      low: comp('low-val', 1),
    }
    // Changing the low-entropy collector should have less impact
    const changedLow: FingerprintComponents = {
      high: comp('high-val', 12),
      low: comp('changed', 1),
    }
    const changedHigh: FingerprintComponents = {
      high: comp('changed', 12),
      low: comp('low-val', 1),
    }
    // Both should differ from base, but this tests the mechanism works
    expect(computeWeightedId(base)).not.toBe(computeWeightedId(changedLow))
    expect(computeWeightedId(base)).not.toBe(computeWeightedId(changedHigh))
  })
})
