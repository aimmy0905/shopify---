<template>
  <div class="error-page">
    <ErrorRecovery 
      :title="title" 
      :message="message"
      :code="code"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import ErrorRecovery from '@/components/common/ErrorRecovery.vue';

const props = defineProps({
  title: {
    type: String,
    default: '页面加载错误'
  },
  message: {
    type: String,
    default: '加载页面时发生错误，请尝试刷新或清除缓存'
  },
  code: {
    type: String,
    default: 'ERR_CHUNK_LOAD'
  }
});
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style> 