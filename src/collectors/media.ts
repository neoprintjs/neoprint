import type { Collector, CollectorResult } from '../types.js'

const VIDEO_CODECS = [
  'video/mp4; codecs="avc1.42E01E"',
  'video/mp4; codecs="avc1.64001E"',
  'video/mp4; codecs="hev1.1.6.L93.B0"',
  'video/mp4; codecs="hvc1.1.6.L93.B0"',
  'video/mp4; codecs="av01.0.08M.08"',
  'video/webm; codecs="vp8"',
  'video/webm; codecs="vp9"',
  'video/webm; codecs="av01.0.04M.08"',
  'video/ogg; codecs="theora"',
]

const AUDIO_CODECS = [
  'audio/mp4; codecs="mp4a.40.2"',
  'audio/mpeg',
  'audio/ogg; codecs="vorbis"',
  'audio/ogg; codecs="opus"',
  'audio/wav',
  'audio/webm; codecs="opus"',
  'audio/webm; codecs="vorbis"',
  'audio/flac',
  'audio/aac',
]

export const mediaCollector: Collector = {
  name: 'media',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const video = document.createElement('video')
    const supportedVideo = VIDEO_CODECS.filter(
      (codec) => video.canPlayType(codec) !== '',
    )
    const supportedAudio = AUDIO_CODECS.filter(
      (codec) => video.canPlayType(codec) !== '',
    )

    // MediaDevices
    let deviceKinds: string[] = []
    if (navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        deviceKinds = devices.map((d) => d.kind)
      } catch {
        // permission denied or unavailable
      }
    }

    const data = {
      videoCodecs: supportedVideo,
      audioCodecs: supportedAudio,
      deviceKinds,
      mediaSession: 'mediaSession' in navigator,
      pictureInPicture: 'pictureInPictureEnabled' in document,
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 7,
      stability: 0.85,
    }
  },
}
