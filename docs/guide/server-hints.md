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

## Node.js Validation Example

Full working example with Express:

```js
app.post('/api/validate', (req, res) => {
  const hints = req.body
  const ua = req.headers['user-agent'] || ''
  const acceptLang = req.headers['accept-language'] || ''
  const flags = []

  // 1. Platform vs User-Agent
  const { platform } = hints.environment
  if (platform === 'MacIntel' && !ua.includes('Mac')) flags.push('platform_mismatch')
  if (platform === 'Win32' && !ua.includes('Windows')) flags.push('platform_mismatch')
  if (platform === 'Linux' && !ua.includes('Linux')) flags.push('platform_mismatch')

  // 2. Languages vs Accept-Language
  const primaryLang = hints.environment.languages[0]
  if (primaryLang && !acceptLang.toLowerCase().includes(primaryLang.toLowerCase().split('-')[0])) {
    flags.push('language_mismatch')
  }

  // 3. Fingerprint age — reject if too old
  const ageMs = Date.now() - hints.timestamp
  if (ageMs > 30000) flags.push('stale_fingerprint')

  // 4. Checksum consistency — compare with stored previous visit
  const stored = db.get(hints.fingerprintId)
  if (stored && stored.checksums.canvas !== hints.collectorChecksums.canvas) {
    flags.push('checksum_changed')
  }

  // 5. Store for future comparison
  db.set(hints.fingerprintId, {
    checksums: hints.collectorChecksums,
    ua,
    timestamp: Date.now(),
  })

  res.json({
    trusted: flags.length === 0,
    flags,
    fingerprintId: hints.fingerprintId,
    stableId: hints.stableId,
  })
})
```

### What to check

| Check | What it catches |
|---|---|
| Platform vs UA | Client spoofed navigator.platform but not the HTTP header |
| Languages vs Accept-Language | Client spoofed navigator.languages |
| Fingerprint age | Replay attacks with old fingerprints |
| Checksum consistency | Client modified collector values between visits |

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
