# Audio Fingerprinting

Audio fingerprinting uses the Web Audio API to generate a signal that differs across devices due to variations in audio hardware, drivers, and browser audio processing implementations.

## How it works

Neoprint creates an `OfflineAudioContext` with a triangle wave oscillator connected through a dynamics compressor, renders 5000 audio samples, and sums the absolute values of a specific range of samples.

```ts
// Simplified internal logic
const ctx = new OfflineAudioContext(1, 5000, 44100)
const osc = ctx.createOscillator()
const compressor = ctx.createDynamicsCompressor()

osc.type = 'triangle'
osc.frequency.setValueAtTime(10000, ctx.currentTime)
compressor.threshold.setValueAtTime(-50, ctx.currentTime)
compressor.knee.setValueAtTime(40, ctx.currentTime)
compressor.ratio.setValueAtTime(12, ctx.currentTime)

osc.connect(compressor)
compressor.connect(ctx.destination)
osc.start(0)

const buffer = await ctx.startRendering()
const data = buffer.getChannelData(0)

let sum = 0
for (let i = 4500; i < 5000; i++) {
  sum += Math.abs(data[i])
}
```

The resulting `sum` value is a floating-point number unique to the audio processing pipeline.

## Why it produces unique results

| Factor | Effect |
|---|---|
| **Audio hardware** | Different DACs and audio chips process signals differently |
| **Sample rate** | Hardware-dependent (44100Hz, 48000Hz, etc.) |
| **Compressor implementation** | Browsers implement `DynamicsCompressorNode` with subtle differences |
| **Floating-point precision** | CPU architecture affects intermediate math results |
| **OS audio stack** | CoreAudio (macOS), WASAPI (Windows), ALSA/PulseAudio (Linux) |

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~8 bits |
| **Stability** | 0.80 |
| **Typical duration** | 10-15ms |

Audio fingerprinting was optimized from 44100 samples (1 second, ~120ms) down to 5000 samples (~15ms) without losing accuracy.

## Privacy countermeasures

| Browser | Method |
|---|---|
| **Brave** | Adds noise to audio output (farbling) |
| **Tor Browser** | Blocks `OfflineAudioContext` entirely |
| **Firefox** (resistFingerprinting) | Returns uniform audio data |

Neoprint's `detectNoise()` function checks audio output for variance across multiple renders to detect noise injection.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['audio'] })
const audio = fp.components.audio.value

console.log(audio.sum)         // e.g. 124.043
console.log(audio.sampleRate)  // e.g. 44100
console.log(audio.length)      // 5000
```
