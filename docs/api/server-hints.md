# neoprint.serverHints()

<ApiRunner method="serverHints" />


Generate a payload for server-side fingerprint validation.

## Signature

```ts
function serverHints(fp: Fingerprint): ServerHints
```

## Returns

```ts
interface ServerHints {
  fingerprintId: string
  stableId: string
  timestamp: number
  protocol: string
  collectorChecksums: Record<string, number>
  expectedRanges: Record<string, { type: string; checksum: number }>
  environment: {
    platform: string
    languages: string[]
    timezone: string
    cores: number
    memory: number | null
    touchPoints: number
  }
}
```

## Example

```ts
const fp = await neoprint.get()
const hints = neoprint.serverHints(fp)

await fetch('/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(hints),
})
```

## Details

See [Server Validation guide](/guide/server-hints) for server-side implementation examples.
