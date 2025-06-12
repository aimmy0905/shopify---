<template>
  <PlaceholderPage
    title="充值审核"
    description="审核客户提交的充值申请和凭证"
    :action-buttons="[
      { text: '批量审核', type: 'primary', action: batchAudit },
      { text: '快速通过', type: 'success', action: quickApprove },
      { text: '拒绝申请', type: 'danger', action: rejectApplication }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const batchAudit = () => {
  console.log('批量审核')
}

const quickApprove = () => {
  console.log('快速通过')
}

const rejectApplication = () => {
  console.log('拒绝申请')
}
</script> 