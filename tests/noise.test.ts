import { describe, it, expect } from 'vitest'

// Noise detection requires browser APIs (canvas, AudioContext)
// These tests verify the module exports and types

describe('noise module', () => {
  it('exports detectNoise, detectCanvasNoise, detectAudioNoise', async () => {
    const mod = await import('../src/analysis/noise')
    expect(mod.detectNoise).toBeTypeOf('function')
    expect(mod.detectCanvasNoise).toBeTypeOf('function')
    expect(mod.detectAudioNoise).toBeTypeOf('function')
  })
})
