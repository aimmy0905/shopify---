import { createRouter, createWebHistory } from 'vue-router'
import { autoValidateRoutes } from '@/utils/routeValidator.js'
import { setupRouterErrorHandling } from './handle-errors'

// 认证相关页面
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')

// 布局组件
const MerchantLayout = () => import('@/views/layout/MerchantLayout.vue')
const AdminLayout = () => import('@/views/layout/AdminLayout.vue')

const routes = [
  // 首页 - 门户选择页面
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/common/PortalSelection.vue'),
    meta: {
      title: 'Shopify铺货系统 - 请选择登录方式'
    }
  },

  // 商家端认证路由
  {
    path: '/merchant/login',
    name: 'MerchantLogin',
    component: Login,
    meta: {
      title: '商家登录 - Shopify铺货系统',
      requiresGuest: true,
      userType: 'merchant'
    }
  },
  {
    path: '/merchant/register',
    name: 'MerchantRegister',
    component: Register,
    meta: {
      title: '商家注册 - Shopify铺货系统',
      requiresGuest: true,
      userType: 'merchant'
    }
  },
  {
    path: '/merchant/forgot-password',
    name: 'MerchantForgotPassword',
    component: ForgotPassword,
    meta: {
      title: '商家重置密码 - Shopify铺货系统',
      requiresGuest: true,
      userType: 'merchant'
    }
  },

  // 管理端认证路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: Login,
    meta: {
      title: '管理员登录 - Shopify铺货系统',
      requiresGuest: true,
      userType: 'admin'
    }
  },

  // 商家端主要路由
  {
    path: '/merchant',
    component: MerchantLayout,
    children: [
      // 默认重定向到仪表板
      {
        path: '',
        redirect: '/merchant/dashboard'
      },
      // 仪表板
      {
        path: 'dashboard',
        name: 'MerchantDashboard',
        component: () => import('@/views/merchant/Dashboard.vue'),
        meta: {
          title: '商家后台 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      // 余额管理
      {
        path: 'balance',
        name: 'Balance',
        component: () => import('@/views/merchant/Balance.vue'),
        meta: {
          title: '账户余额 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      // 店铺管理
      {
        path: 'stores',
        name: 'StoreList',
        component: () => import('@/views/merchant/stores/List.vue'),
        meta: {
          title: '店铺列表 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'stores/add',
        name: 'AddStore',
        component: () => import('@/views/merchant/stores/Add.vue'),
        meta: {
          title: '添加店铺 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'stores/:id',
        name: 'StoreDetail',
        component: () => import('@/views/merchant/stores/Detail.vue'),
        meta: {
          title: '店铺详情 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      // 商品管理
      {
        path: 'products/all',
        name: 'AllProducts',
        component: () => import('@/views/merchant/products/All.vue'),
        meta: {
          title: '平台商品 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'products/import',
        name: 'ImportProducts',
        component: () => import('@/views/merchant/products/Import.vue'),
        meta: {
          title: '导入商品列表 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'products/my',
        name: 'MyProducts',
        component: () => import('@/views/merchant/products/My.vue'),
        meta: {
          title: '我的商品 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: () => import('@/views/merchant/products/Detail.vue'),
        meta: {
          title: '商品详情 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      // 订单管理
      {
        path: 'orders/store',
        name: 'StoreOrders',
        component: () => import('@/views/merchant/orders/Store.vue'),
        meta: {
          title: '店铺订单 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'orders/purchase',
        name: 'PurchaseOrders',
        component: () => import('@/views/merchant/orders/Purchase.vue'),
        meta: {
          title: '采购订单 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'orders/aftersale',
        name: 'AftersaleOrders',
        component: () => import('@/views/merchant/orders/Aftersale.vue'),
        meta: {
          title: '售后订单 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/merchant/orders/Detail.vue'),
        meta: {
          title: '订单详情 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      // 采购管理
      {
        path: 'purchase',
        redirect: '/merchant/purchase/applications'
      },
      {
        path: 'purchase/applications',
        name: 'PurchaseApplications',
        component: () => import('@/views/merchant/purchase/Applications.vue'),
        meta: {
          title: '采购申请 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'purchase/create',
        name: 'CreatePurchaseApplication',
        component: () => import('@/views/merchant/purchase/Create.vue'),
        meta: {
          title: '发起采购 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'purchase/:id',
        name: 'PurchaseApplicationDetail',
        component: () => import('@/views/merchant/purchase/Detail.vue'),
        meta: {
          title: '采购申请详情 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      // 其他功能
      {
        path: 'commission',
        name: 'Commission',
        component: () => import('@/views/merchant/Commission.vue'),
        meta: {
          title: '佣金管理 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'invoices',
        name: 'Invoices',
        component: () => import('@/views/merchant/Invoices.vue'),
        meta: {
          title: 'Invoice管理 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'logistics',
        name: 'Logistics',
        component: () => import('@/views/merchant/Logistics.vue'),
        meta: {
          title: '物流查询 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/merchant/Profile.vue'),
        meta: {
          title: '个人设置 - Shopify铺货系统',
          requiresAuth: true
        }
      },
      {
        path: 'support',
        name: 'Support',
        component: () => import('@/views/merchant/Support.vue'),
        meta: {
          title: '客服支持 - Shopify铺货系统',
          requiresAuth: true
        }
      }
    ]
  },

  // 管理端路由
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      // 默认重定向到管理后台
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: {
          title: '管理后台 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      // 供应商管理路由
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('@/views/admin/Suppliers.vue'),
        meta: {
          title: '供应商管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'suppliers/create',
        name: 'CreateSupplier',
        component: () => import('@/views/admin/CreateSupplier.vue'),
        meta: {
          title: '新建供应商 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'suppliers/:id',
        name: 'SupplierDetail',
        component: () => import('@/views/admin/SupplierDetail.vue'),
        meta: {
          title: '供应商详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'suppliers/:id/edit',
        name: 'EditSupplier',
        component: () => import('@/views/admin/EditSupplier.vue'),
        meta: {
          title: '编辑供应商 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'suppliers/:id/products',
        name: 'SupplierProducts',
        component: () => import('@/views/admin/SupplierProducts.vue'),
        meta: {
          title: '供应商商品 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: {
          title: '管理员用户 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'users/create',
        name: 'CreateAdminUser',
        component: () => import('@/views/admin/users/Create.vue'),
        meta: {
          title: '添加管理员 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'users/edit/:id',
        name: 'EditAdminUser',
        component: () => import('@/views/admin/users/Edit.vue'),
        meta: {
          title: '编辑管理员 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'users/:id',
        name: 'AdminUserDetail',
        component: () => import('@/views/admin/users/Detail.vue'),
        meta: {
          title: '管理员详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/admin/Roles.vue'),
        meta: {
          title: '角色管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'roles/create',
        name: 'CreateRole',
        component: () => import('@/views/admin/roles/Create.vue'),
        meta: {
          title: '创建角色 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'roles/edit/:id',
        name: 'EditRole',
        component: () => import('@/views/admin/roles/Edit.vue'),
        meta: {
          title: '编辑角色 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'merchants',
        name: 'Merchants',
        component: () => import('@/views/admin/Merchants.vue'),
        meta: {
          title: '商家管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'merchants/:id',
        name: 'MerchantDetail',
        component: () => import('@/views/admin/MerchantDetail.vue'),
        meta: {
          title: '商家详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true,
          activeMenu: '/admin/merchants'
        }
      },
      {
        path: 'merchants/:id/commission',
        name: 'MerchantCommission',
        component: () => import('@/views/admin/MerchantCommission.vue'),
        meta: {
          title: '商家佣金明细 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true,
          activeMenu: '/admin/merchants'
        }
      },
      {
        path: 'merchants/:id/balance',
        name: 'MerchantBalance',
        component: () => import('@/views/admin/MerchantBalance.vue'),
        meta: {
          title: '商家余额明细 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true,
          activeMenu: '/admin/merchants'
        }
      },
      {
        path: 'merchants/:id/referrals',
        name: 'MerchantReferrals',
        component: () => import('@/views/admin/MerchantReferrals.vue'),
        meta: {
          title: '商家下级用户 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true,
          activeMenu: '/admin/merchants'
        }
      },
      // 商品管理路由
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/Products.vue'),
        meta: {
          title: '商品管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'products/create',
        name: 'AdminProductCreate',
        component: () => import('@/views/admin/products/Create.vue'),
        meta: {
          title: '新增商品 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'products/:id',
        name: 'AdminProductDetail',
        component: () => import('@/views/admin/products/Detail.vue'),
        meta: {
          title: '商品详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'products/:id/edit',
        name: 'AdminProductEdit',
        component: () => import('@/views/admin/products/Edit.vue'),
        meta: {
          title: '编辑商品 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      // 商品分类管理路由
      {
        path: 'product-categories',
        name: 'AdminProductCategories',
        component: () => import('@/views/admin/ProductCategories.vue'),
        meta: {
          title: '商品分类管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      // 商品审核管理路由
      {
        path: 'product-audit',
        name: 'AdminProductAudit',
        component: () => import('@/views/admin/ProductAudit.vue'),
        meta: {
          title: '商品审核管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      // 销量排名路由
      {
        path: 'product-ranking',
        name: 'AdminProductRanking',
        component: () => import('@/views/admin/ProductRanking.vue'),
        meta: {
          title: '销量排名 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue'),
        meta: {
          title: '订单管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'purchase',
        name: 'AdminPurchase',
        component: () => import('@/views/admin/Purchase.vue'),
        meta: {
          title: '采购申请管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'purchase-applications',
        name: 'AdminPurchaseApplications',
        component: () => import('@/views/admin/PurchaseApplications.vue'),
        meta: {
          title: '采购申请列表 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'purchase-applications/:id',
        name: 'AdminPurchaseApplicationDetail',
        component: () => import('@/views/admin/PurchaseApplicationDetail.vue'),
        meta: {
          title: '采购申请详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'purchase-orders',
        name: 'AdminPurchaseOrders',
        component: () => import('@/views/admin/PurchaseOrders.vue'),
        meta: {
          title: '采购订单管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'purchase-orders/:id',
        name: 'AdminPurchaseOrderDetail',
        component: () => import('@/views/admin/PurchaseOrderDetail.vue'),
        meta: {
          title: '采购订单详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'shipping-records',
        name: 'AdminShippingRecords',
        component: () => import('@/views/admin/ShippingRecords.vue'),
        meta: {
          title: '发货记录 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'customer-balance',
        name: 'AdminCustomerBalance',
        component: () => import('@/views/admin/CustomerBalance.vue'),
        meta: {
          title: '客户余额管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'customer-balance/:id',
        name: 'AdminCustomerBalanceDetail',
        component: () => import('@/views/admin/CustomerBalanceDetail.vue'),
        meta: {
          title: '客户余额详情 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'recharge-audit',
        name: 'AdminRechargeAudit',
        component: () => import('@/views/admin/RechargeAudit.vue'),
        meta: {
          title: '充值审核 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'withdrawal-management',
        name: 'AdminWithdrawalManagement',
        component: () => import('@/views/admin/WithdrawalManagement.vue'),
        meta: {
          title: '余额提现管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'recharge-settings',
        name: 'AdminRechargeSettings',
        component: () => import('@/views/admin/RechargeSettings.vue'),
        meta: {
          title: '余额充值规则设置 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'withdrawal-management',
        name: 'AdminWithdrawalManagement',
        component: () => import('@/views/admin/WithdrawalManagement.vue'),
        meta: {
          title: '提现管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'commission',
        name: 'AdminCommission',
        component: () => import('@/views/admin/Commission.vue'),
        meta: {
          title: '分佣管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'invoices',
        name: 'AdminInvoices',
        component: () => import('@/views/admin/Invoices.vue'),
        meta: {
          title: 'Invoice申请管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'shipping',
        name: 'Shipping',
        component: () => import('@/views/admin/Shipping.vue'),
        meta: {
          title: '运费模板管理 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: {
          title: '系统设置 - Shopify铺货系统',
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },

  // 兼容性路由 - 重定向旧的路径到新的路径
  {
    path: '/dashboard',
    redirect: '/merchant/dashboard'
  },
  {
    path: '/balance',
    redirect: '/merchant/balance'
  },
  {
    path: '/stores',
    redirect: '/merchant/stores'
  },
  {
    path: '/products',
    redirect: '/merchant/products/all'
  },
  {
    path: '/orders',
    redirect: '/merchant/orders/store'
  },
  {
    path: '/purchase',
    redirect: '/merchant/purchase/applications'
  },
  {
    path: '/commission',
    redirect: '/merchant/commission'
  },
  {
    path: '/invoices',
    redirect: '/merchant/invoices'
  },
  {
    path: '/logistics',
    redirect: '/merchant/logistics'
  },
  {
    path: '/profile',
    redirect: '/merchant/profile'
  },
  {
    path: '/support',
    redirect: '/merchant/support'
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/404.vue'),
    meta: {
      title: '页面不存在 - Shopify铺货系统'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 检查认证状态
  if (to.meta.requiresAuth) {
    if (!checkAuthStatus()) {
      // 根据目标路由确定用户类型，而不是从本地存储
      let userType = 'merchant'
      if (to.path.startsWith('/admin')) {
        userType = 'admin'
      } else if (to.meta?.userType) {
        userType = to.meta.userType
      }
      next(`/${userType}/login`)
      return
    }
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin) {
    if (!checkAdminStatus()) {
      next('/admin/login')
      return
    }
  }

  // 检查guest权限（仅未登录用户可访问）
  if (to.meta.requiresGuest) {
    if (checkAuthStatus()) {
      // 根据目标路由的路径确定用户类型
      let userType = 'merchant'
      if (to.path.startsWith('/admin')) {
        userType = 'admin'
      } else if (to.meta?.userType) {
        userType = to.meta.userType
      }
      next(`/${userType}/dashboard`)
      return
    }
  }

  next()
})

// 检查用户认证状态
function checkAuthStatus() {
  const token = localStorage.getItem('token')
  return !!token
}

// 检查管理员状态
function checkAdminStatus() {
  const userType = localStorage.getItem('userType')
  return userType === 'admin'
}

// 获取当前用户类型
function getCurrentUserType() {
  return localStorage.getItem('userType') || 'merchant'
}

// 在开发环境中自动验证路由
autoValidateRoutes(router)

// 添加错误处理
const routerWithErrorHandling = setupRouterErrorHandling(router)

export default routerWithErrorHandling 