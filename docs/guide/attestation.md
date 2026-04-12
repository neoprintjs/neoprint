# Device Attestation

Single API call answering "can I trust this request?" Instead of manually combining bot detection, spoofing analysis, anti-detect checks, and hardware validation, `attestDevice` does it all with a weighted scoring system.

## Usage

```ts
const fp = await neoprint.get()

const proof = await neoprint.attestDevice(fp, {
  strictness: 'medium',
  challenge: 'server-nonce-abc',
})

if (proof.score > 0.8) {
  // Trusted request
}
```

## Result

```ts
interface AttestResult {
  score: number          // 0-1 weighted trust score
  isHuman: boolean       // no bot signals
  isPhysical: boolean    // no VM or emulator
  isAuthentic: boolean   // no spoofing or anti-detect
  factors: string[]      // checks that passed
  risks: string[]        // checks that failed
  integrityToken: string // tamper-evident token for server
}
```

## Strictness Levels

| Level | Checks run | Use case |
|---|---|---|
| `low` | Bot, spoofing, GPU, canvas, audio, fonts, platform consistency, webdriver, languages, screen | Fast pass, login forms |
| `medium` | All of low + VM detection, hardware perf benchmarks, entropy threshold | Default, payments, account creation |
| `high` | All of medium + confidence threshold, ad blocker check | High-security, fintech, fraud prevention |

## Weighted Factors

Not all signals are equal. The scoring system weights them by how hard they are to fake:

| Category | Weight | Examples |
|---|---|---|
| **Hardware** | High (10-15) | Real GPU (not SwiftShader), realistic hardware perf, audio context, canvas rendering |
| **Consistency** | Medium (8-12) | No spoofing, no bot, no anti-detect, not a VM, consistent platform/UA |
| **Soft signals** | Low (2-5) | Webdriver off, has languages, reasonable screen, sufficient entropy |

## Integrity Token

The `integrityToken` is a base64-encoded, signed payload that prevents casual tampering in the browser console. Send it to your server for verification:

```ts
// Client
const proof = await neoprint.attestDevice(fp, {
  challenge: serverNonce,
})
await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({ token: proof.integrityToken }),
})

// Server
const { valid, payload } = neoprint.verifyIntegrityToken(token)
if (!valid) return res.status(403).json({ error: 'invalid token' })
if (payload.ch !== serverNonce) return res.status(403).json({ error: 'replay' })
if (Date.now() - payload.ts > 30000) return res.status(403).json({ error: 'expired' })
if (payload.sc < 0.7) return res.status(403).json({ error: 'low trust' })
```

## Comparison with Platform APIs

| | Apple App Attest | Google Play Integrity | **neoprint attestDevice** |
|---|---|---|---|
| Platform | iOS only | Android only | **Any browser** |
| Open source | No | No | **Yes** |
| Requires app | Yes | Yes | **No** |
| Server component | Apple servers | Google servers | **Your own server** |
| Cost | Free (Apple ecosystem) | Free (Google ecosystem) | **Free** |
