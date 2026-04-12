import { describe, it, expect } from 'vitest'
import { hardwarePerfCollector } from '../src/collectors/hardware-perf'

describe('hardwarePerfCollector', () => {
  it('has correct name', () => {
    expect(hardwarePerfCollector.name).toBe('hardwarePerf')
  })

  it('returns valid CollectorResult', async () => {
    const result = await hardwarePerfCollector.collect()

    expect(result.value).not.toBeNull()
    expect(result.entropy).toBe(4)
    expect(result.stability).toBe(0.5)
    expect(result.duration).toBeTypeOf('number')
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('includes all 6 benchmarks', async () => {
    const result = await hardwarePerfCollector.collect()
    const value = result.value as Record<string, number>

    expect(value).toHaveProperty('floatArith')
    expect(value).toHaveProperty('trigonometry')
    expect(value).toHaveProperty('arraySort')
    expect(value).toHaveProperty('objectAlloc')
    expect(value).toHaveProperty('stringHash')
    expect(value).toHaveProperty('matrixMul')
  })

  it('all benchmarks return positive numbers', async () => {
    const result = await hardwarePerfCollector.collect()
    const value = result.value as Record<string, number>

    for (const [name, ms] of Object.entries(value)) {
      expect(ms, `${name} should be a number`).toBeTypeOf('number')
      expect(ms, `${name} should be >= 0`).toBeGreaterThanOrEqual(0)
    }
  })

  it('completes within reasonable time (<500ms)', async () => {
    const start = performance.now()
    await hardwarePerfCollector.collect()
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(500)
  })

  it('produces consistent structure across runs', async () => {
    const r1 = await hardwarePerfCollector.collect()
    const r2 = await hardwarePerfCollector.collect()

    const keys1 = Object.keys(r1.value as object).sort()
    const keys2 = Object.keys(r2.value as object).sort()
    expect(keys1).toEqual(keys2)
  })
})
