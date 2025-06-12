<template>
  <PlaceholderPage
    title="供应商管理"
    description="管理系统中的供应商信息和合作关系"
    :action-buttons="[
      { text: '添加供应商', type: 'primary', action: addSupplier },
      { text: '批量操作', type: 'success', action: batchOperation },
      { text: '导出数据', type: 'default', action: exportData }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const addSupplier = () => {
  console.log('添加供应商')
}

const batchOperation = () => {
  console.log('批量操作')
}

const exportData = () => {
  console.log('导出数据')
}
</script> 