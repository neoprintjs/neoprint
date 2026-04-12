import type { Collector, CollectorResult } from '../types.js'

export const navigatorCollector: Collector = {
  name: 'navigator',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const nav = navigator
    const data = {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      languages: [...nav.languages],
      hardwareConcurrency: nav.hardwareConcurrency,
      maxTouchPoints: nav.maxTouchPoints,
      cookieEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack,
      deviceMemory: (nav as any).deviceMemory ?? null,
      pdfViewerEnabled: (nav as any).pdfViewerEnabled ?? null,
      webdriver: nav.webdriver,
      vendor: nav.vendor,
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 8,
      stability: 0.75,
    }
  },
}
