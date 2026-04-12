import type { Fingerprint, ServerHints } from '../types.js'
import { murmurhash3 } from '../core/hash.js'
import { getProtocol } from './protocol.js'

/**
 * Generate server-side validation hints.
 * These can be sent to a server to verify that the fingerprint
 * hasn't been tampered with on the client side.
 *
 * The server can:
 * 1. Check that environment values match the HTTP request (User-Agent, Accept-Language)
 * 2. Verify checksums to detect value manipulation
 * 3. Compare expectedRanges against known valid ranges
 */
export function getServerHints(fp: Fingerprint): ServerHints {
  const collectorChecksums: Record<string, number> = {}
  const expectedRanges: Record<string, { type: string; checksum: number }> = {}

  for (const [name, comp] of Object.entries(fp.components)) {
    if (comp.value === null) continue

    const serialized = JSON.stringify(comp.value)
    const checksum = murmurhash3(serialized)
    collectorChecksums[name] = checksum

    expectedRanges[name] = {
      type: typeof comp.value === 'object' && comp.value !== null
        ? Array.isArray(comp.value) ? 'array' : 'object'
        : typeof comp.value,
      checksum,
    }
  }

  // Gather environment data that can be cross-referenced with HTTP headers
  const nav = fp.components.navigator?.value as any
  const timing = fp.components.timing?.value as any

  return {
    fingerprintId: fp.id,
    stableId: fp.stableId,
    timestamp: fp.timestamp,
    protocol: getProtocol(),
    expectedRanges,
    collectorChecksums,
    environment: {
      platform: nav?.platform ?? navigator.platform,
      languages: nav?.languages ?? [...navigator.languages],
      timezone: timing?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      cores: nav?.hardwareConcurrency ?? navigator.hardwareConcurrency,
      memory: nav?.deviceMemory ?? (navigator as any).deviceMemory ?? null,
      touchPoints: nav?.maxTouchPoints ?? navigator.maxTouchPoints,
    },
  }
}
