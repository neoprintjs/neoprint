import { defineConfig } from 'vitepress'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

export default defineConfig({
  title: 'neoprint',
  titleTemplate: ':title — neoprint | Open-Source Browser Fingerprinting Library',
  description: 'Advanced open-source browser fingerprinting library with cross-browser identification, fingerprint intelligence, and behavioral biometrics. Zero dependencies, TypeScript, modular.',
  base: '/',

  head: [
    ['meta', { name: 'theme-color', content: '#1d4ed8' }],
    ['meta', { name: 'keywords', content: 'browser fingerprint, fingerprinting, device fingerprint, bot detection, anti-detect, cross-browser identification, fraud detection, neoprint, typescript' }],
    ['meta', { property: 'og:title', content: 'neoprint — Open-Source Browser Fingerprinting Library' }],
    ['meta', { property: 'og:description', content: 'Advanced browser fingerprinting with cross-browser ID, anti-detect heuristics, bot signal analysis, behavioral biometrics. Zero dependencies.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://neoprint.dev' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'neoprint — Open-Source Browser Fingerprinting Library' }],
    ['meta', { name: 'twitter:description', content: 'Advanced browser fingerprinting with cross-browser ID, anti-detect heuristics, bot signal analysis, behavioral biometrics. Zero dependencies.' }],
    ['link', { rel: 'canonical', href: 'https://neoprint.dev' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'Live Demo', link: '/demo/' },
      {
        text: `v${pkg.version}`,
        items: [
          { text: 'Changelog', link: 'https://github.com/neoprintjs/neoprint/blob/main/CHANGELOG.md' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is neoprint?', link: '/guide/what-is-neoprint' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Why neoprint?', link: '/guide/comparison' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Fingerprint IDs', link: '/guide/fingerprint-ids' },
            { text: 'Collectors', link: '/guide/collectors',
              collapsed: true,
              items: [
                { text: 'Canvas', link: '/guide/collectors/canvas' },
                { text: 'WebGL', link: '/guide/collectors/webgl' },
                { text: 'Audio', link: '/guide/collectors/audio' },
                { text: 'Fonts', link: '/guide/collectors/fonts' },
                { text: 'Screen', link: '/guide/collectors/screen' },
                { text: 'Navigator', link: '/guide/collectors/navigator' },
                { text: 'Timing', link: '/guide/collectors/timing' },
                { text: 'Media', link: '/guide/collectors/media' },
                { text: 'Storage', link: '/guide/collectors/storage' },
                { text: 'Network', link: '/guide/collectors/network' },
                { text: 'GPU (WebGPU)', link: '/guide/collectors/gpu' },
                { text: 'Math', link: '/guide/collectors/math' },
                { text: 'Intl', link: '/guide/collectors/intl' },
                { text: 'CSS Features', link: '/guide/collectors/css-features' },
                { text: 'Permissions', link: '/guide/collectors/permissions' },
                { text: 'Speech', link: '/guide/collectors/speech' },
                { text: 'DOMRect', link: '/guide/collectors/dom-rect' },
                { text: 'SVG', link: '/guide/collectors/svg' },
                { text: 'WebRTC', link: '/guide/collectors/webrtc' },
                { text: 'Hardware Perf', link: '/guide/collectors/hardware-perf' },
              ],
            },
            { text: 'Confidence & Entropy', link: '/guide/confidence' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Cross-Browser ID', link: '/guide/cross-browser' },
            { text: 'Anti-Detect Heuristics', link: '/guide/anti-detect' },
            { text: 'Fingerprint Lifecycle', link: '/guide/lifecycle' },
            { text: 'Heuristic Bot Signals', link: '/guide/bot-detection' },
            { text: 'Spoofing Heuristics', link: '/guide/spoofing' },
            { text: 'Behavioral Biometrics', link: '/guide/behavior' },
            { text: 'Client-Side Risk Scoring', link: '/guide/attestation' },
            { text: 'Session Linking', link: '/guide/sessions' },
            { text: 'Server Validation', link: '/guide/server-hints' },
            { text: 'Privacy Mode', link: '/guide/privacy' },
            { text: 'Plugin System', link: '/guide/plugins' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'neoprint.get()', link: '/api/get' },
            { text: 'neoprint.compare()', link: '/api/compare' },
            { text: 'neoprint.detectBot()', link: '/api/detect-bot' },
            { text: 'neoprint.detectSpoofing()', link: '/api/detect-spoofing' },
            { text: 'neoprint.detectAntiDetect()', link: '/api/detect-anti-detect' },
            { text: 'neoprint.detectNoise()', link: '/api/detect-noise' },
            { text: 'neoprint.detectIncognito()', link: '/api/detect-incognito' },
            { text: 'neoprint.attestDevice()', link: '/api/attest' },
            { text: 'neoprint.verifyIntegrityToken()', link: '/api/verify-token' },
            { text: 'neoprint.environment()', link: '/api/environment' },
            { text: 'neoprint.lifecycle()', link: '/api/lifecycle' },
            { text: 'neoprint.behavior', link: '/api/behavior' },
            { text: 'neoprint.serverHints()', link: '/api/server-hints' },
            { text: 'neoprint.createSession()', link: '/api/session' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/neoprintjs/neoprint' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@neoprintjs/core' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026 neoprintjs',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/neoprintjs/neoprint/edit/main/docs/:path',
    },
  },
})
