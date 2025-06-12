<template>
  <PlaceholderPage
    title="采购订单"
    description="管理系统中的采购订单和供应商发货"
    :action-buttons="[
      { text: '批量审核', type: 'primary', action: batchReview },
      { text: '发货管理', type: 'success', action: shipmentManage },
      { text: '采购报表', type: 'default', action: purchaseReport }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const batchReview = () => {
  console.log('批量审核')
}

const shipmentManage = () => {
  console.log('发货管理')
}

const purchaseReport = () => {
  console.log('采购报表')
}
</script> 