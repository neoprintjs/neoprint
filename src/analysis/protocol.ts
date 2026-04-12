/**
 * Collectors that only work (or work differently) over HTTPS.
 * On HTTP, these return different/empty values and should be excluded
 * from the hash to maintain consistency.
 */
const HTTPS_ONLY_COLLECTORS = new Set([
  'gpu',        // WebGPU requires secure context
  'permissions', // Permissions API requires secure context
  'storage',    // navigator.storage.estimate() requires secure context
  'webrtc',     // getUserMedia requires secure context
])

/**
 * Collectors that behave differently on HTTP vs HTTPS.
 * navigator.deviceMemory, Network Information API — HTTPS only.
 */
const HTTPS_AFFECTED_COLLECTORS = new Set([
  'navigator',  // deviceMemory only available on HTTPS
  'network',    // Network Information API secure-only
])

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext === true
}

export function getProtocol(): string {
  if (typeof location !== 'undefined') {
    return location.protocol
  }
  return 'unknown'
}

/**
 * Filter out collectors that don't work on the current protocol.
 * This prevents the fingerprint from changing between HTTP/HTTPS visits.
 */
export function filterByProtocol(collectorNames: string[]): string[] {
  if (isSecureContext()) {
    return collectorNames
  }

  return collectorNames.filter((name) => !HTTPS_ONLY_COLLECTORS.has(name))
}

/**
 * Get list of collectors affected by the current protocol.
 */
export function getProtocolAffectedCollectors(): {
  unavailable: string[]
  degraded: string[]
} {
  if (isSecureContext()) {
    return { unavailable: [], degraded: [] }
  }

  return {
    unavailable: [...HTTPS_ONLY_COLLECTORS],
    degraded: [...HTTPS_AFFECTED_COLLECTORS],
  }
}
