import type { Collector } from '../types.js'

import { canvasCollector } from './canvas.js'
import { webglCollector } from './webgl.js'
import { audioCollector } from './audio.js'
import { fontsCollector } from './fonts.js'
import { screenCollector } from './screen.js'
import { navigatorCollector } from './navigator-info.js'
import { timingCollector } from './timing.js'
import { mediaCollector } from './media.js'
import { storageCollector } from './storage.js'
import { networkCollector } from './network.js'
import { gpuCollector } from './gpu.js'
import { mathCollector } from './math-fp.js'
import { intlCollector } from './intl.js'
import { cssFeaturesCollector } from './css-features.js'
import { permissionsCollector } from './permissions.js'
import { speechCollector } from './speech.js'
import { domRectCollector } from './dom-rect.js'
import { svgCollector } from './svg.js'
import { webrtcCollector } from './webrtc.js'
import { hardwarePerfCollector } from './hardware-perf.js'
import { webglRenderCollector } from './webgl-render.js'
import { shaderPrecisionCollector } from './shader-precision.js'

export const allCollectors: Collector[] = [
  canvasCollector,
  webglCollector,
  audioCollector,
  fontsCollector,
  screenCollector,
  navigatorCollector,
  timingCollector,
  mediaCollector,
  storageCollector,
  networkCollector,
  gpuCollector,
  mathCollector,
  intlCollector,
  cssFeaturesCollector,
  permissionsCollector,
  speechCollector,
  domRectCollector,
  svgCollector,
  webrtcCollector,
  hardwarePerfCollector,
  webglRenderCollector,
  shaderPrecisionCollector,
]

export {
  canvasCollector,
  webglCollector,
  audioCollector,
  fontsCollector,
  screenCollector,
  navigatorCollector,
  timingCollector,
  mediaCollector,
  storageCollector,
  networkCollector,
  gpuCollector,
  mathCollector,
  intlCollector,
  cssFeaturesCollector,
  permissionsCollector,
  speechCollector,
  domRectCollector,
  svgCollector,
  webrtcCollector,
  hardwarePerfCollector,
  webglRenderCollector,
  shaderPrecisionCollector,
}
