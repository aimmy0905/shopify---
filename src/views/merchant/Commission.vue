<template>
  <div class="commission-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>佣金管理</h1>
    </div>

    <!-- 佣金总览卡片 -->
    <div class="commission-overview-card">
      <div class="overview-stats">
        <div class="stat-item main-stat">
          <div class="stat-label">累计佣金总额</div>
          <div class="stat-value main-value">${{ totalCommission.toFixed(2) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已结算佣金</div>
          <div class="stat-value">${{ settledCommission.toFixed(2) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">待结算佣金</div>
          <div class="stat-value pending">${{ pendingCommission.toFixed(2) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">本月佣金</div>
          <div class="stat-value">${{ monthlyCommission.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 邀请信息卡片 -->
    <div class="invitation-card">
      <h3>邀请信息</h3>
      <div class="invitation-content">
        <div class="invitation-codes">
          <div class="code-item">
            <label>我的邀请码</label>
            <div class="code-input">
              <el-input v-model="invitationCode" readonly />
              <el-button @click="copyInvitationCode">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </div>
          </div>
          <div class="code-item">
            <label>邀请链接</label>
            <div class="code-input">
              <el-input v-model="invitationLink" readonly />
              <el-button @click="copyInvitationLink">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </div>
          </div>
        </div>
        <div class="invitation-actions">
          <el-button type="primary" @click="showPosterDialog = true">
            <el-icon><Picture /></el-icon>
            生成邀请海报
          </el-button>
          <el-dropdown @command="handleShare">
            <el-button>
              <el-icon><Share /></el-icon>
              分享
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">邮件分享</el-dropdown-item>
                <el-dropdown-item command="wechat">微信分享</el-dropdown-item>
                <el-dropdown-item command="facebook">Facebook</el-dropdown-item>
                <el-dropdown-item command="twitter">Twitter</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 佣金规则说明卡片 -->
    <div class="commission-rules-card">
      <h3>佣金规则说明</h3>
      <div class="rules-content">
        <div class="rule-item">
          <div class="rule-label">一级分佣比例</div>
          <div class="rule-value">{{ commissionRules.level1 }}%</div>
        </div>
        <div class="rule-item">
          <div class="rule-label">二级分佣比例</div>
          <div class="rule-value">{{ commissionRules.level2 }}%</div>
        </div>
        <div class="rule-item">
          <div class="rule-label">结算周期</div>
          <div class="rule-value">{{ commissionRules.settlementCycle }}</div>
        </div>
        <div class="rule-action">
          <el-button text @click="showRulesDetail">查看详细规则</el-button>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="commission-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="佣金明细" name="details">
          <commission-details 
            :records="commissionDetails" 
            :loading="detailsLoading"
            @filter-change="handleDetailsFilter"
          />
        </el-tab-pane>
        <el-tab-pane label="我的下级" name="referrals">
          <my-referrals 
            :referrals="referralData" 
            :loading="referralsLoading"
            @search="handleReferralsSearch"
          />
        </el-tab-pane>
        <el-tab-pane label="结算记录" name="settlements">
          <settlement-records 
            :records="settlementRecords" 
            :loading="settlementsLoading"
            @filter-change="handleSettlementsFilter"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 生成邀请海报弹窗 -->
    <invitation-poster-dialog 
      v-model="showPosterDialog" 
      :invitation-code="invitationCode"
      :invitation-link="invitationLink"
      :commission-rules="commissionRules"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  DocumentCopy, 
  Picture, 
  Share, 
  ArrowDown 
} from '@element-plus/icons-vue'
import CommissionDetails from './components/CommissionDetails.vue'
import MyReferrals from './components/MyReferrals.vue'
import SettlementRecords from './components/SettlementRecords.vue'
import InvitationPosterDialog from './components/InvitationPosterDialog.vue'

// 响应式数据
const activeTab = ref('details')
const showPosterDialog = ref(false)

// 佣金概览数据
const totalCommission = ref(2580.45)
const settledCommission = ref(1850.20)
const pendingCommission = ref(730.25)
const monthlyCommission = ref(425.80)

// 邀请信息
const invitationCode = ref('MERCHANT001')
const invitationLink = ref('https://system.example.com/register?ref=MERCHANT001')

// 佣金规则
const commissionRules = reactive({
  level1: 8,
  level2: 3,
  settlementCycle: '每月结算'
})

// 加载状态
const detailsLoading = ref(false)
const referralsLoading = ref(false)
const settlementsLoading = ref(false)

// 佣金明细数据
const commissionDetails = ref([
  {
    id: 1,
    time: '2024-05-21 14:30:00',
    source: '订单 #OR202405210001',
    level: 1,
    amount: 45.60,
    status: 'pending',
    settlementTime: null,
    referralUser: 'user***@example.com'
  },
  {
    id: 2,
    time: '2024-05-20 16:45:00',
    source: '订单 #OR202405200002',
    level: 2,
    amount: 18.30,
    status: 'settled',
    settlementTime: '2024-05-25 10:00:00',
    referralUser: 'merchant***@example.com'
  },
  {
    id: 3,
    time: '2024-05-19 11:20:00',
    source: '订单 #OR202405190003',
    level: 1,
    amount: 67.90,
    status: 'settled',
    settlementTime: '2024-05-25 10:00:00',
    referralUser: 'shop***@example.com'
  }
])

// 下级用户数据
const referralData = ref({
  stats: {
    level1Count: 15,
    level2Count: 42,
    monthlyNew: 3
  },
  users: [
    {
      id: 1,
      name: 'user***@example.com',
      joinTime: '2024-03-15',
      totalCommission: 680.50,
      level2Count: 5,
      level2Users: [
        {
          id: 101,
          name: 'sub***@example.com',
          joinTime: '2024-04-20',
          totalCommission: 120.30
        },
        {
          id: 102,
          name: 'ref***@example.com',
          joinTime: '2024-05-01',
          totalCommission: 85.70
        }
      ]
    },
    {
      id: 2,
      name: 'merchant***@example.com',
      joinTime: '2024-02-10',
      totalCommission: 920.80,
      level2Count: 8,
      level2Users: []
    }
  ]
})

// 结算记录数据
const settlementRecords = ref([
  {
    id: 1,
    settlementTime: '2024-05-01 10:00:00',
    period: '2024年4月',
    amount: 580.20,
    balanceBefore: 1250.75,
    balanceAfter: 1830.95,
    note: '月度佣金结算'
  },
  {
    id: 2,
    settlementTime: '2024-04-01 10:00:00',
    period: '2024年3月',
    amount: 720.45,
    balanceBefore: 530.30,
    balanceAfter: 1250.75,
    note: '月度佣金结算'
  }
])

// 方法
const copyInvitationCode = () => {
  navigator.clipboard.writeText(invitationCode.value)
  ElMessage.success('邀请码已复制到剪贴板')
}

const copyInvitationLink = () => {
  navigator.clipboard.writeText(invitationLink.value)
  ElMessage.success('邀请链接已复制到剪贴板')
}

const handleShare = (command) => {
  const shareText = `邀请您加入我们的平台，使用邀请码：${invitationCode.value}，链接：${invitationLink.value}`
  
  switch (command) {
    case 'email':
      window.open(`mailto:?subject=邀请加入平台&body=${encodeURIComponent(shareText)}`)
      break
    case 'wechat':
      // 微信分享逻辑
      ElMessage.info('请复制链接到微信分享')
      copyInvitationLink()
      break
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invitationLink.value)}`)
      break
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`)
      break
  }
}

const showRulesDetail = () => {
  ElMessage.info('查看详细规则功能待开发')
}

const handleTabChange = (tabName) => {
  console.log('切换到标签页:', tabName)
}

const handleDetailsFilter = (filterData) => {
  console.log('佣金明细筛选:', filterData)
  // 这里处理佣金明细的筛选逻辑
}

const handleReferralsSearch = (searchText) => {
  console.log('搜索下级用户:', searchText)
  // 这里处理下级用户搜索逻辑
}

const handleSettlementsFilter = (filterData) => {
  console.log('结算记录筛选:', filterData)
  // 这里处理结算记录的筛选逻辑
}

// 生命周期
onMounted(() => {
  // 组件挂载时加载数据
  console.log('佣金管理页面已加载')
})
</script>

<style scoped>
.commission-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 佣金总览卡片 */
.commission-overview-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-item.main-stat {
  border-right: 1px solid #e4e7ed;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.main-value {
  font-size: 32px;
  color: #409eff;
}

.stat-value.pending {
  color: #e6a23c;
}

/* 邀请信息卡片 */
.invitation-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.invitation-card h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.invitation-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invitation-codes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.code-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.code-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.code-input .el-input {
  flex: 1;
}

.invitation-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 佣金规则卡片 */
.commission-rules-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.commission-rules-card h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.rules-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.rule-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.rule-label {
  font-size: 14px;
  color: #909399;
}

.rule-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.rule-action {
  margin-left: auto;
}

/* 标签页 */
.commission-tabs {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-container {
    padding: 16px;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-item.main-stat {
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 16px;
  }
  
  .invitation-content {
    gap: 12px;
  }
  
  .code-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .invitation-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .rules-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .rule-action {
    margin-left: 0;
    align-self: flex-start;
  }
}
</style> 