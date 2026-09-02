import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Gunakan base '/' jika di-deploy ke Vercel, dan '/gentvision/' untuk GitHub Pages
  base: process.env.VERCEL ? '/' : '/gentvision/',
  server: {
    watch: {
      ignored: ['**/contoh project dengan konsep sama/**']
    }
  }
})
