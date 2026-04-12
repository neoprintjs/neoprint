import { describe, it, expect } from 'vitest'
import { analyzeConfidence } from '../src/analysis/confidence'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown, entropy: number, stability: number): any {
  return { value, duration: 1, entropy, stability }
}

describe('analyzeConfidence', () => {
  it('returns 0 for empty components', () => {
    const result = analyzeConfidence({})
    expect(result.overall).toBe(0)
    expect(result.coverage).toBe(0)
  })

  it('returns 0 when all collectors fail', () => {
    const components: FingerprintComponents = {
      a: comp(null, 0, 0),
      b: comp(null, 0, 0),
    }
    const result = analyzeConfidence(components)
    expect(result.overall).toBe(0)
    expect(result.coverage).toBe(0)
  })

  it('returns high confidence for stable, high-entropy collectors', () => {
    const components: FingerprintComponents = {
      a: comp('val', 10, 0.95),
      b: comp('val', 8, 0.9),
      c: comp('val', 12, 0.85),
    }
    const result = analyzeConfidence(components)
    expect(result.overall).toBeGreaterThan(0.7)
    expect(result.coverage).toBe(1)
    expect(result.avgStability).toBeGreaterThan(0.8)
  })

  it('reduces confidence when some collectors fail', () => {
    const all: FingerprintComponents = {
      a: comp('val', 10, 0.9),
      b: comp('val', 8, 0.9),
    }
    const partial: FingerprintComponents = {
      a: comp('val', 10, 0.9),
      b: comp(null, 0, 0),
    }
    const allResult = analyzeConfidence(all)
    const partialResult = analyzeConfidence(partial)
    expect(partialResult.overall).toBeLessThan(allResult.overall)
    expect(partialResult.coverage).toBe(0.5)
  })

  it('provides per-collector breakdown', () => {
    const components: FingerprintComponents = {
      canvas: comp('data', 10, 0.85),
      webgl: comp(null, 0, 0),
    }
    const result = analyzeConfidence(components)
    expect(result.perCollector.canvas.contributed).toBe(true)
    expect(result.perCollector.webgl.contributed).toBe(false)
  })
})
