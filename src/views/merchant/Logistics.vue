<template>
  <PlaceholderPage
    title="物流查询"
    description="查询您的订单物流信息和配送状态"
    :action-buttons="[
      { text: '批量查询', type: 'primary', action: batchQuery },
      { text: '导出物流信息', type: 'success', action: exportData },
      { text: '设置物流提醒', type: 'default', action: setNotification }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const batchQuery = () => {
  console.log('批量查询物流')
}

const exportData = () => {
  console.log('导出物流信息')
}

const setNotification = () => {
  console.log('设置物流提醒')
}
</script> 