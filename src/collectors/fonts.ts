import type { Collector, CollectorResult } from '../types.js'

const TEST_FONTS = [
  'Arial', 'Arial Black', 'Arial Narrow', 'Bookman Old Style', 'Calibri',
  'Cambria', 'Century', 'Century Gothic', 'Comic Sans MS', 'Consolas',
  'Courier', 'Courier New', 'Georgia', 'Helvetica', 'Impact',
  'Lucida Console', 'Lucida Sans Unicode', 'Microsoft Sans Serif',
  'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times', 'Times New Roman',
  'Trebuchet MS', 'Verdana', 'Monaco', 'Menlo', 'SF Pro', 'SF Mono',
  'Roboto', 'Noto Sans', 'Ubuntu', 'Cantarell', 'DejaVu Sans',
  'Liberation Sans', 'Droid Sans', 'Fira Sans', 'Open Sans', 'Lato',
  'Source Sans Pro', 'PT Sans', 'Gill Sans', 'Futura', 'Optima',
  'Avenir', 'Didot', 'American Typewriter', 'Baskerville',
]

const BASE_FONTS = ['monospace', 'sans-serif', 'serif'] as const

export const fontsCollector: Collector = {
  name: 'fonts',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    const testString = 'mmmmmmmmmmlli1WwQqYy@#$%'
    const fontSize = '72px'

    const getTextWidth = (font: string): number => {
      ctx.font = `${fontSize} ${font}`
      return ctx.measureText(testString).width
    }

    // Measure base fonts
    const baseWidths = BASE_FONTS.map(getTextWidth)

    // Detect fonts by comparing against base fonts
    const detectedFonts: string[] = []

    for (const font of TEST_FONTS) {
      const detected = BASE_FONTS.some((base, i) => {
        const width = getTextWidth(`'${font}', ${base}`)
        return width !== baseWidths[i]
      })
      if (detected) {
        detectedFonts.push(font)
      }
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: detectedFonts,
      duration,
      entropy: Math.min(detectedFonts.length * 0.5, 12),
      stability: 0.9,
    }
  },
}
