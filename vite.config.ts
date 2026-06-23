import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 临时注释devtools消除版本冲突
// import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue()],
  base: '/admin/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.ts', '.vue', '.json', '.css']
  },
  // 强制预构建，让Rolldown识别第三方包
  // optimizeDeps: {
  //   include: ['@wangeditor/editor']
  //},
  build: {
    rollupOptions: {
      // 不要外部化该依赖，需要打包进产物
      external: [],
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT') return
        warn(warning)
      }
    }
  }
})