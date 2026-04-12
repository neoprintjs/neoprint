# neoprint.compare()

<ApiRunner method="compare" />


Fuzzy comparison of two fingerprints.

## Signature

```ts
function compare(fp1: Fingerprint, fp2: Fingerprint): CompareResult
```

## Returns

```ts
interface CompareResult {
  score: number      // 0–1 similarity
  diff: string[]     // collectors that differ
  matching: string[] // collectors that match
}
```

## Example

```ts
const oldFp = neoprint.import(storedJson)
const newFp = await neoprint.get()

const result = neoprint.compare(oldFp, newFp)

if (result.score > 0.85) {
  console.log('Same user, minor changes:', result.diff)
} else {
  console.log('Different user or major change')
}
```
