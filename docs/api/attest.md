# neoprint.attestDevice()

<ApiRunner method="attestDevice" />

Single trust score combining all detection modules.

## Signature

```ts
function attestDevice(fp: Fingerprint, options?: {
  strictness?: 'low' | 'medium' | 'high'
  challenge?: string
}): Promise<AttestResult>
```

## Options

- `strictness` - How many checks to run. Default: `'medium'`
- `challenge` - Server-provided nonce to prevent replay attacks

## Returns

```ts
interface AttestResult {
  score: number          // 0-1
  isHuman: boolean
  isPhysical: boolean
  isAuthentic: boolean
  factors: string[]      // passed checks
  risks: string[]        // failed checks
  integrityToken: string // signed token for server verification
}
```

## Example

```ts
const fp = await neoprint.get()
const proof = await neoprint.attestDevice(fp, {
  strictness: 'high',
  challenge: 'nonce-from-server',
})

if (proof.score >= 0.8 && proof.isAuthentic) {
  // Trusted
}
```

## See also

- [Device Attestation guide](/guide/attestation) - Full walkthrough with server-side verification
- [neoprint.verifyIntegrityToken()](/api/verify-token) - Server-side token verification
