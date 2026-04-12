import type { FingerprintComponents } from '../types.js'

export interface ConfidenceBreakdown {
  overall: number
  coverage: number
  avgStability: number
  avgEntropy: number
  perCollector: Record<string, { stability: number; entropy: number; contributed: boolean }>
}

export function analyzeConfidence(components: FingerprintComponents): ConfidenceBreakdown {
  const entries = Object.entries(components)
  const total = entries.length

  if (total === 0) {
    return { overall: 0, coverage: 0, avgStability: 0, avgEntropy: 0, perCollector: {} }
  }

  const perCollector: ConfidenceBreakdown['perCollector'] = {}
  let stabilitySum = 0
  let entropySum = 0
  let validCount = 0

  for (const [name, comp] of entries) {
    const contributed = comp.value !== null
    perCollector[name] = {
      stability: comp.stability,
      entropy: comp.entropy,
      contributed,
    }
    if (contributed) {
      stabilitySum += comp.stability
      entropySum += comp.entropy
      validCount++
    }
  }

  const coverage = validCount / total
  const avgStability = validCount > 0 ? stabilitySum / validCount : 0
  const avgEntropy = validCount > 0 ? entropySum / validCount : 0

  // Overall confidence: weighted combination
  const overall = Math.round(coverage * 0.3 * 100 + avgStability * 0.5 * 100 + Math.min(avgEntropy / 10, 1) * 0.2 * 100) / 100

  return {
    overall: Math.min(overall, 1),
    coverage: Math.round(coverage * 100) / 100,
    avgStability: Math.round(avgStability * 100) / 100,
    avgEntropy: Math.round(avgEntropy * 100) / 100,
    perCollector,
  }
}
