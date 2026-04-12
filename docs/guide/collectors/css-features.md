# CSS Features Fingerprinting

CSS features fingerprinting probes `CSS.supports()` for 20 modern CSS properties. The supported feature set indicates the browser engine and version.

## Tested features

Grid, Subgrid, Container queries, `:has()` selector, Nesting, Cascade layers, `color-mix()`, `oklch()`, `lch()`, `accent-color`, `aspect-ratio`, `backdrop-filter`, `content-visibility`, `overscroll-behavior`, Scroll snap, `text-decoration-thickness`, `touch-action`, `will-change`, View transitions, Anchor positioning.

## Why it works

Older browser versions don't support newer CSS features. The exact subset of supported features narrows down the browser and version.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~4 bits |
| **Stability** | 0.80 |
| **Typical duration** | <1ms |

## Usage

```ts
const fp = await neoprint.get({ collectors: ['cssFeatures'] })
const features = fp.components.cssFeatures.value
// ["grid", "subgrid", "container-queries", "has-selector", ...]
```
