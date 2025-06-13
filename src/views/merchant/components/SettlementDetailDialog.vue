<template>
  <el-dialog
    v-model="dialogVisible"
    title="结算详情"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="record" class="settlement-detail">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>结算时间</label>
            <span>{{ formatTime(record.settlementTime) }}</span>
          </div>
          <div class="info-item">
            <label>结算周期</label>
            <span>{{ record.period }}</span>
          </div>
          <div class="info-item">
            <label>结算金额</label>
            <span class="amount-positive">+${{ record.amount.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <label>结算状态</label>
            <el-tag type="success" size="small">已完成</el-tag>
          </div>
        </div>
      </div>

      <!-- 账户余额变化 -->
      <div class="info-section">
        <h3>账户余额变化</h3>
        <div class="balance-change">
          <div class="balance-item">
            <div class="balance-card before">
              <div class="balance-label">结算前余额</div>
              <div class="balance-value">${{ record.balanceBefore.toFixed(2) }}</div>
            </div>
          </div>
          
          <div class="balance-arrow">
            <el-icon><Right /></el-icon>
            <div class="change-amount">+${{ record.amount.toFixed(2) }}</div>
          </div>
          
          <div class="balance-item">
            <div class="balance-card after">
              <div class="balance-label">结算后余额</div>
              <div class="balance-value">${{ record.balanceAfter.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 佣金构成详情 -->
      <div class="info-section">
        <h3>佣金构成详情</h3>
        <div class="commission-breakdown">
          <div class="breakdown-summary">
            <div class="summary-item">
              <span class="label">一级佣金:</span>
              <span class="value">${{ getLevel1Commission().toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">二级佣金:</span>
              <span class="value">${{ getLevel2Commission().toFixed(2) }}</span>
            </div>
            <div class="summary-item total">
              <span class="label">总计:</span>
              <span class="value">${{ record.amount.toFixed(2) }}</span>
            </div>
          </div>
          
          <!-- 佣金明细列表 -->
          <div class="commission-details">
            <h4>本期佣金明细</h4>
            <div class="details-list">
              <div 
                v-for="detail in commissionDetails" 
                :key="detail.id"
                class="detail-item"
              >
                <div class="detail-info">
                  <div class="detail-source">{{ detail.source }}</div>
                  <div class="detail-meta">
                    <span class="time">{{ formatDate(detail.time) }}</span>
                    <el-tag :type="detail.level === 1 ? 'primary' : 'success'" size="small">
                      {{ detail.level === 1 ? '一级' : '二级' }}
                    </el-tag>
                  </div>
                </div>
                <div class="detail-amount">
                  ${{ detail.amount.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算说明 -->
      <div class="info-section">
        <h3>结算说明</h3>
        <div class="settlement-note">
          <div class="note-content">
            <p>{{ record.note || '本期佣金已按规则自动结算到您的账户余额中。' }}</p>
            <div class="note-details">
              <ul>
                <li>结算周期：每月1日自动结算上月佣金</li>
                <li>一级分佣比例：8%</li>
                <li>二级分佣比例：3%</li>
                <li>结算金额已扣除相关手续费</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="info-section">
        <h3>操作记录</h3>
        <div class="operation-log">
          <div class="log-item">
            <div class="log-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="log-content">
              <div class="log-title">佣金结算完成</div>
              <div class="log-time">{{ formatTime(record.settlementTime) }}</div>
            </div>
          </div>
          <div class="log-item">
            <div class="log-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="log-content">
              <div class="log-title">开始结算处理</div>
              <div class="log-time">{{ getProcessStartTime() }}</div>
            </div>
          </div>
          <div class="log-item">
            <div class="log-icon">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div class="log-content">
              <div class="log-title">佣金计算完成</div>
              <div class="log-time">{{ getCalculationTime() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="exportStatement">导出结算单</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Right, 
  CircleCheck, 
  Clock, 
  DocumentChecked 
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const dialogVisible = ref(false)

// 模拟佣金明细数据
const commissionDetails = ref([
  {
    id: 1,
    source: '订单 #OR202404280001',
    time: '2024-04-28 14:30:00',
    level: 1,
    amount: 45.60
  },
  {
    id: 2,
    source: '订单 #OR202404250002',
    time: '2024-04-25 16:45:00',
    level: 2,
    amount: 18.30
  },
  {
    id: 3,
    source: '订单 #OR202404220003',
    time: '2024-04-22 11:20:00',
    level: 1,
    amount: 67.90
  },
  {
    id: 4,
    source: '订单 #OR202404180004',
    time: '2024-04-18 09:15:00',
    level: 1,
    amount: 89.50
  },
  {
    id: 5,
    source: '订单 #OR202404150005',
    time: '2024-04-15 20:30:00',
    level: 2,
    amount: 25.80
  }
])

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const getLevel1Commission = () => {
  return commissionDetails.value
    .filter(detail => detail.level === 1)
    .reduce((sum, detail) => sum + detail.amount, 0)
}

const getLevel2Commission = () => {
  return commissionDetails.value
    .filter(detail => detail.level === 2)
    .reduce((sum, detail) => sum + detail.amount, 0)
}

const getProcessStartTime = () => {
  if (!props.record) return '-'
  // 假设处理开始时间比结算时间早5分钟
  const date = new Date(props.record.settlementTime)
  date.setMinutes(date.getMinutes() - 5)
  return formatTime(date.toISOString())
}

const getCalculationTime = () => {
  if (!props.record) return '-'
  // 假设计算完成时间比结算时间早2分钟
  const date = new Date(props.record.settlementTime)
  date.setMinutes(date.getMinutes() - 2)
  return formatTime(date.toISOString())
}

const exportStatement = () => {
  ElMessage.info('结算单导出功能开发中...')
}

// 监听器
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
  }
})
</script>

<style scoped>
.settlement-detail {
  max-height: 700px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.info-section:last-child {
  border-bottom: none;
}

.info-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.info-section h4 {
  margin: 16px 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

/* 基本信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.info-item span {
  font-size: 14px;
  color: #303133;
}

.amount-positive {
  color: #67c23a !important;
  font-weight: 600;
}

/* 余额变化 */
.balance-change {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.balance-item {
  flex: 1;
}

.balance-card {
  text-align: center;
  padding: 16px;
  border-radius: 6px;
  border: 2px solid transparent;
}

.balance-card.before {
  background: #fff7e6;
  border-color: #ffd666;
}

.balance-card.after {
  background: #f6ffed;
  border-color: #95de64;
}

.balance-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.balance-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.balance-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #67c23a;
  font-size: 24px;
}

.change-amount {
  font-size: 16px;
  font-weight: 600;
  color: #67c23a;
}

/* 佣金构成 */
.commission-breakdown {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.breakdown-summary {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item.total {
  border-top: 1px solid #e4e7ed;
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 600;
  font-size: 16px;
}

.summary-item .label {
  color: #606266;
}

.summary-item .value {
  color: #67c23a;
  font-weight: 600;
}

/* 佣金明细 */
.commission-details {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fafbfc;
  border-radius: 6px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-source {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-meta .time {
  font-size: 12px;
  color: #909399;
}

.detail-amount {
  font-size: 16px;
  font-weight: 600;
  color: #67c23a;
}

/* 结算说明 */
.settlement-note {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.note-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.note-details ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.note-details li {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 4px;
}

/* 操作记录 */
.operation-log {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.log-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #67c23a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .balance-change {
    flex-direction: column;
    gap: 12px;
  }
  
  .balance-arrow {
    transform: rotate(90deg);
  }
  
  .commission-breakdown {
    gap: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .log-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    text-align: left;
  }
  
  .dialog-footer {
    flex-direction: column;
  }
}
</style> 