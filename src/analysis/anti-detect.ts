import type { FingerprintComponents } from '../types.js'

export interface AntiDetectResult {
  detected: boolean
  tool: 'multilogin' | 'gologin' | 'dolphin-anty' | 'linken-sphere' | 'incogniton' | 'vmlogin' | 'adspower' | 'unknown' | null
  confidence: number
  signals: string[]
}

interface DetectionRule {
  name: string
  weight: number
  tool?: AntiDetectResult['tool']
  check(components?: FingerprintComponents): boolean
}

const RULES: DetectionRule[] = [
  // ── Electron shell detection ──
  // Multilogin (Mimic/Stealthfox) and GoLogin run inside Electron
  {
    name: 'electron_shell',
    weight: 3,
    check() {
      const ua = navigator.userAgent
      // Electron adds its identifier to UA in some configs
      if (/Electron/i.test(ua)) return true
      // Electron-specific APIs leak through
      if ((window as any).process?.versions?.electron) return true
      if ((window as any).require && (window as any).__dirname !== undefined) return true
      return false
    },
  },

  // ── Prototype chain tampering ──
  // Anti-detect browsers override getters on Navigator, Screen, etc.
  {
    name: 'navigator_prototype_tampered',
    weight: 4,
    check() {
      try {
        const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'hardwareConcurrency')
        if (!desc || !desc.get) return false
        const str = desc.get.toString()
        // Native getters contain "[native code]"
        if (!str.includes('[native code]')) return true
      } catch {
        return false
      }
      return false
    },
  },
  {
    name: 'screen_prototype_tampered',
    weight: 4,
    check() {
      try {
        const desc = Object.getOwnPropertyDescriptor(Screen.prototype, 'width')
        if (!desc || !desc.get) return false
        const str = desc.get.toString()
        if (!str.includes('[native code]')) return true
      } catch {
        return false
      }
      return false
    },
  },
  {
    name: 'webgl_prototype_tampered',
    weight: 3,
    check() {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl')
        if (!gl) return false
        const str = gl.getParameter.toString()
        if (!str.includes('[native code]')) return true
      } catch {
        return false
      }
      return false
    },
  },

  // ── Property descriptor anomalies ──
  // Anti-detect browsers often add properties to navigator that don't exist natively
  {
    name: 'extra_navigator_properties',
    weight: 2,
    check() {
      const suspicious = [
        '__antiDetect', '__mlProfile', '__gologin',
        '_dolphin', '__adspower', '_vmlogin',
      ]
      return suspicious.some((prop) => prop in navigator)
    },
  },

  // ── Multilogin specific ──
  {
    name: 'multilogin_traces',
    weight: 5,
    tool: 'multilogin',
    check() {
      // Multilogin's Mimic browser leaks specific window properties
      if ((window as any).__mimic || (window as any).mlBrowser) return true
      // Stealthfox profile markers
      if (document.documentElement.getAttribute('data-mlid')) return true
      // Multilogin Extension IDs in chrome.runtime
      try {
        const ext = (window as any).chrome?.runtime?.id
        if (ext && /^[a-z]{32}$/.test(ext)) {
          // Known Multilogin extension patterns
          const knownPatterns = ['klnojkgbejmnphdcdlphbnefdkajnpml']
          if (knownPatterns.includes(ext)) return true
        }
      } catch {
        // no chrome runtime
      }
      return false
    },
  },

  // ── GoLogin specific ──
  {
    name: 'gologin_traces',
    weight: 5,
    tool: 'gologin',
    check() {
      if ((window as any).__gologin) return true
      if ((window as any).gologin) return true
      // GoLogin uses Orbita browser (Chromium fork)
      if (/Orbita/i.test(navigator.userAgent)) return true
      // GoLogin injects specific localStorage keys
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('gologin_') || key?.startsWith('gl_')) return true
        }
      } catch {
        // storage unavailable
      }
      return false
    },
  },

  // ── Dolphin Anty specific ──
  {
    name: 'dolphin_anty_traces',
    weight: 5,
    tool: 'dolphin-anty',
    check() {
      if ((window as any).__dolphin) return true
      if ((window as any).dolphinAnty) return true
      // Dolphin uses a custom Chromium build
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('dolphin_')) return true
        }
      } catch {
        // storage unavailable
      }
      return false
    },
  },

  // ── Linken Sphere specific ──
  {
    name: 'linken_sphere_traces',
    weight: 5,
    tool: 'linken-sphere',
    check() {
      if ((window as any).__linken) return true
      if ((window as any).lsBrowser) return true
      // Linken Sphere uses Chromium with specific modifications
      if (/LinkenSphere/i.test(navigator.userAgent)) return true
      return false
    },
  },

  // ── Incogniton specific ──
  {
    name: 'incogniton_traces',
    weight: 5,
    tool: 'incogniton',
    check() {
      if ((window as any).__incogniton) return true
      if ((window as any).incognitonBrowser) return true
      return false
    },
  },

  // ── VMLogin specific ──
  {
    name: 'vmlogin_traces',
    weight: 5,
    tool: 'vmlogin',
    check() {
      if ((window as any).__vmlogin) return true
      if ((window as any).vmBrowser) return true
      return false
    },
  },

  // ── AdsPower specific ──
  {
    name: 'adspower_traces',
    weight: 5,
    tool: 'adspower',
    check() {
      if ((window as any).__adspower) return true
      if ((window as any).sunBrowser) return true // AdsPower's SunBrowser
      // AdsPower uses specific extension
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('adspower_') || key?.startsWith('sun_')) return true
        }
      } catch {
        // storage unavailable
      }
      return false
    },
  },

  // ── Generic anti-detect heuristics ──

  // Canvas noise pattern detection
  // Anti-detect browsers inject deterministic (not random) noise
  {
    name: 'deterministic_canvas_noise',
    weight: 3,
    check() {
      try {
        const results: string[] = []
        for (let i = 0; i < 3; i++) {
          const c = document.createElement('canvas')
          c.width = 50
          c.height = 15
          const ctx = c.getContext('2d')!
          ctx.font = '12px Arial'
          ctx.fillText('test', 0, 12)
          results.push(c.toDataURL())
        }
        // If all 3 renders are identical, no noise
        // If all 3 are different, random noise (Brave)
        // If 2+ are same but differ from baseline in a specific way,
        // it's deterministic noise (anti-detect profile)
        const unique = new Set(results).size
        // We can't detect deterministic noise with just 3 samples from ourselves
        // but we can detect if the results are suspiciously consistent
        // while having unusual pixel patterns
        return false // This check needs baseline comparison — resolved via component analysis
      } catch {
        return false
      }
    },
  },

  // WebGL parameter inconsistency
  // Anti-detect browsers spoof the renderer but forget about parameters
  {
    name: 'webgl_param_inconsistency',
    weight: 3,
    check(components) {
      if (!components) return false
      const webgl = components.webgl?.value as any
      if (!webgl?.renderer || !webgl?.params) return false

      const renderer = (webgl.renderer as string).toLowerCase()

      // Intel integrated GPUs have specific parameter ranges
      if (renderer.includes('intel') && webgl.maxTextureSize > 16384) return true

      // Mobile GPUs (Adreno, Mali, PowerVR) with desktop-level params
      const isMobileGPU = /adreno|mali|powervr|apple gpu/i.test(renderer)
      if (isMobileGPU && webgl.maxTextureSize > 8192) return true

      // NVIDIA/AMD with suspiciously low limits
      const isDesktopGPU = /nvidia|amd|radeon|geforce/i.test(renderer)
      if (isDesktopGPU && webgl.maxTextureSize < 4096) return true

      return false
    },
  },

  // Platform/OS vs GPU mismatch
  // Anti-detect browsers spoof platform but not GPU
  {
    name: 'platform_gpu_mismatch',
    weight: 4,
    check(components) {
      if (!components) return false
      const nav = components.navigator?.value as any
      const webgl = components.webgl?.value as any
      if (!nav?.platform || !webgl?.renderer) return false

      const platform = nav.platform.toLowerCase()
      const renderer = (webgl.renderer as string).toLowerCase()

      // macOS platform with Windows-only GPU driver strings
      if (platform.includes('mac') && renderer.includes('d3d')) return true
      // Windows platform with Metal renderer
      if (platform.includes('win') && renderer.includes('metal')) return true
      // Linux platform with DirectX
      if (platform.includes('linux') && renderer.includes('d3d')) return true

      return false
    },
  },

  // Chrome version vs feature support mismatch
  {
    name: 'browser_version_feature_mismatch',
    weight: 2,
    check(components) {
      if (!components) return false
      const nav = components.navigator?.value as any
      if (!nav?.userAgent) return false

      const match = nav.userAgent.match(/Chrome\/(\d+)/)
      if (!match) return false
      const version = parseInt(match[1], 10)

      // Old Chrome version but has modern APIs
      if (version < 90) {
        if (typeof (navigator as any).userAgentData !== 'undefined') return true
        if ('gpu' in navigator) return true
      }

      return false
    },
  },

  // Timezone vs language mismatch with impossible combo
  {
    name: 'impossible_locale_combo',
    weight: 2,
    check(components) {
      if (!components) return false
      const nav = components.navigator?.value as any
      const timing = components.timing?.value as any
      if (!nav?.languages || !timing?.timezone) return false

      const tz = timing.timezone as string
      const lang = nav.languages[0] as string
      if (!lang) return false

      // Chinese language with European timezone and English platform
      // This specific combo is common in anti-detect profiles
      const isChineseLang = lang.startsWith('zh')
      const isEuropeanTz = tz.startsWith('Europe/')
      const isEnglishPlatform = nav.platform === 'Win32'
      if (isChineseLang && isEuropeanTz && isEnglishPlatform) return true

      return false
    },
  },

  // Proxy/CDP detection — anti-detect tools use CDP to control the browser
  {
    name: 'cdp_connection_detected',
    weight: 3,
    check() {
      // Chrome DevTools Protocol leaves specific traces
      try {
        // Runtime.enable adds __proto__ pollution in some cases
        if ((window as any)._cdpConnection) return true
        // Some anti-detect browsers expose debugging port info
        if ((window as any).__cdp_port) return true

        // Check for debugger statement timing
        // Debuggers attached via CDP slow down debugger statements significantly
        const t1 = performance.now()
        // We can't actually use debugger statement here reliably
        // but we can check for specific CDP artifacts
        const t2 = performance.now()
        if (t2 - t1 > 100) return true
      } catch {
        return false
      }
      return false
    },
  },

  // Too-perfect fingerprint
  // Real browsers have quirks; anti-detect profiles are sometimes too clean
  {
    name: 'too_perfect_profile',
    weight: 2,
    check(components) {
      if (!components) return false

      // Every single collector succeeded with non-null values = suspicious
      // Real browsers always have at least one failed/blocked collector
      const entries = Object.values(components)
      const allSucceeded = entries.every((c) => c.value !== null)
      const totalCollectors = entries.length

      // If we have 15+ collectors and ALL succeeded, it's suspiciously perfect
      if (totalCollectors >= 15 && allSucceeded) return true

      return false
    },
  },
]

export function detectAntiDetect(components?: FingerprintComponents): AntiDetectResult {
  const signals: string[] = []
  let totalWeight = 0
  let matchedWeight = 0
  const toolVotes: Map<NonNullable<AntiDetectResult['tool']>, number> = new Map()

  for (const rule of RULES) {
    totalWeight += rule.weight
    try {
      if (rule.check(components)) {
        signals.push(rule.name)
        matchedWeight += rule.weight
        if (rule.tool) {
          toolVotes.set(rule.tool, (toolVotes.get(rule.tool) ?? 0) + rule.weight)
        }
      }
    } catch {
      // skip failing rules
    }
  }

  const confidence = totalWeight > 0
    ? Math.round((matchedWeight / totalWeight) * 100) / 100
    : 0

  const detected = confidence >= 0.15

  // Determine which tool (if any)
  let tool: AntiDetectResult['tool'] = null
  if (detected) {
    let maxVotes = 0
    for (const [name, votes] of toolVotes) {
      if (votes > maxVotes) {
        maxVotes = votes
        tool = name
      }
    }
    if (!tool && signals.length > 0) {
      tool = 'unknown'
    }
  }

  return { detected, tool, confidence, signals }
}
