import type { EnvironmentResult } from '../types.js'

export function detectEnvironment(): EnvironmentResult {
  const ua = navigator.userAgent
  const platform = navigator.platform

  return {
    type: detectDeviceType(ua),
    os: detectOS(ua, platform),
    browser: detectBrowser(ua),
    vm: detectVM(),
    privacy: detectPrivacy(),
  }
}

function detectDeviceType(ua: string): EnvironmentResult['type'] {
  if (navigator.webdriver) return 'bot'
  if (/bot|crawler|spider|crawling/i.test(ua)) return 'bot'

  const isMobile = /Mobile|Android|iPhone|iPod/i.test(ua)
  const isTablet = /iPad|Tablet|PlayBook/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua))

  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'
  return 'desktop'
}

function detectOS(ua: string, platform: string): EnvironmentResult['os'] {
  let name = 'unknown'
  let version = ''
  let spoofed = false

  if (/Windows/.test(ua)) {
    name = 'Windows'
    const match = ua.match(/Windows NT (\d+\.\d+)/)
    version = match?.[1] ?? ''
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    name = 'macOS'
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)
    version = match?.[1]?.replace(/_/g, '.') ?? ''
  } else if (/Android/.test(ua)) {
    name = 'Android'
    const match = ua.match(/Android (\d+\.?\d*)/)
    version = match?.[1] ?? ''
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    name = 'iOS'
    const match = ua.match(/OS (\d+[._]\d+[._]?\d*)/)
    version = match?.[1]?.replace(/_/g, '.') ?? ''
  } else if (/Linux/.test(ua)) {
    name = 'Linux'
  } else if (/CrOS/.test(ua)) {
    name = 'ChromeOS'
  }

  // Cross-check platform vs UA
  const platformLower = platform.toLowerCase()
  if (name === 'Windows' && platformLower.includes('mac')) spoofed = true
  if (name === 'macOS' && platformLower.includes('win')) spoofed = true

  return { name, version, spoofed }
}

function detectBrowser(ua: string): EnvironmentResult['browser'] {
  let name = 'unknown'
  let version = ''
  let spoofed = false

  if (/Edg\//.test(ua)) {
    name = 'Edge'
    version = ua.match(/Edg\/(\d+\.[\d.]+)/)?.[1] ?? ''
  } else if (/OPR\/|Opera/.test(ua)) {
    name = 'Opera'
    version = ua.match(/(?:OPR|Opera)\/(\d+\.[\d.]+)/)?.[1] ?? ''
  } else if (/Firefox\//.test(ua)) {
    name = 'Firefox'
    version = ua.match(/Firefox\/(\d+\.[\d.]+)/)?.[1] ?? ''
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    name = 'Chrome'
    version = ua.match(/Chrome\/(\d+\.[\d.]+)/)?.[1] ?? ''
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    name = 'Safari'
    version = ua.match(/Version\/(\d+\.[\d.]+)/)?.[1] ?? ''
  }

  // Headless detection
  if (/HeadlessChrome/.test(ua)) {
    spoofed = true
    name = 'HeadlessChrome'
  }

  return { name, version, spoofed }
}

function detectVM(): EnvironmentResult['vm'] {
  const detected = false
  let type: string | undefined

  // WebGL renderer can reveal VM
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string
        const rendererLower = renderer.toLowerCase()
        if (rendererLower.includes('virtualbox')) {
          return { detected: true, type: 'virtualbox' }
        }
        if (rendererLower.includes('vmware')) {
          return { detected: true, type: 'vmware' }
        }
        if (rendererLower.includes('parallels')) {
          return { detected: true, type: 'parallels' }
        }
        if (rendererLower.includes('llvmpipe') || rendererLower.includes('swiftshader')) {
          return { detected: true, type: 'software-renderer' }
        }
      }
    }
  } catch {
    // no WebGL
  }

  return { detected, type }
}

function detectPrivacy(): EnvironmentResult['privacy'] {
  return {
    adBlocker: detectAdBlocker(),
    trackingProtection: detectTrackingProtection(),
    resistFingerprinting: detectResistFingerprinting(),
    tor: detectTor(),
    vpn: 'unknown',
  }
}

function detectAdBlocker(): boolean {
  try {
    const el = document.createElement('div')
    el.className = 'adsbox ad-banner ad_unit'
    el.style.cssText = 'position:absolute;left:-9999px;height:1px'
    el.innerHTML = '&nbsp;'
    document.body.appendChild(el)
    const blocked = el.offsetHeight === 0 || getComputedStyle(el).display === 'none'
    document.body.removeChild(el)
    return blocked
  } catch {
    return false
  }
}

function detectTrackingProtection(): boolean {
  // Firefox tracking protection blocks certain requests
  // Heuristic: check if sendBeacon to a tracking-like URL would be blocked
  return typeof navigator.doNotTrack === 'string' && navigator.doNotTrack === '1'
}

function detectResistFingerprinting(): boolean {
  // Firefox's resistFingerprinting rounds performance.now() to 100ms
  const samples: number[] = []
  for (let i = 0; i < 10; i++) {
    samples.push(performance.now())
  }
  const diffs = samples.slice(1).map((v, i) => v - samples[i]!)
  const allSame = diffs.every((d) => d === 0)
  if (allSame) return false

  const minDiff = Math.min(...diffs.filter((d) => d > 0))
  return minDiff >= 100
}

function detectTor(): boolean {
  // Tor Browser has specific characteristics
  const isTorUA = navigator.userAgent.includes('Firefox') &&
    navigator.platform === 'Win32' && // Tor spoofs to Win32
    screen.width === 1000 && // Default Tor window size
    screen.height === 1000
  return isTorUA
}
