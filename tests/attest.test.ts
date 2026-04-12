import { describe, it, expect } from 'vitest'
import { attestDevice, verifyIntegrityToken } from '../src/analysis/attest'
import type { Fingerprint } from '../src/types'

function makeFp(overrides: Record<string, any> = {}): Fingerprint {
  return {
    id: 'abc123',
    stableId: 'stable123',
    weightedId: 'weighted123',
    crossBrowserId: 'cross123',
    confidence: 0.85,
    spoofingScore: 0,
    entropy: 90,
    components: {
      canvas: { value: 'data:image/png;base64,' + 'a'.repeat(200), duration: 3, entropy: 10, stability: 0.85 },
      webgl: { value: { vendor: 'Apple', renderer: 'Apple GPU', maxTextureSize: 8192 }, duration: 5, entropy: 12, stability: 0.95 },
      audio: { value: { sum: 124, sampleRate: 44100, length: 5000 }, duration: 12, entropy: 8, stability: 0.8 },
      fonts: { value: ['Arial', 'Helvetica', 'Times', 'Courier'], duration: 3, entropy: 12, stability: 0.9 },
      navigator: { value: { platform: 'MacIntel', userAgent: 'Macintosh; Intel Mac OS X', webdriver: false, languages: ['en-US', 'pl'], hardwareConcurrency: 10, deviceMemory: 8 }, duration: 0, entropy: 8, stability: 0.75 },
      screen: { value: { width: 1920, height: 1080 }, duration: 0, entropy: 6, stability: 0.7 },
      hardwarePerf: { value: { floatArith: 2.1, trigonometry: 1.8, arraySort: 3.2, objectAlloc: 1.5, stringHash: 2.0, matrixMul: 1.2 }, duration: 12, entropy: 4, stability: 0.5 },
      ...overrides,
    },
    timestamp: Date.now(),
  }
}

describe('attestDevice', () => {
  it('returns correct structure', async () => {
    const fp = makeFp()
    const result = await attestDevice(fp)

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('isHuman')
    expect(result).toHaveProperty('isPhysical')
    expect(result).toHaveProperty('isAuthentic')
    expect(result).toHaveProperty('factors')
    expect(result).toHaveProperty('risks')
    expect(result).toHaveProperty('integrityToken')
  })

  it('score is between 0 and 1', async () => {
    const fp = makeFp()
    const result = await attestDevice(fp)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('scores high for legitimate fingerprint', async () => {
    const fp = makeFp()
    const result = await attestDevice(fp, { strictness: 'low' })
    expect(result.score).toBeGreaterThan(0.7)
    expect(result.isHuman).toBe(true)
    expect(result.isAuthentic).toBe(true)
    expect(result.factors.length).toBeGreaterThan(0)
  })

  it('flags webdriver as risk', async () => {
    const fp = makeFp({
      navigator: { value: { platform: 'Win32', userAgent: 'Windows', webdriver: true, languages: ['en'], hardwareConcurrency: 4, deviceMemory: 4 }, duration: 0, entropy: 8, stability: 0.75 },
    })
    const result = await attestDevice(fp)
    expect(result.risks).toContain('webdriver_off')
  })

  it('detects software renderer', async () => {
    const fp = makeFp({
      webgl: { value: { vendor: 'Google', renderer: 'SwiftShader', maxTextureSize: 8192 }, duration: 5, entropy: 12, stability: 0.95 },
    })
    const result = await attestDevice(fp)
    expect(result.risks).toContain('real_gpu')
  })

  it('strictness low runs fewer checks', async () => {
    const fp = makeFp()
    const low = await attestDevice(fp, { strictness: 'low' })
    const high = await attestDevice(fp, { strictness: 'high' })
    expect(low.factors.length + low.risks.length).toBeLessThanOrEqual(high.factors.length + high.risks.length)
  })

  it('generates integrity token', async () => {
    const fp = makeFp()
    const result = await attestDevice(fp)
    expect(result.integrityToken).toBeTypeOf('string')
    expect(result.integrityToken.length).toBeGreaterThan(10)
  })

  it('integrity token includes challenge', async () => {
    const fp = makeFp()
    const result = await attestDevice(fp, { challenge: 'server-nonce-123' })
    const verified = verifyIntegrityToken(result.integrityToken)
    expect(verified.valid).toBe(true)
    expect(verified.payload?.ch).toBe('server-nonce-123')
  })

  it('flags missing canvas', async () => {
    const fp = makeFp({
      canvas: { value: null, duration: 0, entropy: 0, stability: 0 },
    })
    const result = await attestDevice(fp)
    expect(result.risks).toContain('canvas_renders')
  })

  it('flags missing audio', async () => {
    const fp = makeFp({
      audio: { value: null, duration: 0, entropy: 0, stability: 0 },
    })
    const result = await attestDevice(fp)
    expect(result.risks).toContain('audio_context_works')
  })

  it('flags unrealistic hardware perf', async () => {
    const fp = makeFp({
      hardwarePerf: { value: { floatArith: 0, trigonometry: 0, arraySort: 0, objectAlloc: 0, stringHash: 0, matrixMul: 0 }, duration: 0, entropy: 4, stability: 0.5 },
    })
    const result = await attestDevice(fp, { strictness: 'medium' })
    expect(result.risks).toContain('hardware_perf_realistic')
  })
})

describe('verifyIntegrityToken', () => {
  it('verifies valid token', async () => {
    const fp = makeFp()
    const result = await attestDevice(fp)
    const verified = verifyIntegrityToken(result.integrityToken)

    expect(verified.valid).toBe(true)
    expect(verified.payload).not.toBeNull()
    expect(verified.payload!.fid).toBe('abc123')
    expect(verified.payload!.sid).toBe('stable123')
    expect(verified.payload!.sc).toBe(result.score)
  })

  it('rejects tampered token', () => {
    const verified = verifyIntegrityToken('dGFtcGVyZWQ=')
    expect(verified.valid).toBe(false)
  })

  it('rejects empty token', () => {
    const verified = verifyIntegrityToken('')
    expect(verified.valid).toBe(false)
  })

  it('rejects garbage', () => {
    const verified = verifyIntegrityToken('not-base64-!!!!')
    expect(verified.valid).toBe(false)
  })

  it('payload contains timestamp', async () => {
    const before = Date.now()
    const fp = makeFp()
    const result = await attestDevice(fp)
    const after = Date.now()

    const verified = verifyIntegrityToken(result.integrityToken)
    expect(verified.payload!.ts).toBeGreaterThanOrEqual(before)
    expect(verified.payload!.ts).toBeLessThanOrEqual(after)
  })
})
