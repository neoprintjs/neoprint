# WebGL Fingerprinting

WebGL fingerprinting extracts GPU hardware information and rendering parameters through the WebGL API. It's one of the highest-entropy signals available because GPU configurations vary enormously across devices.

## How it works

Neoprint creates a hidden `<canvas>`, initializes a WebGL2 (or WebGL) context, and reads hardware parameters and capabilities.

### Collected signals

| Signal | Source | Example |
|---|---|---|
| **Vendor** | `WEBGL_debug_renderer_info` | `Google Inc. (Apple)` |
| **Renderer** | `WEBGL_debug_renderer_info` | `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, ...)` |
| **Version** | `gl.VERSION` | `WebGL 2.0 (OpenGL ES 3.0 Chromium)` |
| **Shading language** | `gl.SHADING_LANGUAGE_VERSION` | `WebGL GLSL ES 3.00` |
| **Extensions** | `gl.getSupportedExtensions()` | 30-50 extensions per browser |
| **Max texture size** | `gl.MAX_TEXTURE_SIZE` | `16384` |
| **Max viewport dims** | `gl.MAX_VIEWPORT_DIMS` | `[16384, 16384]` |
| **Max anisotropy** | `EXT_texture_filter_anisotropic` | `16` |
| **Antialias** | `gl.getContextAttributes()` | `true` |
| **Max cube map texture** | `gl.MAX_CUBE_MAP_TEXTURE_SIZE` | `16384` |
| **Max renderbuffer** | `gl.MAX_RENDERBUFFER_SIZE` | `16384` |
| **Max fragment uniforms** | `gl.MAX_FRAGMENT_UNIFORM_VECTORS` | `1024` |
| **Max vertex uniforms** | `gl.MAX_VERTEX_UNIFORM_VECTORS` | `4096` |
| **Max vertex attribs** | `gl.MAX_VERTEX_ATTRIBS` | `16` |
| **Max varying vectors** | `gl.MAX_VARYING_VECTORS` | `30` |
| **Max texture units** | `gl.MAX_TEXTURE_IMAGE_UNITS` | `16` |
| **Aliased line width** | `gl.ALIASED_LINE_WIDTH_RANGE` | `[1, 1]` |
| **Aliased point size** | `gl.ALIASED_POINT_SIZE_RANGE` | `[1, 511]` |

## Why it's high-entropy

The renderer string alone is highly unique. Examples across devices:

- `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)`
- `ANGLE (NVIDIA, NVIDIA GeForce RTX 4090, OpenGL 4.5)`
- `ANGLE (Intel, Intel(R) UHD Graphics 630, OpenGL 4.5)`
- `Mali-G78` (Android)
- `Adreno (TM) 730` (Android)

Combined with 15+ numeric parameters that have different values per GPU model, WebGL produces ~12 bits of entropy.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~12 bits |
| **Stability** | 0.95 |
| **Typical duration** | 4-7ms |

WebGL is the most stable collector. The renderer, vendor, and hardware limits don't change unless the user swaps their GPU or updates graphics drivers.

## Role in cross-browser ID

WebGL data is used in the [`crossBrowserId`](/guide/fingerprint-ids) calculation, but with normalization:

- **ANGLE wrapper strings** are stripped to extract the real chip name
- Only `vendor`, `renderer`, and `maxTextureSize` are used (not extensions, which vary per browser)

This normalization ensures Chrome's `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, ...)` and Safari's `Apple GPU` both resolve to the same hardware identity.

## Role in anti-detect heuristics

WebGL parameters are key to detecting anti-detect browsers:

- **Parameter inconsistency**: Spoofed renderer says "Intel HD Graphics" but `maxTextureSize` is `32768` (too high for Intel integrated)
- **Platform mismatch**: Platform claims macOS but renderer string contains `d3d` (DirectX, Windows-only)
- **Mobile GPU with desktop params**: Renderer says "Adreno" but parameters match a desktop GPU

## Usage

```ts
const fp = await neoprint.get({ collectors: ['webgl'] })
const webgl = fp.components.webgl.value

console.log(webgl.vendor)          // GPU vendor
console.log(webgl.renderer)        // GPU model
console.log(webgl.extensions)      // supported WebGL extensions
console.log(webgl.maxTextureSize)  // hardware limit
```
