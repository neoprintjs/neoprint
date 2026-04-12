import { describe, it, expect } from 'vitest'
import { detectAntiDetect } from '../src/analysis/anti-detect'
import type { FingerprintComponents } from '../src/types'

function comp(value: unknown): any {
  return { value, duration: 1, entropy: 5, stability: 0.8 }
}

describe('detectAntiDetect', () => {
  it('returns clean result for normal components', () => {
    const components: FingerprintComponents = {
      navigator: comp({ platform: 'MacIntel', userAgent: 'Macintosh; Intel Mac OS X' }),
      webgl: comp({ vendor: 'Apple', renderer: 'Apple GPU', maxTextureSize: 8192 }),
    }
    const result = detectAntiDetect(components)
    expect(result).toHaveProperty('detected')
    expect(result).toHaveProperty('tool')
    expect(result).toHaveProperty('confidence')
    expect(result).toHaveProperty('signals')
  })

  it('detects webgl parameter inconsistency - Intel with huge texture', () => {
    const components: FingerprintComponents = {
      webgl: comp({ renderer: 'Intel HD Graphics', maxTextureSize: 32768, params: {} }),
    }
    const result = detectAntiDetect(components)
    expect(result.signals).toContain('webgl_param_inconsistency')
  })

  it('detects mobile GPU with desktop params', () => {
    const components: FingerprintComponents = {
      webgl: comp({ renderer: 'Adreno 640', maxTextureSize: 16384, params: {} }),
    }
    const result = detectAntiDetect(components)
    expect(result.signals).toContain('webgl_param_inconsistency')
  })

  it('detects platform vs GPU mismatch - Mac with DirectX', () => {
    const components: FingerprintComponents = {
      navigator: comp({ platform: 'MacIntel', userAgent: 'Mac' }),
      webgl: comp({ vendor: 'test', renderer: 'Direct3D d3d11', maxTextureSize: 8192 }),
    }
    const result = detectAntiDetect(components)
    expect(result.signals).toContain('platform_gpu_mismatch')
  })

  it('detects Windows with Metal renderer', () => {
    const components: FingerprintComponents = {
      navigator: comp({ platform: 'Win32', userAgent: 'Windows' }),
      webgl: comp({ vendor: 'test', renderer: 'Metal renderer', maxTextureSize: 8192 }),
    }
    const result = detectAntiDetect(components)
    expect(result.signals).toContain('platform_gpu_mismatch')
  })

  it('detects too perfect profile', () => {
    const components: FingerprintComponents = {}
    for (let i = 0; i < 16; i++) {
      components[`collector${i}`] = comp(`value${i}`)
    }
    const result = detectAntiDetect(components)
    expect(result.signals).toContain('too_perfect_profile')
  })

  it('confidence is between 0 and 1', () => {
    const result = detectAntiDetect()
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('returns null tool when not detected', () => {
    const result = detectAntiDetect()
    if (!result.detected) {
      expect(result.tool).toBeNull()
    }
  })
})
