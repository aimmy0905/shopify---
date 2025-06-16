<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="400px"
    :before-close="handleClose"
    append-to-body
  >
    <div class="confirm-content">
      <el-icon class="warning-icon" v-if="type === 'warning'"><WarningFilled /></el-icon>
      <el-icon class="danger-icon" v-else-if="type === 'danger'"><CircleCloseFilled /></el-icon>
      <el-icon class="info-icon" v-else><InfoFilled /></el-icon>
      <div class="message">{{ message }}</div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ cancelText }}</el-button>
        <el-button :type="confirmButtonType" @click="confirm" :loading="loading">
          {{ confirmText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { WarningFilled, CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warning', 'danger'].includes(value)
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const dialogVisible = ref(props.visible)

const confirmButtonType = computed(() => {
  switch (props.type) {
    case 'warning':
      return 'warning'
    case 'danger':
      return 'danger'
    default:
      return 'primary'
  }
})

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleClose = () => {
  cancel()
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
}

.warning-icon {
  color: #e6a23c;
  font-size: 24px;
  margin-right: 12px;
}

.danger-icon {
  color: #f56c6c;
  font-size: 24px;
  margin-right: 12px;
}

.info-icon {
  color: #409eff;
  font-size: 24px;
  margin-right: 12px;
}

.message {
  font-size: 14px;
  line-height: 1.5;
}
</style> 