# neoprint.detectNoise()

<ApiRunner method="detectNoise" />


Detect canvas and audio noise injection (Brave farbling, Safari ITP, anti-fingerprint extensions).

## Signature

```ts
function detectNoise(): Promise<NoiseReport[]>
```

## Returns

```ts
interface NoiseReport {
  collector: string   // 'canvas' | 'audio'
  isNoisy: boolean    // true if noise detected
  variance: number    // 0–1
  samples: number     // number of test iterations
}
```

## Example

```ts
const reports = await neoprint.detectNoise()

for (const r of reports) {
  if (r.isNoisy) {
    console.log(`${r.collector}: noise detected (variance: ${r.variance})`)
  }
}
```

## How It Works

Renders the same canvas / runs the same AudioContext multiple times. If results differ between runs, noise injection is present.
