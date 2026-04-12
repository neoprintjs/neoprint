import { describe, it, expect } from 'vitest'
import { INCOGNITO_VOLATILE_COLLECTORS } from '../src/analysis/incognito'

describe('incognito module', () => {
  it('exports INCOGNITO_VOLATILE_COLLECTORS set', () => {
    expect(INCOGNITO_VOLATILE_COLLECTORS).toBeInstanceOf(Set)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('storage')).toBe(true)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('permissions')).toBe(true)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('network')).toBe(true)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('speech')).toBe(true)
  })

  it('does not include stable collectors', () => {
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('math')).toBe(false)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('webgl')).toBe(false)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('fonts')).toBe(false)
    expect(INCOGNITO_VOLATILE_COLLECTORS.has('canvas')).toBe(false)
  })

  it('exports detectIncognito function', async () => {
    const mod = await import('../src/analysis/incognito')
    expect(mod.detectIncognito).toBeTypeOf('function')
  })
})
