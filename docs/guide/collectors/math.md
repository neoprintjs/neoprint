# Math Fingerprinting

Math fingerprinting exploits tiny precision differences in how JavaScript engines compute transcendental mathematical functions. These differences come from the CPU architecture, not the browser.

## How it works

Neoprint computes 22 mathematical operations and stores the full-precision results:

```ts
const data = {
  acos: Math.acos(0.123456789),
  acosh: Math.acosh(1e10),
  asin: Math.asin(0.123456789),
  asinh: Math.asinh(1),
  atan: Math.atan(2),
  atanh: Math.atanh(0.5),
  atan2: Math.atan2(0.04, -0.04),
  cbrt: Math.cbrt(100),
  cos: Math.cos(21 * Math.LN2),
  cosh: Math.cosh(1),
  exp: Math.exp(1),
  expm1: Math.expm1(1),
  log: Math.log(10),
  log1p: Math.log1p(10),
  log2: Math.log2(7),
  log10: Math.log10(7),
  sin: Math.sin(1e300),
  sinh: Math.sinh(1),
  sqrt: Math.sqrt(2),
  tan: Math.tan(-1e300),
  tanh: Math.tanh(1),
  pow: Math.pow(Math.PI, -100),
}
```

## Why results differ across devices

IEEE 754 floating-point standard allows implementations to differ in the last 1-2 bits of precision for transcendental functions. Different JS engines (V8, JavaScriptCore, SpiderMonkey) and CPU architectures (x86, ARM) produce slightly different results.

Example: `Math.atan(2)` might return:
- `1.1071487177940904` on Chrome/V8 (x86)
- `1.1071487177940906` on Safari/JSC (ARM)

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~6 bits |
| **Stability** | 0.95 |
| **Typical duration** | <1ms |

Math is the most stable collector alongside WebGL. Values only change when the user switches CPU architecture or JS engine version.

## Cross-browser normalization

For [`crossBrowserId`](/guide/fingerprint-ids), math values are rounded to 8 significant digits to absorb V8 vs JavaScriptCore last-digit differences while preserving architecture-level differences (x86 vs ARM).

## Web Worker offloading

Math runs in a Web Worker by default since it requires no DOM access.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['math'] })
const math = fp.components.math.value

console.log(math.sin)  // 1e300 produces different results per platform
console.log(math.tan)  // -1e300 is another strong differentiator
```
