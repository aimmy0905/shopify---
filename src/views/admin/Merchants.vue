<template>
  <PlaceholderPage
    title="商家管理"
    description="管理平台上的商家账户和店铺信息"
    :action-buttons="[
      { text: '审核商家', type: 'primary', action: reviewMerchants },
      { text: '查看统计', type: 'success', action: viewStats },
      { text: '导出商家信息', type: 'default', action: exportData }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const reviewMerchants = () => {
  console.log('审核商家')
}

const viewStats = () => {
  console.log('查看统计')
}

const exportData = () => {
  console.log('导出商家信息')
}
</script> 