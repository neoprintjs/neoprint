# Media Fingerprinting

Media fingerprinting checks which video and audio codecs the browser supports, plus available media devices.

## Collected signals

**Video codecs tested**: H.264 (baseline/high), H.265, AV1, VP8, VP9, Theora

**Audio codecs tested**: AAC, MP3, Vorbis, Opus, WAV, FLAC

**Media devices**: Enumerated via `navigator.mediaDevices.enumerateDevices()` (kind only, no labels)

**Feature detection**: MediaSession API, Picture-in-Picture support

## Why it works

Codec support depends on:
- Browser engine (Chromium supports more codecs than Firefox)
- OS (macOS has hardware H.265, most Linux distros don't)
- Hardware decoders (GPU-accelerated AV1 on newer chips)

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~7 bits |
| **Stability** | 0.85 |
| **Typical duration** | 5-7ms |

## Usage

```ts
const fp = await neoprint.get({ collectors: ['media'] })
const media = fp.components.media.value

console.log(media.videoCodecs)  // supported video formats
console.log(media.audioCodecs)  // supported audio formats
console.log(media.deviceKinds)  // ['audioinput', 'videoinput', 'audiooutput']
```
