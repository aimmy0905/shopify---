<template>
  <PlaceholderPage
    title="店铺订单"
    description="管理来自各个店铺的订单信息"
    :action-buttons="[
      { text: '批量处理', type: 'primary', action: batchProcess },
      { text: '导出订单', type: 'success', action: exportOrders },
      { text: '订单统计', type: 'default', action: orderStats }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const batchProcess = () => {
  console.log('批量处理订单')
}

const exportOrders = () => {
  console.log('导出订单')
}

const orderStats = () => {
  console.log('订单统计')
}
</script> 