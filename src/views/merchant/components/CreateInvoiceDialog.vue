<template>
  <el-dialog
    v-model="visible"
    title="申请开具Invoice"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" align-center class="steps-container">
      <el-step title="选择订单" />
      <el-step title="填写信息" />
      <el-step title="完成" />
    </el-steps>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1：选择订单 -->
      <div v-show="currentStep === 0" class="step-panel">
        <div class="search-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-input
                v-model="orderSearch.keyword"
                placeholder="请输入订单号"
                clearable
                @keyup.enter="searchOrders"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-date-picker
                v-model="orderSearch.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="searchOrders"
              />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="searchOrders">搜索</el-button>
            </el-col>
          </el-row>
        </div>

        <div class="orders-table">
          <el-table
            v-loading="orderLoading"
            :data="orderList"
            @selection-change="handleOrderSelection"
            max-height="300"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="orderNo" label="订单号" width="140" />
            <el-table-column prop="customerName" label="客户名称" width="120" />
            <el-table-column label="订单金额" width="100">
              <template #default="{ row }">
                ${{ row.amount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间" width="140">
              <template #default="{ row }">
                {{ formatDateTime(row.orderTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag type="success">已完成</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="selected-summary">
          <el-card>
            <div class="summary-content">
              <span>已选择订单：{{ selectedOrders.length }} 个</span>
              <span class="total-amount">总金额：${{ selectedOrdersTotal.toFixed(2) }}</span>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 步骤2：填写信息 -->
      <div v-show="currentStep === 1" class="step-panel">
        <el-form
          ref="invoiceFormRef"
          :model="invoiceForm"
          :rules="invoiceFormRules"
          label-width="120px"
        >
          <el-form-item label="开票金额" prop="amount">
            <el-input-number
              v-model="invoiceForm.amount"
              :precision="2"
              :min="0"
              style="width: 200px"
            />
            <span class="form-tip">（根据所选订单自动计算）</span>
          </el-form-item>

          <el-form-item label="收件人姓名" prop="recipientName">
            <el-input
              v-model="invoiceForm.recipientName"
              placeholder="请输入收件人姓名"
              style="width: 300px"
            />
          </el-form-item>

          <el-form-item label="联系方式" prop="phone">
            <el-input
              v-model="invoiceForm.phone"
              placeholder="请输入联系电话"
              style="width: 300px"
            />
          </el-form-item>

          <el-form-item label="邮寄地址" prop="address">
            <el-input
              v-model="invoiceForm.address"
              type="textarea"
              :rows="3"
              placeholder="请输入详细的邮寄地址"
              style="width: 400px"
            />
          </el-form-item>

          <el-form-item label="备注信息">
            <el-input
              v-model="invoiceForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="选填，如特殊要求等"
              style="width: 400px"
            />
          </el-form-item>
        </el-form>

        <div class="selected-orders-preview">
          <h4>已选择订单列表</h4>
          <el-table :data="selectedOrders" size="small">
            <el-table-column prop="orderNo" label="订单号" width="140" />
            <el-table-column label="订单金额" width="100">
              <template #default="{ row }">
                ${{ row.amount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
              <template #default="{ row }">
                {{ formatDate(row.orderTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 步骤3：完成 -->
      <div v-show="currentStep === 2" class="step-panel">
        <div class="success-content">
          <el-result icon="success" title="申请提交成功">
            <template #sub-title>
              <p>您的Invoice申请已成功提交，工作人员将尽快处理。</p>
              <p>您可以在Invoice记录页面查看申请状态。</p>
            </template>
          </el-result>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="currentStep > 0 && currentStep < 2" @click="prevStep">
          上一步
        </el-button>
        <el-button v-if="currentStep < 1" type="primary" @click="nextStep" :disabled="selectedOrders.length === 0">
          下一步
        </el-button>
        <el-button v-if="currentStep === 1" type="primary" @click="submitApplication" :loading="submitting">
          提交申请
        </el-button>
        <el-button v-if="currentStep === 2" type="primary" @click="viewInvoiceRecords">
          查看Invoice记录
        </el-button>
        <el-button v-if="currentStep === 2" @click="handleClose">
          关闭
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatDateTime, formatDate } from '@/utils/format'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const visible = ref(false)
const currentStep = ref(0)
const orderLoading = ref(false)
const submitting = ref(false)
const orderList = ref([])
const selectedOrders = ref([])
const invoiceFormRef = ref()

// 搜索表单
const orderSearch = reactive({
  keyword: '',
  dateRange: []
})

// Invoice表单
const invoiceForm = reactive({
  amount: 0,
  recipientName: '',
  phone: '',
  address: '',
  remarks: ''
})

// 表单验证规则
const invoiceFormRules = {
  amount: [
    { required: true, message: '请输入开票金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  recipientName: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入邮寄地址', trigger: 'blur' }
  ]
}

// 计算属性
const selectedOrdersTotal = computed(() => {
  return selectedOrders.value.reduce((total, order) => total + order.amount, 0)
})

// 监听外部visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetDialog()
    loadOrders()
  }
})

// 监听内部visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 监听选中订单变化，更新金额
watch(selectedOrdersTotal, (total) => {
  invoiceForm.amount = total
})

// 重置弹窗
const resetDialog = () => {
  currentStep.value = 0
  selectedOrders.value = []
  Object.assign(orderSearch, {
    keyword: '',
    dateRange: []
  })
  Object.assign(invoiceForm, {
    amount: 0,
    recipientName: '',
    phone: '',
    address: '',
    remarks: ''
  })
}

// 加载订单列表
const loadOrders = async () => {
  orderLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据 - 只显示已完成的订单
    const mockOrders = [
      {
        id: 1,
        orderNo: 'ORD-2024-001',
        customerName: 'John Smith',
        amount: 500.00,
        orderTime: '2024-01-10 09:15:00',
        status: 'completed'
      },
      {
        id: 2,
        orderNo: 'ORD-2024-002',
        customerName: 'Jane Doe',
        amount: 750.00,
        orderTime: '2024-01-12 14:20:00',
        status: 'completed'
      },
      {
        id: 3,
        orderNo: 'ORD-2024-003',
        customerName: 'Mike Johnson',
        amount: 300.00,
        orderTime: '2024-01-18 11:30:00',
        status: 'completed'
      },
      {
        id: 4,
        orderNo: 'ORD-2024-004',
        customerName: 'Sarah Wilson',
        amount: 420.00,
        orderTime: '2024-01-19 16:45:00',
        status: 'completed'
      }
    ]
    
    orderList.value = mockOrders
  } catch (error) {
    ElMessage.error('加载订单失败')
    console.error('Error loading orders:', error)
  } finally {
    orderLoading.value = false
  }
}

// 搜索订单
const searchOrders = () => {
  loadOrders()
}

// 处理订单选择
const handleOrderSelection = (selection) => {
  selectedOrders.value = selection
}

// 下一步
const nextStep = () => {
  if (currentStep.value === 0) {
    if (selectedOrders.value.length === 0) {
      ElMessage.warning('请选择至少一个订单')
      return
    }
  }
  currentStep.value++
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 提交申请
const submitApplication = async () => {
  try {
    await invoiceFormRef.value.validate()
    
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const applicationData = {
      orders: selectedOrders.value,
      amount: invoiceForm.amount,
      recipientInfo: {
        name: invoiceForm.recipientName,
        phone: invoiceForm.phone,
        address: invoiceForm.address
      },
      remarks: invoiceForm.remarks
    }
    
    console.log('Submitting invoice application:', applicationData)
    
    currentStep.value = 2
    emit('success')
  } catch (error) {
    if (error !== false) { // 表单验证失败时不显示错误信息
      ElMessage.error('提交失败，请重试')
      console.error('Submit error:', error)
    }
  } finally {
    submitting.value = false
  }
}

// 查看Invoice记录
const viewInvoiceRecords = () => {
  handleClose()
  // 父组件会自动刷新列表
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.steps-container {
  margin-bottom: 30px;
}

.step-content {
  min-height: 400px;
  
  .step-panel {
    .search-section {
      margin-bottom: 20px;
    }

    .orders-table {
      margin-bottom: 20px;
    }

    .selected-summary {
      .summary-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .total-amount {
          font-weight: 600;
          color: #67C23A;
          font-size: 16px;
        }
      }
    }

    .form-tip {
      margin-left: 10px;
      color: #909399;
      font-size: 12px;
    }

    .selected-orders-preview {
      margin-top: 30px;
      
      h4 {
        margin-bottom: 15px;
        color: #303133;
      }
    }

    .success-content {
      text-align: center;
      padding: 40px 0;
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style> 