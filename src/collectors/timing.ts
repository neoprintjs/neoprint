import type { Collector, CollectorResult } from '../types.js'

export const timingCollector: Collector = {
  name: 'timing',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    // Measure performance.now() precision
    const precisionSamples: number[] = []
    for (let i = 0; i < 20; i++) {
      const t1 = performance.now()
      const t2 = performance.now()
      precisionSamples.push(t2 - t1)
    }

    // Detect timer resolution by finding smallest non-zero diff
    const nonZero = precisionSamples.filter((s) => s > 0)
    const timerResolution = nonZero.length > 0
      ? Math.min(...nonZero)
      : 0

    // Timezone
    const timezoneOffset = new Date().getTimezoneOffset()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Date precision
    const dateNow1 = Date.now()
    const dateNow2 = Date.now()
    const dateResolution = dateNow2 - dateNow1

    const data = {
      timerResolution,
      timezoneOffset,
      timezone,
      dateResolution,
      performanceTimeline: typeof performance.getEntries === 'function',
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 5,
      stability: 0.6,
    }
  },
}
