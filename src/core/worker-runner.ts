/**
 * Web Worker runner for offloading heavy computation.
 *
 * Splits work into two parallel tracks:
 * 1. Worker thread: math, hardwarePerf, timing, intl, network + all post-collection analysis
 * 2. Main thread: DOM-dependent collectors (canvas, webgl, fonts, etc.)
 *
 * Results are merged and analysis runs in the Worker to keep main thread free.
 */

import type { CollectorResult, FingerprintComponents, Fingerprint, NeoprintOptions } from '../types.js'
import { hashComponents } from './hash.js'
import { computeStableId } from '../analysis/stable-id.js'
import { computeWeightedId } from '../analysis/weighted-id.js'
import { computeCrossBrowserId } from '../analysis/cross-browser.js'

// Collectors that can run in a Web Worker (no DOM access needed)
const WORKER_COMPATIBLE = new Set([
  'math',
  'hardwarePerf',
  'timing',
  'intl',
  'network',
])

/**
 * Generate the inline Worker script.
 * Contains the worker-compatible collector logic and analysis functions.
 */
function createWorkerBlob(): Blob {
  const code = `
    'use strict';

    // ── MurmurHash3 ──
    function murmurhash3(input, seed) {
      seed = seed || 0;
      let h = seed >>> 0;
      const len = input.length;
      let i = 0;
      while (i + 4 <= len) {
        let k = (input.charCodeAt(i) & 0xffff) | ((input.charCodeAt(i + 1) & 0xffff) << 16);
        i += 2;
        k |= 0;
        k = Math.imul(k, 0xcc9e2d51);
        k = (k << 15) | (k >>> 17);
        k = Math.imul(k, 0x1b873593);
        h ^= k;
        h = (h << 13) | (h >>> 19);
        h = Math.imul(h, 5) + 0xe6546b64;
        i += 2;
      }
      let k = 0;
      switch (len & 3) {
        case 3: k ^= (input.charCodeAt(i + 2) & 0xffff) << 16;
        case 2: k ^= (input.charCodeAt(i + 1) & 0xffff) << 8;
        case 1: k ^= input.charCodeAt(i) & 0xffff;
          k = Math.imul(k, 0xcc9e2d51);
          k = (k << 15) | (k >>> 17);
          k = Math.imul(k, 0x1b873593);
          h ^= k;
      }
      h ^= len;
      h ^= h >>> 16;
      h = Math.imul(h, 0x85ebca6b);
      h ^= h >>> 13;
      h = Math.imul(h, 0xc2b2ae35);
      h ^= h >>> 16;
      return h >>> 0;
    }

    // ── Math collector ──
    function collectMath() {
      const start = performance.now();
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
      };
      return { value: data, duration: Math.round((performance.now() - start) * 100) / 100, entropy: 6, stability: 0.95 };
    }

    // ── Hardware Perf collector ──
    function collectHardwarePerf() {
      const start = performance.now();
      function round(ms) { return Math.round(ms * 1000) / 1000; }

      function benchFloat() {
        const t = performance.now();
        let x = 1.0000001;
        for (let i = 0; i < 50000; i++) { x = x * 1.0000001 + 0.0000001; x = Math.sqrt(x * x + 1); }
        return round(performance.now() - t);
      }
      function benchTrig() {
        const t = performance.now();
        let sum = 0;
        for (let i = 0; i < 30000; i++) { sum += Math.sin(i * 0.001) * Math.cos(i * 0.002) + Math.tan(i * 0.0001); }
        return round(performance.now() - t);
      }
      function benchSort() {
        const arr = new Float64Array(5000);
        let seed = 12345;
        for (let i = 0; i < arr.length; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; arr[i] = seed / 0x7fffffff; }
        const t = performance.now();
        Array.from(arr).sort((a, b) => a - b);
        return round(performance.now() - t);
      }
      function benchAlloc() {
        const t = performance.now();
        const a = [];
        for (let i = 0; i < 10000; i++) { a.push({ x: i, y: i * 2, z: String(i) }); }
        let sum = 0; for (const o of a) sum += o.x;
        return round(performance.now() - t);
      }
      function benchString() {
        const t = performance.now();
        let hash = 0;
        const str = 'neoprint-hardware-benchmark-string';
        for (let i = 0; i < 20000; i++) { for (let j = 0; j < str.length; j++) { hash = ((hash << 5) - hash + str.charCodeAt(j)) | 0; } }
        return round(performance.now() - t);
      }
      function benchMatrix() {
        const size = 64;
        const a = new Float64Array(size * size), b = new Float64Array(size * size), c = new Float64Array(size * size);
        for (let i = 0; i < a.length; i++) { a[i] = (i * 7 + 3) % 100; b[i] = (i * 13 + 7) % 100; }
        const t = performance.now();
        for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) { let sum = 0; for (let k = 0; k < size; k++) sum += a[i * size + k] * b[k * size + j]; c[i * size + j] = sum; }
        return round(performance.now() - t);
      }

      const results = {
        floatArith: benchFloat(),
        trigonometry: benchTrig(),
        arraySort: benchSort(),
        objectAlloc: benchAlloc(),
        stringHash: benchString(),
        matrixMul: benchMatrix(),
      };
      return { value: results, duration: Math.round((performance.now() - start) * 100) / 100, entropy: 4, stability: 0.5 };
    }

    // ── Timing collector ──
    function collectTiming() {
      const start = performance.now();
      const samples = [];
      for (let i = 0; i < 20; i++) { const t1 = performance.now(); const t2 = performance.now(); samples.push(t2 - t1); }
      const nonZero = samples.filter(s => s > 0);
      const timerResolution = nonZero.length > 0 ? Math.min(...nonZero) : 0;
      const timezoneOffset = new Date().getTimezoneOffset();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dateNow1 = Date.now(); const dateNow2 = Date.now();
      return {
        value: { timerResolution, timezoneOffset, timezone, dateResolution: dateNow2 - dateNow1, performanceTimeline: typeof performance.getEntries === 'function' },
        duration: Math.round((performance.now() - start) * 100) / 100, entropy: 5, stability: 0.6
      };
    }

    // ── Intl collector ──
    function collectIntl() {
      const start = performance.now();
      const dateOptions = Intl.DateTimeFormat().resolvedOptions();
      const numberOptions = Intl.NumberFormat().resolvedOptions();
      return {
        value: {
          dateTimeFormat: { locale: dateOptions.locale, timeZone: dateOptions.timeZone, calendar: dateOptions.calendar, numberingSystem: dateOptions.numberingSystem },
          numberFormat: { locale: numberOptions.locale, numberingSystem: numberOptions.numberingSystem, style: numberOptions.style, currency: numberOptions.currency || null },
          listFormat: typeof Intl.ListFormat !== 'undefined',
          relativeTimeFormat: typeof Intl.RelativeTimeFormat !== 'undefined',
          pluralRules: new Intl.PluralRules().select(0),
          displayNames: typeof Intl.DisplayNames !== 'undefined',
          segmenter: typeof Intl.Segmenter !== 'undefined',
        },
        duration: Math.round((performance.now() - start) * 100) / 100, entropy: 5, stability: 0.85
      };
    }

    // ── Message handler ──
    self.onmessage = function(e) {
      const { type } = e.data;
      if (type === 'collect') {
        const results = {};
        results.math = collectMath();
        results.hardwarePerf = collectHardwarePerf();
        results.timing = collectTiming();
        results.intl = collectIntl();
        // network: navigator.connection may not exist in all worker contexts
        try {
          const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          results.network = {
            value: { effectiveType: conn?.effectiveType || null, downlink: conn?.downlink || null, rtt: conn?.rtt || null, saveData: conn?.saveData || null, type: conn?.type || null, onLine: navigator.onLine },
            duration: 0, entropy: 3, stability: 0.3
          };
        } catch(e) {
          results.network = { value: { onLine: true }, duration: 0, entropy: 1, stability: 0.3 };
        }
        self.postMessage({ type: 'results', results });
      }
    };
  `
  return new Blob([code], { type: 'application/javascript' })
}

let cachedWorkerUrl: string | null = null

function getWorkerUrl(): string {
  if (!cachedWorkerUrl) {
    cachedWorkerUrl = URL.createObjectURL(createWorkerBlob())
  }
  return cachedWorkerUrl
}

/**
 * Run worker-compatible collectors in a Web Worker.
 * Returns a promise that resolves with collector results.
 */
export function runInWorker(timeout: number = 5000): Promise<FingerprintComponents> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(getWorkerUrl())
      const timer = setTimeout(() => {
        worker.terminate()
        resolve({}) // Fallback: return empty, main thread collectors still work
      }, timeout)

      worker.onmessage = (e) => {
        clearTimeout(timer)
        worker.terminate()
        resolve(e.data.results)
      }

      worker.onerror = () => {
        clearTimeout(timer)
        worker.terminate()
        resolve({}) // Fallback
      }

      worker.postMessage({ type: 'collect' })
    } catch {
      resolve({}) // Workers not supported, fallback to main thread
    }
  })
}

/**
 * Check if Web Workers are available.
 */
export function isWorkerAvailable(): boolean {
  return typeof Worker !== 'undefined'
}

export { WORKER_COMPATIBLE }
