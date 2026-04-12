# Navigator Fingerprinting

The navigator collector reads browser and device metadata exposed through the `navigator` object. While many of these values are commonly spoofed, they're useful for cross-referencing with other signals.

## Collected signals

| Signal | Example | Notes |
|---|---|---|
| **userAgent** | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...` | Full UA string |
| **platform** | `MacIntel` | OS platform |
| **language** | `en-US` | Primary language |
| **languages** | `['en-US', 'en', 'pl']` | All preferred languages |
| **hardwareConcurrency** | `10` | CPU logical cores |
| **maxTouchPoints** | `0` | Touch capability |
| **cookieEnabled** | `true` | Cookie support |
| **doNotTrack** | `1` or `null` | DNT setting |
| **deviceMemory** | `8` | RAM in GB (Chrome only) |
| **pdfViewerEnabled** | `true` | Built-in PDF viewer |
| **webdriver** | `false` | Automation flag |
| **vendor** | `Google Inc.` | Browser vendor |

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~8 bits |
| **Stability** | 0.75 |
| **Typical duration** | <1ms |

## Cross-browser considerations

`hardwareConcurrency` and `deviceMemory` are excluded from `crossBrowserId`:
- Safari caps `hardwareConcurrency` at 8 even on 10+ core machines
- Safari doesn't expose `deviceMemory` at all

`languages` is trimmed to 1 entry in Chrome incognito, making it a signal for incognito detection.

## Role in spoofing detection

Navigator values are cross-referenced with other signals:
- `platform` says Mac but `userAgent` says Windows = spoofing
- `webdriver: true` = automation framework
- `hardwareConcurrency: 16` with `deviceMemory: 2` = inconsistent

## Usage

```ts
const fp = await neoprint.get({ collectors: ['navigator'] })
const nav = fp.components.navigator.value

console.log(nav.platform)              // MacIntel
console.log(nav.hardwareConcurrency)   // 10
console.log(nav.languages)            // ['en-US', 'pl']
```
