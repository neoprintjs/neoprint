import type { FingerprintComponents } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

/**
 * Compute a cross-browser ID using only hardware-level signals
 * that are independent of the browser engine.
 *
 * All values are normalized to account for browser-specific differences:
 * - WebGL: ANGLE wrapper strings are stripped to extract real GPU name
 * - Math: rounded to 8 significant digits (V8 vs JSC precision diffs)
 * - Screen: colorDepth/pixelDepth excluded (Chrome 30 vs Safari 24)
 * - Intl: locale normalized to base language (pl vs pl-PL)
 * - Navigator: hardwareConcurrency & deviceMemory excluded (Safari caps/hides)
 */
export function computeCrossBrowserId(components: FingerprintComponents): string {
  const signals: Record<string, unknown> = {}

  // GPU — normalize ANGLE wrapper strings
  const webgl = components.webgl?.value as any
  if (webgl) {
    signals.gpu = {
      vendor: normalizeGpuVendor(webgl.vendor),
      renderer: normalizeGpuRenderer(webgl.renderer),
      maxTextureSize: webgl.maxTextureSize,
    }
  }

  // WebGPU adapter — hardware-level (already normalized by browser)
  const gpu = components.gpu?.value as any
  if (gpu?.supported) {
    signals.gpuAdapter = {
      vendor: gpu.vendor,
      architecture: gpu.architecture,
      device: gpu.device,
    }
  }

  // Math precision — round to 8 significant digits to absorb V8/JSC diffs
  const math = components.math?.value as any
  if (math) {
    signals.math = {
      acos: roundSig(math.acos, 8),
      asin: roundSig(math.asin, 8),
      atan: roundSig(math.atan, 8),
      cos: roundSig(math.cos, 8),
      exp: roundSig(math.exp, 8),
      log: roundSig(math.log, 8),
      sin: roundSig(math.sin, 8),
      sqrt: roundSig(math.sqrt, 8),
      tan: roundSig(math.tan, 8),
      pow: roundSig(math.pow, 8),
    }
  }

  // Screen — exclude colorDepth/pixelDepth (Chrome 30 vs Safari 24)
  const screen = components.screen?.value as any
  if (screen) {
    signals.screen = {
      width: screen.width,
      height: screen.height,
      devicePixelRatio: screen.devicePixelRatio,
      hdr: screen.hdr,
      colorGamut: screen.colorGamut,
      touchPoints: screen.touchPoints,
    }
  }

  // Timezone — OS setting (consistent across browsers)
  const timing = components.timing?.value as any
  if (timing) {
    signals.timezone = {
      timezoneOffset: timing.timezoneOffset,
      timezone: timing.timezone,
    }
  }

  // Intl — normalize locale to base language tag
  const intl = components.intl?.value as any
  if (intl) {
    signals.intl = {
      locale: normalizeLocale(intl.dateTimeFormat?.locale),
      timeZone: intl.dateTimeFormat?.timeZone,
      numberingSystem: intl.numberFormat?.numberingSystem,
    }
  }

  // Fonts — installed at OS level
  const fonts = components.fonts?.value
  if (Array.isArray(fonts)) {
    signals.fonts = fonts
  }

  // Hardware — only truly consistent signals
  // Excluded: hardwareConcurrency (Safari caps to 8), deviceMemory (Safari doesn't expose)
  const nav = components.navigator?.value as any
  if (nav) {
    signals.hardware = {
      maxTouchPoints: nav.maxTouchPoints,
      platform: nav.platform,
    }
  }

  // Audio hardware characteristics (sample rate is hardware-dependent)
  const audio = components.audio?.value as any
  if (audio) {
    signals.audio = {
      sampleRate: audio.sampleRate,
    }
  }

  // Speech voices — use only unique language set (not voice names/count)
  // Chrome exposes more voices as localService than Safari on the same OS,
  // but the set of supported languages is identical.
  const speech = components.speech?.value
  if (Array.isArray(speech)) {
    const localLangs = [...new Set(
      speech
        .filter((v: any) => v.localService)
        .map((v: any) => v.lang as string)
    )].sort()
    if (localLangs.length > 0) {
      signals.speechLangs = localLangs
    }
  }

  // Hash
  const json = JSON.stringify(signals, Object.keys(signals).sort())
  const h1 = murmurhash3(json, 0)
  const h2 = murmurhash3(json, h1)
  const h3 = murmurhash3(json, h2)
  const h4 = murmurhash3(json, h3)

  return [h1, h2, h3, h4].map((h) => h.toString(16).padStart(8, '0')).join('')
}

/**
 * Normalize GPU vendor strings.
 * Chrome ANGLE: "Google Inc. (Apple)" → "Apple"
 * Safari: "Apple Inc." → "Apple"
 */
function normalizeGpuVendor(vendor: string | null): string {
  if (!vendor) return ''
  // Extract real vendor from ANGLE wrapper: "Google Inc. (Apple)" → "Apple"
  const angleMatch = vendor.match(/\(([^)]+)\)/)
  if (angleMatch) return angleMatch[1]!.trim()
  // Strip common suffixes
  return vendor.replace(/\s*(Inc\.|Corporation|Ltd\.?|Co\.?)$/i, '').trim()
}

/**
 * Normalize GPU renderer strings.
 * Chrome ANGLE: "ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)" → "Apple M4"
 * Safari: "Apple GPU" → "Apple GPU"
 * Firefox: "Apple M4" → "Apple M4"
 */
function normalizeGpuRenderer(renderer: string | null): string {
  if (!renderer) return ''

  // ANGLE format: "ANGLE (Vendor, ANGLE Metal/OpenGL Renderer: Chip Name, Version)"
  const angleMatch = renderer.match(/ANGLE\s*\([^,]+,\s*ANGLE\s+\w+\s+Renderer:\s*([^,]+)/i)
  if (angleMatch) return angleMatch[1]!.trim()

  // Another ANGLE format: "ANGLE (Vendor, Chip Name, OpenGL version)"
  const angleMatch2 = renderer.match(/ANGLE\s*\([^,]+,\s*([^,]+)/)
  if (angleMatch2) {
    const chip = angleMatch2[1]!.trim()
    // Skip if it just says "ANGLE Metal Renderer" without a chip name
    if (!chip.toLowerCase().startsWith('angle')) return chip
  }

  return renderer.trim()
}

/**
 * Normalize locale to base language tag.
 * "pl-PL" → "pl", "en-US" → "en", "zh-Hans-CN" → "zh"
 */
function normalizeLocale(locale: string | null | undefined): string {
  if (!locale) return ''
  return locale.split('-')[0]!
}

/**
 * Round a number to N significant digits.
 * This absorbs JS engine floating-point precision differences.
 */
function roundSig(value: number, digits: number): number {
  if (value === 0 || !isFinite(value)) return value
  const d = Math.ceil(Math.log10(Math.abs(value)))
  const power = digits - d
  const magnitude = Math.pow(10, power)
  return Math.round(value * magnitude) / magnitude
}
