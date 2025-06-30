<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <Sidebar 
      :mode="mode" 
      :user-info="userInfo"
      :class="{ 'sidebar-mobile-open': mobileMenuOpen }"
    />
    
    <!-- 移动端遮罩 -->
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
    
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'content-expanded': sidebarCollapsed }">
      <!-- 顶部导航栏 -->
      <div class="top-header">
        <div class="header-left">
          <el-button
            :icon="Menu"
            @click="toggleMobileMenu"
            class="mobile-menu-btn"
            text
          />
          <div class="breadcrumb-container">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item 
                v-for="item in breadcrumbItems" 
                :key="item.path"
                :to="item.to"
              >
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="header-right">
          <!-- 通知图标 -->
          <el-badge :value="notificationCount" class="notification-badge">
            <el-button :icon="Bell" circle text @click="showNotifications" />
          </el-badge>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleUserMenuCommand">
            <div class="user-dropdown">
              <el-avatar :size="32" :src="userInfo.avatar">
                {{ userInfo.name?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ userInfo.name }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容区域 -->
      <div class="content-body">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    
    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationDrawerVisible"
      title="通知"
      :with-header="true"
      size="400px"
    >
      <div class="notifications-container">
        <div class="notification-tabs">
          <el-tabs v-model="activeNotificationTab">
            <el-tab-pane label="全部" name="all">
              <NotificationList :notifications="allNotifications" />
            </el-tab-pane>
            <el-tab-pane label="系统" name="system">
              <NotificationList :notifications="systemNotifications" />
            </el-tab-pane>
            <el-tab-pane label="订单" name="order">
              <NotificationList :notifications="orderNotifications" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Menu,
  Bell,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import Sidebar from './Sidebar.vue'
import NotificationList from './NotificationList.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'merchant', // 'merchant' 或 'admin'
    validator: (value) => ['merchant', 'admin'].includes(value)
  }
})

const router = useRouter()
const route = useRoute()

// 响应式状态
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const notificationDrawerVisible = ref(false)
const activeNotificationTab = ref('all')
const notificationCount = ref(3)

// 用户信息
const userInfo = ref({
  name: '张三',
  role: props.mode === 'merchant' ? '商家用户' : '管理员',
  avatar: ''
})

// 面包屑导航
const breadcrumbItems = computed(() => {
  const pathArray = route.path.split('/').filter(path => path)
  const breadcrumbs = [
    { title: '首页', path: '/', to: props.mode === 'merchant' ? '/dashboard' : '/admin/dashboard' }
  ]
  
  // 根据当前路径生成面包屑
  let currentPath = ''
  pathArray.forEach((path, index) => {
    currentPath += `/${path}`
    const routeRecord = router.getRoutes().find(r => r.path === currentPath)
    if (routeRecord && routeRecord.meta?.title) {
      const title = routeRecord.meta.title.replace(' - JSCDropshipping', '')
      breadcrumbs.push({
        title,
        path: currentPath,
        to: index === pathArray.length - 1 ? undefined : currentPath
      })
    }
  })
  
  return breadcrumbs
})

// 模拟通知数据
const allNotifications = ref([
  {
    id: 1,
    type: 'system',
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护，请提前做好准备。',
    time: '2024-01-15 14:30',
    read: false
  },
  {
    id: 2,
    type: 'order',
    title: '新订单提醒',
    content: '您有一个新的订单需要处理，订单号：SP202401150001',
    time: '2024-01-15 13:45',
    read: false
  },
  {
    id: 3,
    type: 'system',
    title: '账户余额提醒',
    content: '您的账户余额不足，请及时充值。',
    time: '2024-01-15 12:00',
    read: true
  }
])

const systemNotifications = computed(() => 
  allNotifications.value.filter(n => n.type === 'system')
)

const orderNotifications = computed(() => 
  allNotifications.value.filter(n => n.type === 'order')
)

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// 显示通知
const showNotifications = () => {
  notificationDrawerVisible.value = true
}

// 用户菜单处理
const handleUserMenuCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 清除所有本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('rememberMe')

    ElMessage.success('退出登录成功')
    router.push('/')
  } catch {
    // 用户取消退出
  }
}

// 响应式处理
const handleResize = () => {
  if (window.innerWidth > 768) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 从本地存储获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      userInfo.value = { ...userInfo.value, ...JSON.parse(storedUserInfo) }
    } catch (error) {
      console.error('Failed to parse user info:', error)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  min-width: 0;

  &.content-expanded {
    margin-left: 64px;
  }
}

.top-header {
  height: 64px;
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .mobile-menu-btn {
      display: none;
      color: #94a3b8;
      transition: all 0.3s ease;

      &:hover {
        color: #60a5fa;
        transform: scale(1.1);
        filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.4));
      }
    }

    .breadcrumb-container {
      :deep(.el-breadcrumb) {
        font-size: 14px;

        .el-breadcrumb__item {
          .el-breadcrumb__inner {
            color: #94a3b8;
            font-weight: normal;
            transition: all 0.3s ease;

            &:hover {
              color: #60a5fa;
              text-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
            }
          }

          &:last-child .el-breadcrumb__inner {
            color: #e2e8f0;
            font-weight: 600;
          }
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .notification-badge {
      :deep(.el-badge__content) {
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        border: none;
        color: white;
        font-weight: 700;
        animation: pulse 2s infinite;
        box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);
      }

      .el-button {
        color: #94a3b8;
        border: 1px solid rgba(148, 163, 184, 0.3);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
          color: #60a5fa;
          border-color: rgba(96, 165, 250, 0.5);
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(96, 165, 250, 0.2);
        }
      }
    }

    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(148, 163, 184, 0.3);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(10px);

      &:hover {
        background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%);
        border-color: rgba(96, 165, 250, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(96, 165, 250, 0.2);
      }

      .user-name {
        font-size: 14px;
        color: #e2e8f0;
        font-weight: 600;
      }

      .el-icon--right {
        color: #94a3b8;
        font-size: 12px;
      }
    }
  }
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 0;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

.notifications-container {
  .notification-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
    }
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.2s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 通知徽章脉冲动画
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// 响应式布局
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .top-header .header-left .mobile-menu-btn {
    display: inline-flex;
  }

  .mobile-overlay {
    display: block;
  }

  :deep(.sidebar) {
    &.sidebar-mobile-open {
      transform: translateX(0);
    }
  }
}

@media (max-width: 480px) {
  .top-header {
    padding: 0 16px;
    
    .header-right {
      gap: 8px;
    }

    .user-dropdown .user-name {
      display: none;
    }
  }

  .content-body {
    padding: 16px;
  }
}
</style> 