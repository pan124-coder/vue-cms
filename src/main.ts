// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import { createPinia } from 'pinia'
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
//
// const app = createApp(App)
//
// const pinia = createPinia()
// pinia.use(piniaPluginPersistedstate) // 注册插件
// const elementLocale = {
//     ...zhCn,
//     el: {
//         ...zhCn.el,
//         pagination: {
//             ...zhCn.el.pagination,
//             goto: '跳转到',
//             pagesize: '/页',
//             total: '共 {total}',
//         },
//     },
// }
// app.use(pinia)
// app.use(ElementPlus, { locale: elementLocale })
// app.use(router)
// app.mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { permissionDirective } from './directives/permission.ts'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.directive('permission', permissionDirective)
app.mount('#app')