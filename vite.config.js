// vite.config.js
// Vite + React + Vitest setup. I enable jsdom and a small setup file to add jest-dom matchers.
// css: true lets components import CSS in tests without errors.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // gives us window/document for RTL
    setupFiles: './src/setupTests.js',
    css: true                       // allow importing CSS in components under test
  }
})
