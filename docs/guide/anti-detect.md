# Anti-Detect Browser Detection

Detect fraudulent anti-detect browsers used for multi-accounting, ad fraud, and credential stuffing.

## Supported Tools

| Tool | Detection Method |
|---|---|
| **Multilogin** (Mimic/Stealthfox) | Global variables, extension IDs, Electron shell |
| **GoLogin** (Orbita) | Orbita UA string, global variables, localStorage keys |
| **Dolphin Anty** | Global variables, localStorage keys |
| **Linken Sphere** | Global variables, UA markers |
| **Incogniton** | Global variables |
| **VMLogin** | Global variables |
| **AdsPower** (SunBrowser) | Global variables, localStorage keys |

## Usage

```ts
const fp = await neoprint.get()
const result = neoprint.detectAntiDetect(fp)

if (result.detected) {
  console.log(`Anti-detect browser: ${result.tool}`)
  console.log(`Confidence: ${result.confidence}`)
  console.log(`Signals: ${result.signals}`)
}
```

## Detection Methods

### Prototype Tampering
Anti-detect browsers override native getters on `Navigator.prototype`, `Screen.prototype`, and WebGL contexts. Neoprint checks if `toString()` returns `[native code]`.

### Electron Shell
Most anti-detect tools run inside Electron. Neoprint checks for `process.versions.electron`, `require`, and `__dirname`.

### WebGL Parameter Inconsistency
When the GPU renderer is spoofed, the reported parameters (max texture size, viewport dims) often don't match the claimed GPU. Example: Intel integrated GPU with `maxTextureSize > 16384`.

### Platform vs GPU Mismatch
Claiming macOS but WebGL renderer uses DirectX (`d3d`), or Windows with Metal renderer.

### Too-Perfect Profile
Real browsers always have at least one failed or blocked collector. If every single collector succeeds perfectly, it's suspicious.

## Response

```ts
interface AntiDetectResult {
  detected: boolean
  tool: 'multilogin' | 'gologin' | 'dolphin-anty' | 'linken-sphere'
       | 'incogniton' | 'vmlogin' | 'adspower' | 'unknown' | null
  confidence: number  // 0–1
  signals: string[]   // which checks triggered
}
```
