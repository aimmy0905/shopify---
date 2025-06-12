<template>
  <PlaceholderPage
    title="采购申请详情"
    description="查看采购申请的详细信息和处理状态"
    :action-buttons="[
      { text: '修改申请', type: 'primary', action: editApplication },
      { text: '取消申请', type: 'danger', action: cancelApplication },
      { text: '返回申请列表', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const editApplication = () => {
  console.log('修改采购申请')
}

const cancelApplication = () => {
  console.log('取消申请')
}

const goBack = () => {
  router.push('/merchant/purchase/applications')
}
</script> 