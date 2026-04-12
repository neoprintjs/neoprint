import type { Fingerprint } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

export interface LifecycleLink {
  linkedTo: string | null
  probability: number
  driftedSignals: string[]
  stableSignals: string[]
  predictedNextDrift: string[]
  decayRate: number
  history: HistoryEntry[]
}

interface HistoryEntry {
  id: string
  stableId: string
  crossBrowserId: string
  timestamp: number
  componentHashes: Record<string, number>
}

interface DriftRecord {
  signal: string
  driftCount: number
  lastDrifted: number
}

const STORAGE_KEY = '__neoprint_lifecycle__'

export class LifecycleManager {
  private history: HistoryEntry[] = []
  private driftHistory: DriftRecord[] = []

  constructor() {
    this.load()
  }

  /**
   * Record a fingerprint snapshot for drift tracking.
   */
  record(fp: Fingerprint): void {
    const entry = this.toHistoryEntry(fp)

    // Compare with last entry to track drift
    if (this.history.length > 0) {
      const prev = this.history[this.history.length - 1]!
      this.trackDrift(prev, entry)
    }

    this.history.push(entry)

    // Keep max 50 entries
    if (this.history.length > 50) {
      this.history = this.history.slice(-50)
    }

    this.save()
  }

  /**
   * Attempt to link a new fingerprint to a previously recorded one.
   */
  link(fp: Fingerprint): LifecycleLink {
    const entry = this.toHistoryEntry(fp)

    if (this.history.length === 0) {
      return {
        linkedTo: null,
        probability: 0,
        driftedSignals: [],
        stableSignals: Object.keys(entry.componentHashes),
        predictedNextDrift: this.predictNextDrift(),
        decayRate: 0,
        history: [],
      }
    }

    // Find the best match in history
    let bestMatch: HistoryEntry | null = null
    let bestScore = 0
    let bestDrifted: string[] = []
    let bestStable: string[] = []

    for (const prev of this.history) {
      const { score, drifted, stable } = this.compareEntries(prev, entry)
      if (score > bestScore) {
        bestScore = score
        bestMatch = prev
        bestDrifted = drifted
        bestStable = stable
      }
    }

    // Calculate decay rate (fingerprint changes per day)
    const decayRate = this.calcDecayRate()

    return {
      linkedTo: bestMatch && bestScore >= 0.5 ? bestMatch.id : null,
      probability: Math.round(bestScore * 100) / 100,
      driftedSignals: bestDrifted,
      stableSignals: bestStable,
      predictedNextDrift: this.predictNextDrift(),
      decayRate: Math.round(decayRate * 1000) / 1000,
      history: this.history.map((h) => ({
        ...h,
        componentHashes: {}, // Don't expose full hashes
      })),
    }
  }

  /**
   * Get stability analysis for all tracked signals.
   */
  getStabilityReport(): Record<string, { driftCount: number; lastDrifted: number; stability: number }> {
    const report: Record<string, { driftCount: number; lastDrifted: number; stability: number }> = {}
    const totalSnapshots = Math.max(this.history.length - 1, 1)

    for (const drift of this.driftHistory) {
      report[drift.signal] = {
        driftCount: drift.driftCount,
        lastDrifted: drift.lastDrifted,
        stability: Math.round((1 - drift.driftCount / totalSnapshots) * 100) / 100,
      }
    }

    return report
  }

  /**
   * Clear all stored lifecycle data.
   */
  clear(): void {
    this.history = []
    this.driftHistory = []
    this.save()
  }

  private toHistoryEntry(fp: Fingerprint): HistoryEntry {
    const componentHashes: Record<string, number> = {}
    for (const [name, comp] of Object.entries(fp.components)) {
      if (comp.value !== null) {
        componentHashes[name] = murmurhash3(JSON.stringify(comp.value))
      }
    }

    return {
      id: fp.id,
      stableId: fp.stableId,
      crossBrowserId: fp.crossBrowserId,
      timestamp: fp.timestamp,
      componentHashes,
    }
  }

  private trackDrift(prev: HistoryEntry, curr: HistoryEntry): void {
    const allKeys = new Set([
      ...Object.keys(prev.componentHashes),
      ...Object.keys(curr.componentHashes),
    ])

    for (const key of allKeys) {
      const prevHash = prev.componentHashes[key]
      const currHash = curr.componentHashes[key]

      if (prevHash !== currHash) {
        const existing = this.driftHistory.find((d) => d.signal === key)
        if (existing) {
          existing.driftCount++
          existing.lastDrifted = curr.timestamp
        } else {
          this.driftHistory.push({
            signal: key,
            driftCount: 1,
            lastDrifted: curr.timestamp,
          })
        }
      }
    }
  }

  private compareEntries(
    prev: HistoryEntry,
    curr: HistoryEntry,
  ): { score: number; drifted: string[]; stable: string[] } {
    const allKeys = new Set([
      ...Object.keys(prev.componentHashes),
      ...Object.keys(curr.componentHashes),
    ])

    const drifted: string[] = []
    const stable: string[] = []

    for (const key of allKeys) {
      if (prev.componentHashes[key] === curr.componentHashes[key]) {
        stable.push(key)
      } else {
        drifted.push(key)
      }
    }

    const total = allKeys.size
    // Weighted score: stable ID and cross-browser ID match boost the score
    let score = total > 0 ? stable.length / total : 0

    // Bonus for matching stable/cross-browser IDs
    if (prev.stableId === curr.stableId) score = Math.min(score + 0.15, 1)
    if (prev.crossBrowserId === curr.crossBrowserId) score = Math.min(score + 0.1, 1)

    return { score, drifted, stable }
  }

  private predictNextDrift(): string[] {
    // Signals that have drifted most frequently are most likely to drift next
    return this.driftHistory
      .sort((a, b) => b.driftCount - a.driftCount)
      .slice(0, 5)
      .map((d) => d.signal)
  }

  private calcDecayRate(): number {
    if (this.history.length < 2) return 0

    const first = this.history[0]!
    const last = this.history[this.history.length - 1]!
    const daysDiff = (last.timestamp - first.timestamp) / (1000 * 60 * 60 * 24)

    if (daysDiff <= 0) return 0

    // Count total ID changes
    let changes = 0
    for (let i = 1; i < this.history.length; i++) {
      if (this.history[i]!.id !== this.history[i - 1]!.id) {
        changes++
      }
    }

    return changes / daysDiff
  }

  private save(): void {
    try {
      const data = JSON.stringify({
        history: this.history,
        driftHistory: this.driftHistory,
      })
      localStorage.setItem(STORAGE_KEY, data)
    } catch {
      // localStorage unavailable
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        this.history = data.history ?? []
        this.driftHistory = data.driftHistory ?? []
      }
    } catch {
      // localStorage unavailable or corrupted
    }
  }
}
