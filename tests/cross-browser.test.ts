import { describe, it, expect } from 'vitest'
import { computeCrossBrowserId } from '../src/analysis/cross-browser'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown, entropy = 5, stability = 0.8): any {
  return { value, duration: 1, entropy, stability }
}

describe('computeCrossBrowserId', () => {
  it('returns a 32-char hex string', () => {
    const result = computeCrossBrowserId({
      math: comp({ sin: 0.123, cos: 0.456 }),
    })
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })

  it('is deterministic', () => {
    const components: FingerprintComponents = {
      math: comp({ sin: 0.1 }),
      screen: comp({ width: 1920, height: 1080, devicePixelRatio: 2 }),
    }
    expect(computeCrossBrowserId(components)).toBe(computeCrossBrowserId(components))
  })

  describe('GPU normalization', () => {
    it('normalizes ANGLE vendor strings', () => {
      const chrome: FingerprintComponents = {
        webgl: comp({ vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)', maxTextureSize: 16384 }),
      }
      const safari: FingerprintComponents = {
        webgl: comp({ vendor: 'Apple Inc.', renderer: 'Apple M4', maxTextureSize: 16384 }),
      }
      // Both should extract "Apple" as vendor and "Apple M4" as renderer
      expect(computeCrossBrowserId(chrome)).toBe(computeCrossBrowserId(safari))
    })

    it('normalizes vendor suffix (Inc., Corporation)', () => {
      const a: FingerprintComponents = {
        webgl: comp({ vendor: 'Apple Inc.', renderer: 'Apple GPU', maxTextureSize: 8192 }),
      }
      const b: FingerprintComponents = {
        webgl: comp({ vendor: 'Apple', renderer: 'Apple GPU', maxTextureSize: 8192 }),
      }
      expect(computeCrossBrowserId(a)).toBe(computeCrossBrowserId(b))
    })
  })

  describe('Math normalization', () => {
    it('rounds math values to absorb engine precision diffs', () => {
      const v8: FingerprintComponents = {
        math: comp({
          acos: 1.44738515261796, atan: 1.10714871779409,
          cos: -0.999876723, exp: 2.71828182845904,
          log: 2.30258509299404, sin: 0.841470984807896,
          sqrt: 1.41421356237309, tan: 1.55740772465490,
          pow: 1.23456789012345e-50, asin: 0.123587294232432,
        }),
      }
      const jsc: FingerprintComponents = {
        math: comp({
          acos: 1.44738515261794, atan: 1.10714871779406,
          cos: -0.999876724, exp: 2.71828182845904,
          log: 2.30258509299404, sin: 0.841470984807896,
          sqrt: 1.41421356237309, tan: 1.55740772465493,
          pow: 1.23456789012345e-50, asin: 0.123587294232432,
        }),
      }
      // Last-digit diffs should be absorbed by rounding to 8 sig digits
      expect(computeCrossBrowserId(v8)).toBe(computeCrossBrowserId(jsc))
    })
  })

  describe('Screen normalization', () => {
    it('excludes colorDepth and pixelDepth', () => {
      const chrome: FingerprintComponents = {
        screen: comp({ width: 1920, height: 1080, colorDepth: 30, pixelDepth: 30, devicePixelRatio: 2, hdr: true, colorGamut: 'p3', touchPoints: 0 }),
      }
      const safari: FingerprintComponents = {
        screen: comp({ width: 1920, height: 1080, colorDepth: 24, pixelDepth: 24, devicePixelRatio: 2, hdr: true, colorGamut: 'p3', touchPoints: 0 }),
      }
      expect(computeCrossBrowserId(chrome)).toBe(computeCrossBrowserId(safari))
    })
  })

  describe('Intl normalization', () => {
    it('normalizes locale to base language', () => {
      const chrome: FingerprintComponents = {
        intl: comp({ dateTimeFormat: { locale: 'pl', timeZone: 'Europe/Warsaw' }, numberFormat: { numberingSystem: 'latn' } }),
      }
      const safari: FingerprintComponents = {
        intl: comp({ dateTimeFormat: { locale: 'pl-PL', timeZone: 'Europe/Warsaw' }, numberFormat: { numberingSystem: 'latn' } }),
      }
      expect(computeCrossBrowserId(chrome)).toBe(computeCrossBrowserId(safari))
    })
  })

  describe('Speech normalization', () => {
    it('uses language set instead of voice names/count', () => {
      const chrome: FingerprintComponents = {
        speech: comp([
          { name: 'Voice A', lang: 'en-US', localService: true },
          { name: 'Voice B', lang: 'en-US', localService: true },
          { name: 'Voice C', lang: 'pl-PL', localService: true },
        ]),
      }
      const safari: FingerprintComponents = {
        speech: comp([
          { name: 'Different Name', lang: 'en-US', localService: true },
          { name: 'Other Voice', lang: 'pl-PL', localService: true },
        ]),
      }
      // Same languages, different voice names/count — should match
      expect(computeCrossBrowserId(chrome)).toBe(computeCrossBrowserId(safari))
    })
  })

  describe('Navigator normalization', () => {
    it('excludes hardwareConcurrency and deviceMemory', () => {
      const chrome: FingerprintComponents = {
        navigator: comp({ hardwareConcurrency: 10, deviceMemory: 8, maxTouchPoints: 0, platform: 'MacIntel' }),
      }
      const safari: FingerprintComponents = {
        navigator: comp({ hardwareConcurrency: 8, deviceMemory: null, maxTouchPoints: 0, platform: 'MacIntel' }),
      }
      expect(computeCrossBrowserId(chrome)).toBe(computeCrossBrowserId(safari))
    })
  })
})
