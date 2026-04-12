import type { Collector, CollectorResult } from '../types.js'

export const screenCollector: Collector = {
  name: 'screen',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const s = window.screen
    const data = {
      width: s.width,
      height: s.height,
      availWidth: s.availWidth,
      availHeight: s.availHeight,
      colorDepth: s.colorDepth,
      pixelDepth: s.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      orientation: s.orientation?.type ?? null,
      hdr: matchMedia('(dynamic-range: high)').matches,
      colorGamut: matchMedia('(color-gamut: p3)').matches
        ? 'p3'
        : matchMedia('(color-gamut: rec2020)').matches
          ? 'rec2020'
          : 'srgb',
      prefersColorScheme: matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
      prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersContrast: matchMedia('(prefers-contrast: high)').matches
        ? 'high'
        : matchMedia('(prefers-contrast: low)').matches
          ? 'low'
          : 'no-preference',
      touchPoints: navigator.maxTouchPoints,
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 6,
      stability: 0.7,
    }
  },
}
