<template>
  <div class="commission-overview-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">分佣总览</h1>
        <p class="page-description">平台分佣体系数据总览和趋势分析</p>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadOverviewData"
        />
        <el-button type="primary" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <el-card class="metric-card total-users">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ overviewData.totalUsers.toLocaleString() }}</div>
            <div class="metric-label">总用户数</div>
            <div class="metric-change positive">
              <el-icon><TrendCharts /></el-icon>
              +{{ overviewData.userGrowth }}% 本月
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card total-commission">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">${{ overviewData.totalCommission.toLocaleString() }}</div>
            <div class="metric-label">累计佣金</div>
            <div class="metric-change positive">
              <el-icon><TrendCharts /></el-icon>
              +{{ overviewData.commissionGrowth }}% 本月
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card active-referrers">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ overviewData.activeReferrers.toLocaleString() }}</div>
            <div class="metric-label">活跃推荐人</div>
            <div class="metric-change positive">
              <el-icon><TrendCharts /></el-icon>
              +{{ overviewData.referrerGrowth }}% 本月
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card avg-commission">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">${{ overviewData.avgCommission.toFixed(2) }}</div>
            <div class="metric-label">人均佣金</div>
            <div class="metric-change positive">
              <el-icon><TrendCharts /></el-icon>
              +{{ overviewData.avgGrowth }}% 本月
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 佣金趋势图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="chart-title">佣金趋势</span>
                <el-radio-group v-model="trendPeriod" size="small">
                  <el-radio-button label="7d">7天</el-radio-button>
                  <el-radio-button label="30d">30天</el-radio-button>
                  <el-radio-button label="90d">90天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <el-icon size="48"><TrendCharts /></el-icon>
                <p>佣金趋势图表</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 推荐层级分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span class="chart-title">推荐层级分布</span>
            </template>
            <div class="chart-container">
              <div class="level-distribution">
                <div v-for="level in levelDistribution" :key="level.level" class="level-item">
                  <div class="level-info">
                    <span class="level-name">{{ level.name }}</span>
                    <span class="level-count">{{ level.count }}人</span>
                  </div>
                  <div class="level-bar">
                    <div 
                      class="level-progress" 
                      :style="{ width: level.percentage + '%' }"
                      :class="`level-${level.level}`"
                    ></div>
                  </div>
                  <span class="level-percentage">{{ level.percentage }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 排行榜和详细数据 -->
    <div class="data-section">
      <el-row :gutter="20">
        <!-- 顶级推荐人排行 -->
        <el-col :span="12">
          <el-card class="ranking-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">顶级推荐人排行</span>
                <el-button size="small" @click="viewAllReferrers">查看全部</el-button>
              </div>
            </template>
            <div class="ranking-list">
              <div v-for="(referrer, index) in topReferrers" :key="referrer.id" class="ranking-item">
                <div class="rank-number" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
                <div class="referrer-avatar">
                  <el-avatar :size="40" :src="referrer.avatar">
                    {{ referrer.name.charAt(0) }}
                  </el-avatar>
                </div>
                <div class="referrer-info">
                  <div class="referrer-name">{{ referrer.name }}</div>
                  <div class="referrer-stats">
                    <span class="stat-item">{{ referrer.referrals }}推荐</span>
                    <span class="stat-item">${{ referrer.commission.toFixed(2) }}佣金</span>
                  </div>
                </div>
                <div class="referrer-badge">
                  <el-tag :type="getReferrerBadgeType(index)" size="small">
                    {{ getReferrerBadge(index) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 最新动态 -->
        <el-col :span="12">
          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">最新动态</span>
                <el-button size="small" @click="refreshActivities">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <el-icon>
                    <component :is="getActivityIcon(activity.type)" />
                  </el-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-text">{{ activity.text }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
                <div class="activity-amount" v-if="activity.amount">
                  +${{ activity.amount.toFixed(2) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <span class="card-title">快速操作</span>
        </template>
        <div class="actions-grid">
          <el-button type="primary" @click="goToReferralTree">
            <el-icon><Connection /></el-icon>
            查看推荐关系树
          </el-button>
          <el-button type="success" @click="goToSettlements">
            <el-icon><Money /></el-icon>
            批量结算佣金
          </el-button>
          <el-button type="warning" @click="goToRules">
            <el-icon><Setting /></el-icon>
            配置分佣规则
          </el-button>
          <el-button type="info" @click="goToRecords">
            <el-icon><List /></el-icon>
            查看佣金明细
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  UserFilled, 
  Money, 
  Connection, 
  PieChart, 
  TrendCharts, 
  Refresh,
  Setting,
  List,
  User,
  Plus,
  Check
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const dateRange = ref([])
const trendPeriod = ref('30d')

const overviewData = reactive({
  totalUsers: 15420,
  userGrowth: 12.5,
  totalCommission: 285600,
  commissionGrowth: 18.3,
  activeReferrers: 3240,
  referrerGrowth: 8.7,
  avgCommission: 185.2,
  avgGrowth: 5.2
})

const levelDistribution = ref([
  { level: 0, name: '顶级用户', count: 1250, percentage: 8.1 },
  { level: 1, name: '一级推荐', count: 5680, percentage: 36.8 },
  { level: 2, name: '二级推荐', count: 6420, percentage: 41.6 },
  { level: 3, name: '三级推荐', count: 2070, percentage: 13.4 }
])

const topReferrers = ref([
  { id: 1, name: 'John Smith', referrals: 156, commission: 8520.50, avatar: '' },
  { id: 2, name: 'Sarah Johnson', referrals: 142, commission: 7890.25, avatar: '' },
  { id: 3, name: 'Mike Wilson', referrals: 128, commission: 7250.80, avatar: '' },
  { id: 4, name: 'Emily Davis', referrals: 115, commission: 6580.30, avatar: '' },
  { id: 5, name: 'David Brown', referrals: 98, commission: 5920.75, avatar: '' }
])

const recentActivities = ref([
  { id: 1, type: 'referral', text: 'Alice Johnson 推荐了新用户 Bob Wilson', time: '2分钟前', amount: 25.50 },
  { id: 2, type: 'settlement', text: '系统自动结算了 156 位用户的佣金', time: '15分钟前', amount: null },
  { id: 3, type: 'bonus', text: 'John Smith 获得月度活跃奖励', time: '1小时前', amount: 100.00 },
  { id: 4, type: 'referral', text: 'Sarah Johnson 推荐了新用户 Charlie Brown', time: '2小时前', amount: 30.25 }
])

// 方法
const loadOverviewData = () => {
  // 模拟加载数据
  ElMessage.success('数据已更新')
}

const exportReport = () => {
  ElMessage.success('报告导出功能开发中...')
}

const viewAllReferrers = () => {
  router.push('/admin/referral-tree')
}

const refreshActivities = () => {
  ElMessage.success('动态已刷新')
}

const getReferrerBadgeType = (index) => {
  const types = ['danger', 'warning', 'success', 'info', 'info']
  return types[index] || 'info'
}

const getReferrerBadge = (index) => {
  const badges = ['冠军', '亚军', '季军', '优秀', '活跃']
  return badges[index] || '活跃'
}

const getActivityIcon = (type) => {
  const icons = {
    referral: User,
    settlement: Money,
    bonus: Plus,
    commission: Check
  }
  return icons[type] || User
}

const goToReferralTree = () => {
  router.push('/admin/referral-tree')
}

const goToSettlements = () => {
  router.push('/admin/commission-settlements')
}

const goToRules = () => {
  router.push('/admin/commission-rules')
}

const goToRecords = () => {
  router.push('/admin/commission-records')
}

// 生命周期
onMounted(() => {
  loadOverviewData()
})
</script>

<style scoped>
.commission-overview-page {
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
  align-items: center;
}

/* 指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px;
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.total-users .metric-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.total-commission .metric-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.active-referrers .metric-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.avg-commission .metric-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.metric-change.positive {
  color: #67c23a;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

/* 层级分布 */
.level-distribution {
  padding: 20px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.level-info {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name {
  font-weight: 500;
  color: #303133;
}

.level-count {
  font-size: 12px;
  color: #909399;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-progress.level-0 {
  background: linear-gradient(90deg, #409eff 0%, #66b3ff 100%);
}

.level-progress.level-1 {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
}

.level-progress.level-2 {
  background: linear-gradient(90deg, #e6a23c 0%, #ebb563 100%);
}

.level-progress.level-3 {
  background: linear-gradient(90deg, #f56c6c 0%, #f78989 100%);
}

.level-percentage {
  min-width: 50px;
  text-align: right;
  font-weight: 500;
  color: #303133;
}

/* 数据区域 */
.data-section {
  margin-bottom: 32px;
}

.ranking-card,
.activity-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
}

/* 排行榜 */
.ranking-list {
  padding: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.3s ease;
}

.ranking-item:hover {
  background: #f8f9fa;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
}

.rank-number.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.rank-number.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #d4d4d4 100%);
}

.rank-number.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
}

.rank-number:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: #909399;
}

.referrer-info {
  flex: 1;
}

.referrer-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.referrer-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 12px;
  color: #606266;
}

/* 活动列表 */
.activity-list {
  padding: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.3s ease;
}

.activity-item:hover {
  background: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-icon.referral {
  background: #67c23a;
}

.activity-icon.settlement {
  background: #409eff;
}

.activity-icon.bonus {
  background: #e6a23c;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #303133;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.activity-amount {
  font-weight: 600;
  color: #67c23a;
}

/* 快速操作 */
.quick-actions {
  margin-bottom: 32px;
}

.quick-actions .el-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-overview-page {
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
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-section .el-row {
    flex-direction: column;
  }
  
  .data-section .el-row {
    flex-direction: column;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
