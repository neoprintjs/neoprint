# neoprint.detectIncognito()

<ApiRunner method="detectIncognito" />

Detect private / incognito browsing mode.

## Signature

```ts
function detectIncognito(): Promise<{
  isIncognito: boolean
  signals: string[]
  debug: { quotaGB?: number; browser?: string; languagesCount?: number; voicesCount?: number }
}>
```

## Returns

- `isIncognito` — `true` if any strong signal detected
- `signals` — which heuristics triggered
- `debug` — raw values for diagnostics

## Detection by Browser

| Browser | Method | Signal |
|---|---|---|
| **Chrome** | Storage quota drops from ~10GB to ~4GB | `low_storage_quota` |
| **Chrome** | `navigator.languages` trimmed to 1 entry | `languages_trimmed` |
| **Safari** | Storage quota drops from ~82GB to ~1GB | `low_storage_quota` |
| **Safari** | OPFS (`getDirectory`) throws error | `opfs_blocked` |
| **Safari** | `speechSynthesis.getVoices()` returns 0 voices | `no_speech_voices` |
| **Firefox** | `navigator.serviceWorker` is undefined | `firefox_no_serviceworker` |

## Example

```ts
const result = await neoprint.detectIncognito()

if (result.isIncognito) {
  console.log('Private browsing:', result.signals)
}

// Debug: see raw quota and browser detection
console.log(result.debug.quotaGB)  // e.g. 4.0 in incognito, 10.0 in normal
console.log(result.debug.browser)  // 'chrome' | 'safari' | 'firefox' | ...
```

## Limitations

Safari has been the most aggressive at patching detection methods. The current approach is based on real-world measurements (2026) and may need recalibration as browsers evolve. Chrome on `localhost` reports lower quota than on real domains — thresholds are calibrated accordingly.
