import type { FingerprintComponents } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

/**
 * Compute a cross-browser ID using only hardware-level signals
 * that are independent of the browser engine.
 *
 * These signals come from the OS and hardware, not the browser:
 * - GPU vendor/renderer (same GPU = same string)
 * - Math precision (CPU-dependent, not engine-dependent)
 * - Screen properties (physical display)
 * - Timezone + locale (OS-level setting)
 * - Fonts (installed at OS level)
 * - Hardware concurrency (physical CPU cores)
 * - Device memory (physical RAM)
 * - Audio hardware characteristics
 * - Touch points (hardware capability)
 */
export function computeCrossBrowserId(components: FingerprintComponents): string {
  const signals: Record<string, unknown> = {}

  // GPU — identical across browsers on the same machine
  const webgl = components.webgl?.value as any
  if (webgl) {
    signals.gpu = {
      vendor: webgl.vendor,
      renderer: webgl.renderer,
      maxTextureSize: webgl.maxTextureSize,
    }
  }

  // WebGPU adapter — hardware-level
  const gpu = components.gpu?.value as any
  if (gpu?.supported) {
    signals.gpuAdapter = {
      vendor: gpu.vendor,
      architecture: gpu.architecture,
      device: gpu.device,
    }
  }

  // Math precision — CPU architecture dependent
  const math = components.math?.value as any
  if (math) {
    // Select operations with highest cross-browser consistency
    signals.math = {
      acos: math.acos,
      asin: math.asin,
      atan: math.atan,
      cos: math.cos,
      exp: math.exp,
      log: math.log,
      sin: math.sin,
      sqrt: math.sqrt,
      tan: math.tan,
      pow: math.pow,
    }
  }

  // Screen — physical display properties
  const screen = components.screen?.value as any
  if (screen) {
    signals.screen = {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      devicePixelRatio: screen.devicePixelRatio,
      hdr: screen.hdr,
      colorGamut: screen.colorGamut,
      touchPoints: screen.touchPoints,
    }
  }

  // Timezone — OS setting
  const timing = components.timing?.value as any
  if (timing) {
    signals.timezone = {
      timezoneOffset: timing.timezoneOffset,
      timezone: timing.timezone,
    }
  }

  // Intl — OS locale
  const intl = components.intl?.value as any
  if (intl) {
    signals.intl = {
      locale: intl.dateTimeFormat?.locale,
      timeZone: intl.dateTimeFormat?.timeZone,
      numberingSystem: intl.numberFormat?.numberingSystem,
    }
  }

  // Fonts — installed at OS level
  const fonts = components.fonts?.value
  if (Array.isArray(fonts)) {
    signals.fonts = fonts
  }

  // Hardware — physical properties
  const nav = components.navigator?.value as any
  if (nav) {
    signals.hardware = {
      hardwareConcurrency: nav.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
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

  // Speech voices — installed at OS level
  const speech = components.speech?.value
  if (Array.isArray(speech)) {
    // Only local voices (not cloud) are OS-dependent
    const localVoices = speech
      .filter((v: any) => v.localService)
      .map((v: any) => ({ name: v.name, lang: v.lang }))
    if (localVoices.length > 0) {
      signals.speechVoices = localVoices
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
