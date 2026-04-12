# neoprint.detectAntiDetect()

<ApiRunner method="detectAntiDetect" />


Detect anti-detect browsers (Multilogin, GoLogin, Dolphin Anty, etc.)

## Signature

```ts
function detectAntiDetect(fp?: Fingerprint): AntiDetectResult
```

## Returns

```ts
interface AntiDetectResult {
  detected: boolean
  tool: 'multilogin' | 'gologin' | 'dolphin-anty' | 'linken-sphere'
       | 'incogniton' | 'vmlogin' | 'adspower' | 'unknown' | null
  confidence: number  // 0–1
  signals: string[]
}
```

## Example

```ts
const fp = await neoprint.get()
const result = neoprint.detectAntiDetect(fp)

if (result.detected) {
  console.log(`Anti-detect: ${result.tool} (${result.confidence})`)
  console.log('Signals:', result.signals)
}
```

## Details

See [Anti-Detect Detection guide](/guide/anti-detect) for detection methods and supported tools.
