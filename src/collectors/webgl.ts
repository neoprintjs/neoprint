import type { Collector, CollectorResult } from '../types.js'

interface WebGLData {
  vendor: string | null
  renderer: string | null
  version: string | null
  shadingLanguageVersion: string | null
  extensions: string[]
  maxTextureSize: number | null
  maxViewportDims: number[] | null
  maxAnisotropy: number | null
  antialias: boolean
  params: Record<string, unknown>
}

export const webglCollector: Collector = {
  name: 'webgl',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')

    if (!gl) {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const anisotropyExt = gl.getExtension('EXT_texture_filter_anisotropic')

    const data: WebGLData = {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      extensions: gl.getSupportedExtensions() ?? [],
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array),
      maxAnisotropy: anisotropyExt
        ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        : null,
      antialias: !!gl.getContextAttributes()?.antialias,
      params: {
        maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        aliasedLineWidthRange: Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) as Float32Array),
        aliasedPointSizeRange: Array.from(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array),
      },
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 12,
      stability: 0.95,
    }
  },
}
