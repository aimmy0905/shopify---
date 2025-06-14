<template>
  <div class="create-supplier-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/suppliers' }">供应商管理</el-breadcrumb-item>
      <el-breadcrumb-item>新增供应商</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">新增供应商</h2>
      <p class="page-description">添加新的供应商到系统中，请完整填写供应商信息</p>
    </div>

    <!-- 表单区域 -->
    <div class="form-container">
      <el-form
        :model="supplierForm"
        :rules="formRules"
        ref="supplierFormRef"
        label-width="120px"
        size="large"
      >
        <!-- 基本信息卡片 -->
        <el-card class="form-card" header="基本信息" shadow="never">
          <div class="form-grid">
            <!-- 供应商名称 -->
            <el-form-item label="供应商名称" prop="name" class="full-width">
              <el-input
                v-model="supplierForm.name"
                placeholder="请输入供应商完整名称"
                clearable
                maxlength="100"
                show-word-limit
              >
                <template #prefix>
                  <el-icon><office-building /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 联系人 -->
            <el-form-item label="联系人" prop="contactPerson">
              <el-input
                v-model="supplierForm.contactPerson"
                placeholder="请输入主要联系人姓名"
                clearable
                maxlength="50"
              >
                <template #prefix>
                  <el-icon><user /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 供应商类型 -->
            <el-form-item label="供应商类型" prop="type">
              <el-select
                v-model="supplierForm.type"
                placeholder="请选择供应商类型"
                style="width: 100%"
              >
                <el-option label="国内供应商" value="domestic">
                  <span>🏭 国内供应商</span>
                </el-option>
                <el-option label="海外供应商" value="overseas">
                  <span>🌍 海外供应商</span>
                </el-option>
                <el-option label="品牌方" value="brand">
                  <span>🏷️ 品牌方</span>
                </el-option>
                <el-option label="代理商" value="agent">
                  <span>🤝 代理商</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-card>

        <!-- 联系信息卡片 -->
        <el-card class="form-card" header="联系信息" shadow="never">
          <div class="form-grid">
            <!-- 联系电话 -->
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="supplierForm.phone"
                placeholder="请输入联系电话"
                clearable
                maxlength="20"
              >
                <template #prefix>
                  <el-icon><phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 电子邮箱 -->
            <el-form-item label="电子邮箱" prop="email">
              <el-input
                v-model="supplierForm.email"
                type="email"
                placeholder="请输入电子邮箱"
                clearable
                maxlength="100"
              >
                <template #prefix>
                  <el-icon><message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 传真号码 -->
            <el-form-item label="传真号码">
              <el-input
                v-model="supplierForm.fax"
                placeholder="请输入传真号码（选填）"
                clearable
                maxlength="20"
              >
                <template #prefix>
                  <el-icon><printer /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 网站地址 -->
            <el-form-item label="网站地址">
              <el-input
                v-model="supplierForm.website"
                placeholder="请输入官方网站地址（选填）"
                clearable
                maxlength="200"
              >
                <template #prefix>
                  <el-icon><link /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>
        </el-card>

        <!-- 地址信息卡片 -->
        <el-card class="form-card" header="地址信息" shadow="never">
          <div class="form-grid">
            <!-- 公司地址 -->
            <el-form-item label="公司地址" prop="address" class="full-width">
              <el-input
                v-model="supplierForm.address"
                type="textarea"
                :rows="3"
                placeholder="请输入详细的公司地址"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <!-- 国家/地区 -->
            <el-form-item label="国家/地区" prop="country">
              <el-select
                v-model="supplierForm.country"
                placeholder="请选择国家/地区"
                filterable
                style="width: 100%"
              >
                <el-option label="中国" value="CN" />
                <el-option label="美国" value="US" />
                <el-option label="英国" value="UK" />
                <el-option label="德国" value="DE" />
                <el-option label="日本" value="JP" />
                <el-option label="韩国" value="KR" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>

            <!-- 邮政编码 -->
            <el-form-item label="邮政编码">
              <el-input
                v-model="supplierForm.postalCode"
                placeholder="请输入邮政编码"
                clearable
                maxlength="20"
              >
                <template #prefix>
                  <el-icon><location /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>
        </el-card>

        <!-- 财务信息卡片 -->
        <el-card class="form-card" header="财务信息" shadow="never">
          <div class="form-grid">
            <!-- 银行账户名称 -->
            <el-form-item label="银行账户名称">
              <el-input
                v-model="supplierForm.bankAccountName"
                placeholder="请输入银行账户名称"
                clearable
                maxlength="100"
              />
            </el-form-item>

            <!-- 银行账号 -->
            <el-form-item label="银行账号">
              <el-input
                v-model="supplierForm.bankAccount"
                placeholder="请输入银行账号"
                clearable
                maxlength="50"
              />
            </el-form-item>

            <!-- 开户银行 -->
            <el-form-item label="开户银行">
              <el-input
                v-model="supplierForm.bankName"
                placeholder="请输入开户银行名称"
                clearable
                maxlength="100"
              />
            </el-form-item>

            <!-- Swift代码 -->
            <el-form-item label="Swift代码">
              <el-input
                v-model="supplierForm.swiftCode"
                placeholder="国际转账用（选填）"
                clearable
                maxlength="20"
              />
            </el-form-item>
          </div>
        </el-card>

        <!-- 认证文件卡片 -->
        <el-card class="form-card" header="认证文件" shadow="never">
          <div class="upload-section">
            <!-- 营业执照 -->
            <el-form-item label="营业执照" class="upload-item">
              <el-upload
                :file-list="supplierForm.businessLicense"
                :limit="1"
                accept=".jpg,.jpeg,.png,.pdf"
                :auto-upload="false"
                list-type="picture-card"
                @change="handleBusinessLicenseChange"
              >
                <el-icon><plus /></el-icon>
                <template #tip>
                  <div class="upload-tip">
                    支持 JPG、PNG、PDF 格式，文件大小不超过 5MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <!-- 其他资质文件 -->
            <el-form-item label="其他资质文件" class="upload-item">
              <el-upload
                :file-list="supplierForm.qualificationFiles"
                :limit="5"
                accept=".jpg,.jpeg,.png,.pdf"
                :auto-upload="false"
                list-type="picture-card"
                @change="handleQualificationFilesChange"
              >
                <el-icon><plus /></el-icon>
                <template #tip>
                  <div class="upload-tip">
                    最多上传5个文件，支持 JPG、PNG、PDF 格式
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </div>
        </el-card>

        <!-- 其他信息卡片 -->
        <el-card class="form-card" header="其他信息" shadow="never">
          <!-- 备注信息 -->
          <el-form-item label="备注信息">
            <el-input
              v-model="supplierForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息，如特殊要求、合作说明等"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <!-- 合作起始日期 -->
          <el-form-item label="合作起始日期">
            <el-date-picker
              v-model="supplierForm.cooperationStartDate"
              type="date"
              placeholder="选择合作开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-card>

        <!-- 提交选项卡片 -->
        <el-card class="form-card" header="提交选项" shadow="never">
          <el-form-item>
            <el-radio-group v-model="submitOption">
              <el-radio value="save">
                <span class="radio-label">
                  <strong>保存草稿</strong> - 保存供应商信息，状态为待审核
                </span>
              </el-radio>
              <el-radio value="submit">
                <span class="radio-label">
                  <strong>保存并提交审核</strong> - 直接提交审核，管理员将收到通知
                </span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-card>
      </el-form>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <el-button type="info" size="large" @click="handleCancel">
        <el-icon><arrow-left /></el-icon>
        取消
      </el-button>
      <el-button 
        type="warning"
        size="large" 
        @click="handleReset"
        :icon="RefreshLeft"
      >
        重置
      </el-button>
      <el-button 
        type="primary" 
        size="large" 
        @click="handleSubmit"
        :loading="submitting"
        :icon="Check"
      >
        {{ submitOption === 'submit' ? '保存并提交审核' : '保存' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  OfficeBuilding,
  User,
  Phone,
  Message,
  Printer,
  Link,
  Location,
  ArrowLeft,
  RefreshLeft,
  Check
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const supplierFormRef = ref()
const submitting = ref(false)
const submitOption = ref('save') // save | submit

// 供应商表单数据
const supplierForm = reactive({
  name: '',
  contactPerson: '',
  type: '',
  phone: '',
  email: '',
  fax: '',
  website: '',
  address: '',
  country: '',
  postalCode: '',
  bankAccountName: '',
  bankAccount: '',
  bankName: '',
  swiftCode: '',
  businessLicense: [],
  qualificationFiles: [],
  remark: '',
  cooperationStartDate: null
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 100, message: '供应商名称长度应为2-100个字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '联系人姓名长度应为2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择供应商类型', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { 
      pattern: /^1[3-9]\d{9}$|^(\d{3,4}-?)?\d{7,8}$/, 
      message: '请输入正确的电话号码', 
      trigger: 'blur' 
    }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入公司地址', trigger: 'blur' },
    { min: 10, max: 500, message: '地址长度应为10-500个字符', trigger: 'blur' }
  ],
  country: [
    { required: true, message: '请选择国家/地区', trigger: 'change' }
  ]
}

// 方法定义
const handleSubmit = async () => {
  try {
    // 表单验证
    await supplierFormRef.value.validate()
    
    submitting.value = true
    
    // 构造提交数据
    const submitData = {
      ...supplierForm,
      submitForAudit: submitOption.value === 'submit'
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 提交成功
    ElMessage.success(
      submitOption.value === 'submit' 
        ? '供应商信息已提交审核，请等待管理员处理' 
        : '供应商信息保存成功'
    )
    
    // 返回列表页
    router.push('/admin/suppliers')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败，请检查表单信息')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消创建吗？未保存的信息将丢失。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }
    )
    
    router.push('/admin/suppliers')
  } catch (error) {
    // 用户取消
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置表单吗？所有已填写的信息将被清空。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重置表单
    supplierFormRef.value.resetFields()
    supplierForm.businessLicense = []
    supplierForm.qualificationFiles = []
    submitOption.value = 'save'
    
    ElMessage.success('表单已重置')
  } catch (error) {
    // 用户取消
  }
}

const handleBusinessLicenseChange = (fileList) => {
  supplierForm.businessLicense = fileList
}

const handleQualificationFilesChange = (fileList) => {
  supplierForm.qualificationFiles = fileList
}
</script>

<style scoped lang="scss">
.create-supplier-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      font-size: 24px;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    .page-description {
      color: #909399;
      margin: 0;
    }
  }

  .form-container {
    max-width: 1000px;
    margin: 0 auto;

    .form-card {
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;

      :deep(.el-card__header) {
        background: #f8f9fa;
        font-weight: 600;
        color: #303133;
        padding: 16px 20px;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      .full-width {
        grid-column: 1 / -1;
      }
    }

    .upload-section {
      .upload-item {
        margin-bottom: 24px;

        :deep(.el-form-item__label) {
          font-weight: 500;
        }

        .upload-tip {
          color: #909399;
          font-size: 12px;
          margin-top: 8px;
        }
      }
    }

    .radio-label {
      display: flex;
      flex-direction: column;
      margin-left: 8px;

      strong {
        color: #303133;
        margin-bottom: 4px;
      }
    }
  }

  .action-bar {
    max-width: 1000px;
    margin: 32px auto 0;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    position: sticky;
    bottom: 20px;
    z-index: 100;
  }
}

// 表单样式优化
:deep(.el-input__prefix) {
  color: #909399;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

// 响应式设计
@media (max-width: 768px) {
  .create-supplier-page {
    padding: 10px;

    .form-container {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .action-bar {
      flex-direction: column;
      position: static;
      margin-top: 20px;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style> 