# Spoofing Detection

Detect fingerprint tampering by cross-referencing browser signals for inconsistencies.

## Usage

```ts
const fp = await neoprint.get()
const spoof = neoprint.detectSpoofing(fp)

console.log(spoof.isLikely)  // true / false
console.log(spoof.score)     // 0.0 – 1.0
console.log(spoof.signals)   // ['gpu_vendor_mismatch', ...]
```

## Detection Rules

| Rule | What it catches |
|---|---|
| `gpu_vendor_mismatch` | WebGL vendor differs from WebGPU vendor |
| `platform_ua_mismatch` | Platform says Mac but UA says Windows |
| `webdriver_detected` | `navigator.webdriver` is true |
| `touchpoints_screen_mismatch` | Desktop screen with mobile touch points |
| `memory_concurrency_mismatch` | 16 cores but 2GB RAM |
| `canvas_blocked` | Canvas blocked but WebGL works |
| `audio_blocked` | Audio context unavailable |
| `too_many_fonts` | 100+ fonts detected (font spoofing) |
| `timer_precision_anomaly` | Timer rounded to 100ms (resistFingerprinting) |
