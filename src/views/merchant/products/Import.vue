<template>
  <PlaceholderPage
    title="导入商品"
    description="从供应商批量导入商品到您的店铺"
    :action-buttons="[
      { text: '批量导入', type: 'primary', action: handleImport },
      { text: '查看导入记录', type: 'default', action: viewHistory },
      { text: '返回商品管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const handleImport = () => {
  console.log('批量导入商品')
}

const viewHistory = () => {
  console.log('查看导入记录')
}

const goBack = () => {
  router.push('/merchant/products')
}
</script> 