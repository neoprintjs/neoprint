import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'neoprint',
  description: 'Advanced browser fingerprinting library',
  base: '/neoprint/',

  head: [
    ['meta', { name: 'theme-color', content: '#1d4ed8' }],
    ['meta', { property: 'og:title', content: 'neoprint' }],
    ['meta', { property: 'og:description', content: 'Advanced browser fingerprinting library — open-source, modular, privacy-aware' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'Live Demo', link: '/demo/' },
      {
        text: 'v0.1.0',
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
            { text: 'Collectors', link: '/guide/collectors' },
            { text: 'Confidence & Entropy', link: '/guide/confidence' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Cross-Browser ID', link: '/guide/cross-browser' },
            { text: 'Anti-Detect Detection', link: '/guide/anti-detect' },
            { text: 'Fingerprint Lifecycle', link: '/guide/lifecycle' },
            { text: 'Bot Detection', link: '/guide/bot-detection' },
            { text: 'Spoofing Detection', link: '/guide/spoofing' },
            { text: 'Behavioral Biometrics', link: '/guide/behavior' },
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
      { icon: 'npm', link: 'https://www.npmjs.com/package/neoprint' },
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
