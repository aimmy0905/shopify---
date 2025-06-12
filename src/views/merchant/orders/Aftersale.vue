<template>
  <PlaceholderPage
    title="售后订单"
    description="处理退货、退款和客户售后服务"
    :action-buttons="[
      { text: '处理退款', type: 'primary', action: handleRefund },
      { text: '处理退货', type: 'warning', action: handleReturn },
      { text: '返回订单管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const handleRefund = () => {
  console.log('处理退款')
}

const handleReturn = () => {
  console.log('处理退货')
}

const goBack = () => {
  router.push('/merchant/orders')
}
</script> 