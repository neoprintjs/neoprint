# Fingerprint IDs

Neoprint generates **4 different fingerprint IDs**, each optimized for a different use case.

## Overview

```ts
const fp = await neoprint.get()

fp.id              // Full hash — maximum uniqueness
fp.stableId        // Survives browser updates
fp.weightedId      // Fewer collisions in corporate environments
fp.crossBrowserId  // Same across Chrome, Firefox, Safari, Edge
```

| ID | Use case | Survives update | Cross-browser | Collision resistance |
|---|---|---|---|---|
| `id` | General identification | No | No | High |
| `stableId` | Long-term tracking | **Yes** | No | Medium |
| `weightedId` | Corporate/school | No | No | **Very high** |
| `crossBrowserId` | Cross-browser | **Yes** | **Yes** | Medium |

## `id` — Full Hash

Uses all available collectors. Maximum uniqueness but changes when any signal changes (browser update, new font installed, screen resolution change).

**Best for:** Short-term identification, session-level tracking.

## `stableId` — Update-Resistant

Uses only the most stable collectors: `math`, `webgl` (vendor/renderer/params only), `fonts`, `intl`, `gpu`, `cssFeatures`.

`speech` is excluded because Safari returns 0 voices in private browsing, breaking stability.

These signals don't change during browser updates. They only change when:
- Hardware changes (new GPU)
- OS changes (new fonts installed)
- Locale changes

**Best for:** Long-term user identification across browser updates.

## `weightedId` — Collision-Resistant

Each collector's contribution is weighted by its entropy. High-entropy collectors (canvas, WebGL, fonts) have more influence than low-entropy ones (screen, network).

This means that even if 100 corporate laptops have identical screen resolution, the fingerprints still differ because high-entropy signals dominate.

**Best for:** Environments with similar hardware.

## `crossBrowserId` — Cross-Browser

Uses only hardware-level signals that are browser-independent, with normalization to absorb browser differences:
- GPU vendor/renderer — ANGLE strings stripped, model numbers removed, normalized to family name
- WebGL hardware params — GPU limits (maxRenderbuffer, maxUniformVectors, etc.)
- WebGPU limits — texture dimensions, buffer sizes (when available)
- Math precision — rounded to 8 significant digits (V8/SpiderMonkey/JSC tolerance)
- Screen resolution and DPR — colorDepth excluded (differs per browser)
- Timezone and locale — normalized to base language tag
- Installed fonts — browser-bundled fonts filtered out
- Audio sample rate

**Best for:** Identifying the same user across different browsers on the same device.

## Choosing the Right ID

```ts
// One-time visitor identification
const visitorId = fp.id

// User recognition across browser updates
const userId = fp.stableId

// Enterprise fraud detection (similar hardware)
const deviceId = fp.weightedId

// "Is this the same person using Chrome and Firefox?"
const personId = fp.crossBrowserId
```
