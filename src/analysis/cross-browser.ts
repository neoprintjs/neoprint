import type { FingerprintComponents } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

/**
 * Compute a cross-browser ID using only hardware-level signals
 * that are independent of the browser engine.
 *
 * All values are normalized to account for browser-specific differences:
 * - WebGL: ANGLE wrapper stripped, GPU family extracted, PCI IDs removed
 * - Math: rounded to 8 significant digits (V8 vs JSC vs SpiderMonkey)
 * - Screen: colorDepth/pixelDepth excluded (Chrome 30 vs Safari 24)
 * - Intl: locale normalized to base language (pl vs pl-PL)
 * - Navigator: hardwareConcurrency & deviceMemory excluded (Safari caps/hides)
 * - Fonts: browser-bundled fonts filtered out (Edge adds Roboto)
 * - Speech: excluded (voice lists differ too much between engines on Windows)
 */
export function computeCrossBrowserId(components: FingerprintComponents): string {
  const signals: Record<string, unknown> = {}

  // GPU — normalize ANGLE wrapper strings and extract GPU family
  const webgl = components.webgl?.value as any
  if (webgl) {
    signals.gpu = {
      vendor: normalizeGpuVendor(webgl.vendor),
      renderer: normalizeGpuRenderer(webgl.renderer),
      maxTextureSize: webgl.maxTextureSize,
    }

    // WebGL hardware params — these are GPU limits, identical cross-browser
    const params = webgl.params
    if (params) {
      signals.gpuParams = {
        maxCubeMapTextureSize: params.maxCubeMapTextureSize,
        maxRenderbufferSize: params.maxRenderbufferSize,
        maxFragmentUniformVectors: params.maxFragmentUniformVectors,
        maxVertexUniformVectors: params.maxVertexUniformVectors,
        maxVertexAttribs: params.maxVertexAttribs,
        maxVaryingVectors: params.maxVaryingVectors,
        maxTextureImageUnits: params.maxTextureImageUnits,
      }
    }
  }

  // Shader precision — GPU-reported precision for vertex/fragment shaders.
  // Hardware-dependent, identical across browsers, <1ms.
  const shaderPrec = components.shaderPrecision?.value as any
  if (shaderPrec) {
    signals.shaderPrecision = shaderPrec
  }

  // WebGL rendering hash — actual GPU pixel output, independent of browser engine.
  // Same GPU produces same pixels regardless of Chrome/Safari/Firefox.
  const webglRender = components.webglRender?.value as any
  if (webglRender?.hash) {
    signals.gpuRender = {
      hash: webglRender.hash,
      checksum: webglRender.checksum,
    }
  }

  // WebGPU adapter + limits — hardware-level
  const gpu = components.gpu?.value as any
  if (gpu?.supported) {
    signals.gpuAdapter = {
      vendor: gpu.vendor,
      architecture: gpu.architecture,
      device: gpu.device,
    }
    if (gpu.limits) {
      signals.gpuLimits = gpu.limits
    }
  }

  // Math precision — round to 8 significant digits to absorb engine diffs
  const math = components.math?.value as any
  if (math) {
    signals.math = {
      acos: stablePrecision(math.acos),
      asin: stablePrecision(math.asin),
      atan: stablePrecision(math.atan),
      cos: stablePrecision(math.cos),
      exp: stablePrecision(math.exp),
      log: stablePrecision(math.log),
      sin: stablePrecision(math.sin),
      sqrt: stablePrecision(math.sqrt),
      tan: stablePrecision(math.tan),
      pow: stablePrecision(math.pow),
    }
  }

  // Screen — only hardware-level display properties.
  // width/height excluded: Safari reports available space (changes with
  // window resize, Stage Manager, tiling) instead of physical resolution.
  // colorDepth/pixelDepth excluded: Chrome 30 vs Safari 24.
  const screen = components.screen?.value as any
  if (screen) {
    signals.screen = {
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

  // Fonts — filter out browser-bundled fonts (Edge adds Roboto, etc.)
  const fonts = components.fonts?.value
  if (Array.isArray(fonts)) {
    signals.fonts = fonts.filter((f: string) => !BROWSER_BUNDLED_FONTS.has(f))
  }

  // Hardware — only truly consistent signals
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

  // Hardware perf ratios are EXCLUDED from cross-browser ID:
  // Benchmark timings vary too much between page loads (thermal throttling,
  // background processes, GC timing) to produce stable ratios even when rounded.

  // Speech is EXCLUDED from cross-browser ID:
  // - Chrome/Edge/Firefox expose completely different voice lists on Windows
  // - Firefox adds desktop voices (Zira) that Chrome/Edge hide
  // - Voice count varies wildly (Chrome 21, Edge 25, Firefox 4)
  // The signal is too unstable across browser engines to be useful here.

  // Hash — keys are in deterministic order because they're added
  // sequentially in the code above (gpu, gpuAdapter, gpuParams, math,
  // screen, timezone, intl, fonts, hardware, audio).
  // Do NOT sort — it would change all existing hashes.
  const json = JSON.stringify(signals)
  const h1 = murmurhash3(json, 0)
  const h2 = murmurhash3(json, h1)
  const h3 = murmurhash3(json, h2)
  const h4 = murmurhash3(json, h3)

  return [h1, h2, h3, h4].map((h) => h.toString(16).padStart(8, '0')).join('')
}

/**
 * Fonts that specific browsers bundle/register but aren't OS-installed.
 * These differ per browser on the same machine, so exclude them.
 */
const BROWSER_BUNDLED_FONTS = new Set([
  'Roboto',           // Edge bundles Roboto
  'Noto Sans',        // Chrome may register Noto
  'Noto Color Emoji', // Chrome
])

/**
 * Normalize GPU vendor strings.
 * Chrome ANGLE: "Google Inc. (Apple)" → "Apple"
 * Chrome ANGLE: "Google Inc. (Intel)" → "Intel"
 * Safari: "Apple Inc." → "Apple"
 */
function normalizeGpuVendor(vendor: string | null): string {
  if (!vendor) return ''
  const angleMatch = vendor.match(/\(([^)]+)\)/)
  if (angleMatch) return angleMatch[1]!.trim()
  return vendor.replace(/\s*(Inc\.|Corporation|Ltd\.?|Co\.?)$/i, '').trim()
}

/**
 * Normalize GPU renderer strings.
 *
 * Extracts the GPU family name, stripping:
 * - ANGLE wrapper
 * - PCI device IDs: (0x00005916)
 * - Driver API details: Direct3D11 vs_5_0 ps_5_0
 * - D3D/OpenGL version suffix
 * - Firefox's ", or similar" suffix
 * - "(R)" trademark symbols
 *
 * Examples:
 *   Chrome:  "ANGLE (Intel, Intel(R) HD Graphics 620 (0x00005916) Direct3D11 vs_5_0 ps_5_0, D3D11)"
 *   Edge:    "ANGLE (Intel, Intel(R) HD Graphics 620 (0x00005916) Direct3D11 vs_5_0 ps_5_0, D3D11)"
 *   Firefox: "ANGLE (Intel, Intel(R) HD Graphics 400 Direct3D11 vs_5_0 ps_5_0), or similar"
 *   All → "Intel HD Graphics"
 *
 *   Chrome:  "ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)"
 *   Safari:  "Apple GPU"
 *   All → "Apple" (Safari never exposes specific chip)
 */
function normalizeGpuRenderer(renderer: string | null): string {
  if (!renderer) return ''

  let chip = renderer

  // ANGLE format: "ANGLE (Vendor, ANGLE Metal/OpenGL Renderer: Chip Name, Version)"
  const angleRendererMatch = renderer.match(/ANGLE\s*\([^,]+,\s*ANGLE\s+\w+\s+Renderer:\s*([^,]+)/i)
  if (angleRendererMatch) {
    chip = angleRendererMatch[1]!.trim()
  } else {
    // Direct3D ANGLE format: "ANGLE (Vendor, ChipName ...D3D stuff..., D3D11)"
    const angleD3DMatch = renderer.match(/ANGLE\s*\([^,]+,\s*(.+?)(?:,\s*D3D\d+)?\s*\)/)
    if (angleD3DMatch) {
      chip = angleD3DMatch[1]!.trim()
    }
  }

  // Strip Firefox ", or similar" suffix
  chip = chip.replace(/,?\s*or similar$/i, '')

  // Strip PCI device IDs: (0x00005916)
  chip = chip.replace(/\s*\(0x[0-9a-fA-F]+\)/g, '')

  // Strip Direct3D/OpenGL driver details: "Direct3D11 vs_5_0 ps_5_0"
  chip = chip.replace(/\s*Direct3D\d*\s*(vs_\d+_\d+\s*ps_\d+_\d+)?/gi, '')
  chip = chip.replace(/\s*OpenGL\s+ES\s+[\d.]+/gi, '')
  chip = chip.replace(/\s*OpenGL\s+[\d.]+/gi, '')

  // Strip "(R)" and "(TM)" trademark symbols
  chip = chip.replace(/\(R\)/gi, '')
  chip = chip.replace(/\(TM\)/gi, '')

  // Strip GPU model numbers to get family only:
  // "Intel HD Graphics 620" → "Intel HD Graphics"
  // "Intel UHD Graphics 630" → "Intel UHD Graphics"
  // "NVIDIA GeForce RTX 4090" → "NVIDIA GeForce RTX"
  // "AMD Radeon RX 580" → "AMD Radeon RX"
  // But keep: "Apple M4", "Apple GPU", "Mali-G78"
  chip = chip.replace(/^(Intel\s+(?:U?HD|Iris|Iris\s+Plus|Iris\s+Pro|Iris\s+Xe)\s+Graphics)\s+\d+.*$/i, '$1')
  chip = chip.replace(/^(NVIDIA\s+GeForce\s+\w+)\s+\d+.*$/i, '$1')
  chip = chip.replace(/^(AMD\s+Radeon\s+\w+)\s+\d+.*$/i, '$1')

  // Normalize Apple GPU: Safari returns "Apple GPU", Chrome returns "Apple M4" etc.
  // Both reduce to "Apple" since Safari never exposes the specific chip.
  if (/^Apple\b/i.test(chip)) {
    chip = 'Apple'
  }

  // Clean up extra spaces
  chip = chip.replace(/\s+/g, ' ').trim()

  return chip
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
 * Convert a number to a stable string representation with 8 significant digits.
 * Returns a string (not number) so JSON.stringify doesn't re-format it
 * differently across JS engines (V8 vs JSC format e-notation differently).
 */
function stablePrecision(value: number): string {
  if (!isFinite(value)) return String(value)
  return value.toPrecision(8)
}
