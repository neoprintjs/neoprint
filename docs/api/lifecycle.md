# neoprint.lifecycle()

<ApiRunner method="lifecycle" />


Create a lifecycle manager for fingerprint drift tracking and auto-linking.

## Signature

```ts
function lifecycle(): LifecycleManager
```

## LifecycleManager Methods

### `record(fp)`

Record a fingerprint snapshot for drift tracking.

```ts
const lc = neoprint.lifecycle()
const fp = await neoprint.get()
lc.record(fp)
```

### `link(fp)`

Attempt to link a new fingerprint to a previously recorded one.

```ts
const link = lc.link(newFp)
```

Returns:

```ts
interface LifecycleLink {
  linkedTo: string | null        // previous fingerprint ID
  probability: number            // 0–1
  driftedSignals: string[]       // what changed
  stableSignals: string[]        // what stayed
  predictedNextDrift: string[]   // likely to change next
  decayRate: number              // changes per day
}
```

### `getStabilityReport()`

Per-signal stability analysis over time.

```ts
const report = lc.getStabilityReport()
// { canvas: { driftCount: 3, stability: 0.85 }, ... }
```

### `clear()`

Delete all stored lifecycle data.

## Example

See [Fingerprint Lifecycle guide](/guide/lifecycle) for a full walkthrough.
