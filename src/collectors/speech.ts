import type { Collector, CollectorResult } from '../types.js'

export const speechCollector: Collector = {
  name: 'speech',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    if (typeof speechSynthesis === 'undefined') {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    // Voices may not be loaded yet — wait briefly
    let voices = speechSynthesis.getVoices()
    if (voices.length === 0) {
      voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const onVoicesChanged = () => {
          speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
          resolve(speechSynthesis.getVoices())
        }
        speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
        // Fallback timeout
        setTimeout(() => resolve(speechSynthesis.getVoices()), 500)
      })
    }

    const data = voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      default: v.default,
    }))

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: Math.min(data.length * 0.3, 10),
      stability: 0.9,
    }
  },
}
