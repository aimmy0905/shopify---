import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 修复 ResizeObserver 错误
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(null, args), delay)
  }
}

const _ResizeObserver = window.ResizeObserver
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 20)
    super(callback)
  }
}

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// Element Plus 中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 全局样式已在 vue.config.js 中配置

const app = createApp(App)

// 注册所有图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用路由
app.use(router)

// 使用 Element Plus，配置中文
app.use(ElementPlus, {
  locale: zhCn,
})

// 使用 Ant Design Vue
app.use(Antd)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  // 忽略 ResizeObserver 相关错误
  if (err.message && err.message.includes('ResizeObserver')) {
    return
  }
  console.error('Global error:', err, info)
}

// 处理未捕获的Promise错误
window.addEventListener('unhandledrejection', event => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.preventDefault()
    return
  }
  console.error('Unhandled promise rejection:', event.reason)
})

app.mount('#app')
