<template>
  <div class="recharge-settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">支付方式设置</h1>
        <p class="page-description">配置充值支付方式设置</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="saveAllSettings" :loading="saving">
          保存所有设置
        </el-button>
        <el-button @click="resetSettings">
          重置设置
        </el-button>
      </div>
    </div>

    <!-- 支付方式设置 -->
    <el-card class="settings-card">
      <div class="tab-content">
        <div class="section-header">
          <h3>支付方式配置</h3>
          <p>管理可用的充值支付方式</p>
          <el-button type="primary" @click="addPaymentMethod">
            <el-icon><Plus /></el-icon>
            添加支付方式
          </el-button>
        </div>

        <div class="payment-methods-list">
          <div v-for="method in paymentMethods" :key="method.id" class="payment-method-item">
            <el-card class="payment-method-card">
              <div class="method-header">
                <div class="method-info">
                  <div class="method-name">{{ method.name }}</div>
                </div>
                <div class="method-actions">
                  <el-switch v-model="method.enabled" @change="onPaymentMethodToggle(method)" />
                  <el-button type="primary" size="small" @click="editPaymentMethod(method)">
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="deletePaymentMethod(method)">
                    删除
                  </el-button>
                </div>
              </div>

              <div class="method-details" v-if="method.enabled">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="detail-label">账户信息:</span>
                      <span class="detail-value">{{ formatAccountInfo(method.accountInfo) }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="detail-label">支持币种:</span>
                      <span class="detail-value">{{ method.supportedCurrencies.join(', ') }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="detail-label">金额范围:</span>
                      <span class="detail-value">{{ method.minAmount }} - {{ method.maxAmount }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加支付方式弹窗 -->
    <el-dialog
      v-model="paymentMethodDialogVisible"
      :title="isEditingPaymentMethod ? '编辑支付方式' : '添加支付方式'"
      width="600px"
    >
      <el-form :model="paymentMethodForm" :rules="paymentMethodRules" ref="paymentMethodFormRef" label-width="120px">
        <el-form-item label="支付方式名称" prop="name">
          <el-input v-model="paymentMethodForm.name" placeholder="请输入支付方式名称" />
        </el-form-item>
        <el-form-item label="支付方式ID" prop="id">
          <el-input v-model="paymentMethodForm.id" placeholder="请输入支付方式ID" :disabled="isEditingPaymentMethod" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="paymentMethodForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="账户名称">
          <el-input v-model="paymentMethodForm.accountInfo.accountName" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账户信息">
          <el-input v-model="paymentMethodForm.accountInfo.accountNumber" placeholder="请输入账户号码或邮箱" />
        </el-form-item>
        <el-form-item label="银行名称" v-if="paymentMethodForm.id === 'bank_transfer'">
          <el-input v-model="paymentMethodForm.accountInfo.bankName" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="邮箱地址" v-if="paymentMethodForm.id === 'paypal'">
          <el-input v-model="paymentMethodForm.accountInfo.accountEmail" placeholder="请输入PayPal邮箱" />
        </el-form-item>
        <el-form-item label="支持币种" prop="supportedCurrencies">
          <el-checkbox-group v-model="paymentMethodForm.supportedCurrencies">
            <el-checkbox label="USD">美元</el-checkbox>
            <el-checkbox label="CNY">人民币</el-checkbox>
            <el-checkbox label="EUR">欧元</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="最小金额" prop="minAmount">
          <el-input-number v-model="paymentMethodForm.minAmount" :min="0" />
        </el-form-item>
        <el-form-item label="最大金额" prop="maxAmount">
          <el-input-number v-model="paymentMethodForm.maxAmount" :min="0" />
        </el-form-item>
        <el-form-item label="到账时间" prop="processingTime">
          <el-input v-model="paymentMethodForm.processingTime" placeholder="如：实时到账、1-3个工作日" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="paymentMethodForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paymentMethodDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePaymentMethod">保存</el-button>
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { rechargeSettings } from '@/data/mockData.js'

// 响应式数据
const saving = ref(false)

// 设置数据
const paymentMethods = ref([])

// 支付方式弹窗相关
const paymentMethodDialogVisible = ref(false)
const isEditingPaymentMethod = ref(false)
const paymentMethodFormRef = ref()
const paymentMethodForm = reactive({
  id: '',
  name: '',
  description: '',
  accountInfo: {
    accountName: '',
    accountNumber: '',
    accountEmail: '',
    bankName: '',
    qrCode: ''
  },
  supportedCurrencies: [],
  minAmount: 0,
  maxAmount: 0,
  processingTime: '',
  enabled: true
})

const paymentMethodRules = {
  name: [{ required: true, message: '请输入支付方式名称', trigger: 'blur' }],
  id: [{ required: true, message: '请输入支付方式ID', trigger: 'blur' }],
  supportedCurrencies: [{ required: true, message: '请选择支持的币种', trigger: 'change' }],
  minAmount: [{ required: true, message: '请输入最小金额', trigger: 'blur' }],
  maxAmount: [{ required: true, message: '请输入最大金额', trigger: 'blur' }],
  processingTime: [{ required: true, message: '请输入到账时间', trigger: 'blur' }]
}



// 方法
const saveAllSettings = async () => {
  saving.value = true
  try {
    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  ElMessageBox.confirm(
    '确定要重置所有设置吗？此操作不可撤销。',
    '重置设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loadSettings()
    ElMessage.success('设置已重置')
  })
}

// 支付方式切换状态
const onPaymentMethodToggle = (method) => {
  ElMessage.success(`${method.name} 已${method.enabled ? '启用' : '禁用'}`)
}

// 添加支付方式
const addPaymentMethod = () => {
  isEditingPaymentMethod.value = false
  Object.assign(paymentMethodForm, {
    id: '',
    name: '',
    description: '',
    accountInfo: {
      accountName: '',
      accountNumber: '',
      accountEmail: '',
      bankName: '',
      qrCode: ''
    },
    supportedCurrencies: [],
    minAmount: 0,
    maxAmount: 0,
    processingTime: '',
    enabled: true
  })
  paymentMethodDialogVisible.value = true
}

// 编辑支付方式
const editPaymentMethod = (method) => {
  isEditingPaymentMethod.value = true
  Object.assign(paymentMethodForm, {
    ...method,
    accountInfo: { ...method.accountInfo } || {
      accountName: '',
      accountNumber: '',
      accountEmail: '',
      bankName: '',
      qrCode: ''
    }
  })
  paymentMethodDialogVisible.value = true
}

// 保存支付方式
const savePaymentMethod = async () => {
  if (!paymentMethodFormRef.value) return

  try {
    await paymentMethodFormRef.value.validate()

    if (isEditingPaymentMethod.value) {
      // 编辑模式
      const index = paymentMethods.value.findIndex(m => m.id === paymentMethodForm.id)
      if (index > -1) {
        paymentMethods.value[index] = { ...paymentMethodForm }
        ElMessage.success('支付方式更新成功')
      }
    } else {
      // 添加模式
      const exists = paymentMethods.value.some(m => m.id === paymentMethodForm.id)
      if (exists) {
        ElMessage.error('支付方式ID已存在')
        return
      }
      paymentMethods.value.push({ ...paymentMethodForm })
      ElMessage.success('支付方式添加成功')
    }

    paymentMethodDialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 删除支付方式
const deletePaymentMethod = (method) => {
  ElMessageBox.confirm(
    `确定要删除支付方式 "${method.name}" 吗？`,
    '删除支付方式',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = paymentMethods.value.findIndex(m => m.id === method.id)
    if (index > -1) {
      paymentMethods.value.splice(index, 1)
      ElMessage.success('支付方式已删除')
    }
  })
}

// 格式化账户信息
const formatAccountInfo = (accountInfo) => {
  if (!accountInfo) return '未配置'

  // 根据不同的账户信息类型格式化显示
  if (accountInfo.accountEmail) {
    // PayPal类型，显示邮箱
    return accountInfo.accountEmail
  } else if (accountInfo.bankName && accountInfo.accountNumber) {
    // 银行转账类型，显示银行名称和账号
    return `${accountInfo.bankName} ${accountInfo.accountNumber}`
  } else if (accountInfo.accountNumber) {
    // 其他类型，显示账号
    return accountInfo.accountNumber
  } else if (accountInfo.accountName) {
    // 只有账户名称
    return accountInfo.accountName
  }

  return '未配置'
}



const loadSettings = () => {
  // 加载设置数据
  paymentMethods.value = [...rechargeSettings.paymentMethods]
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.recharge-settings-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left .page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left .page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 设置卡片 */
.settings-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.tab-content {
  padding: 20px 0;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.section-header p {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}



/* 支付方式设置 */
.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-method-item {
  width: 100%;
}

.payment-method-card {
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.method-description {
  font-size: 14px;
  color: #606266;
}

.method-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-details {
  padding-top: 16px;
  border-top: 1px solid #f5f7fa;
}

.detail-item {
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.detail-value {
  color: #303133;
}


</style>
