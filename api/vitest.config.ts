import { defineConfig } from 'vitest/config'
import path            from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals:     true,
    include:     ['./src/**/*.spec.ts'],
    root:        __dirname,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/modules/**/domain/*.entity.ts',
        'src/modules/**/application/**/*.handler.ts',
        'src/modules/**/application/**/*.mapper.ts',
      ],
      exclude:  ['**/__tests__/**'],
      thresholds: {
        lines:     80,
        functions: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@control-aula/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
