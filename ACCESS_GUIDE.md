# Shopify铺货系统 - 访问指南

## 📱 系统访问方式

你的Shopify铺货系统现在有**两个独立的访问端点**，提供更专业和安全的用户体验！

### 🏠 系统首页
**访问地址**: `http://localhost:8084` （项目目前运行在8084端口）

- 这是系统的**门户选择页面**
- 你可以选择进入**商家端**或**管理端**
- 美观的界面设计，清晰的功能说明

> 💡 **提示**: 如果8084端口无法访问，也可以尝试8081端口

---

## 🏪 商家端（给卖家使用）

### 🔐 登录注册
- **登录**: `http://localhost:8084/merchant/login`
- **注册**: `http://localhost:8084/merchant/register`
- **忘记密码**: `http://localhost:8084/merchant/forgot-password`

### 📊 主要功能页面
- **仪表板**: `http://localhost:8084/merchant/dashboard`
- **店铺管理**: `http://localhost:8081/merchant/stores`
- **商品管理**: `http://localhost:8081/merchant/products/all`
- **订单管理**: `http://localhost:8081/merchant/orders/store`
- **余额管理**: `http://localhost:8081/merchant/balance`
- **佣金管理**: `http://localhost:8081/merchant/commission`
- **采购申请**: `http://localhost:8081/merchant/purchase/applications`
- **Invoice管理**: `http://localhost:8081/merchant/invoices`
- **物流查询**: `http://localhost:8081/merchant/logistics`
- **个人设置**: `http://localhost:8081/merchant/profile`
- **客服支持**: `http://localhost:8081/merchant/support`

---

## 🔧 管理端（给管理员使用）

### 🔐 管理员登录
- **登录**: `http://localhost:8081/admin/login`

### 🛠️ 管理功能页面
- **管理后台**: `http://localhost:8081/admin/dashboard`
- **供应商管理**: `http://localhost:8081/admin/suppliers`
- **用户管理**: `http://localhost:8081/admin/users`
- **角色管理**: `http://localhost:8081/admin/roles`
- **商家管理**: `http://localhost:8081/admin/merchants`
- **商品管理**: `http://localhost:8081/admin/products`
- **订单管理**: `http://localhost:8081/admin/orders`
- **采购申请管理**: `http://localhost:8081/admin/purchase`
- **客户余额管理**: `http://localhost:8081/admin/balance`
- **分佣管理**: `http://localhost:8081/admin/commission`
- **Invoice申请管理**: `http://localhost:8081/admin/invoices`
- **运费模板管理**: `http://localhost:8081/admin/shipping`
- **系统设置**: `http://localhost:8081/admin/settings`

---

## 🎯 系统特点

### ✅ 双端分离
- **商家端**和**管理端**完全独立
- 不同的登录入口，更安全
- 不同的功能权限，更专业

### ✅ 智能路由
- 自动根据用户类型跳转到对应页面
- 防止未授权访问
- 登录状态自动保持

### ✅ 现代化界面
- 美观的门户选择页面
- 响应式设计，支持手机和电脑
- 专业的系统导航

---

## 🚀 快速开始

### 1. 第一次使用
1. 打开浏览器
2. 访问 `http://localhost:8081`
3. 选择你的身份（商家或管理员）
4. 注册或登录账号

### 2. 商家用户
- 点击"**商家端**"卡片
- 进入商家登录页面
- 注册商家账号
- 开始管理你的Shopify店铺

### 3. 管理员用户
- 点击"**管理端**"卡片
- 进入管理员登录页面
- 使用管理员账号登录
- 管理整个平台

---

## 💡 小提示

### 🔍 如何快速找到功能？
- 登录后，左侧有完整的导航菜单
- 每个功能都有清晰的图标和说明
- 支持面包屑导航，知道当前位置

### 📱 手机访问
- 系统完全支持手机浏览器
- 自动适配小屏幕
- 左侧菜单变为抽屉式

### 🔒 安全提醒
- 商家端和管理端使用不同的权限系统
- 登录信息会自动保存
- 长时间不操作会自动退出

---

## 🛠️ 技术信息

- **前端框架**: Vue.js 3
- **UI组件**: Element Plus
- **路由系统**: Vue Router 4
- **状态管理**: 本地存储
- **支持浏览器**: Chrome, Firefox, Safari, Edge

---

## 🆘 遇到问题？

如果访问遇到问题：
1. 检查项目是否正在运行（看看终端是否有错误）
2. 确认端口号是否正确（可能是8081、8082等）
3. 清除浏览器缓存试试
4. 查看浏览器控制台是否有错误信息

**祝你使用愉快！** 🎉 