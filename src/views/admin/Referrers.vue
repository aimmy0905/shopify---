<template>
  <PlaceholderPage
    title="推荐人管理"
    description="管理推荐人和邀请关系链"
    :action-buttons="[
      { text: '查看推荐关系', type: 'primary', action: viewRelations },
      { text: '推荐统计', type: 'success', action: referralStats },
      { text: '佣金结算', type: 'default', action: commissionSettlement }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const viewRelations = () => {
  console.log('查看推荐关系')
}

const referralStats = () => {
  console.log('推荐统计')
}

const commissionSettlement = () => {
  router.push('/admin/commission-settlements')
}
</script> 