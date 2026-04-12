# WebGPU Fingerprinting

WebGPU fingerprinting reads adapter information from the new WebGPU API. When available, it provides hardware details not exposed through WebGL.

## Collected signals

| Signal | Example |
|---|---|
| **vendor** | `apple` |
| **architecture** | `common-3` |
| **device** | (empty on most browsers) |
| **description** | (empty on most browsers) |
| **features** | Set of supported GPU features |
| **limits** | Max texture dimensions, buffer sizes, workgroup sizes |

## Availability

WebGPU requires a secure context (HTTPS) and is supported in:
- Chrome 113+
- Edge 113+
- Firefox (behind flag)
- Safari (partial, WebKit)

When unavailable, the collector returns `{ supported: false }` with 0 entropy.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~10 bits (when available), 0 (when not) |
| **Stability** | 0.90 |
| **Typical duration** | 50-60ms |

## Usage

```ts
const fp = await neoprint.get({ collectors: ['gpu'] })
const gpu = fp.components.gpu.value

if (gpu.supported) {
  console.log(gpu.vendor)        // "apple"
  console.log(gpu.architecture)  // "common-3"
  console.log(gpu.features)      // supported feature set
}
```
