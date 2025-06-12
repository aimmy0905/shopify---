<template>
  <PlaceholderPage
    title="商品排行"
    description="查看商品销量排行和数据分析"
    :action-buttons="[
      { text: '销量排行', type: 'primary', action: salesRanking },
      { text: '利润排行', type: 'success', action: profitRanking },
      { text: '返回商品管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const salesRanking = () => {
  console.log('销量排行')
}

const profitRanking = () => {
  console.log('利润排行')
}

const goBack = () => {
  router.push('/admin/products')
}
</script> 