<template>
  <PlaceholderPage
    title="商品分类"
    description="管理系统中的商品分类和层级结构"
    :action-buttons="[
      { text: '添加分类', type: 'primary', action: addCategory },
      { text: '批量管理', type: 'success', action: batchManage },
      { text: '返回商品管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const addCategory = () => {
  console.log('添加分类')
}

const batchManage = () => {
  console.log('批量管理')
}

const goBack = () => {
  router.push('/admin/products')
}
</script> 