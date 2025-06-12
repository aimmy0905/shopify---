import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// Element Plus 中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

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

app.mount('#app')
