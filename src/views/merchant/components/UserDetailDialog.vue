<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户详情"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="user" class="user-detail">
      <!-- 用户基本信息 -->
      <div class="info-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>用户名称</label>
            <span>{{ user.name }}</span>
          </div>
          <div class="info-item">
            <label>加入时间</label>
            <span>{{ formatDate(user.joinTime) }}</span>
          </div>
          <div class="info-item">
            <label>用户层级</label>
            <el-tag :type="user.level2Users ? 'primary' : 'success'" size="small">
              {{ user.level2Users ? '一级用户' : '二级用户' }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>用户状态</label>
            <el-tag type="success" size="small">正常</el-tag>
          </div>
        </div>
      </div>

      <!-- 佣金贡献信息 -->
      <div class="info-section">
        <h3>佣金贡献</h3>
        <div class="commission-stats">
          <div class="stat-card">
            <div class="stat-label">累计贡献佣金</div>
            <div class="stat-value">${{ user.totalCommission.toFixed(2) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">本月贡献佣金</div>
            <div class="stat-value">${{ getMonthlyCommission().toFixed(2) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">上月贡献佣金</div>
            <div class="stat-value">${{ getLastMonthCommission().toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- 下级用户信息（仅一级用户显示） -->
      <div v-if="user.level2Users" class="info-section">
        <h3>下级用户信息</h3>
        <div class="referral-info">
          <div class="referral-stat">
            <span class="label">二级用户数量:</span>
            <span class="value">{{ user.level2Count || 0 }}人</span>
          </div>
          <div class="referral-stat">
            <span class="label">二级用户贡献佣金:</span>
            <span class="value">${{ getLevel2Commission().toFixed(2) }}</span>
          </div>
        </div>

        <!-- 二级用户列表 -->
        <div v-if="user.level2Users && user.level2Users.length > 0" class="level2-list">
          <h4>二级用户列表</h4>
          <div class="user-list">
            <div 
              v-for="level2User in user.level2Users" 
              :key="level2User.id"
              class="user-item"
            >
              <div class="user-info">
                <div class="user-avatar">
                  <el-icon><User /></el-icon>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ level2User.name }}</div>
                  <div class="user-meta">
                    <span>加入时间: {{ formatDate(level2User.joinTime) }}</span>
                  </div>
                </div>
              </div>
              <div class="user-commission">
                ${{ level2User.totalCommission.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="info-section">
        <h3>最近活动</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">产生佣金收入</div>
              <div class="activity-time">2024-05-21 14:30</div>
            </div>
            <div class="activity-amount">+$45.60</div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">邀请新用户</div>
              <div class="activity-time">2024-05-20 16:45</div>
            </div>
            <div class="activity-amount">+1人</div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { User, Money, UserFilled } from '@element-plus/icons-vue'

// Props
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

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const dialogVisible = ref(false)

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getMonthlyCommission = () => {
  // 模拟计算本月佣金
  if (!props.user) return 0
  return props.user.totalCommission * 0.3 // 假设本月占总额的30%
}

const getLastMonthCommission = () => {
  // 模拟计算上月佣金
  if (!props.user) return 0
  return props.user.totalCommission * 0.25 // 假设上月占总额的25%
}

const getLevel2Commission = () => {
  // 计算二级用户贡献的佣金
  if (!props.user || !props.user.level2Users) return 0
  return props.user.level2Users.reduce((sum, user) => sum + user.totalCommission, 0)
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
.user-detail {
  max-height: 600px;
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

/* 佣金统计 */
.commission-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #67c23a;
}

/* 推荐信息 */
.referral-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.referral-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.referral-stat .label {
  font-size: 14px;
  color: #606266;
}

.referral-stat .value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 二级用户列表 */
.level2-list {
  margin-top: 16px;
}

.user-list {
  background: #fafbfc;
  border-radius: 6px;
  padding: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.user-item:last-child {
  margin-bottom: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #67c23a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-meta {
  font-size: 12px;
  color: #909399;
}

.user-commission {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

/* 活动列表 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.activity-amount {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .commission-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .referral-stat {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    text-align: left;
  }
}
</style> 