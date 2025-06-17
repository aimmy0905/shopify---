<template>
  <div class="tree-node" :class="`level-${level}`">
    <!-- 节点内容 -->
    <div class="node-content" @click="handleNodeClick">
      <div class="node-card">
        <!-- 用户头像 -->
        <div class="user-avatar">
          <el-avatar :size="40" :src="node.avatar">
            {{ node.name?.charAt(0) }}
          </el-avatar>
          <div class="level-badge">L{{ level }}</div>
        </div>
        
        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-name">{{ node.name }}</div>
          <div class="user-email">{{ node.email }}</div>
          <div class="invite-code">{{ node.inviteCode }}</div>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats-info">
          <div class="stat-item">
            <span class="stat-label">下级:</span>
            <span class="stat-value">{{ node.directReferrals }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">佣金:</span>
            <span class="stat-value commission">${{ node.totalCommission.toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">本月:</span>
            <span class="stat-value monthly">${{ node.monthlyCommission.toFixed(2) }}</span>
          </div>
        </div>
        
        <!-- 状态和操作 -->
        <div class="node-actions">
          <el-tag :type="node.status === 'active' ? 'success' : 'danger'" size="small">
            {{ node.status === 'active' ? '活跃' : '非活跃' }}
          </el-tag>
          <div class="action-buttons">
            <el-button size="small" type="primary" @click.stop="showCommission">
              <el-icon><Money /></el-icon>
            </el-button>
            <el-button size="small" @click.stop="showDetail">
              <el-icon><View /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 连接线 -->
      <div v-if="node.children && node.children.length > 0" class="connection-line"></div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="node.children && node.children.length > 0" class="children-container">
      <div class="children-wrapper">
        <tree-node
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          @node-click="$emit('node-click', $event)"
          @show-commission="$emit('show-commission', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Money, View } from '@element-plus/icons-vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['node-click', 'show-commission'])

const handleNodeClick = () => {
  emit('node-click', props.node)
}

const showCommission = () => {
  emit('show-commission', props.node)
}

const showDetail = () => {
  emit('node-click', props.node)
}
</script>

<style scoped>
.tree-node {
  position: relative;
  margin: 10px 0;
}

.node-content {
  position: relative;
  cursor: pointer;
}

.node-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  min-width: 400px;
  max-width: 500px;
}

.node-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 不同层级的边框颜色 */
.level-0 .node-card {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
}

.level-1 .node-card {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffe6 100%);
}

.level-2 .node-card {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fffbf0 0%, #fff7e6 100%);
}

.level-3 .node-card {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

/* 用户头像区域 */
.user-avatar {
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

.level-1 .level-badge {
  background: #67c23a;
}

.level-2 .level-badge {
  background: #e6a23c;
}

.level-3 .level-badge {
  background: #f56c6c;
}

/* 用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.invite-code {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

/* 统计信息 */
.stats-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stat-label {
  color: #909399;
}

.stat-value {
  font-weight: 600;
  color: #303133;
}

.stat-value.commission {
  color: #67c23a;
}

.stat-value.monthly {
  color: #409eff;
}

/* 节点操作 */
.node-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* 连接线 */
.connection-line {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 20px;
  background: #dcdfe6;
}

/* 子节点容器 */
.children-container {
  margin-top: 20px;
  position: relative;
}

.children-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  height: 2px;
  background: #dcdfe6;
}

.children-wrapper {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  padding-top: 20px;
}

.children-wrapper > .tree-node {
  position: relative;
}

.children-wrapper > .tree-node::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 20px;
  background: #dcdfe6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .node-card {
    flex-direction: column;
    text-align: center;
    min-width: 280px;
    max-width: 320px;
  }
  
  .stats-info {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }
  
  .children-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
}

/* 动画效果 */
.tree-node {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停效果 */
.node-card:hover .user-name {
  color: #409eff;
}

.node-card:hover .level-badge {
  transform: scale(1.1);
}
</style>
