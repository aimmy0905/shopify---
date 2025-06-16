<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <!-- Logo区域 -->
      <div class="logo">
        <el-icon class="logo-icon"><Setting /></el-icon>
        <span class="logo-text">管理后台</span>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#1f2937"
        text-color="#d1d5db"
        active-text-color="#60a5fa"
        unique-opened
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/suppliers">
          <el-icon><OfficeBuilding /></el-icon>
          <span>供应商管理</span>
        </el-menu-item>
        
        <el-sub-menu index="users">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">管理员用户</el-menu-item>
          <el-menu-item index="/admin/roles">角色管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/merchants">
          <el-icon><Shop /></el-icon>
          <span>商家管理</span>
        </el-menu-item>
        
        <el-sub-menu index="products">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/products">商品列表</el-menu-item>
          <el-menu-item index="/admin/product-categories">商品分类管理</el-menu-item>
          <el-menu-item index="/admin/product-audit">商品审核管理</el-menu-item>
          <el-menu-item index="/admin/product-ranking">销量排名</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="orders">
          <template #title>
            <el-icon><DocumentChecked /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/admin/orders/store">店铺订单</el-menu-item>
          <el-menu-item index="/admin/orders/purchase">采购订单</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="purchase">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>采购管理</span>
          </template>
          <el-menu-item index="/admin/purchase-applications">采购申请</el-menu-item>
          <el-menu-item index="/admin/purchase-orders">采购订单</el-menu-item>
          <el-menu-item index="/admin/shipping-records">发货记录</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/balance">
          <el-icon><Wallet /></el-icon>
          <span>余额管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/commission">
          <el-icon><Money /></el-icon>
          <span>分佣管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/invoices">
          <el-icon><Document /></el-icon>
          <span>Invoice管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/shipping">
          <el-icon><Van /></el-icon>
          <span>运费模板</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/settings">
          <el-icon><Tools /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="header">
        <div class="header-left">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPageName">{{ currentPageName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 用户信息下拉菜单 -->
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item @click="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Setting,
  Odometer,
  OfficeBuilding,
  UserFilled,
  Goods,
  DocumentChecked,
  Wallet,
  Money,
  Document,
  Van,
  Tools,
  User,
  ArrowDown,
  SwitchButton,
  Shop,
  ShoppingCart
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 当前激活的菜单项
const activeMenu = ref('/admin/dashboard')

// 页面名称映射
const pageNames = {
  '/admin/dashboard': '数据概览',
  '/admin/suppliers': '供应商管理',
  '/admin/users': '管理员用户',
  '/admin/roles': '角色管理',
  '/admin/merchants': '商家管理',
  '/admin/products': '商品列表',
  '/admin/product-categories': '商品分类管理',
  '/admin/product-audit': '商品审核管理',
  '/admin/product-ranking': '销量排名',
  '/admin/orders/store': '店铺订单',
  '/admin/orders/purchase': '采购订单',
  '/admin/purchase-applications': '采购申请管理',
  '/admin/purchase-orders': '采购订单管理',
  '/admin/shipping-records': '发货记录管理',
  '/admin/balance': '余额管理',
  '/admin/commission': '分佣管理',
  '/admin/invoices': 'Invoice管理',
  '/admin/shipping': '运费模板',
  '/admin/settings': '系统设置'
}

// 当前页面名称
const currentPageName = computed(() => {
  return pageNames[route.path] || ''
})

// 监听路由变化，更新激活菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

// 方法
const goToProfile = () => {
  router.push('/admin/profile')
}

const logout = () => {
  // 清除登录状态
  localStorage.removeItem('admin_token')
  localStorage.removeItem('rememberMe')
  // 跳转到登录页
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow: hidden;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #60a5fa;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.username {
  margin: 0 8px;
  color: #374151;
  font-weight: 500;
}

.dropdown-icon {
  color: #6b7280;
  transition: transform 0.3s;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  min-height: calc(100vh - 60px);
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  color: #cbd5e1;
  background: transparent;
  border: none;
  margin: 2px 8px;
  border-radius: 12px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(147, 197, 253, 0.08) 100%);
    color: #f1f5f9;
    transform: translateX(6px);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.2);
  }

  &.is-active {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: white;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: white;
      border-radius: 0 4px 4px 0;
    }
  }

  .el-icon {
    margin-right: 8px;
    width: 16px;
  }
}

:deep(.el-sub-menu .el-menu-item) {
  height: 45px;
  line-height: 45px;
  padding-left: 50px !important;
}

:deep(.el-sub-menu__title) {
  color: #cbd5e1;
  background: transparent;
  border: none;
  margin: 2px 8px;
  border-radius: 12px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(147, 197, 253, 0.08) 100%);
    color: #f1f5f9;
    transform: translateX(6px);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.2);
  }

  .el-icon {
    margin-right: 8px;
    width: 16px;
  }
}

:deep(.el-sub-menu) {
  .el-menu {
    background: transparent;
  }

  &.is-opened {
    .el-sub-menu__title {
      color: #60a5fa;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%);
      box-shadow: 0 2px 10px rgba(96, 165, 250, 0.15);
    }
  }
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .main-content {
    margin-left: 200px;
  }
  
  .logo-text {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .sidebar {
    width: 100%;
    position: fixed;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style> 