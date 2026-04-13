import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: true,
  target: 'es2022',
})
