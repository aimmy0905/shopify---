// 路由验证工具 - 防止菜单链接和路由配置不匹配导致的404错误

/**
 * 验证菜单项和路由配置的一致性
 * @param {Array} menuItems - 菜单项数组
 * @param {Array} routes - 路由配置数组
 * @returns {Object} 验证结果
 */
export function validateMenuRoutes(menuItems, routes) {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    summary: {}
  }

  // 提取所有路由路径
  const routePaths = new Set()
  
  function extractPaths(routeArray, prefix = '') {
    routeArray.forEach(route => {
      if (route.path && !route.path.startsWith(':')) {
        const fullPath = prefix + '/' + route.path.replace(/^\//, '')
        routePaths.add(fullPath.replace(/\/+/g, '/'))
        
        // 处理重定向
        if (route.redirect) {
          routePaths.add(route.redirect)
        }
      }
      
      if (route.children) {
        const childPrefix = prefix + '/' + (route.path || '').replace(/^\//, '')
        extractPaths(route.children, childPrefix)
      }
    })
  }
  
  extractPaths(routes)

  // 验证菜单项
  menuItems.forEach(item => {
    if (item.path) {
      const normalizedPath = item.path.replace(/\/+/g, '/')
      
      if (!routePaths.has(normalizedPath)) {
        results.valid = false
        results.errors.push({
          type: 'MISSING_ROUTE',
          menuItem: item.name || item.path,
          path: normalizedPath,
          message: `菜单项 "${item.name || item.path}" 指向的路径 "${normalizedPath}" 在路由配置中不存在`
        })
      }
    }
  })

  // 生成摘要
  results.summary = {
    totalMenuItems: menuItems.length,
    totalRoutes: routePaths.size,
    errorCount: results.errors.length,
    warningCount: results.warnings.length
  }

  return results
}

/**
 * 商家端菜单配置
 */
export const merchantMenuItems = [
  { name: 'Dashboard', path: '/merchant/dashboard' },
  { name: '我的店铺', path: '/merchant/stores' },
  { name: '平台商品', path: '/merchant/products/all' },
  { name: '导入商品列表', path: '/merchant/products/import' },
  { name: '我的商品', path: '/merchant/products/my' },
  { name: '店铺订单', path: '/merchant/orders/store' },
  { name: '采购订单', path: '/merchant/orders/purchase' },
  { name: '售后订单', path: '/merchant/orders/aftersale' },
  { name: '采购管理', path: '/merchant/purchase' },
  { name: '余额管理', path: '/merchant/balance' },
  { name: '佣金管理', path: '/merchant/commission' },
  { name: 'Invoice管理', path: '/merchant/invoices' },
  { name: '物流信息', path: '/merchant/logistics' },
  { name: '个人设置', path: '/merchant/profile' },
  { name: '客服支持', path: '/merchant/support' }
]

/**
 * 管理端菜单配置
 */
export const adminMenuItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: '供应商管理', path: '/admin/suppliers' },
  { name: '用户管理', path: '/admin/users' },
  { name: '角色管理', path: '/admin/roles' },
  { name: '商家管理', path: '/admin/merchants' },
  { name: '商品管理', path: '/admin/products' },
  { name: '订单管理', path: '/admin/orders' },
  { name: '采购管理', path: '/admin/purchase' },
  { name: '余额管理', path: '/admin/balance' },
  { name: '佣金管理', path: '/admin/commission' },
  { name: '发票管理', path: '/admin/invoices' },
  { name: '物流管理', path: '/admin/shipping' },
  { name: '系统设置', path: '/admin/settings' }
]

/**
 * 在开发环境中自动验证路由
 */
export function autoValidateRoutes(router) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 路由验证')
    
    const routes = router.getRoutes()
    
    // 验证商家端
    const merchantResult = validateMenuRoutes(merchantMenuItems, routes)
    console.log('商家端路由验证:', merchantResult)
    
    // 验证管理端
    const adminResult = validateMenuRoutes(adminMenuItems, routes)
    console.log('管理端路由验证:', adminResult)
    
    // 输出错误
    if (merchantResult.errors.length > 0) {
      console.error('❌ 商家端路由错误:', merchantResult.errors)
    }
    
    if (adminResult.errors.length > 0) {
      console.error('❌ 管理端路由错误:', adminResult.errors)
    }
    
    if (merchantResult.valid && adminResult.valid) {
      console.log('✅ 所有路由验证通过')
    }
    
    console.groupEnd()
  }
}

export default {
  validateMenuRoutes,
  merchantMenuItems,
  adminMenuItems,
  autoValidateRoutes
} 