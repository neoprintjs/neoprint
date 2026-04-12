import type { Collector, CollectorResult } from '../types.js'

export const webrtcCollector: Collector = {
  name: 'webrtc',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    if (typeof RTCPeerConnection === 'undefined') {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    const candidates: string[] = []

    try {
      const pc = new RTCPeerConnection({
        iceServers: [],
      })

      pc.createDataChannel('')

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Collect ICE candidates — resolve as soon as we get any candidate
      // or after 200ms, whichever comes first. We only need to know
      // candidate types (mdns/private/public), not wait for all of them.
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 200)
        let resolved = false

        pc.onicecandidate = (event) => {
          if (event.candidate?.candidate) {
            candidates.push(event.candidate.candidate)
            // Got at least one — resolve after a short batch window
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              setTimeout(() => resolve(), 50)
            }
          } else {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              resolve()
            }
          }
        }
      })

      pc.close()
    } catch {
      // WebRTC unavailable or blocked
    }

    // Extract IP patterns without exposing full IPs
    const ipTypes = candidates.map((c) => {
      if (c.includes('.local')) return 'mdns'
      if (c.includes('192.168.') || c.includes('10.') || c.includes('172.')) return 'private'
      return 'public'
    })

    const data = {
      available: true,
      candidateCount: candidates.length,
      ipTypes: [...new Set(ipTypes)],
      hasMdns: ipTypes.includes('mdns'),
      hasPrivate: ipTypes.includes('private'),
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 4,
      stability: 0.5,
    }
  },
}
