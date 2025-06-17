<template>
  <el-dialog
    v-model="visible"
    title="推荐关系链"
    width="700px"
    :before-close="handleClose"
  >
    <div v-if="user" class="referral-chain">
      <!-- 链条头部信息 -->
      <div class="chain-header">
        <h3>{{ user.name }} 的推荐关系链</h3>
        <p>显示从顶级推荐人到当前用户的完整推荐路径</p>
      </div>

      <!-- 向上追溯链条 -->
      <el-card class="chain-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">向上追溯 (推荐人链条)</span>
            <el-tag type="info">{{ upwardChain.length }} 级</el-tag>
          </div>
        </template>
        
        <div class="chain-container upward">
          <div v-for="(node, index) in upwardChain" :key="node.id" class="chain-node">
            <!-- 节点卡片 -->
            <div class="node-card" :class="`level-${index}`">
              <div class="node-avatar">
                <el-avatar :size="40" :src="node.avatar">
                  {{ node.name?.charAt(0) }}
                </el-avatar>
                <div class="level-badge">L{{ index }}</div>
              </div>
              
              <div class="node-info">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-email">{{ node.email }}</div>
                <div class="node-code">{{ node.inviteCode }}</div>
              </div>
              
              <div class="node-stats">
                <div class="stat-item">
                  <span class="stat-value">${{ node.totalCommission.toFixed(2) }}</span>
                  <span class="stat-label">总佣金</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ node.directReferrals }}</span>
                  <span class="stat-label">直推数</span>
                </div>
              </div>
            </div>
            
            <!-- 连接箭头 -->
            <div v-if="index < upwardChain.length - 1" class="chain-arrow">
              <el-icon><ArrowDown /></el-icon>
              <span class="arrow-label">推荐</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 当前用户 -->
      <el-card class="current-user-card">
        <template #header>
          <span class="card-title">当前用户</span>
        </template>
        
        <div class="current-user">
          <div class="user-card highlighted">
            <div class="user-avatar">
              <el-avatar :size="50" :src="user.avatar">
                {{ user.name?.charAt(0) }}
              </el-avatar>
              <div class="current-badge">当前</div>
            </div>
            
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-email">{{ user.email }}</div>
              <div class="user-code">{{ user.inviteCode }}</div>
              <div class="user-time">注册时间: {{ user.registeredAt }}</div>
            </div>
            
            <div class="user-stats">
              <div class="stat-grid">
                <div class="stat-item">
                  <div class="stat-value">${{ user.totalCommission.toFixed(2) }}</div>
                  <div class="stat-label">累计佣金</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ user.directReferrals }}</div>
                  <div class="stat-label">直推用户</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${{ user.monthlyCommission.toFixed(2) }}</div>
                  <div class="stat-label">本月佣金</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ getChainLevel(user) }}</div>
                  <div class="stat-label">链条层级</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 向下展开链条 -->
      <el-card class="chain-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">向下展开 (下级用户链条)</span>
            <el-tag type="success">{{ downwardChain.length }} 个直推</el-tag>
          </div>
        </template>
        
        <div v-if="downwardChain.length > 0" class="chain-container downward">
          <div v-for="(node, index) in downwardChain" :key="node.id" class="chain-node">
            <!-- 连接箭头 -->
            <div class="chain-arrow">
              <el-icon><ArrowDown /></el-icon>
              <span class="arrow-label">推荐</span>
            </div>
            
            <!-- 节点卡片 -->
            <div class="node-card" :class="`level-${index + 1}`">
              <div class="node-avatar">
                <el-avatar :size="40" :src="node.avatar">
                  {{ node.name?.charAt(0) }}
                </el-avatar>
                <div class="level-badge">L{{ index + 1 }}</div>
              </div>
              
              <div class="node-info">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-email">{{ node.email }}</div>
                <div class="node-code">{{ node.inviteCode }}</div>
              </div>
              
              <div class="node-stats">
                <div class="stat-item">
                  <span class="stat-value">${{ node.totalCommission.toFixed(2) }}</span>
                  <span class="stat-label">总佣金</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ node.directReferrals }}</span>
                  <span class="stat-label">直推数</span>
                </div>
              </div>
              
              <div class="node-actions">
                <el-button size="small" @click="viewUserChain(node)">
                  查看链条
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-chain">
          <el-icon size="48"><User /></el-icon>
          <p>该用户暂无下级推荐用户</p>
        </div>
      </el-card>

      <!-- 链条统计 -->
      <el-card class="stats-card">
        <template #header>
          <span class="card-title">链条统计分析</span>
        </template>
        
        <div class="chain-stats">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ chainStats.totalNodes }}</div>
              <div class="stat-label">链条总节点</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon depth">
              <el-icon><Sort /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ chainStats.maxDepth }}</div>
              <div class="stat-label">最大深度</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon commission">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ chainStats.totalCommission.toFixed(2) }}</div>
              <div class="stat-label">链条总佣金</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon active">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ chainStats.activeUsers }}</div>
              <div class="stat-label">活跃用户数</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="exportChain">
          <el-icon><Download /></el-icon>
          导出链条
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ArrowDown, 
  User, 
  Connection, 
  Sort, 
  Money, 
  UserFilled, 
  Download 
} from '@element-plus/icons-vue'

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

const emit = defineEmits(['update:modelValue', 'view-user-chain'])

const visible = ref(false)
const upwardChain = ref([])
const downwardChain = ref([])

// 计算属性
const chainStats = computed(() => {
  const totalNodes = upwardChain.value.length + 1 + downwardChain.value.length
  const maxDepth = Math.max(upwardChain.value.length, downwardChain.value.length)
  const totalCommission = [...upwardChain.value, props.user, ...downwardChain.value]
    .reduce((sum, node) => sum + (node?.totalCommission || 0), 0)
  const activeUsers = [...upwardChain.value, props.user, ...downwardChain.value]
    .filter(node => node?.status === 'active').length
  
  return {
    totalNodes,
    maxDepth,
    totalCommission,
    activeUsers
  }
})

// 监听显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.user) {
    loadReferralChain()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const handleClose = () => {
  visible.value = false
}

const loadReferralChain = () => {
  if (!props.user) return
  
  // 模拟向上追溯链条
  upwardChain.value = [
    {
      id: 0,
      name: 'Top Referrer',
      email: 'top@example.com',
      inviteCode: 'TOP001',
      totalCommission: 15280.50,
      directReferrals: 8,
      status: 'active'
    },
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      inviteCode: 'JS001',
      totalCommission: 5280.50,
      directReferrals: 3,
      status: 'active'
    }
  ]
  
  // 模拟向下展开链条
  downwardChain.value = [
    {
      id: 2,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      inviteCode: 'AJ002',
      totalCommission: 2150.75,
      directReferrals: 2,
      status: 'active'
    },
    {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      inviteCode: 'BW003',
      totalCommission: 1280.25,
      directReferrals: 1,
      status: 'active'
    }
  ]
}

const getChainLevel = (user) => {
  return upwardChain.value.length
}

const viewUserChain = (user) => {
  emit('view-user-chain', user)
  handleClose()
}

const exportChain = () => {
  ElMessage.success('导出链条功能开发中...')
}
</script>

<style scoped>
.referral-chain {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chain-header {
  text-align: center;
  margin-bottom: 20px;
}

.chain-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.chain-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.chain-card,
.current-user-card,
.stats-card {
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

/* 链条容器 */
.chain-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.chain-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

/* 节点卡片 */
.node-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  width: 100%;
  transition: all 0.3s ease;
}

.node-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.node-card.level-0 {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
}

.node-card.level-1 {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffe6 100%);
}

.node-card.level-2 {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fffbf0 0%, #fff7e6 100%);
}

/* 节点头像 */
.node-avatar {
  position: relative;
  flex-shrink: 0;
}

.level-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #409eff;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* 当前用户特殊样式 */
.current-user {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.user-card.highlighted {
  border: 3px solid #409eff;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
}

.current-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 连接箭头 */
.chain-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #409eff;
  margin: 8px 0;
}

.arrow-label {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

/* 节点信息 */
.node-info {
  flex: 1;
  min-width: 0;
}

.node-name,
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.node-email,
.user-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.node-code,
.user-code {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.user-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 统计信息 */
.node-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: block;
}

.stat-label {
  font-size: 10px;
  color: #909399;
  margin-top: 2px;
}

/* 空状态 */
.empty-chain {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.empty-chain p {
  margin: 12px 0 0 0;
}

/* 链条统计 */
.chain-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.chain-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.depth {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.commission {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.chain-stats .stat-info {
  flex: 1;
}

.chain-stats .stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.chain-stats .stat-label {
  font-size: 12px;
  color: #606266;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chain-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .node-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
