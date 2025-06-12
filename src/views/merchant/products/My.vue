<template>
  <PlaceholderPage
    title="我的商品"
    description="管理您已导入到店铺的商品"
    :action-buttons="[
      { text: '批量编辑', type: 'primary', action: handleBatchEdit },
      { text: '导入新商品', type: 'success', action: importProducts },
      { text: '返回商品管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const handleBatchEdit = () => {
  console.log('批量编辑商品')
}

const importProducts = () => {
  router.push('/merchant/products/import')
}

const goBack = () => {
  router.push('/merchant/products')
}
</script> 