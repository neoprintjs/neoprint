import type { Collector, CollectorResult } from '../types.js'

export const canvasCollector: Collector = {
  name: 'canvas',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const canvas = document.createElement('canvas')
    canvas.width = 280
    canvas.height = 60
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    // Text rendering
    ctx.font = '18px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(100, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('neoprint <canvas> fp', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('neoprint <canvas> fp', 4, 17)

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 280, 0)
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(0.5, '#00ff00')
    gradient.addColorStop(1, '#0000ff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 30, 280, 10)

    // Geometry
    ctx.beginPath()
    ctx.arc(50, 50, 10, 0, Math.PI * 2)
    ctx.fill()

    // Emoji rendering (varies significantly across OS/browser)
    ctx.font = '16px sans-serif'
    ctx.fillText('🐱🌈🎵', 100, 55)

    const dataUrl = canvas.toDataURL('image/png')
    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: dataUrl,
      duration,
      entropy: 10,
      stability: 0.85,
    }
  },
}
