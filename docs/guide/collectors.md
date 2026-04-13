# Collectors

Neoprint ships with 22 built-in collectors. Each independently gathers a browser signal and reports its entropy and stability.

## Built-in Collectors

| Collector | Signals | Entropy | Stability |
|---|---|---|---|
| [`canvas`](/guide/collectors/canvas) | 2D rendering, gradients, emoji | ~10 bits | 0.85 |
| [`webgl`](/guide/collectors/webgl) | GPU vendor/renderer, extensions, limits | ~12 bits | 0.95 |
| [`audio`](/guide/collectors/audio) | OfflineAudioContext oscillator | ~8 bits | 0.80 |
| [`fonts`](/guide/collectors/fonts) | 48 font families via measureText | ~12 bits | 0.90 |
| [`screen`](/guide/collectors/screen) | Resolution, DPR, HDR, color gamut | ~6 bits | 0.70 |
| [`navigator`](/guide/collectors/navigator) | UA, platform, languages, memory | ~8 bits | 0.75 |
| [`timing`](/guide/collectors/timing) | Timer precision, timezone | ~5 bits | 0.60 |
| [`media`](/guide/collectors/media) | Video/audio codec support | ~7 bits | 0.85 |
| [`storage`](/guide/collectors/storage) | Storage availability, quota | ~4 bits | 0.60 |
| [`network`](/guide/collectors/network) | Connection type, RTT, downlink | ~3 bits | 0.30 |
| [`gpu`](/guide/collectors/gpu) | WebGPU adapter info, features | ~10 bits | 0.90 |
| [`math`](/guide/collectors/math) | Math function precision (22 ops) | ~6 bits | 0.95 |
| [`intl`](/guide/collectors/intl) | Locale, timezone, numbering system | ~5 bits | 0.85 |
| [`cssFeatures`](/guide/collectors/css-features) | CSS.supports() for 20 features | ~4 bits | 0.80 |
| [`permissions`](/guide/collectors/permissions) | Permission states for 14 APIs | ~5 bits | 0.65 |
| [`speech`](/guide/collectors/speech) | Available TTS voices | ~10 bits | 0.90 |
| [`domRect`](/guide/collectors/dom-rect) | getBoundingClientRect precision | ~6 bits | 0.75 |
| [`svg`](/guide/collectors/svg) | SVG rendering + text BBox | ~7 bits | 0.80 |
| [`webrtc`](/guide/collectors/webrtc) | ICE candidate types | ~4 bits | 0.50 |
| [`hardwarePerf`](/guide/collectors/hardware-perf) | CPU micro-benchmarks (float, trig, sort, matrix) | ~4 bits | 0.50 |
| [`webglRender`](/guide/collectors/webgl-render) | WebGL 3D scene pixel hash (GPU rendering output) | ~8 bits | 0.85 |
| [`shaderPrecision`](/guide/collectors/shader-precision) | WebGL shader precision format (GPU capability) | ~4 bits | 0.95 |

**Total: ~147 bits of theoretical entropy.** Real-world uniqueness is lower due to signal correlation and non-uniform distribution across populations. Effective uniqueness depends on your user base size and diversity.

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
