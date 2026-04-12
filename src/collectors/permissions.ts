import type { Collector, CollectorResult } from '../types.js'

const PERMISSION_NAMES = [
  'geolocation',
  'notifications',
  'push',
  'camera',
  'microphone',
  'accelerometer',
  'gyroscope',
  'magnetometer',
  'clipboard-read',
  'clipboard-write',
  'midi',
  'background-sync',
  'persistent-storage',
  'screen-wake-lock',
] as const

export const permissionsCollector: Collector = {
  name: 'permissions',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const results: Record<string, string> = {}

    if (!navigator.permissions?.query) {
      return {
        value: null,
        duration: 0,
        entropy: 0,
        stability: 0,
      }
    }

    const queries = PERMISSION_NAMES.map(async (name) => {
      try {
        const status = await navigator.permissions.query({ name: name as PermissionName })
        results[name] = status.state
      } catch {
        results[name] = 'unsupported'
      }
    })

    await Promise.all(queries)

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: results,
      duration,
      entropy: 5,
      stability: 0.65,
    }
  },
}
