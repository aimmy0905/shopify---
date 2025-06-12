<template>
  <PlaceholderPage
    title="商品管理"
    description="管理系统中的所有商品信息和状态"
    :action-buttons="[
      { text: '添加商品', type: 'primary', action: addProduct },
      { text: '批量操作', type: 'success', action: batchOperation },
      { text: '商品排行', type: 'default', action: viewRanking }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const addProduct = () => {
  console.log('添加商品')
}

const batchOperation = () => {
  console.log('批量操作')
}

const viewRanking = () => {
  router.push('/admin/product-ranking')
}
</script> 