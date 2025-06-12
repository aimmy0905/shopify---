<template>
  <PlaceholderPage
    title="发货记录"
    description="查看和管理所有的发货记录和物流信息"
    :action-buttons="[
      { text: '批量查询', type: 'primary', action: batchQuery },
      { text: '导出记录', type: 'success', action: exportRecords },
      { text: '物流统计', type: 'default', action: logisticsStats }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const batchQuery = () => {
  console.log('批量查询')
}

const exportRecords = () => {
  console.log('导出记录')
}

const logisticsStats = () => {
  console.log('物流统计')
}
</script> 