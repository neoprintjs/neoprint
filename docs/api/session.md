# neoprint.createSession()

<ApiRunner method="session" />


Create a session manager for cross-session fingerprint persistence.

## Signature

```ts
function createSession(options?: {
  storage?: 'localStorage' | 'sessionStorage' | 'indexeddb' | 'cookie'
  fallback?: boolean
}): SessionManager
```

## SessionManager Methods

### `identify(fp)`

Attempt to link current visit to a previous session.

```ts
const session = neoprint.createSession({ storage: 'indexeddb', fallback: true })
const fp = await neoprint.get()
const link = await session.identify(fp)
```

Returns:

```ts
interface SessionLink {
  previousId?: string               // previous fingerprint ID
  confidence: number                // 1.0 from storage, fp.confidence from fingerprint
  method: 'fingerprint' | 'storage' | 'hybrid'
}
```

### `clear()`

Remove all stored session data.

```ts
await session.clear()
```

## Details

See [Session Linking guide](/guide/sessions) for fallback behavior and lifecycle integration.
