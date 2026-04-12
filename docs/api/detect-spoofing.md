# neoprint.detectSpoofing()

<ApiRunner method="detectSpoofing" />


Detect fingerprint tampering via cross-signal inconsistency analysis.

## Signature

```ts
function detectSpoofing(fp: Fingerprint): SpoofingResult
```

## Returns

```ts
interface SpoofingResult {
  isLikely: boolean  // true if score >= 0.4
  score: number      // 0–1
  signals: string[]  // which rules triggered
}
```

## Example

```ts
const fp = await neoprint.get()
const spoof = neoprint.detectSpoofing(fp)

if (spoof.isLikely) {
  console.log('Spoofing detected:', spoof.signals)
}
```

## Rules

See [Spoofing Detection guide](/guide/spoofing) for the full rule list.
