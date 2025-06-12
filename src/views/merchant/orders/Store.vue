<template>
  <PlaceholderPage 
    title="店铺订单"
    :details="[
      '显示所有店铺订单列表',
      '支持按状态、时间范围筛选',
      '订单详情查看和状态管理',
      '批量操作和导出功能'
    ]"
    show-actions
  >
    <template #actions>
      <el-button type="primary">导出订单</el-button>
    </template>
  </PlaceholderPage>
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'
</script> 