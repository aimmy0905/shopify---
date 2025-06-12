<template>
  <PlaceholderPage
    title="订单详情"
    description="查看订单的详细信息、状态和物流信息"
    :action-buttons="[
      { text: '更新状态', type: 'primary', action: updateStatus },
      { text: '联系客户', type: 'success', action: contactCustomer },
      { text: '返回订单列表', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const updateStatus = () => {
  console.log('更新订单状态')
}

const contactCustomer = () => {
  console.log('联系客户')
}

const goBack = () => {
  router.push('/merchant/orders')
}
</script> 