import { describe, it, expect } from 'vitest'

describe('webglRenderCollector', () => {
  it('exports collector with correct name', async () => {
    const { webglRenderCollector } = await import('../src/collectors/webgl-render')
    expect(webglRenderCollector.name).toBe('webglRender')
    expect(webglRenderCollector.collect).toBeTypeOf('function')
  })
})
