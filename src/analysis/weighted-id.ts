import type { FingerprintComponents } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

/**
 * Entropy-based weights: collectors with more entropy have more influence.
 * This reduces collisions in corporate/school environments where
 * low-entropy signals (screen, navigator) are identical across devices.
 */
export function computeWeightedId(components: FingerprintComponents): string {
  const entries = Object.entries(components)
    .filter(([, comp]) => comp.value !== null && comp.entropy > 0)
    .sort(([, a], [, b]) => b.entropy - a.entropy)

  if (entries.length === 0) return '0'.repeat(32)

  // Build a weighted representation: high-entropy collectors are repeated
  // in the hash input proportional to their entropy contribution
  const totalEntropy = entries.reduce((sum, [, c]) => sum + c.entropy, 0)
  const parts: string[] = []

  for (const [name, comp] of entries) {
    const weight = Math.ceil((comp.entropy / totalEntropy) * 10)
    const serialized = JSON.stringify(comp.value)
    for (let i = 0; i < weight; i++) {
      parts.push(`${name}:${i}:${serialized}`)
    }
  }

  const combined = parts.join('|')
  const h1 = murmurhash3(combined, 0)
  const h2 = murmurhash3(combined, h1)
  const h3 = murmurhash3(combined, h2)
  const h4 = murmurhash3(combined, h3)

  return [h1, h2, h3, h4].map((h) => h.toString(16).padStart(8, '0')).join('')
}
