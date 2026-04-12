import type { BehaviorProfile } from '../types.js'

interface BehaviorOptions {
  duration?: number
  trackTyping?: boolean
  trackMouse?: boolean
  trackScroll?: boolean
  trackTouch?: boolean
}

export class BehaviorCollector {
  private keyTimestamps: number[] = []
  private mousePositions: Array<{ x: number; y: number; t: number }> = []
  private scrollEvents: Array<{ y: number; t: number }> = []
  private touchPressures: number[] = []
  private touchSizes: number[] = []
  private listeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = []
  private collecting = false

  start(options: BehaviorOptions = {}): void {
    if (this.collecting) return
    this.collecting = true
    this.reset()

    const opts = {
      trackTyping: true,
      trackMouse: true,
      trackScroll: true,
      trackTouch: true,
      ...options,
    }

    if (opts.trackTyping) {
      this.addListener(document, 'keydown', () => {
        this.keyTimestamps.push(performance.now())
      })
    }

    if (opts.trackMouse) {
      this.addListener(document, 'mousemove', (e: Event) => {
        const ev = e as MouseEvent
        this.mousePositions.push({ x: ev.clientX, y: ev.clientY, t: performance.now() })
      })
    }

    if (opts.trackScroll) {
      this.addListener(window, 'scroll', () => {
        this.scrollEvents.push({ y: window.scrollY, t: performance.now() })
      })
    }

    if (opts.trackTouch) {
      this.addListener(document, 'touchstart', (e: Event) => {
        const ev = e as TouchEvent
        for (let i = 0; i < ev.touches.length; i++) {
          const touch = ev.touches[i]!
          if ('force' in touch) this.touchPressures.push((touch as any).force)
          if ('radiusX' in touch) this.touchSizes.push((touch as any).radiusX)
        }
      })
    }

    if (options.duration) {
      setTimeout(() => this.stop(), options.duration)
    }
  }

  stop(): void {
    this.collecting = false
    for (const { target, type, handler } of this.listeners) {
      target.removeEventListener(type, handler)
    }
    this.listeners = []
  }

  collect(): BehaviorProfile {
    return {
      typing: this.analyzeTyping(),
      mouse: this.analyzeMouse(),
      scroll: this.analyzeScroll(),
      touch: this.analyzeTouch(),
    }
  }

  private reset(): void {
    this.keyTimestamps = []
    this.mousePositions = []
    this.scrollEvents = []
    this.touchPressures = []
    this.touchSizes = []
  }

  private addListener(target: EventTarget, type: string, handler: EventListener): void {
    target.addEventListener(type, handler, { passive: true })
    this.listeners.push({ target, type, handler })
  }

  private analyzeTyping(): BehaviorProfile['typing'] {
    if (this.keyTimestamps.length < 2) {
      return { avgDelay: 0, rhythm: [] }
    }

    const delays: number[] = []
    for (let i = 1; i < this.keyTimestamps.length; i++) {
      delays.push(this.keyTimestamps[i]! - this.keyTimestamps[i - 1]!)
    }

    const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length

    return {
      avgDelay: Math.round(avgDelay * 100) / 100,
      rhythm: delays.slice(0, 50).map((d) => Math.round(d * 100) / 100),
    }
  }

  private analyzeMouse(): BehaviorProfile['mouse'] {
    if (this.mousePositions.length < 3) {
      return { avgSpeed: 0, curvature: 0, jitter: 0 }
    }

    const speeds: number[] = []
    const angles: number[] = []

    for (let i = 1; i < this.mousePositions.length; i++) {
      const prev = this.mousePositions[i - 1]!
      const curr = this.mousePositions[i]!
      const dt = curr.t - prev.t
      if (dt === 0) continue

      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      speeds.push(dist / dt)

      if (i >= 2) {
        const pprev = this.mousePositions[i - 2]!
        const angle1 = Math.atan2(prev.y - pprev.y, prev.x - pprev.x)
        const angle2 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
        angles.push(Math.abs(angle2 - angle1))
      }
    }

    const avgSpeed = speeds.length > 0
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0

    const curvature = angles.length > 0
      ? angles.reduce((a, b) => a + b, 0) / angles.length
      : 0

    // Jitter: variance of very short movements
    const shortMovements = speeds.filter((s) => s < 0.5)
    const jitter = shortMovements.length / Math.max(speeds.length, 1)

    return {
      avgSpeed: Math.round(avgSpeed * 1000) / 1000,
      curvature: Math.round(curvature * 1000) / 1000,
      jitter: Math.round(jitter * 1000) / 1000,
    }
  }

  private analyzeScroll(): BehaviorProfile['scroll'] {
    if (this.scrollEvents.length < 2) {
      return { speed: 0, direction: 'mixed' }
    }

    let ups = 0
    let downs = 0
    const speeds: number[] = []

    for (let i = 1; i < this.scrollEvents.length; i++) {
      const prev = this.scrollEvents[i - 1]!
      const curr = this.scrollEvents[i]!
      const dy = curr.y - prev.y
      const dt = curr.t - prev.t
      if (dt === 0) continue

      speeds.push(Math.abs(dy / dt))
      if (dy > 0) downs++
      else if (dy < 0) ups++
    }

    const speed = speeds.length > 0
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0

    let direction: 'up' | 'down' | 'mixed' = 'mixed'
    const total = ups + downs
    if (total > 0) {
      if (downs / total > 0.8) direction = 'down'
      else if (ups / total > 0.8) direction = 'up'
    }

    return {
      speed: Math.round(speed * 1000) / 1000,
      direction,
    }
  }

  private analyzeTouch(): BehaviorProfile['touch'] {
    return {
      pressure: this.touchPressures.slice(0, 50),
      size: this.touchSizes.slice(0, 50),
    }
  }
}
