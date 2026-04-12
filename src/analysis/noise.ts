import type { NoiseReport } from '../types.js'

/**
 * Detect canvas noise injection (Brave farbling, Safari ITP, anti-fingerprint extensions).
 * Renders the same content multiple times and checks if results vary.
 */
export async function detectCanvasNoise(samples: number = 5): Promise<NoiseReport> {
  const results: string[] = []

  for (let i = 0; i < samples; i++) {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 30
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return { collector: 'canvas', isNoisy: false, variance: 0, samples: 0 }
    }

    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(10, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('noise test', 2, 15)

    results.push(canvas.toDataURL())
  }

  const unique = new Set(results).size
  const variance = (unique - 1) / Math.max(samples - 1, 1)

  return {
    collector: 'canvas',
    isNoisy: unique > 1,
    variance: Math.round(variance * 1000) / 1000,
    samples,
  }
}

/**
 * Detect audio noise injection.
 * Runs OfflineAudioContext multiple times and compares output.
 */
export async function detectAudioNoise(samples: number = 3): Promise<NoiseReport> {
  const AudioCtx = window.OfflineAudioContext
  if (!AudioCtx) {
    return { collector: 'audio', isNoisy: false, variance: 0, samples: 0 }
  }

  const sums: number[] = []

  for (let i = 0; i < samples; i++) {
    try {
      const ctx = new OfflineAudioContext(1, 5000, 44100)
      const osc = ctx.createOscillator()
      const comp = ctx.createDynamicsCompressor()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(10000, ctx.currentTime)
      comp.threshold.setValueAtTime(-50, ctx.currentTime)
      comp.knee.setValueAtTime(40, ctx.currentTime)
      comp.ratio.setValueAtTime(12, ctx.currentTime)

      osc.connect(comp)
      comp.connect(ctx.destination)
      osc.start(0)

      const buffer = await ctx.startRendering()
      const data = buffer.getChannelData(0)

      let sum = 0
      for (let j = 4500; j < 5000; j++) {
        sum += Math.abs(data[j]!)
      }
      sums.push(sum)
    } catch {
      // audio context failed
    }
  }

  if (sums.length < 2) {
    return { collector: 'audio', isNoisy: false, variance: 0, samples: sums.length }
  }

  // Check variance between runs
  const mean = sums.reduce((a, b) => a + b, 0) / sums.length
  const maxDiff = Math.max(...sums.map((s) => Math.abs(s - mean)))
  const variance = mean > 0 ? maxDiff / mean : 0

  return {
    collector: 'audio',
    isNoisy: variance > 0.0001,
    variance: Math.round(variance * 1000000) / 1000000,
    samples: sums.length,
  }
}

/**
 * Run all noise detections and return reports.
 */
export async function detectNoise(): Promise<NoiseReport[]> {
  const [canvas, audio] = await Promise.all([
    detectCanvasNoise(),
    detectAudioNoise(),
  ])
  return [canvas, audio]
}
