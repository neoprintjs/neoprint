# Server-Side Validation

Generate a payload that your backend can use to validate fingerprint integrity.

## Usage

```ts
const fp = await neoprint.get()
const hints = neoprint.serverHints(fp)

await fetch('/api/validate', {
  method: 'POST',
  body: JSON.stringify(hints),
})
```

## Server-Side Checks

The server receives environment data it can cross-reference with HTTP headers:

```ts
// Server-side pseudocode
app.post('/api/validate', (req, res) => {
  const hints = req.body
  const ua = req.headers['user-agent']
  const lang = req.headers['accept-language']

  // 1. Check platform matches User-Agent
  if (hints.environment.platform === 'MacIntel' && !ua.includes('Mac')) {
    flag('platform_mismatch')
  }

  // 2. Check languages match Accept-Language
  if (!lang.includes(hints.environment.languages[0])) {
    flag('language_mismatch')
  }

  // 3. Verify checksums haven't been tampered with
  // Store checksums and compare on next visit
})
```

## Payload Structure

```ts
interface ServerHints {
  fingerprintId: string
  stableId: string
  timestamp: number
  protocol: string
  collectorChecksums: Record<string, number>
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
