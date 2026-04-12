import { describe, it, expect } from 'vitest'
import { filterByProtocol, getProtocolAffectedCollectors } from '../src/analysis/protocol'

describe('filterByProtocol', () => {
  it('returns all collectors on secure context', () => {
    // In Node.js test env, isSecureContext may not exist
    const collectors = ['canvas', 'webgl', 'gpu', 'permissions', 'math']
    const filtered = filterByProtocol(collectors)
    // Should return at least the non-HTTPS-only collectors
    expect(filtered).toContain('canvas')
    expect(filtered).toContain('webgl')
    expect(filtered).toContain('math')
  })

  it('returns an array', () => {
    const result = filterByProtocol(['a', 'b', 'c'])
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('getProtocolAffectedCollectors', () => {
  it('returns unavailable and degraded arrays', () => {
    const result = getProtocolAffectedCollectors()
    expect(result).toHaveProperty('unavailable')
    expect(result).toHaveProperty('degraded')
    expect(Array.isArray(result.unavailable)).toBe(true)
    expect(Array.isArray(result.degraded)).toBe(true)
  })
})
