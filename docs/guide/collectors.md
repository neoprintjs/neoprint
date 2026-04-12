# Collectors

Neoprint ships with 20 built-in collectors. Each independently gathers a browser signal and reports its entropy and stability.

## Built-in Collectors

| Collector | Signals | Entropy | Stability |
|---|---|---|---|
| `canvas` | 2D rendering, gradients, emoji | ~10 bits | 0.85 |
| `webgl` | GPU vendor/renderer, extensions, limits | ~12 bits | 0.95 |
| `audio` | OfflineAudioContext oscillator | ~8 bits | 0.80 |
| `fonts` | 48 font families via measureText | ~12 bits | 0.90 |
| `screen` | Resolution, DPR, HDR, color gamut | ~6 bits | 0.70 |
| `navigator` | UA, platform, languages, memory | ~8 bits | 0.75 |
| `timing` | Timer precision, timezone | ~5 bits | 0.60 |
| `media` | Video/audio codec support | ~7 bits | 0.85 |
| `storage` | Storage availability, quota | ~4 bits | 0.60 |
| `network` | Connection type, RTT, downlink | ~3 bits | 0.30 |
| `gpu` | WebGPU adapter info, features | ~10 bits | 0.90 |
| `math` | Math function precision (22 ops) | ~6 bits | 0.95 |
| `intl` | Locale, timezone, numbering system | ~5 bits | 0.85 |
| `cssFeatures` | CSS.supports() for 20 features | ~4 bits | 0.80 |
| `permissions` | Permission states for 14 APIs | ~5 bits | 0.65 |
| `speech` | Available TTS voices | ~10 bits | 0.90 |
| `domRect` | getBoundingClientRect precision | ~6 bits | 0.75 |
| `svg` | SVG rendering + text BBox | ~7 bits | 0.80 |
| `webrtc` | ICE candidate types | ~4 bits | 0.50 |
| `hardwarePerf` | CPU micro-benchmarks (float, trig, sort, matrix) | ~4 bits | 0.50 |

**Total: ~135+ bits of entropy** — enough to uniquely identify >1 billion devices.

## Selecting Collectors

```ts
// Use all (default)
const fp = await neoprint.get()

// Use specific collectors
const fp = await neoprint.get({
  collectors: ['canvas', 'webgl', 'math', 'fonts']
})

// Privacy mode — excludes invasive collectors
const fp = await neoprint.get({ mode: 'privacy' })

// Incognito-resistant — excludes volatile collectors
const fp = await neoprint.get({ mode: 'incognito-resistant' })
```

## Custom Collectors

```ts
neoprint.register('mySignal', {
  async collect() {
    const value = await getMyCustomData()
    return { value, entropy: 5 }
  },
  stability: 0.8,
})
```

See the [Plugin System](/guide/plugins) guide for details.
