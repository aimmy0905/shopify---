<template>
  <el-dialog
    v-model="dialogVisible"
    title="账户充值"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" finish-status="success" style="margin-bottom: 30px;">
      <el-step title="选择方式" description="选择币种和支付方式"></el-step>
      <el-step title="填写信息" description="输入充值金额"></el-step>
      <el-step title="上传凭证" description="上传支付凭证"></el-step>
      <el-step title="完成" description="提交成功"></el-step>
    </el-steps>

    <!-- 步骤1：选择币种和支付方式 -->
    <div v-if="currentStep === 0" class="step-content">
      <!-- 选择币种 -->
      <div class="currency-selection">
        <h4>选择充值币种</h4>
        <div class="currency-options">
          <el-button
            v-for="currency in ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']"
            :key="currency"
            :type="formData.currency === currency ? 'primary' : 'default'"
            @click="formData.currency = currency"
            style="margin: 5px;"
          >
            {{ getCurrencyFlag(currency) }} {{ currency }}
          </el-button>
        </div>
      </div>

      <!-- 选择支付方式 -->
      <div class="payment-methods">
        <h4>选择支付方式</h4>
        <div class="payment-cards">
          <div
            v-for="method in paymentMethods"
            :key="method.value"
            class="payment-card"
            :class="{ active: formData.paymentMethod === method.value }"
            @click="formData.paymentMethod = method.value"
          >
            <div class="method-icon">
              <el-icon><CreditCard /></el-icon>
            </div>
            <div class="method-name">{{ method.label }}</div>
            <div class="method-desc">{{ method.description }}</div>
          </div>
        </div>
      </div>

      <!-- 实时状态显示 -->
      <div class="step-status">
        <div class="status-item" :class="{ completed: formData.currency }">
          <el-icon><CircleCheck v-if="formData.currency" /><CirclePlus v-else /></el-icon>
          <span>选择充值币种</span>
        </div>
        <div class="status-item" :class="{ completed: formData.paymentMethod }">
          <el-icon><CircleCheck v-if="formData.paymentMethod" /><CirclePlus v-else /></el-icon>
          <span>选择支付方式</span>
        </div>
        
        <div v-if="canProceed" class="ready-indicator">
          <el-icon><SuccessFilled /></el-icon>
          <span style="color: #67c23a; font-weight: 600;">✅ 可以进入下一步！</span>
        </div>
      </div>
    </div>

    <!-- 步骤2：输入金额 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="amount-form">
        <h4>充值金额 ({{ formData.currency }})</h4>
        <el-input
          v-model="formData.amount"
          placeholder="请输入充值金额"
          type="number"
          style="font-size: 18px; margin-bottom: 15px;"
          size="large"
        >
          <template #prepend>{{ getCurrencySymbol(formData.currency) }}</template>
        </el-input>
        
        <!-- 快捷金额选择 -->
        <div class="quick-amounts">
          <span class="quick-label">快捷选择：</span>
          <el-button
            v-for="amount in getQuickAmounts(formData.currency)"
            :key="amount"
            size="small"
            @click="formData.amount = amount.toString()"
          >
            {{ getCurrencySymbol(formData.currency) }}{{ amount }}
          </el-button>
        </div>
      </div>

      <!-- 收款信息 -->
      <div class="account-info">
        <h4>收款账户信息</h4>
        <el-alert
          :title="`请向以下${getPaymentMethodLabel(formData.paymentMethod)}账户转账`"
          type="info"
          show-icon
          :closable="false"
        >
          <div class="account-details">
            <p><strong>收款账户：</strong>{{ getAccountInfo(formData.paymentMethod) }}</p>
            <p><strong>转账金额：</strong><span class="highlight">{{ getCurrencySymbol(formData.currency) }}{{ formData.amount || '0' }}</span></p>
            <p><strong>转账说明：</strong>请在转账时备注您的用户ID</p>
          </div>
        </el-alert>
      </div>
    </div>

    <!-- 步骤3：上传凭证 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="upload-area">
        <h4>上传支付凭证</h4>
        
        <!-- 文件状态提示 -->
        <el-alert
          v-if="fileList.length === 0"
          title="请上传支付凭证文件"
          type="warning"
          :closable="false"
          style="margin-bottom: 15px;"
        >
          请至少上传一个支付凭证文件才能提交申请
        </el-alert>
        
        <el-alert
          v-else
          :title="`已选择 ${fileList.length} 个文件，可以提交申请了`"
          type="success"
          :closable="false"
          style="margin-bottom: 15px;"
        >
          文件准备就绪，点击下方"确认提交申请"按钮完成提交
        </el-alert>
        
        <div class="upload-container">
          <el-upload
            v-model:file-list="fileList"
            class="receipt-uploader"
            drag
            multiple
            :limit="3"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :auto-upload="false"
          >
            <el-icon class="el-icon--upload"><Plus /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 JPG/PNG/PDF 文件，单个文件不超过10MB，最多3个文件
              </div>
            </template>
          </el-upload>
          
          <!-- 上传提示 -->
          <div class="upload-tips">
            <h6>上传说明：</h6>
            <ul>
              <li>请上传清晰的转账截图或收据</li>
              <li>确保能看清转账金额、时间和收款方信息</li>
              <li>支持的格式：JPG、PNG、PDF</li>
              <li>文件大小不超过10MB</li>
            </ul>
          </div>
        </div>

        <!-- 备注信息 -->
        <el-form style="margin-top: 20px;">
          <el-form-item label="备注说明（可选）">
            <el-input
              v-model="formData.receiptNote"
              type="textarea"
              :rows="3"
              placeholder="请输入转账备注或其他说明信息..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 步骤4：完成 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="success-content">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h3>充值申请已提交</h3>
        <p>工作人员将在1-2个工作日内审核您的充值申请</p>
        <p>审核结果将通过邮件或站内消息通知您</p>
        
        <!-- 申请详情 -->
        <div class="application-details">
          <h4>申请详情</h4>
          <div class="detail-row">
            <span>申请时间：</span>
            <span>{{ new Date().toLocaleString() }}</span>
          </div>
          <div class="detail-row">
            <span>充值金额：</span>
            <span class="amount">{{ getCurrencySymbol(formData.currency) }}{{ formData.amount }}</span>
          </div>
          <div class="detail-row">
            <span>支付方式：</span>
            <span>{{ getPaymentMethodLabel(formData.paymentMethod) }}</span>
          </div>
          <div class="detail-row">
            <span>申请编号：</span>
            <span class="order-id">{{ generateOrderId() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <!-- 上一步按钮 -->
        <el-button v-if="currentStep > 0 && currentStep < 3" @click="previousStep">
          上一步
        </el-button>
        
        <!-- 下一步按钮（步骤0和1） -->
        <el-button 
          v-if="currentStep === 0 || currentStep === 1" 
          type="primary" 
          @click="nextStep" 
          :disabled="!canProceed"
          :class="{ 'next-button-ready': canProceed }"
          size="large"
        >
          <el-icon v-if="canProceed"><ArrowRight /></el-icon>
          {{ canProceed ? '下一步' : '下一步 (请完成上述选择)' }}
        </el-button>
        
        <!-- 提交申请按钮（步骤2） -->
        <el-button 
          v-if="currentStep === 2" 
          type="primary" 
          @click="submitRecharge" 
          :loading="submitting"
          :disabled="!canProceed"
          size="large"
          class="submit-button"
        >
          <el-icon v-if="!submitting"><SuccessFilled /></el-icon>
          {{ submitting ? '提交中...' : '确认提交申请' }}
        </el-button>
        
        <!-- 查看记录按钮（步骤3） -->
        <el-button v-if="currentStep === 3" type="primary" @click="viewRechargeRecords">
          查看充值记录
        </el-button>
        
        <!-- 取消/关闭按钮 -->
        <el-button @click="handleClose">
          {{ currentStep === 3 ? '关闭' : '取消' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  CreditCard, Plus, CircleCheck, SuccessFilled, 
  CirclePlus, ArrowRight 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props和Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const dialogVisible = ref(false)
const currentStep = ref(0)
const submitting = ref(false)
const fileList = ref([])

// 表单数据
const formData = ref({
  currency: 'USD',
  paymentMethod: '',
  amount: '',
  receiptNote: ''
})

// 支付方式列表
const paymentMethods = ref([
  {
    value: 'paypal',
    label: 'PayPal',
    description: '支持全球转账'
  },
  {
    value: 'bank',
    label: '银行卡转账',
    description: '传统银行转账'
  },
  {
    value: 'wise',
    label: 'Wise',
    description: '低费率国际转账'
  },
  {
    value: 'revolut',
    label: 'Revolut',
    description: '数字银行转账'
  }
])

// 监听显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 计算是否可以进行下一步
const canProceed = computed(() => {
  console.log('检查canProceed，当前步骤:', currentStep.value)
  console.log('表单数据:', formData.value)
  console.log('文件列表长度:', fileList.value.length)
  
  if (currentStep.value === 0) {
    const result = formData.value.currency && formData.value.paymentMethod
    console.log('步骤0 canProceed:', result)
    return result
  } else if (currentStep.value === 1) {
    const result = formData.value.amount && parseFloat(formData.value.amount) > 0
    console.log('步骤1 canProceed:', result, 'amount:', formData.value.amount)
    return result
  } else if (currentStep.value === 2) {
    const result = fileList.value.length > 0
    console.log('步骤2 canProceed:', result, 'fileList:', fileList.value.length)
    return result
  }
  return true
})

// 辅助方法
const getCurrencyFlag = (currency) => {
  const flags = {
    'USD': '🇺🇸',
    'EUR': '🇪🇺', 
    'GBP': '🇬🇧',
    'JPY': '🇯🇵',
    'CAD': '🇨🇦',
    'AUD': '🇦🇺'
  }
  return flags[currency] || '💰'
}

const getCurrencySymbol = (currency) => {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$'
  }
  return symbols[currency] || currency
}

const getQuickAmounts = (currency) => {
  const amounts = {
    'USD': [10, 50, 100, 200, 500, 1000],
    'EUR': [10, 50, 100, 200, 500, 1000],
    'GBP': [10, 50, 100, 200, 500, 1000],
    'JPY': [1000, 5000, 10000, 20000, 50000, 100000],
    'CAD': [10, 50, 100, 200, 500, 1000],
    'AUD': [10, 50, 100, 200, 500, 1000]
  }
  return amounts[currency] || amounts['USD']
}

const getPaymentMethodLabel = (method) => {
  const methodObj = paymentMethods.value.find(m => m.value === method)
  return methodObj ? methodObj.label : method
}

const getAccountInfo = (method) => {
  const accountInfoMap = {
    'paypal': 'payments@yourcompany.com',
    'bank': 'IBAN: GB29 NWBK 6016 1331 9268 19',
    'wise': 'wise@yourcompany.com',
    'revolut': 'revolut@yourcompany.com'
  }
  return accountInfoMap[method] || '请联系客服获取账户信息'
}

// 操作方法
const nextStep = () => {
  console.log('点击下一步，当前步骤:', currentStep.value)
  console.log('canProceed:', canProceed.value)
  
  if (!canProceed.value) {
    if (currentStep.value === 0) {
      if (!formData.value.currency) {
        ElMessage.warning('请选择充值币种')
        return
      }
      if (!formData.value.paymentMethod) {
        ElMessage.warning('请选择支付方式')
        return
      }
    } else if (currentStep.value === 1) {
      if (!formData.value.amount) {
        ElMessage.warning('请输入充值金额')
        return
      }
      if (parseFloat(formData.value.amount) <= 0) {
        ElMessage.warning('充值金额必须大于0')
        return
      }
    }
    return
  }
  
  if (currentStep.value < 3) {
    currentStep.value++
    ElMessage.success(`进入第${currentStep.value + 1}步`)
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitRecharge = async () => {
  console.log('点击提交申请')
  
  if (!canProceed.value) {
    ElMessage.warning('请先上传支付凭证')
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('充值申请提交成功！')
    
    // 跳转到完成步骤
    currentStep.value = 3
    
    // 触发成功事件
    emit('success', {
      currency: formData.value.currency,
      amount: formData.value.amount,
      paymentMethod: formData.value.paymentMethod,
      orderId: generateOrderId()
    })
    
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const viewRechargeRecords = () => {
  emit('update:modelValue', false)
  ElMessage.info('跳转到充值记录页面')
}

const generateOrderId = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `RC${timestamp}${random}`
}

const handleClose = () => {
  // 重置表单
  currentStep.value = 0
  formData.value = {
    currency: 'USD',
    paymentMethod: '',
    amount: '',
    receiptNote: ''
  }
  fileList.value = []
  
  emit('update:modelValue', false)
}

// 文件上传相关
const beforeUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('上传文件只能是 JPG、PNG 或 PDF 格式!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleFileChange = (file, fileList) => {
  console.log('文件变化:', file.name, '当前文件数:', fileList.length)
  if (fileList.length > 0) {
    ElMessage.success(`已选择 ${fileList.length} 个文件，可点击"确认提交申请"按钮`)
  }
}

const handleFileRemove = (file, fileList) => {
  ElMessage.info(`已删除文件: ${file.name}，当前剩余 ${fileList.length} 个文件`)
  if (fileList.length === 0) {
    ElMessage.warning('请至少上传一个支付凭证文件')
  }
}
</script>

<style scoped lang="scss">
.step-content {
  min-height: 300px;
}

.currency-selection, .payment-methods {
  margin-bottom: 30px;
  
  h4 {
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
  }
}

.currency-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  .payment-card {
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
    }
    
    &.active {
      border-color: #409eff;
      background: #f0f9ff;
    }
    
    .method-icon {
      font-size: 32px;
      color: #409eff;
      margin-bottom: 10px;
    }
    
    .method-name {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .method-desc {
      font-size: 12px;
      color: #666;
    }
  }
}

.step-status {
  margin-top: 25px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  
  .status-item {
    display: flex;
    align-items: center;
    margin: 12px 0;
    transition: all 0.3s;
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
      color: #c0c4cc;
      transition: all 0.3s;
    }
    
    span {
      color: #666;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    &.completed {
      .el-icon {
        color: #67c23a;
      }
      
      span {
        color: #2c3e50;
        font-weight: 500;
      }
    }
  }
  
  .ready-indicator {
    display: flex;
    align-items: center;
    margin-top: 15px;
    padding: 10px;
    background: #f0f9ff;
    border-radius: 6px;
    border: 1px solid #67c23a;
    animation: pulse 2s infinite;
    
    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  }
}

.amount-form {
  margin-bottom: 20px;
  
  h4 {
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
  }
  
  .quick-amounts {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 15px;
    flex-wrap: wrap;
    
    .quick-label {
      color: #666;
      font-size: 14px;
      margin-right: 10px;
    }
  }
}

.account-info {
  h4 {
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
  }
  
  .account-details {
    p {
      margin: 8px 0;
      font-size: 14px;
      
      .highlight {
        font-size: 18px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}

.upload-area {
  h4 {
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
  }
  
  .upload-tips {
    margin-top: 20px;
    background: #fafafa;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #409eff;
    
    h6 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 14px;
      font-weight: 600;
    }
    
    ul {
      margin: 0;
      padding-left: 16px;
      
      li {
        margin: 6px 0;
        font-size: 13px;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

.success-content {
  text-align: center;
  
  .success-icon {
    font-size: 64px;
    color: #67c23a;
    margin-bottom: 20px;
  }
  
  h3 {
    color: #2c3e50;
    margin-bottom: 15px;
  }
  
  p {
    color: #666;
    margin: 10px 0;
  }
  
  .application-details {
    background: #fafbfc;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    text-align: left;
    
    h4 {
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 14px;
      
      .amount {
        font-size: 16px;
        font-weight: 600;
        color: #409eff;
      }
      
      .order-id {
        font-family: monospace;
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 0 0;
  
  .el-button {
    min-width: 100px;
    
    &.next-button-ready {
      background: linear-gradient(45deg, #409eff, #67c23a);
      border: none;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      animation: glow 2s ease-in-out infinite alternate;
    }
    
    &.submit-button {
      background: linear-gradient(45deg, #67c23a, #409eff) !important;
      border: none !important;
      font-size: 16px;
      padding: 12px 30px;
      box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
      transition: all 0.3s ease;
      color: white !important;
      font-weight: 600;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(103, 194, 58, 0.6);
      }
      
      &:disabled {
        background: #ccc !important;
        box-shadow: none;
      }
      
      &:not(:disabled) {
        animation: submitGlow 2s ease-in-out infinite alternate;
      }
    }
  }
}

@keyframes glow {
  from {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  }
  to {
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.8);
  }
}

@keyframes submitGlow {
  0% {
    box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
  }
  100% {
    box-shadow: 0 6px 30px rgba(103, 194, 58, 0.7), 0 0 20px rgba(64, 158, 255, 0.3);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}
</style> 