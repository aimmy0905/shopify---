// 调试工具 - 用于监控路由和用户状态
export const debugUtils = {
  // 显示当前状态
  showCurrentStatus() {
    const status = {
      currentPath: window.location.pathname,
      userType: localStorage.getItem('userType'),
      authToken: localStorage.getItem('auth_token'),
      token: localStorage.getItem('token'),
      userInfo: localStorage.getItem('userInfo'),
      rememberMe: localStorage.getItem('rememberMe')
    }
    
    console.group('🐛 当前系统状态')
    console.log('当前路径:', status.currentPath)
    console.log('用户类型:', status.userType)
    console.log('认证令牌:', status.authToken ? '已设置' : '未设置')
    console.log('备用令牌:', status.token ? '已设置' : '未设置')
    console.log('用户信息:', status.userInfo ? JSON.parse(status.userInfo) : '未设置')
    console.log('记住我:', status.rememberMe)
    console.groupEnd()
    
    return status
  },
  
  // 清理所有状态
  clearAllStates() {
    const keys = ['auth_token', 'userType', 'token', 'userInfo', 'rememberMe']
    keys.forEach(key => localStorage.removeItem(key))
    console.log('🧹 已清理所有localStorage状态')
  },
  
  // 设置调试模式
  enableDebugMode() {
    window.debugMode = true
    console.log('🔧 调试模式已启用')
    
    // 监听路由变化
    window.addEventListener('popstate', () => {
      console.log('🔄 路由变化:', window.location.pathname)
      this.showCurrentStatus()
    })
  },
  
  // 验证路径正确性
  validatePath(expectedUserType) {
    const currentPath = window.location.pathname
    const userType = localStorage.getItem('userType')
    
    let isCorrect = false
    if (expectedUserType === 'merchant' && currentPath.startsWith('/merchant')) {
      isCorrect = true
    } else if (expectedUserType === 'admin' && currentPath.startsWith('/admin')) {
      isCorrect = true
    }
    
    console.log(`✅ 路径验证: ${isCorrect ? '正确' : '错误'}`)
    console.log(`期望用户类型: ${expectedUserType}`)
    console.log(`实际用户类型: ${userType}`)
    console.log(`当前路径: ${currentPath}`)
    
    return isCorrect
  }
}

// 全局挂载调试工具
if (typeof window !== 'undefined') {
  window.debugUtils = debugUtils
  
  // 开发环境自动启用调试
  if (process.env.NODE_ENV === 'development') {
    debugUtils.enableDebugMode()
  }
}

export default debugUtils 