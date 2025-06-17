<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="logo">
        <img src="/logo.png" alt="Logo" class="logo-img" />
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text">{{ logoText }}</span>
        </transition>
      </div>
      <el-button 
        :icon="collapsed ? Expand : Fold" 
        @click="toggleCollapse"
        class="collapse-btn"
        text
      />
    </div>

    <!-- 用户信息 -->
    <div class="user-info" v-if="!collapsed">
      <div class="user-avatar">
        <el-avatar :size="40" :src="userInfo.avatar">
          {{ userInfo.name?.charAt(0) }}
        </el-avatar>
      </div>
      <div class="user-details">
        <div class="user-name">{{ userInfo.name }}</div>
        <div class="user-role">{{ userInfo.role }}</div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="collapsed"
      :collapse-transition="false"
      router
    >
      <template v-for="item in menuItems" :key="item.key">
        <!-- 有子菜单的项目 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.key">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <template v-for="child in item.children" :key="child.key">
            <el-sub-menu v-if="child.children && child.children.length > 0" :index="child.key">
              <template #title>
                <el-icon><component :is="child.icon" /></el-icon>
                <span>{{ child.title }}</span>
              </template>
              <el-menu-item 
                v-for="grandChild in child.children" 
                :key="grandChild.key"
                :index="grandChild.route"
                @click="handleMenuClick(grandChild)"
              >
                <el-icon><component :is="grandChild.icon" /></el-icon>
                <span>{{ grandChild.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item 
              v-else
              :index="child.route"
              @click="handleMenuClick(child)"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
        <!-- 无子菜单的项目 -->
        <el-menu-item 
          v-else
          :index="item.route"
          @click="handleMenuClick(item)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 底部操作 -->
    <div class="sidebar-footer">
      <el-button 
        v-if="!collapsed" 
        type="danger" 
        :icon="SwitchButton"
        @click="handleLogout"
        class="logout-btn"
      >
        退出登录
      </el-button>
      <el-button 
        v-else 
        :icon="SwitchButton"
        @click="handleLogout"
        class="logout-btn-collapsed"
        type="danger"
        text
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  SwitchButton,
  Monitor,
  Shop,
  Goods,
  ShoppingCart,
  ShoppingBag,
  Wallet,
  Money,
  Document,
  Ship,
  User,
  Service,
  // 管理端图标
  UserFilled,
  Management,
  Setting,
  DataAnalysis,
  DocumentChecked,
  CreditCard,
  PieChart,
  Files,
  // 分佣管理图标
  DataBoard,
  Connection,
  List
} from '@element-plus/icons-vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'merchant', // 'merchant' 或 'admin'
    validator: (value) => ['merchant', 'admin'].includes(value)
  },
  userInfo: {
    type: Object,
    default: () => ({
      name: '用户名',
      role: '商家',
      avatar: ''
    })
  }
})

const router = useRouter()
const route = useRoute()

// 折叠状态
const collapsed = ref(false)

// Logo文本
const logoText = computed(() => {
  return props.mode === 'merchant' ? 'Shopify铺货系统' : '管理后台'
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 商家端菜单配置
const merchantMenuItems = [
  {
    key: 'dashboard',
    title: '仪表板',
    icon: Monitor,
    route: '/merchant/dashboard'
  },
  {
    key: 'stores',
    title: '我的店铺',
    icon: Shop,
    children: [
      {
        key: 'stores-list',
        title: '店铺列表',
        icon: Shop,
        route: '/merchant/stores'
      },
      {
        key: 'stores-add',
        title: '添加店铺',
        icon: Shop,
        route: '/merchant/stores/add'
      }
    ]
  },
  {
    key: 'products',
    title: '商品管理',
    icon: Goods,
    children: [
      {
        key: 'products-all',
        title: '平台商品',
        icon: Goods,
        route: '/merchant/products/all'
      },
      {
        key: 'products-import',
        title: '导入商品列表',
        icon: Goods,
        route: '/merchant/products/import'
      },
      {
        key: 'products-my',
        title: '我的商品',
        icon: Goods,
        route: '/merchant/products/my'
      }
    ]
  },
  {
    key: 'orders',
    title: '订单管理',
    icon: ShoppingCart,
    children: [
      {
        key: 'orders-store',
        title: '店铺订单',
        icon: ShoppingCart,
        route: '/merchant/orders/store'
      },
      {
        key: 'orders-purchase',
        title: '采购订单',
        icon: ShoppingBag,
        route: '/merchant/orders/purchase'
      },
      {
        key: 'orders-aftersale',
        title: '售后订单',
        icon: ShoppingCart,
        route: '/merchant/orders/aftersale'
      }
    ]
  },
  {
    key: 'purchase',
    title: '采购管理',
    icon: ShoppingBag,
    children: [
      {
        key: 'purchase-applications',
        title: '采购申请',
        icon: Document,
        route: '/merchant/purchase/applications'
      },
      {
        key: 'purchase-create',
        title: '发起采购',
        icon: ShoppingBag,
        route: '/merchant/purchase/create'
      }
    ]
  },
  {
    key: 'balance',
    title: '余额管理',
    icon: Wallet,
    route: '/merchant/balance'
  },
  {
    key: 'commission',
    title: '佣金管理',
    icon: Money,
    route: '/merchant/commission'
  },
  {
    key: 'invoices',
    title: 'Invoice管理',
    icon: Document,
    route: '/merchant/invoices'
  },
  {
    key: 'logistics',
    title: '物流查询',
    icon: Ship,
    route: '/merchant/logistics'
  },
  {
    key: 'profile',
    title: '个人设置',
    icon: User,
    route: '/merchant/profile'
  },
  {
    key: 'support',
    title: '客服支持',
    icon: Service,
    route: '/merchant/support'
  }
]

// 管理端菜单配置
const adminMenuItems = [
  {
    key: 'admin-dashboard',
    title: '管理后台',
    icon: Monitor,
    route: '/admin/dashboard'
  },
  {
    key: 'suppliers',
    title: '供应商管理',
    icon: Management,
    route: '/admin/suppliers'
  },
  {
    key: 'users',
    title: '用户管理',
    icon: UserFilled,
    children: [
      {
        key: 'admin-users',
        title: '管理员用户',
        icon: UserFilled,
        route: '/admin/users'
      },
      {
        key: 'roles',
        title: '角色管理',
        icon: UserFilled,
        route: '/admin/roles'
      }
    ]
  },
  {
    key: 'merchants',
    title: '商家管理',
    icon: User,
    route: '/admin/merchants'
  },
  {
    key: 'admin-products',
    title: '商品管理',
    icon: Goods,
    children: [
      {
        key: 'admin-products-list',
        title: '商品列表',
        icon: Goods,
        route: '/admin/products'
      },
      {
        key: 'admin-product-categories',
        title: '商品分类管理',
        icon: Management,
        route: '/admin/product-categories'
      },
      {
        key: 'admin-product-audit',
        title: '商品审核管理',
        icon: DocumentChecked,
        route: '/admin/product-audit'
      },
      {
        key: 'admin-products-ranking',
        title: '销量排名',
        icon: DataAnalysis,
        route: '/admin/product-ranking'
      }
    ]
  },
  {
    key: 'admin-orders',
    title: '订单管理',
    icon: ShoppingCart,
    children: [
      {
        key: 'admin-orders-store',
        title: '店铺订单',
        icon: ShoppingCart,
        route: '/admin/orders/store'
      },
      {
        key: 'admin-orders-purchase',
        title: '采购订单',
        icon: ShoppingBag,
        route: '/admin/orders/purchase'
      }
    ]
  },
  {
    key: 'purchase-management',
    title: '采购管理',
    icon: DocumentChecked,
    children: [
      {
        key: 'purchase-applications',
        title: '采购申请管理',
        icon: DocumentChecked,
        route: '/admin/purchase-applications'
      },
      {
        key: 'purchase-orders',
        title: '采购订单管理',
        icon: ShoppingBag,
        route: '/admin/purchase-orders'
      },
      {
        key: 'shipping-records',
        title: '发货记录',
        icon: Ship,
        route: '/admin/shipping-records'
      }
    ]
  },
  {
    key: 'customer-balance',
    title: '客户余额管理',
    icon: Wallet,
    children: [
      {
        key: 'customer-balance-list',
        title: '客户余额',
        icon: Wallet,
        route: '/admin/customer-balance'
      },
      {
        key: 'recharge-audit',
        title: '充值审核',
        icon: CreditCard,
        route: '/admin/recharge-audit'
      },
      {
        key: 'withdrawal-management',
        title: '提现管理',
        icon: Money,
        route: '/admin/withdrawal-management'
      }
    ]
  },
  {
    key: 'commission-management',
    title: '分佣管理',
    icon: PieChart,
    children: [
      {
        key: 'commission-overview',
        title: '分佣总览',
        icon: DataBoard,
        route: '/admin/commission-overview'
      },
      {
        key: 'referral-tree',
        title: '推荐关系树',
        icon: Connection,
        route: '/admin/referral-tree'
      },
      {
        key: 'commission-records',
        title: '佣金明细',
        icon: List,
        route: '/admin/commission-records'
      },
      {
        key: 'commission-settlements',
        title: '结算管理',
        icon: Money,
        route: '/admin/commission-settlements'
      },
      {
        key: 'commission-rules',
        title: '分佣规则',
        icon: Setting,
        route: '/admin/commission-rules'
      }
    ]
  },
  {
    key: 'invoice-applications',
    title: 'Invoice申请管理',
    icon: Files,
    route: '/admin/invoice-applications'
  },
  {
    key: 'shipping-templates',
    title: '运费模板管理',
    icon: Ship,
    route: '/admin/shipping-templates'
  },
  {
    key: 'admin-settings',
    title: '系统设置',
    icon: Setting,
    children: [
      {
        key: 'language-settings',
        title: '语言设置',
        icon: Setting,
        route: '/admin/settings/language'
      },
      {
        key: 'system-settings',
        title: '系统参数',
        icon: Setting,
        route: '/admin/settings/system'
      }
    ]
  }
]

// 根据模式选择菜单
const menuItems = computed(() => {
  return props.mode === 'merchant' ? merchantMenuItems : adminMenuItems
})

// 切换折叠状态
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// 菜单点击处理
const handleMenuClick = (item) => {
  if (item.route) {
    router.push(item.route)
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
    
    // 清除本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('userInfo')
    
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}

// 监听路由变化，确保菜单状态正确
watch(() => route.path, () => {
  // 可以在这里添加其他逻辑
})
</script>

<style lang="scss" scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow: hidden;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &.sidebar-collapsed {
    width: 64px;
  }
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px);
  flex-shrink: 0;

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;

    .logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: white;
    }
  }

  .collapse-btn {
    color: #94a3b8;
    transition: all 0.3s ease;
    
    &:hover {
      color: #60a5fa;
      transform: scale(1.1);
      filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.4));
    }
  }
}

.user-info {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  flex-shrink: 0;

  .user-details {
    flex: 1;
    min-width: 0;

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: white;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 12px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;

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

  :deep(.el-sub-menu) {
    .el-sub-menu__title {
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
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  flex-shrink: 0;

  .logout-btn {
    width: 100%;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    border-radius: 12px;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-color: #dc2626;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
    }
  }

  .logout-btn-collapsed {
    width: 100%;
    color: #f87171;
    transition: all 0.3s ease;

    &:hover {
      color: #ef4444;
      transform: scale(1.15);
      filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
    }
  }
}

// 动画效果
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

// 滚动条样式
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

// 响应式
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.sidebar-open {
      transform: translateX(0);
    }
  }
}
</style> 