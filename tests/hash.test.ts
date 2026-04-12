import { describe, it, expect } from 'vitest'
import { murmurhash3, hashComponents } from '../src/core/hash'

describe('murmurhash3', () => {
  it('returns a 32-bit unsigned integer', () => {
    const result = murmurhash3('hello')
    expect(result).toBeTypeOf('number')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(0xffffffff)
  })

  it('is deterministic', () => {
    expect(murmurhash3('test')).toBe(murmurhash3('test'))
  })

  it('produces different hashes for different inputs', () => {
    expect(murmurhash3('foo')).not.toBe(murmurhash3('bar'))
  })

  it('respects seed parameter', () => {
    expect(murmurhash3('test', 0)).not.toBe(murmurhash3('test', 42))
  })

  it('handles empty string', () => {
    const result = murmurhash3('')
    expect(result).toBeTypeOf('number')
  })

  it('handles long strings', () => {
    const long = 'a'.repeat(10000)
    const result = murmurhash3(long)
    expect(result).toBeTypeOf('number')
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

describe('hashComponents', () => {
  it('returns a 32-char hex string', () => {
    const result = hashComponents({ a: 1, b: 'test' })
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })

  it('is deterministic', () => {
    const data = { x: 42, y: 'hello' }
    expect(hashComponents(data)).toBe(hashComponents(data))
  })

  it('produces different hashes for different data', () => {
    expect(hashComponents({ a: 1 })).not.toBe(hashComponents({ a: 2 }))
  })

  it('is order-independent (keys sorted)', () => {
    expect(hashComponents({ a: 1, b: 2 })).toBe(hashComponents({ b: 2, a: 1 }))
  })

  it('handles nested objects', () => {
    const result = hashComponents({ nested: { deep: { value: true } } })
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })

  it('handles null and undefined values', () => {
    const result = hashComponents({ a: null, b: undefined })
    expect(result).toMatch(/^[0-9a-f]{32}$/)
  })
})
