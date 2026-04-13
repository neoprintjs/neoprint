<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const fp = ref<any>(null)
const bot = ref<any>(null)
const env = ref<any>(null)
const ad = ref<any>(null)
const bench = ref<any>(null)
const error = ref<string | null>(null)
const tab = ref<'overview' | 'collectors' | 'security' | 'benchmark' | 'raw'>('overview')
const copied = ref<string | null>(null)

function copy(value: string, label: string) {
  navigator.clipboard.writeText(value)
  copied.value = label
  setTimeout(() => { copied.value = null }, 1500)
}

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
onMounted(() => { run() })

function downloadRaw() {
  if (!fp.value) return
  const json = JSON.stringify(fp.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `neoprint-${fp.value.id.slice(0, 8)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function preview(v: unknown): string {
  if (v === null) return 'null'
  if (typeof v === 'string') return v.length > 60 ? v.slice(0, 60) + '...' : v
  const j = JSON.stringify(v)
  return j.length > 60 ? j.slice(0, 60) + '...' : j
}
</script>

<template>
  <div class="np-demo">
    <div class="np-toolbar">
      <div class="np-segments">
        <button v-for="t in (['overview','collectors','security','benchmark','raw'] as const)" :key="t"
          class="np-segment" :class="{ active: tab === t }" @click="tab = t">
          {{ t.charAt(0).toUpperCase() + t.slice(1) }}
        </button>
      </div>
      <button class="np-run-btn" @click="run" :disabled="loading">
        Regenerate
      </button>
    </div>

    <div v-if="error" class="np-error">{{ error }}</div>

    <template v-if="fp">

      <!-- OVERVIEW -->
      <template v-if="tab === 'overview'">
        <div class="np-heading">Fingerprint IDs</div>
        <div class="np-id-grid">
          <div v-for="item in [
            { label: 'Full ID', val: fp.id, desc: 'All collectors combined. Maximum uniqueness, changes on any signal shift.' },
            { label: 'Stable', val: fp.stableId, desc: 'Uses only update-resistant signals. Survives browser updates.' },
            { label: 'Weighted', val: fp.weightedId, desc: 'Entropy-weighted hash. Fewer collisions on similar hardware.' },
            { label: 'Cross-browser', val: fp.crossBrowserId, desc: 'Hardware-only signals. Same ID across Chrome, Firefox, Safari.' },
          ]" :key="item.label" class="np-id-card">
            <div class="np-id-card-header">
              <span class="np-id-card-label">{{ item.label }}</span>
              <button class="np-copy-btn" @click="copy(item.val, item.label)" title="Copy">
                <svg v-if="copied !== item.label" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
            <div class="np-id-card-value">{{ item.val }}</div>
            <div class="np-id-card-desc">{{ item.desc }}</div>
          </div>
        </div>

        <div class="np-heading">Analysis</div>
        <div class="np-metrics">
          <div class="np-metric">
            <div class="np-metric-label">Confidence</div>
            <div class="np-metric-val" :class="confClass(fp.confidence)">{{ (fp.confidence * 100).toFixed(0) }}%</div>
            <div class="np-metric-desc">How reliable the fingerprint is. Based on collector coverage and signal stability.</div>
          </div>
          <div class="np-metric">
            <div class="np-metric-label">Entropy</div>
            <div class="np-metric-val green">{{ fp.entropy.toFixed(0) }} bits</div>
            <div class="np-metric-desc">Bits of uniqueness. 80+ bits can distinguish billions of devices.</div>
          </div>
          <div class="np-metric">
            <div class="np-metric-label">Spoofing</div>
            <div class="np-metric-val" :class="fp.spoofingScore > 0.3 ? 'red' : fp.spoofingScore > 0 ? 'amber' : 'green'">{{ (fp.spoofingScore * 100).toFixed(0) }}%</div>
            <div class="np-metric-desc">Detects fingerprint tampering by cross-referencing collected signals.</div>
          </div>
          <div class="np-metric">
            <div class="np-metric-label">Collectors</div>
            <div class="np-metric-val green">{{ Object.values(fp.components).filter((c: any) => c.value !== null).length }}/{{ Object.keys(fp.components).length }}</div>
            <div class="np-metric-desc">How many signal collectors returned valid data out of total registered.</div>
          </div>
        </div>

        <template v-if="env">
          <div class="np-heading">Environment</div>
          <div class="np-pills">
            <div class="np-pill"><span class="np-pill-label">Device</span><span class="np-pill-value">{{ env.type }}</span></div>
            <div class="np-pill"><span class="np-pill-label">OS</span><span class="np-pill-value">{{ env.os.name }} {{ env.os.version }}</span></div>
            <div class="np-pill"><span class="np-pill-label">Browser</span><span class="np-pill-value">{{ env.browser.name }} {{ env.browser.version }}</span></div>
            <div v-if="env.vm.detected" class="np-pill"><span class="np-pill-label">VM</span><span class="np-pill-value">{{ env.vm.type }}</span></div>
          </div>
        </template>
      </template>

      <!-- COLLECTORS -->
      <template v-if="tab === 'collectors'">
        <div class="np-heading">Signal collectors</div>
        <div class="np-desc">Raw results from each of the 20 signal collectors — timing, entropy, stability, and collected value.</div>
        <div class="np-collectors">
          <div v-for="(c, name) in fp.components" :key="name" class="np-collector-card">
            <div class="np-collector-header">
              <span class="np-collector-name" :class="{ fail: c.value === null }">{{ name }}</span>
              <span class="np-collector-meta">{{ fmt(c.duration) }} · {{ c.entropy }}b · {{ (c.stability * 100).toFixed(0) }}%</span>
            </div>
            <div class="np-collector-preview">{{ preview(c.value) }}</div>
          </div>
        </div>
      </template>

      <!-- SECURITY -->
      <template v-if="tab === 'security'">
        <div class="np-heading">Bot detection</div>
        <div class="np-desc">Checks for Puppeteer, Playwright, Selenium, headless Chrome, and 30+ automation signals.</div>
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

        <div class="np-heading">Anti-detect browser</div>
        <div class="np-desc">Detects Multilogin, GoLogin, Dolphin Anty, and other anti-detect tools via prototype tampering and inconsistencies.</div>
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
          <div class="np-heading">Privacy</div>
          <div class="np-desc">Detected privacy tools and browser protections.</div>
          <div class="np-sec-grid">
            <div class="np-sec-item">
              <div class="np-sec-item-label">Ad blocker</div>
              <div class="np-sec-item-val" :class="env.privacy.adBlocker ? 'bad' : 'ok'">{{ env.privacy.adBlocker ? 'Detected' : 'No' }}</div>
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
        <div class="np-heading">Collector performance</div>
        <div class="np-desc">How long each signal collector takes to execute on your device.</div>
        <div class="np-bench-wrap">
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
        </div>
      </template>

      <!-- RAW -->
      <template v-if="tab === 'raw'">
        <div class="np-heading">Raw fingerprint JSON</div>
        <div class="np-desc">Full fingerprint object as returned by neoprint.get().</div>
        <div style="margin-bottom: 12px">
          <button class="np-run-btn" @click="downloadRaw">Download JSON</button>
        </div>
        <pre class="np-raw">{{ JSON.stringify(fp, null, 2) }}</pre>
      </template>
    </template>
  </div>
</template>
