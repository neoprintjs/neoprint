# Session Linking

Persist fingerprint IDs across sessions with automatic storage fallbacks.

## Usage

```ts
const session = neoprint.createSession({
  storage: 'indexeddb',  // 'localStorage' | 'sessionStorage' | 'indexeddb' | 'cookie'
  fallback: true,        // try other storage if primary fails
})

const fp = await neoprint.get()
const link = await session.identify(fp)

link.previousId   // fingerprint ID from last visit (or undefined)
link.confidence   // 1.0 if from storage, fp.confidence if from fingerprint
link.method       // 'storage' | 'fingerprint'

// Clear
await session.clear()
```

## Storage Priority

When `fallback: true`, if the primary storage fails, neoprint tries: localStorage → sessionStorage → cookie → indexedDB.

## Combining with Lifecycle

```ts
const session = neoprint.createSession()
const lc = neoprint.lifecycle()

const fp = await neoprint.get()

// Try storage first
const sessionLink = await session.identify(fp)

if (!sessionLink.previousId) {
  // Storage cleared — try lifecycle linking
  const lifecycleLink = lc.link(fp)
  if (lifecycleLink.linkedTo) {
    console.log(`Linked via fingerprint: ${lifecycleLink.probability}`)
  }
}

lc.record(fp)
```
