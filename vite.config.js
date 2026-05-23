import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages: https://wandererharu-sudo.github.io/shichusuimei/ で公開するため base 設定が必要
export default defineConfig({
  plugins: [react()],
  base: '/shichusuimei/',
})
