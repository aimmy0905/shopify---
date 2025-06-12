<template>
  <PlaceholderPage
    title="采购申请管理"
    description="审核和管理商家提交的采购申请"
    :action-buttons="[
      { text: '批量审核', type: 'primary', action: batchReview },
      { text: '快速审批', type: 'success', action: quickApproval },
      { text: '申请统计', type: 'default', action: applicationStats }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const batchReview = () => {
  console.log('批量审核')
}

const quickApproval = () => {
  console.log('快速审批')
}

const applicationStats = () => {
  console.log('申请统计')
}
</script> 