# API Overview

## Default Export

```ts
import neoprint from 'neoprint'
```

## Named Exports (tree-shakeable)

```ts
import {
  get,
  compare,
  detectSpoofing,
  detectBot,
  detectAntiDetect,
  detectNoise,
  detectIncognito,
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
  exportFp,
  importFp,
} from 'neoprint'
```

## Quick Reference

| Method | Returns | Description |
|---|---|---|
| `neoprint.get(options?)` | `Promise<Fingerprint>` | Generate fingerprint |
| `neoprint.compare(fp1, fp2)` | `CompareResult` | Fuzzy comparison |
| `neoprint.detectSpoofing(fp)` | `SpoofingResult` | Cross-signal inconsistency check |
| `neoprint.detectBot(fp?)` | `BotResult` | Automation detection |
| `neoprint.detectAntiDetect(fp?)` | `AntiDetectResult` | Anti-detect browser detection |
| `neoprint.detectNoise()` | `Promise<NoiseReport[]>` | Canvas/audio noise detection |
| `neoprint.detectIncognito()` | `Promise<{isIncognito, signals}>` | Private browsing detection |
| `neoprint.environment()` | `Promise<EnvironmentResult>` | OS/browser/VM/privacy profiling |
| `neoprint.benchmark(options?)` | `Promise<BenchmarkResult>` | Collector timing |
| `neoprint.serverHints(fp)` | `ServerHints` | Server validation payload |
| `neoprint.lifecycle()` | `LifecycleManager` | Drift tracking / auto-linking |
| `neoprint.behavior.start(options?)` | `BehaviorCollector` | Behavioral biometrics |
| `neoprint.createSession(options?)` | `SessionManager` | Cross-session persistence |
| `neoprint.register(name, plugin)` | `void` | Add custom collector |
| `neoprint.unregister(name)` | `void` | Remove collector |
| `neoprint.collectors()` | `string[]` | List all collector names |
| `neoprint.protocolInfo()` | `{unavailable, degraded}` | Protocol-affected collectors |
| `neoprint.debug(fp)` | `Promise<void>` | Log details to console |
| `neoprint.export(fp)` | `string` | Serialize to JSON |
| `neoprint.import(json)` | `Fingerprint` | Deserialize from JSON |
