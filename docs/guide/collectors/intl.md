# Intl Fingerprinting

Intl fingerprinting reads internationalization settings from the `Intl` API. These values reflect OS-level locale configuration.

## Collected signals

| Signal | Example |
|---|---|
| **dateTimeFormat.locale** | `pl` or `pl-PL` |
| **dateTimeFormat.timeZone** | `Europe/Warsaw` |
| **dateTimeFormat.calendar** | `gregory` |
| **dateTimeFormat.numberingSystem** | `latn` |
| **numberFormat.locale** | `pl` |
| **numberFormat.numberingSystem** | `latn` |
| **listFormat** | `true` (API exists) |
| **relativeTimeFormat** | `true` |
| **pluralRules** | `other` (for 0) |
| **displayNames** | `true` |
| **segmenter** | `true` |

## Cross-browser normalization

Locale format differs between browsers: Chrome reports `pl`, Safari reports `pl-PL`. For `crossBrowserId`, the locale is normalized to the base language tag (`pl`).

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~5 bits |
| **Stability** | 0.85 |
| **Typical duration** | <1ms |

## Web Worker offloading

Intl collector runs in a Web Worker by default. The `Intl` API is available in Worker contexts.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['intl'] })
const intl = fp.components.intl.value

console.log(intl.dateTimeFormat.timeZone)  // "Europe/Warsaw"
console.log(intl.dateTimeFormat.locale)    // "pl"
```
