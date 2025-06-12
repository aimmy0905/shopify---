<template>
  <div class="notification-list">
    <div v-if="notifications.length === 0" class="empty-state">
      <el-empty description="暂无通知" />
    </div>
    <div v-else class="notification-items">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-header">
          <div class="notification-type">
            <el-icon class="type-icon" :class="getTypeClass(notification.type)">
              <component :is="getTypeIcon(notification.type)" />
            </el-icon>
            <span class="type-text">{{ getTypeText(notification.type) }}</span>
          </div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
        <div class="notification-content">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <p class="notification-body">{{ notification.content }}</p>
        </div>
        <div class="notification-actions">
          <el-button 
            v-if="!notification.read" 
            type="primary" 
            size="small" 
            text
            @click.stop="markAsRead(notification)"
          >
            标记已读
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            text
            @click.stop="deleteNotification(notification)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 批量操作 -->
    <div v-if="notifications.length > 0" class="notification-footer">
      <el-button 
        type="primary" 
        size="small" 
        @click="markAllAsRead"
        :disabled="!hasUnreadNotifications"
      >
        全部标记已读
      </el-button>
      <el-button 
        type="danger" 
        size="small" 
        @click="clearAllNotifications"
      >
        清空通知
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  ShoppingCart,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:notifications', 'notification-click'])

// 未读通知数量
const hasUnreadNotifications = computed(() => {
  return props.notifications.some(n => !n.read)
})

// 获取通知类型图标
const getTypeIcon = (type) => {
  const iconMap = {
    system: Bell,
    order: ShoppingCart,
    warning: Warning,
    info: InfoFilled
  }
  return iconMap[type] || Bell
}

// 获取通知类型样式类
const getTypeClass = (type) => {
  const classMap = {
    system: 'system-icon',
    order: 'order-icon',
    warning: 'warning-icon',
    info: 'info-icon'
  }
  return classMap[type] || 'system-icon'
}

// 获取通知类型文本
const getTypeText = (type) => {
  const textMap = {
    system: '系统',
    order: '订单',
    warning: '警告',
    info: '信息'
  }
  return textMap[type] || '系统'
}

// 点击通知
const handleNotificationClick = (notification) => {
  // 自动标记为已读
  if (!notification.read) {
    markAsRead(notification)
  }
  
  emit('notification-click', notification)
}

// 标记单个通知为已读
const markAsRead = (notification) => {
  const updatedNotifications = props.notifications.map(n => 
    n.id === notification.id ? { ...n, read: true } : n
  )
  emit('update:notifications', updatedNotifications)
  ElMessage.success('标记为已读')
}

// 标记全部为已读
const markAllAsRead = () => {
  const updatedNotifications = props.notifications.map(n => ({ ...n, read: true }))
  emit('update:notifications', updatedNotifications)
  ElMessage.success('全部标记为已读')
}

// 删除单个通知
const deleteNotification = async (notification) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const updatedNotifications = props.notifications.filter(n => n.id !== notification.id)
    emit('update:notifications', updatedNotifications)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 清空所有通知
const clearAllNotifications = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有通知吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    emit('update:notifications', [])
    ElMessage.success('清空成功')
  } catch {
    // 用户取消清空
  }
}
</script>

<style lang="scss" scoped>
.notification-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-items {
  flex: 1;
  overflow-y: auto;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background-color: #f8f9fa;
  }

  &.unread {
    background-color: #f0f7ff;
    border-left: 3px solid #3b82f6;

    &::before {
      content: '';
      position: absolute;
      top: 16px;
      right: 16px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .notification-type {
    display: flex;
    align-items: center;
    gap: 6px;

    .type-icon {
      font-size: 14px;

      &.system-icon {
        color: #3b82f6;
      }

      &.order-icon {
        color: #10b981;
      }

      &.warning-icon {
        color: #f59e0b;
      }

      &.info-icon {
        color: #6b7280;
      }
    }

    .type-text {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }
  }

  .notification-time {
    font-size: 12px;
    color: #9ca3af;
  }
}

.notification-content {
  margin-bottom: 12px;

  .notification-title {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin: 0 0 4px 0;
    line-height: 1.4;
  }

  .notification-body {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
  }
}

.notification-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s ease;

  .notification-item:hover & {
    opacity: 1;
  }

  .el-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.notification-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  justify-content: center;
  background: #fafafa;

  .el-button {
    flex: 1;
  }
}

// 滚动条样式
.notification-items::-webkit-scrollbar {
  width: 4px;
}

.notification-items::-webkit-scrollbar-track {
  background: transparent;
}

.notification-items::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.notification-items::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style> 