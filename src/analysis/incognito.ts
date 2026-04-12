/**
 * Detect incognito / private browsing mode.
 *
 * Based on real-world measurements (Chrome 131, Safari 18, macOS, 2026):
 *
 * Chrome incognito:
 *   - storage quota drops from ~10GB to ~4GB
 *   - navigator.languages trimmed to 1 entry (normally 4+)
 *
 * Safari private:
 *   - storage quota drops from ~82GB to ~1GB
 *   - OPFS (getDirectory) throws error
 *   - speechSynthesis.getVoices() returns 0 voices (normally 68)
 *
 * Firefox private:
 *   - navigator.serviceWorker is undefined
 */
export async function detectIncognito(): Promise<{
  isIncognito: boolean
  signals: string[]
}> {
  const signals: string[] = []
  const browser = detectBrowserType()

  // 1. Storage quota
  // Chrome: normal ~10GB, incognito ~4GB → threshold 6GB
  // Safari: normal ~82GB, private ~1GB → threshold 20GB
  if (navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate()
      if (est.quota != null) {
        const quotaGB = est.quota / (1024 * 1024 * 1024)
        const threshold = browser === 'safari' ? 20 : 6
        if (quotaGB < threshold) {
          signals.push('low_storage_quota')
        }
      }
    } catch {
      signals.push('storage_estimate_blocked')
    }
  }

  // 2. Chrome: navigator.languages trimmed in incognito
  // Normal Chrome has 4+ language entries, incognito strips to 1
  if (browser === 'chrome' || browser === 'edge') {
    const count = navigator.languages?.length ?? 0
    if (count <= 1) {
      signals.push('languages_trimmed')
    }
  }

  // 3. Safari: speechSynthesis returns 0 voices in private mode
  if (browser === 'safari') {
    try {
      let voices = speechSynthesis.getVoices()
      if (voices.length === 0) {
        // Voices may load async — wait briefly
        voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
          const onVoices = () => {
            speechSynthesis.removeEventListener('voiceschanged', onVoices)
            resolve(speechSynthesis.getVoices())
          }
          speechSynthesis.addEventListener('voiceschanged', onVoices)
          setTimeout(() => resolve(speechSynthesis.getVoices()), 300)
        })
      }
      if (voices.length === 0) {
        signals.push('no_speech_voices')
      }
    } catch {
      signals.push('speech_api_error')
    }
  }

  // 4. Safari: OPFS blocked in private mode
  if (navigator.storage?.getDirectory) {
    try {
      await navigator.storage.getDirectory()
    } catch {
      signals.push('opfs_blocked')
    }
  }

  // 5. Firefox: no serviceWorker in private windows
  if (browser === 'firefox') {
    if (!('serviceWorker' in navigator)) {
      signals.push('firefox_no_serviceworker')
    }
  }

  // Any signal is a strong indicator — these are all measured, not guessed
  const isIncognito = signals.length >= 1

  return { isIncognito, signals }
}

function detectBrowserType(): string {
  const ua = navigator.userAgent
  if (/Firefox\//i.test(ua)) return 'firefox'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/Chrome\//i.test(ua)) return 'chrome'
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'safari'
  return 'unknown'
}

/**
 * Collectors that give different results in incognito mode.
 * These are excluded when using 'incognito-resistant' mode.
 */
export const INCOGNITO_VOLATILE_COLLECTORS = new Set([
  'storage',
  'permissions',
  'network',
  'speech',
])
