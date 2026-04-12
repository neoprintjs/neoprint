import type { Fingerprint, CompareResult } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

export function compareFingerprints(fp1: Fingerprint, fp2: Fingerprint): CompareResult {
  const allKeys = new Set([
    ...Object.keys(fp1.components),
    ...Object.keys(fp2.components),
  ])

  const matching: string[] = []
  const diff: string[] = []

  for (const key of allKeys) {
    const c1 = fp1.components[key]
    const c2 = fp2.components[key]

    if (!c1 || !c2) {
      diff.push(key)
      continue
    }

    if (c1.value === null && c2.value === null) {
      matching.push(key)
      continue
    }

    if (c1.value === null || c2.value === null) {
      diff.push(key)
      continue
    }

    // Hash the values for comparison (handles complex objects)
    const h1 = murmurhash3(JSON.stringify(c1.value))
    const h2 = murmurhash3(JSON.stringify(c2.value))

    if (h1 === h2) {
      matching.push(key)
    } else {
      diff.push(key)
    }
  }

  const total = allKeys.size
  const score = total > 0 ? Math.round((matching.length / total) * 100) / 100 : 0

  return { score, diff, matching }
}
