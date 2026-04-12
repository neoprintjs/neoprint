import type { Collector, CollectorResult } from '../types.js'

export const gpuCollector: Collector = {
  name: 'gpu',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    let data: Record<string, unknown> = { supported: false }

    if ('gpu' in navigator) {
      try {
        const gpu = (navigator as any).gpu
        const adapter = await gpu.requestAdapter()
        if (adapter) {
          const info = await adapter.requestAdapterInfo()
          data = {
            supported: true,
            vendor: info.vendor,
            architecture: info.architecture,
            device: info.device,
            description: info.description,
            features: [...adapter.features],
            limits: extractLimits(adapter.limits),
          }
        }
      } catch {
        // WebGPU not available or denied
      }
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: data.supported ? 10 : 0,
      stability: 0.9,
    }
  },
}

function extractLimits(limits: any): Record<string, number> {
  const result: Record<string, number> = {}
  const keys = [
    'maxTextureDimension1D', 'maxTextureDimension2D', 'maxTextureDimension3D',
    'maxTextureArrayLayers', 'maxBindGroups', 'maxBufferSize',
    'maxStorageBufferBindingSize', 'maxVertexBuffers', 'maxVertexAttributes',
    'maxComputeWorkgroupSizeX', 'maxComputeWorkgroupSizeY', 'maxComputeWorkgroupSizeZ',
    'maxComputeInvocationsPerWorkgroup', 'maxComputeWorkgroupsPerDimension',
  ]
  for (const key of keys) {
    if (key in limits) {
      result[key] = limits[key]
    }
  }
  return result
}
