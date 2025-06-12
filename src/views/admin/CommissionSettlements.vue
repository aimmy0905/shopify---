<template>
  <PlaceholderPage
    title="佣金结算"
    description="管理推荐佣金的计算和结算"
    :action-buttons="[
      { text: '执行结算', type: 'primary', action: executeSettlement },
      { text: '结算历史', type: 'success', action: settlementHistory },
      { text: '返回推荐人管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const executeSettlement = () => {
  console.log('执行结算')
}

const settlementHistory = () => {
  console.log('结算历史')
}

const goBack = () => {
  router.push('/admin/referrers')
}
</script> 