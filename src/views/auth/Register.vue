<template>
  <div class="auth-container">
    <div class="auth-form">
      <!-- Logo：系统标志，位于页面顶部中央 -->
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="系统Logo" class="logo" />
      </div>
      
      <!-- 标题：大字体 "创建账户" -->
      <h1 class="auth-title">创建账户</h1>
      
      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="register-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 输入框1：填写用户名称 -->
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="填写用户名称"
            size="large"
            prefix-icon="el-icon-user"
            clearable
          />
        </el-form-item>

        <!-- 输入框2：电子邮箱，带验证，提示文字"请输入有效邮箱" -->
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入有效邮箱"
            size="large"
            prefix-icon="el-icon-message"
            clearable
          />
        </el-form-item>

        <!-- 按钮1：获取验证码，点击后倒计时60秒 -->
        <el-form-item prop="verifyCode">
          <div class="verify-code-container">
            <el-input
              v-model="registerForm.verifyCode"
              placeholder="请输入收到的验证码"
              size="large"
              class="verify-input"
              clearable
            />
            <el-button
              size="large"
              :disabled="countdown > 0 || sendingCode"
              :loading="sendingCode"
              @click="sendVerifyCode"
              class="verify-button"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 输入框3：密码，带密码强度提示，提示文字"请设置8位以上包含字母和数字的密码" -->
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请设置8位以上包含字母和数字的密码"
            size="large"
            prefix-icon="el-icon-lock"
            clearable
            @input="checkPasswordStrength"
          >
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
          <!-- 密码强度提示 -->
          <div v-if="registerForm.password" class="password-strength">
            <div class="strength-bar">
              <div 
                :class="['strength-fill', `strength-${passwordStrength.level}`]"
                :style="{ width: passwordStrength.percent + '%' }"
              ></div>
            </div>
            <span :class="['strength-text', `strength-${passwordStrength.level}`]">
              {{ passwordStrength.text }}
            </span>
          </div>
        </el-form-item>

        <!-- 输入框4：确认密码，提示文字"请再次输入密码" -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
            size="large"
            prefix-icon="el-icon-lock"
            clearable
          >
            <template #suffix>
              <el-button
                link
                @click="toggleConfirmPassword"
                class="password-toggle"
              >
                <el-icon>
                  <View v-if="!showConfirmPassword" />
                  <Hide v-else />
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 输入框5：邀请码（选填），提示文字"如有邀请码请输入" -->
        <el-form-item prop="inviteCode">
          <el-input
            v-model="registerForm.inviteCode"
            placeholder="如有邀请码请输入"
            size="large"
            prefix-icon="el-icon-present"
            clearable
          />
        </el-form-item>

        <!-- 复选框：我已阅读并同意《用户协议》和《隐私政策》，带链接 -->
        <el-form-item prop="agreement" class="agreement-item">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <a href="/terms" target="_blank" class="agreement-link">《用户协议》</a>
            和
            <a href="/privacy" target="_blank" class="agreement-link">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>

        <!-- 按钮2：注册，主色调按钮，宽度100% -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleSubmit"
          >
            注册
          </el-button>
        </el-form-item>

        <!-- 链接：已有账号？立即登录，指向登录页面 -->
        <div class="auth-links">
          <router-link to="/login" class="login-link">
            已有账号？立即登录
          </router-link>
        </div>
      </el-form>
    </div>

    <!-- 页脚：版权信息和协议链接 -->
    <div class="auth-footer">
      <div class="copyright">
        © 2024 JSCDropshipping. 保留所有权利。
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
import { View, Hide } from '@element-plus/icons-vue'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)
const sendingCode = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const countdown = ref(0)

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  agreement: false
})

// 密码强度检查
const passwordStrength = ref({
  level: 'weak',
  percent: 0,
  text: '密码强度：弱'
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请填写用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名称长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入有效邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入收到的验证码', trigger: 'blur' },
    { len: 6, message: '验证码应为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value.length < 8) {
          callback(new Error('密码长度不能少于8位'))
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          callback(new Error('密码必须包含字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 检查密码强度
const checkPasswordStrength = (password) => {
  let score = 0
  let level = 'weak'
  let text = '密码强度：弱'

  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score >= 4) {
    level = 'strong'
    text = '密码强度：强'
  } else if (score >= 3) {
    level = 'medium'
    text = '密码强度：中'
  }

  passwordStrength.value = {
    level,
    percent: (score / 5) * 100,
    text
  }
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  try {
    sendingCode.value = true
    
    // 这里调用发送验证码API
    // await sendVerifyCodeAPI(registerForm.email)
    
    ElMessage.success('验证码已发送，请查收邮件')
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
  } catch (error) {
    console.error('发送验证码失败：', error)
    ElMessage.error('发送验证码失败，请稍后重试')
  } finally {
    sendingCode.value = false
  }
}

// 处理注册提交
const handleSubmit = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (valid) {
      loading.value = true
      
      // 这里调用注册API
      // await registerAPI(registerForm)
      
      ElMessage.success('注册成功！即将跳转到登录页面')
      
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (error) {
    console.error('注册失败：', error)
    ElMessage.error('注册失败，请检查填写信息')
  } finally {
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
  max-width: 420px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.logo-container {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
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

.register-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .agreement-item {
    margin-bottom: 30px;
    
    .el-checkbox {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
    
    .agreement-link {
      color: #409eff;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.verify-code-container {
  display: flex;
  gap: 10px;
  
  .verify-input {
    flex: 1;
  }
  
  .verify-button {
    flex-shrink: 0;
    white-space: nowrap;
  }
}

.password-strength {
  margin-top: 8px;
  
  .strength-bar {
    height: 4px;
    background-color: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
    
    .strength-fill {
      height: 100%;
      transition: all 0.3s ease;
      
      &.strength-weak {
        background-color: #f56c6c;
      }
      
      &.strength-medium {
        background-color: #e6a23c;
      }
      
      &.strength-strong {
        background-color: #67c23a;
      }
    }
  }
  
  .strength-text {
    font-size: 12px;
    
    &.strength-weak {
      color: #f56c6c;
    }
    
    &.strength-medium {
      color: #e6a23c;
    }
    
    &.strength-strong {
      color: #67c23a;
    }
  }
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
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
  text-align: center;
  margin-top: 20px;
  
  .login-link {
    color: #409eff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
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
    max-width: 100%;
  }
  
  .auth-title {
    font-size: 28px;
  }
  
  .verify-code-container {
    flex-direction: column;
    gap: 10px;
    
    .verify-button {
      width: 100%;
    }
  }
}
</style> 