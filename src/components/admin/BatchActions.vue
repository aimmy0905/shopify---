<template>
  <div class="batch-actions" v-if="selectedCount">
    <div class="selected-count">
      已选择 <span class="count">{{ selectedCount }}</span> 项
    </div>
    <div class="actions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedCount: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.batch-actions {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: #f0f9ff;
  border: 1px solid #a0cfff;
  border-radius: 4px;
  margin-bottom: 16px;
}

.selected-count {
  margin-right: 16px;
  font-size: 14px;
}

.count {
  font-weight: bold;
  color: #409eff;
}

.actions {
  display: flex;
  gap: 8px;
}
</style> 