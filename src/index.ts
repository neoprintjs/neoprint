import { Engine } from './core/engine.js'
import { allCollectors } from './collectors/index.js'
import { detectSpoofing } from './analysis/inconsistency.js'
import { analyzeConfidence } from './analysis/confidence.js'
import { analyzeEntropy } from './analysis/entropy.js'
import { detectBot } from './analysis/bot.js'
import { detectEnvironment } from './analysis/environment.js'
import { compareFingerprints } from './analysis/compare.js'
import { detectNoise, detectCanvasNoise, detectAudioNoise } from './analysis/noise.js'
import { detectIncognito } from './analysis/incognito.js'
import { getProtocolAffectedCollectors } from './analysis/protocol.js'
import { getServerHints } from './analysis/server-hints.js'
import { detectAntiDetect } from './analysis/anti-detect.js'
import { attestDevice as _attestDevice, verifyIntegrityToken as _verifyToken } from './analysis/attest.js'
import { BehaviorCollector } from './behavior/index.js'
import { SessionManager } from './session/index.js'
import { LifecycleManager } from './lifecycle/index.js'

import type {
  Fingerprint,
  NeoprintOptions,
  CompareResult,
  SpoofingResult,
  BotResult,
  EnvironmentResult,
  BenchmarkResult,
  PluginCollector,
  SessionLink,
  BehaviorProfile,
  NoiseReport,
  ServerHints,
} from './types.js'

// Re-export types
export type {
  Fingerprint,
  NeoprintOptions,
  CompareResult,
  SpoofingResult,
  BotResult,
  EnvironmentResult,
  BenchmarkResult,
  PluginCollector,
  SessionLink,
  BehaviorProfile,
  CollectorResult,
  Collector,
  FingerprintComponents,
  NoiseReport,
  ServerHints,
} from './types.js'

export type { ConfidenceBreakdown } from './analysis/confidence.js'
export type { EntropyBreakdown } from './analysis/entropy.js'
export type { AntiDetectResult } from './analysis/anti-detect.js'
export type { AttestResult, AttestOptions } from './analysis/attest.js'
export type { LifecycleLink } from './lifecycle/index.js'

// Singleton engine
const engine = new Engine()

// Register all built-in collectors
for (const collector of allCollectors) {
  engine.register(collector)
}

/**
 * Generate a browser fingerprint.
 */
async function get(options?: NeoprintOptions): Promise<Fingerprint> {
  const fp = await engine.collect(options)

  // Enrich with spoofing analysis
  const spoofing = detectSpoofing(fp.components)
  fp.spoofingScore = spoofing.score

  // Recalculate confidence with full analysis
  const confidence = analyzeConfidence(fp.components)
  fp.confidence = confidence.overall

  // Recalculate entropy
  const entropy = analyzeEntropy(fp.components)
  fp.entropy = entropy.total

  if (options?.debug) {
    await debug(fp)
  }

  return fp
}

/**
 * Compare two fingerprints for similarity.
 */
function compare(fp1: Fingerprint, fp2: Fingerprint): CompareResult {
  return compareFingerprints(fp1, fp2)
}

/**
 * Detect spoofing based on fingerprint components.
 */
function spoofing(fp: Fingerprint): SpoofingResult {
  return detectSpoofing(fp.components)
}

/**
 * Detect bots and automation.
 */
function bot(fp?: Fingerprint): BotResult {
  return detectBot(fp?.components)
}

/**
 * Detect the current environment.
 */
async function environment(): Promise<EnvironmentResult> {
  return detectEnvironment()
}

/**
 * Benchmark all collectors.
 */
async function benchmark(options?: NeoprintOptions): Promise<BenchmarkResult> {
  return engine.benchmark(options)
}

/**
 * Register a custom plugin collector.
 */
function register(name: string, plugin: PluginCollector): void {
  engine.registerPlugin(name, plugin)
}

/**
 * Unregister a collector by name.
 */
function unregister(name: string): void {
  engine.unregister(name)
}

/**
 * Get all registered collector names.
 */
function collectors(): string[] {
  return engine.getCollectorNames()
}

/**
 * Create a session manager for cross-session persistence.
 */
function createSession(options?: { storage?: 'localStorage' | 'sessionStorage' | 'indexeddb' | 'cookie'; fallback?: boolean }) {
  return new SessionManager(options)
}

/**
 * Create a behavioral biometrics collector.
 */
const behavior = {
  start(options?: { duration?: number; trackTyping?: boolean; trackMouse?: boolean; trackScroll?: boolean; trackTouch?: boolean }) {
    const collector = new BehaviorCollector()
    collector.start(options)
    return collector
  },
}

/**
 * Detect noise injection in canvas/audio (Brave farbling, Safari ITP, etc.)
 */
async function noise(): Promise<NoiseReport[]> {
  return detectNoise()
}

/**
 * Detect incognito / private browsing mode.
 */
async function incognito(): Promise<{ isIncognito: boolean; signals: string[] }> {
  return detectIncognito()
}

/**
 * Get protocol-affected collectors info.
 */
function protocolInfo(): { unavailable: string[]; degraded: string[] } {
  return getProtocolAffectedCollectors()
}

/**
 * Generate server-side validation hints for a fingerprint.
 */
function serverHints(fp: Fingerprint): ServerHints {
  return getServerHints(fp)
}

/**
 * Detect anti-detect browsers (Multilogin, GoLogin, Dolphin Anty, etc.)
 */
function antiDetect(fp?: Fingerprint) {
  return detectAntiDetect(fp?.components)
}

/**
 * Device attestation — single score answering "can I trust this request?"
 */
async function attestDeviceFn(fp: Fingerprint, options?: { strictness?: 'low' | 'medium' | 'high'; challenge?: string }) {
  return _attestDevice(fp, options)
}

/**
 * Verify an integrity token on the server side.
 */
function verifyToken(token: string) {
  return _verifyToken(token)
}

/**
 * Create a lifecycle manager for drift tracking and auto-linking.
 */
function lifecycle() {
  return new LifecycleManager()
}

/**
 * Debug: log fingerprint details to console.
 */
async function debug(fp: Fingerprint): Promise<void> {
  const confidence = analyzeConfidence(fp.components)
  const entropy = analyzeEntropy(fp.components)
  const spoof = detectSpoofing(fp.components)
  const botResult = detectBot(fp.components)
  const env = await detectEnvironment()

  console.group('neoprint debug')
  console.log('ID:', fp.id)
  console.log('Stable ID:', fp.stableId)
  console.log('Weighted ID:', fp.weightedId)
  console.log('Cross-Browser ID:', fp.crossBrowserId)
  console.log('Confidence:', confidence.overall, confidence)
  console.log('Entropy:', entropy.total, 'bits', entropy.topContributors)
  console.log('Spoofing:', spoof)
  console.log('Bot:', botResult)
  console.log('Environment:', env)
  console.log('Components:', fp.components)
  console.groupEnd()
}

/**
 * Export a fingerprint as JSON string.
 */
function exportFp(fp: Fingerprint): string {
  return JSON.stringify(fp)
}

/**
 * Import a fingerprint from JSON string.
 */
function importFp(json: string): Fingerprint {
  return JSON.parse(json) as Fingerprint
}

// Main API object
const neoprint = {
  get,
  compare,
  detectSpoofing: spoofing,
  detectBot: bot,
  detectAntiDetect: antiDetect,
  detectNoise: noise,
  detectIncognito: incognito,
  attestDevice: attestDeviceFn,
  verifyIntegrityToken: verifyToken,
  environment,
  benchmark,
  register,
  unregister,
  collectors,
  createSession,
  behavior,
  lifecycle,
  serverHints,
  protocolInfo,
  debug,
  export: exportFp,
  import: importFp,
} as const

export default neoprint
export { neoprint }

// Named exports for tree-shaking
export {
  get,
  compare,
  spoofing as detectSpoofing,
  bot as detectBot,
  antiDetect as detectAntiDetect,
  noise as detectNoise,
  incognito as detectIncognito,
  environment,
  benchmark,
  register,
  unregister,
  collectors,
  createSession,
  behavior,
  lifecycle,
  attestDeviceFn as attestDevice,
  verifyToken as verifyIntegrityToken,
  serverHints,
  protocolInfo,
  debug,
  exportFp,
  importFp,
}
