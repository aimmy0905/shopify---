<template>
  <div class="placeholder-page">
    <div class="page-header" v-if="title">
      <h1>{{ title }}</h1>
      <div class="header-actions" v-if="showActions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="content-placeholder">
      <el-empty :description="description || '页面开发中，敬请期待！'" />
      <div v-if="details" class="details">
        <p v-for="detail in details" :key="detail">{{ detail }}</p>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: '页面开发中，敬请期待！'
  },
  details: {
    type: Array,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.placeholder-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .content-placeholder {
    background: white;
    border-radius: 8px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

    .details {
      margin-top: 16px;

      p {
        margin: 8px 0;
        color: #6b7280;
        font-size: 14px;
      }
    }
  }
}
</style> 