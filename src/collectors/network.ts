import type { Collector, CollectorResult } from '../types.js'

export const networkCollector: Collector = {
  name: 'network',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const conn = (navigator as any).connection ?? (navigator as any).mozConnection ?? (navigator as any).webkitConnection

    const data = {
      effectiveType: conn?.effectiveType ?? null,
      downlink: conn?.downlink ?? null,
      rtt: conn?.rtt ?? null,
      saveData: conn?.saveData ?? null,
      type: conn?.type ?? null,
      onLine: navigator.onLine,
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 3,
      stability: 0.3,
    }
  },
}
