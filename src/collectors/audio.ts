import type { Collector, CollectorResult } from '../types.js'

export const audioCollector: Collector = {
  name: 'audio',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext
    if (!AudioCtx) {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    const context = new AudioCtx()
    const oscillator = context.createOscillator()
    const analyser = context.createAnalyser()
    const gain = context.createGain()
    const compressor = context.createDynamicsCompressor()

    // Configure
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, context.currentTime)
    gain.gain.setValueAtTime(0, context.currentTime)

    compressor.threshold.setValueAtTime(-50, context.currentTime)
    compressor.knee.setValueAtTime(40, context.currentTime)
    compressor.ratio.setValueAtTime(12, context.currentTime)
    compressor.attack.setValueAtTime(0, context.currentTime)
    compressor.release.setValueAtTime(0.25, context.currentTime)

    oscillator.connect(compressor)
    compressor.connect(analyser)
    analyser.connect(gain)
    gain.connect(context.destination)

    oscillator.start(0)

    // Render offline for more reliable results
    const offlineCtx = new OfflineAudioContext(1, 5000, 44100)
    const offlineOsc = offlineCtx.createOscillator()
    const offlineCompressor = offlineCtx.createDynamicsCompressor()

    offlineOsc.type = 'triangle'
    offlineOsc.frequency.setValueAtTime(10000, offlineCtx.currentTime)

    offlineCompressor.threshold.setValueAtTime(-50, offlineCtx.currentTime)
    offlineCompressor.knee.setValueAtTime(40, offlineCtx.currentTime)
    offlineCompressor.ratio.setValueAtTime(12, offlineCtx.currentTime)
    offlineCompressor.attack.setValueAtTime(0, offlineCtx.currentTime)
    offlineCompressor.release.setValueAtTime(0.25, offlineCtx.currentTime)

    offlineOsc.connect(offlineCompressor)
    offlineCompressor.connect(offlineCtx.destination)
    offlineOsc.start(0)

    const buffer = await offlineCtx.startRendering()
    const channelData = buffer.getChannelData(0)

    // Extract fingerprint from audio samples
    let sum = 0
    for (let i = 4500; i < 5000; i++) {
      sum += Math.abs(channelData[i]!)
    }

    oscillator.stop()
    await context.close()

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: {
        sum,
        sampleRate: buffer.sampleRate,
        length: buffer.length,
      },
      duration,
      entropy: 8,
      stability: 0.8,
    }
  },
}
