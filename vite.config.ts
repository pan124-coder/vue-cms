import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: '/admin/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    // 新增：补齐css扩展名，让Rolldown识别css导入
    extensions: ['.js', '.ts', '.vue', '.json', '.css']
  },
  // 新增build打包配置，解决UNRESOLVED_IMPORT报错
  build: {
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // 屏蔽Rolldown误报的css未解析警告
        if (warning.code === 'UNRESOLVED_IMPORT') return
        warn(warning)
      }
    }
  }
})