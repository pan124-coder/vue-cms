import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: '/admin/', // 保留你的子目录配置不要改
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.ts', '.vue', '.json', '.css']
  },
  // 关键：强制预构建wangeditor依赖，避免线上裸模块解析失败
  optimizeDeps: {
    include: [
      '@wangeditor/editor'
    ]
  }
})