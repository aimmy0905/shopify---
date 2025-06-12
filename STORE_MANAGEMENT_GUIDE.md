# 店铺管理功能使用指南

## 功能概述

店铺管理是 Shopify 铺货系统的核心功能之一，为商家提供完整的 Shopify 店铺连接、管理和数据同步功能。本模块实现了从店铺授权到数据管理的完整业务流程。

## 主要功能

### 1. 店铺列表页面 (`/merchant/stores`)

**功能特点：**
- 📋 **网格化展示**：以卡片形式展示所有已连接的店铺
- 🔍 **智能搜索**：支持按店铺名称实时搜索
- 📊 **状态管理**：显示店铺授权状态（正常/已过期）
- 🔄 **批量操作**：支持重新授权、删除等操作
- 📄 **分页控制**：支持自定义每页显示数量

**技术实现：**
```vue
<!-- List.vue 关键代码 -->
<template>
  <!-- 搜索区域 -->
  <div class="search-section">
    <el-input v-model="searchQuery" placeholder="请输入店铺名称进行搜索" />
  </div>

  <!-- 店铺网格 -->
  <div class="stores-grid">
    <div v-for="store in displayStores" :key="store.id" class="store-card">
      <!-- 店铺信息卡片 -->
    </div>
  </div>

  <!-- 分页控件 -->
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    layout="total, sizes, prev, pager, next, jumper"
  />
</template>

<script setup>
// 计算属性：过滤后的店铺列表
const filteredStores = computed(() => {
  if (!searchQuery.value) {
    return storeList.value
  }
  return storeList.value.filter(store =>
    store.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
```

### 2. 店铺详情页面 (`/merchant/stores/:id`)

**功能特点：**
- 🏪 **基本信息展示**：店铺名称、URL、ID、授权状态
- 📈 **数据概览**：商品总数、订单总数、销售额等关键指标
- 📊 **趋势图表**：支持切换时间段查看数据趋势
- 📑 **标签页导航**：商品管理、订单管理、同步记录三个功能模块
- ⚙️ **操作中心**：编辑、删除、重新授权、数据同步等功能

**技术实现：**
```vue
<!-- Detail.vue 关键代码 -->
<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb>
    <el-breadcrumb-item>
      <router-link to="/merchant/stores">我的店铺</router-link>
    </el-breadcrumb-item>
    <el-breadcrumb-item>{{ storeInfo.name }}</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 数据概览卡片 -->
  <div class="overview-cards">
    <div class="overview-card">
      <div class="card-content">
        <div class="card-value">{{ storeStats.totalProducts }}</div>
        <div class="card-label">店铺商品总数</div>
      </div>
    </div>
    <!-- 更多统计卡片... -->
  </div>

  <!-- 标签页导航 -->
  <el-tabs v-model="activeTab" type="card">
    <el-tab-pane label="商品管理" name="products">
      <el-table :data="productList" stripe>
        <!-- 商品列表表格 -->
      </el-table>
    </el-tab-pane>
    <!-- 更多标签页... -->
  </el-tabs>
</template>
```

### 3. 添加店铺页面 (`/merchant/stores/add`)

**功能特点：**
- 📝 **表单验证**：域名格式验证、必填项检查
- 🔐 **权限说明**：清晰展示所需的 Shopify 权限
- ❓ **常见问题**：折叠式 FAQ 帮助用户解决疑问
- 🎨 **用户体验**：友好的引导流程和错误提示
- 📱 **响应式设计**：支持移动端访问

**技术实现：**
```vue
<!-- Add.vue 关键代码 -->
<template>
  <!-- 表单验证 -->
  <el-form ref="storeFormRef" :model="storeForm" :rules="formRules">
    <el-form-item label="店铺域名" prop="shopDomain">
      <el-input v-model="storeForm.shopDomain">
        <template #suffix>
          <span class="domain-suffix">.myshopify.com</span>
        </template>
      </el-input>
    </el-form-item>
  </el-form>

  <!-- 常见问题 -->
  <el-collapse v-model="activeFaq">
    <el-collapse-item title="如何找到我的店铺域名？">
      <p>登录您的 Shopify 管理后台，在浏览器地址栏中可以看到...</p>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
// 表单验证规则
const formRules = {
  shopDomain: [
    { required: true, message: '请输入店铺域名', trigger: 'blur' },
    {
      pattern: /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/,
      message: '域名格式不正确，只能包含小写字母、数字和连字符',
      trigger: 'blur'
    }
  ]
}
</script>
```

## 业务流程

### 1. 添加店铺流程
```
1. 用户点击"添加店铺"按钮
2. 跳转到添加店铺页面
3. 填写店铺域名和自定义名称
4. 系统验证表单信息
5. 生成 Shopify OAuth 授权链接
6. 跳转到 Shopify 授权页面
7. 用户完成授权后返回系统
8. 系统保存店铺信息并同步基础数据
9. 跳转到店铺列表页面
```

### 2. 店铺管理流程
```
1. 查看店铺列表（支持搜索和筛选）
2. 点击店铺卡片进入详情页面
3. 查看店铺基本信息和数据概览
4. 通过标签页管理商品、订单、同步记录
5. 执行数据同步、编辑信息等操作
```

## 数据结构

### 店铺信息数据结构
```typescript
interface Store {
  id: number
  name: string                 // 自定义店铺名称
  url: string                  // Shopify 店铺 URL
  shopify_id: string          // Shopify 店铺 ID
  status: 'active' | 'expired' // 授权状态
  created_at: string          // 添加时间
}
```

### 店铺统计数据结构
```typescript
interface StoreStats {
  totalProducts: number       // 商品总数
  totalOrders: number        // 订单总数
  totalRevenue: string       // 总销售额
  syncedProducts: number     // 已同步商品数
}
```

## 技术特点

### 1. Vue 3 Composition API
- 使用 `<script setup>` 语法糖
- 响应式数据管理（`ref`, `reactive`, `computed`）
- 生命周期钩子优化

### 2. Element Plus UI 组件
- 卡片布局展示
- 表格数据展示
- 表单验证
- 分页控件
- 标签页导航

### 3. 用户体验优化
- 加载状态显示
- 错误处理和提示
- 确认对话框
- 空状态提示
- 响应式设计

### 4. 代码安全性
- 表单输入验证
- XSS 防护（数据展示时自动转义）
- 操作权限控制
- 安全的删除确认

## 扩展功能

### 1. 待实现功能
- [ ] 真实的 Shopify OAuth 集成
- [ ] 实时数据同步
- [ ] 数据图表展示（ECharts）
- [ ] 批量操作功能
- [ ] 导出数据功能

### 2. 技术优化
- [ ] 虚拟滚动（大量店铺时）
- [ ] 数据缓存机制
- [ ] 离线状态处理
- [ ] 错误监控和上报

## 使用说明（面向学生）

### 简单理解这些功能

1. **店铺列表就像你的书架**
   - 每个店铺就像一本书，整齐地排列在书架上
   - 你可以通过标签（搜索）快速找到你想要的书（店铺）
   - 每本书都有封面信息（店铺基本信息）

2. **店铺详情就像打开一本书**
   - 你可以看到书的详细内容（店铺的所有数据）
   - 有不同的章节（标签页：商品、订单、记录）
   - 可以做笔记和标记（编辑和管理功能）

3. **添加店铺就像买新书**
   - 你需要提供书的信息（店铺域名）
   - 付款确认（授权过程）
   - 把书放到书架上（保存到系统）

### 代码学习要点

1. **Vue 3 响应式数据**：
   ```javascript
   const storeList = ref([])  // 这就像一个会自动更新的列表
   ```

2. **计算属性**：
   ```javascript
   const filteredStores = computed(() => {
     // 这就像一个自动计算器，输入改变时结果自动更新
   })
   ```

3. **事件处理**：
   ```javascript
   const handleClick = () => {
     // 这就像按钮的说明书，告诉按钮被点击时要做什么
   }
   ```

这个店铺管理功能为整个铺货系统提供了坚实的基础，确保用户能够轻松管理他们的 Shopify 店铺！ 