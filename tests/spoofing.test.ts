import { describe, it, expect } from 'vitest'
import { detectSpoofing } from '../src/analysis/inconsistency'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown): any {
  return { value, duration: 1, entropy: 5, stability: 0.8 }
}

describe('detectSpoofing', () => {
  it('returns clean result for consistent signals', () => {
    const components: FingerprintComponents = {
      navigator: comp({ platform: 'MacIntel', userAgent: 'Macintosh; Intel Mac OS X', webdriver: false, hardwareConcurrency: 10, deviceMemory: 8 }),
      webgl: comp({ vendor: 'Apple', renderer: 'Apple GPU' }),
      screen: comp({ width: 1920, height: 1080, touchPoints: 0 }),
    }
    const result = detectSpoofing(components)
    expect(result.isLikely).toBe(false)
    expect(result.score).toBe(0)
    expect(result.signals).toHaveLength(0)
  })

  it('detects platform vs UA mismatch', () => {
    const components: FingerprintComponents = {
      navigator: comp({ platform: 'MacIntel', userAgent: 'Windows NT 10.0', webdriver: false }),
    }
    const result = detectSpoofing(components)
    expect(result.signals).toContain('platform_ua_mismatch')
  })

  it('detects webdriver', () => {
    const components: FingerprintComponents = {
      navigator: comp({ webdriver: true }),
    }
    const result = detectSpoofing(components)
    expect(result.signals).toContain('webdriver_detected')
  })

  it('detects memory/concurrency mismatch', () => {
    const components: FingerprintComponents = {
      navigator: comp({ hardwareConcurrency: 16, deviceMemory: 2 }),
    }
    const result = detectSpoofing(components)
    expect(result.signals).toContain('memory_concurrency_mismatch')
  })

  it('detects canvas blocked but webgl works', () => {
    const components: FingerprintComponents = {
      canvas: comp(null),
      webgl: comp({ renderer: 'test' }),
    }
    const result = detectSpoofing(components)
    expect(result.signals).toContain('canvas_blocked')
  })

  it('calculates score based on signal count', () => {
    const components: FingerprintComponents = {
      navigator: comp({ platform: 'MacIntel', userAgent: 'Windows NT', webdriver: true, hardwareConcurrency: 16, deviceMemory: 2 }),
    }
    const result = detectSpoofing(components)
    expect(result.score).toBeGreaterThan(0)
    expect(result.signals.length).toBeGreaterThanOrEqual(2)
  })
})
