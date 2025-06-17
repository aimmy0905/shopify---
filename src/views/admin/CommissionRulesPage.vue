<template>
  <div class="commission-rules-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">分佣规则配置</h1>
        <p class="page-description">配置平台分佣比例、结算规则和通知设置</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="saveAllRules" :loading="saving">
          <el-icon><Check /></el-icon>
          保存所有配置
        </el-button>
        <el-button @click="resetAllRules">
          <el-icon><Refresh /></el-icon>
          重置配置
        </el-button>
      </div>
    </div>

    <!-- 规则配置区域 -->
    <div class="rules-container">
      <!-- 分佣比例配置 -->
      <el-card class="rule-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">分佣比例配置</span>
            <el-tag type="primary">核心设置</el-tag>
          </div>
        </template>
        
        <el-form :model="rulesForm" :rules="rulesRules" ref="rulesFormRef" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="一级分佣比例" prop="firstLevelRate">
                <el-input-number
                  v-model="rulesForm.firstLevelRate"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  :precision="1"
                  style="width: 200px"
                />
                <span class="form-tip">%（直接推荐人获得的佣金比例）</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="二级分佣比例" prop="secondLevelRate">
                <el-input-number
                  v-model="rulesForm.secondLevelRate"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  :precision="1"
                  style="width: 200px"
                />
                <span class="form-tip">%（间接推荐人获得的佣金比例）</span>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最低结算金额" prop="minSettlementAmount">
                <el-input-number
                  v-model="rulesForm.minSettlementAmount"
                  :min="0"
                  :step="1"
                  :precision="2"
                  style="width: 200px"
                />
                <span class="form-tip">USD（低于此金额不进行结算）</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大分佣层级" prop="maxReferralLevels">
                <el-select v-model="rulesForm.maxReferralLevels" style="width: 200px">
                  <el-option label="1级" :value="1" />
                  <el-option label="2级" :value="2" />
                  <el-option label="3级" :value="3" />
                  <el-option label="4级" :value="4" />
                  <el-option label="5级" :value="5" />
                </el-select>
                <span class="form-tip">设置最大分佣层级深度</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 自动结算配置 -->
      <el-card class="rule-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">自动结算配置</span>
            <el-switch v-model="rulesForm.autoSettlementEnabled" />
          </div>
        </template>
        
        <div v-if="rulesForm.autoSettlementEnabled" class="settlement-config">
          <el-form :model="rulesForm" label-width="150px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="结算周期" prop="settlementCycle">
                  <el-select v-model="rulesForm.settlementCycle" style="width: 200px">
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                    <el-option label="每季度" value="quarterly" />
                    <el-option label="每年" value="yearly" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结算日期" prop="settlementDay">
                  <el-input-number
                    v-model="rulesForm.settlementDay"
                    :min="1"
                    :max="31"
                    style="width: 200px"
                  />
                  <span class="form-tip">日（每月的结算日期）</span>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="结算时间" prop="settlementTime">
                  <el-time-picker
                    v-model="rulesForm.settlementTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    style="width: 200px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="自动重试次数">
                  <el-input-number
                    v-model="rulesForm.retryTimes"
                    :min="0"
                    :max="10"
                    style="width: 200px"
                  />
                  <span class="form-tip">次（结算失败时的重试次数）</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        
        <div v-else class="disabled-notice">
          <el-alert
            title="自动结算已禁用"
            description="启用自动结算后，系统将按设定周期自动处理佣金结算"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
      </el-card>

      <!-- 通知设置 -->
      <el-card class="rule-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">通知设置</span>
            <el-tag type="success">用户体验</el-tag>
          </div>
        </template>
        
        <el-form :model="rulesForm" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="邮件通知">
                <el-switch v-model="rulesForm.emailNotificationEnabled" />
                <div class="form-tip">结算完成后发送邮件通知用户</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="系统消息通知">
                <el-switch v-model="rulesForm.systemNotificationEnabled" />
                <div class="form-tip">结算完成后发送系统内消息通知</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="短信通知">
                <el-switch v-model="rulesForm.smsNotificationEnabled" />
                <div class="form-tip">结算完成后发送短信通知</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 高级设置 -->
      <el-card class="rule-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">高级设置</span>
            <el-tag type="warning">专业配置</el-tag>
          </div>
        </template>
        
        <el-form :model="rulesForm" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="佣金有效期" prop="commissionValidDays">
                <el-input-number
                  v-model="rulesForm.commissionValidDays"
                  :min="1"
                  :max="365"
                  style="width: 200px"
                />
                <span class="form-tip">天（佣金产生后的有效期）</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="新用户保护期" prop="newUserProtectionDays">
                <el-input-number
                  v-model="rulesForm.newUserProtectionDays"
                  :min="0"
                  :max="90"
                  style="width: 200px"
                />
                <span class="form-tip">天（新用户注册后的保护期）</span>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="佣金冻结期">
                <el-input-number
                  v-model="rulesForm.commissionFreezeDays"
                  :min="0"
                  :max="30"
                  style="width: 200px"
                />
                <span class="form-tip">天（佣金产生后的冻结期）</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大月结算额">
                <el-input-number
                  v-model="rulesForm.maxMonthlySettlement"
                  :min="0"
                  :step="1000"
                  style="width: 200px"
                />
                <span class="form-tip">USD（单用户月度最大结算金额）</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 规则预览 -->
      <el-card class="rule-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">规则预览</span>
            <el-button size="small" @click="refreshPreview">
              <el-icon><Refresh /></el-icon>
              刷新预览
            </el-button>
          </div>
        </template>
        
        <div class="preview-content">
          <div class="preview-section">
            <h4>分佣计算示例</h4>
            <div class="example-calculation">
              <p>假设用户A推荐用户B，用户B推荐用户C：</p>
              <div class="calculation-steps">
                <div class="step">
                  <span class="step-label">当用户C产生$100订单时：</span>
                </div>
                <div class="step">
                  <span class="step-user">用户B（一级推荐人）</span>
                  <span class="step-amount">获得佣金：${{ (100 * rulesForm.firstLevelRate / 100).toFixed(2) }}</span>
                </div>
                <div class="step">
                  <span class="step-user">用户A（二级推荐人）</span>
                  <span class="step-amount">获得佣金：${{ (100 * rulesForm.secondLevelRate / 100).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="preview-section">
            <h4>当前规则摘要</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="一级分佣比例">{{ rulesForm.firstLevelRate }}%</el-descriptions-item>
              <el-descriptions-item label="二级分佣比例">{{ rulesForm.secondLevelRate }}%</el-descriptions-item>
              <el-descriptions-item label="最低结算金额">${{ rulesForm.minSettlementAmount }}</el-descriptions-item>
              <el-descriptions-item label="最大分佣层级">{{ rulesForm.maxReferralLevels }}级</el-descriptions-item>
              <el-descriptions-item label="自动结算">{{ rulesForm.autoSettlementEnabled ? '已启用' : '已禁用' }}</el-descriptions-item>
              <el-descriptions-item label="结算周期">{{ settlementCycleText }}</el-descriptions-item>
              <el-descriptions-item label="佣金有效期">{{ rulesForm.commissionValidDays }}天</el-descriptions-item>
              <el-descriptions-item label="新用户保护期">{{ rulesForm.newUserProtectionDays }}天</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const rulesFormRef = ref()
const saving = ref(false)

// 表单数据
const rulesForm = reactive({
  firstLevelRate: 5.0,
  secondLevelRate: 2.0,
  minSettlementAmount: 10.00,
  maxReferralLevels: 2,
  autoSettlementEnabled: true,
  settlementCycle: 'monthly',
  settlementDay: 1,
  settlementTime: '10:00',
  retryTimes: 3,
  emailNotificationEnabled: true,
  systemNotificationEnabled: true,
  smsNotificationEnabled: false,
  commissionValidDays: 365,
  newUserProtectionDays: 30,
  commissionFreezeDays: 7,
  maxMonthlySettlement: 10000
})

// 表单验证规则
const rulesRules = {
  firstLevelRate: [
    { required: true, message: '请输入一级分佣比例', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '比例必须在0-100之间', trigger: 'blur' }
  ],
  secondLevelRate: [
    { required: true, message: '请输入二级分佣比例', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '比例必须在0-100之间', trigger: 'blur' }
  ],
  minSettlementAmount: [
    { required: true, message: '请输入最低结算金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额必须大于0', trigger: 'blur' }
  ],
  commissionValidDays: [
    { required: true, message: '请输入佣金有效期', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '有效期必须在1-365天之间', trigger: 'blur' }
  ],
  newUserProtectionDays: [
    { required: true, message: '请输入新用户保护期', trigger: 'blur' },
    { type: 'number', min: 0, max: 90, message: '保护期必须在0-90天之间', trigger: 'blur' }
  ]
}

// 计算属性
const settlementCycleText = computed(() => {
  const cycleMap = {
    weekly: '每周',
    monthly: '每月',
    quarterly: '每季度',
    yearly: '每年'
  }
  return cycleMap[rulesForm.settlementCycle] || '每月'
})

// 方法
const saveAllRules = async () => {
  if (!rulesFormRef.value) return
  
  try {
    await rulesFormRef.value.validate()
    
    saving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('分佣规则配置保存成功')
  } catch (error) {
    console.log('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

const resetAllRules = () => {
  Object.assign(rulesForm, {
    firstLevelRate: 5.0,
    secondLevelRate: 2.0,
    minSettlementAmount: 10.00,
    maxReferralLevels: 2,
    autoSettlementEnabled: true,
    settlementCycle: 'monthly',
    settlementDay: 1,
    settlementTime: '10:00',
    retryTimes: 3,
    emailNotificationEnabled: true,
    systemNotificationEnabled: true,
    smsNotificationEnabled: false,
    commissionValidDays: 365,
    newUserProtectionDays: 30,
    commissionFreezeDays: 7,
    maxMonthlySettlement: 10000
  })
  
  if (rulesFormRef.value) {
    rulesFormRef.value.clearValidate()
  }
  
  ElMessage.success('配置已重置为默认值')
}

const refreshPreview = () => {
  ElMessage.success('预览已刷新')
}

// 生命周期
onMounted(() => {
  console.log('分佣规则页面已加载')
})
</script>

<style scoped>
.commission-rules-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left .page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 700;
}

.header-left .page-description {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.header-right {
  display: flex;
  gap: 16px;
}

/* 规则容器 */
.rules-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.rule-section {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
}

/* 表单样式 */
.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
  display: block;
  margin-top: 4px;
}

.settlement-config {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 16px;
}

.disabled-notice {
  padding: 16px;
}

/* 预览内容 */
.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.example-calculation {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.example-calculation p {
  margin: 0 0 16px 0;
  color: #303133;
  font-weight: 500;
}

.calculation-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
}

.step-label {
  color: #606266;
  font-weight: 500;
}

.step-user {
  color: #303133;
  font-weight: 500;
}

.step-amount {
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-rules-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .preview-content {
    gap: 16px;
  }
  
  .step {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
