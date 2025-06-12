<template>
  <PlaceholderPage
    title="采购申请"
    description="管理您的商品采购申请和审批状态"
    :action-buttons="[
      { text: '创建申请', type: 'primary', action: createApplication },
      { text: '批量申请', type: 'success', action: batchApply },
      { text: '查看历史', type: 'default', action: viewHistory }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const createApplication = () => {
  router.push('/merchant/purchase/create')
}

const batchApply = () => {
  console.log('批量申请')
}

const viewHistory = () => {
  console.log('查看历史记录')
}
</script> 