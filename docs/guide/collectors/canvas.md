# Canvas Fingerprinting

Canvas fingerprinting is one of the most effective browser identification techniques. It exploits the fact that HTML5 Canvas renders text, shapes, and gradients slightly differently across devices due to differences in GPU hardware, graphics drivers, OS-level font rendering, and anti-aliasing implementations.

## How it works

Neoprint's canvas collector draws a specific scene on a hidden `<canvas>` element and exports it as a PNG data URL. The scene includes:

1. **Colored rectangle** with specific fill and positioning
2. **Text rendering** with a defined font, color, and sub-pixel offset
3. **Semi-transparent overlapping text** to test alpha blending
4. **Linear gradient** across the full width (red to green to blue)
5. **Circle** with arc rendering
6. **Emoji rendering** to capture OS-level emoji font differences

```ts
// What neoprint draws internally
ctx.font = '18px Arial'
ctx.fillStyle = '#f60'
ctx.fillRect(100, 1, 62, 20)
ctx.fillStyle = '#069'
ctx.fillText('neoprint <canvas> fp', 2, 15)
ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
ctx.fillText('neoprint <canvas> fp', 4, 17)

// Gradient
const gradient = ctx.createLinearGradient(0, 0, 280, 0)
gradient.addColorStop(0, '#ff0000')
gradient.addColorStop(0.5, '#00ff00')
gradient.addColorStop(1, '#0000ff')

// Emoji (differs significantly across OS/browser)
ctx.fillText('🐱🌈🎵', 100, 55)
```

The resulting pixel data is unique because every step in the rendering pipeline introduces micro-differences.

## Why it produces unique results

| Layer | What varies |
|---|---|
| **GPU** | Different GPUs process floating-point shader math differently |
| **Graphics driver** | Driver version affects anti-aliasing and sub-pixel rendering |
| **OS font renderer** | macOS (Core Text), Windows (DirectWrite), Linux (FreeType) produce different glyph shapes |
| **Font hinting** | Sub-pixel positioning and hinting algorithms differ per OS |
| **Emoji font** | Apple Color Emoji vs Noto Color Emoji vs Segoe UI Emoji produce visibly different output |
| **Display scaling** | devicePixelRatio affects how canvas pixels are rasterized |

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~10 bits |
| **Stability** | 0.85 |
| **Typical duration** | 3-5ms |

Canvas fingerprinting is high-entropy (many possible outputs) and reasonably stable. It can change when:
- The OS updates its font renderer
- A new graphics driver is installed
- Display scaling changes
- The browser adds canvas noise (see below)

## Privacy countermeasures

Some browsers inject noise into canvas output to prevent fingerprinting:

| Browser | Method | Effect |
|---|---|---|
| **Brave** | Farbling | Adds deterministic noise per-session |
| **Firefox** (resistFingerprinting) | Noise injection | Randomizes pixel values |
| **Tor Browser** | Blocks readback | `toDataURL()` returns blank |
| **Safari ITP** | Partial noise | Minor pixel variations |

Neoprint detects canvas noise via `neoprint.detectNoise()`, which renders the same scene multiple times and checks for variance. When noise is detected, the canvas collector's weight is automatically reduced in confidence calculations.

## Usage

Canvas is included by default. To use it selectively:

```ts
const fp = await neoprint.get({
  collectors: ['canvas']
})

console.log(fp.components.canvas.value)     // data:image/png;base64,...
console.log(fp.components.canvas.entropy)   // 10
console.log(fp.components.canvas.stability) // 0.85
console.log(fp.components.canvas.duration)  // ~3ms
```

Canvas is excluded in privacy mode:

```ts
const fp = await neoprint.get({ mode: 'privacy' })
// canvas not collected
```

## Comparison with other approaches

Neoprint's canvas collector differs from basic implementations in several ways:

- **Emoji rendering** included (high variance across OS)
- **Gradient + geometry** combined (not just text)
- **Sub-pixel offset text** (amplifies font rendering differences)
- **Noise detection** built in (other libraries don't check for this)
- **Automatic weight reduction** when noise is detected
