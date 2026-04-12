# neoprint.get()

<ApiRunner method="get" />


Generate a browser fingerprint.

## Signature

```ts
function get(options?: NeoprintOptions): Promise<Fingerprint>
```

## Options

```ts
interface NeoprintOptions {
  collectors?: string[]    // subset of collectors to use
  timeout?: number         // ms per collector (default: 5000)
  mode?: 'full' | 'privacy' | 'incognito-resistant'
  debug?: boolean          // log details to console
}
```

## Returns

```ts
interface Fingerprint {
  id: string              // full 128-bit hex hash
  stableId: string        // update-resistant hash
  weightedId: string      // collision-resistant hash
  crossBrowserId: string  // hardware-only hash (same across browsers)
  confidence: number      // 0–1
  spoofingScore: number   // 0–1
  entropy: number         // total bits
  components: FingerprintComponents
  timestamp: number
}
```

## Examples

```ts
// Full fingerprint (all collectors)
const fp = await neoprint.get()

// Specific collectors only
const fp = await neoprint.get({
  collectors: ['canvas', 'webgl', 'math']
})

// Privacy mode (no canvas, webgl, audio, webrtc, domRect, svg)
const fp = await neoprint.get({ mode: 'privacy' })

// Incognito-resistant (no storage, permissions, network)
const fp = await neoprint.get({ mode: 'incognito-resistant' })

// With debug logging
const fp = await neoprint.get({ debug: true })
```
