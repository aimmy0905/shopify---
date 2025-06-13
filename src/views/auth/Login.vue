<template>
  <div class="auth-container">
    <div class="auth-form">
      <!-- Logo：系统标志，位于页面顶部中央 -->
      <div class="logo-container">
        <div class="logo-svg">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="35" fill="#409EFF" stroke="#fff" stroke-width="2"/>
            <text x="40" y="50" text-anchor="middle" fill="white" font-size="24" font-weight="bold">S</text>
          </svg>
        </div>
      </div>
      
      <!-- 标题：大字体 "账号登录" -->
      <h1 class="auth-title">账号登录</h1>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 输入框1：电子邮箱，带验证，提示文字"请输入注册邮箱" -->
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            type="email"
            placeholder="请输入注册邮箱"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 输入框2：密码，带密码显示切换按钮，提示文字"请输入密码" -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-button
                link
                @click="togglePassword"
                class="password-toggle"
              >
                <el-icon>
                  <View v-if="!showPassword" />
                  <Hide v-else />
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 复选框：记住我，默认不选中 -->
        <el-form-item class="remember-me">
          <el-checkbox v-model="loginForm.rememberMe">
            记住我
          </el-checkbox>
        </el-form-item>

        <!-- 按钮1：登录，主色调按钮，宽度100% -->
        <el-form-item>
          <el-button
            type="primary" 
            size="large"
            class="login-button"
            :loading="loading"
            native-type="submit"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 链接区域 -->
        <div class="auth-links">
          <!-- 链接1：忘记密码，指向密码重置页面 -->
          <router-link :to="getForgotPasswordLink()" class="forgot-password-link">
            忘记密码？
          </router-link>
          
          <!-- 链接2：没有账号？立即注册，指向注册页面 -->
          <router-link :to="getRegisterLink()" class="register-link">
            没有账号？立即注册
          </router-link>
        </div>
      </el-form>
    </div>

    <!-- 页脚：版权信息和协议链接 -->
    <div class="auth-footer">
      <div class="copyright">
        © 2024 Shopify铺货系统. 保留所有权利。
      </div>
      <div class="footer-links">
        <a href="/privacy" target="_blank">隐私政策</a>
        <span class="divider">|</span>
        <a href="/terms" target="_blank">用户协议</a>
        <span class="divider">|</span>
        <a href="/contact" target="_blank">联系我们</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Hide, Message, Lock } from '@element-plus/icons-vue'

// 内联调试工具，避免导入路径问题
const debugUtils = {
  showCurrentStatus() {
    const status = {
      currentPath: window.location.pathname,
      userType: localStorage.getItem('userType'),
      authToken: localStorage.getItem('auth_token'),
      token: localStorage.getItem('token')
    }
    console.group('🐛 当前系统状态')
    console.log('当前路径:', status.currentPath)
    console.log('用户类型:', status.userType)
    console.log('认证令牌:', status.authToken ? '已设置' : '未设置')
    console.groupEnd()
    return status
  },
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
    console.log(`期望用户类型: ${expectedUserType}, 实际用户类型: ${userType}`)
    console.log(`当前路径: ${currentPath}`)
    return isCorrect
  }
}

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const showPassword = ref(false)

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入注册邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 获取当前用户类型
const getCurrentUserType = () => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.path.startsWith('/admin')) {
    return 'admin'
  } else if (currentRoute.path.startsWith('/merchant')) {
    return 'merchant'
  } else if (currentRoute.meta?.userType) {
    return currentRoute.meta.userType
  }
  return 'merchant'
}

// 获取注册链接
const getRegisterLink = () => {
  const userType = getCurrentUserType()
  return userType === 'admin' ? '/admin/register' : '/merchant/register'
}

// 获取忘记密码链接
const getForgotPasswordLink = () => {
  const userType = getCurrentUserType()
  return userType === 'admin' ? '/admin/forgot-password' : '/merchant/forgot-password'
}

// 处理登录提交
const handleSubmit = async () => {
  console.log('登录按钮被点击了!')
  console.log('表单数据:', loginForm)
  
  if (!loginFormRef.value) {
    console.log('表单引用不存在')
    return
  }
  
  try {
    const valid = await loginFormRef.value.validate()
    console.log('表单验证结果:', valid)
    
    if (valid) {
      loading.value = true
      console.log('开始登录处理...')
      
      // 清理之前的认证状态，防止串扰
      localStorage.removeItem('auth_token')
      localStorage.removeItem('userType')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      console.log('清理之前的认证状态')
      
      // 模拟API调用延迟
      setTimeout(() => {
        ElMessage.success('登录成功！')
        console.log('登录成功，准备跳转...')
        
        // 保存认证状态到localStorage
        const authToken = 'mock_auth_token_' + Date.now()
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('token', authToken)
        console.log('保存认证token:', authToken)
        
        // 根据记住我选项处理登录状态
        if (loginForm.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          console.log('保存记住我状态')
        }
        
        // 保存用户信息
        const userInfo = {
          email: loginForm.email,
          loginTime: new Date().toISOString()
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        console.log('保存用户信息:', userInfo)
        
        loading.value = false
        
        // 根据当前路由的meta信息确定用户类型
        const currentRoute = router.currentRoute.value
        console.log('当前路由:', currentRoute.path)
        console.log('路由meta:', currentRoute.meta)
        
        // 从路由路径中确定用户类型（更可靠的方法）
        let userType = 'merchant' // 默认值
        if (currentRoute.path.startsWith('/admin')) {
          userType = 'admin'
        } else if (currentRoute.path.startsWith('/merchant')) {
          userType = 'merchant'
        } else if (currentRoute.meta?.userType) {
          userType = currentRoute.meta.userType
        }
        
        localStorage.setItem('userType', userType)
        console.log('检测到的用户类型:', userType)
        
        // 根据用户类型跳转到对应的dashboard
        const dashboardPath = userType === 'admin' ? '/admin/dashboard' : '/merchant/dashboard'
        console.log('即将跳转到:', dashboardPath)
        
        router.push(dashboardPath).then(() => {
          console.log('✅ 路由跳转完成')
          console.log('目标路径:', dashboardPath)
          console.log('用户类型:', userType)
          // 验证跳转是否正确
          setTimeout(() => {
            debugUtils.showCurrentStatus()
            debugUtils.validatePath(userType)
          }, 100)
        }).catch(error => {
          console.error('❌ 路由跳转错误:', error)
          ElMessage.error('页面跳转失败，请刷新重试')
        })
      }, 1000)
    }
  } catch (error) {
    console.error('登录过程中出现错误：', error)
    ElMessage.error('登录失败，请检查用户名和密码')
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.logo-container {
  text-align: center;
  margin-bottom: 30px;
  
  .logo-svg {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }
}

.auth-title {
  font-size: 32px;
  font-weight: 600;
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  margin-top: 0;
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }
  
  .remember-me {
    margin-bottom: 30px;
    
    .el-checkbox {
      font-size: 14px;
      color: #666;
    }
  }
}

.login-button {
  width: 100% !important;
  height: 48px !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  background-color: #409eff !important;
  border-color: #409eff !important;
}

.password-toggle {
  padding: 0;
  min-height: auto;
  color: #999;
  
  &:hover {
    color: #409eff;
  }
}

.auth-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  
  a {
    color: #409eff;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .forgot-password-link {
    color: #999;
  }
  
  .register-link {
    font-weight: 500;
  }
}

.auth-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  
  .copyright {
    margin-bottom: 10px;
  }
  
  .footer-links {
    a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      
      &:hover {
        color: white;
        text-decoration: underline;
      }
    }
    
    .divider {
      margin: 0 8px;
    }
  }
}

@media (max-width: 768px) {
  .auth-form {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .auth-title {
    font-size: 28px;
  }
}
</style> 