import { defineConfig } from 'vitest/config'
import path            from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals:     true,
    include:     ['./src/**/*.spec.ts'],
    root:        __dirname,
  },
  resolve: {
    alias: {
      '@control-aula/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
