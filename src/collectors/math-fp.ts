import type { Collector, CollectorResult } from '../types.js'

export const mathCollector: Collector = {
  name: 'math',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    // These math operations produce slightly different results
    // across different JS engines / CPU architectures
    const data = {
      acos: Math.acos(0.123456789),
      acosh: Math.acosh(1e10),
      asin: Math.asin(0.123456789),
      asinh: Math.asinh(1),
      atan: Math.atan(2),
      atanh: Math.atanh(0.5),
      atan2: Math.atan2(0.04, -0.04),
      cbrt: Math.cbrt(100),
      cos: Math.cos(21 * Math.LN2),
      cosh: Math.cosh(1),
      exp: Math.exp(1),
      expm1: Math.expm1(1),
      log: Math.log(10),
      log1p: Math.log1p(10),
      log2: Math.log2(7),
      log10: Math.log10(7),
      sin: Math.sin(1e300),
      sinh: Math.sinh(1),
      sqrt: Math.sqrt(2),
      tan: Math.tan(-1e300),
      tanh: Math.tanh(1),
      pow: Math.pow(Math.PI, -100),
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 6,
      stability: 0.95,
    }
  },
}
