# Hardware Performance Profiling

Hardware performance profiling runs a series of micro-benchmarks to capture timing characteristics unique to the physical CPU. Even two identical processor models differ due to silicon lottery, thermal state, and power management.

## How it works

Neoprint executes 6 distinct workloads and measures their execution time in milliseconds:

### 1. Float arithmetic
Stresses the floating-point unit (FPU) pipeline with chained multiply-add-sqrt operations.
```ts
let x = 1.0000001
for (let i = 0; i < 50000; i++) {
  x = x * 1.0000001 + 0.0000001
  x = Math.sqrt(x * x + 1)
}
```

### 2. Trigonometry
Tests transcendental math unit performance with sin/cos/tan.
```ts
for (let i = 0; i < 30000; i++) {
  sum += Math.sin(i * 0.001) * Math.cos(i * 0.002) + Math.tan(i * 0.0001)
}
```

### 3. Array sort
Exercises branch prediction and memory access patterns.
```ts
Array.from(new Float64Array(5000)).sort((a, b) => a - b)
```

### 4. Object allocation
Measures heap allocation speed and garbage collector pressure.
```ts
for (let i = 0; i < 10000; i++) {
  arr.push({ x: i, y: i * 2, z: String(i) })
}
```

### 5. String hashing
Tests string interning and memory bandwidth with repeated character processing.
```ts
for (let i = 0; i < 20000; i++) {
  for (let j = 0; j < str.length; j++) {
    hash = ((hash << 5) - hash + str.charCodeAt(j)) | 0
  }
}
```

### 6. Matrix multiplication
Stresses ALU and cache lines with 64x64 matrix multiply using Float64Arrays.

## Why identical CPUs produce different results

| Factor | Effect |
|---|---|
| **Silicon lottery** | Manufacturing variance means each chip has slightly different transistor characteristics |
| **Thermal throttling** | CPU frequency varies with temperature |
| **Power management** | Battery vs plugged in, power plan settings |
| **Background load** | Other processes affect available compute |
| **Cache state** | L1/L2/L3 cache warming differs per run |
| **CPU microcode** | Different microcode versions affect scheduling |

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~4 bits |
| **Stability** | 0.50 |
| **Typical duration** | 8-15ms |

Stability is lower than other collectors because timing varies with system load. However, the relative ratios between benchmarks are more stable than absolute values.

## Role in risk scoring

The [`neoprint.attestDevice()`](/api/attest) function checks that hardware perf timings are realistic:
- All benchmarks should complete in > 0ms (instant = emulated environment)
- All benchmarks should complete in < 500ms (artificially slow = suspicious)

## Web Worker offloading

Hardware perf is one of the collectors that runs in a Web Worker by default, keeping the main thread free during benchmarking.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['hardwarePerf'] })
const perf = fp.components.hardwarePerf.value

console.log(perf.floatArith)    // e.g. 2.1ms
console.log(perf.trigonometry)  // e.g. 1.8ms
console.log(perf.arraySort)    // e.g. 3.2ms
console.log(perf.objectAlloc)  // e.g. 1.5ms
console.log(perf.stringHash)   // e.g. 2.0ms
console.log(perf.matrixMul)    // e.g. 1.2ms
```
