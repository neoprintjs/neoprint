import { describe, it, expect } from 'vitest'
import { analyzeEntropy } from '../src/analysis/entropy'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown, entropy: number): any {
  return { value, duration: 1, entropy, stability: 0.8 }
}

describe('analyzeEntropy', () => {
  it('returns 0 for empty components', () => {
    const result = analyzeEntropy({})
    expect(result.total).toBe(0)
    expect(result.topContributors).toHaveLength(0)
  })

  it('sums entropy from all valid collectors', () => {
    const components: FingerprintComponents = {
      a: comp('val', 10),
      b: comp('val', 8),
      c: comp('val', 6),
    }
    const result = analyzeEntropy(components)
    expect(result.total).toBe(24)
  })

  it('skips null-value collectors', () => {
    const components: FingerprintComponents = {
      a: comp('val', 10),
      b: comp(null, 0),
    }
    const result = analyzeEntropy(components)
    expect(result.total).toBe(10)
  })

  it('ranks top contributors by entropy descending', () => {
    const components: FingerprintComponents = {
      low: comp('val', 2),
      high: comp('val', 12),
      mid: comp('val', 7),
    }
    const result = analyzeEntropy(components)
    expect(result.topContributors[0]!.name).toBe('high')
    expect(result.topContributors[1]!.name).toBe('mid')
    expect(result.topContributors[2]!.name).toBe('low')
  })

  it('provides per-collector breakdown', () => {
    const components: FingerprintComponents = {
      canvas: comp('data', 10),
      math: comp('data', 6),
    }
    const result = analyzeEntropy(components)
    expect(result.perCollector.canvas).toBe(10)
    expect(result.perCollector.math).toBe(6)
  })
})
