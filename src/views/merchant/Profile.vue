<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">个人设置</h1>
      <p class="page-subtitle">管理您的个人信息、密码和账户设置</p>
    </div>

    <!-- 个人信息卡片 -->
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">个人信息</span>
          <div class="card-actions">
            <el-button
              v-if="!isEditing"
              type="primary"
              @click="startEdit"
              :icon="Edit"
            >
              编辑资料
            </el-button>
            <el-button
              type="warning"
              @click="showChangePasswordDialog"
              :icon="Lock"
            >
              修改密码
            </el-button>
          </div>
        </div>
      </template>

      <!-- 查看模式 -->
      <div v-if="!isEditing" class="profile-view">
        <div class="profile-content">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <el-avatar
              :size="120"
              :src="userInfo.avatar"
              class="profile-avatar"
              @click="handleAvatarClick"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="avatar-overlay" @click="handleAvatarClick">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>

          <!-- 信息展示 -->
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">用户名</label>
                <span class="info-value">{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">电子邮箱</label>
                <span class="info-value">{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">电话号码</label>
                <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">注册日期</label>
                <span class="info-value">{{ formatDate(userInfo.registerDate) }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">账户状态</label>
                <el-tag
                  :type="userInfo.status === 'active' ? 'success' : 'danger'"
                  class="status-tag"
                >
                  {{ userInfo.status === 'active' ? '正常' : '已禁用' }}
                </el-tag>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-else class="profile-edit">
        <el-form
          ref="profileFormRef"
          :model="editForm"
          :rules="formRules"
          label-width="100px"
          class="edit-form"
        >
          <!-- 头像上传 -->
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="uploadHeaders"
            >
              <el-avatar
                v-if="editForm.avatar"
                :size="100"
                :src="editForm.avatar"
                class="upload-avatar"
              />
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传头像</div>
              </div>
            </el-upload>
            <div class="upload-tips">
              <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
            </div>
          </el-form-item>

          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="editForm.username"
              placeholder="请输入用户名"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>

          <!-- 电子邮箱（只读） -->
          <el-form-item label="电子邮箱">
            <el-input
              :value="editForm.email"
              readonly
              disabled
            >
              <template #suffix>
                <el-tooltip content="邮箱地址不可修改" placement="top">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

          <!-- 电话号码 -->
          <el-form-item label="电话号码" prop="phone">
            <el-input
              v-model="editForm.phone"
              placeholder="请输入电话号码"
              maxlength="15"
            />
          </el-form-item>

          <!-- 按钮组 -->
          <el-form-item>
            <el-button
              type="primary"
              @click="saveProfile"
              :loading="saving"
            >
              保存修改
            </el-button>
            <el-button @click="cancelEdit">
              取消
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordFormData"
        :rules="passwordRules"
        label-width="120px"
      >
        <!-- 当前密码 -->
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordFormData.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>

        <!-- 新密码 -->
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordFormData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            @input="checkPasswordStrength"
          />
          <!-- 密码强度指示器 -->
          <div class="password-strength" v-if="passwordFormData.newPassword">
            <div class="strength-label">密码强度：</div>
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">
              {{ passwordStrength.text }}
            </span>
          </div>
        </el-form-item>

        <!-- 确认新密码 -->
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordFormData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <!-- 密码规则提示 -->
        <div class="password-rules">
          <h4>密码规则：</h4>
          <ul>
            <li>密码长度至少8位</li>
            <li>包含大小写字母</li>
            <li>包含数字</li>
            <li>可包含特殊字符以提高安全性</li>
          </ul>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelChangePassword">取消</el-button>
          <el-button
            type="primary"
            @click="confirmChangePassword"
            :loading="changingPassword"
          >
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 隐藏的文件上传输入框 -->
    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Edit,
  Lock,
  Camera,
  Plus,
  InfoFilled
} from '@element-plus/icons-vue'

// 响应式数据
const isEditing = ref(false)
const saving = ref(false)
const changePasswordVisible = ref(false)
const changingPassword = ref(false)
const profileFormRef = ref(null)
const passwordFormRef = ref(null)
const avatarInput = ref(null)

// 用户信息 - 按照产品设计文档要求
const userInfo = reactive({
  username: '张小明',
  email: 'zhangxiaoming@shopify-merchant.com',
  phone: '13800138888',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  registerDate: '2023-06-15T08:30:00Z',
  status: 'active'
})

// 编辑表单
const editForm = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: ''
})

// 密码修改表单
const passwordFormData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度
const passwordStrength = ref({
  width: '0%',
  class: '',
  text: ''
})

// 上传相关
const uploadUrl = '/api/upload/avatar'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('auth_token') || 'mock-token-12345'}`
}

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const hasUpper = /[A-Z]/.test(value)
        const hasLower = /[a-z]/.test(value)
        const hasNumber = /\d/.test(value)
        
        if (!hasUpper || !hasLower || !hasNumber) {
          callback(new Error('密码必须包含大小写字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordFormData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const startEdit = () => {
  // 复制当前信息到编辑表单
  Object.assign(editForm, userInfo)
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  // 重置表单
  if (profileFormRef.value) {
    profileFormRef.value.resetFields()
  }
}

const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    saving.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新用户信息
    Object.assign(userInfo, editForm)
    
    ElMessage.success('个人信息更新成功！')
    isEditing.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleAvatarClick = () => {
  if (avatarInput.value) {
    avatarInput.value.click()
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (beforeAvatarUpload(file)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        userInfo.avatar = e.target.result
        ElMessage.success('头像更换成功！')
      }
      reader.readAsDataURL(file)
    }
  }
  // 清空input值，允许重复选择同一文件
  event.target.value = ''
}

const beforeAvatarUpload = (file) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGorPNG) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response, file) => {
  editForm.avatar = URL.createObjectURL(file.raw)
  ElMessage.success('头像上传成功！')
}

const showChangePasswordDialog = () => {
  changePasswordVisible.value = true
  // 重置密码表单
  Object.assign(passwordFormData, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordStrength.value = {
    width: '0%',
    class: '',
    text: ''
  }
}

const cancelChangePassword = () => {
  changePasswordVisible.value = false
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

const confirmChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('密码修改成功！请重新登录。')
    changePasswordVisible.value = false
    
    // 可以在这里处理重新登录逻辑
    setTimeout(() => {
      ElMessageBox.confirm(
        '密码已成功修改，为了账户安全，您需要重新登录。',
        '提示',
        {
          confirmButtonText: '重新登录',
          showCancelButton: false,
          type: 'success'
        }
      ).then(() => {
        // 跳转到登录页
        window.location.href = '/merchant/login'
      })
    }, 1000)
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error('密码修改失败，请重试')
  } finally {
    changingPassword.value = false
  }
}

const checkPasswordStrength = (password) => {
  if (!password) {
    passwordStrength.value = { width: '0%', class: '', text: '' }
    return
  }

  let score = 0
  let feedback = []

  // 长度检查
  if (password.length >= 8) score += 1
  else feedback.push('至少8位')

  // 大写字母
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('包含大写字母')

  // 小写字母
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('包含小写字母')

  // 数字
  if (/\d/.test(password)) score += 1
  else feedback.push('包含数字')

  // 特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

  // 根据得分设置强度
  if (score <= 2) {
    passwordStrength.value = {
      width: '33%',
      class: 'weak',
      text: '弱'
    }
  } else if (score <= 3) {
    passwordStrength.value = {
      width: '66%',
      class: 'medium',
      text: '中等'
    }
  } else {
    passwordStrength.value = {
      width: '100%',
      class: 'strong',
      text: '强'
    }
  }
}

// 模拟加载用户信息
const loadUserInfo = () => {
  // 模拟从API获取用户信息
  console.log('用户信息已加载:', userInfo)
  ElMessage.success(`欢迎回来，${userInfo.username}！`)
}

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.profile-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.profile-content {
  display: flex;
  gap: 32px;
}

.avatar-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.profile-avatar {
  cursor: pointer;
  border: 4px solid #f3f4f6;
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;
  font-size: 12px;
}

.avatar-section:hover .avatar-overlay {
  opacity: 1;
}

.info-section {
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.status-tag {
  align-self: flex-start;
}

.edit-form {
  max-width: 600px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-avatar {
  cursor: pointer;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.upload-avatar:hover {
  border-color: #3b82f6;
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-icon {
  font-size: 24px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: #9ca3af;
}

.upload-tips {
  margin-top: 8px;
  text-align: center;
}

.upload-tips p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.strength-label {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background-color: #ef4444;
}

.strength-fill.medium {
  background-color: #f59e0b;
}

.strength-fill.strong {
  background-color: #10b981;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.password-rules {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.password-rules h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1f2937;
}

.password-rules ul {
  margin: 0;
  padding-left: 16px;
}

.password-rules li {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    gap: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>