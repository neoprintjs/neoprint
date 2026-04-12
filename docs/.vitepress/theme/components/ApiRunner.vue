<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ method: string }>()

const loading = ref(false)
const result = ref<any>(null)
const elapsed = ref(0)
const error = ref<string | null>(null)

async function run() {
  loading.value = true
  error.value = null
  result.value = null
  const t0 = performance.now()

  try {
    const np = await import('../../../../src/index.js')
    let fp: any

    switch (props.method) {
      case 'get':
        result.value = await np.get()
        break

      case 'compare': {
        const fp1 = await np.get()
        const fp2 = await np.get()
        result.value = np.compare(fp1, fp2)
        break
      }

      case 'detectBot':
        fp = await np.get()
        result.value = np.detectBot(fp)
        break

      case 'detectSpoofing':
        fp = await np.get()
        result.value = np.detectSpoofing(fp)
        break

      case 'detectAntiDetect':
        fp = await np.get()
        result.value = np.detectAntiDetect(fp)
        break

      case 'detectNoise':
        result.value = await np.detectNoise()
        break

      case 'detectIncognito':
        result.value = await np.detectIncognito()
        break

      case 'environment':
        result.value = await np.environment()
        break

      case 'benchmark':
        result.value = await np.benchmark()
        break

      case 'serverHints':
        fp = await np.get()
        result.value = np.serverHints(fp)
        break

      case 'attestDevice':
        fp = await np.get()
        result.value = await np.attestDevice(fp, { strictness: 'high' })
        break

      case 'lifecycle': {
        const lc = np.lifecycle()
        fp = await np.get()
        lc.record(fp)
        const link = lc.link(fp)
        result.value = { recorded: true, link }
        break
      }

      case 'behavior': {
        const collector = np.behavior.start({ duration: 3000 })
        await new Promise(r => setTimeout(r, 3000))
        result.value = collector.collect()
        collector.stop()
        break
      }

      case 'session': {
        const session = np.createSession()
        fp = await np.get()
        result.value = await session.identify(fp)
        break
      }

      default:
        result.value = { error: 'Unknown method' }
    }
  } catch (e: any) {
    error.value = e.message ?? 'Unknown error'
  } finally {
    elapsed.value = Math.round(performance.now() - t0)
    loading.value = false
  }
}

const labels: Record<string, string> = {
  get: 'Generate fingerprint',
  compare: 'Compare two fingerprints',
  detectBot: 'Run bot detection',
  detectSpoofing: 'Run spoofing detection',
  detectAntiDetect: 'Run anti-detect detection',
  detectNoise: 'Run noise detection',
  detectIncognito: 'Run incognito detection',
  environment: 'Detect environment',
  benchmark: 'Run benchmark',
  attestDevice: 'Run device attestation (high strictness)',
  serverHints: 'Generate server hints',
  lifecycle: 'Record & link fingerprint',
  behavior: 'Collect for 3 seconds',
  session: 'Identify session',
}
</script>

<template>
  <div class="api-runner">
    <div class="api-runner-bar">
      <button class="np-run-btn" @click="run" :disabled="loading">
        {{ loading ? (method === 'behavior' ? 'Collecting (3s)...' : 'Running...') : labels[method] ?? 'Run' }}
      </button>
      <span v-if="result && !loading" class="np-run-status">Completed in {{ elapsed }}ms</span>
    </div>
    <div v-if="error" class="np-error">{{ error }}</div>
    <pre v-if="result" class="np-raw" style="margin-top: 12px; max-height: 360px">{{ JSON.stringify(result, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.api-runner {
  margin: 16px 0 24px;
}
.api-runner-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
