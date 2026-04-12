# Getting Started

## Installation

::: code-group
```bash [npm]
npm install neoprint
```
```bash [yarn]
yarn add neoprint
```
```bash [pnpm]
pnpm add neoprint
```
:::

## Quick Start

```ts
import neoprint from 'neoprint'

const fp = await neoprint.get()

console.log(fp.id)              // full fingerprint hash
console.log(fp.stableId)        // survives browser updates
console.log(fp.crossBrowserId)  // same across Chrome/Firefox/Safari
console.log(fp.confidence)      // 0–1
console.log(fp.entropy)         // bits of entropy
```

## What's in a Fingerprint?

Every call to `neoprint.get()` returns a `Fingerprint` object:

```ts
interface Fingerprint {
  id: string              // full 128-bit hex hash
  stableId: string        // update-resistant hash
  weightedId: string      // collision-resistant hash
  crossBrowserId: string  // hardware-only hash
  confidence: number      // 0–1
  spoofingScore: number   // 0–1
  entropy: number         // total bits
  components: { ... }     // raw collector data
  timestamp: number       // when it was generated
}
```

## Next Steps

- [Understand the 4 ID strategies](/guide/fingerprint-ids)
- [See all 19 collectors](/guide/collectors)
- [Try the live demo](/demo/)
- [Set up cross-browser identification](/guide/cross-browser)
