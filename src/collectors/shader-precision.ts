import type { Collector, CollectorResult } from '../types.js'

/**
 * WebGL Shader Precision Fingerprint.
 *
 * Queries the GPU's reported precision for vertex and fragment shaders
 * across all numeric types (LOW_FLOAT, MEDIUM_FLOAT, HIGH_FLOAT,
 * LOW_INT, MEDIUM_INT, HIGH_INT).
 *
 * Each GPU reports different rangeMin, rangeMax, and precision values
 * based on its hardware capabilities. These values are:
 * - Identical across browsers on the same GPU
 * - Different between GPU models/architectures
 * - Not affected by window size, scroll, or browser settings
 * - Fast to query (<1ms, no rendering needed)
 */
export const shaderPrecisionCollector: Collector = {
  name: 'shaderPrecision',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')

    if (!gl) {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    const precisionTypes = [
      gl.LOW_FLOAT,
      gl.MEDIUM_FLOAT,
      gl.HIGH_FLOAT,
      gl.LOW_INT,
      gl.MEDIUM_INT,
      gl.HIGH_INT,
    ] as const

    const labels = [
      'lowFloat', 'medFloat', 'highFloat',
      'lowInt', 'medInt', 'highInt',
    ] as const

    const vertex: Record<string, [number, number, number]> = {}
    const fragment: Record<string, [number, number, number]> = {}

    for (let i = 0; i < precisionTypes.length; i++) {
      const type = precisionTypes[i]!
      const label = labels[i]!

      const vp = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, type)
      if (vp) vertex[label] = [vp.rangeMin, vp.rangeMax, vp.precision]

      const fp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, type)
      if (fp) fragment[label] = [fp.rangeMin, fp.rangeMax, fp.precision]
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: { vertex, fragment },
      duration,
      entropy: 4,
      stability: 0.95,
    }
  },
}
