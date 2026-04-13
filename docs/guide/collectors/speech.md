# Speech Synthesis Fingerprinting

Speech synthesis fingerprinting reads the list of text-to-speech voices available through the `speechSynthesis` API. Voice sets are OS-dependent and vary significantly across platforms and locales.

## How it works

Neoprint calls `speechSynthesis.getVoices()` and records each voice's name, language, whether it's a local voice, and whether it's the default.

```ts
const voices = speechSynthesis.getVoices()
const data = voices.map(v => ({
  name: v.name,       // "Zosia"
  lang: v.lang,       // "pl-PL"
  localService: v.localService,  // true = OS voice, false = cloud
  default: v.default,
}))
```

## Why it's effective

| OS | Typical voice count | Notable voices |
|---|---|---|
| macOS | 60-80 local | Samantha, Alex, Zosia (Polish) |
| Windows | 5-20 local | David, Zira, Mark |
| iOS | 60-80 local | Same as macOS |
| Android | 5-30 | Google TTS voices |
| Linux | 0-5 | espeak voices (if installed) |

Users who install additional language packs get more voices, further differentiating their profile.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~10 bits |
| **Stability** | 0.90 |
| **Typical duration** | 50-60ms |

The high duration is due to async voice loading. Neoprint waits up to 300ms for the `voiceschanged` event if voices aren't immediately available.

## Cross-browser considerations

Chrome exposes more voices as `localService: true` than Safari on the same OS (180 vs 68 in testing). Speech is **excluded** from [`crossBrowserId`](/guide/fingerprint-ids) and [`stableId`](/guide/fingerprint-ids) because voice lists differ too much between browser engines on the same OS, and Safari returns 0 voices in private browsing.

## Role in incognito detection

Safari private browsing returns 0 voices from `speechSynthesis.getVoices()`, while normal mode returns 68. This is one of the strongest signals used by [`neoprint.detectIncognito()`](/api/detect-incognito) for Safari.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['speech'] })
const voices = fp.components.speech.value

console.log(voices.length)          // number of available voices
console.log(voices[0].name)         // "Zosia"
console.log(voices[0].lang)         // "pl-PL"
console.log(voices[0].localService) // true
```
