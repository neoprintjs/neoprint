import type { Collector, CollectorResult } from '../types.js'

export const storageCollector: Collector = {
  name: 'storage',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const data = {
      localStorage: testStorage('localStorage'),
      sessionStorage: testStorage('sessionStorage'),
      indexedDB: typeof indexedDB !== 'undefined',
      cookieEnabled: navigator.cookieEnabled,
      storageEstimate: null as { quota?: number; usage?: number } | null,
      privateBrowsing: false,
    }

    // Storage estimate (quota reveals browser/profile)
    if (navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate()
        data.storageEstimate = { quota: est.quota, usage: est.usage }
      } catch {
        // unavailable
      }
    }

    // Private browsing detection heuristic
    if (data.storageEstimate?.quota && data.storageEstimate.quota < 120_000_000) {
      data.privateBrowsing = true
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 4,
      stability: 0.6,
    }
  },
}

function testStorage(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type]
    const key = '__neoprint_test__'
    storage.setItem(key, '1')
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}
