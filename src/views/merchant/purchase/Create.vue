<template>
  <PlaceholderPage
    title="创建采购申请"
    description="填写商品信息，向供应商提交采购申请"
    :action-buttons="[
      { text: '提交申请', type: 'primary', action: submitApplication },
      { text: '保存草稿', type: 'success', action: saveDraft },
      { text: '返回申请列表', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const submitApplication = () => {
  console.log('提交采购申请')
}

const saveDraft = () => {
  console.log('保存草稿')
}

const goBack = () => {
  router.push('/merchant/purchase/applications')
}
</script> 