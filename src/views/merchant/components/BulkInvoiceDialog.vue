<template>
  <el-dialog
    v-model="visible"
    title="批量开具Invoice"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <div class="steps-wrapper">
      <el-steps :active="currentStep" align-center>
        <el-step title="选择发票类型" />
        <el-step title="填写发票信息" />
        <el-step title="完成" />
      </el-steps>
    </div>

    <!-- 步骤1：选择发票类型 -->
    <div v-if="currentStep === 0" class="step-content">
      <h3>选择发票类型</h3>
      <p class="tip">请选择要开具的发票类型</p>
      
      <div class="invoice-type-selection">
        <el-radio-group v-model="invoiceForm.type" size="large">
          <el-radio-button label="individual">
            <div class="radio-content">
              <el-icon><User /></el-icon>
              <span>个人</span>
            </div>
          </el-radio-button>
          <el-radio-button label="enterprise">
            <div class="radio-content">
              <el-icon><OfficeBuilding /></el-icon>
              <span>企业</span>
            </div>
          </el-radio-button>
        </el-radio-group>
      </div>



      <!-- 选中订单信息 -->
      <div class="selected-orders-info">
        <h4>已选择订单</h4>
        <div class="orders-summary">
          <el-tag type="primary">{{ selectedOrders.length }} 个订单</el-tag>
          <span class="total-amount">总金额: ${{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="orders-list">
          <div v-for="order in selectedOrders.slice(0, 3)" :key="order.id" class="order-item">
            <span class="order-no">{{ order.orderNo }}</span>
            <span class="order-amount">${{ order.totalAmount.toFixed(2) }}</span>
          </div>
          <div v-if="selectedOrders.length > 3" class="more-orders">
            还有 {{ selectedOrders.length - 3 }} 个订单...
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤2：填写发票信息 -->
    <div v-if="currentStep === 1" class="step-content">
      <h3>填写发票信息</h3>
      
      <el-form
        ref="invoiceFormRef"
        :model="invoiceForm"
        :rules="formRules"
        label-width="140px"
        label-position="left"
      >
        <!-- 企业发票表单 -->
        <template v-if="invoiceForm.type === 'enterprise'">
          <el-form-item label="企业类型" prop="enterpriseType">
            <el-select v-model="invoiceForm.enterpriseType" placeholder="请选择企业类型" style="width: 100%">
              <el-option label="有限责任公司" value="limited_company" />
              <el-option label="股份有限公司" value="joint_stock_company" />
              <el-option label="个人独资企业" value="sole_proprietorship" />
              <el-option label="合伙企业" value="partnership" />
              <el-option label="外商投资企业" value="foreign_investment" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="invoiceForm.companyName" placeholder="请输入公司名称（发票抬头）" />
          </el-form-item>

          <el-form-item label="公司地址" prop="companyAddress">
            <el-input
              v-model="invoiceForm.companyAddress"
              type="textarea"
              :rows="3"
              placeholder="请输入公司详细地址"
            />
          </el-form-item>

          <el-form-item label="税号/VAT号" prop="taxNumber">
            <el-input v-model="invoiceForm.taxNumber" placeholder="请输入公司税号或VAT号" />
          </el-form-item>
        </template>

        <!-- 个人发票表单 -->
        <template v-else-if="invoiceForm.type === 'individual'">
          <el-form-item label="个人姓名" prop="individualName">
            <el-input v-model="invoiceForm.individualName" placeholder="请输入个人姓名（发票抬头）" />
          </el-form-item>

          <el-form-item label="收件地址" prop="individualEmail">
            <el-input v-model="invoiceForm.individualEmail" placeholder="请输入收件地址" />
          </el-form-item>
        </template>

        <!-- 通用字段 -->
        <!-- 联系人姓名字段仅在企业发票类型时显示 -->
        <el-form-item v-if="invoiceForm.type === 'enterprise'" label="联系人姓名" prop="contactName">
          <el-input v-model="invoiceForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>

        <el-form-item label="联系人邮箱" prop="contactEmail">
          <el-input v-model="invoiceForm.contactEmail" placeholder="请输入联系人邮箱" />
        </el-form-item>

        <el-form-item label="订单号" prop="orderNumbers">
          <el-input
            v-model="orderNumbersText"
            type="textarea"
            :rows="3"
            readonly
            placeholder="自动填充选中的订单号"
          />
        </el-form-item>

        <el-form-item label="订单金额" prop="orderAmount">
          <el-input v-model="orderAmountText" readonly>
            <template #prepend>$</template>
          </el-input>
        </el-form-item>

        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="invoiceForm.paymentMethod" placeholder="请选择付款方式" style="width: 100%">
            <el-option label="信用卡 (Credit Card)" value="credit_card" />
            <el-option label="PayPal" value="paypal" />
            <el-option label="银行卡 (Bank Card)" value="bank_card" />
            <el-option label="银行转账 (Bank Transfer)" value="bank_transfer" />
            <el-option label="支票 (Check)" value="check" />
            <el-option label="现金 (Cash)" value="cash" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤3：完成 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="success-content">
        <el-result
          icon="success"
          title="Invoice申请提交成功"
          sub-title="您的批量Invoice申请已提交，我们将在1-3个工作日内处理完成"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <!-- 步骤1和步骤2的按钮 -->
        <template v-if="currentStep < 2">
          <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
          <el-button @click="handleClose">取消</el-button>
          <el-button
            v-if="currentStep === 0"
            type="primary"
            :disabled="!invoiceForm.type"
            @click="nextStep"
          >
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 1"
            type="primary"
            :loading="submitting"
            @click="submitInvoice"
          >
            提交申请
          </el-button>
        </template>

        <!-- 步骤3（成功页面）的按钮 -->
        <template v-if="currentStep === 2">
          <el-button @click="handleClose">关闭</el-button>
          <el-button type="primary" @click="viewInvoiceRecords">查看Invoice记录</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedOrders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const visible = ref(false)
const currentStep = ref(0)
const submitting = ref(false)
const invoiceFormRef = ref()

// 发票表单数据
const invoiceForm = reactive({
  type: '', // 'individual' | 'enterprise'
  // 企业字段
  enterpriseType: '',
  companyName: '',
  companyAddress: '',
  taxNumber: '',
  // 个人字段
  individualName: '',
  individualEmail: '',
  // 通用字段
  contactName: '',
  contactEmail: '',
  paymentMethod: ''
})

// 计算属性
const totalAmount = computed(() => {
  return props.selectedOrders.reduce((total, order) => total + (order.totalAmount || 0), 0)
})

const orderNumbersText = computed(() => {
  return props.selectedOrders.map(order => order.orderNo).join(', ')
})

const orderAmountText = computed(() => {
  return totalAmount.value.toFixed(2)
})

// 表单验证规则 - 移除所有验证，允许用户随意填写
const formRules = computed(() => {
  return {}
})

// 监听外部visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetDialog()
  }
})



// 监听内部visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const resetDialog = () => {
  currentStep.value = 0
  submitting.value = false
  
  // 重置表单
  Object.assign(invoiceForm, {
    type: '',
    enterpriseType: '',
    companyName: '',
    companyAddress: '',
    taxNumber: '',
    individualName: '',
    individualEmail: '',
    contactName: '',
    contactEmail: '',
    paymentMethod: ''
  })
}

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitInvoice = async () => {
  try {
    console.log('=== 开始表单验证 ===')
    console.log('发票类型:', invoiceForm.type)
    console.log('当前表单数据:', JSON.stringify(invoiceForm, null, 2))
    console.log('当前验证规则:', formRules.value)

    // 跳过所有验证，直接提交

    console.log('=== 表单验证通过，开始提交 ===')
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    const invoiceData = {
      type: invoiceForm.type,
      orders: props.selectedOrders,
      totalAmount: totalAmount.value,
      ...invoiceForm
    }

    console.log('提交的Invoice数据:', invoiceData)

    currentStep.value = 2
    emit('success', invoiceData)

    ElMessage.success('批量Invoice申请提交成功')
  } catch (error) {
    ElMessage.error('提交失败，请重试')
    console.error('Submit error:', error)
  } finally {
    submitting.value = false
  }
}

const viewInvoiceRecords = () => {
  ElMessage.info('正在跳转到Invoice记录页面...')
  handleClose()
  // 可以通过路由跳转到Invoice管理页面
  // router.push('/merchant/invoices')
  // 这里可以添加实际的路由跳转逻辑
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.steps-wrapper {
  margin-bottom: 30px;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;

  h3 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }

  .tip {
    margin: 0 0 20px 0;
    color: #606266;
    font-size: 14px;
  }
}

.invoice-type-selection {
  margin-bottom: 30px;

  :deep(.el-radio-group) {
    display: flex;
    gap: 20px;
  }

  :deep(.el-radio-button) {
    flex: 1;
    
    .el-radio-button__inner {
      width: 100%;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 2px solid #dcdfe6;
      background: #fff;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background: #f0f9ff;
      }
    }

    &.is-active .el-radio-button__inner {
      border-color: #409eff;
      background: #409eff;
      color: #fff;
    }
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 24px;
    }

    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.selected-orders-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;

  h4 {
    margin: 0 0 15px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }

  .orders-summary {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;

    .total-amount {
      font-weight: 600;
      color: #67c23a;
      font-size: 16px;
    }
  }

  .orders-list {
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .order-no {
        color: #409eff;
        font-weight: 500;
      }

      .order-amount {
        color: #67c23a;
        font-weight: 600;
      }
    }

    .more-orders {
      padding: 8px 0;
      color: #909399;
      font-style: italic;
      text-align: center;
    }
  }
}

.success-content {
  text-align: center;
  padding: 20px;
}

.dialog-footer {
  display: flex !important;
  justify-content: flex-end !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 15px 0 !important;
  border-top: 1px solid #ebeef5 !important;
  margin-top: 20px !important;
}

.dialog-footer .el-button {
  min-width: 80px !important;
  height: 36px !important;
  font-size: 14px !important;
  border-radius: 4px !important;
}

.dialog-footer .el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
}

.dialog-footer .el-button--primary:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

.dialog-footer .el-button--primary:disabled {
  background-color: #a0cfff !important;
  border-color: #a0cfff !important;
  color: #fff !important;
  cursor: not-allowed !important;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-textarea__inner) {
  resize: none;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px !important;
  background: #fff !important;
  border-top: 1px solid #ebeef5 !important;
}

:deep(.el-dialog__body) {
  padding: 20px !important;
}
</style>
