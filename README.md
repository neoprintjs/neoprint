# neoprint

**Advanced browser fingerprinting library** — open-source, modular, and privacy-aware.

Neoprint collects 19+ browser signals, computes a stable device identifier, and provides spoofing detection, bot detection, behavioral biometrics, and environment profiling — all in a single zero-dependency package.

[![npm version](https://img.shields.io/npm/v/@neoprintjs/core.svg)](https://www.npmjs.com/package/@neoprintjs/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@neoprintjs/core)](https://bundlephobia.com/package/@neoprintjs/core)
[![license](https://img.shields.io/npm/l/@neoprintjs/core.svg)](https://github.com/neoprintjs/neoprint/blob/main/LICENSE)

---

## Table of contents

- [Why neoprint?](#why-neoprint)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API](#api)
- [Behavioral biometrics](#behavioral-biometrics)
- [Session linking](#session-linking)
- [Three IDs for different use cases](#three-ids-for-different-use-cases)
- [Noise detection](#noise-detection)
- [Incognito detection](#incognito-detection)
- [Protocol-aware collection](#protocol-aware-collection)
- [Server-side validation](#server-side-validation)
- [Anti-detect browser detection](#anti-detect-browser-detection)
- [Fingerprint lifecycle](#fingerprint-lifecycle)
- [Privacy mode](#privacy-mode)
- [Custom collectors (plugin system)](#custom-collectors-plugin-system)
- [Tree-shaking](#tree-shaking)
- [Debug mode](#debug-mode)
- [Export / import](#export--import)
- [Built-in collectors](#built-in-collectors)
- [Browser support](#browser-support)
- [How it works](#how-it-works)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [License](#license)

---

## Why neoprint?

Most open-source fingerprinting solutions offer a basic hash of ~10 browser properties. Neoprint goes further:

| Feature | Typical open-source | **neoprint** |
|---|---|---|
| Signal count | ~10-15 | **19+ built-in** |
| Multiple ID strategies | No (single hash) | **4 IDs: full, stable, weighted, cross-browser** |
| Cross-browser identification | No | **Same ID across Chrome, Firefox, Safari** |
| Anti-detect browser detection | No | **Multilogin, GoLogin, Dolphin Anty, ...** |
| Fingerprint lifecycle | No | **Drift prediction, auto-linking, decay rate** |
| Confidence scoring | No | **Per-collector stability + overall score** |
| Spoofing detection | No | **Cross-signal inconsistency analysis** |
| Bot detection | No | **30+ automation signals** |
| Noise detection | No | **Canvas/audio noise injection detection** |
| Incognito resistance | No (different hash) | **Same hash in normal and incognito** |
| Protocol-aware | No (HTTP != HTTPS) | **Auto-excludes HTTPS-only APIs on HTTP** |
| Server-side validation | No | **Checksums + environment hints** |
| Behavioral biometrics | No | **Typing, mouse, scroll, touch** |
| Environment profiling | Basic UA parsing | **OS/browser/VM/privacy tool detection** |
| Fuzzy comparison | No | **Tolerates minor browser updates** |
| Session linking | No | **Multi-storage persistence with fallbacks** |
| Plugin system | No | **Custom collectors with full API** |
| Privacy mode | No | **GDPR-friendly subset of signals** |
| Modular / tree-shakeable | Rarely | **Yes — import only what you need** |

---

## Installation

```bash
npm install @neoprintjs/core
```

```bash
yarn add @neoprintjs/core
```

```bash
pnpm add @neoprintjs/core
```

---

## Quick start

```ts
import neoprint from '@neoprintjs/core'

// Generate a full fingerprint
const fp = await neoprint.get()

console.log(fp.id)             // "a3f8c91b2d4e7f0612ab34cd56789012"
console.log(fp.stableId)       // "b7e2f41a..." (survives browser updates)
console.log(fp.weightedId)     // "c9d3a82b..." (reduces collisions)
console.log(fp.crossBrowserId) // "d1e4f56a..." (same across Chrome/Firefox/Safari)
console.log(fp.confidence)     // 0.87
console.log(fp.entropy)        // 94.5 bits
console.log(fp.spoofingScore)  // 0.0 (clean) ... 1.0 (likely spoofed)
console.log(fp.components)     // { canvas: {...}, webgl: {...}, ... }
```

---

## API

### `neoprint.get(options?)`

Generate a browser fingerprint.

```ts
const fp = await neoprint.get({
  collectors: ['canvas', 'webgl', 'audio', 'math'],  // optional subset
  timeout: 5000,       // ms per collector (default: 5000)
  mode: 'full',        // 'full' | 'privacy' | 'incognito-resistant'
  debug: false,        // log details to console
})
```

**Returns** a `Fingerprint` object:

```ts
interface Fingerprint {
  id: string              // full 128-bit hex hash
  stableId: string        // update-resistant hash (math, webgl, fonts, intl)
  weightedId: string      // entropy-weighted hash (fewer collisions)
  crossBrowserId: string  // hardware-only hash (same across browsers)
  confidence: number      // 0–1, how reliable the fingerprint is
  spoofingScore: number   // 0–1, likelihood of spoofing
  entropy: number         // total bits of entropy
  components: {           // raw collector results
    [name: string]: {
      value: unknown
      duration: number    // ms
      entropy: number     // bits contributed
      stability: number   // 0–1, how stable over time
    }
  }
  timestamp: number
}
```

### `neoprint.compare(fp1, fp2)`

Fuzzy comparison of two fingerprints. Tolerates minor changes (browser updates, screen rotation) instead of treating them as a completely different user.

```ts
const result = neoprint.compare(oldFp, newFp)

console.log(result.score)     // 0.92 (92% match)
console.log(result.matching)  // ['canvas', 'webgl', 'math', ...]
console.log(result.diff)      // ['screen', 'network']
```

### `neoprint.detectSpoofing(fp)`

Cross-references signals to find inconsistencies that indicate fingerprint tampering.

```ts
const spoof = neoprint.detectSpoofing(fp)

console.log(spoof.isLikely)  // true / false
console.log(spoof.score)     // 0.0 – 1.0
console.log(spoof.signals)   // ['gpu_vendor_mismatch', 'platform_ua_mismatch', ...]
```

**Detected inconsistencies:**
- GPU vendor mismatch (WebGL vs WebGPU)
- Platform vs User-Agent mismatch
- WebDriver flag presence
- Touch points vs screen size mismatch
- Memory vs CPU cores mismatch
- Canvas/audio blocking patterns
- Timer precision anomalies (resistFingerprinting)
- Unusual font count

### `neoprint.detectBot(fp?)`

Detects automated browsers, headless Chrome, Puppeteer, Playwright, Selenium, and other bot frameworks.

```ts
const bot = neoprint.detectBot(fp)

console.log(bot.isBot)    // true / false
console.log(bot.score)    // 0.0 – 1.0
console.log(bot.signals)  // ['webdriver_present', 'headless_chrome', ...]
```

**Checks 30+ signals** including:
- `navigator.webdriver`
- Phantom, Selenium, Puppeteer, Playwright, Nightmare global variables
- Chrome DevTools Protocol (`$cdc_`) markers
- HeadlessChrome user agent
- Missing Chrome runtime
- Window/screen size anomalies
- Native function `toString()` spoofing
- Error stack trace analysis

### `neoprint.environment()`

Comprehensive environment profiling.

```ts
const env = await neoprint.environment()

console.log(env.type)      // 'desktop' | 'mobile' | 'tablet' | 'bot' | 'vm' | 'emulator'
console.log(env.os)        // { name: 'macOS', version: '15.3', spoofed: false }
console.log(env.browser)   // { name: 'Chrome', version: '131.0', spoofed: false }
console.log(env.vm)        // { detected: true, type: 'vmware' }
console.log(env.privacy)   // { adBlocker: true, trackingProtection: false, ... }
```

**Privacy detection:**
- Ad blocker presence
- Tracking protection (DNT)
- Firefox resistFingerprinting
- Tor Browser heuristics
- VPN likelihood

### `neoprint.benchmark(options?)`

Measure how long each collector takes.

```ts
const bench = await neoprint.benchmark()

// { canvas: 12.5, webgl: 45.2, audio: 89.1, ..., total: 210.3 }
```

---

## Behavioral biometrics

Optional module that profiles how a user interacts with the page — typing rhythm, mouse movement patterns, scroll behavior, and touch characteristics.

```ts
// Start collecting
const collector = neoprint.behavior.start({
  duration: 10000,      // auto-stop after 10s (optional)
  trackTyping: true,
  trackMouse: true,
  trackScroll: true,
  trackTouch: true,
})

// ... user interacts with the page ...

// Get the profile
const profile = collector.collect()

console.log(profile.typing.avgDelay)     // ms between keystrokes
console.log(profile.typing.rhythm)       // array of inter-key delays
console.log(profile.mouse.avgSpeed)      // px/ms
console.log(profile.mouse.curvature)     // average direction change
console.log(profile.mouse.jitter)        // micro-movement ratio
console.log(profile.scroll.speed)        // px/ms
console.log(profile.scroll.direction)    // 'up' | 'down' | 'mixed'
console.log(profile.touch.pressure)      // force values
console.log(profile.touch.size)          // contact radius values

// Stop manually (if no duration was set)
collector.stop()
```

---

## Session linking

Persist fingerprint IDs across sessions with automatic storage fallbacks.

```ts
const session = neoprint.createSession({
  storage: 'indexeddb',    // 'localStorage' | 'sessionStorage' | 'indexeddb' | 'cookie'
  fallback: true,          // try other storage methods if primary fails
})

const fp = await neoprint.get()
const link = await session.identify(fp)

console.log(link.previousId)   // fingerprint ID from last visit (or undefined)
console.log(link.confidence)   // 1.0 if from storage, fp.confidence if from fingerprint
console.log(link.method)       // 'storage' | 'fingerprint' | 'hybrid'

// Clear stored session
await session.clear()
```

---

## Three IDs for different use cases

Neoprint generates three separate fingerprint IDs to solve the most common complaints about fingerprinting libraries:

```ts
const fp = await neoprint.get()

fp.id              // Full hash — all collectors, maximum uniqueness
fp.stableId        // Stable hash — only update-resistant signals (math, webgl, fonts, intl, gpu, speech, css)
fp.weightedId      // Weighted hash — entropy-based weighting, fewer collisions in corporate environments
fp.crossBrowserId  // Hardware hash — same ID across Chrome, Firefox, Safari on the same device
```

| ID | Use case | Survives browser update | Cross-browser | Collision resistance |
|---|---|---|---|---|
| `id` | General identification | No | No | High |
| `stableId` | Long-term user tracking | **Yes** | No | Medium |
| `weightedId` | Corporate/school environments | No | No | **Very high** |
| `crossBrowserId` | Cross-browser identification | **Yes** | **Yes** | Medium |

**Why four?** A single hash changes whenever any signal changes (browser update = new ID = lost user). The `stableId` ignores volatile signals. The `weightedId` prioritizes high-entropy collectors so identical corporate laptops still produce different IDs. The `crossBrowserId` uses only hardware-level signals (GPU chip name, CPU math precision, screen resolution, fonts, timezone, audio sample rate, TTS voice languages) with normalization to absorb browser-specific differences — producing the same ID even when the user switches browsers.

---

## Noise detection

Detect canvas/audio noise injection by anti-fingerprint tools (Brave farbling, Safari ITP, browser extensions).

```ts
const reports = await neoprint.detectNoise()

for (const report of reports) {
  console.log(report.collector)  // 'canvas' | 'audio'
  console.log(report.isNoisy)    // true if noise injection detected
  console.log(report.variance)   // 0.0 (clean) ... 1.0 (fully randomized)
  console.log(report.samples)    // number of test iterations
}
```

When noise is detected, neoprint automatically gives lower weight to noisy collectors in the confidence calculation.

---

## Incognito detection

Detect private/incognito browsing mode across browsers.

```ts
const result = await neoprint.detectIncognito()

console.log(result.isIncognito)  // true / false
console.log(result.signals)     // ['low_storage_quota', 'languages_trimmed', ...]
```

Use `incognito-resistant` mode to automatically exclude signals that change in private browsing:

```ts
const fp = await neoprint.get({ mode: 'incognito-resistant' })
// Excludes: storage, permissions, network, speech
// Result: same fingerprint in normal and incognito mode
```

---

## Protocol-aware collection

Fingerprints differ between HTTP and HTTPS because some APIs (WebGPU, Permissions, Storage) require a secure context. Neoprint automatically detects the protocol and excludes unavailable collectors from the hash.

```ts
// Automatic — no config needed
const fp = await neoprint.get()
// On HTTP: gpu, permissions, storage, webrtc are excluded from hash
// On HTTPS: all collectors included
// Result: same ID regardless of protocol

// Check what's affected
const info = neoprint.protocolInfo()
console.log(info.unavailable)  // ['gpu', 'permissions', ...] (HTTP only)
console.log(info.degraded)     // ['navigator', 'network']
```

---

## Server-side validation

Generate a payload that a backend can use to validate that the fingerprint hasn't been tampered with on the client.

```ts
const fp = await neoprint.get()
const hints = neoprint.serverHints(fp)

// Send to your server
await fetch('/api/validate', {
  method: 'POST',
  body: JSON.stringify(hints),
})
```

The server receives:

```ts
{
  fingerprintId: "a3f8c91b...",
  stableId: "b7e2f41a...",
  timestamp: 1712956800000,
  protocol: "https:",
  collectorChecksums: { canvas: 3829104721, webgl: 1928374650, ... },
  environment: {
    platform: "MacIntel",
    languages: ["en-US", "pl"],
    timezone: "Europe/Warsaw",
    cores: 10,
    memory: 8,
    touchPoints: 0
  }
}
```

**Node.js validation example:**

```js
app.post('/api/validate', (req, res) => {
  const hints = req.body
  const ua = req.headers['user-agent'] || ''
  const acceptLang = req.headers['accept-language'] || ''
  const flags = []

  // 1. Platform vs User-Agent
  const { platform } = hints.environment
  if (platform === 'MacIntel' && !ua.includes('Mac')) flags.push('platform_mismatch')
  if (platform === 'Win32' && !ua.includes('Windows')) flags.push('platform_mismatch')
  if (platform === 'Linux' && !ua.includes('Linux')) flags.push('platform_mismatch')

  // 2. Languages vs Accept-Language
  const primaryLang = hints.environment.languages[0]
  if (primaryLang && !acceptLang.toLowerCase().includes(primaryLang.toLowerCase().split('-')[0])) {
    flags.push('language_mismatch')
  }

  // 3. Fingerprint age
  const ageMs = Date.now() - hints.timestamp
  if (ageMs > 30000) flags.push('stale_fingerprint')

  // 4. Checksum consistency (compare with stored previous visit)
  const stored = db.get(hints.fingerprintId)
  if (stored && stored.checksums.canvas !== hints.collectorChecksums.canvas) {
    flags.push('checksum_changed')
  }

  // 5. Store for future comparison
  db.set(hints.fingerprintId, { checksums: hints.collectorChecksums, ua, timestamp: Date.now() })

  res.json({
    trusted: flags.length === 0,
    flags,
    fingerprintId: hints.fingerprintId,
    stableId: hints.stableId,
  })
})
```

---

## Anti-detect browser detection

Detect fraudulent anti-detect browsers used for multi-accounting, ad fraud, and credential stuffing. No other open-source library offers this.

```ts
const result = neoprint.detectAntiDetect(fp)

console.log(result.detected)     // true / false
console.log(result.tool)         // 'multilogin' | 'gologin' | 'dolphin-anty' | 'linken-sphere' | 'incogniton' | 'vmlogin' | 'adspower' | 'unknown' | null
console.log(result.confidence)   // 0.0 – 1.0
console.log(result.signals)      // ['electron_shell', 'navigator_prototype_tampered', ...]
```

**Detected tools:**
- Multilogin (Mimic / Stealthfox)
- GoLogin (Orbita browser)
- Dolphin Anty
- Linken Sphere
- Incogniton
- VMLogin
- AdsPower (SunBrowser)

**Detection methods:**
- Electron shell detection (most anti-detect tools are Electron-based)
- Prototype chain tampering on Navigator, Screen, WebGL
- Tool-specific global variables and localStorage keys
- WebGL parameter inconsistencies (GPU spoofed but params not matching)
- Platform vs GPU rendering mismatch (macOS claimed but DirectX renderer)
- Browser version vs feature support mismatch
- Chrome DevTools Protocol artifacts
- "Too perfect" profiles (every single collector succeeds — real browsers always have quirks)

---

## Fingerprint lifecycle

Track how fingerprints evolve over time. Predict drift, auto-link old and new fingerprints, and calculate decay rates. Solves the #1 problem with fingerprinting: losing users after browser updates.

```ts
const lc = neoprint.lifecycle()

// Record each visit
const fp = await neoprint.get()
lc.record(fp)

// On next visit — auto-link to previous fingerprint
const newFp = await neoprint.get()
const link = lc.link(newFp)

console.log(link.linkedTo)           // "a3f8c91b..." (previous fingerprint ID)
console.log(link.probability)        // 0.94 (94% likely same user)
console.log(link.driftedSignals)     // ['canvas', 'navigator'] (what changed)
console.log(link.stableSignals)      // ['webgl', 'math', 'fonts', ...] (what stayed)
console.log(link.predictedNextDrift) // ['audio', 'media'] (likely to change next)
console.log(link.decayRate)          // 0.02 (fingerprint changes per day)
```

**Stability report** — see how each signal behaves over time:

```ts
const report = lc.getStabilityReport()
// {
//   canvas:    { driftCount: 3, lastDrifted: 1712956800000, stability: 0.85 },
//   navigator: { driftCount: 5, lastDrifted: 1712870400000, stability: 0.75 },
//   math:      { driftCount: 0, lastDrifted: 0, stability: 1.0 },
//   ...
// }
```

**How it works:**
1. Each fingerprint is recorded with per-collector hashes
2. On new visit, every collector is compared against all historical snapshots
3. Best match is found via overlap score, boosted by stableId/crossBrowserId match
4. Signals that change most often are predicted to drift next
5. Decay rate = ID changes per day over the recording period
6. History is persisted in localStorage (max 50 snapshots)

---

## Privacy mode

Restrict collection to non-invasive signals only. Excludes canvas, WebGL, audio, WebRTC, DOMRect, and SVG rendering.

```ts
const fp = await neoprint.get({ mode: 'privacy' })

// Only collects: navigator, screen, fonts, timing, media, storage,
// network, math, intl, cssFeatures, permissions, speech, gpu
```

---

## Custom collectors (plugin system)

Extend neoprint with your own signals.

```ts
neoprint.register('mySignal', {
  async collect() {
    const value = await getMyCustomData()
    return { value, entropy: 5 }
  },
  stability: 0.8,
})

// Now included in neoprint.get() automatically
const fp = await neoprint.get()
console.log(fp.components.mySignal)

// Remove a collector
neoprint.unregister('mySignal')

// List all registered collectors
console.log(neoprint.collectors())
```

---

## Tree-shaking

Import only what you need for smaller bundles:

```ts
import { get, detectBot, compare } from '@neoprintjs/core'

const fp = await get()
const bot = detectBot(fp)
```

---

## Debug mode

```ts
// Option 1: pass debug flag
const fp = await neoprint.get({ debug: true })

// Option 2: debug an existing fingerprint
await neoprint.debug(fp)
// Logs: ID, confidence breakdown, entropy per collector,
// spoofing signals, bot signals, environment details
```

---

## Export / import

Serialize fingerprints for storage or transmission.

```ts
const json = neoprint.export(fp)    // JSON string
const restored = neoprint.import(json)

// Compare across time
const similarity = neoprint.compare(restored, newFp)
```

---

## Built-in collectors

| Collector | Signals | Entropy | Stability |
|---|---|---|---|
| `canvas` | 2D rendering, gradients, emoji | ~10 bits | 0.85 |
| `webgl` | GPU vendor/renderer, extensions, limits | ~12 bits | 0.95 |
| `audio` | OfflineAudioContext oscillator | ~8 bits | 0.80 |
| `fonts` | 48 font families via measureText | ~12 bits | 0.90 |
| `screen` | Resolution, DPR, HDR, color gamut, preferences | ~6 bits | 0.70 |
| `navigator` | UA, platform, languages, memory, concurrency | ~8 bits | 0.75 |
| `timing` | Timer precision, timezone, Date resolution | ~5 bits | 0.60 |
| `media` | Video/audio codec support, devices | ~7 bits | 0.85 |
| `storage` | Storage availability, quota, private browsing | ~4 bits | 0.60 |
| `network` | Connection type, RTT, downlink | ~3 bits | 0.30 |
| `gpu` | WebGPU adapter info, features, limits | ~10 bits | 0.90 |
| `math` | Math function precision (22 operations) | ~6 bits | 0.95 |
| `intl` | Locale, timezone, numbering system, API support | ~5 bits | 0.85 |
| `cssFeatures` | CSS.supports() for 20 modern features | ~4 bits | 0.80 |
| `permissions` | Permission states for 14 APIs | ~5 bits | 0.65 |
| `speech` | Available TTS voices (name, lang, local) | ~10 bits | 0.90 |
| `domRect` | getBoundingClientRect precision | ~6 bits | 0.75 |
| `svg` | SVG rendering + text BBox differences | ~7 bits | 0.80 |
| `webrtc` | ICE candidate types (no raw IPs exposed) | ~4 bits | 0.50 |

**Total: ~130+ bits of entropy** — enough to uniquely identify >1 billion devices.

---

## Browser support

| Browser | Version | Notes |
|---|---|---|
| Chrome | 80+ | Full support |
| Firefox | 78+ | Some signals limited with resistFingerprinting |
| Safari | 14+ | No WebGPU, limited WebRTC |
| Edge | 80+ | Full support |
| Opera | 67+ | Full support |
| Mobile Chrome | 80+ | Full support |
| Mobile Safari | 14+ | Limited audio, no WebGPU |

Neoprint gracefully degrades — if a collector fails or is blocked, it returns `null` and the remaining collectors still contribute to the fingerprint.

---

## How it works

1. **Collection** — Each collector independently gathers its signal within a timeout
2. **Hashing** — All values are combined and hashed with MurmurHash3 (4 rounds → 128-bit hex ID)
3. **Analysis** — Confidence, entropy, and spoofing scores are computed by cross-referencing signals
4. **Result** — A single `Fingerprint` object with the ID, scores, and raw component data

---

## Versioning

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and automated releases via [release-it](https://github.com/release-it/release-it).

```bash
# Commit examples:
git commit -m "feat: add WebTransport collector"    # → minor version bump
git commit -m "fix: handle Safari audio context"    # → patch version bump
git commit -m "feat!: redesign plugin API"          # → major version bump
```

---

## Contributing

Contributions are welcome. Please use conventional commit messages.

```bash
git clone https://github.com/neoprintjs/neoprint.git
cd neoprint
npm install
npm run dev        # watch mode
npm run test       # run tests
npm run build      # production build
npm run lint       # type check
```

---

## License

[MIT](LICENSE) — Kacper Stawiński
