<template>
  <el-dialog
    v-model="visible"
    title="用户详情"
    width="800px"
    :before-close="handleClose"
  >
    <div v-if="user" class="user-detail">
      <!-- 用户基本信息 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">基本信息</span>
        </template>
        
        <div class="user-profile">
          <div class="avatar-section">
            <el-avatar :size="80" :src="user.avatar">
              {{ user.name?.charAt(0) }}
            </el-avatar>
            <div class="status-badge" :class="user.status">
              {{ user.status === 'active' ? '活跃' : '非活跃' }}
            </div>
          </div>
          
          <div class="profile-info">
            <div class="info-row">
              <label>用户名称:</label>
              <span>{{ user.name }}</span>
            </div>
            <div class="info-row">
              <label>邮箱地址:</label>
              <span>{{ user.email }}</span>
            </div>
            <div class="info-row">
              <label>邀请码:</label>
              <span class="invite-code">{{ user.inviteCode }}</span>
            </div>
            <div class="info-row">
              <label>注册时间:</label>
              <span>{{ user.registeredAt }}</span>
            </div>
            <div class="info-row">
              <label>推荐人:</label>
              <span v-if="user.referrer">{{ user.referrer.name }} ({{ user.referrer.inviteCode }})</span>
              <span v-else class="no-referrer">顶级用户</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 推荐统计 -->
      <el-card class="stats-card">
        <template #header>
          <span class="card-title">推荐统计</span>
        </template>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ user.directReferrals }}</div>
            <div class="stat-label">直接推荐</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ user.totalReferrals || 0 }}</div>
            <div class="stat-label">总推荐数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${{ user.totalCommission.toFixed(2) }}</div>
            <div class="stat-label">累计佣金</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${{ user.monthlyCommission.toFixed(2) }}</div>
            <div class="stat-label">本月佣金</div>
          </div>
        </div>
      </el-card>

      <!-- 推荐列表 -->
      <el-card class="referrals-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">推荐用户列表</span>
            <el-button size="small" @click="refreshReferrals">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <el-table
          v-loading="referralsLoading"
          :data="referralsList"
          border
          max-height="300"
        >
          <el-table-column label="用户信息" min-width="200">
            <template #default="scope">
              <div class="referral-user">
                <div class="user-name">{{ scope.row.name }}</div>
                <div class="user-email">{{ scope.row.email }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="inviteCode" label="邀请码" width="120" />
          <el-table-column label="层级" width="80" align="center">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.level === 1 ? 'success' : 'warning'">
                L{{ scope.row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="佣金贡献" width="120" align="right">
            <template #default="scope">
              <span class="commission-amount">${{ scope.row.commissionContribution.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="registeredAt" label="注册时间" width="180" />
        </el-table>
      </el-card>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="viewCommissionDetail">查看佣金详情</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'view-commission'])

const visible = ref(false)
const referralsLoading = ref(false)
const referralsList = ref([])

// 监听显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.user) {
    loadReferrals()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const handleClose = () => {
  visible.value = false
}

const loadReferrals = async () => {
  if (!props.user) return
  
  referralsLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟推荐用户数据
    referralsList.value = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        inviteCode: 'AJ002',
        level: 1,
        commissionContribution: 320.50,
        status: 'active',
        registeredAt: '2023-02-01 14:20:00'
      },
      {
        id: 2,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        inviteCode: 'BW003',
        level: 1,
        commissionContribution: 280.75,
        status: 'active',
        registeredAt: '2023-02-15 09:45:00'
      },
      {
        id: 3,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        inviteCode: 'CB004',
        level: 2,
        commissionContribution: 150.25,
        status: 'inactive',
        registeredAt: '2023-03-01 11:30:00'
      }
    ]
  } catch (error) {
    console.error('加载推荐用户失败:', error)
  } finally {
    referralsLoading.value = false
  }
}

const refreshReferrals = () => {
  loadReferrals()
}

const viewCommissionDetail = () => {
  emit('view-commission', props.user)
  handleClose()
}
</script>

<style scoped>
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.stats-card,
.referrals-card {
  border: 1px solid #ebeef5;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 用户资料 */
.user-profile {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.status-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.status-badge.active {
  background: #67c23a;
}

.status-badge.inactive {
  background: #f56c6c;
}

.profile-info {
  flex: 1;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.info-row label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.info-row span {
  color: #303133;
}

.invite-code {
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.no-referrer {
  color: #909399;
  font-style: italic;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #606266;
}

/* 推荐用户 */
.referral-user {
  line-height: 1.4;
}

.referral-user .user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.referral-user .user-email {
  font-size: 12px;
  color: #909399;
}

.commission-amount {
  font-weight: 500;
  color: #67c23a;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-row label {
    width: auto;
  }
}
</style>
