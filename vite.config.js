// vite.config.js
// Vite + React + Vitest setup. I enable jsdom and a small setup file to add jest-dom matchers.
// css: true lets components import CSS in tests without errors.

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // absolute path = works whether you run vitest from root or subfolders
    setupFiles: fileURLToPath(new URL('./src/setupTests.js', import.meta.url)),
    css: true,
    globals: true,
    // OPTIONAL: turn on globals if you want to use beforeEach/it without importing
    // globals: true,
  },
})
