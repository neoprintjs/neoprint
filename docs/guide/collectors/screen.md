# Screen Fingerprinting

Screen fingerprinting collects physical display properties and user preferences. While individual values are common, the combination of all screen signals creates a useful fingerprint component.

## Collected signals

| Signal | Source | Example |
|---|---|---|
| **width** | `screen.width` | `1920` |
| **height** | `screen.height` | `1080` |
| **colorDepth** | `screen.colorDepth` | `24` or `30` |
| **pixelDepth** | `screen.pixelDepth` | `24` or `30` |
| **devicePixelRatio** | `window.devicePixelRatio` | `2` (Retina) |
| **orientation** | `screen.orientation.type` | `landscape-primary` |
| **HDR** | `matchMedia('(dynamic-range: high)')` | `true` |
| **Color gamut** | `matchMedia('(color-gamut: p3)')` | `p3`, `rec2020`, `srgb` |
| **Color scheme** | `matchMedia('(prefers-color-scheme: dark)')` | `dark`, `light` |
| **Reduced motion** | `matchMedia('(prefers-reduced-motion: reduce)')` | `true`, `false` |
| **Contrast** | `matchMedia('(prefers-contrast: high)')` | `high`, `low`, `no-preference` |
| **Touch points** | `navigator.maxTouchPoints` | `0` (desktop), `5` (mobile) |

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~6 bits |
| **Stability** | 0.70 |
| **Typical duration** | <1ms |

Screen properties change when the user connects an external monitor, changes resolution, or rotates a mobile device.

## Cross-browser considerations

`colorDepth` and `pixelDepth` are excluded from `crossBrowserId` because Chrome reports `30` while Safari reports `24` on the same display. Resolution, DPR, HDR, and color gamut are consistent across browsers.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['screen'] })
const screen = fp.components.screen.value

console.log(screen.width, 'x', screen.height)
console.log('DPR:', screen.devicePixelRatio)
console.log('HDR:', screen.hdr)
console.log('Gamut:', screen.colorGamut)
```
