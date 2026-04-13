import type { FingerprintComponents } from '../types.js'
import { hashComponents } from '../core/hash.js'

/**
 * Collectors that are highly stable across browser updates,
 * incognito mode, and minor config changes.
 *
 * Excluded:
 * - speech: Safari returns 0 voices in private mode, breaking stability
 * - screen: availWidth/availHeight change with dock/taskbar
 * - navigator: hardwareConcurrency capped by Safari
 */
const STABLE_COLLECTORS = new Set([
  'math',
  'webgl',
  'fonts',
  'intl',
  'gpu',
  'cssFeatures',
])

/**
 * Compute a stable ID that resists browser updates.
 * Uses only the most stable signals (math precision, GPU params, fonts, intl).
 * This ID changes less frequently than the full ID.
 */
export function computeStableId(components: FingerprintComponents): string {
  const stableValues: Record<string, unknown> = {}

  for (const [name, comp] of Object.entries(components)) {
    if (STABLE_COLLECTORS.has(name) && comp.value !== null) {
      // For WebGL, only use renderer/vendor/params — not extensions (those change)
      if (name === 'webgl') {
        const v = comp.value as any
        stableValues[name] = {
          vendor: v?.vendor,
          renderer: v?.renderer,
          maxTextureSize: v?.maxTextureSize,
          params: v?.params,
        }
      } else {
        stableValues[name] = comp.value
      }
    }
  }

  return hashComponents(stableValues)
}
