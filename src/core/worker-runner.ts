/**
 * Worker compatibility layer.
 *
 * Identifies which collectors CAN run in a Web Worker (no DOM needed).
 * Currently all collectors run on the main thread — the Worker offloading
 * was removed because maintaining duplicated collector logic in an inline
 * Worker string was error-prone.
 *
 * The WORKER_COMPATIBLE set is kept for future use (e.g. when bundler-based
 * Worker imports become standard) and for documentation purposes.
 */

import type { FingerprintComponents } from '../types.js'

// Collectors that don't need DOM access
const WORKER_COMPATIBLE = new Set([
  'math',
  'hardwarePerf',
  'timing',
  'intl',
  'network',
])

/**
 * No-op: all collectors run on main thread.
 * Returns empty so engine falls back to main thread execution.
 */
export function runInWorker(_timeout: number = 5000): Promise<FingerprintComponents> {
  return Promise.resolve({})
}

/**
 * Always false — Worker offloading is disabled.
 */
export function isWorkerAvailable(): boolean {
  return false
}

export { WORKER_COMPATIBLE }
