<template>
  <div class="commission-rules">
    <div class="rules-header">
      <h3>分佣结算规则设置</h3>
      <p>配置平台分佣比例和结算规则</p>
    </div>

    <el-form :model="rulesForm" :rules="rulesRules" ref="rulesFormRef" label-width="150px">
      <!-- 分佣比例设置 -->
      <el-card class="rule-card">
        <template #header>
          <span class="card-title">分佣比例设置</span>
        </template>
        
        <el-form-item label="一级分佣比例" prop="firstLevelRate">
          <el-input-number
            v-model="rulesForm.firstLevelRate"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="1"
            style="width: 200px"
          />
          <span class="form-tip">%（推荐人直接获得的佣金比例）</span>
        </el-form-item>
        
        <el-form-item label="二级分佣比例" prop="secondLevelRate">
          <el-input-number
            v-model="rulesForm.secondLevelRate"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="1"
            style="width: 200px"
          />
          <span class="form-tip">%（推荐人的推荐人获得的佣金比例）</span>
        </el-form-item>
        
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
      </el-card>

      <!-- 自动结算设置 -->
      <el-card class="rule-card">
        <template #header>
          <span class="card-title">自动结算设置</span>
        </template>
        
        <el-form-item label="启用自动结算">
          <el-switch v-model="rulesForm.autoSettlementEnabled" />
          <span class="form-tip">开启后系统将按设定周期自动结算佣金</span>
        </el-form-item>
        
        <div v-if="rulesForm.autoSettlementEnabled" class="auto-settlement-settings">
          <el-form-item label="结算周期" prop="settlementCycle">
            <el-select v-model="rulesForm.settlementCycle" style="width: 200px">
              <el-option label="每月" value="monthly" />
              <el-option label="每季度" value="quarterly" />
              <el-option label="每年" value="yearly" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="结算日期" prop="settlementDay">
            <el-input-number
              v-model="rulesForm.settlementDay"
              :min="1"
              :max="31"
              style="width: 200px"
            />
            <span class="form-tip">日（每月的结算日期）</span>
          </el-form-item>
        </div>
      </el-card>

      <!-- 通知设置 -->
      <el-card class="rule-card">
        <template #header>
          <span class="card-title">结算通知设置</span>
        </template>
        
        <el-form-item label="发送邮件通知">
          <el-switch v-model="rulesForm.emailNotificationEnabled" />
          <span class="form-tip">结算完成后发送邮件通知用户</span>
        </el-form-item>
        
        <el-form-item label="系统消息通知">
          <el-switch v-model="rulesForm.systemNotificationEnabled" />
          <span class="form-tip">结算完成后发送系统内消息通知</span>
        </el-form-item>
        
        <el-form-item label="短信通知">
          <el-switch v-model="rulesForm.smsNotificationEnabled" />
          <span class="form-tip">结算完成后发送短信通知（需要用户绑定手机号）</span>
        </el-form-item>
      </el-card>

      <!-- 高级设置 -->
      <el-card class="rule-card">
        <template #header>
          <span class="card-title">高级设置</span>
        </template>
        
        <el-form-item label="佣金有效期" prop="commissionValidDays">
          <el-input-number
            v-model="rulesForm.commissionValidDays"
            :min="1"
            :max="365"
            style="width: 200px"
          />
          <span class="form-tip">天（佣金产生后的有效期，超期自动失效）</span>
        </el-form-item>
        
        <el-form-item label="最大分佣层级" prop="maxReferralLevels">
          <el-select v-model="rulesForm.maxReferralLevels" style="width: 200px">
            <el-option label="1级" :value="1" />
            <el-option label="2级" :value="2" />
            <el-option label="3级" :value="3" />
          </el-select>
          <span class="form-tip">设置最大分佣层级深度</span>
        </el-form-item>
        
        <el-form-item label="新用户保护期" prop="newUserProtectionDays">
          <el-input-number
            v-model="rulesForm.newUserProtectionDays"
            :min="0"
            :max="90"
            style="width: 200px"
          />
          <span class="form-tip">天（新用户注册后的保护期，期间产生的佣金加倍）</span>
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="saveRules" :loading="saving">
          保存设置
        </el-button>
        <el-button @click="resetRules">
          重置
        </el-button>
        <el-button type="info" @click="previewRules">
          预览效果
        </el-button>
      </div>
    </el-form>

    <!-- 规则预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="规则预览" width="600px">
      <div class="rules-preview">
        <h4>当前分佣规则</h4>
        <ul class="preview-list">
          <li>一级分佣比例：{{ rulesForm.firstLevelRate }}%</li>
          <li>二级分佣比例：{{ rulesForm.secondLevelRate }}%</li>
          <li>最低结算金额：${{ rulesForm.minSettlementAmount }}</li>
          <li>自动结算：{{ rulesForm.autoSettlementEnabled ? '已启用' : '已禁用' }}</li>
          <li v-if="rulesForm.autoSettlementEnabled">
            结算周期：{{ settlementCycleText }} - 每月{{ rulesForm.settlementDay }}日
          </li>
          <li>佣金有效期：{{ rulesForm.commissionValidDays }}天</li>
          <li>最大分佣层级：{{ rulesForm.maxReferralLevels }}级</li>
          <li>新用户保护期：{{ rulesForm.newUserProtectionDays }}天</li>
        </ul>
        
        <h4>示例计算</h4>
        <div class="example-calculation">
          <p>假设用户A推荐用户B，用户B推荐用户C：</p>
          <p>当用户C产生$100订单时：</p>
          <ul>
            <li>用户B（一级推荐人）获得佣金：${{ (100 * rulesForm.firstLevelRate / 100).toFixed(2) }}</li>
            <li>用户A（二级推荐人）获得佣金：${{ (100 * rulesForm.secondLevelRate / 100).toFixed(2) }}</li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 定义事件
const emit = defineEmits(['save'])

// 响应式数据
const rulesFormRef = ref()
const saving = ref(false)
const previewDialogVisible = ref(false)

// 表单数据
const rulesForm = reactive({
  firstLevelRate: 5.0,
  secondLevelRate: 2.0,
  minSettlementAmount: 10.00,
  autoSettlementEnabled: true,
  settlementCycle: 'monthly',
  settlementDay: 1,
  emailNotificationEnabled: true,
  systemNotificationEnabled: true,
  smsNotificationEnabled: false,
  commissionValidDays: 365,
  maxReferralLevels: 2,
  newUserProtectionDays: 30
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
  settlementCycle: [
    { required: true, message: '请选择结算周期', trigger: 'change' }
  ],
  settlementDay: [
    { required: true, message: '请输入结算日期', trigger: 'blur' },
    { type: 'number', min: 1, max: 31, message: '日期必须在1-31之间', trigger: 'blur' }
  ],
  commissionValidDays: [
    { required: true, message: '请输入佣金有效期', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '有效期必须在1-365天之间', trigger: 'blur' }
  ],
  maxReferralLevels: [
    { required: true, message: '请选择最大分佣层级', trigger: 'change' }
  ],
  newUserProtectionDays: [
    { required: true, message: '请输入新用户保护期', trigger: 'blur' },
    { type: 'number', min: 0, max: 90, message: '保护期必须在0-90天之间', trigger: 'blur' }
  ]
}

// 计算属性
const settlementCycleText = computed(() => {
  const cycleMap = {
    monthly: '每月',
    quarterly: '每季度',
    yearly: '每年'
  }
  return cycleMap[rulesForm.settlementCycle] || '每月'
})

// 方法
const saveRules = async () => {
  if (!rulesFormRef.value) return
  
  try {
    await rulesFormRef.value.validate()
    
    saving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('save', { ...rulesForm })
    ElMessage.success('佣金规则保存成功')
  } catch (error) {
    console.log('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

const resetRules = () => {
  if (rulesFormRef.value) {
    rulesFormRef.value.resetFields()
  }
}

const previewRules = () => {
  previewDialogVisible.value = true
}

// 生命周期
onMounted(() => {
  // 加载现有规则配置
  console.log('佣金规则组件已加载')
})
</script>

<style scoped>
.commission-rules {
  max-width: 800px;
}

.rules-header {
  margin-bottom: 24px;
}

.rules-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.rules-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.rule-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.auto-settlement-settings {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.rules-preview h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.preview-list {
  margin: 0 0 24px 0;
  padding-left: 20px;
}

.preview-list li {
  margin-bottom: 8px;
  color: #606266;
}

.example-calculation {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
}

.example-calculation p {
  margin: 0 0 8px 0;
  color: #303133;
}

.example-calculation ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.example-calculation li {
  margin-bottom: 4px;
  color: #67c23a;
  font-weight: 500;
}
</style>
