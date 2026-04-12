import type { FingerprintComponents, SpoofingResult } from '../types.js'

interface Rule {
  name: string
  check(components: FingerprintComponents): boolean
}

const RULES: Rule[] = [
  {
    name: 'gpu_vendor_mismatch',
    check(c) {
      const webgl = c.webgl?.value as any
      const gpu = c.gpu?.value as any
      if (!webgl?.vendor || !gpu?.vendor) return false
      const wVendor = webgl.vendor.toLowerCase()
      const gVendor = gpu.vendor.toLowerCase()
      // If both present but don't match at all
      if (gVendor && !wVendor.includes(gVendor) && !gVendor.includes(wVendor)) {
        return true
      }
      return false
    },
  },
  {
    name: 'platform_ua_mismatch',
    check(c) {
      const nav = c.navigator?.value as any
      if (!nav?.platform || !nav?.userAgent) return false
      const platform = nav.platform.toLowerCase()
      const ua = nav.userAgent.toLowerCase()
      // Mac platform but Windows UA or vice versa
      if (platform.includes('mac') && ua.includes('windows')) return true
      if (platform.includes('win') && ua.includes('macintosh')) return true
      if (platform.includes('linux') && ua.includes('windows') && !ua.includes('wsl')) return true
      return false
    },
  },
  {
    name: 'webdriver_detected',
    check(c) {
      const nav = c.navigator?.value as any
      return nav?.webdriver === true
    },
  },
  {
    name: 'touchpoints_screen_mismatch',
    check(c) {
      const screen = c.screen?.value as any
      const nav = c.navigator?.value as any
      if (!screen || !nav) return false
      // Mobile-sized screen but no touch, or desktop with many touch points
      const isMobileSize = screen.width <= 768 || screen.height <= 768
      const hasManyTouch = (nav.maxTouchPoints ?? 0) > 5
      if (!isMobileSize && hasManyTouch && screen.width > 1920) return true
      return false
    },
  },
  {
    name: 'memory_concurrency_mismatch',
    check(c) {
      const nav = c.navigator?.value as any
      if (!nav?.deviceMemory || !nav?.hardwareConcurrency) return false
      // Very high concurrency with very low memory is suspicious
      if (nav.hardwareConcurrency >= 16 && nav.deviceMemory <= 2) return true
      return false
    },
  },
  {
    name: 'timezone_locale_mismatch',
    check(c) {
      const timing = c.timing?.value as any
      const intl = c.intl?.value as any
      if (!timing?.timezone || !intl?.dateTimeFormat?.locale) return false
      // US timezone but non-latin locale (very rough heuristic)
      const tz = timing.timezone.toLowerCase()
      const locale = intl.dateTimeFormat.locale.toLowerCase()
      if (tz.includes('america') && (locale.startsWith('zh') || locale.startsWith('ja') || locale.startsWith('ko'))) {
        // Not necessarily spoofing — many people live abroad
        // but it's a weak signal
        return false
      }
      return false
    },
  },
  {
    name: 'canvas_blocked',
    check(c) {
      return c.canvas?.value === null && c.webgl?.value !== null
    },
  },
  {
    name: 'audio_blocked',
    check(c) {
      return c.audio?.value === null
    },
  },
  {
    name: 'too_many_fonts',
    check(c) {
      const fonts = c.fonts?.value as any
      if (!Array.isArray(fonts)) return false
      // Having an unusually high font count can indicate spoofing
      return fonts.length > 100
    },
  },
  {
    name: 'timer_precision_anomaly',
    check(c) {
      const timing = c.timing?.value as any
      if (!timing?.timerResolution) return false
      // Firefox with resistFingerprinting rounds to 100ms
      return timing.timerResolution >= 100
    },
  },
]

export function detectSpoofing(components: FingerprintComponents): SpoofingResult {
  const signals: string[] = []

  for (const rule of RULES) {
    try {
      if (rule.check(components)) {
        signals.push(rule.name)
      }
    } catch {
      // skip failing rules
    }
  }

  const score = Math.min(signals.length / 5, 1)
  const isLikely = score >= 0.4

  return {
    isLikely,
    score: Math.round(score * 100) / 100,
    signals,
  }
}
