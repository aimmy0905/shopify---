# Shopify 铺货系统前端 (Shopify Dropshipping System Frontend)

## 项目概述

这是 Shopify 铺货系统的前端应用，基于 Vue.js 3 构建。系统为 Shopify 店铺商家提供一站式商品管理、订单处理和供应链解决方案的用户界面。系统分为商家端和管理端两个部分的前端界面。

### 核心功能界面
- 🏪 **店铺管理系统** ✅: 完整的Shopify店铺管理功能
  - 店铺列表展示（搜索、筛选、分页）
  - 店铺授权连接（OAuth授权流程）
  - **新增：快速授权新店铺功能** ✅
    - 一键授权入口，简化店铺连接流程
    - Shopify官方OAuth2.0授权标准
    - 授权进度可视化展示
    - 授权成功/失败状态处理
    - 授权回调页面自动处理
  - **优化：店铺详情数据概览** ✅
    - 移除利润数据显示，保护商业敏感信息
    - 保留销售额、订单数、客单价、售后等核心指标
    - 优化数据展示布局和用户体验
  - 店铺详情管理（基本信息、数据概览、图表分析）
  - 数据同步功能（商品、订单、客户信息同步）
  - 操作管理（编辑、删除、重新授权）
- 🛍️ **商品导入管理系统** ✅: 完整的商品导入和铺货功能
  - 平台商品浏览和筛选
  - **新增：商品详情页导入功能** ✅
    - 商品详情页直接添加到导入列表
    - 智能确认对话框，显示商品详细信息
    - 重复检测，避免重复添加
    - 添加成功后可选择立即查看导入列表
  - 单个/批量添加商品到导入列表
  - 导入列表统一管理和铺货操作
  - 实时数量统计和跨页面数据同步
- 📦 **订单管理界面**: 订单列表、详情和状态管理界面
- 💰 **余额管理界面**: 余额查询、充值和提现申请界面
- 📋 **采购申请界面**: 采购申请创建和管理界面
- 💸 **佣金管理界面**: 佣金统计和下级用户管理界面
- 📄 **Invoice管理界面**: 发票申请和查看界面

### 目标用户界面
- **商家端界面**: 为 Shopify 店铺运营者提供的管理界面
- **管理端界面**: 为平台管理人员提供的后台管理界面

## 系统架构

### 前端架构
```
┌─────────────────────────────────────────────────────────────┐
│                    前端应用架构                              │
├─────────────────────────────────────────────────────────────┤
│  商家端界面                    │    管理端界面               │
│  ├─ 店铺管理页面               │    ├─ 供应商管理页面        │
│  ├─ 商品铺货页面               │    ├─ 商品管理页面          │
│  ├─ 订单管理页面               │    ├─ 订单管理页面          │
│  ├─ 余额管理页面               │    ├─ 用户管理页面          │
│  ├─ 采购申请页面               │    ├─ 财务管理页面          │
│  ├─ 佣金管理页面               │    ├─ 分佣管理页面          │
│  └─ Invoice管理页面            │    └─ 系统设置页面          │
├─────────────────────────────────────────────────────────────┤
│                    Vue.js 3 核心层                          │
│  ├─ Vue Router (路由管理)      │    ├─ Pinia (状态管理)      │
│  ├─ Element Plus (UI组件)      │    ├─ Axios (HTTP请求)      │
│  └─ TypeScript (类型支持)      │    └─ Vite (构建工具)       │
├─────────────────────────────────────────────────────────────┤
│                    后端 API 接口层                          │
│  (通过 HTTP 请求与后端服务通信)                             │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈
- **框架**: Vue.js 3 (Composition API)
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **样式预处理**: SCSS
- **代码规范**: ESLint + Prettier

## 项目结构

```
src/
├── views/                      # 页面组件
│   ├── auth/                  # 认证相关页面
│   │   ├── Login.vue         # 登录页面
│   │   ├── Register.vue      # 注册页面
│   │   └── ForgotPassword.vue # 忘记密码
│   ├── merchant/              # 商家端页面
│   │   ├── dashboard/        # 仪表板
│   │   ├── stores/           # 店铺管理
│   │   ├── products/         # 商品管理
│   │   ├── orders/           # 订单管理
│   │   ├── purchase/         # 采购管理
│   │   ├── balance/          # 余额管理
│   │   ├── commission/       # 佣金管理
│   │   ├── invoices/         # Invoice管理
│   │   ├── logistics/        # 物流查询
│   │   ├── profile/          # 个人设置
│   │   └── support/          # 客服支持
│   └── admin/                 # 管理端页面
│       ├── dashboard/        # 管理员仪表板
│       ├── suppliers/        # 供应商管理
│       ├── users/            # 用户管理
│       ├── merchants/        # 商家管理
│       ├── products/         # 商品管理
│       ├── orders/           # 订单管理
│       ├── purchase/         # 采购申请管理
│       ├── balance/          # 客户余额管理
│       ├── commission/       # 分佣管理
│       ├── invoices/         # Invoice申请管理
│       ├── shipping/         # 运费模板管理
│       └── settings/         # 系统设置
├── components/                # 可复用组件
│   ├── common/               # 通用组件
│   │   ├── Layout/          # 布局组件
│   │   ├── Table/           # 表格组件
│   │   ├── Form/            # 表单组件
│   │   ├── Upload/          # 上传组件
│   │   ├── Chart/           # 图表组件
│   │   └── Modal/           # 弹窗组件
│   └── business/             # 业务组件
│       ├── ProductCard/     # 商品卡片
│       ├── OrderStatus/     # 订单状态
│       ├── BalanceCard/     # 余额卡片
│       ├── CommissionTree/  # 佣金树形结构
│       └── ShopifyAuth/     # Shopify授权组件
├── stores/                   # Pinia 状态管理
│   ├── modules/
│   │   ├── auth.ts          # 认证状态
│   │   ├── merchant.ts      # 商家状态
│   │   ├── products.ts      # 商品状态
│   │   ├── orders.ts        # 订单状态
│   │   ├── balance.ts       # 余额状态
│   │   └── commission.ts    # 佣金状态
│   └── index.ts
├── api/                      # API 请求模块
│   ├── auth.ts              # 认证相关API
│   ├── shopify.ts           # Shopify集成API
│   ├── products.ts          # 商品管理API
│   ├── orders.ts            # 订单管理API
│   ├── purchase.ts          # 采购相关API
│   ├── balance.ts           # 余额管理API
│   ├── commission.ts        # 佣金相关API
│   ├── logistics.ts         # 物流查询API
│   └── request.ts           # HTTP请求封装
├── utils/                    # 工具函数
│   ├── currency.ts          # 币种转换
│   ├── date.ts              # 日期处理
│   ├── validation.ts        # 表单验证
│   ├── constants.ts         # 常量定义
│   └── helpers.ts           # 辅助函数
├── router/                   # 路由配置
│   ├── merchant.ts          # 商家端路由
│   ├── admin.ts             # 管理端路由
│   ├── guards.ts            # 路由守卫
│   └── index.ts
├── types/                    # TypeScript 类型定义
│   ├── auth.ts              # 认证相关类型
│   ├── merchant.ts          # 商家相关类型
│   ├── product.ts           # 商品相关类型
│   ├── order.ts             # 订单相关类型
│   └── api.ts               # API响应类型
├── assets/                   # 静态资源
│   ├── images/              # 图片资源
│   ├── icons/               # 图标资源
│   └── styles/              # 样式文件
└── styles/                   # 全局样式
    ├── variables.scss       # SCSS变量
    ├── mixins.scss          # SCSS混入
    ├── element-plus.scss    # Element Plus主题定制
    └── global.scss          # 全局样式
```

## 核心业务流程界面

### 1. 店铺管理流程界面 ✅
```
店铺列表页面 → 添加店铺 → Shopify授权 → 店铺详情 → 数据同步 → 商品/订单管理
店铺列表页面 → 授权新店铺 → OAuth授权流程 → 授权回调处理 → 店铺连接成功 → 店铺管理
```

### 2. 商品导入铺货流程界面 ✅
```
平台商品页面 → 商品详情页面 → 添加导入列表 → 导入列表管理 → 店铺选择弹窗 → 价格设置页面 → 确认铺货 → 成功提示
平台商品页面 → 批量选择商品 → 批量添加导入 → 导入列表管理 → 批量铺货操作 → 铺货完成
```

### 3. 订单管理流程界面
```
订单列表页面 → 订单详情页面 → 状态更新 → 物流信息页面 → 余额扣费提示
```

### 4. 采购申请流程界面
```
采购申请列表 → 创建申请页面 → 提交确认 → 状态跟踪页面 → 报价查看 → 订单确认
```

### 5. 佣金管理流程界面
```
佣金概览页面 → 邀请管理页面 → 下级用户列表 → 佣金明细 → 结算记录
```

### 6. 余额管理流程界面
```
账户余额 → 余额明细→ 余额充值 → 余额提现 
```
## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装依赖
```bash
cd shopify-dropshipping-system
npm install
# 或者
yarn install
```

### 环境配置
复制环境配置文件：
```bash
cp .env.example .env
```

配置前端环境变量：
```bash
# API 基础URL
VITE_API_BASE_URL=http://localhost:3000/api

# Shopify 应用配置
VITE_SHOPIFY_APP_URL=your_shopify_app_url
VITE_SHOPIFY_API_KEY=your_shopify_api_key

# 应用配置
VITE_APP_TITLE=Shopify铺货系统
VITE_APP_VERSION=1.0.0

# 开发环境配置
VITE_DEV_PORT=8080
```

### 开发环境启动
```bash
# 启动开发服务器
npm run serve
# 或者
yarn serve
```

应用将在 `http://localhost:8080` 启动，支持热重载。

## 已完成功能

### ✅ 用户认证模块
根据产品设计文档完整实现：

#### 1. 登录页面 (`/login`)
- ✅ 系统Logo显示
- ✅ 大字体标题"账号登录"
- ✅ 邮箱输入框，带验证，提示"请输入注册邮箱"
- ✅ 密码输入框，带密码显示切换按钮，提示"请输入密码"
- ✅ "记住我"复选框，默认不选中
- ✅ 登录按钮，主色调，宽度100%
- ✅ "忘记密码"链接，指向密码重置页面
- ✅ "没有账号？立即注册"链接，指向注册页面
- ✅ 页脚版权信息和协议链接

#### 2. 注册页面 (`/register`)
- ✅ 系统Logo显示
- ✅ 大字体标题"创建账户"
- ✅ 用户名称输入框
- ✅ 邮箱输入框，带验证，提示"请输入有效邮箱"
- ✅ 获取验证码按钮，点击后60秒倒计时
- ✅ 验证码输入框，提示"请输入收到的验证码"
- ✅ 密码输入框，带密码强度提示，提示"请设置8位以上包含字母和数字的密码"
- ✅ 确认密码输入框，提示"请再次输入密码"
- ✅ 邀请码输入框（选填），提示"如有邀请码请输入"
- ✅ 用户协议和隐私政策复选框，带链接
- ✅ 注册按钮，主色调，宽度100%
- ✅ "已有账号？立即登录"链接，指向登录页面
- ✅ 页脚版权信息和协议链接

#### 3. 忘记密码页面 (`/forgot-password`)
- ✅ 系统Logo显示
- ✅ 大字体标题"重置密码"
- ✅ 小字体子标题"我们将向您的邮箱发送重置密码的验证码"
- ✅ 邮箱输入框，带验证
- ✅ 获取验证码按钮，点击后60秒倒计时
- ✅ 验证码输入框
- ✅ 新密码输入框，带密码强度提示
- ✅ 确认新密码输入框
- ✅ 重置密码按钮，主色调
- ✅ "返回登录"链接，指向登录页面

### 🎨 界面特色
- **完全按照产品设计文档实现**：严格按照文档描述的页面元素、布局和功能
- **现代化设计**：渐变背景、圆角卡片、阴影效果
- **响应式布局**：适配手机和桌面设备
- **交互体验**：密码显示切换、密码强度提示、倒计时功能
- **表单验证**：实时验证，友好的错误提示
- **无障碍设计**：键盘导航、语义化标签

### 🔧 技术特性
- Vue 3 Composition API
- Element Plus UI组件库
- Vue Router 4 路由管理
- SCSS样式预处理
- 响应式设计
- 表单验证
- 路由守卫

### 🧪 测试说明
目前为演示版本，可以使用任意邮箱和密码进行测试。登录成功后会跳转到Dashboard页面。

### ✅ 侧边导航栏与布局系统
根据产品设计文档完整实现：

#### 1. 侧边导航栏 (`Sidebar.vue`)
- ✅ 支持商家端和管理端两种模式，菜单结构完全按照设计文档
- ✅ 可折叠/展开的侧边栏（260px ↔ 64px）
- ✅ 多级菜单支持（最多支持3级嵌套）
- ✅ 用户信息显示和退出登录功能
- ✅ 响应式设计（移动端抽屉式菜单）
- ✅ 深色主题设计，圆角菜单项，悬停和激活状态效果

#### 2. 主布局系统 (`MainLayout.vue`)
- ✅ 顶部导航栏：面包屑导航、通知中心、用户下拉菜单
- ✅ 内容区域：路由渲染，页面切换动画
- ✅ 通知系统：抽屉式通知面板，分类显示（系统/订单）
- ✅ 完全响应式布局，适配桌面和移动设备

#### 3. 路由系统重构
- ✅ 完整的商家端路由结构（15个主要功能模块）
- ✅ 完整的管理端路由结构（17个管理功能模块）
- ✅ 嵌套布局支持，路由守卫（认证检查、权限检查）
- ✅ 占位符页面系统，便于快速开发

#### 4. 商家端菜单结构
```
仪表板 → 我的店铺 → 商品管理 → 订单管理 → 采购管理 → 
余额管理 → 佣金管理 → Invoice管理 → 物流查询 → 个人设置 → 客服支持
```

#### 5. 管理端菜单结构
```
管理后台 → 供应商管理 → 用户管理 → 商家管理 → 商品管理 → 
订单管理 → 采购申请管理 → 客户余额管理 → 分佣管理 → 
Invoice申请管理 → 运费模板管理 → 系统设置
```

### ⚠️ 注意事项
1. 这是前端展示版本，API接口为模拟实现
2. Logo图片需要替换为真实的系统Logo（目前为占位符）
3. 验证码发送功能需要后端API支持
4. 用户协议和隐私政策链接需要配置真实地址
5. **新增**：大部分页面使用占位符，需要根据具体业务需求逐步实现
6. **新增**：详细的导航系统使用指南请查看 `NAVIGATION_GUIDE.md`

### 生产环境构建
```bash
npm run build
# 或者
yarn build
```

### 代码检查和格式化
```bash
# ESLint 检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

## API 接口对接

### 接口基础配置
```typescript
// api/request.ts
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 主要 API 模块
- **认证模块** (`/api/auth/*`)
- **Shopify集成** (`/api/shopify/*`)
- **商品管理** (`/api/products/*`)
- **订单管理** (`/api/orders/*`)
- **余额管理** (`/api/balance/*`)
- **佣金管理** (`/api/commission/*`)

## 开发规范

### Vue 3 组件规范
```vue
<template>
  <!-- 使用语义化的HTML结构 -->
</template>

<script setup lang="ts">
// 使用 Composition API
import { ref, reactive, computed, onMounted } from 'vue'
import type { ComponentProps } from '@/types'

// 组件属性定义
interface Props {
  title: string
  data?: ComponentProps[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
})

// 响应式数据
const loading = ref(false)
const formData = reactive({})

// 计算属性
const computedValue = computed(() => {
  return props.data.length
})

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="scss" scoped>
// 组件样式，使用 scoped 避免污染
</style>
```

### TypeScript 规范
- 严格的类型定义
- 接口优于类型别名
- 导出类型使用 `export type`
- API 响应数据类型化

### 代码提交规范
- `feat`: 新功能
- `fix`: Bug修复
- `ui`: UI/样式更新
- `refactor`: 代码重构
- `docs`: 文档更新
- `style`: 代码格式调整
- `test`: 测试相关

## 构建和部署

### 生产环境构建
```bash
npm run build
```

构建产物位于 `dist/` 目录，包含所有静态资源。

### Nginx 部署配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 静态资源托管
也可以部署到：
- Vercel
- Netlify  
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 性能优化

### 代码分割
```typescript
// 路由懒加载
const Dashboard = () => import('@/views/merchant/dashboard/Index.vue')
const ProductList = () => import('@/views/merchant/products/List.vue')
```

### 组件优化
- 使用 `v-show` 替代 `v-if` (频繁切换)
- 合理使用 `computed` 和 `watch`
- 大列表虚拟滚动
- 图片懒加载

### 打包优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus']
        }
      }
    }
  }
})
```

## 更新日志

### Version 1.2.0 (2024-01-20)
- ✅ Vue 3 + TypeScript 项目架构搭建
- ✅ Element Plus UI 组件集成
- ✅ Pinia 状态管理配置
- ✅ Vue Router 路由配置和路由守卫
- ✅ Axios HTTP 请求封装
- ✅ ESLint + Prettier 代码规范
- ✅ **用户认证系统**（登录、注册、忘记密码）
- ✅ **侧边导航栏系统**（商家端 + 管理端）
- ✅ **主布局系统**（顶部导航、通知中心、用户菜单）
- ✅ **完整路由结构**（32个页面路由配置）
- ✅ **响应式设计**（桌面端 + 移动端适配）
- ✅ **占位符页面系统**（便于快速开发）
- ✅ **店铺管理系统** - 商家端"我的店铺"功能
  - ✅ 店铺列表页面（搜索、筛选、分页）
  - ✅ 店铺详情页面（基本信息、数据概览、图表展示）
  - ✅ 添加店铺页面（Shopify授权、表单验证）
  - ✅ 店铺操作功能（编辑、删除、重新授权、数据同步）
  - ✅ 标签页导航（商品管理、订单管理、同步记录）
- 🚧 商品管理系统开发中
- 🚧 订单管理系统开发中
- 🚧 管理端业务页面开发中
- 📋 Shopify API 集成待开发
- 📋 数据图表组件待集成

---

**前端开发团队**: Shopify铺货系统前端组  
**项目负责人**: 前端架构师  
**UI/UX设计**: UI设计师  
**最后更新**: 2024年1月

# Shopify 铺货系统 - 商品管理模块

## 📋 项目概述

这是一个基于 Vue 3 + Ant Design Vue 开发的 Shopify 铺货系统商品管理模块。该模块提供了完整的商品管理功能，包括商品的创建、编辑、审核、上架等全流程管理。

## 🚀 主要功能

### 1. 商品列表管理 (`/admin/products`)
- **搜索功能**：支持商品名称、商品编号、SKU 搜索
- **筛选功能**：按分类、状态、供应商、价格范围筛选
- **状态管理**：审核中、待发布、已上架、审核不通过
- **批量操作**：批量审核、批量删除
- **数据导出**：支持商品数据导出

### 2. 商品创建 (`/admin/products/create`)
- **基本信息**：商品名称、分类、编号、图片上传
- **价格库存**：商品价格、建议零售价、库存管理、SKU设置
- **商品描述**：富文本编辑器、规格参数设置
- **供应商信息**：供应商选择、采购成本、利润计算
- **运费设置**：运费模板、重量体积设置
- **其他设置**：商品状态、标签管理

### 3. 商品编辑 (`/admin/products/:id/edit`)
- **数据预填充**：自动加载现有商品数据
- **库存调整**：支持增加/减少库存操作
- **审核历史**：显示完整的审核记录时间线
- **状态管理**：根据权限控制状态变更

### 4. 商品详情 (`/admin/products/:id`)
- **详细信息展示**：商品完整信息查看
- **图片画廊**：多图展示和预览
- **销售数据**：销量图表和趋势分析
- **店铺列表**：关联店铺信息
- **相关商品**：推荐相关商品

### 5. 销量排名 (`/admin/product-ranking`)
- **数据可视化**：ECharts 图表展示
- **时间范围选择**：支持不同时间段分析
- **Top 10 对比**：热销商品排行
- **数据导出**：支持图表和数据导出

### 6. 商品分类管理 (`/admin/product-categories`)
- **树形结构**：层级分类管理
- **图标上传**：分类图标设置
- **拖拽排序**：支持分类顺序调整
- **批量操作**：批量启用/禁用分类

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **UI 组件库**：Ant Design Vue 4.x
- **路由管理**：Vue Router 4
- **图表库**：ECharts 5
- **构建工具**：Vite
- **样式预处理**：SCSS

## 📁 项目结构

```
src/
├── views/admin/
│   ├── Products.vue              # 商品列表页
│   ├── ProductCategories.vue     # 商品分类管理页
│   ├── ProductAudit.vue          # 商品审核管理页
│   ├── ProductRanking.vue        # 销量排名页
│   └── products/
│       ├── Create.vue            # 新增商品页
│       ├── Edit.vue              # 编辑商品页
│       └── Detail.vue            # 商品详情页
├── data/
│   └── mockData.js               # 模拟数据
└── components/
    └── (共用组件)
```

## 🎯 核心特性

### 商品状态流程
1. **待发布** (draft) - 商品保存为草稿状态
2. **审核中** (pending) - 提交审核等待管理员处理
3. **已上架** (published) - 审核通过自动上架
4. **审核不通过** (rejected) - 需要修改后重新提交

### 数据验证
- **必填字段验证**：商品名称、分类、价格、库存、供应商等
- **格式验证**：价格数值、库存数量、图片格式等
- **业务逻辑验证**：利润计算、库存预警等

### 权限控制
- **角色权限**：商户、管理员不同操作权限
- **状态权限**：根据商品状态控制可执行操作
- **数据权限**：供应商数据访问控制

## 📊 数据结构

### 商品数据模型
```javascript
{
  id: Number,                    // 商品ID
  name: String,                  // 商品名称
  code: String,                  // 商品编号
  categoryId: Number,            // 分类ID
  supplierId: Number,            // 供应商ID
  images: Array,                 // 商品图片
  price: Number,                 // 商品价格
  suggestedPrice: Number,        // 建议零售价
  cost: Number,                  // 采购成本
  stock: Number,                 // 库存数量
  status: String,                // 商品状态
  description: String,           // 商品描述
  specifications: Array,         // 规格参数
  tags: Array,                   // 商品标签
  weight: Number,                // 重量
  volume: Number,                // 体积
  shippingTemplateId: Number,    // 运费模板ID
  createdAt: String,             // 创建时间
  updatedAt: String              // 更新时间
}
```

## 🔧 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

## 📝 使用说明

### 1. 商品管理基本流程

#### 创建商品
1. 点击"新增商品"按钮
2. 填写基本信息（名称、分类、图片）
3. 设置价格库存信息
4. 编写商品描述和规格参数
5. 选择供应商和运费设置
6. 选择商品状态（审核中/待发布）
7. 提交保存

#### 商品审核
1. 进入"商品审核管理"页面查看待审核商品
2. 查看审核统计数据（待审核、今日已审核等）
3. 使用筛选条件快速找到目标商品
4. 单个审核：点击"通过"或"拒绝"按钮
5. 批量审核：选择多个商品后点击批量操作
6. 填写审核备注（拒绝时必填）
7. 查看审核历史记录

#### 库存管理
1. 进入商品编辑页面
2. 在库存调整区域选择操作类型
3. 输入调整数量和备注
4. 点击"调整"按钮

### 2. 高级功能使用

#### 批量操作
- 选择多个商品
- 点击批量操作按钮
- 选择操作类型并确认

#### 数据筛选
- 使用搜索框进行关键词搜索
- 使用筛选条件精确查找
- 支持多条件组合筛选

#### 数据导出
- 点击导出按钮
- 选择导出格式
- 下载生成的文件

## 🎨 界面设计

### 设计原则
- **简洁明了**：界面布局清晰，操作流程简单
- **响应式设计**：适配不同屏幕尺寸
- **用户友好**：提供丰富的交互反馈
- **数据可视化**：图表展示关键数据

### 主要页面截图
（此处可以添加实际的页面截图）

## 🔍 常见问题

### Q: 商品图片上传失败怎么办？
A: 请检查图片格式（支持JPG、PNG）和大小（不超过5MB），确保网络连接正常。

### Q: 为什么商品审核后没有自动上架？
A: 请检查商品信息是否完整，确认审核状态是否为"通过"。

### Q: 如何批量修改商品价格？
A: 目前支持批量审核，批量价格修改功能正在开发中。

### Q: 库存数据不准确怎么办？
A: 可以通过库存调整功能手动修正，系统会记录调整历史。

## 🚧 开发计划

### 近期计划
- [ ] 批量价格修改功能
- [ ] 商品模板功能
- [ ] 更多图表类型支持
- [ ] 移动端适配优化

### 长期计划
- [ ] AI 智能定价建议
- [ ] 商品推荐算法
- [ ] 多语言支持
- [ ] API 接口文档

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

### 开发规范
- 使用 Vue 3 Composition API
- 遵循 ESLint 代码规范
- 编写清晰的注释
- 提交前进行测试

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱：developer@example.com
- 项目地址：https://github.com/example/shopify-product-management

---

**注意**：这是一个演示项目，包含模拟数据。在生产环境中使用时，请替换为真实的 API 接口。
