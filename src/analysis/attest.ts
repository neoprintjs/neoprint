import type { Fingerprint } from '../types.js'
import { detectSpoofing } from './inconsistency.js'
import { detectBot } from './bot.js'
import { detectAntiDetect } from './anti-detect.js'
import { detectEnvironment } from './environment.js'
import { murmurhash3 } from '../core/hash.js'

export interface AttestOptions {
  strictness?: 'low' | 'medium' | 'high'
  challenge?: string
}

export interface AttestResult {
  score: number
  isHuman: boolean
  isPhysical: boolean
  isAuthentic: boolean
  factors: string[]
  risks: string[]
  integrityToken: string
}

interface Factor {
  name: string
  weight: number
  minStrictness: 'low' | 'medium' | 'high'
  check(fp: Fingerprint, env: any): boolean
}

const STRICTNESS_ORDER = { low: 0, medium: 1, high: 2 } as const

const FACTORS: Factor[] = [
  // ── High weight: Hardware signals (hard to fake) ──
  {
    name: 'real_gpu',
    weight: 15,
    minStrictness: 'low',
    check(fp) {
      const webgl = fp.components.webgl?.value as any
      if (!webgl?.renderer) return false
      const r = webgl.renderer.toLowerCase()
      // Software renderers = not a real GPU
      return !r.includes('swiftshader') && !r.includes('llvmpipe') && !r.includes('software')
    },
  },
  {
    name: 'hardware_perf_realistic',
    weight: 12,
    minStrictness: 'medium',
    check(fp) {
      const perf = fp.components.hardwarePerf?.value as any
      if (!perf) return false
      // All benchmarks should complete in > 0ms (not instant = emulated)
      // and < 500ms (not artificially slowed)
      return Object.values(perf).every((v: any) => typeof v === 'number' && v > 0 && v < 500)
    },
  },
  {
    name: 'audio_context_works',
    weight: 10,
    minStrictness: 'low',
    check(fp) {
      const audio = fp.components.audio?.value as any
      return audio?.sampleRate > 0 && audio?.sum > 0
    },
  },
  {
    name: 'canvas_renders',
    weight: 10,
    minStrictness: 'low',
    check(fp) {
      const canvas = fp.components.canvas?.value
      return typeof canvas === 'string' && canvas.length > 100
    },
  },
  {
    name: 'fonts_detected',
    weight: 8,
    minStrictness: 'low',
    check(fp) {
      const fonts = fp.components.fonts?.value
      return Array.isArray(fonts) && fonts.length >= 3
    },
  },

  // ── Medium weight: Consistency signals (medium effort to fake) ──
  {
    name: 'no_spoofing',
    weight: 12,
    minStrictness: 'low',
    check(fp) {
      const result = detectSpoofing(fp.components)
      return !result.isLikely
    },
  },
  {
    name: 'no_bot',
    weight: 15,
    minStrictness: 'low',
    check(fp) {
      const result = detectBot(fp.components)
      return !result.isBot
    },
  },
  {
    name: 'no_anti_detect',
    weight: 12,
    minStrictness: 'low',
    check(fp) {
      const result = detectAntiDetect(fp.components)
      return !result.detected
    },
  },
  {
    name: 'not_vm',
    weight: 10,
    minStrictness: 'medium',
    check(_fp, env) {
      return !env?.vm?.detected
    },
  },
  {
    name: 'consistent_platform',
    weight: 8,
    minStrictness: 'low',
    check(fp) {
      const nav = fp.components.navigator?.value as any
      if (!nav?.platform || !nav?.userAgent) return true
      const p = nav.platform.toLowerCase()
      const ua = nav.userAgent.toLowerCase()
      if (p.includes('mac') && ua.includes('windows')) return false
      if (p.includes('win') && ua.includes('macintosh')) return false
      return true
    },
  },

  // ── Low weight: Soft signals (easy to fake but still useful) ──
  {
    name: 'webdriver_off',
    weight: 5,
    minStrictness: 'low',
    check(fp) {
      const nav = fp.components.navigator?.value as any
      return nav?.webdriver !== true
    },
  },
  {
    name: 'has_languages',
    weight: 3,
    minStrictness: 'low',
    check(fp) {
      const nav = fp.components.navigator?.value as any
      return Array.isArray(nav?.languages) && nav.languages.length >= 1
    },
  },
  {
    name: 'reasonable_screen',
    weight: 3,
    minStrictness: 'low',
    check(fp) {
      const screen = fp.components.screen?.value as any
      if (!screen) return true
      return screen.width > 0 && screen.height > 0
    },
  },
  {
    name: 'sufficient_entropy',
    weight: 5,
    minStrictness: 'medium',
    check(fp) {
      return fp.entropy >= 50
    },
  },
  {
    name: 'high_confidence',
    weight: 5,
    minStrictness: 'high',
    check(fp) {
      return fp.confidence >= 0.6
    },
  },
  {
    name: 'no_adblock',
    weight: 2,
    minStrictness: 'high',
    check(_fp, env) {
      return !env?.privacy?.adBlocker
    },
  },
]

export async function attestDevice(fp: Fingerprint, options: AttestOptions = {}): Promise<AttestResult> {
  const strictness = options.strictness ?? 'medium'
  const strictnessLevel = STRICTNESS_ORDER[strictness]

  let env: any = null
  try {
    env = await detectEnvironment()
  } catch {
    // environment detection failed
  }

  const factors: string[] = []
  const risks: string[] = []
  let totalWeight = 0
  let passedWeight = 0

  for (const factor of FACTORS) {
    const factorLevel = STRICTNESS_ORDER[factor.minStrictness]
    if (factorLevel > strictnessLevel) continue

    totalWeight += factor.weight

    try {
      if (factor.check(fp, env)) {
        factors.push(factor.name)
        passedWeight += factor.weight
      } else {
        risks.push(factor.name)
      }
    } catch {
      risks.push(factor.name)
    }
  }

  const score = totalWeight > 0
    ? Math.round((passedWeight / totalWeight) * 100) / 100
    : 0

  const isHuman = !detectBot(fp.components).isBot
  const isPhysical = env ? !env.vm.detected : true
  const isAuthentic = !detectAntiDetect(fp.components).detected && !detectSpoofing(fp.components).isLikely

  // Generate integrity token
  const integrityToken = generateIntegrityToken(fp, score, factors, options.challenge)

  return {
    score,
    isHuman,
    isPhysical,
    isAuthentic,
    factors,
    risks,
    integrityToken,
  }
}

/**
 * Generate a tamper-evident integrity token.
 *
 * The token encodes: fingerprint ID, score, factors, timestamp, and challenge.
 * A server can decode and verify this to ensure the client didn't
 * modify the attestation result in the browser console.
 *
 * This is NOT cryptographic security — it's obfuscation that raises
 * the bar for casual tampering. For real security, validate server-side
 * with serverHints().
 */
function generateIntegrityToken(
  fp: Fingerprint,
  score: number,
  factors: string[],
  challenge?: string,
): string {
  const payload = {
    fid: fp.id,
    sid: fp.stableId,
    sc: score,
    fc: factors.length,
    ts: Date.now(),
    ch: challenge ?? null,
  }

  const json = JSON.stringify(payload)
  const hash = murmurhash3(json, 0x5eed)
  const hash2 = murmurhash3(json, hash)

  // Base64 encode payload + hash as signature
  const signed = json + '.' + hash.toString(36) + hash2.toString(36)

  return btoa(signed)
}

/**
 * Decode and verify an integrity token (for server-side use).
 */
export function verifyIntegrityToken(token: string): {
  valid: boolean
  payload: { fid: string; sid: string; sc: number; fc: number; ts: number; ch: string | null } | null
} {
  try {
    const decoded = atob(token)

    const dotIndex = decoded.lastIndexOf('.{') === -1
      ? decoded.indexOf('}.') + 1
      : decoded.lastIndexOf('.{')

    // Find the split point: JSON ends at last '}', signature follows after '.'
    const jsonEnd = decoded.lastIndexOf('}')
    if (jsonEnd === -1) return { valid: false, payload: null }

    const json = decoded.slice(0, jsonEnd + 1)
    const sig = decoded.slice(jsonEnd + 2)

    const hash = murmurhash3(json, 0x5eed)
    const hash2 = murmurhash3(json, hash)
    const expectedSig = hash.toString(36) + hash2.toString(36)

    if (sig !== expectedSig) return { valid: false, payload: null }

    const payload = JSON.parse(json)
    return { valid: true, payload }
  } catch {
    return { valid: false, payload: null }
  }
}
