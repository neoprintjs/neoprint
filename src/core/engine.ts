import type { Collector, CollectorResult, FingerprintComponents, Fingerprint, NeoprintOptions, PluginCollector, BenchmarkResult } from '../types.js'
import { hashComponents } from './hash.js'
import { computeStableId } from '../analysis/stable-id.js'
import { computeWeightedId } from '../analysis/weighted-id.js'
import { computeCrossBrowserId } from '../analysis/cross-browser.js'
import { filterByProtocol } from '../analysis/protocol.js'
import { INCOGNITO_VOLATILE_COLLECTORS } from '../analysis/incognito.js'

const DEFAULT_TIMEOUT = 5000

export class Engine {
  private collectors: Map<string, Collector> = new Map()
  private plugins: Map<string, PluginCollector> = new Map()

  register(collector: Collector): void {
    this.collectors.set(collector.name, collector)
  }

  registerPlugin(name: string, plugin: PluginCollector): void {
    this.plugins.set(name, plugin)
  }

  unregister(name: string): void {
    this.collectors.delete(name)
    this.plugins.delete(name)
  }

  getCollectorNames(): string[] {
    return [
      ...this.collectors.keys(),
      ...this.plugins.keys(),
    ]
  }

  async collect(options: NeoprintOptions = {}): Promise<Fingerprint> {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT
    const selectedNames = options.collectors ?? this.getCollectorNames()
    const privacyBlacklist = new Set(['canvas', 'webgl', 'audio', 'webrtc', 'domRect', 'svg'])

    let names: string[]
    if (options.mode === 'privacy') {
      names = selectedNames.filter((n) => !privacyBlacklist.has(n))
    } else if (options.mode === 'incognito-resistant') {
      names = selectedNames.filter((n) => !INCOGNITO_VOLATILE_COLLECTORS.has(n))
    } else {
      names = selectedNames
    }

    // Filter out collectors unavailable on current protocol (HTTP vs HTTPS)
    names = filterByProtocol(names)

    const components: FingerprintComponents = {}

    const tasks = names.map(async (name) => {
      const collector = this.collectors.get(name)
      const plugin = this.plugins.get(name)
      const source = collector ?? plugin

      if (!source) return

      try {
        const result = await withTimeout(
          collector
            ? collector.collect()
            : this.runPlugin(name, plugin!),
          timeout,
        )
        components[name] = result
      } catch {
        components[name] = {
          value: null,
          duration: 0,
          entropy: 0,
          stability: 0,
        }
      }
    })

    await Promise.all(tasks)

    const values: Record<string, unknown> = {}
    for (const [key, comp] of Object.entries(components)) {
      values[key] = comp.value
    }

    const id = hashComponents(values)
    const stableId = computeStableId(components)
    const weightedId = computeWeightedId(components)
    const crossBrowserId = computeCrossBrowserId(components)
    const confidence = this.calcConfidence(components)
    const entropy = this.calcEntropy(components)
    const spoofingScore = 0 // calculated later by analysis module

    return {
      id,
      stableId,
      weightedId,
      crossBrowserId,
      confidence,
      spoofingScore,
      entropy,
      components,
      timestamp: Date.now(),
    }
  }

  async benchmark(options: NeoprintOptions = {}): Promise<BenchmarkResult> {
    const names = options.collectors ?? this.getCollectorNames()
    const result: BenchmarkResult = { total: 0 }
    let total = 0

    for (const name of names) {
      const collector = this.collectors.get(name)
      if (!collector) continue

      const start = performance.now()
      try {
        await collector.collect()
      } catch {
        // ignore errors during benchmark
      }
      const elapsed = Math.round((performance.now() - start) * 100) / 100
      result[name] = elapsed
      total += elapsed
    }

    result.total = Math.round(total * 100) / 100
    return result
  }

  private async runPlugin(name: string, plugin: PluginCollector): Promise<CollectorResult> {
    const start = performance.now()
    const { value, entropy } = await plugin.collect()
    const duration = Math.round((performance.now() - start) * 100) / 100
    return {
      value,
      duration,
      entropy,
      stability: plugin.stability ?? 0.5,
    }
  }

  private calcConfidence(components: FingerprintComponents): number {
    const entries = Object.values(components)
    if (entries.length === 0) return 0
    const validEntries = entries.filter((c) => c.value !== null)
    if (validEntries.length === 0) return 0
    const avgStability = validEntries.reduce((sum, c) => sum + c.stability, 0) / validEntries.length
    const coverage = validEntries.length / entries.length
    return Math.round(avgStability * coverage * 100) / 100
  }

  private calcEntropy(components: FingerprintComponents): number {
    const entries = Object.values(components)
    return entries.reduce((sum, c) => sum + c.entropy, 0)
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Collector timeout')), ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}
