<script setup lang="ts">
import { ref, computed } from 'vue'

const loading = ref(false)
const fp = ref<any>(null)
const bot = ref<any>(null)
const env = ref<any>(null)
const ad = ref<any>(null)
const bench = ref<any>(null)
const error = ref<string | null>(null)
const tab = ref<'overview' | 'collectors' | 'security' | 'benchmark' | 'raw'>('overview')

async function run() {
  loading.value = true
  error.value = null
  try {
    const np = await import('../../../../src/index.js')
    const f = await np.get({ debug: false })
    fp.value = f
    bot.value = np.detectBot(f)
    env.value = await np.environment()
    ad.value = np.detectAntiDetect(f)
    bench.value = await np.benchmark()
  } catch (e: any) {
    error.value = e.message ?? 'Unknown error'
  } finally {
    loading.value = false
  }
}

const maxMs = computed(() => {
  if (!bench.value) return 1
  return Math.max(...Object.entries(bench.value).filter(([k]) => k !== 'total').map(([, v]) => v as number), 1)
})

function fmt(ms: number) { return ms < 1 ? '<1ms' : ms.toFixed(1) + 'ms' }
function confClass(v: number) { return v >= 0.7 ? 'green' : v >= 0.4 ? 'amber' : 'red' }
function barColor(v: number, invert = false) {
  if (invert) return v > 0.3 ? '#dc2626' : v > 0 ? '#d97706' : 'var(--vp-c-brand-1)'
  return v >= 0.7 ? 'var(--vp-c-brand-1)' : v >= 0.4 ? '#d97706' : '#dc2626'
}
function benchColor(ms: number) { return ms > 200 ? '#dc2626' : ms > 50 ? '#d97706' : 'var(--vp-c-brand-1)' }
function preview(v: unknown): string {
  if (v === null) return 'null'
  if (typeof v === 'string') return v.length > 80 ? v.slice(0, 80) + '...' : v
  const j = JSON.stringify(v)
  return j.length > 80 ? j.slice(0, 80) + '...' : j
}
</script>

<template>
  <div class="np-demo">
    <!-- Run bar -->
    <div class="np-run">
      <button class="np-run-btn" @click="run" :disabled="loading">
        {{ loading ? 'Collecting...' : fp ? 'Run again' : 'Generate fingerprint' }}
      </button>
      <span v-if="fp && bench" class="np-run-status">
        {{ Object.values(fp.components).filter((c: any) => c.value !== null).length }} signals collected in {{ bench.total.toFixed(0) }}ms
      </span>
    </div>

    <div v-if="error" class="np-error">{{ error }}</div>

    <template v-if="fp">
      <!-- Tabs -->
      <div class="np-tabs">
        <button v-for="t in (['overview','collectors','security','benchmark','raw'] as const)" :key="t"
          class="np-tab" :class="{ active: tab === t }" @click="tab = t">
          {{ t.charAt(0).toUpperCase() + t.slice(1) }}
        </button>
      </div>

      <!-- OVERVIEW -->
      <template v-if="tab === 'overview'">
        <p class="np-heading">Fingerprint IDs</p>
        <div class="np-ids">
          <div class="np-id" v-for="[label, val] in [
            ['Full ID', fp.id],
            ['Stable', fp.stableId],
            ['Weighted', fp.weightedId],
            ['Cross-browser', fp.crossBrowserId],
          ]" :key="label">
            <span class="np-id-label">{{ label }}</span>
            <span class="np-id-value">{{ val }}</span>
          </div>
        </div>

        <p class="np-heading">Analysis</p>
        <div class="np-metrics">
          <div>
            <div class="np-metric-label">Confidence</div>
            <div class="np-metric-val" :class="confClass(fp.confidence)">{{ (fp.confidence * 100).toFixed(0) }}%</div>
            <div class="np-bar"><div class="np-bar-fill" :style="{ width: fp.confidence * 100 + '%', background: barColor(fp.confidence) }" /></div>
          </div>
          <div>
            <div class="np-metric-label">Entropy</div>
            <div class="np-metric-val green">{{ fp.entropy.toFixed(0) }} bits</div>
          </div>
          <div>
            <div class="np-metric-label">Spoofing</div>
            <div class="np-metric-val" :class="fp.spoofingScore > 0.3 ? 'red' : fp.spoofingScore > 0 ? 'amber' : 'green'">{{ (fp.spoofingScore * 100).toFixed(0) }}%</div>
            <div class="np-bar"><div class="np-bar-fill" :style="{ width: Math.max(fp.spoofingScore * 100, 1) + '%', background: barColor(fp.spoofingScore, true) }" /></div>
          </div>
          <div>
            <div class="np-metric-label">Collectors</div>
            <div class="np-metric-val green">{{ Object.values(fp.components).filter((c: any) => c.value !== null).length }} / {{ Object.keys(fp.components).length }}</div>
          </div>
        </div>

        <template v-if="env">
          <p class="np-heading">Environment</p>
          <div class="np-pills">
            <span class="np-pill"><b>Device</b>{{ env.type }}</span>
            <span class="np-pill"><b>OS</b>{{ env.os.name }} {{ env.os.version }}</span>
            <span class="np-pill"><b>Browser</b>{{ env.browser.name }} {{ env.browser.version }}</span>
            <span v-if="env.vm.detected" class="np-pill"><b>VM</b>{{ env.vm.type }}</span>
          </div>
        </template>
      </template>

      <!-- COLLECTORS -->
      <template v-if="tab === 'collectors'">
        <div class="np-table-wrap">
          <table class="np-table">
            <thead>
              <tr><th>Collector</th><th>Time</th><th>Entropy</th><th>Stability</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr v-for="(c, name) in fp.components" :key="name">
                <td><span class="name" :class="{ fail: c.value === null }">{{ name }}</span></td>
                <td class="mono">{{ fmt(c.duration) }}</td>
                <td class="mono">{{ c.entropy }}b</td>
                <td class="mono">{{ (c.stability * 100).toFixed(0) }}%</td>
                <td><span class="preview">{{ preview(c.value) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- SECURITY -->
      <template v-if="tab === 'security'">
        <p class="np-heading">Bot detection</p>
        <div class="np-sec-grid" v-if="bot">
          <div class="np-sec-item">
            <div class="np-sec-item-label">Status</div>
            <div class="np-sec-item-val" :class="bot.isBot ? 'bad' : 'ok'">{{ bot.isBot ? 'Bot detected' : 'Clean' }}</div>
          </div>
          <div class="np-sec-item">
            <div class="np-sec-item-label">Score</div>
            <div class="np-sec-item-val" :class="bot.score > 0.2 ? 'bad' : 'ok'">{{ (bot.score * 100).toFixed(1) }}%</div>
          </div>
        </div>
        <div v-if="bot?.signals?.length" class="np-signals">
          <span v-for="s in bot.signals" :key="s" class="np-signal">{{ s }}</span>
        </div>

        <p class="np-heading">Anti-detect browser</p>
        <div class="np-sec-grid" v-if="ad">
          <div class="np-sec-item">
            <div class="np-sec-item-label">Status</div>
            <div class="np-sec-item-val" :class="ad.detected ? 'bad' : 'ok'">{{ ad.detected ? ad.tool : 'Clean' }}</div>
          </div>
          <div class="np-sec-item">
            <div class="np-sec-item-label">Confidence</div>
            <div class="np-sec-item-val" :class="ad.confidence > 0.3 ? 'bad' : 'ok'">{{ (ad.confidence * 100).toFixed(1) }}%</div>
          </div>
        </div>
        <div v-if="ad?.signals?.length" class="np-signals">
          <span v-for="s in ad.signals" :key="s" class="np-signal">{{ s }}</span>
        </div>

        <template v-if="env">
          <p class="np-heading">Privacy</p>
          <div class="np-sec-grid">
            <div class="np-sec-item">
              <div class="np-sec-item-label">Ad blocker</div>
              <div class="np-sec-item-val" :class="env.privacy.adBlocker ? 'warn' : 'ok'">{{ env.privacy.adBlocker ? 'Detected' : 'No' }}</div>
            </div>
            <div class="np-sec-item">
              <div class="np-sec-item-label">Tracking protection</div>
              <div class="np-sec-item-val" :class="env.privacy.trackingProtection ? 'warn' : 'ok'">{{ env.privacy.trackingProtection ? 'On' : 'Off' }}</div>
            </div>
            <div class="np-sec-item">
              <div class="np-sec-item-label">Resist fingerprinting</div>
              <div class="np-sec-item-val" :class="env.privacy.resistFingerprinting ? 'warn' : 'ok'">{{ env.privacy.resistFingerprinting ? 'On' : 'Off' }}</div>
            </div>
            <div class="np-sec-item">
              <div class="np-sec-item-label">Tor</div>
              <div class="np-sec-item-val" :class="env.privacy.tor ? 'bad' : 'ok'">{{ env.privacy.tor ? 'Yes' : 'No' }}</div>
            </div>
          </div>
        </template>
      </template>

      <!-- BENCHMARK -->
      <template v-if="tab === 'benchmark' && bench">
        <template v-for="(ms, name) in bench" :key="name">
          <div v-if="name !== 'total'" class="np-bench-row">
            <span class="np-bench-name">{{ name }}</span>
            <div class="np-bench-track">
              <div class="np-bench-fill" :style="{ width: ((ms as number) / maxMs * 100) + '%', background: benchColor(ms as number) }" />
            </div>
            <span class="np-bench-ms">{{ fmt(ms as number) }}</span>
          </div>
        </template>
        <div class="np-bench-total">Total: {{ bench.total.toFixed(1) }}ms</div>
      </template>

      <!-- RAW -->
      <template v-if="tab === 'raw'">
        <pre class="np-raw">{{ JSON.stringify(fp, null, 2) }}</pre>
      </template>
    </template>
  </div>
</template>
