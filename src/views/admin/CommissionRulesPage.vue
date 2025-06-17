<template>
  <div class="commission-rules-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">分佣结算规则设置</h1>
    </div>

    <!-- 规则配置区域 -->
    <div class="rules-container">
      <!-- 分佣比例设置卡片 -->
      <el-card class="rule-section">
        <template #header>
          <span class="section-title">分佣比例设置</span>
        </template>

        <el-form :model="rulesForm" :rules="rulesRules" ref="rulesFormRef" label-width="150px">
          <el-form-item label="一级分佣比例" prop="firstLevelRate">
            <el-input-number
              v-model="rulesForm.firstLevelRate"
              :min="0"
              :max="100"
              :step="0.1"
              :precision="1"
              style="width: 200px"
            />
            <span class="form-tip">%（百分比输入）</span>
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
            <span class="form-tip">%（百分比输入）</span>
          </el-form-item>

          <el-form-item label="最低结算金额" prop="minSettlementAmount">
            <el-input-number
              v-model="rulesForm.minSettlementAmount"
              :min="0"
              :step="1"
              :precision="2"
              style="width: 200px"
            />
            <span class="form-tip">USD</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 自动结算设置卡片 -->
      <el-card class="rule-section">
        <template #header>
          <span class="section-title">自动结算设置</span>
        </template>

        <el-form :model="rulesForm" label-width="150px">
          <el-form-item label="启用自动结算">
            <el-switch v-model="rulesForm.autoSettlementEnabled" />
          </el-form-item>

          <div v-if="rulesForm.autoSettlementEnabled">
            <el-form-item label="结算周期" prop="settlementCycle">
              <el-select v-model="rulesForm.settlementCycle" style="width: 200px">
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="每季度" value="quarterly" />
              </el-select>
            </el-form-item>

            <el-form-item label="结算日期" prop="settlementDay">
              <el-input-number
                v-model="rulesForm.settlementDay"
                :min="1"
                :max="31"
                style="width: 200px"
              />
              <span class="form-tip">日</span>
            </el-form-item>

            <el-form-item label="结算时间" prop="settlementTime">
              <el-time-picker
                v-model="rulesForm.settlementTime"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 200px"
              />
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- 保存设置按钮 -->
    <div class="save-section">
      <el-button type="primary" size="large" @click="saveSettings" :loading="saving">
        保存设置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const rulesFormRef = ref()
const saving = ref(false)

// 表单数据
const rulesForm = reactive({
  firstLevelRate: 5.0,
  secondLevelRate: 2.0,
  minSettlementAmount: 10.00,
  autoSettlementEnabled: true,
  settlementCycle: 'monthly',
  settlementDay: 1,
  settlementTime: '10:00'
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
  ]
}

// 方法
const saveSettings = async () => {
  if (!rulesFormRef.value) return

  try {
    await rulesFormRef.value.validate()

    saving.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('分佣结算规则设置保存成功')
  } catch (error) {
    console.log('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 生命周期
onMounted(() => {
  console.log('分佣结算规则设置页面已加载')
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
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 规则容器 */
.rules-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.rule-section {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
}

/* 保存按钮区域 */
.save-section {
  text-align: center;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-rules-page {
    padding: 12px;
  }
}
</style>
