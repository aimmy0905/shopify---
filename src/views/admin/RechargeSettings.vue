<template>
  <div class="recharge-settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">余额充值规则设置</h1>
        <p class="page-description">配置充值币种、支付方式、审核规则等设置</p>
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

    <!-- 设置标签页 -->
    <el-card class="settings-card">
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 币种设置 -->
        <el-tab-pane label="币种设置" name="currencies">
          <div class="tab-content">
            <div class="section-header">
              <h3>支持的充值币种</h3>
              <p>配置系统支持的充值币种及其限额</p>
              <el-button type="primary" :icon="Plus" @click="addCurrency">添加币种</el-button>
            </div>
            
            <div class="currency-list">
              <div v-for="currency in currencySettings" :key="currency.code" class="currency-item">
                <el-card class="currency-card">
                  <div class="currency-header">
                    <div class="currency-info">
                      <span class="currency-symbol">{{ currency.symbol }}</span>
                      <div class="currency-details">
                        <div class="currency-name">{{ currency.name }} ({{ currency.code }})</div>
                        <div class="currency-rate">汇率: {{ currency.exchangeRate }}</div>
                      </div>
                    </div>
                    <div class="currency-actions">
                      <el-switch v-model="currency.enabled" @change="onCurrencyToggle(currency)" />
                      <el-button type="primary" size="small" @click="editCurrency(currency)">编辑</el-button>
                      <el-button type="danger" size="small" @click="deleteCurrency(currency)">删除</el-button>
                    </div>
                  </div>
                  
                  <div class="currency-settings" v-if="currency.enabled">
                    <el-row :gutter="20">
                      <el-col :span="6">
                        <el-form-item label="最小金额">
                          <el-input-number
                            v-model="currency.minAmount"
                            :min="0"
                            :precision="2"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="最大金额">
                          <el-input-number
                            v-model="currency.maxAmount"
                            :min="0"
                            :precision="2"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="日限额">
                          <el-input-number
                            v-model="currency.dailyLimit"
                            :min="0"
                            :precision="2"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="月限额">
                          <el-input-number
                            v-model="currency.monthlyLimit"
                            :min="0"
                            :precision="2"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 支付方式设置 -->
        <el-tab-pane label="支付方式" name="payment-methods">
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
                      <div class="method-description">{{ method.description }}</div>
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
                          <span class="detail-label">支持币种:</span>
                          <span class="detail-value">{{ method.supportedCurrencies.join(', ') }}</span>
                        </div>
                      </el-col>
                      <el-col :span="8">
                        <div class="detail-item">
                          <span class="detail-label">手续费率:</span>
                          <span class="detail-value">{{ (method.feeRate * 100).toFixed(2) }}%</span>
                        </div>
                      </el-col>
                      <el-col :span="8">
                        <div class="detail-item">
                          <span class="detail-label">到账时间:</span>
                          <span class="detail-value">{{ method.processingTime }}</span>
                        </div>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <div class="detail-item">
                          <span class="detail-label">最小金额:</span>
                          <span class="detail-value">{{ method.minAmount }}</span>
                        </div>
                      </el-col>
                      <el-col :span="12">
                        <div class="detail-item">
                          <span class="detail-label">最大金额:</span>
                          <span class="detail-value">{{ method.maxAmount }}</span>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 审核规则设置 -->
        <el-tab-pane label="审核规则" name="audit-rules">
          <div class="tab-content">
            <div class="section-header">
              <h3>充值审核规则</h3>
              <p>配置自动审核和人工审核规则</p>
            </div>
            
            <el-form :model="auditRules" label-width="150px" class="audit-form">
              <el-card class="rule-card">
                <template #header>
                  <span>自动审核设置</span>
                </template>
                
                <el-form-item label="启用自动审核">
                  <el-switch v-model="auditRules.autoApprovalEnabled" />
                  <span class="form-tip">开启后，符合条件的充值申请将自动审核通过</span>
                </el-form-item>
                
                <div v-if="auditRules.autoApprovalEnabled" class="auto-approval-settings">
                  <el-form-item label="自动审核限额">
                    <div class="limit-settings">
                      <div class="limit-item">
                        <span>USD: </span>
                        <el-input-number v-model="auditRules.autoApprovalLimit.USD" :min="0" />
                      </div>
                      <div class="limit-item">
                        <span>CNY: </span>
                        <el-input-number v-model="auditRules.autoApprovalLimit.CNY" :min="0" />
                      </div>
                      <div class="limit-item">
                        <span>EUR: </span>
                        <el-input-number v-model="auditRules.autoApprovalLimit.EUR" :min="0" />
                      </div>
                    </div>
                  </el-form-item>
                </div>
              </el-card>

              <el-card class="rule-card">
                <template #header>
                  <span>人工审核规则</span>
                </template>
                
                <el-form-item label="大额充值审核">
                  <el-switch v-model="auditRules.manualReviewRequired.largeAmount" />
                  <span class="form-tip">超过自动审核限额的充值需要人工审核</span>
                </el-form-item>
                
                <el-form-item label="新客户审核">
                  <el-switch v-model="auditRules.manualReviewRequired.newCustomer" />
                  <span class="form-tip">新注册客户的首次充值需要人工审核</span>
                </el-form-item>
                
                <el-form-item label="可疑活动审核">
                  <el-switch v-model="auditRules.manualReviewRequired.suspiciousActivity" />
                  <span class="form-tip">检测到可疑活动时需要人工审核</span>
                </el-form-item>
                
                <el-form-item label="审核时限">
                  <el-input-number v-model="auditRules.reviewTimeLimit" :min="1" :max="168" />
                  <span class="form-tip">小时（超时将自动升级）</span>
                </el-form-item>
              </el-card>

              <el-card class="rule-card">
                <template #header>
                  <span>升级规则</span>
                </template>
                
                <el-form-item label="启用升级规则">
                  <el-switch v-model="auditRules.escalationRules.enabled" />
                </el-form-item>
                
                <div v-if="auditRules.escalationRules.enabled">
                  <el-form-item label="升级时间">
                    <el-input-number v-model="auditRules.escalationRules.escalationTime" :min="1" :max="168" />
                    <span class="form-tip">小时</span>
                  </el-form-item>
                  
                  <el-form-item label="升级对象">
                    <el-select v-model="auditRules.escalationRules.escalationTo">
                      <el-option label="主管" value="supervisor" />
                      <el-option label="财务经理" value="finance_manager" />
                      <el-option label="总监" value="director" />
                    </el-select>
                  </el-form-item>
                </div>
              </el-card>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 风控设置 -->
        <el-tab-pane label="风控设置" name="risk-control">
          <div class="tab-content">
            <div class="section-header">
              <h3>风险控制设置</h3>
              <p>配置充值风险控制规则</p>
            </div>
            
            <el-form :model="riskControlSettings" label-width="150px" class="risk-form">
              <el-card class="rule-card">
                <template #header>
                  <span>基础风控</span>
                </template>
                
                <el-form-item label="日限额检查">
                  <el-switch v-model="riskControlSettings.dailyLimitEnabled" />
                  <span class="form-tip">检查客户日充值限额</span>
                </el-form-item>
                
                <el-form-item label="月限额检查">
                  <el-switch v-model="riskControlSettings.monthlyLimitEnabled" />
                  <span class="form-tip">检查客户月充值限额</span>
                </el-form-item>
                
                <el-form-item label="频率检查">
                  <el-switch v-model="riskControlSettings.velocityCheckEnabled" />
                  <span class="form-tip">检查充值频率是否异常</span>
                </el-form-item>
                
                <el-form-item label="重复检查">
                  <el-switch v-model="riskControlSettings.duplicateCheckEnabled" />
                  <span class="form-tip">检查是否存在重复充值</span>
                </el-form-item>
                
                <el-form-item label="黑名单检查">
                  <el-switch v-model="riskControlSettings.blacklistCheckEnabled" />
                  <span class="form-tip">检查客户是否在黑名单中</span>
                </el-form-item>
              </el-card>

              <el-card class="rule-card">
                <template #header>
                  <span>高级风控</span>
                </template>
                
                <el-form-item label="地理位置检查">
                  <el-switch v-model="riskControlSettings.geoLocationCheckEnabled" />
                  <span class="form-tip">检查充值地理位置是否异常</span>
                </el-form-item>
                
                <el-form-item label="设备指纹检查">
                  <el-switch v-model="riskControlSettings.deviceFingerprintEnabled" />
                  <span class="form-tip">检查设备指纹是否可信</span>
                </el-form-item>
              </el-card>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <div class="tab-content">
            <div class="section-header">
              <h3>通知配置</h3>
              <p>配置充值相关的通知设置</p>
            </div>
            
            <el-form :model="notificationSettings" label-width="150px" class="notification-form">
              <el-card class="rule-card">
                <template #header>
                  <span>通知方式</span>
                </template>
                
                <el-form-item label="邮件通知">
                  <el-switch v-model="notificationSettings.emailNotification" />
                </el-form-item>
                
                <el-form-item label="短信通知">
                  <el-switch v-model="notificationSettings.smsNotification" />
                </el-form-item>
                
                <el-form-item label="Webhook通知">
                  <el-switch v-model="notificationSettings.webhookNotification" />
                </el-form-item>
                
                <el-form-item v-if="notificationSettings.webhookNotification" label="Webhook URL">
                  <el-input v-model="notificationSettings.webhookUrl" placeholder="https://api.example.com/webhook" />
                </el-form-item>
              </el-card>

              <el-card class="rule-card">
                <template #header>
                  <span>通知事件</span>
                </template>
                
                <el-form-item label="通知事件">
                  <el-checkbox-group v-model="notificationSettings.notificationEvents">
                    <el-checkbox label="recharge_submitted">充值申请提交</el-checkbox>
                    <el-checkbox label="recharge_approved">充值审核通过</el-checkbox>
                    <el-checkbox label="recharge_rejected">充值审核拒绝</el-checkbox>
                    <el-checkbox label="recharge_completed">充值完成</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-card>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
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
        <el-form-item label="支持币种" prop="supportedCurrencies">
          <el-checkbox-group v-model="paymentMethodForm.supportedCurrencies">
            <el-checkbox label="USD">美元</el-checkbox>
            <el-checkbox label="CNY">人民币</el-checkbox>
            <el-checkbox label="EUR">欧元</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="手续费率" prop="feeRate">
          <el-input-number v-model="paymentMethodForm.feeRate" :min="0" :max="1" :step="0.001" :precision="3" />
          <span class="form-tip">输入小数，如0.006表示0.6%</span>
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

    <!-- 币种设置弹窗 -->
    <el-dialog
      v-model="currencyDialogVisible"
      title="币种设置"
      width="500px"
    >
      <el-form :model="currencyForm" :rules="currencyRules" ref="currencyFormRef" label-width="120px">
        <el-form-item label="币种代码" prop="code">
          <el-input v-model="currencyForm.code" placeholder="如：USD" :disabled="isEditingCurrency" />
        </el-form-item>
        <el-form-item label="币种名称" prop="name">
          <el-input v-model="currencyForm.name" placeholder="如：美元" />
        </el-form-item>
        <el-form-item label="币种符号" prop="symbol">
          <el-input v-model="currencyForm.symbol" placeholder="如：$" />
        </el-form-item>
        <el-form-item label="汇率" prop="exchangeRate">
          <el-input-number v-model="currencyForm.exchangeRate" :min="0" :step="0.01" :precision="4" />
          <span class="form-tip">相对于USD的汇率</span>
        </el-form-item>
        <el-form-item label="最小金额" prop="minAmount">
          <el-input-number v-model="currencyForm.minAmount" :min="0" />
        </el-form-item>
        <el-form-item label="最大金额" prop="maxAmount">
          <el-input-number v-model="currencyForm.maxAmount" :min="0" />
        </el-form-item>
        <el-form-item label="日限额" prop="dailyLimit">
          <el-input-number v-model="currencyForm.dailyLimit" :min="0" />
        </el-form-item>
        <el-form-item label="月限额" prop="monthlyLimit">
          <el-input-number v-model="currencyForm.monthlyLimit" :min="0" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="currencyForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="currencyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCurrency">保存</el-button>
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
const activeTab = ref('currencies')
const saving = ref(false)

// 设置数据
const currencySettings = ref([])
const paymentMethods = ref([])
const auditRules = reactive({})
const riskControlSettings = reactive({})
const notificationSettings = reactive({})

// 支付方式弹窗相关
const paymentMethodDialogVisible = ref(false)
const isEditingPaymentMethod = ref(false)
const paymentMethodFormRef = ref()
const paymentMethodForm = reactive({
  id: '',
  name: '',
  description: '',
  supportedCurrencies: [],
  feeRate: 0,
  minAmount: 0,
  maxAmount: 0,
  processingTime: '',
  enabled: true
})

const paymentMethodRules = {
  name: [{ required: true, message: '请输入支付方式名称', trigger: 'blur' }],
  id: [{ required: true, message: '请输入支付方式ID', trigger: 'blur' }],
  supportedCurrencies: [{ required: true, message: '请选择支持的币种', trigger: 'change' }],
  feeRate: [{ required: true, message: '请输入手续费率', trigger: 'blur' }],
  minAmount: [{ required: true, message: '请输入最小金额', trigger: 'blur' }],
  maxAmount: [{ required: true, message: '请输入最大金额', trigger: 'blur' }],
  processingTime: [{ required: true, message: '请输入到账时间', trigger: 'blur' }]
}

// 币种弹窗相关
const currencyDialogVisible = ref(false)
const isEditingCurrency = ref(false)
const currencyFormRef = ref()
const currencyForm = reactive({
  code: '',
  name: '',
  symbol: '',
  exchangeRate: 1,
  minAmount: 0,
  maxAmount: 0,
  dailyLimit: 0,
  monthlyLimit: 0,
  enabled: true
})

const currencyRules = {
  code: [{ required: true, message: '请输入币种代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入币种名称', trigger: 'blur' }],
  symbol: [{ required: true, message: '请输入币种符号', trigger: 'blur' }],
  exchangeRate: [{ required: true, message: '请输入汇率', trigger: 'blur' }],
  minAmount: [{ required: true, message: '请输入最小金额', trigger: 'blur' }],
  maxAmount: [{ required: true, message: '请输入最大金额', trigger: 'blur' }],
  dailyLimit: [{ required: true, message: '请输入日限额', trigger: 'blur' }],
  monthlyLimit: [{ required: true, message: '请输入月限额', trigger: 'blur' }]
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
    supportedCurrencies: [],
    feeRate: 0,
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
  Object.assign(paymentMethodForm, { ...method })
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

// 币种切换状态
const onCurrencyToggle = (currency) => {
  ElMessage.success(`${currency.name} 已${currency.enabled ? '启用' : '禁用'}`)
}

// 添加币种
const addCurrency = () => {
  isEditingCurrency.value = false
  Object.assign(currencyForm, {
    code: '',
    name: '',
    symbol: '',
    exchangeRate: 1,
    minAmount: 0,
    maxAmount: 0,
    dailyLimit: 0,
    monthlyLimit: 0,
    enabled: true
  })
  currencyDialogVisible.value = true
}

// 编辑币种
const editCurrency = (currency) => {
  isEditingCurrency.value = true
  Object.assign(currencyForm, { ...currency })
  currencyDialogVisible.value = true
}

// 保存币种
const saveCurrency = async () => {
  if (!currencyFormRef.value) return

  try {
    await currencyFormRef.value.validate()

    if (isEditingCurrency.value) {
      // 编辑模式
      const index = currencySettings.value.findIndex(c => c.code === currencyForm.code)
      if (index > -1) {
        currencySettings.value[index] = { ...currencyForm }
        ElMessage.success('币种更新成功')
      }
    } else {
      // 添加模式
      const exists = currencySettings.value.some(c => c.code === currencyForm.code)
      if (exists) {
        ElMessage.error('币种代码已存在')
        return
      }
      currencySettings.value.push({ ...currencyForm })
      ElMessage.success('币种添加成功')
    }

    currencyDialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 删除币种
const deleteCurrency = (currency) => {
  ElMessageBox.confirm(
    `确定要删除币种 "${currency.name}" 吗？`,
    '删除币种',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = currencySettings.value.findIndex(c => c.code === currency.code)
    if (index > -1) {
      currencySettings.value.splice(index, 1)
      ElMessage.success('币种已删除')
    }
  })
}

const loadSettings = () => {
  // 加载设置数据
  currencySettings.value = [...rechargeSettings.supportedCurrencies]
  paymentMethods.value = [...rechargeSettings.paymentMethods]
  Object.assign(auditRules, rechargeSettings.auditRules)
  Object.assign(riskControlSettings, rechargeSettings.riskControlSettings)
  Object.assign(notificationSettings, rechargeSettings.notificationSettings)
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

.settings-tabs {
  min-height: 600px;
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

/* 币种设置 */
.currency-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.currency-item {
  width: 100%;
}

.currency-card {
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.currency-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.currency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.currency-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.currency-symbol {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.currency-details {
  line-height: 1.4;
}

.currency-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.currency-rate {
  font-size: 14px;
  color: #909399;
}

.currency-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.currency-settings {
  padding-top: 16px;
  border-top: 1px solid #f5f7fa;
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

/* 表单样式 */
.audit-form,
.risk-form,
.notification-form {
  max-width: 800px;
}

.rule-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.auto-approval-settings {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.limit-settings {
  display: flex;
  gap: 20px;
  align-items: center;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
</style>
