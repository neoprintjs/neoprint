import type { Collector, CollectorResult } from '../types.js'

const CSS_FEATURES = [
  ['grid', 'display: grid'],
  ['subgrid', 'grid-template-columns: subgrid'],
  ['container-queries', 'container-type: inline-size'],
  ['has-selector', 'selector(:has(*))'],
  ['nesting', 'selector(& > *)'],
  ['cascade-layers', 'at-rule(@layer)'],
  ['color-mix', 'color: color-mix(in srgb, red, blue)'],
  ['oklch', 'color: oklch(0.5 0.2 240)'],
  ['lch', 'color: lch(50% 50 240)'],
  ['accent-color', 'accent-color: red'],
  ['aspect-ratio', 'aspect-ratio: 1'],
  ['backdrop-filter', 'backdrop-filter: blur(1px)'],
  ['content-visibility', 'content-visibility: auto'],
  ['overscroll-behavior', 'overscroll-behavior: contain'],
  ['scroll-snap', 'scroll-snap-type: x mandatory'],
  ['text-decoration-thickness', 'text-decoration-thickness: 2px'],
  ['touch-action', 'touch-action: none'],
  ['will-change', 'will-change: transform'],
  ['view-transitions', 'view-transition-name: hero'],
  ['anchor-positioning', 'anchor-name: --a'],
] as const

export const cssFeaturesCollector: Collector = {
  name: 'cssFeatures',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const supported: string[] = []

    for (const [name, test] of CSS_FEATURES) {
      try {
        if (test.startsWith('selector(')) {
          // @ts-ignore
          if (CSS.supports?.(test)) supported.push(name)
        } else if (test.startsWith('at-rule(')) {
          // at-rule detection — approximate
          supported.push(name)
        } else {
          const [prop, val] = test.split(': ', 2)
          if (prop && val && CSS.supports?.(prop, val)) {
            supported.push(name)
          }
        }
      } catch {
        // CSS.supports not available or invalid
      }
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: supported,
      duration,
      entropy: 4,
      stability: 0.8,
    }
  },
}
