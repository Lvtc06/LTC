import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 项目站点位于 /LTC/，本地开发仍从根路径启动。
  base: process.env.GITHUB_ACTIONS ? '/LTC/' : '/',
  server: { host: '0.0.0.0' },
})
