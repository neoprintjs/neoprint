# Shader Precision Fingerprinting

Shader precision fingerprinting queries the GPU's reported numeric precision for vertex and fragment shaders. Different GPUs report different precision capabilities, making this a reliable hardware-level signal.

## How it works

Neoprint calls `gl.getShaderPrecisionFormat()` for 6 precision types on both vertex and fragment shaders, recording `rangeMin`, `rangeMax`, and `precision` for each.

### Queried precision types

| Type | Description |
|---|---|
| `LOW_FLOAT` | Low-precision floating point |
| `MEDIUM_FLOAT` | Medium-precision floating point |
| `HIGH_FLOAT` | High-precision floating point |
| `LOW_INT` | Low-precision integer |
| `MEDIUM_INT` | Medium-precision integer |
| `HIGH_INT` | High-precision integer |

Each type is queried for both `VERTEX_SHADER` and `FRAGMENT_SHADER`, producing 12 data points total (6 types x 2 shader stages).

## Why it works

The GPU hardware determines what precision it can support. For example:
- Desktop GPUs typically support full 32-bit float precision across all levels
- Mobile GPUs (Adreno, Mali) may have reduced precision for `LOW_FLOAT` and `MEDIUM_FLOAT`
- Integrated GPUs (Intel HD) report different ranges than discrete GPUs (NVIDIA, AMD)

## Why it's cross-browser stable

`getShaderPrecisionFormat()` is a WebGL 1.0 API that queries hardware capabilities directly. The browser engine doesn't influence the reported values — they come from the GPU driver.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~4 bits |
| **Stability** | 0.95 |
| **Typical duration** | <1ms |

Very high stability — precision capabilities only change when GPU hardware or drivers change.

## Role in [`crossBrowserId`](/guide/fingerprint-ids)

Included in [`crossBrowserId`](/guide/fingerprint-ids) as a hardware-dependent signal. Combined with WebGL params and rendering hash, it provides strong GPU identification across browsers.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['shaderPrecision'] })
const sp = fp.components.shaderPrecision.value

console.log(sp.vertex.highFloat)    // [127, 127, 23]
console.log(sp.fragment.medFloat)   // [14, 14, 10]
```
