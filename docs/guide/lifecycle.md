# Fingerprint Lifecycle

Track how fingerprints evolve over time. Auto-link old and new fingerprints when browsers update.

## The Problem

Browser updates change fingerprint hashes. Without lifecycle tracking, you lose the user entirely after an update — they appear as a brand new visitor.

## Usage

```ts
const lc = neoprint.lifecycle()

// Record each visit
const fp = await neoprint.get()
lc.record(fp)

// On next visit — attempt to link
const newFp = await neoprint.get()
const link = lc.link(newFp)

console.log(link.linkedTo)           // previous fingerprint ID
console.log(link.probability)        // 0.94 (94% same user)
console.log(link.driftedSignals)     // ['canvas', 'navigator']
console.log(link.stableSignals)      // ['webgl', 'math', 'fonts', ...]
console.log(link.predictedNextDrift) // ['audio', 'media']
console.log(link.decayRate)          // 0.02 changes/day
```

## Stability Report

See how each signal behaves over time:

```ts
const report = lc.getStabilityReport()
// {
//   canvas:    { driftCount: 3, stability: 0.85 },
//   navigator: { driftCount: 5, stability: 0.75 },
//   math:      { driftCount: 0, stability: 1.0 },
// }
```

## How It Works

1. Each fingerprint is stored with per-collector hashes
2. On new visit, collectors are compared against all history
3. Best match found via overlap score (boosted by stableId/crossBrowserId match)
4. Most-drifted signals are predicted to drift next
5. History persisted in localStorage (max 50 snapshots)

## Linking Logic

The linking probability is calculated from:
- **Component overlap** — What percentage of collectors produce the same hash
- **Stable ID bonus** (+15%) — If the stableId matches
- **Cross-browser ID bonus** (+10%) — If the crossBrowserId matches

A probability of **0.5+** is required for a positive link.
