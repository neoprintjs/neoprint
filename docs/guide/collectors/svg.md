# SVG Fingerprinting

SVG fingerprinting renders an SVG scene with filters, text, and shapes, then reads both the serialized SVG string and text bounding box measurements.

## How it works

Neoprint creates an SVG element containing:
- A rectangle with a Gaussian blur filter
- Text rendered in serif font
- A semi-transparent circle

The SVG is serialized via `XMLSerializer` and text bounding box is read via `getBBox()`. Differences arise from:
- SVG filter implementation (blur precision)
- Font metrics for SVG text
- Serialization format differences

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~7 bits |
| **Stability** | 0.80 |
| **Typical duration** | <1ms |

SVG is an alternative to canvas fingerprinting that's less commonly blocked by privacy extensions. Excluded in `privacy` mode.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['svg'] })
const svg = fp.components.svg.value

console.log(svg.textBBox)  // { x, y, width, height }
```
