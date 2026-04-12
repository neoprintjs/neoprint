import type { FingerprintComponents } from '../types.js'

export interface EntropyBreakdown {
  total: number
  perCollector: Record<string, number>
  topContributors: Array<{ name: string; entropy: number }>
  uniquenessBits: number
}

export function analyzeEntropy(components: FingerprintComponents): EntropyBreakdown {
  const perCollector: Record<string, number> = {}
  let total = 0

  for (const [name, comp] of Object.entries(components)) {
    if (comp.value !== null) {
      perCollector[name] = comp.entropy
      total += comp.entropy
    }
  }

  const sorted = Object.entries(perCollector)
    .sort(([, a], [, b]) => b - a)
    .map(([name, entropy]) => ({ name, entropy }))

  // Estimate uniqueness: how many unique users can this fingerprint distinguish
  // 2^entropy = number of unique fingerprints
  const uniquenessBits = Math.round(total * 100) / 100

  return {
    total: uniquenessBits,
    perCollector,
    topContributors: sorted.slice(0, 5),
    uniquenessBits,
  }
}
