<template>
  <div class="admin-settings">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>管理系统配置和参数</p>
    </div>
    
    <div class="settings-tabs">
      <!-- 系统参数设置内容 -->
        <div class="system-settings">
          <!-- 页面标题 -->
          <div class="settings-header">
            <h2 class="settings-title">系统参数设置</h2>
          </div>

          <!-- 表单区域 -->
          <el-form
            ref="systemFormRef"
            :model="systemForm"
            :rules="systemRules"
            label-width="140px"
            class="system-form"
          >
            <!-- 基础设置卡片 -->
            <el-card class="settings-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Setting /></el-icon>
                  <span class="card-title">基础设置</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="系统名称" prop="systemName">
                    <el-input
                      v-model="systemForm.systemName"
                      placeholder="请输入系统名称"
                      maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系邮箱" prop="contactEmail">
                    <el-input
                      v-model="systemForm.contactEmail"
                      placeholder="请输入联系邮箱"
                      type="email"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="系统Logo">
                <div class="logo-upload-section">
                  <el-upload
                    class="logo-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeLogoUpload"
                    :on-success="handleLogoSuccess"
                    accept="image/*"
                  >
                    <img v-if="systemForm.logoUrl" :src="systemForm.logoUrl" class="logo-preview" />
                    <div v-else class="logo-upload-placeholder">
                      <el-icon class="upload-icon"><Plus /></el-icon>
                      <div class="upload-text">点击上传Logo</div>
                    </div>
                  </el-upload>
                  <div class="upload-tips">
                    <p>支持 JPG、PNG 格式，建议尺寸 200x60px，文件大小不超过 2MB</p>
                  </div>
                </div>
              </el-form-item>
            </el-card>

            <!-- 邮件设置卡片 -->
            <el-card class="settings-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Message /></el-icon>
                  <span class="card-title">邮件设置</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SMTP服务器" prop="smtpHost">
                    <el-input
                      v-model="systemForm.smtpHost"
                      placeholder="例如：smtp.gmail.com"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="SMTP端口" prop="smtpPort">
                    <el-input-number
                      v-model="systemForm.smtpPort"
                      :min="1"
                      :max="65535"
                      placeholder="例如：587"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="发件人邮箱" prop="senderEmail">
                    <el-input
                      v-model="systemForm.senderEmail"
                      placeholder="请输入发件人邮箱"
                      type="email"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="发件人名称" prop="senderName">
                    <el-input
                      v-model="systemForm.senderName"
                      placeholder="请输入发件人名称"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SMTP用户名" prop="smtpUsername">
                    <el-input
                      v-model="systemForm.smtpUsername"
                      placeholder="请输入SMTP用户名"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="SMTP密码" prop="smtpPassword">
                    <el-input
                      v-model="systemForm.smtpPassword"
                      type="password"
                      placeholder="请输入SMTP密码"
                      show-password
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="加密方式">
                <el-radio-group v-model="systemForm.smtpEncryption">
                  <el-radio value="none">无加密</el-radio>
                  <el-radio value="ssl">SSL</el-radio>
                  <el-radio value="tls">TLS</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="邮件模板管理">
                <el-button type="primary" @click="manageEmailTemplates">
                  <el-icon><Document /></el-icon>
                  管理邮件模板
                </el-button>
                <el-button @click="testEmailConnection">
                  <el-icon><Connection /></el-icon>
                  测试邮件连接
                </el-button>
              </el-form-item>
            </el-card>

            <!-- 保存设置按钮 -->
            <div class="form-actions">
              <el-button size="large" @click="resetForm">重置</el-button>
              <el-button type="primary" size="large" @click="saveSettings" :loading="saving">
                保存设置
              </el-button>
            </div>
          </el-form>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Message,
  Document,
  Connection,
  Plus
} from '@element-plus/icons-vue'
const systemFormRef = ref()
const saving = ref(false)

// 系统设置表单数据
const systemForm = reactive({
  // 基础设置
  systemName: 'Shopify铺货系统',
  logoUrl: '',
  contactEmail: 'admin@shopify-system.com',

  // 邮件设置
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  senderEmail: 'noreply@shopify-system.com',
  senderName: 'Shopify铺货系统',
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls'
})

// 表单验证规则
const systemRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '系统名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  smtpHost: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口范围为 1-65535', trigger: 'blur' }
  ],
  senderEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  senderName: [
    { required: true, message: '请输入发件人名称', trigger: 'blur' }
  ],
  smtpUsername: [
    { required: true, message: '请输入SMTP用户名', trigger: 'blur' }
  ],
  smtpPassword: [
    { required: true, message: '请输入SMTP密码', trigger: 'blur' }
  ]
}

// Logo上传前验证
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }

  // 模拟上传
  const reader = new FileReader()
  reader.onload = (e) => {
    systemForm.logoUrl = e.target.result
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

// Logo上传成功处理
const handleLogoSuccess = (response) => {
  systemForm.logoUrl = response.url
  ElMessage.success('Logo上传成功')
}

// 管理邮件模板
const manageEmailTemplates = () => {
  ElMessage.info('邮件模板管理功能开发中...')
}

// 测试邮件连接
const testEmailConnection = async () => {
  if (!systemForm.smtpHost || !systemForm.smtpPort || !systemForm.smtpUsername) {
    ElMessage.warning('请先完善SMTP配置信息')
    return
  }

  try {
    ElMessage.info('正在测试邮件连接...')
    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('邮件连接测试成功')
  } catch (error) {
    ElMessage.error('邮件连接测试失败，请检查配置')
  }
}

// 保存设置
const saveSettings = async () => {
  if (!systemFormRef.value) return

  try {
    await systemFormRef.value.validate()

    saving.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('系统设置保存成功')
  } catch (error) {
    console.log('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？这将恢复到默认配置。',
      '重置确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (systemFormRef.value) {
      systemFormRef.value.resetFields()
    }

    ElMessage.success('设置已重置')
  } catch {
    // 用户取消
  }
}

// 生命周期
onMounted(() => {
  console.log('系统设置页面已加载')
})
</script>

<style scoped>
.admin-settings {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.settings-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 系统设置样式 */
.system-settings {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-title {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.system-form {
  width: 100%;
}

.settings-card {
  margin-bottom: 24px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

/* Logo上传样式 */
.logo-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo-uploader {
  display: inline-block;
}

.logo-preview {
  width: 200px;
  height: 60px;
  object-fit: contain;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
}

.logo-upload-placeholder {
  width: 200px;
  height: 60px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.logo-upload-placeholder:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 24px;
  color: #8c939d;
  margin-bottom: 4px;
}

.upload-text {
  color: #8c939d;
  font-size: 12px;
}

.upload-tips {
  margin-top: 8px;
}

.upload-tips p {
  margin: 0;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}



/* 表单操作按钮 */
.form-actions {
  text-align: center;
  padding: 24px 0;
  border-top: 1px solid #ebeef5;
  margin-top: 24px;
}

.form-actions .el-button {
  margin: 0 12px;
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-settings {
    padding: 12px;
  }

  .system-settings {
    max-width: 100%;
  }

  .logo-preview,
  .logo-upload-placeholder {
    width: 160px;
    height: 48px;
  }

  .form-actions {
    text-align: center;
  }

  .form-actions .el-button {
    margin: 8px;
    width: 120px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .admin-settings {
    background: #1a1a1a;
  }

  .settings-title {
    color: #e5eaf3;
  }

  .card-title {
    color: #e5eaf3;
  }

  .section-title {
    color: #e5eaf3;
  }
}
</style>