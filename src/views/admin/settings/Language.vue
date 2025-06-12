<template>
  <PlaceholderPage
    title="语言设置"
    description="管理系统的多语言支持和翻译内容"
    :action-buttons="[
      { text: '添加语言', type: 'primary', action: addLanguage },
      { text: '翻译管理', type: 'success', action: manageTranslations },
      { text: '返回系统设置', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const addLanguage = () => {
  console.log('添加语言')
}

const manageTranslations = () => {
  console.log('翻译管理')
}

const goBack = () => {
  router.push('/admin/settings/system')
}
</script> 