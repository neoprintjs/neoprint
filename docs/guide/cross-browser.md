# Cross-Browser Identification

Identify the same user across Chrome, Firefox, Safari, and Edge on the same device.

## How It Works

The `crossBrowserId` uses only **hardware-level signals** that don't change between browsers. All values are **normalized** to absorb browser-specific differences:

- GPU vendor and renderer — ANGLE wrapper strings are stripped to extract the real chip name (e.g. `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, ...)` → `Apple M4`)
- CPU math precision — rounded to 8 significant digits to absorb V8 vs JavaScriptCore floating-point diffs
- Screen resolution and DPR — `colorDepth`/`pixelDepth` excluded (Chrome reports 30, Safari reports 24 on the same display)
- Timezone and locale — locale normalized to base language (`pl-PL` → `pl`)
- Installed fonts (OS-level)
- Audio sample rate (hardware-dependent)
- Local TTS voice languages — unique language set only, not voice names/count (Chrome exposes more voices than Safari)
- Touch point capability

## Usage

```ts
import neoprint from '@neoprintjs/core'

const fp = await neoprint.get()
console.log(fp.crossBrowserId) // Same on Chrome, Firefox, Safari

// Send to your server to link browser profiles
await fetch('/api/link-device', {
  method: 'POST',
  body: JSON.stringify({ crossBrowserId: fp.crossBrowserId })
})
```

## Accuracy Considerations

Cross-browser ID is **medium** collision resistance — it's possible for two different devices with identical hardware to produce the same ID. Best used as one factor in a multi-signal identification system.

Signals that **help differentiation**:
- Different GPU models → different renderer strings
- Different font sets installed
- Different TTS voice language sets
- Different CPU architectures (Math precision)

Signals **excluded** (differ per browser on the same device):
- User-Agent, plugins, extensions
- Canvas rendering (engine-dependent)
- WebGL extensions (browser-dependent)
- Storage quotas, permissions
- `hardwareConcurrency` (Safari caps to 8 on high-core CPUs)
- `deviceMemory` (Safari doesn't expose this API)
- `colorDepth` / `pixelDepth` (Chrome reports 30-bit, Safari reports 24-bit)
- Locale format (`pl` vs `pl-PL`)
- TTS voice names/count (Chrome exposes more than Safari)
