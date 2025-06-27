<template>
  <div class="merchant-layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <!-- Logo区域 -->
      <div class="logo">
        <el-icon class="logo-icon"><Shop /></el-icon>
        <span class="logo-text">Shopify铺货系统</span>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#2c3e50"
        text-color="#ecf0f1"
        active-text-color="#3498db"
        unique-opened
        router
      >
        <el-menu-item index="/merchant/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>{{ t('dashboard') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/merchant/stores">
          <el-icon><Shop /></el-icon>
          <span>{{ t('myStores') }}</span>
        </el-menu-item>
        
        <el-sub-menu index="products">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>{{ t('productManagement') }}</span>
          </template>
          <el-menu-item index="/merchant/products/all">{{ t('platformProducts') }}</el-menu-item>
          <el-menu-item index="/merchant/products/import">{{ t('importProducts') }}</el-menu-item>
          <el-menu-item index="/merchant/products/my">{{ t('myProducts') }}</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/merchant/orders/store">
          <el-icon><DocumentChecked /></el-icon>
          <span>{{ t('orderManagement') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/merchant/purchase">
          <el-icon><ShoppingCart /></el-icon>
          <span>{{ t('purchaseManagement') }}</span>
        </el-menu-item>
        

        <el-menu-item index="/merchant/commission">
          <el-icon><Money /></el-icon>
          <span>{{ t('commissionManagement') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/merchant/invoices">
          <el-icon><Document /></el-icon>
          <span>{{ t('invoiceManagement') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/merchant/logistics">
          <el-icon><Van /></el-icon>
          <span>{{ t('logisticsInfo') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/merchant/profile">
          <el-icon><User /></el-icon>
          <span>{{ t('personalSettings') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/merchant/support">
          <el-icon><Service /></el-icon>
          <span>{{ t('customerSupport') }}</span>
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
            <el-breadcrumb-item :to="{ path: '/merchant/dashboard' }">{{ t('home') }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPageName">{{ currentPageName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 语言切换下拉菜单 -->
          <el-dropdown @command="handleLanguageChange" class="language-dropdown">
            <div class="language-selector">
              <el-icon><Globe /></el-icon>
              <span class="language-text">{{ t('language') }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh" :class="{ 'is-active': currentLang === 'zh' }">
                  {{ t('chinese') }}
                </el-dropdown-item>
                <el-dropdown-item command="en" :class="{ 'is-active': currentLang === 'en' }">
                  {{ t('english') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 消息中心 -->
          <el-dropdown @command="handleNotificationCommand" class="notification-dropdown">
            <div class="notification-trigger" @click="toggleNotificationPanel">
              <el-badge :value="unreadNotificationCount" :hidden="unreadNotificationCount === 0" class="notification-badge">
                <el-icon class="notification-icon"><Bell /></el-icon>
              </el-badge>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="notification-dropdown-menu">
                <div class="notification-header">
                  <span class="notification-title">通知与公告</span>
                  <el-button
                    v-if="unreadNotificationCount > 0"
                    type="primary"
                    size="small"
                    text
                    @click="markAllAsRead"
                  >
                    全部已读
                  </el-button>
                </div>
                <div class="notification-content">
                  <div v-if="notifications.length === 0" class="empty-notifications">
                    <el-empty description="暂无通知" :image-size="60" />
                  </div>
                  <div v-else class="notification-list">
                    <div
                      v-for="notification in notifications"
                      :key="notification.id"
                      class="notification-item"
                      :class="{ 'unread': !notification.read }"
                      @click="handleNotificationClick(notification)"
                    >
                      <div class="notification-icon-wrapper" :class="notification.type">
                        <component :is="getNotificationIcon(notification.type)"></component>
                      </div>
                      <div class="notification-content-wrapper">
                        <div class="notification-title-text">{{ notification.title }}</div>
                        <div class="notification-time">{{ notification.time }}</div>
                      </div>
                      <div v-if="!notification.read" class="unread-dot"></div>
                    </div>
                  </div>
                </div>
                <div class="notification-footer">
                  <el-button type="primary" size="small" text @click="viewAllNotifications">
                    查看全部
                  </el-button>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 用户信息下拉菜单 -->
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{ t('merchant') }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  {{ t('profile') }}
                </el-dropdown-item>
                <el-dropdown-item @click="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  {{ t('logout') }}
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
import { ElMessage } from 'element-plus'
import {
  Shop,
  Odometer,
  Goods,
  DocumentChecked,
  ShoppingCart,

  Money,
  Document,
  Van,
  User,
  Service,
  ArrowDown,
  SwitchButton,
  Globe,
  Bell,
  Warning,
  InfoFilled,
  SuccessFilled,
  Notification
} from '@element-plus/icons-vue'
import { t, currentLang, switchLanguage } from '@/utils/i18n.js'

const route = useRoute()
const router = useRouter()

// 当前激活的菜单项
const activeMenu = ref('/merchant/dashboard')

// 通知相关状态
const showNotificationPanel = ref(false)
const notifications = ref([
  {
    id: 1,
    type: 'warning',
    title: '库存不足提醒',
    time: '1小时前',
    read: false
  },
  {
    id: 2,
    type: 'notice',
    title: '系统维护通知',
    time: '3小时前',
    read: false
  },
  {
    id: 3,
    type: 'success',
    title: '订单处理完成',
    time: '5小时前',
    read: true
  },
  {
    id: 4,
    type: 'info',
    title: '新功能上线通知',
    time: '1天前',
    read: false
  }
])

// 计算未读通知数量
const unreadNotificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 页面名称映射（使用国际化）
const getPageNames = () => ({
  '/merchant/dashboard': t('dashboard'),
  '/merchant/stores': t('myStores'),
  '/merchant/products/all': t('platformProducts'),
  '/merchant/products/import': t('importProducts'),
  '/merchant/products/my': t('myProducts'),
  '/merchant/orders/store': t('storeOrders'),
  '/merchant/orders/purchase': t('purchaseOrders'),
  '/merchant/orders/aftersale': t('aftersaleOrders'),
  '/merchant/purchase': t('purchaseManagement'),
  '/merchant/purchase/applications': t('purchaseManagement'),
  '/merchant/purchase/create': t('purchaseManagement'),

  '/merchant/commission': t('commissionManagement'),
  '/merchant/invoices': t('invoiceManagement'),
  '/merchant/logistics': t('logisticsInfo'),
  '/merchant/profile': t('personalSettings'),
  '/merchant/support': t('customerSupport')
})

// 当前页面名称
const currentPageName = computed(() => {
  const pageNames = getPageNames()
  return pageNames[route.path] || ''
})

// 监听路由变化，更新激活菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

// 监听语言变化，更新页面名称
watch(currentLang, () => {
  // 当语言变化时，强制更新页面名称
}, { deep: true })

// 方法
const goToProfile = () => {
  router.push('/merchant/profile')
}

// 处理语言切换
const handleLanguageChange = (lang) => {
  switchLanguage(lang)
  ElMessage.success(`语言已切换到 ${lang === 'zh' ? '中文' : 'English'}`)
}

// 退出登录 - 修复：返回首页选择页面
const logout = () => {
  console.log('用户点击退出登录')

  // 清除所有登录状态
  localStorage.removeItem('auth_token')
  localStorage.removeItem('token')
  localStorage.removeItem('userType')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('rememberMe')

  console.log('已清除所有登录状态')

  ElMessage.success('已退出登录')

  // 跳转到首页选择页面，而不是登录页面
  router.push('/')
}

// 通知相关方法
const toggleNotificationPanel = () => {
  showNotificationPanel.value = !showNotificationPanel.value
}

const getNotificationIcon = (type) => {
  const iconMap = {
    'warning': Warning,
    'notice': Notification,
    'info': InfoFilled,
    'success': SuccessFilled
  }
  return iconMap[type] || Bell
}

const handleNotificationClick = (notification) => {
  // 标记为已读
  if (!notification.read) {
    notification.read = true
  }

  // 这里可以根据通知类型跳转到相应页面
  console.log('点击通知:', notification)
  ElMessage.info(`查看通知: ${notification.title}`)
}

const handleNotificationCommand = (command) => {
  console.log('通知命令:', command)
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  ElMessage.success('所有通知已标记为已读')
}

const viewAllNotifications = () => {
  // 这里可以跳转到专门的通知页面
  ElMessage.info('跳转到通知中心页面')
  console.log('查看所有通知')
}
</script>

<style scoped>
.merchant-layout {
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
  background-color: #f5f7fa;
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
  gap: 16px;
}

.language-dropdown {
  margin-right: 12px;
}

.language-selector {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
  color: #606266;
  font-size: 14px;
}

/* 消息中心样式 */
.notification-dropdown {
  margin-right: 12px;
}

.notification-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.notification-trigger:hover {
  background-color: #f5f7fa;
}

.notification-icon {
  font-size: 18px;
  color: #606266;
  transition: color 0.3s;
}

.notification-trigger:hover .notification-icon {
  color: #409eff;
}

.notification-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: 1px solid #fff;
}

.notification-dropdown-menu {
  width: 320px;
  max-height: 400px;
  padding: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.notification-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.notification-content {
  max-height: 300px;
  overflow-y: auto;
}

.empty-notifications {
  padding: 20px;
  text-align: center;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.notification-icon-wrapper.warning {
  background: linear-gradient(135deg, #ff9a56 0%, #ff8a80 100%);
}

.notification-icon-wrapper.notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.notification-icon-wrapper.success {
  background: linear-gradient(135deg, #67c23a 0%, #27ae60 100%);
}

.notification-icon-wrapper.info {
  background: linear-gradient(135deg, #909399 0%, #7f8c8d 100%);
}

.notification-content-wrapper {
  flex: 1;
  min-width: 0;
}

.notification-title-text {
  font-weight: 500;
  margin-bottom: 2px;
  color: #303133;
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 8px;
}

.notification-footer {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  text-align: center;
}

.language-selector:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.language-text {
  margin: 0 8px;
  font-weight: 500;
}

/* 语言切换下拉菜单样式 */
:deep(.language-dropdown .el-dropdown-menu__item) {
  padding: 10px 16px;
  font-size: 14px;
  transition: all 0.3s;
}

:deep(.language-dropdown .el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

:deep(.language-dropdown .el-dropdown-menu__item.is-active) {
  color: #409eff;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
}

:deep(.language-dropdown .el-dropdown-menu__item.is-active::before) {
  content: "✓";
  margin-right: 8px;
  color: #409eff;
  font-weight: bold;
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
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  color: #303133;
  font-weight: 500;
}

.dropdown-icon {
  color: #909399;
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