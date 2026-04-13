# Cross-Browser Identification

Identify the same user across Chrome, Firefox, Safari, and Edge on the same device.

## How It Works

The `crossBrowserId` uses only **hardware-level signals** that don't change between browsers. All values are **normalized** to absorb browser-specific differences:

- GPU vendor and renderer — ANGLE wrapper stripped, PCI IDs removed, model numbers stripped to family name
- WebGL rendering hash — 3D scene pixel output, identical cross-browser on same GPU (~8 bits extra entropy)
- WebGL hardware params — `maxRenderbufferSize`, `maxFragmentUniformVectors`, `maxVertexAttribs`, etc.
- WebGPU limits — `maxTextureDimension`, `maxBufferSize`, etc. (when available)
- CPU math precision — rounded to 8 significant digits (absorbs V8 vs SpiderMonkey vs JSC diffs)
- Display properties — DPR, HDR, color gamut, touch capability (not screen dimensions — Safari reports viewport size)
- Timezone and locale — locale normalized to base language (`pl-PL` → `pl`)
- Installed fonts — browser-bundled fonts filtered out (Edge adds Roboto)
- Audio sample rate (hardware-dependent)

## What's excluded

These signals differ per browser on the same device and are **not** used in `crossBrowserId`:

| Signal | Why excluded |
|---|---|
| User-Agent, plugins, extensions | Browser-specific by definition |
| Canvas, WebGL extensions | Engine-dependent rendering |
| Storage quotas, permissions | Differ per browser profile |
| `hardwareConcurrency` | Safari caps to 8 on high-core CPUs |
| `deviceMemory` | Safari doesn't expose this API |
| `colorDepth` / `pixelDepth` | Chrome 30 vs Safari 24 on same display |
| Locale format | Chrome `pl` vs Edge/Firefox `pl-PL` (normalized) |
| GPU model number | Firefox anti-fingerprinting reports different model than Chrome/Edge |
| Speech voices | Completely different voice lists per engine (Chrome 21, Edge 25, Firefox 4 on same Windows PC) |
| Browser-bundled fonts | Edge adds Roboto, Chrome may add Noto |
| Hardware perf timings | Vary with CPU load, thermal state, GC timing |
| Screen width/height | Safari reports viewport size instead of physical resolution |

## Usage

```ts
import neoprint from '@neoprintjs/core'

const fp = await neoprint.get()
console.log(fp.crossBrowserId) // Same on Chrome, Firefox, Safari, Edge

// Send to your server to link browser profiles
await fetch('/api/link-device', {
  method: 'POST',
  body: JSON.stringify({ crossBrowserId: fp.crossBrowserId })
})
```

## Accuracy Considerations

Cross-browser ID is **medium** collision resistance — it's possible for two different devices with identical hardware to produce the same ID. Best used as one factor in a multi-signal identification system.

Signals that **help differentiation**:
- Different GPU families → different renderer and hardware limits
- Different font sets installed at OS level
- Different CPU architectures → different math precision and perf ratios
- Different screen resolutions and DPR
- Different timezones and locales
- WebGPU limits (when available) add significant hardware detail
