import type { Collector, CollectorResult } from '../types.js'

/**
 * Hardware Performance Profiling via micro-benchmarks.
 *
 * Runs a series of fast, deterministic workloads and measures execution time.
 * Even identical CPUs (same model) differ slightly due to:
 * - Silicon lottery (manufacturing variance)
 * - Thermal throttling state
 * - Current CPU frequency / power management
 * - Cache hierarchy differences
 *
 * This produces a timing profile unique to the physical hardware,
 * helping distinguish identical machines in corporate/school environments.
 */
export const hardwarePerfCollector: Collector = {
  name: 'hardwarePerf',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const results = {
      floatArith: benchFloatArithmetic(),
      trigonometry: benchTrigonometry(),
      arraySort: benchArraySort(),
      objectAlloc: benchObjectAllocation(),
      stringHash: benchStringHashing(),
      matrixMul: benchMatrixMultiply(),
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: results,
      duration,
      entropy: 4,
      stability: 0.5,
    }
  },
}

/**
 * Floating-point arithmetic — heavily dependent on FPU pipeline.
 */
function benchFloatArithmetic(): number {
  const t = performance.now()
  let x = 1.0000001
  for (let i = 0; i < 50000; i++) {
    x = x * 1.0000001 + 0.0000001
    x = Math.sqrt(x * x + 1)
  }
  return round(performance.now() - t)
}

/**
 * Trigonometric operations — stresses transcendental math unit.
 */
function benchTrigonometry(): number {
  const t = performance.now()
  let sum = 0
  for (let i = 0; i < 30000; i++) {
    sum += Math.sin(i * 0.001) * Math.cos(i * 0.002) + Math.tan(i * 0.0001)
  }
  return round(performance.now() - t)
}

/**
 * Array sort — stresses branch prediction and memory access patterns.
 */
function benchArraySort(): number {
  // Deterministic pseudo-random array
  const arr = new Float64Array(5000)
  let seed = 12345
  for (let i = 0; i < arr.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    arr[i] = seed / 0x7fffffff
  }
  const t = performance.now()
  Array.from(arr).sort((a, b) => a - b)
  return round(performance.now() - t)
}

/**
 * Object allocation — stresses garbage collector and heap management.
 */
function benchObjectAllocation(): number {
  const t = performance.now()
  const arr: any[] = []
  for (let i = 0; i < 10000; i++) {
    arr.push({ x: i, y: i * 2, z: String(i) })
  }
  // Force engine to keep references alive
  let sum = 0
  for (const obj of arr) sum += obj.x
  return round(performance.now() - t)
}

/**
 * String hashing — stresses string interning and memory bandwidth.
 */
function benchStringHashing(): number {
  const t = performance.now()
  let hash = 0
  const str = 'neoprint-hardware-benchmark-string'
  for (let i = 0; i < 20000; i++) {
    for (let j = 0; j < str.length; j++) {
      hash = ((hash << 5) - hash + str.charCodeAt(j)) | 0
    }
  }
  return round(performance.now() - t)
}

/**
 * Matrix multiplication — stresses ALU and cache lines.
 */
function benchMatrixMultiply(): number {
  const size = 64
  const a = new Float64Array(size * size)
  const b = new Float64Array(size * size)
  const c = new Float64Array(size * size)

  for (let i = 0; i < a.length; i++) {
    a[i] = (i * 7 + 3) % 100
    b[i] = (i * 13 + 7) % 100
  }

  const t = performance.now()
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0
      for (let k = 0; k < size; k++) {
        sum += a[i * size + k]! * b[k * size + j]!
      }
      c[i * size + j] = sum
    }
  }
  return round(performance.now() - t)
}

function round(ms: number): number {
  return Math.round(ms * 1000) / 1000
}
