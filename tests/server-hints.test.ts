import { describe, it, expect } from 'vitest'
import { getServerHints } from '../src/analysis/server-hints'
import type { Fingerprint } from '../src/types'

function makeFp(): Fingerprint {
  return {
    id: 'abc123',
    stableId: 'stable123',
    weightedId: 'weighted123',
    crossBrowserId: 'cross123',
    confidence: 0.85,
    spoofingScore: 0,
    entropy: 90,
    components: {
      navigator: {
        value: {
          platform: 'MacIntel',
          languages: ['en-US', 'pl'],
          hardwareConcurrency: 10,
          deviceMemory: 8,
          maxTouchPoints: 0,
        },
        duration: 1,
        entropy: 8,
        stability: 0.75,
      },
      timing: {
        value: { timezone: 'Europe/Warsaw' },
        duration: 1,
        entropy: 5,
        stability: 0.6,
      },
      canvas: {
        value: 'data:image/png;base64,abc',
        duration: 5,
        entropy: 10,
        stability: 0.85,
      },
    },
    timestamp: 1700000000000,
  }
}

describe('getServerHints', () => {
  it('returns correct structure', () => {
    const fp = makeFp()
    const hints = getServerHints(fp)

    expect(hints.fingerprintId).toBe('abc123')
    expect(hints.stableId).toBe('stable123')
    expect(hints.timestamp).toBe(1700000000000)
    expect(hints).toHaveProperty('protocol')
    expect(hints).toHaveProperty('collectorChecksums')
    expect(hints).toHaveProperty('expectedRanges')
    expect(hints).toHaveProperty('environment')
  })

  it('includes checksums for non-null collectors', () => {
    const fp = makeFp()
    const hints = getServerHints(fp)

    expect(hints.collectorChecksums.canvas).toBeTypeOf('number')
    expect(hints.collectorChecksums.navigator).toBeTypeOf('number')
    expect(hints.collectorChecksums.timing).toBeTypeOf('number')
  })

  it('extracts environment from navigator and timing', () => {
    const fp = makeFp()
    const hints = getServerHints(fp)

    expect(hints.environment.platform).toBe('MacIntel')
    expect(hints.environment.languages).toEqual(['en-US', 'pl'])
    expect(hints.environment.timezone).toBe('Europe/Warsaw')
    expect(hints.environment.cores).toBe(10)
    expect(hints.environment.memory).toBe(8)
    expect(hints.environment.touchPoints).toBe(0)
  })

  it('checksums are deterministic', () => {
    const fp = makeFp()
    const h1 = getServerHints(fp)
    const h2 = getServerHints(fp)

    expect(h1.collectorChecksums.canvas).toBe(h2.collectorChecksums.canvas)
  })

  it('different values produce different checksums', () => {
    const fp1 = makeFp()
    const fp2 = makeFp()
    fp2.components.canvas!.value = 'data:image/png;base64,xyz'

    const h1 = getServerHints(fp1)
    const h2 = getServerHints(fp2)

    expect(h1.collectorChecksums.canvas).not.toBe(h2.collectorChecksums.canvas)
  })
})
