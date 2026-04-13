import { describe, it, expect } from 'vitest'

describe('shaderPrecisionCollector', () => {
  it('exports collector with correct name', async () => {
    const { shaderPrecisionCollector } = await import('../src/collectors/shader-precision')
    expect(shaderPrecisionCollector.name).toBe('shaderPrecision')
    expect(shaderPrecisionCollector.collect).toBeTypeOf('function')
  })
})
