# DOMRect Fingerprinting

DOMRect fingerprinting measures `getBoundingClientRect()` precision on hidden elements. Sub-pixel rendering differences between browsers and OS font engines produce unique measurement values.

## How it works

Neoprint creates 3 hidden elements with specific CSS properties (font sizes with decimal values, fractional padding, small rotation transforms) and reads their bounding rectangles.

The sub-pixel values of `x`, `y`, `width`, and `height` differ based on:
- Font rendering engine (Core Text vs DirectWrite vs FreeType)
- Sub-pixel anti-aliasing settings
- Display scaling factor
- Browser layout engine rounding

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~6 bits |
| **Stability** | 0.75 |
| **Typical duration** | <1ms |

Excluded in `privacy` mode.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['domRect'] })
const rects = fp.components.domRect.value
// [{ x: -9999, y: -9996.227, width: 187.617, height: 19.453 }, ...]
```
