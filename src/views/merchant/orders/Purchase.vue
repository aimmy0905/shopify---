<template>
  <PlaceholderPage
    title="采购订单"
    description="管理您的商品采购订单和发货状态"
    :action-buttons="[
      { text: '创建采购订单', type: 'primary', action: createOrder },
      { text: '批量处理', type: 'success', action: batchProcess },
      { text: '返回订单管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const createOrder = () => {
  console.log('创建采购订单')
}

const batchProcess = () => {
  console.log('批量处理')
}

const goBack = () => {
  router.push('/merchant/orders')
}
</script> 