<template>
  <PlaceholderPage
    title="商品详情"
    description="查看商品的详细信息、价格和库存状态"
    :action-buttons="[
      { text: '编辑商品', type: 'primary', action: handleEdit },
      { text: '更新价格', type: 'warning', action: updatePrice },
      { text: '返回商品列表', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const handleEdit = () => {
  console.log('编辑商品')
}

const updatePrice = () => {
  console.log('更新价格')
}

const goBack = () => {
  router.push('/merchant/products')
}
</script> 