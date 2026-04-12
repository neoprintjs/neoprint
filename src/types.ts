export interface CollectorResult {
  value: unknown
  duration: number
  entropy: number
  stability: number
}

export interface Collector {
  name: string
  collect(): Promise<CollectorResult>
}

export interface FingerprintComponents {
  [key: string]: CollectorResult
}

export interface Fingerprint {
  id: string
  stableId: string
  weightedId: string
  crossBrowserId: string
  confidence: number
  spoofingScore: number
  entropy: number
  components: FingerprintComponents
  timestamp: number
}

export interface CompareResult {
  score: number
  diff: string[]
  matching: string[]
}

export interface SpoofingResult {
  isLikely: boolean
  score: number
  signals: string[]
}

export interface BotResult {
  isBot: boolean
  score: number
  signals: string[]
}

export interface EnvironmentResult {
  type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'vm' | 'emulator' | 'unknown'
  os: { name: string; version: string; spoofed: boolean }
  browser: { name: string; version: string; spoofed: boolean }
  vm: { detected: boolean; type?: string }
  privacy: {
    adBlocker: boolean
    trackingProtection: boolean
    resistFingerprinting: boolean
    tor: boolean
    vpn: 'likely' | 'unlikely' | 'unknown'
  }
}

export interface BehaviorProfile {
  typing: { avgDelay: number; rhythm: number[] }
  mouse: { avgSpeed: number; curvature: number; jitter: number }
  scroll: { speed: number; direction: 'up' | 'down' | 'mixed' }
  touch: { pressure: number[]; size: number[] }
}

export interface SessionLink {
  previousId?: string
  confidence: number
  method: 'fingerprint' | 'storage' | 'hybrid'
}

export interface NeoprintOptions {
  collectors?: string[]
  timeout?: number
  mode?: 'full' | 'privacy' | 'incognito-resistant'
  debug?: boolean
  worker?: boolean
}

export interface NoiseReport {
  collector: string
  isNoisy: boolean
  variance: number
  samples: number
}

export interface ServerHints {
  fingerprintId: string
  stableId: string
  timestamp: number
  protocol: string
  expectedRanges: Record<string, { type: string; checksum: number }>
  collectorChecksums: Record<string, number>
  environment: {
    platform: string
    languages: string[]
    timezone: string
    cores: number
    memory: number | null
    touchPoints: number
  }
}

export interface PluginCollector {
  collect(): Promise<{ value: unknown; entropy: number }>
  stability?: number
}

export interface BenchmarkResult {
  [collector: string]: number
  total: number
}
