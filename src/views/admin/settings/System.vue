<template>
  <PlaceholderPage
    title="系统参数"
    description="配置系统的基础参数和运行设置"
    :action-buttons="[
      { text: '保存设置', type: 'primary', action: saveSettings },
      { text: '恢复默认', type: 'warning', action: resetDefault },
      { text: '语言设置', type: 'default', action: languageSettings }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const saveSettings = () => {
  console.log('保存设置')
}

const resetDefault = () => {
  console.log('恢复默认')
}

const languageSettings = () => {
  router.push('/admin/settings/language')
}
</script> 