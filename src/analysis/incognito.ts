/**
 * Detect incognito / private browsing mode.
 * Uses multiple heuristics since no single method is 100% reliable.
 */
export async function detectIncognito(): Promise<{ isIncognito: boolean; signals: string[] }> {
  const signals: string[] = []

  // 1. Storage quota heuristic
  // In incognito, browsers severely limit storage quota
  if (navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate()
      if (est.quota && est.quota < 120_000_000) {
        signals.push('low_storage_quota')
      }
    } catch {
      signals.push('storage_estimate_blocked')
    }
  }

  // 2. FileSystem API (Chrome-specific, reliable for older versions)
  if ('webkitRequestFileSystem' in window) {
    try {
      await new Promise<void>((resolve, reject) => {
        (window as any).webkitRequestFileSystem(
          0, // TEMPORARY
          1,
          () => resolve(),
          () => reject(),
        )
      })
    } catch {
      signals.push('filesystem_blocked')
    }
  }

  // 3. IndexedDB behavior
  // Safari in private mode used to throw on IDB open
  try {
    const request = indexedDB.open('__neoprint_incognito_test__')
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        request.result.close()
        indexedDB.deleteDatabase('__neoprint_incognito_test__')
        resolve()
      }
      request.onerror = () => reject()
    })
  } catch {
    signals.push('indexeddb_blocked')
  }

  // 4. ServiceWorker availability
  // Some private browsing modes disable service workers
  if (!('serviceWorker' in navigator)) {
    signals.push('serviceworker_unavailable')
  }

  // 5. Cache API behavior
  if ('caches' in window) {
    try {
      const cache = await caches.open('__neoprint_incognito_test__')
      await caches.delete('__neoprint_incognito_test__')
    } catch {
      signals.push('cache_api_blocked')
    }
  }

  return {
    isIncognito: signals.length >= 2,
    signals,
  }
}

/**
 * Collectors that give different results in incognito mode.
 * These are excluded when using 'incognito-resistant' mode.
 */
export const INCOGNITO_VOLATILE_COLLECTORS = new Set([
  'storage',
  'permissions',
  'network',
])
