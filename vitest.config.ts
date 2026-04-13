import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['tests/browser/**', 'node_modules/**'],
  },
})
