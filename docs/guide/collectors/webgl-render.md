# WebGL Rendering Fingerprint

WebGL rendering fingerprinting hashes the actual pixel output of a deterministic 3D scene. Unlike WebGL parameter fingerprinting (vendor/renderer strings), this captures how the GPU actually renders — making it both harder to spoof and consistent across browsers on the same hardware.

## How it works

Neoprint renders a colored, rotated cube with gradient shaders on a hidden 64x64 WebGL canvas, then reads back the pixel data and hashes it.

The scene is designed to maximize GPU-specific differences:
- **Vertex shader** applies a deterministic rotation (pi/4)
- **Fragment shader** applies sin/cos on color values, amplifying floating-point precision differences between GPUs
- **Anti-aliasing disabled** for consistency
- **preserveDrawingBuffer enabled** to ensure readPixels works reliably

## Why it produces unique results

| Factor | Effect |
|---|---|
| **Shader precision** | GPUs compute sin/cos/multiply with slightly different precision |
| **Texture filtering** | Different filtering implementations per GPU architecture |
| **Blending** | Alpha blending math varies per driver |
| **Rasterization** | Triangle edge rasterization rules differ subtly |
| **Driver optimizations** | Same GPU model with different driver versions may differ |

## Why it's cross-browser stable

The WebGL spec defines rendering behavior, but GPU hardware determines the actual pixel values. Chrome, Firefox, Safari, and Edge all send the same shader instructions to the same GPU — producing identical pixels.

This is a key advantage over canvas 2D fingerprinting, which varies per browser engine (different text rendering, anti-aliasing algorithms).

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~8 bits |
| **Stability** | 0.85 |
| **Typical duration** | 2-5ms |

## Role in cross-browser ID

`webglRender` is included in `crossBrowserId` because the pixel output depends on GPU hardware, not the browser engine. It adds ~8 bits of entropy that are genuinely hardware-dependent — addressing the entropy gap from excluding screen dimensions and speech voices.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['webglRender'] })
const render = fp.components.webglRender.value

console.log(render.hash)      // "a3f8c91b" (FNV-1a hash of all pixels)
console.log(render.checksum)  // 1928374650 (additive RGB checksum)
```
