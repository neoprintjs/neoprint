# Types

All types are exported from the `neoprint` package.

```ts
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
  CollectorResult,
  Collector,
  FingerprintComponents,
  NoiseReport,
  ServerHints,
  ConfidenceBreakdown,
  EntropyBreakdown,
  AntiDetectResult,
  LifecycleLink,
} from 'neoprint'
```

## Core Types

### Fingerprint

```ts
interface Fingerprint {
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
```

### NeoprintOptions

```ts
interface NeoprintOptions {
  collectors?: string[]
  timeout?: number
  mode?: 'full' | 'privacy' | 'incognito-resistant'
  debug?: boolean
}
```

### CollectorResult

```ts
interface CollectorResult {
  value: unknown
  duration: number
  entropy: number
  stability: number
}
```

## Analysis Types

### CompareResult

```ts
interface CompareResult {
  score: number     // 0–1
  diff: string[]    // collectors that differ
  matching: string[] // collectors that match
}
```

### SpoofingResult

```ts
interface SpoofingResult {
  isLikely: boolean
  score: number
  signals: string[]
}
```

### BotResult

```ts
interface BotResult {
  isBot: boolean
  score: number
  signals: string[]
}
```

### AntiDetectResult

```ts
interface AntiDetectResult {
  detected: boolean
  tool: 'multilogin' | 'gologin' | 'dolphin-anty' | 'linken-sphere'
       | 'incogniton' | 'vmlogin' | 'adspower' | 'unknown' | null
  confidence: number
  signals: string[]
}
```

### EnvironmentResult

```ts
interface EnvironmentResult {
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
```

### ServerHints

```ts
interface ServerHints {
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
```

### LifecycleLink

```ts
interface LifecycleLink {
  linkedTo: string | null
  probability: number
  driftedSignals: string[]
  stableSignals: string[]
  predictedNextDrift: string[]
  decayRate: number
  history: HistoryEntry[]
}
```

### BehaviorProfile

```ts
interface BehaviorProfile {
  typing: { avgDelay: number; rhythm: number[] }
  mouse: { avgSpeed: number; curvature: number; jitter: number }
  scroll: { speed: number; direction: 'up' | 'down' | 'mixed' }
  touch: { pressure: number[]; size: number[] }
}
```
