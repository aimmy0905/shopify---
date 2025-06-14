<template>
  <el-dialog
    v-model="dialogVisible"
    title="供应商审核"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="audit-modal">
      <!-- 供应商基本信息概要 -->
      <div class="supplier-summary">
        <h4>供应商基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>供应商名称：</label>
            <span>{{ supplier?.name || '-' }}</span>
          </div>
          <div class="info-item">
            <label>联系人：</label>
            <span>{{ supplier?.contactPerson || '-' }}</span>
          </div>
          <div class="info-item">
            <label>联系方式：</label>
            <span>{{ supplier?.contactInfo || '-' }}</span>
          </div>
          <div class="info-item">
            <label>供应商类型：</label>
            <span>{{ getTypeText(supplier?.type) }}</span>
          </div>
          <div class="info-item full-width">
            <label>备注信息：</label>
            <span>{{ supplier?.remark || '无' }}</span>
          </div>
        </div>
      </div>

      <!-- 审核操作区域 -->
      <div class="audit-section">
        <h4>审核操作</h4>
        <el-form 
          :model="auditForm" 
          :rules="auditRules" 
          ref="auditFormRef"
          label-width="100px"
        >
          <!-- 审核结果选择 -->
          <el-form-item label="审核结果" prop="result">
            <el-radio-group v-model="auditForm.result" @change="handleResultChange">
              <el-radio value="approved">
                <el-icon class="success-icon"><check /></el-icon>
                通过
              </el-radio>
              <el-radio value="rejected">
                <el-icon class="danger-icon"><close /></el-icon>
                不通过
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 审核备注 -->
          <el-form-item 
            :label="auditForm.result === 'rejected' ? '拒绝原因' : '审核备注'"
            prop="remark"
          >
            <el-input
              v-model="auditForm.remark"
              type="textarea"
              :rows="4"
              :placeholder="auditForm.result === 'rejected' ? '请详细说明拒绝原因，以便供应商完善资料' : '可填写审核备注信息（选填）'"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 通过时的额外设置 -->
          <template v-if="auditForm.result === 'approved'">
            <el-form-item label="合作等级">
              <el-select v-model="auditForm.cooperationLevel" placeholder="请选择合作等级">
                <el-option label="普通供应商" value="normal" />
                <el-option label="优质供应商" value="premium" />
                <el-option label="战略合作伙伴" value="strategic" />
              </el-select>
            </el-form-item>

            <el-form-item label="结算周期">
              <el-select v-model="auditForm.settlementCycle" placeholder="请选择结算周期">
                <el-option label="月结" value="monthly" />
                <el-option label="周结" value="weekly" />
                <el-option label="现结" value="immediate" />
              </el-select>
            </el-form-item>
          </template>
        </el-form>
      </div>

      <!-- 审核历史记录 -->
      <div v-if="auditHistory.length > 0" class="audit-history">
        <h4>审核历史</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in auditHistory"
            :key="index"
            :timestamp="formatDate(record.auditTime)"
            :type="getHistoryType(record.result)"
          >
            <div class="history-item">
              <div class="history-header">
                <span class="auditor">{{ record.auditor }}</span>
                <el-tag :type="getHistoryTagType(record.result)" size="small">
                  {{ getHistoryText(record.result) }}
                </el-tag>
              </div>
              <p class="history-remark" v-if="record.remark">{{ record.remark }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button type="info" @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :loading="submitting"
          :disabled="!auditForm.result"
        >
          确认审核
        </el-button>
        <el-button 
          type="success" 
          @click="handleComplete"
          :disabled="!auditForm.result"
        >
          完成
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  supplier: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])

// 响应式数据
const auditFormRef = ref()
const submitting = ref(false)

// 审核表单
const auditForm = reactive({
  result: '', // approved | rejected
  remark: '',
  cooperationLevel: 'normal',
  settlementCycle: 'monthly'
})

// 表单验证规则
const auditRules = {
  result: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  remark: [
    { 
      validator: (rule, value, callback) => {
        if (auditForm.result === 'rejected' && !value) {
          callback(new Error('拒绝时必须填写拒绝原因'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 模拟审核历史数据
const auditHistory = ref([
  {
    auditor: '张三',
    result: 'pending',
    remark: '供应商提交了初始申请',
    auditTime: '2024-01-13 14:30:00'
  }
])

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 方法定义
const handleResultChange = () => {
  // 重置备注内容
  auditForm.remark = ''
}

const handleConfirm = async () => {
  try {
    // 表单验证
    await auditFormRef.value.validate()
    
    submitting.value = true
    
    // 构造审核数据
    const auditData = {
      supplierId: props.supplier.id,
      result: auditForm.result,
      remark: auditForm.remark,
      cooperationLevel: auditForm.result === 'approved' ? auditForm.cooperationLevel : null,
      settlementCycle: auditForm.result === 'approved' ? auditForm.settlementCycle : null
    }
    
    // 发送审核结果
    emit('confirm', auditData)
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleComplete = () => {
  // 验证表单
  auditFormRef.value.validate().then(() => {
    // 构造审核数据
    const auditData = {
      supplierId: props.supplier.id,
      result: auditForm.result,
      remark: auditForm.remark,
      cooperationLevel: auditForm.result === 'approved' ? auditForm.cooperationLevel : null,
      settlementCycle: auditForm.result === 'approved' ? auditForm.settlementCycle : null,
      isCompleted: true
    }
    
    // 发送审核结果并关闭弹窗
    emit('confirm', auditData)
    emit('update:visible', false)
    ElMessage.success('审核已完成')
  }).catch(error => {
    console.error('表单验证失败:', error)
  })
}

const resetForm = () => {
  auditForm.result = ''
  auditForm.remark = ''
  auditForm.cooperationLevel = 'normal'
  auditForm.settlementCycle = 'monthly'
  
  if (auditFormRef.value) {
    auditFormRef.value.clearValidate()
  }
}

// 辅助方法
const getTypeText = (type) => {
  const textMap = {
    domestic: '国内供应商',
    overseas: '海外供应商',
    brand: '品牌方',
    agent: '代理商'
  }
  return textMap[type] || '未知'
}

const getHistoryType = (result) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'info'
  }
  return typeMap[result] || 'info'
}

const getHistoryTagType = (result) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return typeMap[result] || 'info'
}

const getHistoryText = (result) => {
  const textMap = {
    approved: '审核通过',
    rejected: '审核不通过',
    pending: '待审核'
  }
  return textMap[result] || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.audit-modal {
  .supplier-summary {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    h4 {
      margin: 0 0 16px 0;
      color: #303133;
      font-size: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      .info-item {
        display: flex;
        align-items: center;

        label {
          font-weight: 500;
          color: #606266;
          margin-right: 8px;
          min-width: 80px;
        }

        span {
          color: #303133;
        }

        &.full-width {
          grid-column: 1 / -1;
          align-items: flex-start;

          label {
            margin-top: 2px;
          }
        }
      }
    }
  }

  .audit-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 16px 0;
      color: #303133;
      font-size: 16px;
    }

    .el-radio {
      display: flex;
      align-items: center;
      margin-right: 24px;

      .success-icon {
        color: #67c23a;
        margin-right: 4px;
      }

      .danger-icon {
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }

  .audit-history {
    h4 {
      margin: 0 0 16px 0;
      color: #303133;
      font-size: 16px;
    }

    .history-item {
      .history-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .auditor {
          font-weight: 500;
          color: #303133;
        }
      }

      .history-remark {
        margin: 0;
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  .el-dialog__header {
    padding: 20px 20px 0;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 0 20px 20px;
    border-top: 1px solid #ebeef5;
    margin-top: 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .audit-modal {
    .supplier-summary {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style> 