<template>
  <el-dialog
    v-model="dialogVisible"
    title="账户提现"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" align-center style="margin-bottom: 30px;">
      <el-step title="填写信息" />
      <el-step title="确认" />
      <el-step title="完成" />
    </el-steps>

    <!-- 步骤1：填写信息 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="balance-info">
        <h4>可提现余额</h4>
        <div class="available-balance">${{ availableBalance.toFixed(2) }}</div>
      </div>

      <el-form :model="formData" label-width="120px" ref="formRef" :rules="rules">
        <el-form-item label="提现金额" prop="amount">
          <el-input 
            v-model="formData.amount" 
            type="number" 
            placeholder="请输入提现金额"
          >
            <template #prepend>$</template>
            <template #append>
              <el-button @click="withdrawAll" size="small">全部提现</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="提现原因" prop="reason">
          <el-select v-model="formData.reason" placeholder="请选择提现原因">
            <el-option label="正常提现" value="normal" />
            <el-option label="业务结束" value="business_end" />
            <el-option label="紧急用款" value="emergency" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <div class="account-section">
          <h4>转账账户信息</h4>
          <el-form-item label="账户名称" prop="accountName">
            <el-input v-model="formData.accountName" placeholder="请输入账户持有人姓名" />
          </el-form-item>

          <el-form-item label="账号/IBAN" prop="accountNumber">
            <el-input v-model="formData.accountNumber" placeholder="请输入银行账号或IBAN" />
          </el-form-item>

          <el-form-item label="银行名称" prop="bankName">
            <el-input v-model="formData.bankName" placeholder="请输入银行名称" />
          </el-form-item>

          <el-form-item label="Swift代码" prop="swiftCode">
            <el-input v-model="formData.swiftCode" placeholder="请输入Swift代码（国际转账需要）" />
          </el-form-item>

          <el-form-item label="账户地址" prop="accountAddress">
            <el-input 
              v-model="formData.accountAddress" 
              type="textarea" 
              :rows="3"
              placeholder="请输入账户地址"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 步骤2：确认信息 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="confirm-section">
        <h4>确认提现信息</h4>
        
        <div class="confirm-item">
          <span class="label">提现金额：</span>
          <span class="value">${{ formData.amount }}</span>
        </div>

        <div class="confirm-item">
          <span class="label">提现原因：</span>
          <span class="value">{{ getReasonLabel(formData.reason) }}</span>
        </div>

        <div class="confirm-item">
          <span class="label">账户名称：</span>
          <span class="value">{{ formData.accountName }}</span>
        </div>

        <div class="confirm-item">
          <span class="label">账号/IBAN：</span>
          <span class="value">{{ formData.accountNumber }}</span>
        </div>

        <div class="confirm-item">
          <span class="label">银行名称：</span>
          <span class="value">{{ formData.bankName }}</span>
        </div>

        <div class="confirm-item">
          <span class="label">Swift代码：</span>
          <span class="value">{{ formData.swiftCode }}</span>
        </div>

        <div class="confirm-item">
          <span class="label">账户地址：</span>
          <span class="value">{{ formData.accountAddress }}</span>
        </div>

        <div class="warning-box">
          <el-icon><Warning /></el-icon>
          <p>请仔细核对以上信息，提现申请提交后无法修改</p>
        </div>
      </div>
    </div>

    <!-- 步骤3：完成 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="success-content">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h3>提现申请已提交</h3>
        <p>工作人员将在3-5个工作日内处理您的提现申请</p>
        <p>处理结果将通过邮件或站内消息通知您</p>
        <p>如有疑问，请联系客服</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="currentStep > 0 && currentStep < 2" @click="previousStep">
          上一步
        </el-button>
        <el-button v-if="currentStep === 0" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button v-if="currentStep === 1" type="primary" @click="submitWithdraw" :loading="submitting">
          提交申请
        </el-button>
        <el-button v-if="currentStep === 2" type="primary" @click="viewWithdrawRecords">
          查看提现记录
        </el-button>
        <el-button @click="handleClose">
          {{ currentStep === 2 ? '关闭' : '取消' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { Warning, CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = ref(false)
const currentStep = ref(0)
const submitting = ref(false)
const formRef = ref()
const availableBalance = ref(1250.75)

// 表单数据
const formData = ref({
  amount: '',
  reason: '',
  accountName: '',
  accountNumber: '',
  bankName: '',
  swiftCode: '',
  accountAddress: ''
})

// 表单验证规则
const rules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value && (parseFloat(value) <= 0 || parseFloat(value) > availableBalance.value)) {
          callback(new Error(`提现金额必须大于0且不超过可提现余额$${availableBalance.value.toFixed(2)}`))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  reason: [
    { required: true, message: '请选择提现原因', trigger: 'change' }
  ],
  accountName: [
    { required: true, message: '请输入账户名称', trigger: 'blur' }
  ],
  accountNumber: [
    { required: true, message: '请输入账号或IBAN', trigger: 'blur' }
  ],
  bankName: [
    { required: true, message: '请输入银行名称', trigger: 'blur' }
  ],
  swiftCode: [
    { required: true, message: '请输入Swift代码', trigger: 'blur' }
  ],
  accountAddress: [
    { required: true, message: '请输入账户地址', trigger: 'blur' }
  ]
}

// 监听外部控制的显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const getReasonLabel = (reason) => {
  const reasonMap = {
    'normal': '正常提现',
    'business_end': '业务结束',
    'emergency': '紧急用款',
    'other': '其他'
  }
  return reasonMap[reason] || reason
}

const withdrawAll = () => {
  formData.value.amount = availableBalance.value.toString()
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证表单
    try {
      await formRef.value.validate()
      currentStep.value++
    } catch (error) {
      console.log('表单验证失败')
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitWithdraw = async () => {
  submitting.value = true
  try {
    // 模拟提交提现申请
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    currentStep.value = 2
    emit('success')
  } catch (error) {
    console.error('提交提现申请失败:', error)
  } finally {
    submitting.value = false
  }
}

const viewWithdrawRecords = () => {
  // 跳转到提现记录
  emit('update:modelValue', false)
}

const handleClose = () => {
  // 重置表单
  currentStep.value = 0
  formData.value = {
    amount: '',
    reason: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    accountAddress: ''
  }
  
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.step-content {
  min-height: 300px;
}

.balance-info {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  
  h4 {
    margin-bottom: 10px;
    color: #666;
  }
  
  .available-balance {
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
  }
}

.account-section {
  margin-top: 30px;
  
  h4 {
    margin-bottom: 20px;
    color: #2c3e50;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 10px;
  }
}

.confirm-section {
  h4 {
    margin-bottom: 20px;
    color: #2c3e50;
  }
  
  .confirm-item {
    display: flex;
    margin-bottom: 15px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
    .label {
      min-width: 120px;
      color: #666;
      font-weight: 500;
    }
    
    .value {
      flex: 1;
      color: #2c3e50;
    }
  }
  
  .warning-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff7e6;
    border: 1px solid #ffd591;
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
    
    .el-icon {
      color: #fa8c16;
      font-size: 18px;
    }
    
    p {
      margin: 0;
      color: #d46b08;
    }
  }
}

.success-content {
  text-align: center;
  padding: 40px 0;
  
  .success-icon {
    font-size: 64px;
    color: #67c23a;
    margin-bottom: 20px;
  }
  
  h3 {
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  p {
    color: #666;
    margin: 8px 0;
    line-height: 1.6;
  }
}

.dialog-footer {
  text-align: center;
}
</style> 