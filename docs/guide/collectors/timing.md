# Timing Fingerprinting

Timing fingerprinting measures `performance.now()` precision and timezone information. Timer resolution reveals the browser's privacy settings and environment type.

## Collected signals

| Signal | What it measures |
|---|---|
| **timerResolution** | Smallest non-zero diff between `performance.now()` calls (20 samples) |
| **timezoneOffset** | `new Date().getTimezoneOffset()` in minutes |
| **timezone** | `Intl.DateTimeFormat().resolvedOptions().timeZone` (e.g. `Europe/Warsaw`) |
| **dateResolution** | Diff between two `Date.now()` calls |
| **performanceTimeline** | Whether `performance.getEntries()` is available |

## Why timer resolution matters

- **Normal Chrome/Safari**: ~0.005ms (high precision)
- **Firefox resistFingerprinting**: rounded to 100ms
- **VM/emulated environments**: abnormally consistent or zero

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~5 bits |
| **Stability** | 0.60 |
| **Typical duration** | <1ms |

## Web Worker offloading

Timing runs in a Web Worker by default. `performance.now()` is available in Worker contexts.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['timing'] })
const t = fp.components.timing.value

console.log(t.timezone)         // "Europe/Warsaw"
console.log(t.timerResolution)  // 0.005 (normal) or 100 (resistFingerprinting)
```
