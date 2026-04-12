import { describe, it, expect } from 'vitest'
import { Engine } from '../src/core/engine'
import type { Collector, CollectorResult } from '../src/types'

function makeCollector(name: string, value: unknown, entropy = 5, stability = 0.8, duration = 1): Collector {
  return {
    name,
    async collect(): Promise<CollectorResult> {
      return { value, duration, entropy, stability }
    },
  }
}

function makeFailingCollector(name: string): Collector {
  return {
    name,
    async collect(): Promise<CollectorResult> {
      throw new Error('fail')
    },
  }
}

describe('Engine', () => {
  it('collects from registered collectors', async () => {
    const engine = new Engine()
    engine.register(makeCollector('a', 'hello'))
    engine.register(makeCollector('b', 42))

    const fp = await engine.collect()
    expect(fp.components.a.value).toBe('hello')
    expect(fp.components.b.value).toBe(42)
    expect(fp.id).toMatch(/^[0-9a-f]{32}$/)
  })

  it('returns null value for failing collectors', async () => {
    const engine = new Engine()
    engine.register(makeCollector('good', 'ok'))
    engine.register(makeFailingCollector('bad'))

    const fp = await engine.collect()
    expect(fp.components.good.value).toBe('ok')
    expect(fp.components.bad.value).toBeNull()
  })

  it('respects collector selection', async () => {
    const engine = new Engine()
    engine.register(makeCollector('a', 1))
    engine.register(makeCollector('b', 2))
    engine.register(makeCollector('c', 3))

    const fp = await engine.collect({ collectors: ['a', 'c'] })
    expect(Object.keys(fp.components)).toEqual(['a', 'c'])
  })

  it('produces deterministic IDs', async () => {
    const engine = new Engine()
    engine.register(makeCollector('x', 'same'))

    const fp1 = await engine.collect()
    const fp2 = await engine.collect()
    expect(fp1.id).toBe(fp2.id)
    expect(fp1.stableId).toBe(fp2.stableId)
    expect(fp1.weightedId).toBe(fp2.weightedId)
    expect(fp1.crossBrowserId).toBe(fp2.crossBrowserId)
  })

  it('produces different IDs for different data', async () => {
    const engine1 = new Engine()
    engine1.register(makeCollector('x', 'aaa'))
    const engine2 = new Engine()
    engine2.register(makeCollector('x', 'bbb'))

    const fp1 = await engine1.collect()
    const fp2 = await engine2.collect()
    expect(fp1.id).not.toBe(fp2.id)
  })

  it('unregisters collectors', async () => {
    const engine = new Engine()
    engine.register(makeCollector('a', 1))
    engine.register(makeCollector('b', 2))
    engine.unregister('b')

    const names = engine.getCollectorNames()
    expect(names).toEqual(['a'])
  })

  it('registers and runs plugins', async () => {
    const engine = new Engine()
    engine.registerPlugin('custom', {
      async collect() { return { value: 'plugin-data', entropy: 3 } },
      stability: 0.7,
    })

    const fp = await engine.collect()
    expect(fp.components.custom.value).toBe('plugin-data')
    expect(fp.components.custom.entropy).toBe(3)
    expect(fp.components.custom.stability).toBe(0.7)
  })

  it('handles timeout', async () => {
    const engine = new Engine()
    engine.register({
      name: 'slow',
      async collect() {
        await new Promise(r => setTimeout(r, 5000))
        return { value: 'done', duration: 5000, entropy: 5, stability: 0.8 }
      },
    })

    const fp = await engine.collect({ timeout: 50 })
    expect(fp.components.slow.value).toBeNull()
  })

  it('filters privacy-blacklisted collectors', async () => {
    const engine = new Engine()
    engine.register(makeCollector('canvas', 'data'))
    engine.register(makeCollector('webgl', 'data'))
    engine.register(makeCollector('math', 'data'))
    engine.register(makeCollector('audio', 'data'))

    const fp = await engine.collect({ mode: 'privacy' })
    expect(Object.keys(fp.components)).toEqual(['math'])
  })

  it('filters incognito-volatile collectors', async () => {
    const engine = new Engine()
    engine.register(makeCollector('storage', 'data'))
    engine.register(makeCollector('permissions', 'data'))
    engine.register(makeCollector('math', 'data'))
    engine.register(makeCollector('speech', 'data'))

    const fp = await engine.collect({ mode: 'incognito-resistant' })
    expect(Object.keys(fp.components)).toEqual(['math'])
  })

  it('includes timestamp', async () => {
    const engine = new Engine()
    engine.register(makeCollector('a', 1))

    const before = Date.now()
    const fp = await engine.collect()
    const after = Date.now()
    expect(fp.timestamp).toBeGreaterThanOrEqual(before)
    expect(fp.timestamp).toBeLessThanOrEqual(after)
  })

  it('benchmarks collectors', async () => {
    const engine = new Engine()
    engine.register(makeCollector('a', 1))
    engine.register(makeCollector('b', 2))

    const result = await engine.benchmark()
    expect(result.a).toBeTypeOf('number')
    expect(result.b).toBeTypeOf('number')
    expect(result.total).toBeTypeOf('number')
    expect(result.total).toBeGreaterThanOrEqual(0)
  })
})
