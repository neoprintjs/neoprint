import type { FingerprintComponents, BotResult } from '../types.js'

interface BotSignal {
  name: string
  check(): boolean
  weight: number
}

export function detectBot(components?: FingerprintComponents): BotResult {
  const signals: string[] = []
  let totalWeight = 0
  let matchedWeight = 0

  const checks: BotSignal[] = [
    // Navigator-based
    {
      name: 'webdriver_present',
      check: () => navigator.webdriver === true,
      weight: 3,
    },
    {
      name: 'languages_empty',
      check: () => !navigator.languages || navigator.languages.length === 0,
      weight: 2,
    },
    {
      name: 'plugins_empty',
      check: () => navigator.plugins?.length === 0,
      weight: 1,
    },

    // Automation framework traces
    {
      name: 'phantom_properties',
      check: () => !!(window as any).__phantom || !!(window as any)._phantom || !!(window as any).phantom,
      weight: 3,
    },
    {
      name: 'selenium_traces',
      check: () =>
        !!(document as any).__selenium_evaluate ||
        !!(document as any).__selenium_unwrapped ||
        !!(window as any).__seleniumAlert ||
        !!(document as any).__webdriver_script_fn,
      weight: 3,
    },
    {
      name: 'puppeteer_traces',
      check: () => !!(window as any).__puppeteer_evaluation_script__,
      weight: 3,
    },
    {
      name: 'playwright_traces',
      check: () => !!(window as any).__playwright || !!(window as any)._playwrightInstance,
      weight: 3,
    },
    {
      name: 'nightmare_traces',
      check: () => !!(window as any).__nightmare,
      weight: 3,
    },
    {
      name: 'cdc_traces',
      check: () => {
        // Chrome DevTools Protocol markers left by chromedriver
        const keys = Object.keys(document)
        return keys.some((k) => k.startsWith('$cdc_'))
      },
      weight: 3,
    },

    // Headless browser indicators
    {
      name: 'headless_chrome',
      check: () => /HeadlessChrome/.test(navigator.userAgent),
      weight: 3,
    },
    {
      name: 'missing_chrome_runtime',
      check: () => {
        if (!navigator.userAgent.includes('Chrome')) return false
        return !(window as any).chrome?.runtime
      },
      weight: 1,
    },

    // Window/document anomalies
    {
      name: 'permission_anomaly',
      check: () => {
        try {
          // In many bots, Notification.permission is 'denied' by default
          return typeof Notification !== 'undefined' && Notification.permission === 'denied'
        } catch {
          return false
        }
      },
      weight: 0.5,
    },
    {
      name: 'window_outersize_zero',
      check: () => window.outerWidth === 0 || window.outerHeight === 0,
      weight: 2,
    },
    {
      name: 'screen_size_zero',
      check: () => screen.width === 0 || screen.height === 0,
      weight: 3,
    },

    // Function toString override (common in spoofed environments)
    {
      name: 'native_function_spoofed',
      check: () => {
        try {
          const toString = Function.prototype.toString
          const result = toString.call(navigator.permissions.query)
          return !result.includes('native code')
        } catch {
          return false
        }
      },
      weight: 2,
    },

    // Stack trace analysis
    {
      name: 'error_stack_anomaly',
      check: () => {
        try {
          throw new Error()
        } catch (e: any) {
          const stack = e.stack ?? ''
          // Puppeteer/Playwright inject scripts with recognizable paths
          return stack.includes('puppeteer') || stack.includes('playwright') || stack.includes('selenium')
        }
      },
      weight: 2,
    },

    // Component-based checks (if fingerprint is provided)
    {
      name: 'audio_context_missing',
      check: () => {
        if (!components) return false
        return components.audio?.value === null
      },
      weight: 1,
    },
    {
      name: 'webgl_missing',
      check: () => {
        if (!components) return false
        return components.webgl?.value === null
      },
      weight: 1,
    },
  ]

  for (const check of checks) {
    totalWeight += check.weight
    try {
      if (check.check()) {
        signals.push(check.name)
        matchedWeight += check.weight
      }
    } catch {
      // skip failing checks
    }
  }

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) / 100 : 0
  const isBot = score >= 0.2

  return {
    isBot,
    score,
    signals,
  }
}
