import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps every asset path relative, so the build works on
// GitHub Pages (https://<user>.github.io/<repo>/) without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 700,
  },
})
