import { describe, it, expect } from 'vitest'
import { detectBot } from '../src/analysis/bot'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown): any {
  return { value, duration: 1, entropy: 5, stability: 0.8 }
}

describe('detectBot', () => {
  it('returns clean result without components', () => {
    const result = detectBot()
    expect(result).toHaveProperty('isBot')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('signals')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('detects webgl-missing as signal when components provided', () => {
    const components: FingerprintComponents = {
      webgl: comp(null),
    }
    const result = detectBot(components)
    expect(result.signals).toContain('webgl_missing')
  })

  it('detects audio-missing as signal when components provided', () => {
    const components: FingerprintComponents = {
      audio: comp(null),
    }
    const result = detectBot(components)
    expect(result.signals).toContain('audio_context_missing')
  })

  it('does not flag valid components', () => {
    const components: FingerprintComponents = {
      webgl: comp({ renderer: 'test' }),
      audio: comp({ sum: 123 }),
    }
    const result = detectBot(components)
    expect(result.signals).not.toContain('webgl_missing')
    expect(result.signals).not.toContain('audio_context_missing')
  })

  it('score is between 0 and 1', () => {
    const result = detectBot()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })
})
