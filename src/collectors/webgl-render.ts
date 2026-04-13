import type { Collector, CollectorResult } from '../types.js'

/**
 * WebGL Rendering Fingerprint.
 *
 * Renders a deterministic 3D scene and hashes the pixel output.
 * Different GPUs produce subtly different pixel values due to:
 * - Floating-point precision in shaders
 * - Anti-aliasing implementation
 * - Texture filtering algorithms
 * - Blending mode precision
 * - Driver-level optimizations
 *
 * Unlike WebGL parameter fingerprinting (vendor/renderer strings),
 * this is based on actual rendering output — harder to spoof and
 * consistent across browsers on the same GPU hardware.
 */
export const webglRenderCollector: Collector = {
  name: 'webglRender',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: false,
    })

    if (!gl) {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }

    try {
      renderScene(gl)

      const pixels = new Uint8Array(64 * 64 * 4)
      gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

      // Hash pixel data — use a fast rolling hash
      let hash1 = 0x811c9dc5
      let hash2 = 0
      for (let i = 0; i < pixels.length; i += 4) {
        // Sample every pixel's RGB (skip alpha)
        hash1 = Math.imul(hash1 ^ pixels[i]!, 0x01000193)
        hash1 = Math.imul(hash1 ^ pixels[i + 1]!, 0x01000193)
        hash1 = Math.imul(hash1 ^ pixels[i + 2]!, 0x01000193)
        hash2 += pixels[i]! + pixels[i + 1]! * 256 + pixels[i + 2]! * 65536
      }

      const value = {
        hash: (hash1 >>> 0).toString(16).padStart(8, '0'),
        checksum: hash2,
      }

      const duration = Math.round((performance.now() - start) * 100) / 100

      return {
        value,
        duration,
        entropy: 8,
        stability: 0.85,
      }
    } catch {
      return { value: null, duration: 0, entropy: 0, stability: 0 }
    }
  },
}

function renderScene(gl: WebGLRenderingContext): void {
  // Vertex shader — applies rotation and perspective
  const vsSource = `
    attribute vec4 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;
    uniform float uAngle;
    void main() {
      float c = cos(uAngle);
      float s = sin(uAngle);
      mat4 rot = mat4(
        c, 0.0, s, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -s, 0.0, c, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
      gl_Position = rot * aPosition;
      vColor = aColor;
    }
  `

  // Fragment shader — gradient with precision-sensitive math
  const fsSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      // Apply sin/cos to amplify GPU floating-point differences
      float r = vColor.r * 0.8 + sin(vColor.g * 3.14159) * 0.2;
      float g = vColor.g * 0.7 + cos(vColor.b * 2.71828) * 0.3;
      float b = vColor.b * 0.9 + sin(vColor.r * 1.41421) * 0.1;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `

  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return

  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

  gl.useProgram(program)

  // Geometry: a cube with colored vertices
  // prettier-ignore
  const vertices = new Float32Array([
    // Front face (red-ish)
    -0.5, -0.5,  0.5,   1.0, 0.2, 0.1,
     0.5, -0.5,  0.5,   0.9, 0.3, 0.2,
     0.5,  0.5,  0.5,   0.8, 0.1, 0.3,
    -0.5, -0.5,  0.5,   1.0, 0.2, 0.1,
     0.5,  0.5,  0.5,   0.8, 0.1, 0.3,
    -0.5,  0.5,  0.5,   0.7, 0.4, 0.2,
    // Right face (green-ish)
     0.5, -0.5,  0.5,   0.1, 0.9, 0.2,
     0.5, -0.5, -0.5,   0.2, 0.8, 0.3,
     0.5,  0.5, -0.5,   0.3, 0.7, 0.1,
     0.5, -0.5,  0.5,   0.1, 0.9, 0.2,
     0.5,  0.5, -0.5,   0.3, 0.7, 0.1,
     0.5,  0.5,  0.5,   0.2, 1.0, 0.2,
    // Top face (blue-ish)
    -0.5,  0.5,  0.5,   0.1, 0.2, 0.9,
     0.5,  0.5,  0.5,   0.2, 0.3, 0.8,
     0.5,  0.5, -0.5,   0.3, 0.1, 0.7,
    -0.5,  0.5,  0.5,   0.1, 0.2, 0.9,
     0.5,  0.5, -0.5,   0.3, 0.1, 0.7,
    -0.5,  0.5, -0.5,   0.2, 0.2, 1.0,
  ])

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const aPosition = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0)

  const aColor = gl.getAttribLocation(program, 'aColor')
  gl.enableVertexAttribArray(aColor)
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12)

  const uAngle = gl.getUniformLocation(program, 'uAngle')
  gl.uniform1f(uAngle, 0.7853981633974483) // pi/4 — deterministic angle

  gl.viewport(0, 0, 64, 64)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)

  gl.drawArrays(gl.TRIANGLES, 0, 18)
  gl.finish()

  // Cleanup
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  gl.deleteProgram(program)
  gl.deleteBuffer(buffer)
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}
